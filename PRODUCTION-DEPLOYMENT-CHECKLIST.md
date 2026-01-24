# Production Deployment Checklist

**Purpose:** Steps to deploy staging changes to production
**Status:** NOT YET EXECUTED - Ready when you are

---

## ⚠️ IMPORTANT: Do NOT deploy to production until you've verified everything works on staging

### Pre-Production Verification Checklist

Complete these on **STAGING** first:

- [ ] DKIM verification shows "Success" status
- [ ] Support form tested and working
- [ ] Emails sending successfully (both to support and customer)
- [ ] Emails arriving in INBOX (not spam)
- [ ] /app page has no login/signup buttons
- [ ] Bill upload works without authentication
- [ ] Payment unlock flow working
- [ ] All critical user flows tested
- [ ] No console errors in browser
- [ ] Backend logs show no errors

**Only proceed to production after ALL items above are checked!**

---

## Production Deployment Steps

### 1. Git Merge (5 minutes)

Merge staging branch to main:

```bash
# Ensure staging is up to date and tested
git checkout staging
git pull origin staging

# Switch to main and merge
git checkout main
git pull origin main
git merge staging

# Review changes
git log --oneline -10

# Push to production
git push origin main
```

**Changed files to review:**
- frontend/src/App.jsx (removed auth)
- frontend/src/pages/HomePage.jsx (cleaned UI)
- frontend/src/pages/FinancialInfoPage.jsx (removed auth headers)
- frontend/src/pages/ResultsPage.jsx (removed useAuth)
- frontend/src/pages/SupportPage.jsx (new support form)
- backend/routes/support.js (SES integration)
- backend/routes/support.js (updated to use SES env vars)

---

### 2. Add Environment Variables to Production Backend (2 minutes)

Use AWS CLI to add SES credentials to production Elastic Beanstalk:

```bash
aws elasticbeanstalk update-environment \
  --region us-east-1 \
  --environment-name "billuminatemd-prod" \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=SES_AWS_ACCESS_KEY_ID,Value=<YOUR_SES_ACCESS_KEY_ID> \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=SES_AWS_SECRET_ACCESS_KEY,Value=<YOUR_SES_SECRET_ACCESS_KEY> \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=SES_AWS_REGION,Value=us-east-1 \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=SES_FROM_EMAIL,Value=support@billuminate.com \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=SUPPORT_EMAIL,Value=support@billuminate.com
```

**Note:** Get actual SES credentials from ~/.aws/credentials file

**Or manually via AWS Console:**
1. Go to: https://console.aws.amazon.com/elasticbeanstalk/
2. Select: billuminatemd-prod environment
3. Configuration → Software → Edit
4. Add 5 environment variables (same as staging)
5. Apply changes

---

### 3. Wait for Deployment (5-10 minutes)

Monitor deployment status:

```bash
# Check backend deployment
aws elasticbeanstalk describe-environments \
  --region us-east-1 \
  --environment-names "billuminatemd-prod" \
  --query "Environments[0].Status" \
  --output text
```

Expected: "Ready" (will show "Updating" during deployment)

**Frontend will auto-deploy via Amplify when main branch is pushed**

---

### 4. Production Testing (10 minutes)

After deployment completes:

#### Test Support Form
1. Visit: https://billuminate.com/support
2. Submit test ticket with YOUR email
3. Verify TWO emails received:
   - To: support@billuminate.com
   - To: Your test email
4. Check emails are in INBOX (not spam)
5. Verify email headers show:
   - spf=pass
   - dkim=pass
   - dmarc=pass

#### Test Main App Flow
1. Visit: https://billuminate.com/app
2. Verify NO login/signup buttons in header
3. Upload a test medical bill
4. Complete financial info
5. View results page
6. Verify payment unlock flow works
7. Pay $49 and unlock report
8. Verify full report displays

#### Test Marketing Pages
1. Visit: https://billuminate.com/
2. Check all navigation links work
3. Verify pricing page shows $49
4. Test "Scan Your Bill" CTA button
5. Verify footer links work

---

### 5. Monitor Production (24 hours)

After deployment:

#### Check Backend Logs
```bash
# View recent logs
aws elasticbeanstalk retrieve-environment-info \
  --region us-east-1 \
  --environment-name billuminatemd-prod \
  --info-type tail
```

#### Monitor Metrics
- Check error rates in AWS console
- Monitor SES sending metrics
- Watch for any bounce/complaint emails
- Check DMARC reports (sent weekly to support@billuminate.com)

#### User Feedback
- Monitor support email for issues
- Check for any customer complaints
- Test on multiple browsers (Chrome, Safari, Firefox)
- Test on mobile devices

---

## Production-Specific Configuration

### DNS Records
**No changes needed** - DNS is already configured at domain level:
- SPF: Active
- DMARC: Active
- DKIM: Active
- MX Records: Active (ImprovMX)

