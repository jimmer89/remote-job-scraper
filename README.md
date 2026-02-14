# ChillJobs 🌴

**Remote Jobs. No Calls Required.**

A job board for people who want remote work without the phone calls. The only job board with a no-phone filter.

🌐 **Live:** https://frontend-three-azure-48.vercel.app

## Features

### For Job Seekers
- 📵 **No-Phone Filter** - Find jobs that don't require phone calls
- 💰 **Salary Transparency** - See pay before you apply
- 🎯 **Smart Quiz** - Match with your perfect job
- 🔄 **Updated Every 6 Hours** - Fresh jobs from 5+ sources

### Tech Stack
- **Frontend:** Next.js 16, React, Tailwind CSS
- **Backend:** Python, FastAPI, SQLite
- **Auth:** NextAuth.js
- **Payments:** Stripe
- **Hosting:** Vercel (frontend), Railway (API)

## Project Structure

```
remote-job-scraper/
├── src/                    # Backend Python code
│   ├── api.py             # FastAPI REST API
│   ├── database.py        # SQLite database
│   ├── scrapers/          # Job scrapers
│   └── main.py            # CLI interface
├── frontend/              # Next.js frontend
│   ├── src/
│   │   ├── app/           # Pages & API routes
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities & API client
│   │   └── hooks/         # Custom hooks
│   └── public/            # Static assets
└── docs/                  # Documentation
```

## Getting Started

### Backend API

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run API server
python -m uvicorn src.api:app --host 0.0.0.0 --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Optional: Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional: Stripe
STRIPE_SECRET_KEY=
STRIPE_PRICE_ID=
STRIPE_WEBHOOK_SECRET=
```

## Business Model

- **Free Tier:** 1 job preview per search
- **Pro Tier ($9.99/mo):**
  - Unlimited job access
  - No-Phone filter
  - Salary filter
  - Email alerts
  - 24h early access

## Data Sources

Jobs are aggregated from:
- RemoteOK
- WeWorkRemotely
- Reddit (r/remotejobs, r/forhire)
- Indeed (via JobSpy)
- Glassdoor (via JobSpy)

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/jobs` | List jobs with filters |
| `GET /api/stats` | Job statistics |
| `GET /api/categories` | Available categories |
| `GET /api/lazy-girl-jobs` | Curated easy jobs |

## Contributing

Built with 🦜 by PepLlu & Jaume

## License

MIT
