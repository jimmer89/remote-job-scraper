"""
JobSpy-based scraper for Indeed, LinkedIn, ZipRecruiter, and Glassdoor.

Uses the python-jobspy library which handles anti-scraping measures.
https://github.com/speedyapply/JobSpy
"""

from datetime import datetime
from typing import Optional
import hashlib
from .base import BaseScraper, Job

try:
    from jobspy import scrape_jobs
    JOBSPY_AVAILABLE = True
except ImportError:
    JOBSPY_AVAILABLE = False


class JobSpyScraper(BaseScraper):
    """
    Multi-source scraper using JobSpy library.
    
    Supports: Indeed, LinkedIn, ZipRecruiter, Glassdoor, Google Jobs
    """
    
    name = "jobspy"
    
    # Search queries focused on "Lazy Girl Jobs"
    searches = [
        "remote customer support",
        "remote chat support",
        "remote data entry",
        "remote virtual assistant",
        "remote content moderator",
    ]
    
    # Sites to scrape
    sites = ["indeed", "zip_recruiter", "glassdoor"]  # LinkedIn requires login
    
    async def scrape(self) -> list[Job]:
        """Scrape jobs using JobSpy."""
        if not JOBSPY_AVAILABLE:
            print("JobSpy not installed. Run: pip install python-jobspy")
            return []
        
        jobs = []
        seen_ids = set()
        
        for search_query in self.searches:
            try:
                # Use sync function in async context
                import asyncio
                df = await asyncio.to_thread(
                    scrape_jobs,
                    site_name=self.sites,
                    search_term=search_query,
                    location="",  # Empty for remote
                    is_remote=True,
                    results_wanted=25,  # Per site per search
                    hours_old=168,  # Last 7 days
                    country_indeed='USA',
                )
                
                for _, row in df.iterrows():
                    job = self._parse_row(row)
                    if job and job.source_id not in seen_ids:
                        job.category = self.categorize(job)
                        job.is_no_phone = self.detect_no_phone(job)
                        jobs.append(job)
                        seen_ids.add(job.source_id)
                
                # Rate limiting
                import asyncio
                await asyncio.sleep(2)
                
            except Exception as e:
                print(f"Error searching JobSpy for '{search_query}': {e}")
                continue
        
        self.jobs = jobs
        return jobs
    
    def _parse_row(self, row) -> Optional[Job]:
        """Parse DataFrame row into Job object."""
        try:
            title = str(row.get('title', ''))
            if not title or title == 'nan':
                return None
            
            company = str(row.get('company', 'Unknown'))
            if company == 'nan':
                company = 'Unknown'
            
            # Generate unique ID
            job_url = str(row.get('job_url', ''))
            source_id = hashlib.md5(f"{title}{company}{job_url}".encode()).hexdigest()[:16]
            
            # Parse salary
            salary_min = None
            salary_max = None
            
            min_amount = row.get('min_amount')
            max_amount = row.get('max_amount')
            interval = str(row.get('interval', '')).lower()
            
            if min_amount and str(min_amount) != 'nan':
                try:
                    salary_min = float(min_amount)
                    # Convert hourly to annual
                    if 'hour' in interval:
                        salary_min = int(salary_min * 40 * 52)
                    else:
                        salary_min = int(salary_min)
                except:
                    pass
            
            if max_amount and str(max_amount) != 'nan':
                try:
                    salary_max = float(max_amount)
                    if 'hour' in interval:
                        salary_max = int(salary_max * 40 * 52)
                    else:
                        salary_max = int(salary_max)
                except:
                    pass
            
            # Get source site
            site = str(row.get('site', 'jobspy'))
            
            # Get description
            description = str(row.get('description', ''))
            if description == 'nan':
                description = None
            else:
                description = description[:3000]
            
            # Get location
            location = str(row.get('location', 'Remote'))
            if location == 'nan':
                location = 'Remote'
            
            # Get posted date
            posted_at = None
            date_posted = row.get('date_posted')
            if date_posted and str(date_posted) != 'nan' and str(date_posted) != 'NaT':
                try:
                    if hasattr(date_posted, 'to_pydatetime'):
                        posted_at = date_posted.to_pydatetime()
                    else:
                        posted_at = datetime.fromisoformat(str(date_posted))
                except:
                    pass
            
            return Job(
                source=f"jobspy_{site}",
                source_id=source_id,
                title=title,
                company=company,
                description=description,
                location=location,
                salary_min=salary_min,
                salary_max=salary_max,
                url=job_url if job_url != 'nan' else '',
                tags=['remote', site],
                posted_at=posted_at,
            )
            
        except Exception as e:
            print(f"Error parsing JobSpy row: {e}")
            return None
