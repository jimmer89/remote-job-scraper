# ChillJobs - Sprint de 1 Semana

> Objetivo: Dejar ChillJobs listo para cobrar y lanzar
> Criterio de exito: un usuario puede registrarse, pagar $9.99, y acceder a Pro
> Post-sprint: lanzar en Reddit/Product Hunt y evaluar traccion

---

## DIA 1: Revenue Ready (bloqueantes de cobro)

### 1. Configurar Stripe (~30 min)
- [ ] Crear cuenta Stripe (si no existe)
- [ ] Crear producto: "ChillJobs Pro Monthly" — $9.99/mes
- [ ] Crear producto: "ChillJobs Pro Yearly" — $79/ano
- [ ] Obtener API keys del Dashboard
- [ ] Configurar en Vercel:
  - `STRIPE_SECRET_KEY=sk_live_...`
  - `STRIPE_PRICE_ID=price_...`
  - `STRIPE_WEBHOOK_SECRET=whsec_...`
- [ ] Crear webhook en Stripe Dashboard apuntando a la URL de Vercel
- **Entregable:** Checkout flow funcional end-to-end

### 2. Hashear passwords (~30 min)
- [ ] Implementar bcryptjs en `frontend/src/lib/auth.ts`
- [ ] Hash en registro, compare en login
- **Entregable:** Passwords hasheados en produccion

### 3. Fijar NextAuth secret (~5 min)
- [ ] Generar secret aleatorio
- [ ] Configurar `NEXTAUTH_SECRET` en Vercel
- **Entregable:** Secret de produccion configurado

---

## DIA 2: Persistencia de usuarios (bloqueante critico)

### 4. Migrar users de in-memory a DB (~4-6h)
- [ ] Decidir: SQLite (simple) o PostgreSQL via Railway (escalable)
- [ ] Crear tabla `users` (id, email, password_hash, name, is_pro, stripe_customer_id, created_at)
- [ ] Migrar auth.ts para leer/escribir de DB en vez de Map()
- [ ] Actualizar webhook de Stripe para persistir upgrade a Pro
- [ ] Testear flujo completo: register → login → upgrade → Pro features
- **Entregable:** Usuarios persisten entre redeployments

---

## DIA 3: Dominio + credibilidad

### 5. Configurar dominio (~15 min)
- [ ] Apuntar dominio a Vercel (DNS)
- [ ] Verificar SSL automatico
- [ ] Actualizar `NEXTAUTH_URL` en Vercel
- [ ] Actualizar API CORS para permitir el nuevo dominio
- **Entregable:** ChillJobs accesible desde dominio propio

### 6. Google OAuth (~30 min)
- [ ] Crear proyecto en Google Cloud Console
- [ ] Obtener `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`
- [ ] Configurar en Vercel
- [ ] Testear login con Google
- **Entregable:** "Continue with Google" funcional

---

## DIA 4: Email alerts (killer feature Pro)

### 7. Implementar email alerts (~4h)
- [ ] Integrar Resend (ya usado en CRMFacil, gratis)
- [ ] Crear endpoint para gestionar alertas (categoria, frecuencia)
- [ ] Cron job: cada 6h, buscar jobs nuevos que matcheen preferencias
- [ ] Enviar email con jobs nuevos a Pro users
- [ ] UI en frontend para configurar alertas
- **Entregable:** Pro users reciben emails con jobs nuevos automaticamente

---

## DIA 5: Test completo + QA

### 8. Test end-to-end (~2h)
- [ ] Registrar usuario nuevo
- [ ] Verificar que persiste tras restart
- [ ] Login con email y con Google
- [ ] Ver jobs en tier gratis (1 visible, resto blurred)
- [ ] Hacer upgrade via Stripe checkout
- [ ] Verificar que Pro features se desbloquean
- [ ] Verificar email alerts para Pro
- [ ] Verificar en movil (responsive)
- **Entregable:** Flujo completo verificado sin errores

### 9. Limpieza pre-lanzamiento (~1h)
- [ ] Actualizar meta tags (OG image, title, description)
- [ ] Verificar que Google indexa correctamente
- [ ] Revisar textos/copy en la landing
- [ ] Eliminar console.logs y TODO comments
- **Entregable:** Producto pulido para lanzamiento

---

## DIA 6-7: Lanzamiento

### 10. Preparar assets de lanzamiento (~2h)
- [ ] 5+ screenshots del producto
- [ ] Video demo de 60 seg (Loom o similar)
- [ ] Post para Reddit (r/remotejobs, r/SideProject, r/socialanxiety)
- [ ] Preparar Product Hunt listing
- [ ] Tweet de lanzamiento

### 11. Lanzar
- [ ] Post en Reddit (3 subreddits)
- [ ] Product Hunt submit
- [ ] Tweet/X post
- [ ] Hacker News "Show HN"
- **Entregable:** ChillJobs publicamente lanzado

---

## Evaluacion post-lanzamiento (7 dias despues)

### Metricas a medir:
| Metrica | Umbral "seguir" | Umbral "pausar" |
|---------|-----------------|-----------------|
| Registros | >50 | <20 |
| Pro subs | >5 | 0 |
| Visitantes unicos | >500 | <100 |
| Feedback positivo | Cualquier | Ninguno |

### Decision:
- **Si hay traccion:** Seguir con marketing organico (TikTok, blog SEO, newsletter)
- **Si no hay traccion:** Pausar y redirigir esfuerzo a chatbot.deals

---

## Archivos clave a tocar

| Archivo | Cambio |
|---------|--------|
| `frontend/src/lib/auth.ts` | Hash passwords, migrar a DB |
| `frontend/src/app/api/checkout/route.ts` | Verificar Stripe keys |
| `frontend/src/app/api/webhook/route.ts` | Verificar webhook flow |
| `frontend/.env.production` | Anadir todas las keys |
| `src/api.py` | Actualizar CORS |

---

*Sprint definido: 2026-02-14*
*Deadline: 2026-02-21*
