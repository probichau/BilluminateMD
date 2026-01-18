# Deployment Guide

## Overview
This guide covers deploying BilluminateMD to production. We'll use free/low-cost services that scale with usage.

---

## Recommended Architecture

```
[User's Browser]
      ↓
[Vercel/Netlify] ← Frontend (Static React App)
      ↓
[Railway/Render] ← Backend API (Node.js)
      ↓ ↓ ↓
      ↓ ↓ [Stripe] ← Payment Processing
      ↓ [Supabase] ← PostgreSQL Database
      [CloudFlare R2] ← File Storage
      [Anthropic API] ← AI Analysis
```

---

## Frontend Deployment (Vercel - Recommended)

### Option A: Vercel (Easiest)

1. **Sign up**: https://vercel.com/
2. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```
3. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```
4. **Set Environment Variables** in Vercel Dashboard:
   - `VITE_API_URL`: Your backend URL (e.g., `https://your-api.railway.app`)
   - `VITE_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key

5. **Custom Domain** (Optional):
   - Go to Vercel Dashboard > Domains
   - Add your domain (e.g., `billuminatemd.com`)
   - Update DNS records as instructed

**Cost**: Free for personal projects, $20/month for teams

---

### Option B: Netlify

1. **Sign up**: https://netlify.com/
2. **Deploy**:
   ```bash
   cd frontend
   npm run build
   ```
3. Drag and drop the `dist` folder to Netlify dashboard
4. Set environment variables in Site Settings

**Cost**: Free for personal projects

---

## Backend Deployment

### Option A: Railway (Recommended)

1. **Sign up**: https://railway.app/
2. **Create New Project** > Deploy from GitHub
3. **Select backend folder** (or use monorepo setup)
4. **Set Environment Variables**:
   ```
   ANTHROPIC_API_KEY=sk-ant-xxxxx
   DATABASE_URL=postgresql://...
   AWS_ACCESS_KEY_ID=xxxxx
   AWS_SECRET_ACCESS_KEY=xxxxx
   AWS_BUCKET_NAME=billuminatemd-prod
   AWS_REGION=us-east-1
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   PORT=3001
   NODE_ENV=production
   ```
5. **Deploy**: Railway auto-deploys on git push

**Cost**: $5/month base + usage

---

### Option B: Render

1. **Sign up**: https://render.com/
2. **Create Web Service** > Connect GitHub
3. **Build Command**: `cd backend && npm install`
4. **Start Command**: `cd backend && npm start`
5. Set environment variables

**Cost**: Free tier available, $7/month for production

---

## Database Setup (Supabase)

1. **Sign up**: https://supabase.com/
2. **Create Project**
3. **Get Connection String**:
   - Go to Settings > Database
   - Copy "Connection string" (URI format)
4. **Initialize Schema**:
   ```bash
   # Run this once after deployment
   node -e "import('./services/databaseService.js').then(m => m.initializeDatabase())"
   ```
5. **Set up backups** (optional):
   - Supabase Pro includes daily backups
   - Or use pg_dump for manual backups

**Cost**: Free tier (500MB), $25/month for Pro

---

## File Storage Setup

### Option A: CloudFlare R2 (Recommended - Cheaper)

1. **Sign up**: https://www.cloudflare.com/
2. **Create R2 Bucket**:
   - Dashboard > R2 > Create Bucket
   - Name: `billuminatemd-prod`
   - Private (no public access)
3. **Create API Token**:
   - R2 > Manage R2 API Tokens
   - Create token with read/write permissions
4. **Configure Backend**:
   ```env
   AWS_ACCESS_KEY_ID=<R2 Access Key ID>
   AWS_SECRET_ACCESS_KEY=<R2 Secret Access Key>
   AWS_BUCKET_NAME=billuminatemd-prod
   AWS_REGION=auto  # R2 uses 'auto'
   ```
5. **Update S3 Client** in `backend/services/storageService.js`:
   ```javascript
   endpoint: 'https://<account-id>.r2.cloudflarestorage.com'
   ```

**Cost**: $0.015/GB storage, $0 egress (huge savings vs S3)

---

### Option B: AWS S3

1. **Sign up**: https://aws.amazon.com/
2. **Create S3 Bucket**:
   - S3 Console > Create Bucket
   - Name: `billuminatemd-prod`
   - Region: `us-east-1`
   - Block all public access: Enabled
3. **Create IAM User**:
   - IAM > Users > Add User
   - Attach policy: `AmazonS3FullAccess` (or custom policy)
4. **Generate Access Keys**

**Cost**: $0.023/GB storage + egress fees

---

## Stripe Setup for Production

### Switch from Test to Live Mode

1. **Complete Business Verification**:
   - Stripe Dashboard > Settings > Business Details
   - Provide all required information
   - Wait for approval (usually 24-48 hours)

2. **Get Live API Keys**:
   - Dashboard > Developers > API Keys
   - Toggle from "Test Mode" to "Live Mode"
   - Copy **Publishable Key** and **Secret Key**

3. **Set Up Webhook** for Production:
   - Developers > Webhooks > Add Endpoint
   - URL: `https://your-api.railway.app/api/payment/webhook`
   - Events: Select `payment_intent.succeeded`
   - Copy **Signing Secret**

4. **Update Environment Variables**:
   ```env
   # Backend
   STRIPE_SECRET_KEY=sk_live_xxxxx
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx

   # Frontend
   VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
   ```

