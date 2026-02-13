# 📝 ONGOING - Trabajo en Progreso

Este archivo trackea el estado actual del proyecto y las decisiones tomadas.

---

## 🎯 Estado Actual

**Fase**: 1 - MVP Scraper ✅ COMPLETADO  
**Última sesión**: 2026-02-13  
**Próximo paso**: Mejorar detección de "no-phone", añadir más fuentes, frontend

---

## 📅 Log de Sesiones

### 2026-02-13 - Sesión 2 ✅

**Completado**:
- [x] Mejorado scraper WeWorkRemotely (extrae company names correctamente)
- [x] Añadido scraper de Indeed (anti-scraping detectado, 0 resultados)
- [x] Añadido scraper de Reddit (r/remotejobs, r/forhire, r/WorkOnline)
- [x] API REST con FastAPI funcionando
- [x] Cron job configurado (cada 6 horas)

**Resultados actuales**:
```
Total: 513 jobs activos
- RemoteOK: 98 jobs
- WeWorkRemotely: 326 jobs  
- Reddit: 89 jobs
- Indeed: 0 (blocked)

No-phone detectados: 53
Con salario: 92
```

**Endpoints API**:
- `GET /api/jobs` - Listar con filtros
- `GET /api/jobs?no_phone=true` - Solo no-phone
- `GET /api/jobs?category=support` - Por categoría
- `GET /api/lazy-girl-jobs` - "Lazy Girl Jobs"
- `GET /api/stats` - Estadísticas
- `GET /api/categories` - Categorías
- `GET /api/sources` - Fuentes

**Cron configurado**: `0 */6 * * *` (cada 6h)

---

### 2026-02-13 - Sesión 1 ✅

**Completado**:
- [x] Creado repo GitHub `remote-job-scraper`
- [x] Documentado MASTERPLAN.md con arquitectura y fases
- [x] Scraper RemoteOK (API JSON) funcionando
- [x] Scraper WeWorkRemotely funcionando
- [x] Database SQLite con queries
- [x] CLI con comandos: scrape, list, search, stats, export
- [x] Auto-categorización de trabajos
- [x] Detección básica de "no-phone" jobs

---

## 🔜 Próximas Tareas

### Prioridad Alta
- [ ] Mejorar detección de "no-phone" (más keywords, NLP)
- [ ] Fix Indeed scraper (proxies o API alternativa)
- [ ] Añadir más fuentes (FlexJobs, Glassdoor, AngelList)

### Prioridad Media
- [ ] Frontend/landing page con Next.js
- [ ] Sistema de alertas por email
- [ ] Quiz de captación estilo Remote Route

### Backlog
- [ ] Docker para deployment
- [ ] Deploy API a Railway/Render
- [ ] Integración con Telegram bot

---

## 🐛 Issues Conocidos

1. **Indeed blocked**: Anti-scraping activo, devuelve 0 resultados
   - Solución: Proxies rotativos o buscar API alternativa
   - Prioridad: Media

2. **Reddit company extraction**: No siempre extrae bien el nombre
   - Prioridad: Baja

---

## 💡 Ideas Parking Lot

- Usar LLM para categorizar trabajos ambiguos
- Score de "legitimidad" de ofertas (detectar scams)
- Comparador de salarios por rol/ubicación
- RSS feed para suscriptores
- Newsletter automatizada
- Afiliados con plataformas de formación

---

## 📊 Métricas

| Métrica | Valor | Target |
|---------|-------|--------|
| Jobs en DB | **513** ✅ | 500+ |
| Fuentes activas | **3** ✅ | 3+ |
| No-phone jobs | **53** | - |
| Jobs con salario | **92** | - |
| API endpoints | **7** | - |
| Cron activo | **Sí** ✅ | - |

---

## 🛠️ Quick Reference

```bash
# Activar entorno
cd ~/projects/remote-job-scraper
source venv/bin/activate

# Scrape
python src/main.py scrape

# CLI queries
python src/main.py list --category support --no-phone
python src/main.py search --query "chat"
python src/main.py stats
python src/main.py export --format json

# API (puerto 8000)
uvicorn src.api:app --reload --port 8000

# Endpoints útiles
curl localhost:8000/api/stats
curl "localhost:8000/api/jobs?no_phone=true&limit=10"
curl localhost:8000/api/lazy-girl-jobs
```

---

*Actualizado: 2026-02-13 22:43*
