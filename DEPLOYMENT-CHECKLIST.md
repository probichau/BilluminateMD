# BilluminateMD AWS Deployment Checklist

## Pre-Deployment Preparation ✅

- [x] Backend prepared with EB config files
- [x] Frontend build configuration created
- [x] Environment variables documented
- [x] CORS configuration ready
- [x] Google OAuth implemented (needs credentials)
- [x] Database migrations ready

---

## Backend Deployment (Elastic Beanstalk)

### Phase 1: Setup
- [ ] Get AWS IAM credentials (Console → IAM → Create Access Key)
- [ ] Run `export PATH="/Users/bernardpeterrobichau/Library/Python/3.13/bin:$PATH"`
- [ ] Navigate to backend: `cd backend`

### Phase 2: Initialize & Deploy
- [ ] Run `eb init` (choose Node.js, region, SSH access)
- [ ] Run `eb create billuminatemd-prod --instance-type t3.small`
- [ ] Wait 5-10 minutes for environment creation

### Phase 3: Configure Environment
- [ ] Set environment variables using `eb setenv`:
  ```bash
  eb setenv \
    NODE_ENV=production \
    ANTHROPIC_API_KEY=<your-key> \
    DATABASE_URL=<neon-db-url> \
    AWS_ACCESS_KEY_ID=<your-key> \
    AWS_SECRET_ACCESS_KEY=<your-secret> \
    AWS_REGION=us-east-1 \
    AWS_S3_BUCKET=<your-bucket> \
    STRIPE_SECRET_KEY=<your-key> \
    STRIPE_WEBHOOK_SECRET=<your-secret> \
    JWT_SECRET=<random-string> \
    FRONTEND_URL=https://your-amplify-url
  ```

### Phase 4: Verify
- [ ] Run `eb status` to get your backend URL
- [ ] Run `eb open` to test in browser
- [ ] Visit `/health` endpoint to verify it's running
- [ ] Check logs: `eb logs --tail`

**Backend URL:** _________________________________

---

## Frontend Deployment (AWS Amplify)

### Phase 1: Git Repository
- [ ] Create GitHub/GitLab/Bitbucket repository
- [ ] Push code to repository:
  ```bash
  git init
  git add .
  git commit -m "Initial deployment"
  git remote add origin <your-repo-url>
  git push -u origin main
  ```

### Phase 2: Amplify Console
- [ ] Go to AWS Amplify Console
- [ ] Connect your Git repository
- [ ] Configure build settings (auto-detected from amplify.yml)
- [ ] Set monorepo root directory: `frontend`

### Phase 3: Environment Variables
- [ ] Add in Amplify Console → Environment variables:
  ```
  VITE_API_URL = https://<backend-url>.elasticbeanstalk.com
  VITE_STRIPE_PUBLIC_KEY = pk_live_<your-key>
  ```

### Phase 4: Deploy & Verify
- [ ] Click "Save and deploy"
- [ ] Wait 5-10 minutes for build
- [ ] Visit Amplify URL to test
- [ ] Test signup, login, upload functionality

**Frontend URL:** _________________________________

---

## Post-Deployment Configuration

### Update Backend CORS
- [ ] Edit `backend/server.js`:
  ```javascript
  app.use(cors({
    origin: [
      'http://localhost:5173',
      'https://<your-amplify-url>',
      'https://<your-custom-domain>'
    ]
  }))
  ```
- [ ] Deploy: `eb deploy`

### Configure Google OAuth
- [ ] Go to Google Cloud Console
- [ ] Update authorized redirect URIs:
  ```
  https://<backend-url>.elasticbeanstalk.com/api/auth/google/callback
  ```
- [ ] Update GOOGLE_CALLBACK_URL in EB environment variables
- [ ] Test Google sign-in flow

### Configure Stripe Webhooks
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Add endpoint:
  ```
  https://<backend-url>.elasticbeanstalk.com/api/payment/webhook
  ```
