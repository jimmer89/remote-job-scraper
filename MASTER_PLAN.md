# ChillJobs - Master Plan

> **Mision:** Job board de trabajos remotos sin llamadas telefonicas.
> **Estado:** Live pero no monetizable. Sprint de 1 semana para lanzar.

---

## Documentos del Proyecto

| Documento | Contenido |
|-----------|-----------|
| **MASTER_PLAN.md** | Este archivo — resumen ejecutivo |
| **AUDIT_2026-02-14.md** | Auditoria honesta — problemas, veredicto, decision |
| **ACTION_PLAN.md** | Sprint de 1 semana dia por dia |
| **ONGOING.md** | Estado actual detallado |
| **BUSINESS_PLAN.md** | Modelo de negocio y proyecciones (pre-auditoria) |
| **MARKETING_PLAN.md** | Estrategia de growth y canales |

---

## Quick Facts

| Item | Valor |
|------|-------|
| Nombre | ChillJobs |
| Tagline | "Remote Jobs. No Calls Required." |
| Modelo | Freemium B2C |
| Precio Pro | $9.99/mes o $79/ano |
| Estado | Live, 1,039 jobs, 0 usuarios, 0 revenue |
| Objetivo sprint | Poder cobrar + lanzar para 21 feb 2026 |

---

## URLs

| Servicio | URL | Estado |
|----------|-----|--------|
| Frontend | https://frontend-three-azure-48.vercel.app | Live (URL temporal) |
| API | https://remote-job-scraper-production-2b9c.up.railway.app | Live |
| API Docs | .../docs | Live |
| GitHub | https://github.com/jimmer89/remote-job-scraper | Live |
| Dominio propio | Pendiente de configurar | Bloqueante |

---

## Estado real post-auditoria (14 feb 2026)

### Funciona
- [x] Backend API completa (FastAPI + SQLite)
- [x] 1,039 jobs de 5 fuentes, actualizados cada 6h
- [x] Frontend moderno (Next.js 16 + Tailwind)
- [x] Logica freemium (1 job gratis, resto blurred)
- [x] Auth basico (NextAuth email/password)
- [x] Deploy automatico (Vercel + Railway)
- [x] 254 jobs no-phone, 441 con salario

### Roto (bloqueante)
- [ ] **Stripe** — sin API keys, no se puede cobrar
- [ ] **User persistence** — in-memory, se pierde al restart
- [ ] **Passwords** — texto plano (bcryptjs sin usar)
- [ ] **Dominio** — URL de desarrollo
- [ ] **NextAuth secret** — hardcoded

### Pendiente (nice to have)
- [ ] Google OAuth
- [ ] Email alerts para Pro users
- [ ] Saved jobs feature
- [ ] Blog/SEO content
- [ ] Social media accounts

---

## Modelo de negocio

```
FREE                              PRO ($9.99/mes)
─────────────────────────────     ─────────────────────────────
 1 job visible por busqueda        Jobs ilimitados
 Filtros basicos                   Filtro no-phone
 Sin alertas                       Filtro por salario
 Con ads                           Email alerts
                                   Sin ads
                                   24h early access
```

### Revenue streams realistas (Year 1)
| Canal | Estimacion |
|-------|-----------|
| Pro subs | $500-2K/mes |
| Afiliados | $500-2K/mes |
| Ads | $100-500/mes |
| **Total** | **$5K-20K Year 1** |

---

## Sprint actual: 14-21 feb 2026

**Objetivo:** Un usuario puede registrarse, pagar $9.99, y acceder a Pro.

| Dia | Tarea | Tiempo |
|-----|-------|--------|
| 1 | Stripe + hash passwords + secret | 1h |
| 2 | Migrar users a DB persistente | 4-6h |
| 3 | Dominio + Google OAuth | 45 min |
| 4 | Email alerts (killer feature Pro) | 4h |
| 5 | Test E2E + limpieza | 3h |
| 6-7 | Lanzamiento (Reddit, PH, HN, X) | 2h |

### Decision post-sprint
- **Traccion (>50 registros, >5 Pro):** Seguir con marketing organico
- **Sin traccion:** Pausar, centrarse en chatbot.deals

Ver [ACTION_PLAN.md](./ACTION_PLAN.md) para detalles.

---

## Principios

1. **1 semana max** — si no hay traccion, no insistir
2. **Revenue first** — no mas docs ni features sin usuarios pagando
3. **Evaluar con datos** — no con esperanza

---

*Actualizado: 2026-02-14 (post-auditoria)*
