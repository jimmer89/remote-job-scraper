"""SQLite database operations for job storage."""

import sqlite3
from pathlib import Path
from typing import Optional
from datetime import datetime
import json


class JobDatabase:
    """SQLite database for storing scraped jobs."""
    
    def __init__(self, db_path: str = "data/jobs.db"):
        self.db_path = Path(db_path)
        self.db_path.parent.mkdir(parents=True, exist_ok=True)
        self.conn: Optional[sqlite3.Connection] = None
        self._init_db()
    
    def _init_db(self):
        """Initialize database schema."""
        self.conn = sqlite3.connect(self.db_path)
        self.conn.row_factory = sqlite3.Row
        
        self.conn.executescript("""
            CREATE TABLE IF NOT EXISTS jobs (
                id TEXT PRIMARY KEY,
                source TEXT NOT NULL,
                source_id TEXT,
                title TEXT NOT NULL,
                company TEXT,
                company_logo TEXT,
                description TEXT,
                location TEXT,
                salary_min INTEGER,
                salary_max INTEGER,
                salary_currency TEXT DEFAULT 'USD',
                url TEXT NOT NULL,
                apply_url TEXT,
                tags TEXT,
                category TEXT,
                is_no_phone BOOLEAN DEFAULT 0,
                posted_at TEXT,
                scraped_at TEXT DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
                is_active BOOLEAN DEFAULT 1
            );
            
            CREATE INDEX IF NOT EXISTS idx_jobs_category ON jobs(category);
            CREATE INDEX IF NOT EXISTS idx_jobs_posted ON jobs(posted_at);
            CREATE INDEX IF NOT EXISTS idx_jobs_source ON jobs(source);
            CREATE INDEX IF NOT EXISTS idx_jobs_no_phone ON jobs(is_no_phone);
            CREATE INDEX IF NOT EXISTS idx_jobs_active ON jobs(is_active);
            
            CREATE TABLE IF NOT EXISTS scrape_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                started_at TEXT NOT NULL,
                finished_at TEXT,
                jobs_found INTEGER DEFAULT 0,
                jobs_new INTEGER DEFAULT 0,
                jobs_updated INTEGER DEFAULT 0,
                status TEXT DEFAULT 'running',
                error TEXT
            );
        """)
        self.conn.commit()
    
    def upsert_job(self, job_data: dict) -> tuple[bool, bool]:
        """
        Insert or update a job.
        Returns (is_new, is_updated).
        """
        cursor = self.conn.cursor()
        
        # Check if job exists
        cursor.execute("SELECT id, title, salary_min, salary_max FROM jobs WHERE id = ?", 
                      (job_data['id'],))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing job
            cursor.execute("""
                UPDATE jobs SET
                    title = ?,
                    company = ?,
                    company_logo = ?,
                    description = ?,
                    location = ?,
                    salary_min = ?,
                    salary_max = ?,
                    url = ?,
                    apply_url = ?,
                    tags = ?,
                    category = ?,
                    is_no_phone = ?,
                    updated_at = ?,
                    is_active = 1
                WHERE id = ?
            """, (
                job_data['title'],
                job_data['company'],
                job_data.get('company_logo'),
                job_data.get('description'),
                job_data.get('location'),
                job_data.get('salary_min'),
                job_data.get('salary_max'),
                job_data['url'],
                job_data.get('apply_url'),
                job_data.get('tags'),
                job_data.get('category'),
                job_data.get('is_no_phone', False),
                datetime.utcnow().isoformat(),
                job_data['id']
            ))
            self.conn.commit()
            
            # Check if anything meaningful changed
            changed = (existing['title'] != job_data['title'] or
                      existing['salary_min'] != job_data.get('salary_min') or
                      existing['salary_max'] != job_data.get('salary_max'))
            
            return False, changed
        else:
            # Insert new job
            cursor.execute("""
                INSERT INTO jobs (
                    id, source, source_id, title, company, company_logo,
                    description, location, salary_min, salary_max, salary_currency,
                    url, apply_url, tags, category, is_no_phone, posted_at, scraped_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                job_data['id'],
                job_data['source'],
                job_data.get('source_id'),
                job_data['title'],
                job_data.get('company'),
                job_data.get('company_logo'),
                job_data.get('description'),
                job_data.get('location'),
                job_data.get('salary_min'),
                job_data.get('salary_max'),
                job_data.get('salary_currency', 'USD'),
                job_data['url'],
                job_data.get('apply_url'),
                job_data.get('tags'),
                job_data.get('category'),
                job_data.get('is_no_phone', False),
                job_data.get('posted_at'),
                job_data.get('scraped_at', datetime.utcnow().isoformat())
            ))
            self.conn.commit()
            return True, False
    
    def get_jobs(
        self,
        category: Optional[str] = None,
        source: Optional[str] = None,
        no_phone_only: bool = False,
        has_salary: bool = False,
        limit: int = 100,
        offset: int = 0,
        active_only: bool = True
    ) -> list[dict]:
        """Query jobs with filters."""
        query = "SELECT * FROM jobs WHERE 1=1"
        params = []
        
        if active_only:
            query += " AND is_active = 1"
        
        if category:
            query += " AND category = ?"
            params.append(category)
        
        if source:
            query += " AND source = ?"
            params.append(source)
        
        if no_phone_only:
            query += " AND is_no_phone = 1"
        
        if has_salary:
            query += " AND salary_min IS NOT NULL"
        
        query += " ORDER BY scraped_at DESC LIMIT ? OFFSET ?"
        params.extend([limit, offset])
        
        cursor = self.conn.cursor()
        cursor.execute(query, params)
        
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    
    def search_jobs(self, query: str, limit: int = 50) -> list[dict]:
        """Full-text search in title and description."""
        cursor = self.conn.cursor()
        search_term = f"%{query}%"
        
        cursor.execute("""
            SELECT * FROM jobs 
            WHERE is_active = 1 
            AND (title LIKE ? OR description LIKE ? OR company LIKE ?)
            ORDER BY scraped_at DESC
            LIMIT ?
        """, (search_term, search_term, search_term, limit))
        
        return [dict(row) for row in cursor.fetchall()]
    
    def get_stats(self) -> dict:
        """Get database statistics."""
        cursor = self.conn.cursor()
        
        stats = {}
        
        # Total jobs
        cursor.execute("SELECT COUNT(*) FROM jobs WHERE is_active = 1")
        stats['total_jobs'] = cursor.fetchone()[0]
        
        # By source
        cursor.execute("""
            SELECT source, COUNT(*) as count 
            FROM jobs WHERE is_active = 1 
            GROUP BY source
        """)
        stats['by_source'] = {row['source']: row['count'] for row in cursor.fetchall()}
        
        # By category
        cursor.execute("""
            SELECT category, COUNT(*) as count 
            FROM jobs WHERE is_active = 1 
            GROUP BY category
            ORDER BY count DESC
        """)
        stats['by_category'] = {row['category']: row['count'] for row in cursor.fetchall()}
        
        # No-phone jobs
        cursor.execute("SELECT COUNT(*) FROM jobs WHERE is_active = 1 AND is_no_phone = 1")
        stats['no_phone_jobs'] = cursor.fetchone()[0]
        
        # With salary
        cursor.execute("SELECT COUNT(*) FROM jobs WHERE is_active = 1 AND salary_min IS NOT NULL")
        stats['with_salary'] = cursor.fetchone()[0]
        
        # Last scrape
        cursor.execute("""
            SELECT source, MAX(scraped_at) as last_scrape 
            FROM jobs GROUP BY source
        """)
        stats['last_scrape'] = {row['source']: row['last_scrape'] for row in cursor.fetchall()}
        
        return stats
    
    def log_scrape(self, source: str) -> int:
        """Start logging a scrape run."""
        cursor = self.conn.cursor()
        cursor.execute("""
            INSERT INTO scrape_log (source, started_at, status)
            VALUES (?, ?, 'running')
        """, (source, datetime.utcnow().isoformat()))
        self.conn.commit()
        return cursor.lastrowid
    
    def finish_scrape(
        self, 
        log_id: int, 
        jobs_found: int, 
        jobs_new: int, 
        jobs_updated: int,
        status: str = 'success',
        error: Optional[str] = None
    ):
        """Finish logging a scrape run."""
        cursor = self.conn.cursor()
        cursor.execute("""
            UPDATE scrape_log SET
                finished_at = ?,
                jobs_found = ?,
                jobs_new = ?,
                jobs_updated = ?,
                status = ?,
                error = ?
            WHERE id = ?
        """, (
            datetime.utcnow().isoformat(),
            jobs_found,
            jobs_new,
            jobs_updated,
            status,
            error,
            log_id
        ))
        self.conn.commit()
    
    def close(self):
        """Close database connection."""
        if self.conn:
            self.conn.close()