- [ ] Select events: `checkout.session.completed`, `payment_intent.succeeded`
- [ ] Copy webhook signing secret
- [ ] Update `STRIPE_WEBHOOK_SECRET` in EB: `eb setenv STRIPE_WEBHOOK_SECRET=<secret>`

### SSL/HTTPS Setup
- [ ] EB Load Balancer → Add HTTPS listener (port 443)
- [ ] Request/upload SSL certificate (AWS Certificate Manager)
- [ ] Test HTTPS endpoints

---

## Domain Configuration (Optional)

### Backend Custom Domain
- [ ] Go to Route 53 (or your DNS provider)
- [ ] Create CNAME record: `api.billuminatemd.com` → `<eb-url>.elasticbeanstalk.com`
- [ ] Update all references to use custom domain

### Frontend Custom Domain
- [ ] In Amplify Console → Domain management
- [ ] Add custom domain: `app.billuminatemd.com`
- [ ] Update DNS records as instructed
- [ ] Wait for SSL certificate provisioning

---

## Testing Checklist

### Backend Tests
- [ ] Health check: `curl https://<backend-url>/health`
- [ ] Auth endpoints: POST `/api/auth/register`, `/api/auth/login`
- [ ] Google OAuth: GET `/api/auth/google`
- [ ] Protected routes: GET `/api/auth/me` (with token)
- [ ] Audit endpoints: POST `/api/audit/analyze`
- [ ] Payment endpoints: POST `/api/payment/create-checkout-session`

### Frontend Tests
- [ ] Home page loads
- [ ] Registration works
- [ ] Login works
- [ ] Google sign-in works
- [ ] File upload works
- [ ] Bill analysis works
- [ ] Payment flow works (Stripe)
- [ ] Subscription flow works
- [ ] Results display correctly
- [ ] All pages render without errors

### Integration Tests
- [ ] End-to-end: Upload bill → Analyze → Pay → View results
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile responsiveness
- [ ] Error handling (network errors, invalid inputs)

---

## Monitoring & Maintenance

### Set Up Monitoring
- [ ] CloudWatch alarms for EB (CPU, memory, HTTP errors)
- [ ] CloudWatch alarms for Amplify (build failures)
- [ ] Enable EB enhanced health reporting
- [ ] Configure SNS notifications for alerts

### Regular Maintenance
- [ ] Monitor CloudWatch logs
- [ ] Review error rates
- [ ] Check database performance
- [ ] Update dependencies regularly
- [ ] Review AWS costs

---

## Rollback Plan

If something goes wrong:

### Backend Rollback
```bash
eb list  # Show all versions
eb deploy --version <previous-version>
```

### Frontend Rollback
- Amplify Console → Deployments → Select previous build → Redeploy

---

## Cost Summary

| Service | Estimated Cost/Month |
|---------|---------------------|
| Elastic Beanstalk (t3.small) | $15-20 |
| Load Balancer | $20 |
| Neon Database | Free - $20 |
| S3 Storage | $1-5 |
| Amplify Hosting | $15-20 |
| CloudFront/Data Transfer | $5-10 |
| **Total** | **$56-95/month** |

---

## Support Resources

- **EB CLI Docs:** https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/eb-cli3.html
- **Amplify Docs:** https://docs.amplify.aws/
- **Deployment Guides:** See AWS-DEPLOYMENT-GUIDE.md and FRONTEND-AMPLIFY-DEPLOYMENT.md

---

## Completion Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables configured
- [ ] CORS configured
- [ ] Google OAuth working
- [ ] Stripe payments working
- [ ] HTTPS enabled
- [ ] Monitoring set up
- [ ] Backup/rollback plan in place
- [ ] Documentation updated

---

**Deployment Date:** _______________
**Backend URL:** _______________
**Frontend URL:** _______________
**Status:** ☐ In Progress  ☐ Completed  ☐ Issues

**Notes:**
