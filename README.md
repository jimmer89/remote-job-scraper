# 🔍 Remote Job Scraper

Agregador automático de trabajos remotos de múltiples fuentes.

## Features

- 📡 Scraping de múltiples job boards (RemoteOK, WeWorkRemotely, más...)
- 🏷️ Categorización automática de trabajos
- 📞 Filtro especial para "no-phone" jobs
- 💾 Base de datos SQLite portable
- 📤 Exportación a JSON/CSV
- ⏰ Actualizaciones automáticas via cron

## Quick Start

```bash
# Clonar repo
git clone https://github.com/jaume/remote-job-scraper.git
cd remote-job-scraper

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Correr scraper
python src/main.py scrape

# Ver trabajos
python src/main.py list --category support
```

## Estructura

```
remote-job-scraper/
├── src/
│   ├── scrapers/         # Scrapers por fuente
│   │   ├── base.py       # Clase base
│   │   ├── remoteok.py   # RemoteOK API
│   │   └── weworkremotely.py
│   ├── database.py       # SQLite operations
│   ├── normalizer.py     # Data cleaning
│   ├── categorizer.py    # Auto-tagging
│   └── main.py           # CLI entrypoint
├── data/                 # SQLite DB
├── logs/                 # Scraper logs
├── MASTERPLAN.md         # Roadmap completo
├── ONGOING.md            # Estado actual
└── requirements.txt
```

## Fuentes

| Fuente | Método | Estado |
|--------|--------|--------|
| RemoteOK | API JSON | ✅ Implementado |
| WeWorkRemotely | HTML Scraping | ✅ Implementado |
| Indeed | Scraping | 🔜 Planned |
| Reddit | API | 🔜 Planned |

## Categorías

- **Support**: Customer service, chat support, technical support
- **Data Entry**: Forms, spreadsheets, transcription
- **Moderation**: Content moderation, community management
- **VA**: Virtual assistant, admin tasks
- **Dev**: Software development
- **Design**: UI/UX, graphic design
- **Marketing**: SEO, social media, content

## API (Fase 4)

```bash
# Listar trabajos
GET /api/jobs?category=support&no_phone=true&limit=50

# Buscar
GET /api/jobs/search?q=customer+support

# Stats
GET /api/stats
```

## Contributing

PRs welcome. Ver [MASTERPLAN.md](MASTERPLAN.md) para el roadmap.

## License

MIT

---

*Built with 🦜 by PepLlu & Jaume*
