# ChillJobs - Estado del Proyecto

**Última actualización:** 2026-02-14 22:35

## 🟢 Estado: LIVE

**URL Producción:** https://frontend-three-azure-48.vercel.app
**API:** https://remote-job-scraper-production-2b9c.up.railway.app

## ✅ Completado

### Infraestructura
- [x] Backend API en Railway
- [x] Frontend en Vercel
- [x] Base de datos SQLite con jobs
- [x] Scraping automático cada 6h (cron en Railway)

### Frontend
- [x] Rediseño completo con branding ChillJobs
- [x] Landing page con hero, CTAs, categorías
- [x] Sistema de búsqueda y filtros
- [x] Quiz de matching
- [x] Página de pricing
- [x] Página de login/registro
- [x] Modal de upgrade
- [x] Cards bloqueadas para free users
- [x] Navegación con historial (botón atrás)

### Autenticación
- [x] NextAuth configurado
- [x] Login con email/password
- [x] Registro de usuarios
- [x] Sesiones JWT

### Modelo Freemium
- [x] Free: 1 job visible
- [x] Pro: Jobs ilimitados + filtros avanzados
- [x] Filtros No-Phone y Salary bloqueados para free
- [x] UI de upgrade

### Stripe (estructura)
- [x] Endpoint de checkout
- [x] Webhook de suscripción
- [x] Página de éxito

## 🔴 Pendiente

### Alta Prioridad
- [ ] **Configurar Stripe** - Añadir API keys reales
- [ ] **Dominio personalizado** - Jaume ya lo tiene
- [ ] **Base de datos de usuarios** - Ahora es in-memory

### Media Prioridad
- [ ] Google OAuth - Credenciales de Google Cloud
- [ ] Email alerts para nuevos jobs
- [ ] Guardar favoritos

### Baja Prioridad
- [ ] Newsletter funcional
- [ ] SEO mejorado
- [ ] Dark mode
- [ ] PWA / App móvil

## 📊 Métricas Actuales

- **Total Jobs:** ~1,039
- **No-Phone Jobs:** ~254
- **Con Salary:** ~441
- **Sources:** 5 (RemoteOK, WWR, Reddit, Indeed, Glassdoor)

## 🔧 Para Desarrollar Localmente

```bash
# Backend
cd ~/projects/remote-job-scraper
source venv/bin/activate
python -m uvicorn src.api:app --port 8000

# Frontend
cd frontend
npm run dev
```

## 📝 Notas

- Los usuarios se guardan en memoria (Map en auth.ts) - se pierden al reiniciar
- Para persistir usuarios, migrar a SQLite o Postgres
- El botón "Continue with Google" está visible pero no funciona sin credenciales
