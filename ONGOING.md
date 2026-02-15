# ChillJobs - Estado del Proyecto

**Ultima actualizacion:** 2026-02-15

## Estado: LIVE — Stripe checkout FUNCIONANDO

**Frontend:** https://frontend-three-azure-48.vercel.app
**API:** https://remote-job-scraper-production-2b9c.up.railway.app
**GitHub:** https://github.com/jimmer89/remote-job-scraper

---

## Completado (sprint dia 1-2, 14-15 feb)

### Infraestructura
- [x] Backend API en Railway (FastAPI, SQLite)
- [x] Frontend en Vercel (Next.js 16, Tailwind)
- [x] Scraping automatico cada 6h (cron en Railway)
- [x] 1,039 jobs de 5 fuentes (RemoteOK, WWR, Indeed, Glassdoor, Reddit)

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
- [x] Env vars con .trim() para evitar whitespace issues

### Frontend
- [x] Landing page, quiz, pricing, auth pages
- [x] Logica freemium (1 job gratis, resto blurred)
- [x] Error handling en checkout (muestra errores al usuario)
- [x] Checkout envia email desde session del cliente

### Arquitectura final
```
Browser → Vercel (Next.js frontend + NextAuth + Stripe checkout)
                ↓ HTTP
         Railway (FastAPI backend + SQLite)
                → jobs table (scrapers)
                → users table (auth + pro status)
```

---

## Bugs resueltos durante el debug de Stripe

| Bug | Causa | Fix |
|-----|-------|-----|
| Checkout 500 generico | Vercel auto-deploy no funcionaba | Deploy manual con `vercel --prod` |
| StripeConnectionError | STRIPE_PRICE_ID tenia trailing newline | `.trim()` en todas las env vars |
| "You must be logged in" | getServerSession incompatible con Next.js 16 (cookies() async) | Email desde client session en POST body |
| "Not a valid URL" | `headers()` devuelve vacios en Vercel serverless | `new URL(request.url).origin` |
| payment_method_types conflict | Stripe auto-payment-methods habilitado por defecto | Eliminado `payment_method_types` del checkout |

---

## PENDIENTE

### Funcionalidad
- [ ] Verificar que webhook Stripe→backend upgradea el usuario a Pro correctamente
- [ ] Probar flujo completo: register → login → pay → user becomes Pro → unlock all jobs
- [ ] Google OAuth setup
- [ ] Email alerts para Pro users
- [ ] Custom domain

### Seguridad
- [ ] CORS abierto (*) — aceptable por ahora
- [ ] Sin rate limiting en API

---

## Metricas actuales

| Metrica | Valor |
|---------|-------|
| Total Jobs | 1,039 |
| No-Phone Jobs | 254 (24.5%) |
| Con Salary | 441 (42.4%) |
| Fuentes | 5 |
| Usuarios registrados | 1+ (test) |
| Pro subscribers | 0 (test payment) |
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
```

---

*Actualizado: 2026-02-15*
