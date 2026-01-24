# Staging URL Correction

**Issue:** Still getting JSON parse error after environment variable fix
**Root Cause:** Wrong backend URL configured
**Status:** Fixed - Redeploying (Job 29)

---

## The Problem

I initially set:
```
VITE_API_URL = https://stage-api.billuminate.com  ❌ WRONG
```

But the actual staging backend is at:
```
billuminate-staging.us-east-1.elasticbeanstalk.com  ✅ CORRECT
```

The URL `stage-api.billuminate.com` doesn't exist or isn't configured to point to the Elastic Beanstalk environment.

---

## Fix Applied

Updated environment variable to correct URL:

```bash
aws amplify update-branch \
  --app-id d83mc8ny8u2m7 \
  --branch-name staging \
  --environment-variables '{
    "VITE_API_URL":"https://billuminate-staging.us-east-1.elasticbeanstalk.com",
    "VITE_STRIPE_PUBLISHABLE_KEY":"pk_test_..."
  }'
```

**Result:** ✅ Updated
**Deployment:** Job 29 (RUNNING)
**ETA:** ~5 minutes

---

## Correct URLs

### Staging:
- **Frontend:** https://stage.billuminate.com
- **Backend API:** https://billuminate-staging.us-east-1.elasticbeanstalk.com
- **Support Endpoint:** https://billuminate-staging.us-east-1.elasticbeanstalk.com/api/support/submit

### Production (Future):
- **Frontend:** https://billuminate.com
- **Backend API:** https://api.billuminate.com OR the prod Elastic Beanstalk URL
- **Support Endpoint:** https://api.billuminate.com/api/support/submit

---

## After Deployment Completes

The support form will call:
```
POST https://billuminate-staging.us-east-1.elasticbeanstalk.com/api/support/submit
```

This should return proper JSON response with incident number.

---

## Monitoring Deployment

```bash
# Check status
aws amplify get-job --app-id d83mc8ny8u2m7 --branch-name staging --job-id 29

# When status shows SUCCEED, test at:
https://stage.billuminate.com/support
```

---

**Status:** Deploying with correct URL
**Job:** 29
**ETA:** 3-5 minutes from now
