# BilluminateMD - Intelligent Medical Bill Auditor & Advocate

## Project Overview
A mobile-first web application that helps patients reduce medical expenses by auditing bills for errors using AI vision and providing actionable reports.

## Core Features
- 📸 Mobile bill capture (photo or PDF upload)
- 🤖 AI-powered data extraction and error detection
- 🔍 Duplicate charges, unbundling, upcoding, and price anomaly detection
- 💰 Freemium model with teaser results and paid full reports
- 🏥 FHIR-inspired data structure for future interoperability

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS (mobile-first)
- **Backend**: Node.js + Express
- **AI**: Anthropic Claude 3.5 Sonnet (Vision API)
- **Database**: PostgreSQL
- **Storage**: AWS S3 (or compatible)
- **Payments**: Stripe

## Project Structure
```
billuminatemd/
├── frontend/          # React frontend application
├── backend/           # Node.js API server
└── docs/             # Configuration guides and documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- A code editor (VS Code recommended)

### Quick Start (5 minutes)

1. **Install Node.js** if you haven't already: https://nodejs.org/

2. **Install dependencies**:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd ../backend
   npm install
   ```

3. **Set up environment variables**:
   ```bash
   # Backend
   cd backend
   cp .env.example .env
   # Edit .env and set USE_LOCAL_STORAGE=true

   # Frontend
   cd ../frontend
   cp .env.example .env
   ```

4. **Run the application**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

5. **Open your browser**: http://localhost:5173

📚 **Full documentation**: See the `/docs` folder
- [Setup Guide](./docs/00-SETUP-GUIDE.md) - Detailed prerequisites
- [Quick Start](./docs/01-QUICK-START.md) - Step-by-step tutorial
- [API Reference](./docs/04-API-REFERENCE.md) - Backend API docs
- [Deployment Guide](./docs/03-DEPLOYMENT.md) - Deploy to production

## 📋 What Works Now

✅ **Frontend UI**: Complete mobile-first interface
✅ **File Upload**: Camera capture and drag-drop
✅ **Backend API**: All routes configured
✅ **Payment UI**: Stripe integration ready
✅ **Error Detection**: Four algorithms implemented

⏳ **Needs Configuration** (external services):
- Anthropic API for AI analysis
- PostgreSQL database for storage
- Stripe keys for payments
- S3/R2 for file storage (or use local storage for dev)

See [Setup Guide](./docs/00-SETUP-GUIDE.md) for service configuration instructions.

## 🏗️ Architecture

```
User Browser (React)
        ↓
   Backend API (Node.js)
        ↓ ↓ ↓ ↓
        │ │ │ └─→ Stripe (Payments)
        │ │ └───→ PostgreSQL (Data)
        │ └─────→ S3/R2 (File Storage)
        └───────→ Claude Vision (AI Analysis)
```

## 🔑 Key Features Explained

### 1. AI Bill Analysis
- Upload photo or PDF of medical bill
- Claude Vision extracts all data (provider, patient, line items)
- FHIR-inspired structured data output

### 2. Error Detection
Four detection algorithms:
- **Duplicate Charges**: Same service billed multiple times
- **Unbundling**: Separate charges that should be bundled
- **Upcoding**: Services billed at higher complexity
- **Price Anomalies**: Charges above fair market value

### 3. Freemium Model
- Free: See total savings summary (e.g., "$450 found")
- $9.99: Unlock detailed findings with actionable advice
- Blur effect creates conversion urgency

## 📁 Project Structure

```
BilluminateMD/
├── frontend/                 # React + Vite + Tailwind
│   ├── src/
│   │   ├── components/      # UploadZone, ProcessingModal, PaymentModal
│   │   ├── pages/           # HomePage, ResultsPage
│   │   └── services/        # API client (future)
│   └── package.json
│
├── backend/                  # Node.js + Express
│   ├── controllers/         # Request handlers
│   ├── services/
│   │   ├── aiService.js              # Claude Vision integration
│   │   ├── errorDetectionService.js  # Billing error logic
│   │   ├── databaseService.js        # PostgreSQL operations
│   │   └── storageService.js         # S3/local file storage
│   ├── routes/              # API endpoints
│   └── server.js            # Main server
│
└── docs/                     # Complete documentation
    ├── 00-SETUP-GUIDE.md            # Prerequisites & external services
    ├── 01-QUICK-START.md            # Local development guide
    ├── 02-FHIR-SCHEMA.md            # Data structure & FHIR mapping
    ├── 03-DEPLOYMENT.md             # Production deployment
    └── 04-API-REFERENCE.md          # Backend API documentation
```

## 🔒 Security & Compliance

- ✅ Private file storage (no public access)
- ✅ HTTPS enforced in production
- ✅ API keys in environment variables
- ✅ Stripe for PCI-compliant payments
- ⚠️ **HIPAA**: Not compliant out-of-the-box (see docs for requirements)

## 🚢 Deployment

Deploy in minutes using:
- **Frontend**: Vercel (free tier)
- **Backend**: Railway ($5/month)
- **Database**: Supabase (free tier)
- **Storage**: CloudFlare R2 ($0.015/GB, no egress fees)

See [Deployment Guide](./docs/03-DEPLOYMENT.md) for detailed instructions.

## 🗺️ Roadmap

### Phase 1: MVP ✅ (Complete)
- Bill upload and AI analysis
- Error detection (4 algorithms)
- Freemium model with payment

### Phase 2: User Accounts (Next)
- User registration and login
- Dashboard with bill history
- Dispute tracking

### Phase 3: SMART on FHIR
- Connect to patient portals (Epic, Cerner)
- Auto-fetch bills from EHR
- Eliminate manual upload

### Phase 4: Automation
- Generate dispute letters
- Provider communication tracking
- Success rate analytics

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📜 License

MIT License - see [LICENSE](./LICENSE) file

## 📞 Support

- 📖 Documentation: `/docs` folder
- 🐛 Issues: GitHub Issues
- 💬 Questions: (your-contact-method)

## 🙏 Acknowledgments

Built with Claude 3.5 Sonnet, React, Tailwind CSS, and the open source community.

---

**Ready to start?** → [Quick Start Guide](./docs/01-QUICK-START.md)
