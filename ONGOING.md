# 📝 ONGOING - Trabajo en Progreso

Este archivo trackea el estado actual del proyecto y las decisiones tomadas.

---

## 🎯 Estado Actual

**Fase**: 1 - MVP Scraper  
**Última sesión**: 2026-02-13  
**Próximo paso**: Mejorar parsing de WeWorkRemotely, añadir más fuentes

---

## 📅 Log de Sesiones

### 2026-02-13 - Sesión Inicial ✅

**Contexto**: 
- Jaume vio un video de TikTok sobre "Remote Job Finder" (Remote Route)
- Quiere replicar el concepto pero con valor real
- Objetivo: crear un agregador de trabajos remotos

**Completado**:
- [x] Creado repo GitHub `remote-job-scraper`
- [x] Documentado MASTERPLAN.md con arquitectura y fases
- [x] Creado estructura del proyecto
- [x] Scraper RemoteOK (API JSON) ✅ Funcionando
- [x] Scraper WeWorkRemotely ✅ Funcionando (parsing mejorable)
- [x] Database SQLite con queries
- [x] CLI con comandos: scrape, list, search, stats, export
- [x] Auto-categorización de trabajos
- [x] Detección básica de "no-phone" jobs

**Primera ejecución**:
```
Total: 359 jobs scraped
- RemoteOK: 98 jobs
- WeWorkRemotely: 261 jobs
- No-phone detected: 27
- With salary info: 45
```

**Decisiones tomadas**:
1. Stack: Python + SQLite (simple, portable)
2. Primera fuente: RemoteOK (tiene API pública JSON)
3. Segunda fuente: WeWorkRemotely (scraping HTML)
4. Categorías principales: "Lazy Girl Jobs" (no-phone, support, data entry)

**Issues encontrados**:
- WeWorkRemotely parsing no extrae bien el nombre de empresa (sale "Unknown")
- Necesita mejora en el selector HTML

---

## 🔜 Próximas Tareas

### Siguiente sesión
- [ ] Mejorar scraper WeWorkRemotely (company name, mejor parsing)
- [ ] Añadir más keywords para detectar "no-phone"
- [ ] Scraper de Indeed
- [ ] Scraper de r/RemoteJobs (Reddit)

### Backlog
- [ ] API REST con FastAPI
- [ ] Sistema de alertas por email
- [ ] Frontend/landing page
- [ ] Cron job para actualizaciones automáticas

---

## 🐛 Issues Conocidos

1. **WeWorkRemotely company name**: El parser no extrae bien el nombre de la empresa
   - Prioridad: Media
   - Estado: Pendiente

---

## 💡 Ideas Parking Lot

- Usar LLM para categorizar trabajos ambiguos
- Scraper de salarios de Glassdoor para enriquecer datos
- Integración con LinkedIn para aplicar automáticamente
- Score de "legitimidad" de ofertas (detectar scams)
- Comparador de salarios por rol/ubicación
- Quiz estilo Remote Route para captar leads

---

## 📊 Métricas

| Métrica | Valor | Target |
|---------|-------|--------|
| Jobs en DB | **359** | 500+ |
| Fuentes activas | **2** | 3+ |
| No-phone jobs | **27** | - |
| Jobs con salario | **45** | - |
| Uptime scraper | N/A | 7+ días |

---

*Actualizado: 2026-02-13 22:25*
