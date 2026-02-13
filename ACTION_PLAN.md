# 🚀 ChillJobs - Plan de Acción

**Decisiones tomadas:**
- ✅ Nombre: **ChillJobs**
- ✅ Modelo: **Freemium desde el principio**
- ✅ Enfoque: **B2C (usuarios)**

---

## 📅 Semana 1: Fundamentos

### Día 1-2: Dominio y Branding
- [ ] Comprar dominio (verificar disponibilidad):
  - Opción 1: `chilljobs.com` (~$12/año)
  - Opción 2: `chilljobs.co` (~$25/año)
  - Opción 3: `chilljobs.io` (~$35/año)
  - Opción 4: `getchilljobs.com` (si .com está tomado)
- [ ] Crear logo en Canva/Figma
- [ ] Definir paleta de colores:
  ```
  Primary: #7C3AED (purple chill)
  Secondary: #10B981 (mint green)
  Accent: #F59E0B (warm yellow)
  Background: #F8FAFC (soft white)
  ```
- [ ] Elegir mascota/icono (sloth? chill cat?)

### Día 3-4: Rebrand Frontend
- [ ] Cambiar título y meta tags
- [ ] Actualizar logo/header
- [ ] Añadir footer con links
- [ ] Actualizar colores Tailwind
- [ ] Añadir página "About"

### Día 5-7: Email Capture + Analytics
- [ ] Integrar email capture (ConvertKit free / Resend)
- [ ] Añadir Google Analytics / Plausible
- [ ] Crear popup/banner para newsletter
- [ ] Configurar dominio en Vercel

---

## 📅 Semana 2: Freemium MVP

### Límites Free Tier
```javascript
FREE_LIMITS = {
  jobsPerDay: 10,
  alertsEnabled: false,
  newJobsDelay: '24h',
  savedJobs: 5,
  searchHistory: false,
  ads: true
}

PRO_FEATURES = {
  jobsPerDay: Infinity,
  alertsEnabled: true,
  newJobsDelay: '0h', // instant
  savedJobs: Infinity,
  searchHistory: true,
  ads: false,
  price: '$9.99/month or $79/year'
}
```

### Implementación
- [ ] Sistema de auth (Clerk / NextAuth / Supabase)
- [ ] Contador de jobs vistos por día
- [ ] UI de "upgrade to Pro" cuando llega al límite
- [ ] Página de pricing
- [ ] Guardar jobs favoritos (localStorage para free, sync para pro)

---

## 📅 Semana 3: Pagos

### Stripe Integration
- [ ] Crear cuenta Stripe
- [ ] Configurar productos:
  - ChillJobs Pro Monthly: $9.99
  - ChillJobs Pro Yearly: $79 (33% descuento)
- [ ] Checkout page
- [ ] Webhook para activar pro
- [ ] Customer portal (manage subscription)

### Páginas necesarias
- [ ] `/pricing` - Comparación Free vs Pro
- [ ] `/checkout` - Stripe checkout
- [ ] `/account` - Gestión de suscripción
- [ ] `/success` - Post-pago

---

## 📅 Semana 4: Launch

### Pre-Launch (3-5 días antes)
- [ ] Preparar assets para Product Hunt
- [ ] Escribir post para Reddit (r/remotejobs, r/SideProject)
- [ ] Crear thread para Twitter/X
- [ ] Preparar email para waitlist (si hay)

### Launch Day Checklist
- [ ] Product Hunt submit (martes o miércoles, 12:01 AM PT)
- [ ] Post Reddit
- [ ] Tweet/Post en X
- [ ] Post en Hacker News "Show HN"
- [ ] Compartir en LinkedIn
- [ ] Notificar amigos/network

### Post-Launch
- [ ] Responder todos los comentarios
- [ ] Recoger feedback
- [ ] Hotfix bugs críticos
- [ ] Celebrar 🎉

---

## 💰 Proyección Mes 1

| Métrica | Target |
|---------|--------|
| Visitantes únicos | 5,000 |
| Signups (email) | 500 |
| Pro conversions | 10-20 |
| MRR | $100-200 |

---

## 🛠️ Tech Stack Final

```
Frontend:     Next.js + Tailwind (Vercel)
Backend:      FastAPI + SQLite (Railway)
Auth:         Clerk o Supabase Auth
Payments:     Stripe
Email:        Resend o ConvertKit
Analytics:    Plausible (privacy-friendly)
Domain:       Cloudflare (DNS + proxy)
```

---

## 📝 Copy Principal

### Headline
> **Find remote jobs that won't blow up your phone**

### Subheadline
> The only job board that tells you if you'll need to make calls. Perfect for introverts, anxious souls, and anyone who prefers Slack over phone calls.

### CTA
> **Start browsing for free** → Get unlimited access for $9.99/mo

### Social Proof (futuro)
> "Finally, a job board that gets me" - @user
> "Applied to 3 jobs, got 2 interviews. None required phone screens!" - @user2

---

## ✅ Próximo Paso Inmediato

**AHORA:** Verificar y comprar dominio

Opciones a verificar:
1. chilljobs.com
2. chilljobs.co
3. chilljobs.io
4. getchilljobs.com
5. trychilljobs.com

¿Quieres que empiece con el rebrand del frontend mientras compras el dominio?

---

*Creado: 2026-02-13*
