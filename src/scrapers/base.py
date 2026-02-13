"""Base scraper class for all job sources."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import hashlib
import json


@dataclass
class Job:
    """Normalized job data structure."""
    
    source: str
    source_id: str
    title: str
    company: str
    url: str
    
    # Optional fields
    company_logo: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    salary_currency: str = "USD"
    apply_url: Optional[str] = None
    tags: list = field(default_factory=list)
    category: Optional[str] = None
    is_no_phone: bool = False
    posted_at: Optional[datetime] = None
    scraped_at: datetime = field(default_factory=datetime.utcnow)
    
    @property
    def id(self) -> str:
        """Generate unique ID from source + source_id."""
        content = f"{self.source}:{self.source_id}"
        return hashlib.sha256(content.encode()).hexdigest()[:16]
    
    def to_dict(self) -> dict:
        """Convert to dictionary for DB storage."""
        return {
            'id': self.id,
            'source': self.source,
            'source_id': self.source_id,
            'title': self.title,
            'company': self.company,
            'company_logo': self.company_logo,
            'description': self.description,
            'location': self.location,
            'salary_min': self.salary_min,
            'salary_max': self.salary_max,
            'salary_currency': self.salary_currency,
            'url': self.url,
            'apply_url': self.apply_url,
            'tags': json.dumps(self.tags),
            'category': self.category,
            'is_no_phone': self.is_no_phone,
            'posted_at': self.posted_at.isoformat() if self.posted_at else None,
            'scraped_at': self.scraped_at.isoformat(),
        }


class BaseScraper(ABC):
    """Abstract base class for job scrapers."""
    
    name: str = "base"
    base_url: str = ""
    
    def __init__(self):
        self.jobs: list[Job] = []
    
    @abstractmethod
    async def scrape(self) -> list[Job]:
        """Scrape jobs from source. Must be implemented by subclasses."""
        pass
    
    def detect_no_phone(self, job: Job) -> bool:
        """Detect if job is likely no-phone based on title/description."""
        no_phone_keywords = [
            'chat', 'email', 'written', 'async', 'text',
            'no phone', 'non-phone', 'no calls', 'email only',
            'chat support', 'email support', 'written communication'
        ]
        
        phone_keywords = [
            'phone', 'call', 'calling', 'inbound', 'outbound',
            'voice', 'telephon'
        ]
        
        text = f"{job.title} {job.description or ''}".lower()
        
        # Check for explicit no-phone mentions
        for keyword in no_phone_keywords:
            if keyword in text:
                return True
        
        # If phone is mentioned, probably requires phone
        for keyword in phone_keywords:
            if keyword in text:
                return False
        
        # Default: unknown, assume might require phone
        return False
    
    def categorize(self, job: Job) -> str:
        """Auto-categorize job based on title and tags."""
        title_lower = job.title.lower()
        tags_lower = [t.lower() for t in job.tags]
        
        # Support / Customer Service
        if any(k in title_lower for k in ['support', 'customer', 'service', 'helpdesk', 'help desk']):
            return 'support'
        
        # Content Moderation
        if any(k in title_lower for k in ['moderator', 'moderation', 'content review', 'trust & safety']):
            return 'moderation'
        
        # Data Entry
        if any(k in title_lower for k in ['data entry', 'transcription', 'typing', 'data input']):
            return 'data-entry'
        
        # Virtual Assistant
        if any(k in title_lower for k in ['virtual assistant', 'executive assistant', 'personal assistant', 'admin assistant']):
            return 'va'
        
        # Development
        if any(k in title_lower for k in ['developer', 'engineer', 'programmer', 'software', 'frontend', 'backend', 'fullstack']):
            return 'dev'
        if any(k in tags_lower for k in ['javascript', 'python', 'react', 'node', 'golang', 'rust']):
            return 'dev'
        
        # Design
        if any(k in title_lower for k in ['designer', 'design', 'ui', 'ux', 'graphic']):
            return 'design'
        
        # Marketing
        if any(k in title_lower for k in ['marketing', 'seo', 'content', 'social media', 'growth']):
            return 'marketing'
        
        # Sales
        if any(k in title_lower for k in ['sales', 'account executive', 'sdr', 'bdr', 'business development']):
            return 'sales'
        
        # Writing
        if any(k in title_lower for k in ['writer', 'copywriter', 'editor', 'content creator']):
            return 'writing'
        
        # HR
        if any(k in title_lower for k in ['recruiter', 'recruiting', 'hr ', 'human resources', 'people ops']):
            return 'hr'
        
        return 'other'
