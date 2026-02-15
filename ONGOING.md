# ChillJobs - Estado del Proyecto

**Ultima actualizacion:** 2026-02-15

## Estado: LIVE — Todo funcionando

**Frontend:** https://frontend-three-azure-48.vercel.app
**API:** https://remote-job-scraper-production-2b9c.up.railway.app
**GitHub:** https://github.com/jimmer89/remote-job-scraper

---

## Completado (sprint dia 1-2, 14-15 feb)

### Infraestructura
- [x] Backend API en Railway (FastAPI, SQLite)
- [x] Frontend en Vercel (Next.js 16, Tailwind)
- [x] Volumen persistente en Railway (`/app/data`) — datos no se pierden entre deploys
- [x] Scraping automatico cada 6h via cron-job.org → `GET /api/scrape?token=...`
- [x] Endpoint `/api/scrape/status` para verificar ultimos scrapes
- [x] 921 jobs de 5 fuentes (RemoteOK, WWR, Indeed, Glassdoor, Reddit)

### Auth — FUNCIONANDO
- [x] Usuarios persistentes en SQLite (Railway backend)
- [x] Passwords hasheados con bcrypt (12 rounds)
- [x] NextAuth secret configurado (variable de entorno en Vercel)
- [x] Endpoints backend: `/api/users/register`, `/api/users/verify`, `/api/users/upgrade`, `/api/users/downgrade`
- [x] Frontend auth.ts llama al backend via HTTP

### Stripe — FUNCIONANDO
- [x] Cuenta Stripe creada
- [x] Producto creado: ChillJobs Pro $9.99/mes (price_1T0rU6HVbIehUQTDdxOsdOp5)
- [x] API keys configuradas en Vercel (STRIPE_SECRET_KEY, STRIPE_PRICE_ID)
- [x] Webhook creado en Stripe Dashboard (STRIPE_WEBHOOK_SECRET configurado en Vercel)
- [x] Checkout session funciona (redirige a Stripe, pago test exitoso)
- [x] Webhook → backend upgrade verificado (isPro: false → true)

### Frontend
- [x] Landing page, quiz, pricing, auth pages
- [x] Logica freemium (1 job gratis, resto blurred)
- [x] Error handling en checkout (muestra errores al usuario)
- [x] Checkout envia email desde session del cliente

### Arquitectura final
```
cron-job.org (cada 6h) → GET /api/scrape?token=...
                                    ↓
Browser → Vercel (Next.js frontend + NextAuth + Stripe checkout)
                ↓ HTTP
         Railway (FastAPI backend + SQLite + volumen persistente)
                → jobs table (scrapers)
                → users table (auth + pro status)
                → scrape_log table (historial de scrapes)
```

---

## Variables de entorno

### Vercel (Frontend)
- `NEXT_PUBLIC_API_URL` — URL del backend Railway
- `NEXTAUTH_SECRET` — secret para JWT sessions
- `STRIPE_SECRET_KEY` — Stripe test/live key
- `STRIPE_PRICE_ID` — precio de ChillJobs Pro
- `STRIPE_WEBHOOK_SECRET` — secret del webhook de Stripe

### Railway (Backend)
- `SCRAPE_TOKEN` — token secreto para el endpoint de scraping

### cron-job.org
- URL: `https://remote-job-scraper-production-2b9c.up.railway.app/api/scrape?token=TU_TOKEN`
- Schedule: `0 */6 * * *` (cada 6 horas)

---

## PENDIENTE

### Funcionalidad
- [ ] Google OAuth setup
- [ ] Email alerts para Pro users
- [ ] Custom domain

### Seguridad
- [ ] CORS abierto (*) — aceptable por ahora
- [ ] Sin rate limiting en API
- [ ] Eliminar `/api/users/status` debug endpoint antes de produccion

---

## Metricas actuales

| Metrica | Valor |
|---------|-------|
| Total Jobs | 921 |
| No-Phone Jobs | 192 (20.8%) |
| Con Salary | 321 (34.8%) |
| Fuentes | 5 |
| Usuarios registrados | 1 (test) |
| Pro subscribers | 0 |
| Ingresos | $0 |

---

## Desarrollo local

```bash
# Backend
cd ~/projects/remote-job-scraper
source venv/bin/activate
python -m uvicorn src.api:app --port 8000

# Frontend
cd frontend
npm run dev
```

## Deploy

```bash
# Frontend: deploy manual (auto-deploy de Vercel no funciona con subdirectorio)
cd ~/projects/remote-job-scraper/frontend
/home/jaume/.npm-global/bin/vercel --prod

# Backend: deploy manual via Railway CLI
cd ~/projects/remote-job-scraper
/home/jaume/.npm-global/bin/railway up --detach

# Scrape manual
curl "https://remote-job-scraper-production-2b9c.up.railway.app/api/scrape?token=TU_TOKEN"

# Ver resultados del ultimo scrape
curl "https://remote-job-scraper-production-2b9c.up.railway.app/api/scrape/status"
```

---

*Actualizado: 2026-02-15*
