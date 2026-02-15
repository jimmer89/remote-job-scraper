# ChillJobs - Estado del Proyecto

**Ultima actualizacion:** 2026-02-15

## Estado: LIVE — Listo para lanzar

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

### Seguridad — AUDITADO
- [x] Passwords hasheados con bcrypt (12 rounds), nunca expuestos en respuestas
- [x] `/api/users/upgrade` y `/api/users/downgrade` protegidos con Bearer token (INTERNAL_TOKEN)
- [x] `/api/scrape` protegido con SCRAPE_TOKEN
- [x] `/api/webhook` verifica firma de Stripe (STRIPE_WEBHOOK_SECRET)
- [x] CORS restringido a frontend legitimo (no `*`)
- [x] Endpoint debug `/api/users/status` eliminado
- [x] SQL usa parametros (`?`) — sin riesgo de inyeccion
- [x] Todos los secrets en variables de entorno (no hardcodeados)

### Arquitectura final
```
cron-job.org (cada 6h) → GET /api/scrape?token=...
                                    ↓
Browser → Vercel (Next.js frontend + NextAuth + Stripe checkout)
                ↓ HTTP (Bearer token)
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
- `INTERNAL_TOKEN` — token para llamadas server-to-server (upgrade/downgrade)

### Railway (Backend)
- `SCRAPE_TOKEN` — token secreto para el endpoint de scraping (tambien usado como INTERNAL_TOKEN)

### cron-job.org
- URL: `https://remote-job-scraper-production-2b9c.up.railway.app/api/scrape?token=TU_TOKEN`
- Schedule: `0 */6 * * *` (cada 6 horas)
- Notificaciones: activadas en caso de fallo

---

## Bugs resueltos (sprint dia 1-2)

| Bug | Causa | Fix |
|-----|-------|-----|
| Users in-memory | Frontend usaba almacenamiento volatil | Migrado a SQLite en Railway backend |
| Passwords en texto plano | Sin hashing | bcrypt 12 rounds |
| better-sqlite3 en Vercel | Native module incompatible con serverless | Eliminado, backend via HTTP |
| Vercel no redesplegaba | Auto-deploy no funciona con subdirectorio | Deploy manual con `vercel --prod` |
| StripeConnectionError | STRIPE_PRICE_ID tenia trailing newline | `.trim()` en todas las env vars |
| "You must be logged in" | getServerSession incompatible con Next.js 16 | Email desde client session en POST body |
| "Not a valid URL" | `headers()` vacios en Vercel serverless | `new URL(request.url).origin` |
| payment_method_types conflict | Stripe auto-payment-methods por defecto | Eliminado parametro |
| DB se perdia entre deploys | Railway filesystem efimero | Volumen persistente `/app/data` |
| Seed DB no cargaba | Volume mount sobreescribia `data/` | Seed movido a `seeds/` |
| Scrape timeout 502 | Scraping tardaba mas que proxy timeout | Background task con `asyncio.create_task` |
| Upgrade/downgrade sin auth | Endpoints publicos | Bearer token (INTERNAL_TOKEN) |
| CORS abierto | `allow_origins=["*"]` | Restringido a frontend URL |
| User data expuesto | `/api/users/status` publico | Endpoint eliminado |

---

## PENDIENTE

### Funcionalidad
- [ ] Google OAuth setup
- [ ] Email alerts para Pro users
- [ ] Custom domain

### Seguridad (cuando crezca)
- [ ] **Rate limiting en `/api/users/register` y `/api/users/verify`** — Actualmente no hay limite de peticiones. Con pocos usuarios no es critico, pero cuando haya >100 usuarios activos, añadir rate limiting para prevenir: (1) brute force de passwords en /verify, (2) spam de registros en /register. Opciones: slowapi (FastAPI middleware), o Cloudflare rate limiting si se usa custom domain.
- [ ] Rotacion periodica de tokens (SCRAPE_TOKEN, INTERNAL_TOKEN)

---

## Metricas actuales

| Metrica | Valor |
|---------|-------|
| Total Jobs | 921 |
| No-Phone Jobs | 192 (20.8%) |
| Con Salary | 321 (34.8%) |
| Fuentes | 5 (RemoteOK, WWR, Reddit, Indeed, Glassdoor) |
| Usuarios registrados | 2 (test) |
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
