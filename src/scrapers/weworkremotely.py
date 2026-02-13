"""WeWorkRemotely scraper using HTML parsing."""

import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional
import re
from .base import BaseScraper, Job


class WeWorkRemotelyScraper(BaseScraper):
    """
    Scraper for WeWorkRemotely.com using HTML parsing.
    
    Categories scraped:
    - Customer Support: /categories/remote-customer-support-jobs
    - All Jobs: /remote-jobs (main listing)
    """
    
    name = "weworkremotely"
    base_url = "https://weworkremotely.com"
    
    # Categories to scrape (focus on "Lazy Girl Jobs" first)
    categories = [
        "/categories/remote-customer-support-jobs",
        "/remote-jobs",  # Main listing
    ]
    
    async def scrape(self) -> list[Job]:
        """Scrape jobs from WeWorkRemotely."""
        jobs = []
        seen_urls = set()
        
        async with httpx.AsyncClient() as client:
            for category_path in self.categories:
                try:
                    url = f"{self.base_url}{category_path}"
                    response = await client.get(
                        url,
                        headers={
                            'User-Agent': 'Mozilla/5.0 (compatible; RemoteJobScraper/1.0)'
                        },
                        timeout=30.0
                    )
                    response.raise_for_status()
                    
                    category_jobs = self._parse_listing(response.text, category_path)
                    
                    for job in category_jobs:
                        if job.url not in seen_urls:
                            # Auto-categorize and detect no-phone
                            job.category = self.categorize(job)
                            job.is_no_phone = self.detect_no_phone(job)
                            jobs.append(job)
                            seen_urls.add(job.url)
                            
                except Exception as e:
                    print(f"Error scraping {category_path}: {e}")
                    continue
        
        self.jobs = jobs
        return jobs
    
    def _parse_listing(self, html: str, category: str) -> list[Job]:
        """Parse job listing page."""
        jobs = []
        soup = BeautifulSoup(html, 'lxml')
        
        # Find job listings - they're in <li> elements with specific structure
        job_items = soup.select('li.feature, li:not(.ad)')
        
        for item in job_items:
            try:
                job = self._parse_job_item(item, category)
                if job:
                    jobs.append(job)
            except Exception as e:
                continue
        
        return jobs
    
    def _parse_job_item(self, item, category: str) -> Optional[Job]:
        """Parse individual job listing item."""
        # Find the job link
        link = item.select_one('a[href*="/remote-jobs/"]')
        if not link:
            return None
        
        href = link.get('href', '')
        if not href or '/remote-jobs/' not in href:
            return None
        
        # Build full URL
        job_url = href if href.startswith('http') else f"{self.base_url}{href}"
        
        # Extract job ID from URL
        source_id = href.split('/')[-1] if href else None
        if not source_id:
            return None
        
        # Get title
        title_elem = item.select_one('.title')
        title = title_elem.get_text(strip=True) if title_elem else None
        if not title:
            # Try alternate selector
            title = link.get_text(strip=True)
        
        if not title:
            return None
        
        # Get company
        company_elem = item.select_one('.company')
        company = company_elem.get_text(strip=True) if company_elem else 'Unknown'
        
        # Get company logo
        logo_elem = item.select_one('img.logo, div.logo img')
        company_logo = logo_elem.get('src') if logo_elem else None
        
        # Get location/region
        region_elem = item.select_one('.region')
        location = region_elem.get_text(strip=True) if region_elem else 'Remote'
        
        # Parse salary if present
        salary_min, salary_max = self._parse_salary(item)
        
        # Extract tags from the listing
        tags = []
        tag_elems = item.select('.tag, .label')
        for tag in tag_elems:
            tags.append(tag.get_text(strip=True))
        
        return Job(
            source=self.name,
            source_id=source_id,
            title=title,
            company=company,
            company_logo=company_logo,
            location=location,
            salary_min=salary_min,
            salary_max=salary_max,
            url=job_url,
            tags=tags,
        )
    
    def _parse_salary(self, item) -> tuple[Optional[int], Optional[int]]:
        """Extract salary range from listing."""
        salary_text = ""
        
        # Look for salary in various places
        for selector in ['.salary', '.compensation', 'span[class*="salary"]']:
            elem = item.select_one(selector)
            if elem:
                salary_text = elem.get_text()
                break
        
        # Also check full text
        if not salary_text:
            full_text = item.get_text()
            # Look for salary patterns
            match = re.search(r'\$[\d,]+\s*[-–]\s*\$[\d,]+', full_text)
            if match:
                salary_text = match.group()
        
        if not salary_text:
            return None, None
        
        # Parse salary range
        numbers = re.findall(r'[\d,]+', salary_text)
        if len(numbers) >= 2:
            try:
                min_sal = int(numbers[0].replace(',', ''))
                max_sal = int(numbers[1].replace(',', ''))
                return min_sal, max_sal
            except:
                pass
        elif len(numbers) == 1:
            try:
                sal = int(numbers[0].replace(',', ''))
                return sal, sal
            except:
                pass
        
        return None, None
