"""RemoteOK scraper using their public JSON API."""

import httpx
from datetime import datetime
from typing import Optional
from .base import BaseScraper, Job


class RemoteOKScraper(BaseScraper):
    """
    Scraper for RemoteOK.com using their public API.
    
    API Terms: Must link back to RemoteOK and mention as source.
    Endpoint: https://remoteok.com/api
    """
    
    name = "remoteok"
    base_url = "https://remoteok.com"
    api_url = "https://remoteok.com/api"
    
    async def scrape(self) -> list[Job]:
        """Fetch jobs from RemoteOK API."""
        jobs = []
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                self.api_url,
                headers={
                    'User-Agent': 'RemoteJobScraper/1.0 (https://github.com/jaume/remote-job-scraper)'
                },
                timeout=30.0
            )
            response.raise_for_status()
            data = response.json()
        
        # First item is legal/terms notice, skip it
        for item in data[1:]:
            try:
                job = self._parse_job(item)
                if job:
                    # Auto-categorize and detect no-phone
                    job.category = self.categorize(job)
                    job.is_no_phone = self.detect_no_phone(job)
                    jobs.append(job)
            except Exception as e:
                print(f"Error parsing job {item.get('id', 'unknown')}: {e}")
                continue
        
        self.jobs = jobs
        return jobs
    
    def _parse_job(self, data: dict) -> Optional[Job]:
        """Parse API response into Job object."""
        if not data.get('id') or not data.get('position'):
            return None
        
        # Parse posted date
        posted_at = None
        if data.get('date'):
            try:
                posted_at = datetime.fromisoformat(data['date'].replace('+00:00', ''))
            except:
                pass
        
        # Parse salary
        salary_min = data.get('salary_min') or None
        salary_max = data.get('salary_max') or None
        
        # Clean up salary (API sometimes returns 0)
        if salary_min == 0:
            salary_min = None
        if salary_max == 0:
            salary_max = None
        
        return Job(
            source=self.name,
            source_id=str(data['id']),
            title=data.get('position', ''),
            company=data.get('company', 'Unknown'),
            company_logo=data.get('company_logo') or data.get('logo'),
            description=self._clean_description(data.get('description', '')),
            location=data.get('location', 'Remote'),
            salary_min=salary_min,
            salary_max=salary_max,
            salary_currency='USD',
            url=data.get('url', f"{self.base_url}/remote-jobs/{data['slug']}"),
            apply_url=data.get('apply_url'),
            tags=data.get('tags', []),
            posted_at=posted_at,
        )
    
    def _clean_description(self, html: str) -> str:
        """Basic HTML cleanup for description."""
        if not html:
            return ""
        
        # Remove common HTML tags (basic cleanup)
        import re
        text = re.sub(r'<br\s*/?>', '\n', html)
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'&nbsp;', ' ', text)
        text = re.sub(r'&amp;', '&', text)
        text = re.sub(r'&lt;', '<', text)
        text = re.sub(r'&gt;', '>', text)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text.strip()[:5000]  # Limit description length
