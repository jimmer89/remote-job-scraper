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
    - All Remote Jobs: /remote-jobs
    """
    
    name = "weworkremotely"
    base_url = "https://weworkremotely.com"
    
    # Categories to scrape (focus on customer support and general)
    categories = [
        "/categories/remote-customer-support-jobs",
        "/categories/remote-programming-jobs",
        "/categories/remote-design-jobs",  
        "/categories/remote-sales-jobs",
        "/categories/remote-marketing-jobs",
        "/categories/remote-copywriting-jobs",
        "/categories/remote-devops-sysadmin-jobs",
        "/categories/remote-product-jobs",
        "/categories/remote-data-jobs",
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
                        timeout=30.0,
                        follow_redirects=True
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
        
        # Find job listings - they're in li elements with specific classes
        job_items = soup.select('li.feature, li.new-listing-container')
        
        for item in job_items:
            try:
                # Skip ads
                if 'ad' in item.get('class', []):
                    continue
                    
                job = self._parse_job_item(item, category)
                if job:
                    jobs.append(job)
            except Exception as e:
                continue
        
        return jobs
    
    def _parse_job_item(self, item, category: str) -> Optional[Job]:
        """Parse individual job listing item."""
        
        # Get job link
        job_link = item.select_one('a[href*="/remote-jobs/"]')
        if not job_link:
            return None
        
        href = job_link.get('href', '')
        if not href:
            return None
        
        # Build full URL
        job_url = href if href.startswith('http') else f"{self.base_url}{href}"
        
        # Extract job ID from URL (last part of path)
        source_id = href.rstrip('/').split('/')[-1]
        if not source_id:
            return None
        
        # Get title from h3 or title class
        title_elem = item.select_one('.new-listing__header__title, h3.title, h3')
        title = title_elem.get_text(strip=True) if title_elem else None
        
        if not title:
            return None
        
        # Get company name
        company_elem = item.select_one('.new-listing__company-name, .company')
        company = company_elem.get_text(strip=True) if company_elem else None
        
        # Fallback: extract from company link
        if not company:
            company_link = item.select_one('a[href*="/company/"]')
            if company_link:
                # Extract company name from URL path
                company_href = company_link.get('href', '')
                company = company_href.split('/company/')[-1].replace('-', ' ').title()
        
        if not company:
            company = 'Unknown'
        
        # Get company logo
        logo_elem = item.select_one('.tooltip--flag-logo__flag-logo, .logo img, img.logo')
        company_logo = None
        if logo_elem:
            # Check for background-image style
            style = logo_elem.get('style', '')
            if 'background-image' in style:
                match = re.search(r'url\(([^)]+)\)', style)
                if match:
                    company_logo = match.group(1).strip('"\'')
            else:
                company_logo = logo_elem.get('src')
        
        # Get location/region
        region_elem = item.select_one('.new-listing__region, .region')
        location = region_elem.get_text(strip=True) if region_elem else 'Remote'
        
        # Parse salary from title or specific element
        salary_min, salary_max = self._parse_salary(item, title)
        
        # Get job type (featured, full-time, contract, etc.)
        tags = []
        
        type_elem = item.select_one('.new-listing__type, .listing-tag')
        if type_elem:
            tags.append(type_elem.get_text(strip=True))
        
        if 'feature' in item.get('class', []):
            tags.append('featured')
        
        # Extract salary range tags
        salary_tag = item.select_one('.new-listing__compensation')
        if salary_tag:
            tags.append(salary_tag.get_text(strip=True))
        
        # Get posted date
        date_elem = item.select_one('.new-listing__header__icons__date, .date')
        posted_at = None
        if date_elem:
            posted_at = self._parse_relative_date(date_elem.get_text(strip=True))
        
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
            posted_at=posted_at,
        )
    
    def _parse_salary(self, item, title: str) -> tuple[Optional[int], Optional[int]]:
        """Extract salary range from listing or title."""
        
        # First check for salary in compensation element
        comp_elem = item.select_one('.new-listing__compensation')
        if comp_elem:
            salary_text = comp_elem.get_text()
            result = self._extract_salary_range(salary_text)
            if result[0]:
                return result
        
        # Check title for salary patterns like "$40,000/year" or "$20/hr"
        if title:
            result = self._extract_salary_range(title)
            if result[0]:
                return result
        
        # Check full item text
        full_text = item.get_text()
        
        # Look for salary range patterns
        patterns = [
            r'\$[\d,]+\s*[-–]\s*\$[\d,]+',  # $50,000 - $70,000
            r'\$[\d,]+/(?:year|yr|hour|hr)',  # $50,000/year or $20/hr
            r'\$[\d,]+k?\s*[-–]\s*\$[\d,]+k?',  # $50k - $70k
        ]
        
        for pattern in patterns:
            match = re.search(pattern, full_text, re.IGNORECASE)
            if match:
                return self._extract_salary_range(match.group())
        
        return None, None
    
    def _extract_salary_range(self, text: str) -> tuple[Optional[int], Optional[int]]:
        """Parse salary numbers from text."""
        if not text:
            return None, None
        
        # Handle hourly rates - convert to annual (assuming 40h/week, 52 weeks)
        hourly_match = re.search(r'\$(\d+)(?:\.\d+)?(?:/h(?:our|r)?|\s*per\s*hour)', text, re.IGNORECASE)
        if hourly_match:
            hourly = int(hourly_match.group(1))
            annual = hourly * 40 * 52
            return annual, annual
        
        # Find all dollar amounts
        amounts = re.findall(r'\$?([\d,]+)(?:\s*k)?', text, re.IGNORECASE)
        
        if not amounts:
            return None, None
        
        # Parse and normalize
        parsed = []
        for amt in amounts:
            try:
                num = int(amt.replace(',', ''))
                # Handle "k" notation (50k = 50000)
                if num < 1000 and 'k' in text.lower():
                    num *= 1000
                # Sanity check - salary should be reasonable
                if 1000 <= num <= 1000000:
                    parsed.append(num)
            except:
                continue
        
        if len(parsed) >= 2:
            return min(parsed), max(parsed)
        elif len(parsed) == 1:
            return parsed[0], parsed[0]
        
        return None, None
    
    def _parse_relative_date(self, text: str) -> Optional[datetime]:
        """Parse relative date like '2d', '1w', '3h' to datetime."""
        if not text:
            return None
        
        text = text.lower().strip()
        now = datetime.utcnow()
        
        # Parse patterns like "2d", "1w", "3h"
        match = re.match(r'(\d+)\s*(d|h|w|m)', text)
        if match:
            num = int(match.group(1))
            unit = match.group(2)
            
            from datetime import timedelta
            
            if unit == 'h':
                return now - timedelta(hours=num)
            elif unit == 'd':
                return now - timedelta(days=num)
            elif unit == 'w':
                return now - timedelta(weeks=num)
            elif unit == 'm':
                return now - timedelta(days=num * 30)
        
        return None