5. **Test with Real Card** (your own):
   - Use a small amount (e.g., $1.00)
   - Verify payment flows through correctly
   - Check webhook is received

**Cost**: 2.9% + $0.30 per transaction

---

## Anthropic API (Production)

1. **Upgrade Account** (if needed):
   - https://console.anthropic.com/
   - Add payment method
   - Set spending limits

2. **Monitor Usage**:
   - Dashboard shows token usage
   - Set up billing alerts

3. **Optimize Costs**:
   - Cache common CPT code lookups
   - Compress images before sending (max 1024px width)
   - Use Claude 3.5 Haiku for simpler tasks (if applicable)

**Cost**: ~$3 per 1M tokens (~$0.01-0.05 per bill)

---

## Security Checklist

### Before Going Live

- [ ] All API keys in environment variables (not in code)
- [ ] CORS configured to allow only your frontend domain
- [ ] HTTPS enabled on all services (automatic with Vercel/Railway)
- [ ] Database connection uses SSL
- [ ] S3/R2 bucket is private (no public access)
- [ ] File uploads limited to 10MB
- [ ] File types restricted to images and PDFs
- [ ] Rate limiting enabled (use express-rate-limit)
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive info
- [ ] Stripe webhook signature verification enabled
- [ ] HIPAA compliance considered (if storing PHI)

### Optional Enhancements

- [ ] Add Helmet.js for security headers
- [ ] Implement request logging (use Winston or Pino)
- [ ] Set up error tracking (Sentry)
- [ ] Add API rate limiting per user/IP
- [ ] Implement file virus scanning (ClamAV)
- [ ] Add Content Security Policy headers
- [ ] Enable 2FA for admin accounts

---

## Monitoring & Analytics

### Backend Monitoring

**Railway/Render Built-in**:
- View logs in dashboard
- Monitor CPU/memory usage
- Set up alerts for errors

**Optional: Sentry**
```bash
npm install @sentry/node
```
```javascript
// backend/server.js
import * as Sentry from '@sentry/node'

Sentry.init({ dsn: process.env.SENTRY_DSN })
```

### Frontend Analytics

**Vercel Analytics** (built-in):
- Page views
- Performance metrics
- Free on all plans

**Optional: Google Analytics**
```bash
npm install react-ga4
```

### Business Metrics to Track

- Number of bills analyzed per day
- Conversion rate (free → paid)
- Average savings found per bill
- Error types distribution
- Payment success rate

---

## CI/CD Pipeline

### Automatic Deployments

**GitHub Actions** (example):
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/actions/deploy@v2
        with:
          token: ${{ secrets.VERCEL_TOKEN }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: railway/deploy-action@v1
        with:
          token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## Cost Estimate (Monthly)

### Low Traffic (100 bills/month)
- Frontend (Vercel): $0 (free tier)
- Backend (Railway): $5
- Database (Supabase): $0 (free tier)
- Storage (R2): <$1
- Anthropic API: ~$5 (100 bills × $0.05)
- Stripe: ~$30 (100 × $9.99 × 3%)

**Total: ~$41/month**

### Medium Traffic (1,000 bills/month)
- Frontend: $0-20
- Backend: $20-40
- Database: $25 (Pro tier for performance)
- Storage: ~$5
- Anthropic: ~$50
- Stripe: ~$300

**Total: ~$400-440/month**

---

## Backup & Disaster Recovery

### Database Backups

**Automated** (Supabase Pro):
- Daily automatic backups
- Point-in-time recovery
- Stored for 7 days

**Manual** (Free tier):
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Code Backups
- Use GitHub/GitLab
- Tag releases: `git tag v1.0.0`
- Keep production branch protected

### File Storage
- S3/R2 have versioning options
- Consider lifecycle policies to archive old bills

---

## Scaling Considerations

### When to Scale

**Signs you need to scale**:
- Response times > 2 seconds
- Database connections maxed out
- API error rate increases
- File uploads timing out

### Scaling Strategies

1. **Backend**: Add more instances (Railway/Render scale automatically)
2. **Database**: Upgrade Supabase tier or add read replicas
3. **Storage**: Increase CloudFlare R2 (scales automatically)
4. **AI**: Add caching layer (Redis) for common CPT lookups

### Advanced Architecture

```
[Load Balancer]
      ↓
[Backend 1] [Backend 2] [Backend 3]
      ↓
[Redis Cache] ← CPT codes, fee schedules
      ↓
[Primary DB] → [Read Replica 1] [Read Replica 2]
```

---

## Post-Deployment Checklist

- [ ] Test full flow: upload → analyze → pay → unlock
- [ ] Verify webhooks are received from Stripe
- [ ] Check error logging is working
- [ ] Monitor first 10 real users closely
- [ ] Set up status page (e.g., status.billuminatemd.com)
- [ ] Create incident response plan
- [ ] Document rollback procedures

---

## Support & Maintenance

### Regular Tasks
- **Weekly**: Review error logs
- **Monthly**: Check API usage and costs
- **Quarterly**: Update dependencies
- **Annually**: Review security practices

### Emergency Contacts
- Stripe Support: https://support.stripe.com/
- Railway Status: https://railway.app/status
- Supabase Status: https://status.supabase.com/
- Anthropic Support: support@anthropic.com

---

## Next Steps

After successful deployment:
1. Test with 5-10 friends/family
2. Gather feedback on UX
3. Monitor costs for first month
4. Iterate based on user behavior
5. Consider adding features from Phase 2
