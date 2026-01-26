# Staging Backend 502 Error - Debugging Guide

**Status:** Application failing to start (HTTP 502)
**Environment:** Billuminate-staging-env-env
**Health:** Red (Severe)
**Error:** "100.0% of requests are failing with HTTP 5xx"

---

## Most Likely Causes

### 1. Missing S3_ENDPOINT Environment Variable

The backend uses CloudFlare R2 for storage, which requires `S3_ENDPOINT`.

**Check if missing:**
```bash
aws elasticbeanstalk describe-configuration-settings \
  --region us-east-1 \
  --application-name BilluminateMD \
  --environment-name "Billuminate-staging-env-env" \
  | grep S3_ENDPOINT
```

**Fix via AWS CLI:**
```bash
aws elasticbeanstalk update-environment \
  --region us-east-1 \
  --environment-name "Billuminate-staging-env-env" \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=S3_ENDPOINT,Value=https://5006c73e686abfd7056f05815abd8c2c.r2.cloudflarestorage.com
```

**Or via Console:**
- Go to EB Console → Configuration → Software → Edit
- Add: `S3_ENDPOINT` = `https://5006c73e686abfd7056f05815abd8c2c.r2.cloudflarestorage.com`

### 2. Import Error in emailService.js

The new `emailService.js` might have an issue.

**Quick Test - Comment Out Email Service:**

Edit `backend/controllers/auditController.js` line ~276:

```javascript
// Temporarily comment out email sending to test
if (customerEmail && audit) {
  try {
    // const { sendPaymentConfirmation } = await import('../services/emailService.js')
    // await sendPaymentConfirmation(customerEmail, audit)
    console.log(`Email would be sent to ${customerEmail}`)
  } catch (emailError) {
    console.error('Email error:', emailError.message)
  }
}
```

Redeploy and test.

### 3. Check Application Logs

**Via Console:**
1. Go to: https://console.aws.amazon.com/elasticbeanstalk/
2. Select: Billuminate-staging-env-env
3. Click: "Logs" → "Request Logs" → "Last 100 Lines"
4. Look for the actual error message

**Common errors to look for:**
- `Cannot find module` - Missing dependency
- `ECONNREFUSED` - Database connection failed
- `undefined is not a function` - Import error
- `listen EADDRINUSE` - Port already in use

### 4. Database Connection Issue

**Verify DATABASE_URL:**
```bash
aws elasticbeanstalk describe-configuration-settings \
  --region us-east-1 \
  --application-name BilluminateMD \
  --environment-name "Billuminate-staging-env-env" \
  | grep DATABASE_URL
```

Should be: `postgresql://postgres.bgliypuasymcpvydqmur:...@aws-1-us-east-1.pooler.supabase.com:5432/postgres`

---

## Quick Fix Steps

### Step 1: Check Missing Variables

Required environment variables:
- ✅ `ANTHROPIC_API_KEY`
- ✅ `DATABASE_URL`
- ✅ `AWS_ACCESS_KEY_ID`
- ✅ `AWS_SECRET_ACCESS_KEY`
- ✅ `AWS_BUCKET_NAME`
- ✅ `AWS_REGION`
- ❓ `S3_ENDPOINT` **← LIKELY MISSING**
- ✅ `STRIPE_SECRET_KEY`
- ✅ `SES_AWS_ACCESS_KEY_ID`
- ✅ `SES_AWS_SECRET_ACCESS_KEY`
- ✅ `SES_AWS_REGION`
- ✅ `SES_FROM_EMAIL`
- ✅ `SUPPORT_EMAIL`
- ✅ `JWT_SECRET` (just added)
- ✅ `PORT`
- ✅ `NODE_ENV`

### Step 2: Add S3_ENDPOINT (Most Likely Fix)

```bash
aws elasticbeanstalk update-environment \
  --region us-east-1 \
  --environment-name "Billuminate-staging-env-env" \
  --option-settings \
    Namespace=aws:elasticbeanstalk:application:environment,OptionName=S3_ENDPOINT,Value=https://5006c73e686abfd7056f05815abd8c2c.r2.cloudflarestorage.com
```

Wait 2-3 minutes, then test:
```bash
curl http://billuminate-staging.us-east-1.elasticbeanstalk.com/health
```

Should return: `{"status":"ok","message":"BilluminateMD API is running"}`

### Step 3: Check Logs

If still failing, get the actual error from logs:
1. EB Console → Logs → Request Last 100 Lines
2. Look for the first error message
3. Fix that specific error

---

## Rollback Option

If you need to get staging working quickly, rollback to previous version:

1. Go to EB Console → Application versions
2. Find last working version (before today)
3. Click "Deploy to Billuminate-staging-env-env"
4. Wait for deployment

**Note:** This removes support form and customer email features, but gets staging functional.

---

## Test After Fix

Once backend is healthy:

### 1. Health Check
```bash
curl http://billuminate-staging.us-east-1.elasticbeanstalk.com/health
```

### 2. Support Endpoint
```bash
curl -X POST http://billuminate-staging.us-east-1.elasticbeanstalk.com/api/support/submit \
  -H 'Content-Type: application/json' \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "subject":"Technical Problem",
    "priority":"Medium",
    "description":"Testing"
  }'
```

Expected: `{"success":true,"incidentNumber":"INC-...","message":"Support ticket submitted successfully"}`

### 3. Frontend Test
Visit: https://stage.billuminate.com/support
- Fill form
- Submit
- Should see success message

---

## Summary

**Most Likely Fix:** Add `S3_ENDPOINT` environment variable

**How to Add:**
- AWS CLI: Run command above
- OR Console: EB → Configuration → Software → Edit → Add variable

**After Adding:**
- Wait 2-3 minutes for restart
- Test health endpoint
- Test support form

**If Still Failing:**
- Check logs for actual error
- Look for missing dependencies or import errors
- Consider rollback to previous version

---

**Next Step:** Add S3_ENDPOINT and test
