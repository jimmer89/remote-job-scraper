# 🎯 MASTERPLAN - Remote Job Scraper

## Visión

Crear un agregador de trabajos remotos que:
1. Recopile ofertas de múltiples fuentes automáticamente
2. Filtre y categorice trabajos "Lazy Girl Jobs" (no-phone, chat support, data entry, etc.)
3. Proporcione una base de datos limpia y estructurada
4. Pueda servir como backend para una plataforma de búsqueda de empleo

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      REMOTE JOB SCRAPER                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ RemoteOK │   │ WeWork   │   │  Indeed  │   │  Reddit  │ │
│  │   API    │   │ Remotely │   │ Scraper  │   │ Scraper  │ │
│  └────┬─────┘   └────┬─────┘   └────┬─────┘   └────┬─────┘ │
│       │              │              │              │        │
│       └──────────────┴──────────────┴──────────────┘        │
│                          │                                   │
│                          ▼                                   │
│                 ┌─────────────────┐                         │
│                 │   Normalizer    │                         │
│                 │  (clean data)   │                         │
│                 └────────┬────────┘                         │
│                          │                                   │
│                          ▼                                   │
│                 ┌─────────────────┐                         │
│                 │   Categorizer   │                         │
│                 │  (tags, types)  │                         │
│                 └────────┬────────┘                         │
│                          │                                   │
│                          ▼                                   │
│                 ┌─────────────────┐                         │
│                 │    Database     │                         │
│                 │   (SQLite/PG)   │                         │
│                 └────────┬────────┘                         │
│                          │                                   │
│           ┌──────────────┼──────────────┐                   │
│           ▼              ▼              ▼                   │
│     ┌──────────┐  ┌──────────┐  ┌──────────┐               │
│     │   API    │  │  Export  │  │  Alerts  │               │
│     │ (REST)   │  │ (JSON/CSV)│  │ (Email)  │               │
│     └──────────┘  └──────────┘  └──────────┘               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Fases del Proyecto

### Fase 1: MVP Scraper ✅ EN PROGRESO
- [x] Setup proyecto y repo GitHub
- [ ] Scraper RemoteOK (API pública)
- [ ] Scraper WeWorkRemotely
- [ ] Normalización de datos
- [ ] Storage en SQLite
- [ ] CLI básico para consultas

### Fase 2: Categorización Inteligente
- [ ] Sistema de tags automático
- [ ] Detección de "no-phone" jobs
- [ ] Clasificación por tipo (support, dev, data entry, etc.)
- [ ] Filtrado por salario/ubicación
- [ ] Detección de duplicados

### Fase 3: Más Fuentes
- [ ] Indeed scraper
- [ ] LinkedIn Jobs (requiere auth)
- [ ] FlexJobs (paid, evaluate)
- [ ] Reddit posts (r/RemoteJobs, r/forhire)
- [ ] Glassdoor
- [ ] AngelList/Wellfound

### Fase 4: API & Exportación
- [ ] REST API para consultas
- [ ] Export a JSON/CSV
- [ ] Webhooks para nuevos trabajos
- [ ] Rate limiting y caching

### Fase 5: Alertas & Notificaciones
- [ ] Email digest (diario/semanal)
- [ ] Telegram/Discord bot
- [ ] RSS feed
- [ ] Filtros personalizados por usuario

### Fase 6: Frontend (Opcional)
- [ ] Landing page con búsqueda
- [ ] Quiz de captación (estilo Remote Route)
- [ ] Dashboard de usuario
- [ ] Monetización (freemium/ads)

---

## 🗂️ Categorías de Trabajos

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

## 📊 Modelo de Datos

```sql
CREATE TABLE jobs (
    id TEXT PRIMARY KEY,           -- hash único
    source TEXT NOT NULL,          -- remoteok, weworkremotely, etc.
    source_id TEXT,                -- ID original de la fuente
    title TEXT NOT NULL,
    company TEXT,
    company_logo TEXT,
    description TEXT,
    location TEXT,                 -- "Remote", "US Only", "Worldwide"
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    url TEXT NOT NULL,
    apply_url TEXT,
    tags TEXT,                     -- JSON array
    category TEXT,                 -- support, dev, data-entry, etc.
    is_no_phone BOOLEAN DEFAULT 0,
    posted_at TIMESTAMP,
    scraped_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

CREATE INDEX idx_jobs_category ON jobs(category);
CREATE INDEX idx_jobs_posted ON jobs(posted_at);
CREATE INDEX idx_jobs_source ON jobs(source);
```

---

## 🔧 Stack Técnico

- **Language**: Python 3.11+
- **HTTP**: `httpx` (async) + `beautifulsoup4`
- **Database**: SQLite (MVP) → PostgreSQL (escala)
- **Scheduling**: Cron / systemd timers
- **API**: FastAPI (fase 4)
- **Deployment**: Docker + VPS / Railway

---

## 📈 Métricas de Éxito

1. **Cobertura**: >500 trabajos únicos en DB
2. **Freshness**: Datos actualizados cada 6h
3. **Accuracy**: >90% categorización correcta
4. **Uptime**: Scraper corriendo sin fallos >7 días

---

## 🚀 Quick Start (cuando esté listo)

```bash
# Instalar dependencias
pip install -r requirements.txt

# Correr scraper una vez
python src/scraper.py

# Consultar trabajos
python src/cli.py list --category support --no-phone

# Exportar a JSON
python src/cli.py export --format json --output jobs.json
```

---

*Última actualización: 2026-02-13*
