"""Reddit scraper for job postings in remote work subreddits."""

import httpx
from datetime import datetime
from typing import Optional
import re
from .base import BaseScraper, Job


class RedditScraper(BaseScraper):
    """
    Scraper for Reddit job subreddits.
    
    Uses Reddit's public JSON API (no auth required).
    Subreddits: r/RemoteJobs, r/forhire, r/WorkOnline
    """
    
    name = "reddit"
    base_url = "https://www.reddit.com"
    
    # Subreddits to scrape
    subreddits = [
        "remotejobs",
        "forhire",
        "WorkOnline",
    ]
    
    # Filters for job posts (hiring, not looking for work)
    hiring_keywords = [
        '[hiring]', '[for hire]', 'hiring', 'looking for', 'we are hiring',
        'job opening', 'position available', 'remote position', 'work from home',
        '$', 'per hour', '/hr', 'salary', 'compensation'
    ]
    
    async def scrape(self) -> list[Job]:
        """Scrape job posts from Reddit."""
        jobs = []
        seen_ids = set()
        
        async with httpx.AsyncClient() as client:
            for subreddit in self.subreddits:
                try:
                    subreddit_jobs = await self._scrape_subreddit(client, subreddit)
                    
                    for job in subreddit_jobs:
                        if job.source_id not in seen_ids:
                            job.category = self.categorize(job)
                            job.is_no_phone = self.detect_no_phone(job)
                            jobs.append(job)
                            seen_ids.add(job.source_id)
                    
                    # Rate limiting for Reddit
                    import asyncio
                    await asyncio.sleep(1)
                    
                except Exception as e:
                    print(f"Error scraping r/{subreddit}: {e}")
                    continue
        
        self.jobs = jobs
        return jobs
    
    async def _scrape_subreddit(self, client: httpx.AsyncClient, subreddit: str) -> list[Job]:
        """Scrape a single subreddit."""
        jobs = []
        
        # Get hot and new posts
        for sort in ['hot', 'new']:
            try:
                url = f"{self.base_url}/r/{subreddit}/{sort}.json"
                
                response = await client.get(
                    url,
                    params={
                        'limit': 50,
                        't': 'week',  # Time filter
                    },
                    headers={
                        'User-Agent': 'RemoteJobScraper/1.0 (educational project)',
                    },
                    timeout=30.0,
                    follow_redirects=True
                )
                
                if response.status_code != 200:
                    continue
                
                data = response.json()
                posts = data.get('data', {}).get('children', [])
                
                for post in posts:
                    post_data = post.get('data', {})
                    job = self._parse_post(post_data, subreddit)
                    if job:
                        jobs.append(job)
                        
            except Exception as e:
                print(f"Error fetching r/{subreddit}/{sort}: {e}")
                continue
        
        return jobs
    
    def _parse_post(self, data: dict, subreddit: str) -> Optional[Job]:
        """Parse a Reddit post into a Job if it looks like a job posting."""
        
        title = data.get('title', '')
        selftext = data.get('selftext', '')
        
        # Skip if no title
        if not title:
            return None
        
        # Check if this looks like a hiring post
        combined_text = f"{title} {selftext}".lower()
        
        # Skip "looking for work" posts
        looking_keywords = ['seeking', 'looking for work', 'available for hire', 'need a job', 'hire me']
        for keyword in looking_keywords:
            if keyword in combined_text:
                return None
        
        # Check for hiring indicators
        is_hiring = False
        for keyword in self.hiring_keywords:
            if keyword.lower() in combined_text:
                is_hiring = True
                break
        
        if not is_hiring:
            return None
        
        # Extract job details from title/text
        source_id = data.get('id', '')
        if not source_id:
            return None
        
        # Try to extract company name from title patterns like "[Hiring] Company Name - Position"
        company = self._extract_company(title)
        
        # Try to extract salary
        salary_min, salary_max = self._extract_salary(f"{title} {selftext}")
        
        # Get URL
        permalink = data.get('permalink', '')
        url = f"{self.base_url}{permalink}" if permalink else data.get('url', '')
        
        # Get post date
        created_utc = data.get('created_utc')
        posted_at = datetime.utcfromtimestamp(created_utc) if created_utc else None
        
        # Clean up title for job title
        job_title = self._clean_title(title)
        
        # Tags from flair and subreddit
        tags = [f"r/{subreddit}"]
        flair = data.get('link_flair_text')
        if flair:
            tags.append(flair)
        
        return Job(
            source=self.name,
            source_id=source_id,
            title=job_title,
            company=company,
            description=selftext[:3000] if selftext else None,
            location='Remote',
            salary_min=salary_min,
            salary_max=salary_max,
            url=url,
            tags=tags,
            posted_at=posted_at,
        )
    
    def _extract_company(self, title: str) -> str:
        """Try to extract company name from post title."""
        
        # Common patterns:
        # [Hiring] Company Name - Job Title
        # Company Name is hiring for Job Title
        # Job Title at Company Name
        
        # Pattern: [Hiring] Company - Title
        match = re.search(r'\[hiring\]\s*([^-–|]+?)(?:\s*[-–|]|\s+is\s+hiring)', title, re.IGNORECASE)
        if match:
            return match.group(1).strip()
        
        # Pattern: Title at Company
        match = re.search(r'(?:at|@|with)\s+([A-Z][A-Za-z0-9\s&.]+?)(?:\s*[-–|]|\s*$)', title)
        if match:
            company = match.group(1).strip()
            if len(company) > 2 and len(company) < 50:
                return company
        
        # Pattern: Company is hiring
        match = re.search(r'^([A-Z][A-Za-z0-9\s&.]+?)\s+is\s+hiring', title)
        if match:
            return match.group(1).strip()
        
        return 'Unknown (Reddit)'
    
    def _clean_title(self, title: str) -> str:
        """Clean up title to extract job title."""
        
        # Remove common prefixes
        title = re.sub(r'^\[(?:hiring|for hire|remote)\]\s*', '', title, flags=re.IGNORECASE)
        
        # Remove company name patterns
        title = re.sub(r'^[^-–|]+[-–|]\s*', '', title)
        
        # Remove salary from title
        title = re.sub(r'\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\s*/\s*(?:hr|hour|year|yr|month|mo))?', '', title, flags=re.IGNORECASE)
        
        # Clean up
        title = re.sub(r'\s+', ' ', title).strip()
        
        # If title is too short or looks wrong, use original
        if len(title) < 5:
            return title
        
        return title[:200]  # Limit length
    
    def _extract_salary(self, text: str) -> tuple[Optional[int], Optional[int]]:
        """Extract salary from text."""
        if not text:
            return None, None
        
        # Look for salary patterns
        patterns = [
            r'\$(\d{1,3}(?:,\d{3})*)\s*[-–]\s*\$(\d{1,3}(?:,\d{3})*)',  # $50,000 - $70,000
            r'\$(\d+(?:\.\d+)?)\s*[-–]\s*\$?(\d+(?:\.\d+)?)\s*/\s*(?:hr|hour)',  # $20-$25/hr
            r'\$(\d{1,3}(?:,\d{3})*)/(?:yr|year)',  # $50,000/yr
            r'\$(\d+(?:\.\d+)?)/(?:hr|hour)',  # $20/hr
            r'(\d+)k\s*[-–]\s*(\d+)k',  # 50k - 70k
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                groups = match.groups()
                
                try:
                    if '/hr' in match.group(0).lower() or '/hour' in match.group(0).lower():
                        # Convert hourly to annual
                        min_val = float(groups[0].replace(',', '')) * 40 * 52
                        max_val = float(groups[1].replace(',', '')) * 40 * 52 if len(groups) > 1 else min_val
                    elif 'k' in match.group(0).lower():
                        # Handle k notation
                        min_val = float(groups[0]) * 1000
                        max_val = float(groups[1]) * 1000 if len(groups) > 1 else min_val
                    else:
                        min_val = float(groups[0].replace(',', ''))
                        max_val = float(groups[1].replace(',', '')) if len(groups) > 1 else min_val
                    
                    # Sanity check
                    if 10000 <= min_val <= 500000:
                        return int(min_val), int(max_val)
                except:
                    continue
        
        return None, None
