# Changelog

## [2.0.0] - 2026-02-14 - ChillJobs Launch 🚀

### Branding
- Renamed project to **ChillJobs**
- New tagline: "Remote Jobs. No Calls Required."
- Custom logo with lavender/pink/mint color palette
- Complete UI redesign with modern, friendly aesthetics

### Features
- **Freemium Model**
  - Free tier: 1 job preview per search
  - Pro tier ($9.99/mo): Unlimited jobs + No-Phone & Salary filters
  - Upgrade modal with feature comparison
  - Locked job cards with blur effect

- **Authentication System**
  - NextAuth.js integration
  - Email/password registration and login
  - Google OAuth structure (pending credentials)
  - JWT sessions

- **Stripe Integration (structure)**
  - Checkout session creation
  - Webhook for subscription activation
  - Success page with confetti celebration

- **UI/UX Improvements**
  - Responsive landing page with hero section
  - Category cards with job counts
  - Trust indicators
  - Full footer with social links, newsletter, legal links
  - Browser history navigation (back button works)
  - Cursor pointer on all clickable elements

### Deployment
- Frontend: Vercel (https://frontend-three-azure-48.vercel.app)
- Backend API: Railway
- Environment variables configured

### Technical
- Added NextAuth, Stripe, canvas-confetti dependencies
- New components: UpgradeModal, LockedJobCard, Providers
- New pages: /auth/signin, /pricing, /pricing/success
- New API routes: /api/auth/*, /api/checkout, /api/webhook

---

## [1.0.0] - 2026-02-13 - Initial Release

### Features
- Job scraping from 5 sources (RemoteOK, WeWorkRemotely, Reddit, Indeed, Glassdoor)
- No-phone job detection
- Salary extraction
- Category classification
- REST API with FastAPI
- Basic React frontend
- Quiz for job matching
