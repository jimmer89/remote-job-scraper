# 🔍 Remote Job Scraper

Encuentra trabajos remotos "lazy girl jobs" - posiciones entry-level, sin teléfono, bien pagadas.

## 🌐 Live Demo

| Servicio | URL |
|----------|-----|
| **Frontend** | https://frontend-three-azure-48.vercel.app |
| **API** | https://remote-job-scraper-production-2b9c.up.railway.app |
| **API Docs** | https://remote-job-scraper-production-2b9c.up.railway.app/docs |

## ✨ Features

- 🔄 **Multi-source scraping**: WeWorkRemotely, RemoteOK, Reddit, Indeed, Glassdoor
- 📞 **No-phone filter**: Detecta trabajos que no requieren llamadas
- 💰 **Salary extraction**: Parsea salarios de descripciones
- 🏷️ **Auto-categorization**: dev, support, sales, marketing, design, etc.
- 🎯 **Quiz interactivo**: Encuentra tu trabajo ideal
- ⚡ **API REST**: FastAPI con documentación Swagger

## 📊 Stats Actuales

```
Total Jobs: 669
No-Phone Jobs: 116
Jobs with Salary: 201

By Source:
- WeWorkRemotely: 326
- Indeed: 123
- RemoteOK: 98
- Reddit: 89
- Glassdoor: 33
```

## 🛠️ Tech Stack

**Backend:**
- Python 3.12
- FastAPI
- SQLite
- JobSpy, BeautifulSoup, PRAW

**Frontend:**
- Next.js 16
- TypeScript
- Tailwind CSS

**Deployment:**
- Railway (API)
- Vercel (Frontend)

## 🚀 Local Development

### Backend

```bash
# Install dependencies
pip install -r requirements.txt

# Run scraper
python src/main.py scrape

# Start API
python src/main.py api
# or
uvicorn src.api:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📡 API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Health check |
| `GET /docs` | Swagger UI |
| `GET /api/stats` | Database statistics |
| `GET /api/jobs` | List jobs with filters |
| `GET /api/jobs/{id}` | Get single job |
| `GET /api/lazy-girl-jobs` | Pre-filtered ideal jobs |

### Query Parameters

- `limit` - Number of results (default: 50)
- `offset` - Pagination offset
- `no_phone` - Filter no-phone jobs (true/false)
- `category` - Filter by category
- `has_salary` - Only jobs with salary info
- `source` - Filter by source
- `search` - Text search in title/company

## 📁 Project Structure

```
remote-job-scraper/
├── src/
│   ├── api.py           # FastAPI application
│   ├── database.py      # SQLite operations
│   ├── main.py          # CLI entrypoint
│   └── scrapers/        # Job scrapers
│       ├── base.py
│       ├── remoteok.py
│       ├── weworkremotely.py
│       ├── reddit.py
│       └── jobspy_scraper.py
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── data/
│   └── jobs_seed.db     # Seed database
├── requirements.txt
├── railway.toml
└── README.md
```

## 🔄 Cron Jobs

El scraper corre automáticamente cada 6 horas via cron local:

```bash
0 */6 * * * /path/to/scripts/cron_scrape.sh
```

## 📝 License

MIT

---

Built with 🦜 by PepLlu & Jaume
