# ChillJobs

**Remote Jobs. No Calls Required.**

Job board para trabajos remotos sin llamadas telefonicas. El unico job board con filtro no-phone.

## Estado (14 feb 2026)

- 1,039 jobs de 5 fuentes, actualizados cada 6h
- 254 jobs no-phone detectados (24.5%)
- Frontend live en Vercel, API live en Railway
- **0 usuarios, 0 ingresos** — Sprint de 1 semana para lanzar (ver ACTION_PLAN.md)

## Features

- No-Phone Filter — detecta jobs sin llamadas telefonicas
- Salary Transparency — muestra salario antes de aplicar
- Smart Quiz — matching interactivo con preferencias
- Multi-Source — RemoteOK, WeWorkRemotely, Indeed, Glassdoor, Reddit
- Freemium — 1 job gratis, Pro $9.99/mes para acceso completo

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Python, FastAPI, SQLite
- **Auth:** NextAuth.js (JWT)
- **Payments:** Stripe (pendiente de configurar)
- **Hosting:** Vercel (frontend) + Railway (API)

## Project Structure

```
remote-job-scraper/
├── src/                    # Backend Python
│   ├── api.py             # FastAPI REST API
│   ├── database.py        # SQLite operations
│   ├── scrapers/          # Job scrapers (5 fuentes)
│   └── main.py            # CLI interface
├── frontend/              # Next.js frontend
│   ├── src/app/           # Pages & API routes
│   ├── src/components/    # React components
│   └── src/lib/           # Auth, API client
├── data/                  # SQLite database
├── AUDIT_2026-02-14.md    # Auditoria del proyecto
├── ACTION_PLAN.md         # Sprint de 1 semana
├── MASTER_PLAN.md         # Resumen ejecutivo
├── ONGOING.md             # Estado detallado
├── BUSINESS_PLAN.md       # Modelo de negocio
└── MARKETING_PLAN.md      # Estrategia de growth
```

## Development

```bash
# Backend
cd ~/projects/remote-job-scraper
source venv/bin/activate
python -m uvicorn src.api:app --port 8000

# Frontend
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Environment Variables (Frontend)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
STRIPE_SECRET_KEY=sk_...
STRIPE_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/jobs` | Search/filter jobs |
| `GET /api/stats` | Job statistics |
| `GET /api/categories` | Category counts |
| `GET /api/lazy-girl-jobs` | Curated no-phone jobs |
| `GET /api/jobs/{id}` | Single job details |

## Data Sources

| Source | Jobs | Method |
|--------|------|--------|
| Indeed | 429 | JobSpy scraper |
| WeWorkRemotely | 336 | HTML scraping |
| RemoteOK | 112 | Public API |
| Reddit | 112 | JSON API |
| Glassdoor | 50 | JobSpy scraper |

## License

MIT

---

Built by Jaume & PepLlu
