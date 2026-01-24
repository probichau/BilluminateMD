# Deploy Backend to Staging - Manual Steps Required

**Issue:** Support form failing because staging backend doesn't have latest code
**Root Cause:** Elastic Beanstalk doesn't auto-deploy from git (unlike Amplify)
**Status:** Backend code ready, needs deployment

---

## Problem

The staging backend at `billuminate-staging.us-east-1.elasticbeanstalk.com` is running old code that doesn't include:
- `/api/support` route (support.js)
- `/api/audit/:auditId/unlock` with customer email support (updated auditController.js)
- Email service (emailService.js)
- Customer email database migration

**Result:** Support form returns `Cannot POST /api/support/submit` (404 error)

---

## Solution: Deploy Backend via EB CLI

The easiest way to deploy is using the Elastic Beanstalk CLI (`eb`).

### Option 1: Install EB CLI (Recommended)

```bash
# Install EB CLI
pip install awsebcli --upgrade --user

# Navigate to backend directory
cd backend

# Deploy to staging
eb deploy Billuminate-staging-env-env

# Monitor deployment
eb status Billuminate-staging-env-env
```

### Option 2: Deploy via AWS Console

1. **Create deployment package:**
   ```bash
   cd backend
   zip -r ../staging-deploy.zip . -x "*.git*" -x "node_modules/*" -x ".env" -x "*.log"
   ```

2. **Upload to Elastic Beanstalk:**
   - Go to: https://console.aws.amazon.com/elasticbeanstalk/
   - Select: Bill

uminateMD application
   - Click: Billuminate-staging-env-env environment
   - Click: "Upload and deploy"
   - Choose file: staging-deploy.zip
   - Version label: `v260124-customer-email-support`
   - Click: "Deploy"

3. **Wait for deployment** (~3-5 minutes)

---

## What This Deployment Includes

### New Features:
- ✅ Support ticket submission endpoint (`/api/support/submit`)
- ✅ Customer email collection in payment flow
- ✅ Automatic email confirmation after payment
- ✅ Email service via AWS SES
- ✅ Database migration (customer_email column)

### New Files:
- `routes/support.js` - Support ticket API
- `services/emailService.js` - SES email sending
- `migrations/004_add_customer_email.sql` - Database schema update
- `controllers/auditController.js` - Updated unlock endpoint
- `services/databaseService.js` - Updated markAuditAsPaid function

---

## After Deployment

### 1. Verify Backend Health

```bash
curl http://billuminate-staging.us-east-1.elasticbeanstalk.com/health
# Should return: {"status":"ok","message":"BilluminateMD API is running"}
```

### 2. Test Support Endpoint

```bash
curl -X POST http://billuminate-staging.us-east-1.elasticbeanstalk.com/api/support/submit \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Test",
    "email":"test@example.com",
    "subject":"Test",
    "priority":"Medium",
    "description":"Test"
  }'
```

Expected response:
```json
{
  "success": true,
  "incidentNumber": "INC-20260124-001",
  "message": "Support ticket submitted successfully"
}
```

### 3. Test on Frontend

Visit: https://stage.billuminate.com/support
- Fill out form
- Submit
- Verify: Success message + incident number
- Check email: 2 emails received

---

## Current Deployment Status

**Staging Backend:**
- URL: `billuminate-staging.us-east-1.elasticbeanstalk.com`
- Status: Healthy (but old code)
- Missing: Support routes, customer email features

**Staging Frontend:**
- URL: `stage.billuminate.com`
- Status: ✅ Deployed with correct API URL
- Environment Variables: ✅ Configured correctly

---

## Why AWS CLI Deployment Failed

Attempted deployment via AWS CLI:
```bash
aws elasticbeanstalk create-application-version --version-label ...
aws elasticbeanstalk update-environment --version-label ...
```

**Issue:** Application version stuck in "UNPROCESSED" state
**Reason:** EB requires special handling for Node.js applications
**Solution:** Use EB CLI (`eb deploy`) which handles this automatically

---

## Alternative: CI/CD Pipeline (Future)

Set up GitHub Actions to auto-deploy staging branch:

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging
on:
  push:
    branches: [staging]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EB
        run: |
          pip install awsebcli
          cd backend
          eb deploy Billuminate-staging-env-env
```

This would make staging backend auto-deploy like the frontend does.

---

## Quick Fix Summary

**Immediate:** Install EB CLI and run `eb deploy`
**Time:** 5 minutes install + 3-5 minutes deployment
**Complexity:** Low (single command after install)

```bash
# One-time setup
pip install awsebcli --upgrade --user

# Deploy (from backend directory)
cd backend
eb deploy Billuminate-staging-env-env
```

**After this:** Support form and customer email collection will work on staging!

---

**Status:** Waiting for backend deployment
**Blocker:** Manual deployment step required (EB doesn't auto-deploy from git)
**Next:** Install EB CLI → Deploy → Test support form
