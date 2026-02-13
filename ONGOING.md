# 📝 ONGOING - Trabajo en Progreso

Este archivo trackea el estado actual del proyecto y las decisiones tomadas.

---

## 🎯 Estado Actual

**Fase**: 1 - MVP Scraper  
**Última sesión**: 2026-02-13  
**Próximo paso**: Implementar scrapers de RemoteOK y WeWorkRemotely

---

## 📅 Log de Sesiones

### 2026-02-13 - Sesión Inicial

**Contexto**: 
- Jaume vio un video de TikTok sobre "Remote Job Finder" (Remote Route)
- Quiere replicar el concepto pero con valor real
- Objetivo: crear un agregador de trabajos remotos

**Completado**:
- [x] Creado repo GitHub `remote-job-scraper`
- [x] Documentado MASTERPLAN.md con arquitectura y fases
- [x] Creado estructura del proyecto
- [ ] Scraper RemoteOK (en progreso)
- [ ] Scraper WeWorkRemotely

**Decisiones tomadas**:
1. Stack: Python + SQLite (simple, portable)
2. Primera fuente: RemoteOK (tiene API pública JSON)
3. Segunda fuente: WeWorkRemotely (scraping HTML)
4. Categorías principales: "Lazy Girl Jobs" (no-phone, support, data entry)

**Notas**:
- RemoteOK API: `https://remoteok.com/api` - Requiere link back y mención
- WeWorkRemotely: HTML scraping, categorías por URL
- Objetivo MVP: 500+ trabajos en DB, actualizados cada 6h

---

## 🔜 Próximas Tareas

### Inmediato (esta sesión)
1. [ ] Implementar `src/scrapers/remoteok.py`
2. [ ] Implementar `src/scrapers/weworkremotely.py`
3. [ ] Crear `src/database.py` con SQLite
4. [ ] Crear `src/normalizer.py` para limpiar datos
5. [ ] Script principal `src/scraper.py`
6. [ ] Primera ejecución y verificación

### Siguiente sesión
- [ ] CLI para consultas (`src/cli.py`)
- [ ] Sistema de categorización automática
- [ ] Detección de "no-phone" jobs
- [ ] Cron job para actualizaciones

### Backlog
- [ ] Más fuentes (Indeed, Reddit)
- [ ] API REST con FastAPI
- [ ] Sistema de alertas
- [ ] Frontend/landing page

---

## 🐛 Issues Conocidos

*Ninguno por ahora*

---

## 💡 Ideas Parking Lot

- Usar LLM para categorizar trabajos ambiguos
- Scraper de salarios de Glassdoor para enriquecer datos
- Integración con LinkedIn para aplicar automáticamente
- Score de "legitimidad" de ofertas (detectar scams)
- Comparador de salarios por rol/ubicación

---

## 📊 Métricas

| Métrica | Valor | Target |
|---------|-------|--------|
| Jobs en DB | 0 | 500+ |
| Fuentes activas | 0 | 3+ |
| Uptime scraper | N/A | 7+ días |
| Última actualización | - | <6h |

---

*Actualizar este archivo al final de cada sesión de trabajo*
