# ChillJobs - Estado del Proyecto

**Ultima actualizacion:** 2026-02-14 (post-auditoria)

## Estado: LIVE pero NO monetizable

**Frontend:** https://frontend-three-azure-48.vercel.app
**API:** https://remote-job-scraper-production-2b9c.up.railway.app
**GitHub:** https://github.com/jimmer89/remote-job-scraper

---

## Completado

### Infraestructura
- [x] Backend API en Railway (FastAPI, SQLite)
- [x] Frontend en Vercel (Next.js 16, Tailwind)
- [x] Scraping automatico cada 6h (cron en Railway)
- [x] 1,039 jobs de 5 fuentes (RemoteOK, WWR, Indeed, Glassdoor, Reddit)
- [x] 254 jobs no-phone detectados (24.5%)
- [x] 441 jobs con salario (42.4%)

### Frontend
- [x] Landing page con hero, CTAs, categorias
- [x] Sistema de busqueda y filtros
- [x] Quiz interactivo de matching
- [x] Pagina de pricing (Free vs Pro)
- [x] Modal de upgrade para free users
- [x] Cards bloqueadas/blurred para free tier
- [x] Responsive (movil + desktop)

### Auth
- [x] NextAuth con email/password
- [x] Sesiones JWT
- [x] Logica freemium (isPro flag)

### Stripe (solo estructura)
- [x] Endpoint de checkout creado
- [x] Webhook de suscripcion creado
- [x] Pagina de success con confetti

---

## ROTO / Bloqueante

### Stripe — NO se puede cobrar
- API keys NO configuradas en Vercel
- Checkout devuelve error 500
- **Resultado:** Revenue = $0 imposible de cambiar

### Auth — Usuarios se pierden
- Usuarios almacenados en `Map()` (JavaScript in-memory)
- Cada restart de Railway borra todos los registros
- Passwords en TEXTO PLANO (bcryptjs instalado pero no usado)
- **Resultado:** Uso real imposible

### Dominio — URL de desarrollo
- URL actual es `frontend-three-azure-48.vercel.app`
- **Resultado:** Zero credibilidad para cobrar

### NextAuth secret — Hardcoded
- Secret por defecto en produccion
- Session hijacking posible

### Google OAuth — Sin credenciales
- Boton visible pero no funcional

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

### Distribucion por fuente
| Fuente | Jobs |
|--------|------|
| Indeed (JobSpy) | 429 |
| WeWorkRemotely | 336 |
| RemoteOK | 112 |
| Reddit | 112 |
| Glassdoor (JobSpy) | 50 |

### Distribucion por categoria
| Categoria | Jobs |
|-----------|------|
| Other | 472 |
| Dev | 195 |
| Support | 181 |
| Sales | 56 |
| Marketing | 51 |
| Design | 51 |
| VA | 12 |
| Writing | 11 |
| Moderation | 5 |
| HR | 4 |
| Data Entry | 1 |

---

## Sprint de 1 semana (14-21 feb 2026)

Ver [ACTION_PLAN.md](./ACTION_PLAN.md) para el sprint detallado dia por dia.

**Objetivo:** Dejar el producto listo para cobrar y lanzar.
**Decision post-sprint:** Si hay traccion, seguir. Si no, pausar.

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

---

## Seguridad — Issues abiertos

| Issue | Severidad | Fix estimado |
|-------|-----------|-------------|
| Passwords en texto plano | CRITICA | 30 min |
| NextAuth secret hardcoded | ALTA | 5 min |
| CORS abierto (*) | MEDIA | 5 min |
| Sin rate limiting en API | BAJA | 2h |
| Sin validacion de input en endpoints | BAJA | 1h |

---

*Actualizado: 2026-02-14 (post-auditoria)*
