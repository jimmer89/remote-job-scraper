# ChillJobs - Estado del Proyecto

**Ultima actualizacion:** 2026-02-15

## Estado: LIVE — Stripe checkout pendiente de debug

**Frontend:** https://frontend-three-azure-48.vercel.app
**API:** https://remote-job-scraper-production-2b9c.up.railway.app
**GitHub:** https://github.com/jimmer89/remote-job-scraper

---

## Completado (sprint dia 1, 14-15 feb)

### Infraestructura
- [x] Backend API en Railway (FastAPI, SQLite)
- [x] Frontend en Vercel (Next.js 16, Tailwind)
- [x] Scraping automatico cada 6h (cron en Railway)
- [x] 1,039 jobs de 5 fuentes (RemoteOK, WWR, Indeed, Glassdoor, Reddit)

### Auth — ARREGLADO
- [x] Usuarios persistentes en SQLite (Railway backend)
- [x] Passwords hasheados con bcrypt (12 rounds)
- [x] NextAuth secret configurado (variable de entorno en Vercel)
- [x] Endpoints backend: `/api/users/register`, `/api/users/verify`, `/api/users/upgrade`, `/api/users/downgrade`
- [x] Frontend auth.ts llama al backend via HTTP (no more in-memory, no more better-sqlite3)

### Stripe — Keys configuradas
- [x] Cuenta Stripe creada
- [x] Producto creado: ChillJobs Pro $9.99/mes (price_1T0rU6HVbIehUQTDdxOsdOp5)
- [x] API keys configuradas en Vercel (STRIPE_SECRET_KEY, STRIPE_PRICE_ID)
- [x] Webhook creado en Stripe Dashboard (STRIPE_WEBHOOK_SECRET configurado en Vercel)
- [x] NEXTAUTH_SECRET configurado en Vercel

### Frontend
- [x] Landing page, quiz, pricing, auth pages
- [x] Logica freemium (1 job gratis, resto blurred)
- [x] Error handling en checkout (muestra errores al usuario)
- [x] Checkout route usa headers para derivar base URL (no depende de NEXTAUTH_URL)

### Arquitectura final (post-fix)
```
Browser → Vercel (Next.js frontend + NextAuth + Stripe checkout)
                ↓ HTTP
         Railway (FastAPI backend + SQLite)
                → jobs table (scrapers)
                → users table (auth + pro status)
```

---

## PENDIENTE: Stripe checkout devuelve 500

### Sintoma
- Usuario se registra OK (backend confirm)
- Login funciona OK (JWT session)
- Click "Upgrade Now" → Loading... → 500 Internal Server Error
- Error en `/api/checkout` endpoint

### Que se ha descartado
- Stripe keys: configuradas en Vercel (STRIPE_SECRET_KEY, STRIPE_PRICE_ID, STRIPE_WEBHOOK_SECRET)
- NEXTAUTH_SECRET: configurado en Vercel
- Backend endpoints: funcionando (verificado con curl)
- better-sqlite3: eliminado del frontend (era incompatible con Vercel serverless)
- Base URL: checkout route ahora deriva la URL de los headers del request

### Posibles causas a investigar
1. **Session JWT no valida** — la sesion se creo antes de cambiar NEXTAUTH_SECRET, puede que el JWT antiguo no se verifique con el nuevo secret. Probar: borrar cookies del navegador completamente, registrarse de nuevo.
2. **Vercel no ha redesplegado** — verificar que el ultimo commit (9d305d0) esta desplegado en Vercel. Ir a Vercel Dashboard → Deployments y confirmar.
3. **Error en Stripe API** — puede que las test keys no esten habilitadas o el price_id no sea valido. Probar: hacer un curl directo al endpoint con las keys.
4. **CORS issue** — el frontend en Vercel llama al backend en Railway, puede que CORS bloquee. Verificar en Network tab si hay errores CORS.

### Como debuggear
1. Borrar TODAS las cookies del navegador para la URL de Vercel
2. Registrarse de nuevo
3. En Network tab (no Console), hacer click en la peticion `checkout` fallida
4. Ver Response body — contendra el mensaje de error especifico
5. Alternativamente, ir a Vercel Dashboard → Logs → buscar errores del endpoint checkout

---

## Metricas actuales

| Metrica | Valor |
|---------|-------|
| Total Jobs | 1,039 |
| No-Phone Jobs | 254 (24.5%) |
| Con Salary | 441 (42.4%) |
| Fuentes | 5 |
| Usuarios registrados | 0 |
| Pro subscribers | 0 |
| Ingresos | $0 |

---

## Seguridad — Resuelto vs Pendiente

| Issue | Estado |
|-------|--------|
| Passwords en texto plano | RESUELTO — bcrypt 12 rounds |
| NextAuth secret hardcoded | RESUELTO — env var en Vercel |
| Users in-memory | RESUELTO — SQLite en Railway |
| CORS abierto (*) | Pendiente (aceptable por ahora) |
| Sin rate limiting en API | Pendiente |

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
# Frontend: auto-deploy via Vercel on git push
# Backend: manual deploy via Railway CLI
cd ~/projects/remote-job-scraper
/home/jaume/.npm-global/bin/railway up --detach

# O forzar redeploy:
/home/jaume/.npm-global/bin/railway redeploy --yes
```

---

*Actualizado: 2026-02-15*
