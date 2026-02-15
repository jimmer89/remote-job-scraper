# MASTERPLAN - ChillJobs

## Vision

Plataforma freemium de trabajos remotos que agrega ofertas de multiples fuentes, filtra "Lazy Girl Jobs" (no-phone, chat support, data entry) y monetiza con suscripcion Pro ($9.99/mes).

---

## Arquitectura actual (LIVE)

```
cron-job.org (cada 6h) --> GET /api/scrape?token=...
                                    |
Browser --> Vercel (Next.js 16 + NextAuth + Stripe checkout)
                | HTTP (Bearer token)
         Railway (FastAPI + SQLite + volumen persistente /app/data)
                --> jobs table (921 jobs, 5 fuentes)
                --> users table (auth + pro status)
                --> scrape_log table (historial)
```

**URLs:**
- Frontend: https://frontend-three-azure-48.vercel.app
- API: https://remote-job-scraper-production-2b9c.up.railway.app
- GitHub: https://github.com/jimmer89/remote-job-scraper

---

## Estado por fases

### Fase 1: Scraping y datos -- COMPLETADA
- [x] Scrapers: RemoteOK, WeWorkRemotely, Indeed, Glassdoor, Reddit
- [x] Normalizacion y categorization automatica
- [x] Deteccion de no-phone jobs
- [x] SQLite con volumen persistente en Railway
- [x] Scraping automatico cada 6h via cron-job.org
- [x] 921 jobs en DB, 192 no-phone (20.8%), 321 con salary (34.8%)

### Fase 2: API REST -- COMPLETADA
- [x] FastAPI con endpoints: /api/jobs, /api/stats, /api/categories, /api/sources
- [x] Filtros: category, source, no_phone, has_salary, search
- [x] Paginacion (limit/offset)
- [x] Endpoint /api/lazy-girl-jobs
- [x] Endpoint /api/scrape (protegido con SCRAPE_TOKEN)
- [x] Endpoint /api/scrape/status

### Fase 3: Frontend y auth -- COMPLETADA
- [x] Next.js 16 + Tailwind en Vercel
- [x] Landing page, quiz, pricing
- [x] Auth con NextAuth (email/password)
- [x] Registro y login funcional
- [x] Passwords hasheados con bcrypt (12 rounds)
- [x] Logica freemium (1 job gratis, resto blurred)

### Fase 4: Monetizacion -- COMPLETADA
- [x] Stripe checkout ($9.99/mes suscripcion)
- [x] Webhook de Stripe -> upgrade automatico a Pro
- [x] Downgrade automatico on cancellation

### Fase 5: Seguridad -- AUDITADA
- [x] CORS restringido a frontend legitimo
- [x] /api/users/upgrade y /downgrade protegidos con Bearer token
- [x] /api/scrape protegido con SCRAPE_TOKEN
- [x] Webhook verifica firma de Stripe
- [x] SQL parametrizado (sin inyeccion)
- [x] Secrets en variables de entorno
- [x] Endpoint debug /api/users/status eliminado

---

## PROXIMOS PASOS (por prioridad)

### P1: Ser descubrible (sin trafico no hay negocio)

**1. Custom domain**
- Comprar dominio (chilljobs.com o similar)
- Configurar en Vercel (Settings > Domains)
- Actualizar CORS en backend con nuevo dominio
- Actualizar Stripe webhook URL
- Prioridad: CRITICA — nadie confia en `frontend-three-azure-48.vercel.app`

**2. SEO basico**
- Meta tags (title, description) en todas las paginas
- Open Graph tags para compartir en redes
- sitemap.xml dinamico (paginas + categorias)
- robots.txt
- Structured data (JobPosting schema de Google)
- Prioridad: CRITICA — sin esto Google no indexa

**3. Analytics**
- Instalar Plausible, Umami o Google Analytics
- Eventos: visitas, registros, conversiones a Pro, clicks en jobs
- Prioridad: ALTA — necesitas saber si alguien llega y que hace

### P2: Convertir visitantes (reducir friccion)

