"""Indeed scraper for remote jobs."""

import httpx
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
from typing import Optional
import re
import json
from urllib.parse import urlencode
from .base import BaseScraper, Job


class IndeedScraper(BaseScraper):
    """
    Scraper for Indeed.com remote job listings.
    
    Uses Indeed's search with remote filter.
    Note: Indeed has anti-scraping measures, this uses conservative rate limiting.
    """
    
    name = "indeed"
    base_url = "https://www.indeed.com"
    
    # Search queries for different job types
    searches = [
        {"q": "remote customer support", "remotejob": "032b3046-06a3-4876-8dfd-474eb5e7ed11"},
        {"q": "remote chat support", "remotejob": "032b3046-06a3-4876-8dfd-474eb5e7ed11"},
        {"q": "remote data entry", "remotejob": "032b3046-06a3-4876-8dfd-474eb5e7ed11"},
        {"q": "remote content moderator", "remotejob": "032b3046-06a3-4876-8dfd-474eb5e7ed11"},
        {"q": "remote virtual assistant", "remotejob": "032b3046-06a3-4876-8dfd-474eb5e7ed11"},
    ]
    
    async def scrape(self) -> list[Job]:
        """Scrape jobs from Indeed."""
        jobs = []
        seen_ids = set()
        
        async with httpx.AsyncClient() as client:
            for search in self.searches:
                try:
                    search_jobs = await self._search_jobs(client, search)
                    
                    for job in search_jobs:
                        if job.source_id not in seen_ids:
                            job.category = self.categorize(job)
                            job.is_no_phone = self.detect_no_phone(job)
                            jobs.append(job)
                            seen_ids.add(job.source_id)
                    
                    # Rate limiting - be nice to Indeed
                    import asyncio
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    print(f"Error searching Indeed for '{search.get('q')}': {e}")
                    continue
        
        self.jobs = jobs
        return jobs
    
    async def _search_jobs(self, client: httpx.AsyncClient, search: dict, max_pages: int = 2) -> list[Job]:
        """Search Indeed and parse results."""
        jobs = []
        
        for page in range(max_pages):
            try:
                params = {
                    "q": search["q"],
                    "l": "",  # Location empty for remote
                    "remotejob": search.get("remotejob", ""),
                    "fromage": "14",  # Last 14 days
                    "start": page * 10,  # 10 results per page
                }
                
                url = f"{self.base_url}/jobs?" + urlencode(params)
                
                response = await client.get(
                    url,
                    headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Language': 'en-US,en;q=0.5',
                    },
                    timeout=30.0,
                    follow_redirects=True
                )
                
                if response.status_code != 200:
                    break
                
                page_jobs = self._parse_search_results(response.text)
                jobs.extend(page_jobs)
                
                if len(page_jobs) < 10:
                    break  # No more results
                    
            except Exception as e:
                print(f"Error on Indeed page {page}: {e}")
                break
        
        return jobs
    
    def _parse_search_results(self, html: str) -> list[Job]:
        """Parse Indeed search results page."""
        jobs = []
        soup = BeautifulSoup(html, 'lxml')
        
        # Indeed uses various selectors - try multiple
        job_cards = soup.select('div.job_seen_beacon, div.jobsearch-ResultsList > div, .resultContent')
        
        for card in job_cards:
            try:
                job = self._parse_job_card(card)
                if job:
                    jobs.append(job)
            except Exception as e:
                continue
        
        # Also try to extract from JSON-LD or script data
        scripts = soup.select('script[type="application/ld+json"]')
        for script in scripts:
            try:
                data = json.loads(script.string)
                if isinstance(data, dict) and data.get('@type') == 'JobPosting':
                    job = self._parse_json_ld(data)
                    if job:
                        jobs.append(job)
                elif isinstance(data, list):
                    for item in data:
                        if isinstance(item, dict) and item.get('@type') == 'JobPosting':
                            job = self._parse_json_ld(item)
                            if job:
                                jobs.append(job)
            except:
                continue
        
        return jobs
    
    def _parse_job_card(self, card) -> Optional[Job]:
        """Parse individual job card from search results."""
        
        # Get job link and ID
        link = card.select_one('a[data-jk], a.jcs-JobTitle, h2 a')
        if not link:
            return None
        
        job_id = link.get('data-jk') or link.get('id', '').replace('job_', '')
        if not job_id:
            # Try to extract from href
            href = link.get('href', '')
            match = re.search(r'jk=([a-f0-9]+)', href)
            if match:
                job_id = match.group(1)
            else:
                return None
        
        # Get title
        title_elem = card.select_one('h2.jobTitle span, .jobTitle, a.jcs-JobTitle span')
        title = title_elem.get_text(strip=True) if title_elem else link.get_text(strip=True)
        
        if not title:
            return None
        
        # Get company
        company_elem = card.select_one('span.companyName, .company, [data-testid="company-name"]')
        company = company_elem.get_text(strip=True) if company_elem else 'Unknown'
        
        # Get location
        location_elem = card.select_one('div.companyLocation, .location, [data-testid="text-location"]')
        location = location_elem.get_text(strip=True) if location_elem else 'Remote'
        
        # Get salary if present
        salary_elem = card.select_one('.salary-snippet, .salaryText, [data-testid="attribute_snippet_testid"]')
        salary_min, salary_max = None, None
        if salary_elem:
            salary_text = salary_elem.get_text()
            salary_min, salary_max = self._parse_salary(salary_text)
        
        # Get job snippet/description
        snippet_elem = card.select_one('.job-snippet, .summary')
        description = snippet_elem.get_text(strip=True) if snippet_elem else None
        
        # Build URL
        job_url = f"{self.base_url}/viewjob?jk={job_id}"
        
        return Job(
            source=self.name,
            source_id=job_id,
            title=title,
            company=company,
            description=description,
            location=location,
            salary_min=salary_min,
            salary_max=salary_max,
            url=job_url,
            tags=['remote'],
        )
    
    def _parse_json_ld(self, data: dict) -> Optional[Job]:
        """Parse job from JSON-LD structured data."""
        try:
            title = data.get('title', '')
            if not title:
                return None
            
            company = 'Unknown'
            if data.get('hiringOrganization'):
                company = data['hiringOrganization'].get('name', 'Unknown')
            
            description = data.get('description', '')
            
            # Parse location
            location = 'Remote'
            if data.get('jobLocation'):
                loc = data['jobLocation']
                if isinstance(loc, dict):
                    address = loc.get('address', {})
                    if isinstance(address, dict):
                        location = address.get('addressLocality', '') or address.get('addressRegion', '') or 'Remote'
            
            # Parse salary
            salary_min, salary_max = None, None
            if data.get('baseSalary'):
                salary = data['baseSalary']
                if isinstance(salary, dict):
                    value = salary.get('value', {})
                    if isinstance(value, dict):
                        salary_min = value.get('minValue')
                        salary_max = value.get('maxValue')
            
            # Get URL
            url = data.get('url', '')
            
            # Generate ID from URL or title
            source_id = ''
            if url:
                match = re.search(r'jk=([a-f0-9]+)', url)
                if match:
                    source_id = match.group(1)
            if not source_id:
                import hashlib
                source_id = hashlib.md5(f"{title}{company}".encode()).hexdigest()[:12]
            
            return Job(
                source=self.name,
                source_id=source_id,
                title=title,
                company=company,
                description=description[:2000] if description else None,
                location=location,
                salary_min=int(salary_min) if salary_min else None,
                salary_max=int(salary_max) if salary_max else None,
                url=url or f"{self.base_url}/jobs",
                tags=['remote'],
            )
        except Exception as e:
            return None
    
    def _parse_salary(self, text: str) -> tuple[Optional[int], Optional[int]]:
        """Parse salary from text like '$20 - $25 an hour' or '$50,000 - $70,000 a year'."""
        if not text:
            return None, None
        
        text = text.lower()
        
        # Find all numbers
        numbers = re.findall(r'[\d,]+(?:\.\d+)?', text)
        if not numbers:
            return None, None
        
        parsed = []
        for num in numbers:
            try:
                val = float(num.replace(',', ''))
                parsed.append(val)
            except:
                continue
        
        if not parsed:
            return None, None
        
        # Check if hourly - convert to annual
        is_hourly = 'hour' in text or '/hr' in text or 'an hour' in text
        
        if is_hourly:
            # Convert to annual (40h * 52 weeks)
            parsed = [int(p * 40 * 52) for p in parsed]
        else:
            parsed = [int(p) for p in parsed]
        
        # Filter reasonable values
        parsed = [p for p in parsed if 10000 <= p <= 500000]
        
        if len(parsed) >= 2:
            return min(parsed), max(parsed)
        elif len(parsed) == 1:
            return parsed[0], parsed[0]
        
        return None, None
