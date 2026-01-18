# BilluminateMD Documentation

Complete documentation for the BilluminateMD project.

---

## 📚 Documentation Index

### Getting Started
1. **[Setup Guide](./00-SETUP-GUIDE.md)** - Install Node.js and set up external services
2. **[Quick Start](./01-QUICK-START.md)** - Get the app running locally in 10 minutes

### Technical Documentation
3. **[FHIR Schema](./02-FHIR-SCHEMA.md)** - Data structure and FHIR mapping
4. **[API Reference](./04-API-REFERENCE.md)** - Complete API documentation

### Deployment & Production
5. **[Deployment Guide](./03-DEPLOYMENT.md)** - Deploy to production (Vercel, Railway, etc.)

---

## 🚀 Quick Navigation

### I'm a Non-Technical Founder
👉 Start here: [00-SETUP-GUIDE.md](./00-SETUP-GUIDE.md)

Then follow: [01-QUICK-START.md](./01-QUICK-START.md)

### I'm a Developer Joining the Project
👉 Start here: [01-QUICK-START.md](./01-QUICK-START.md)

Then read: [02-FHIR-SCHEMA.md](./02-FHIR-SCHEMA.md) and [04-API-REFERENCE.md](./04-API-REFERENCE.md)

### I'm Ready to Deploy
👉 Go to: [03-DEPLOYMENT.md](./03-DEPLOYMENT.md)

---

## 🏗️ Project Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                       │
│  (React + Tailwind - Mobile-First Interface)            │
└────────────────────┬────────────────────────────────────┘
                     │ HTTPS
                     ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND API (Node.js)                  │
│  - File upload handling                                 │
│  - API routing                                          │
│  - Business logic orchestration                         │
└─┬─────────┬─────────┬─────────┬─────────────────────────┘
  │         │         │         │
  │         │         │         │
  ▼         ▼         ▼         ▼
┌───────┐ ┌──────┐ ┌────────┐ ┌────────────────────────┐
│ Claude│ │ S3/R2│ │Postgres│ │      Stripe API        │
│ Vision│ │Storage│ │Database│ │  (Payment Processing)  │
│  API  │ │      │ │        │ │                        │
└───────┘ └──────┘ └────────┘ └────────────────────────┘
    │                   │
    │                   │
    ▼                   ▼
Extract Data      Store Results
Find Errors       Track Payments
```

---

## 🎯 Core Features

### 1. Bill Upload & Capture
- **Mobile-first** design with camera capture
- Supports JPEG, PNG, HEIC, and PDF
- Drag-and-drop interface for desktop
- Real-time processing feedback

### 2. AI-Powered Analysis
- **Claude 3.5 Sonnet Vision** extracts all bill data
- Identifies provider, patient, and service information
- Parses complex line items and CPT codes
- Structured FHIR-inspired data output

### 3. Error Detection
Four types of billing errors detected:
- **Duplicate Charges**: Same service billed multiple times
- **Unbundling**: Component charges that should be bundled
- **Upcoding**: Services billed at higher complexity than warranted
- **Price Anomalies**: Charges significantly above fair market value

### 4. Freemium Model
- **Free**: See summary of savings (e.g., "$450 in errors found")
- **Paid ($9.99)**: Unlock detailed findings with actionable advice
- Blur effect on locked content creates urgency

### 5. Payment Integration
- **Stripe** for secure payment processing
- One-time unlock fee per report
- Instant access after successful payment

---

## 📊 Tech Stack Summary

| Layer | Technology | Why? |
|-------|------------|------|
| **Frontend** | React + Vite | Fast, modern, component-based |
| **Styling** | Tailwind CSS | Rapid mobile-first development |
| **Backend** | Node.js + Express | JavaScript full-stack, easy deployment |
| **AI** | Anthropic Claude 3.5 | Best-in-class vision OCR |
| **Database** | PostgreSQL | Reliable, JSONB support for flexible schema |
| **Storage** | AWS S3 / CloudFlare R2 | Scalable file storage |
| **Payments** | Stripe | Industry-standard payment processing |

---

## 🔐 Security & Compliance

### Data Protection
- ✅ Files stored privately (no public access)
- ✅ HTTPS enforced in production
- ✅ Database connections use SSL
- ✅ API keys stored in environment variables
- ✅ No sensitive data in logs

### HIPAA Considerations
**Important**: This application handles Protected Health Information (PHI).

If you plan to scale, consider:
- **Business Associate Agreement (BAA)** with cloud providers
- **Encryption at rest** for database (Supabase supports this)
- **Audit logging** of all data access
- **User authentication** (not currently implemented)
- **Data retention policies** (implement automatic deletion)

**Current Status**: This MVP is **not HIPAA-compliant** out of the box. It's designed for individual use where the user is uploading their own bills.

---

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Upload various bill formats (PDF, JPG, PNG)
- [ ] Test with different bill types (hospital, clinic, ER)
- [ ] Verify error detection accuracy
- [ ] Test payment flow end-to-end
- [ ] Check mobile responsiveness
- [ ] Test on different browsers (Chrome, Safari, Firefox)

### Sample Bills for Testing
Create test fixtures in `backend/test/fixtures/`:
- Simple outpatient bill
- Complex hospital bill with multiple line items
- Bill with known duplicate charges
- Bill with unbundling issues

### Automated Testing (Future)
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests (with Playwright or Cypress)
npm run test:e2e
```

