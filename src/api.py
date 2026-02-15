#!/usr/bin/env python3
"""
REST API for Remote Job Scraper.

Run with: uvicorn src.api:app --reload --port 8000
"""

from fastapi import FastAPI, Query, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from contextlib import contextmanager
import json
import uuid
import bcrypt
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))

from src.database import JobDatabase

app = FastAPI(
    title="Remote Job Scraper API",
    description="API for querying remote job listings from multiple sources",
    version="1.0.0",
)

# CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import shutil

# Use seed database if main db doesn't exist
DB_PATH = "data/jobs.db"
SEED_DB = "seeds/jobs_seed.db"  # Outside data/ so Railway volume mount doesn't overlay it

# Copy seed if jobs.db doesn't exist or has no job data (< 100KB means just schemas)
if not Path(DB_PATH).exists() or Path(DB_PATH).stat().st_size < 100_000:
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    if Path(SEED_DB).exists():
        shutil.copy(SEED_DB, DB_PATH)
        print(f"Copied seed database to {DB_PATH}")


def get_db():
    """Get database connection per request."""
    db = JobDatabase(DB_PATH)
    try:
        yield db
    finally:
        db.close()


@app.get("/")
def root():
    """API health check."""
    return {
        "status": "ok",
        "message": "Remote Job Scraper API",
        "docs": "/docs",
    }


@app.get("/api/jobs")
def get_jobs(
    category: Optional[str] = Query(None, description="Filter by category (support, dev, design, etc.)"),
    source: Optional[str] = Query(None, description="Filter by source (remoteok, weworkremotely, reddit)"),
    no_phone: bool = Query(False, description="Only jobs that don't require phone"),
    has_salary: bool = Query(False, description="Only jobs with salary information"),
    search: Optional[str] = Query(None, description="Search in title, company, description"),
    limit: int = Query(50, ge=1, le=200, description="Number of results"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: JobDatabase = Depends(get_db),
):
    """
    Get job listings with optional filters.
    
    Categories: support, dev, design, marketing, sales, writing, va, data-entry, hr, moderation, other
    Sources: remoteok, weworkremotely, indeed, reddit
    """
    if search:
        jobs = db.search_jobs(search, limit=limit)
    else:
        jobs = db.get_jobs(
            category=category,
            source=source,
            no_phone_only=no_phone,
            has_salary=has_salary,
            limit=limit,
            offset=offset,
        )
    
    # Parse tags JSON
    for job in jobs:
        if job.get('tags') and isinstance(job['tags'], str):
            try:
                job['tags'] = json.loads(job['tags'])
            except:
                job['tags'] = []
    
    return {
        "count": len(jobs),
        "offset": offset,
        "jobs": jobs,
    }


@app.get("/api/jobs/{job_id}")
def get_job(job_id: str, db: JobDatabase = Depends(get_db)):
    """Get a single job by ID."""
    jobs = db.get_jobs(limit=1000)
    
    for job in jobs:
        if job['id'] == job_id:
            if job.get('tags') and isinstance(job['tags'], str):
                try:
                    job['tags'] = json.loads(job['tags'])
                except:
                    job['tags'] = []
            return job
    
    raise HTTPException(status_code=404, detail="Job not found")


@app.get("/api/categories")
def get_categories(db: JobDatabase = Depends(get_db)):
    """Get list of job categories with counts."""
    stats = db.get_stats()
    return {
        "categories": [
            {"name": cat, "count": count}
            for cat, count in stats['by_category'].items()
        ]
    }


@app.get("/api/sources")
def get_sources(db: JobDatabase = Depends(get_db)):
    """Get list of job sources with counts and last scrape time."""
    stats = db.get_stats()
    return {
        "sources": [
            {
                "name": source,
                "count": stats['by_source'].get(source, 0),
                "last_scrape": stats['last_scrape'].get(source),
            }
            for source in stats['by_source'].keys()
        ]
    }


@app.get("/api/stats")
def get_stats(db: JobDatabase = Depends(get_db)):
    """Get overall statistics."""
    stats = db.get_stats()
    return {
        "total_jobs": stats['total_jobs'],
        "no_phone_jobs": stats['no_phone_jobs'],
        "jobs_with_salary": stats['with_salary'],
        "by_source": stats['by_source'],
        "by_category": stats['by_category'],
        "last_scrape": stats['last_scrape'],
    }


@app.get("/api/lazy-girl-jobs")
def get_lazy_girl_jobs(
    limit: int = Query(50, ge=1, le=200),
    db: JobDatabase = Depends(get_db),
):
    """
    Get 'Lazy Girl Jobs' - remote jobs that don't require phone calls.
    
    Focuses on: customer support, data entry, content moderation, VA roles.
    """
    # Get no-phone jobs in specific categories
    lazy_categories = ['support', 'data-entry', 'moderation', 'va', 'writing']
    
    all_jobs = []
    seen_ids = set()
    
    for category in lazy_categories:
        jobs = db.get_jobs(
            category=category,
            no_phone_only=True,
            limit=limit,
        )
        for job in jobs:
            if job['id'] not in seen_ids:
                all_jobs.append(job)
                seen_ids.add(job['id'])
    
    # Also get no-phone jobs from other categories
    other_jobs = db.get_jobs(no_phone_only=True, limit=limit)
    for job in other_jobs:
        if job['id'] not in seen_ids:
            all_jobs.append(job)
            seen_ids.add(job['id'])
    
    # Sort by scraped_at descending
    all_jobs.sort(key=lambda x: x.get('scraped_at', ''), reverse=True)
    
    # Parse tags
    for job in all_jobs[:limit]:
        if job.get('tags') and isinstance(job['tags'], str):
            try:
                job['tags'] = json.loads(job['tags'])
            except:
                job['tags'] = []
    
    return {
        "count": len(all_jobs[:limit]),
        "jobs": all_jobs[:limit],
    }


# --- User Management Endpoints ---

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class VerifyRequest(BaseModel):
    email: str
    password: str

class UpgradeRequest(BaseModel):
    email: str
    stripe_customer_id: Optional[str] = None

class DowngradeRequest(BaseModel):
    stripe_customer_id: str


@app.post("/api/users/register")
def register_user(req: RegisterRequest, db: JobDatabase = Depends(get_db)):
    """Register a new user."""
    cursor = db.conn.cursor()
    cursor.execute("SELECT id FROM users WHERE email = ?", (req.email,))
    if cursor.fetchone():
        raise HTTPException(status_code=400, detail="User already exists")

    user_id = str(uuid.uuid4())
    password_hash = bcrypt.hashpw(req.password.encode(), bcrypt.gensalt(12)).decode()

    cursor.execute(
        "INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)",
        (user_id, req.email, password_hash, req.name)
    )
    db.conn.commit()
    return {"id": user_id, "email": req.email, "name": req.name, "isPro": False}


@app.post("/api/users/verify")
def verify_user(req: VerifyRequest, db: JobDatabase = Depends(get_db)):
    """Verify user credentials. Returns user info if valid."""
    cursor = db.conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (req.email,))
    row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = dict(row)
    if not bcrypt.checkpw(req.password.encode(), user["password_hash"].encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "id": user["id"],
        "email": user["email"],
        "name": user["name"],
        "isPro": bool(user["is_pro"]),
    }