All email authentication applies to both stage.billuminate.com and billuminate.com

### Email Configuration
**No changes needed** - SES is configured at account level:
- support@billuminate.com: Already verified
- Production access: Already granted
- DKIM tokens: Already configured
- Sending quota: 200 emails/day (shared across all environments)

### Support Form URL
After deployment:
- Staging: https://stage.billuminate.com/support
- Production: https://billuminate.com/support

Both will use the same support@billuminate.com email address.

---

## Rollback Plan (If Issues Occur)

If critical issues are discovered in production:

### Option 1: Quick Revert (Recommended)
```bash
# Revert to previous commit
git checkout main
git log --oneline -5  # Find last good commit
git revert <commit-hash>
git push origin main

# Remove SES env vars from production if email is the issue
aws elasticbeanstalk update-environment \
  --region us-east-1 \
  --environment-name "billuminatemd-prod" \
  --options-to-remove \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=SES_AWS_ACCESS_KEY_ID \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=SES_AWS_SECRET_ACCESS_KEY
```

### Option 2: Emergency Fix
1. Identify the issue from logs/errors
2. Create hotfix branch from main
3. Fix the issue
4. Test on staging first
5. Merge to main and redeploy

---

## Post-Deployment Tasks

### Immediate (Day 1)
- [ ] Verify support form works
- [ ] Test bill upload and payment flow
- [ ] Check all emails arriving correctly
- [ ] Monitor error logs
- [ ] Test on mobile devices

### Short-term (Week 1)
- [ ] Monitor DMARC reports
- [ ] Check email deliverability (inbox vs spam)
- [ ] Monitor support ticket volume
- [ ] Collect user feedback
- [ ] Check SES sending metrics

### Long-term (Month 1)
- [ ] Review DMARC policy (consider changing p=none to p=quarantine)
- [ ] Analyze support ticket patterns
- [ ] Consider adding features based on feedback
- [ ] Review AWS costs (SES, Elastic Beanstalk)

---

## Environment Comparison

| Component | Staging | Production | Status |
|-----------|---------|------------|--------|
| **Frontend URL** | stage.billuminate.com | billuminate.com | Different |
| **Backend URL** | billuminate-staging.*.elasticbeanstalk.com | billuminatemd-prod.*.elasticbeanstalk.com | Different |
| **Database** | Supabase (shared) | Supabase (shared) | Same |
| **Email (SES)** | support@billuminate.com | support@billuminate.com | Same |
| **DNS Records** | Same domain | Same domain | Same |
| **Email Auth** | SPF/DMARC/DKIM | SPF/DMARC/DKIM | Same |
| **Stripe** | Test mode | Live mode | Different |
| **Auth System** | Removed | Removed | Same |
| **Pricing** | $49 per bill | $49 per bill | Same |

---

## Critical Differences: Staging vs Production

### Backend Environment Names
- **Staging:** `Billuminate-staging-env-env`
- **Production:** `billuminatemd-prod`

### Git Branches
- **Staging:** `staging` branch
- **Production:** `main` branch

### Amplify Branches
- **Staging:** Auto-deploys from `staging` branch
- **Production:** Auto-deploys from `main` branch

### Stripe Keys (Need to Update for Production)
Currently using TEST keys in both environments.

**TODO before production:**
Update production backend env vars:
- STRIPE_SECRET_KEY (use live key: sk_live_...)
- STRIPE_PUBLISHABLE_KEY (use live key: pk_live_...)

Get live keys from: https://dashboard.stripe.com/apikeys

---

## Success Criteria for Production

Before considering production deployment successful:

✅ Frontend loads without errors
✅ /app page shows no login/signup buttons
✅ Bill upload works
✅ Support form sends emails
✅ Emails arrive in inbox (not spam)
✅ Payment flow works with Stripe
✅ Report unlock works after payment
✅ All marketing pages load correctly
✅ No console errors in browser
✅ Backend logs show no errors
✅ Email headers show full authentication pass

---

## Timeline Estimate

From decision to deploy to fully operational production:

- Code merge: 5 minutes
- Add env vars: 2 minutes
- Wait for deployment: 5-10 minutes
- Testing: 10-15 minutes
- Monitoring: 24 hours ongoing

**Total active work:** ~30 minutes
**Total calendar time:** 24 hours (including monitoring)

---

## Final Pre-Deployment Checklist

Before running ANY production deployment commands:

- [ ] All staging tests passed
- [ ] DKIM verification successful
- [ ] Support emails working perfectly
- [ ] No known bugs or issues
- [ ] Team informed of deployment
- [ ] Backup plan ready
- [ ] Monitoring tools ready
- [ ] Stripe LIVE keys ready (if accepting real payments)

**When all boxes are checked, you're ready for production deployment!**

---

**Current Status:** Waiting for staging verification
**Next Step:** Complete staging testing, then proceed with production deployment
**Estimated Production Deployment:** After staging verification (TBD)
