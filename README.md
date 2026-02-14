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

## 📊 Stats Actuales (2026-02-14)

```
📦 Total activos: 1,039 jobs
🚫 Sin teléfono: 254
💰 Con salario: 441
👨‍💻 Dev jobs: 195

By Source:
- WeWorkRemotely: 329
- Indeed (JobSpy): 146
- RemoteOK: 98
- Reddit: 88
```

### Último scrape

| Fuente | Encontrados | Nuevos |
|--------|-------------|--------|
| RemoteOK | 98 | 5 |
| WeWorkRemotely | 329 | 1 |
| Reddit | 88 | 4 |
| JobSpy (Indeed) | 146 | 64 |
| **Total** | **661** | **74** |

⚠️ **Errores conocidos:**
- ZipRecruiter: GDPR blocked (EU)
- Glassdoor: Rate limit 429

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

Actualmente el scraper corre cada 6 horas via **cron local** (Clawdbot gateway).

```bash
0 */6 * * * python src/main.py scrape
```

---

## 📋 TODO - Escalabilidad

### 🎯 Problema actual
El cron depende del PC local de Jaume. Si está apagado, no se ejecuta el scraper y los datos se quedan desactualizados.

### ✅ Solución propuesta: GitHub Actions

Migrar el cron a GitHub Actions para que sea independiente:

```yaml
# .github/workflows/scrape.yml
name: Scrape Jobs
on:
  schedule:
    - cron: '0 */6 * * *'  # Cada 6h
  workflow_dispatch:  # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run scraper
        run: python src/main.py scrape
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          REDDIT_CLIENT_ID: ${{ secrets.REDDIT_CLIENT_ID }}
          REDDIT_CLIENT_SECRET: ${{ secrets.REDDIT_CLIENT_SECRET }}
      - name: Upload DB to Railway
        run: # Script para sincronizar DB con Railway
```

### 📝 Pasos para implementar

1. [ ] Crear workflow `.github/workflows/scrape.yml`
2. [ ] Configurar secrets en GitHub (Reddit API, DB URL)
3. [ ] Modificar scraper para escribir directamente a Railway DB (PostgreSQL)
4. [ ] Migrar de SQLite a PostgreSQL en Railway
5. [ ] Desactivar cron local de Clawdbot
6. [ ] Testear ejecución automática

### 💡 Alternativas consideradas

| Opción | Pros | Contras |
|--------|------|---------|
| **GitHub Actions** ⭐ | Gratis, ya tiene repo, logs visibles | Necesita sync con DB |
| Railway Cron | Todo en un sitio | Puede costar $ |
| cron-job.org + endpoint | Simple | Timeout en scrapers largos |

---

## 📝 License

MIT

---

Built with 🦜 by PepLlu & Jaume