@app.post("/api/users/upgrade")
def upgrade_user(req: UpgradeRequest, db: JobDatabase = Depends(get_db)):
    """Upgrade a user to Pro."""
    cursor = db.conn.cursor()
    cursor.execute(
        "UPDATE users SET is_pro = 1, stripe_customer_id = ?, pro_expires_at = datetime('now', '+30 days') WHERE email = ?",
        (req.stripe_customer_id, req.email)
    )
    db.conn.commit()
    return {"success": True}


@app.post("/api/users/downgrade")
def downgrade_user(req: DowngradeRequest, db: JobDatabase = Depends(get_db)):
    """Downgrade a user (subscription cancelled)."""
    cursor = db.conn.cursor()
    cursor.execute(
        "UPDATE users SET is_pro = 0, pro_expires_at = NULL WHERE stripe_customer_id = ?",
        (req.stripe_customer_id,)
    )
    db.conn.commit()
    return {"success": True}


@app.get("/api/users/status")
def get_users_status(db: JobDatabase = Depends(get_db)):
    """Get all users status (admin debug - remove in production)."""
    cursor = db.conn.cursor()
    cursor.execute("SELECT id, email, name, is_pro, stripe_customer_id, pro_expires_at, created_at FROM users")
    rows = cursor.fetchall()
    return {"users": [dict(row) for row in rows]}


# --- Scraper Endpoint ---

import asyncio
import os

SCRAPE_TOKEN = os.environ.get("SCRAPE_TOKEN", "change-me-in-production")

@app.post("/api/scrape")
async def trigger_scrape(
    token: str = Query(..., description="Secret token to authorize scraping"),
    source: Optional[str] = Query(None, description="Specific source to scrape"),
):
    """Trigger a scrape run. Protected by secret token."""
    if token != SCRAPE_TOKEN:
        raise HTTPException(status_code=403, detail="Invalid token")

    from src.scrapers import RemoteOKScraper, WeWorkRemotelyScraper, RedditScraper, JobSpyScraper, WellfoundScraper

    SCRAPERS = {
        'remoteok': RemoteOKScraper,
        'weworkremotely': WeWorkRemotelyScraper,
        'reddit': RedditScraper,
        'jobspy': JobSpyScraper,
        'wellfound': WellfoundScraper,
    }

    if source and source not in SCRAPERS:
        raise HTTPException(status_code=400, detail=f"Unknown source: {source}. Available: {list(SCRAPERS.keys())}")

    sources_to_scrape = [source] if source else list(SCRAPERS.keys())

    db = JobDatabase(DB_PATH)
    results = []

    for source_name in sources_to_scrape:
        scraper = SCRAPERS[source_name]()
        log_id = db.log_scrape(source_name)

        try:
            jobs = await scraper.scrape()
            new_count = 0
            updated_count = 0

            for job in jobs:
                is_new, is_updated = db.upsert_job(job.to_dict())
                if is_new:
                    new_count += 1
                elif is_updated:
                    updated_count += 1

            db.finish_scrape(log_id, jobs_found=len(jobs), jobs_new=new_count, jobs_updated=updated_count)
            results.append({"source": source_name, "found": len(jobs), "new": new_count, "updated": updated_count})

        except Exception as e:
            db.finish_scrape(log_id, 0, 0, 0, status='error', error=str(e))
            results.append({"source": source_name, "error": str(e)})

    db.close()
    return {"status": "completed", "results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
