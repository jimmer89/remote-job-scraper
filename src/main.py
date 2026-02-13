#!/usr/bin/env python3
"""
Remote Job Scraper - CLI entrypoint.

Usage:
    python src/main.py scrape          # Run all scrapers
    python src/main.py scrape --source remoteok
    python src/main.py list            # List jobs
    python src/main.py list --category support --no-phone
    python src/main.py stats           # Show statistics
    python src/main.py export          # Export to JSON
"""

import asyncio
import json
import sys
from pathlib import Path
from datetime import datetime

import click
from rich.console import Console
from rich.table import Table
from rich.progress import Progress, SpinnerColumn, TextColumn

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.scrapers import RemoteOKScraper, WeWorkRemotelyScraper, IndeedScraper, RedditScraper
from src.database import JobDatabase

console = Console()

# Available scrapers
SCRAPERS = {
    'remoteok': RemoteOKScraper,
    'weworkremotely': WeWorkRemotelyScraper,
    'indeed': IndeedScraper,
    'reddit': RedditScraper,
}


@click.group()
def cli():
    """Remote Job Scraper - Aggregate remote jobs from multiple sources."""
    pass


@cli.command()
@click.option('--source', '-s', type=click.Choice(list(SCRAPERS.keys())), 
              help='Scrape only this source')
@click.option('--db', default='data/jobs.db', help='Database path')
def scrape(source, db):
    """Run scrapers to fetch new jobs."""
    asyncio.run(_scrape(source, db))


async def _scrape(source: str | None, db_path: str):
    """Async scrape implementation."""
    database = JobDatabase(db_path)
    
    sources_to_scrape = [source] if source else list(SCRAPERS.keys())
    
    total_new = 0
    total_updated = 0
    total_found = 0
    
    for source_name in sources_to_scrape:
        scraper_class = SCRAPERS[source_name]
        scraper = scraper_class()
        
        console.print(f"\n[bold blue]Scraping {source_name}...[/bold blue]")
        
        log_id = database.log_scrape(source_name)
        
        try:
            with Progress(
                SpinnerColumn(),
                TextColumn("[progress.description]{task.description}"),
                console=console,
            ) as progress:
                task = progress.add_task(f"Fetching from {source_name}...", total=None)
                jobs = await scraper.scrape()
                progress.update(task, description=f"Found {len(jobs)} jobs")
            
            new_count = 0
            updated_count = 0
            
            for job in jobs:
                is_new, is_updated = database.upsert_job(job.to_dict())
                if is_new:
                    new_count += 1
                elif is_updated:
                    updated_count += 1
            
            database.finish_scrape(
                log_id, 
                jobs_found=len(jobs),
                jobs_new=new_count,
                jobs_updated=updated_count
            )
            
            console.print(f"  [green]✓[/green] Found: {len(jobs)}, New: {new_count}, Updated: {updated_count}")
            
            total_found += len(jobs)
            total_new += new_count
            total_updated += updated_count
            
        except Exception as e:
            database.finish_scrape(log_id, 0, 0, 0, status='error', error=str(e))
            console.print(f"  [red]✗[/red] Error: {e}")
    
    console.print(f"\n[bold green]Done![/bold green] Total: {total_found} jobs, {total_new} new, {total_updated} updated")
    database.close()


@cli.command('list')
@click.option('--category', '-c', help='Filter by category (support, dev, etc.)')
@click.option('--source', '-s', help='Filter by source')
@click.option('--no-phone', is_flag=True, help='Only no-phone jobs')
@click.option('--has-salary', is_flag=True, help='Only jobs with salary info')
@click.option('--limit', '-l', default=20, help='Number of results')
@click.option('--db', default='data/jobs.db', help='Database path')
def list_jobs(category, source, no_phone, has_salary, limit, db):
    """List jobs from database."""
    database = JobDatabase(db)
    
    jobs = database.get_jobs(
        category=category,
        source=source,
        no_phone_only=no_phone,
        has_salary=has_salary,
        limit=limit
    )
    
    if not jobs:
        console.print("[yellow]No jobs found matching criteria.[/yellow]")
        return
    
    table = Table(title=f"Remote Jobs ({len(jobs)} results)")
    table.add_column("Title", style="cyan", max_width=40)
    table.add_column("Company", style="green", max_width=20)
    table.add_column("Category", style="magenta")
    table.add_column("Salary", style="yellow")
    table.add_column("No📞", style="blue")
    table.add_column("Source")
    
    for job in jobs:
        salary = ""
        if job['salary_min']:
            if job['salary_max'] and job['salary_max'] != job['salary_min']:
                salary = f"${job['salary_min']:,}-${job['salary_max']:,}"
            else:
                salary = f"${job['salary_min']:,}"
        
        no_phone = "✓" if job['is_no_phone'] else ""
        
        table.add_row(
            job['title'][:40],
            (job['company'] or 'Unknown')[:20],
            job['category'] or '-',
            salary,
            no_phone,
            job['source']
        )
    
    console.print(table)
    database.close()


