# BilluminateMD - Medical Bill Auditor

An AI-powered application that audits medical bills for errors, analyzes charity care eligibility, and generates professional appeal letters.

## 🎯 Current Status: **MVP COMPLETE - Ready for Beta Testing**

✅ All core features working
✅ Mobile responsive
✅ Production build tested
✅ Payment processing functional
✅ Appeal letter generation working

## Features

- 📄 **Bill Upload**: Upload medical bills as PDF or images (mobile camera supported)
- 🤖 **AI Extraction**: Automatically extract billing information using Claude Sonnet 4.5
- 🔍 **Error Detection**: Identify billing errors (duplicates, upcoding, unbundling)
- 💰 **Charity Care Analysis**: Calculate Federal Poverty Level and eligibility
- 📝 **Appeal Letter Generation**: Create professional, legally-defensible appeal letters
- 💳 **Secure Payments**: $9.99 payment via Stripe to unlock full report

## Tech Stack

**Frontend:** React 18 + Vite + Tailwind CSS + Stripe
**Backend:** Node.js + Express + PostgreSQL + Claude API
**Storage:** Cloudflare R2 (or AWS S3 compatible)

## Quick Start

See `DEPLOYMENT-CHECKLIST.md` for detailed deployment instructions.

### Local Development

1. **Setup Database:**
   ```bash
   createdb billuminatemd
   cd backend
   npm install
   # Configure .env with DATABASE_URL
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm start  # Runs on :3001
   ```

3. **Start Frontend:**
   ```bash
   cd frontend  
   npm install
   npm run dev  # Runs on :5173
   ```

## Deployment

**Recommended:** Vercel (frontend) + Railway (backend + database)

See `DEPLOYMENT-CHECKLIST.md` for complete deployment guide.

## Mobile Compatibility

✅ Fully responsive and mobile-ready
✅ Works on iOS Safari and Android Chrome
✅ Mobile file upload (camera + gallery)
✅ Touch-friendly UI

---

For detailed deployment instructions, see `DEPLOYMENT-CHECKLIST.md`