---

## 📈 Roadmap & Future Features

### Phase 2: User Accounts
- User registration and login
- Dashboard showing all audited bills
- Track dispute progress
- Save favorite providers

### Phase 3: SMART on FHIR Integration
- Connect to patient portals (Epic MyChart, Cerner)
- Auto-fetch bills from EHR
- No manual upload needed

### Phase 4: Dispute Automation
- Generate dispute letters automatically
- Track correspondence with providers
- Integration with provider billing systems

### Phase 5: Analytics & Insights
- Industry benchmarking (e.g., "This provider charges 2.3x average")
- Provider quality ratings
- Predictive analytics for bill estimates

---

## 🤝 Contributing

### Code Style
- Use ESLint for linting
- Follow Airbnb JavaScript style guide
- Components should be functional (React hooks)
- Backend uses ES6 modules (`import/export`)

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes and commit
git add .
git commit -m "Add new feature"

# Push and create PR
git push origin feature/new-feature
```

### Commit Message Format
```
feat: Add duplicate charge detection
fix: Resolve payment webhook error
docs: Update deployment guide
refactor: Simplify error detection logic
```

---

## 🐛 Troubleshooting

### Common Issues

**"Module not found" errors**
```bash
cd frontend && npm install
cd ../backend && npm install
```

**AI extraction returns null**
- Check `ANTHROPIC_API_KEY` in `.env`
- Verify API key is active in Anthropic console
- Check backend logs for specific error

**Payment not completing**
- Verify `STRIPE_SECRET_KEY` and `VITE_STRIPE_PUBLISHABLE_KEY`
- Check Stripe dashboard for failed payments
- Ensure webhook endpoint is configured

**Database connection fails**
- Check `DATABASE_URL` format
- Verify database is running (Supabase project active)
- Run `initializeDatabase()` if tables don't exist

---

## 📞 Support & Resources

### External Documentation
- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Anthropic API**: https://docs.anthropic.com/
- **Stripe API**: https://stripe.com/docs/api
- **FHIR Standard**: https://hl7.org/fhir/

### Community
- GitHub Issues: (your-repo-url/issues)
- Discord: (your-discord-link)
- Email: support@billuminatemd.com

---

## 📜 License

[MIT License](../LICENSE) - See LICENSE file for details

---

## 👏 Acknowledgments

Built with:
- Claude 3.5 Sonnet by Anthropic
- React by Meta
- Tailwind CSS by Tailwind Labs
- Stripe for payments
- Open source community

---

## 📝 Document Version

**Last Updated**: January 2024
**Documentation Version**: 1.0.0
**App Version**: 1.0.0

---

## Next Steps

1. ✅ Read [Setup Guide](./00-SETUP-GUIDE.md)
2. ✅ Follow [Quick Start](./01-QUICK-START.md)
3. ✅ Review [FHIR Schema](./02-FHIR-SCHEMA.md)
4. ✅ Test locally with sample bills
5. ✅ Deploy using [Deployment Guide](./03-DEPLOYMENT.md)

**Good luck building! 🚀**
