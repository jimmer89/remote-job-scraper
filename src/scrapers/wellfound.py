"""
Wellfound (formerly AngelList Talent) scraper for startup jobs.

Uses their public job listing pages.
"""

import httpx
from bs4 import BeautifulSoup
from datetime import datetime
from typing import Optional
import re
import json
from .base import BaseScraper, Job


class WellfoundScraper(BaseScraper):
    """
    Scraper for Wellfound (AngelList) startup jobs.
    
    Focuses on remote startup positions.
    """
    
    name = "wellfound"
    base_url = "https://wellfound.com"
    
    # Job categories to scrape
    categories = [
        "customer-success",
        "operations",
        "marketing",
        "engineering",
        "design",
        "sales",
        "data-science",
        "product",
    ]
    
    async def scrape(self) -> list[Job]:
        """Scrape jobs from Wellfound."""
        jobs = []
        seen_ids = set()
        
        async with httpx.AsyncClient() as client:
            for category in self.categories:
                try:
                    url = f"{self.base_url}/role/r/{category}?remote=true"
                    
                    response = await client.get(
                        url,
                        headers={
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                            'Accept': 'text/html,application/xhtml+xml',
                        },
                        timeout=30.0,
                        follow_redirects=True
                    )
                    
                    if response.status_code != 200:
                        continue
                    
                    category_jobs = self._parse_listing(response.text, category)
                    
                    for job in category_jobs:
                        if job.source_id not in seen_ids:
                            job.category = self.categorize(job)
                            job.is_no_phone = self.detect_no_phone(job)
                            jobs.append(job)
                            seen_ids.add(job.source_id)
                    
                    # Rate limiting
                    import asyncio
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    print(f"Error scraping Wellfound {category}: {e}")
                    continue
        
        self.jobs = jobs
        return jobs
    
    def _parse_listing(self, html: str, category: str) -> list[Job]:
        """Parse job listing page."""
        jobs = []
        soup = BeautifulSoup(html, 'lxml')
        
        # Try to find job cards
        # Wellfound uses various structures, try multiple selectors
        job_cards = soup.select('[data-test="StartupResult"], .styles_component__2ACXQ, .job-listing, article')
        
        for card in job_cards:
            try:
                job = self._parse_job_card(card, category)
                if job:
                    jobs.append(job)
            except Exception as e:
                continue
        
        # Also try to extract from JSON data in script tags
        scripts = soup.select('script[type="application/json"]')
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict):
                    extracted = self._extract_from_json(data)
                    jobs.extend(extracted)
            except:
                continue
        
        return jobs
    
    def _parse_job_card(self, card, category: str) -> Optional[Job]:
        """Parse individual job card."""
        
        # Find title
        title_elem = card.select_one('h2, .styles_title__xpQzL, [data-test="StartupResult-name"]')
        if not title_elem:
            return None
        title = title_elem.get_text(strip=True)
        
        if not title or len(title) < 3:
            return None
        
        # Find company
        company_elem = card.select_one('.styles_startup__FSwKC, [data-test="startup-name"], .company-name')
        company = company_elem.get_text(strip=True) if company_elem else 'Startup'
        
        # Find link
        link = card.select_one('a[href*="/jobs/"], a[href*="/company/"]')
        job_url = ''
        source_id = ''
        
        if link:
            href = link.get('href', '')
            if not href.startswith('http'):
                job_url = f"{self.base_url}{href}"
            else:
                job_url = href
            
            # Extract ID from URL
            match = re.search(r'/jobs/(\d+)', href)
            if match:
                source_id = match.group(1)
        
        if not source_id:
            import hashlib
            source_id = hashlib.md5(f"{title}{company}".encode()).hexdigest()[:12]
        
        # Find salary if present
        salary_elem = card.select_one('.styles_compensation__xVHZC, .salary, .compensation')
        salary_min, salary_max = None, None
        if salary_elem:
            salary_text = salary_elem.get_text()
            salary_min, salary_max = self._parse_salary(salary_text)
        
        # Find location
        location_elem = card.select_one('.styles_location__mHuXP, .location')
        location = location_elem.get_text(strip=True) if location_elem else 'Remote'
        
        return Job(
            source=self.name,
            source_id=source_id,
            title=title,
            company=company,
            location=location,
            salary_min=salary_min,
            salary_max=salary_max,
            url=job_url,
            tags=['startup', 'remote', category],
        )
    
    def _extract_from_json(self, data: dict) -> list[Job]:
        """Extract jobs from JSON data structure."""
        jobs = []
        
        # Try to find job listings in various JSON structures
        def find_jobs(obj, depth=0):
            if depth > 5:
                return
            
            if isinstance(obj, dict):
                # Check if this looks like a job
                if 'title' in obj and 'company' in obj:
                    job = self._json_to_job(obj)
                    if job:
                        jobs.append(job)
                
                for value in obj.values():
                    find_jobs(value, depth + 1)
                    
            elif isinstance(obj, list):
                for item in obj:
                    find_jobs(item, depth + 1)
        
        find_jobs(data)
        return jobs
    
    def _json_to_job(self, data: dict) -> Optional[Job]:
        """Convert JSON object to Job."""
        try:
            title = data.get('title', data.get('name', ''))
            if not title:
                return None
            
            company = data.get('company', {})
            if isinstance(company, dict):
                company = company.get('name', 'Startup')
            
            return Job(
                source=self.name,
                source_id=str(data.get('id', hash(title)))[:16],
                title=title,
                company=company,
                location='Remote',
                url=data.get('url', ''),
                tags=['startup', 'remote'],
            )
        except:
            return None
    
    def _parse_salary(self, text: str) -> tuple[Optional[int], Optional[int]]:
        """Parse salary from text."""
        if not text:
            return None, None
        
        # Find numbers with k notation
        matches = re.findall(r'(\d+)k', text.lower())
        if matches:
            nums = [int(m) * 1000 for m in matches]
            if len(nums) >= 2:
                return min(nums), max(nums)
            elif len(nums) == 1:
                return nums[0], nums[0]
        
        # Find regular numbers
        matches = re.findall(r'\$?([\d,]+)', text)
        if matches:
            nums = [int(m.replace(',', '')) for m in matches if int(m.replace(',', '')) > 1000]
            if len(nums) >= 2:
                return min(nums), max(nums)
            elif len(nums) == 1:
                return nums[0], nums[0]
        
        return None, None