@cli.command()
@click.option('--db', default='data/jobs.db', help='Database path')
def stats(db):
    """Show database statistics."""
    database = JobDatabase(db)
    stats = database.get_stats()
    
    console.print("\n[bold]📊 Database Statistics[/bold]\n")
    
    console.print(f"Total active jobs: [bold green]{stats['total_jobs']}[/bold green]")
    console.print(f"No-phone jobs: [bold blue]{stats['no_phone_jobs']}[/bold blue]")
    console.print(f"Jobs with salary: [bold yellow]{stats['with_salary']}[/bold yellow]")
    
    console.print("\n[bold]By Source:[/bold]")
    for source, count in stats['by_source'].items():
        console.print(f"  {source}: {count}")
    
    console.print("\n[bold]By Category:[/bold]")
    for cat, count in list(stats['by_category'].items())[:10]:
        console.print(f"  {cat or 'other'}: {count}")
    
    console.print("\n[bold]Last Scrape:[/bold]")
    for source, last in stats['last_scrape'].items():
        console.print(f"  {source}: {last}")
    
    database.close()


@cli.command()
@click.option('--query', '-q', required=True, help='Search query')
@click.option('--limit', '-l', default=20, help='Number of results')
@click.option('--db', default='data/jobs.db', help='Database path')
def search(query, limit, db):
    """Search jobs by keyword."""
    database = JobDatabase(db)
    jobs = database.search_jobs(query, limit=limit)
    
    if not jobs:
        console.print(f"[yellow]No jobs found for '{query}'[/yellow]")
        return
    
    console.print(f"\n[bold]Search results for '{query}' ({len(jobs)} found):[/bold]\n")
    
    for job in jobs:
        console.print(f"[cyan]{job['title']}[/cyan] at [green]{job['company']}[/green]")
        console.print(f"  Category: {job['category']} | Source: {job['source']}")
        console.print(f"  URL: {job['url']}")
        console.print()
    
    database.close()


@cli.command()
@click.option('--format', '-f', type=click.Choice(['json', 'csv']), default='json')
@click.option('--output', '-o', default='data/export.json', help='Output file')
@click.option('--category', '-c', help='Filter by category')
@click.option('--no-phone', is_flag=True, help='Only no-phone jobs')
@click.option('--db', default='data/jobs.db', help='Database path')
def export(format, output, category, no_phone, db):
    """Export jobs to file."""
    database = JobDatabase(db)
    
    jobs = database.get_jobs(
        category=category,
        no_phone_only=no_phone,
        limit=10000  # Get all
    )
    
    output_path = Path(output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    if format == 'json':
        # Parse tags JSON string back to list
        for job in jobs:
            if job.get('tags') and isinstance(job['tags'], str):
                try:
                    job['tags'] = json.loads(job['tags'])
                except:
                    job['tags'] = []
        
        with open(output_path, 'w') as f:
            json.dump(jobs, f, indent=2, default=str)
    
    elif format == 'csv':
        import csv
        with open(output_path, 'w', newline='') as f:
            if jobs:
                writer = csv.DictWriter(f, fieldnames=jobs[0].keys())
                writer.writeheader()
                writer.writerows(jobs)
    
    console.print(f"[green]✓[/green] Exported {len(jobs)} jobs to {output_path}")
    database.close()


if __name__ == '__main__':
    cli()