**4. Google OAuth**
- Crear proyecto en Google Cloud Console
- Configurar OAuth consent screen
- Añadir GoogleProvider en auth.ts (ya esta preparado, falta clientId/clientSecret)
- Prioridad: ALTA — la mayoria no creara cuenta con email/password en un sitio nuevo

**5. Landing page polish**
- Copy orientado a beneficios, no features
- Social proof (testimonios, numeros: "921 remote jobs de 5 fuentes")
- CTAs claros en cada seccion
- Mobile-first review
- Prioridad: MEDIA

### P3: Retener y monetizar (justificar el Pro)

**6. Email alerts para Pro users**
- Email digest diario o semanal con jobs nuevos que matcheen sus filtros
- Servicio: Resend, SendGrid o Amazon SES
- Backend: nuevo endpoint + cron job para enviar digests
- Es el killer feature de Pro — "recibe los mejores jobs en tu inbox antes que nadie"
- Prioridad: ALTA — es lo que justifica pagar $9.99/mes

**7. Mas fuentes de jobs**
- LinkedIn Jobs (requiere auth/API)
- FlexJobs (evaluar scraping vs partnership)
- Wellfound/AngelList (scraper ya existe, mejorar)
- Mas volumen = mas valor para el usuario
- Prioridad: MEDIA

### P4: Escalar (cuando haya traccion)

**8. Rate limiting**
- slowapi (FastAPI middleware) o Cloudflare rate limiting
- Proteger /api/users/register y /api/users/verify contra brute force
- Implementar cuando >100 usuarios activos
- Prioridad: BAJA (por ahora)

**9. Token rotation**
- Rotacion periodica de SCRAPE_TOKEN e INTERNAL_TOKEN
- Prioridad: BAJA

**10. Performance**
- Caching de respuestas (Redis o in-memory)
- Migracion a PostgreSQL si SQLite se queda corto
- CDN para assets estaticos
- Prioridad: BAJA

---

## Stack tecnico

| Componente | Tecnologia | Donde |
|-----------|-----------|-------|
| Backend API | FastAPI + Python 3.12 | Railway |
| Base de datos | SQLite (volumen persistente) | Railway /app/data |
| Frontend | Next.js 16 + Tailwind | Vercel |
| Auth | NextAuth v4 (JWT) | Vercel |
| Pagos | Stripe (checkout + webhooks) | Stripe |
| Scraping | httpx + BeautifulSoup + JobSpy | Railway |
| Scheduling | cron-job.org (cada 6h) | Externo |

---

## Categorias de trabajos

### "Lazy Girl Jobs" (target principal)
- **No-Phone**: Chat support, email support, async communication
- **Content Moderation**: Social media, community management
- **Data Entry**: Forms, spreadsheets, transcription
- **Virtual Assistant**: Admin tasks, scheduling, research
- **Writing**: Copywriting, content, documentation

### Tech Jobs
- **Development**: Frontend, backend, fullstack
- **Design**: UI/UX, graphic design
- **DevOps**: Cloud, infrastructure
- **QA**: Testing, automation

### Other Remote
- **Sales**: SDR, account management
- **Marketing**: SEO, social media, ads
- **HR**: Recruiting, people ops
- **Finance**: Accounting, bookkeeping

---

## Metricas actuales

| Metrica | Valor | Objetivo |
|---------|-------|----------|
| Total Jobs | 921 | >2000 |
| No-Phone Jobs | 192 (20.8%) | >500 |
| Con Salary | 321 (34.8%) | >50% |
| Fuentes | 5 | 8+ |
| Usuarios registrados | 2 (test) | 100 |
| Pro subscribers | 0 | 10 |
| Ingresos | $0 | $99.90/mes (10 subs) |
| Trafico mensual | 0 | 1000 visitas |

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
# Frontend (auto-deploy de Vercel NO funciona con subdirectorio)
cd ~/projects/remote-job-scraper/frontend
/home/jaume/.npm-global/bin/vercel --prod

# Backend
cd ~/projects/remote-job-scraper
/home/jaume/.npm-global/bin/railway up --detach
```

---

*Ultima actualizacion: 2026-02-15*
