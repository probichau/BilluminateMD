# Fix Staging Support Form Error

**Error:** `Unexpected token '<', "<!DOCTYPE "... is not valid JSON`
**Root Cause:** AWS Amplify staging environment missing `VITE_API_URL` environment variable
**Status:** Needs configuration update

---

## Problem Analysis

When you submit a support ticket on https://stage.billuminate.com/support, the frontend tries to call:
```
POST to: undefined/api/support/submit
```

Because `import.meta.env.VITE_API_URL` is undefined, it falls back to the config default:
```javascript
// frontend/src/config.js
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

Since the frontend is running on HTTPS and trying to call HTTP localhost (which doesn't exist), the browser likely gets a network error or CORS error that returns an HTML error page instead of JSON, hence the parsing error.

---

## Solution

Add `VITE_API_URL` environment variable to AWS Amplify staging configuration.

### Step 1: Add Environment Variable in AWS Amplify

1. **Go to AWS Amplify Console:**
   https://console.aws.amazon.com/amplify/

2. **Select BilluminateMD app**

3. **Click on "staging" branch** in the left sidebar

4. **Go to Environment variables:**
   - Click "Environment variables" in the left menu
   - OR: App settings → Environment variables

5. **Add variable:**
   - Click "Add variable" or "Manage variables"
   - Key: `VITE_API_URL`
   - Value: `https://stage-api.billuminate.com`
   - Click "Save"

6. **Redeploy:**
   - After saving, Amplify may auto-trigger a new build
   - If not, click "Redeploy this version" on the staging branch
   - Wait 3-5 minutes for build to complete

### Step 2: Verify Configuration

After deployment completes:

1. Visit: https://stage.billuminate.com/support
2. Open browser console (F12)
3. Submit a test ticket
4. Check the network tab for the API call
5. **Verify:** Request goes to `https://stage-api.billuminate.com/api/support/submit`
6. **Verify:** Response is JSON (not HTML)

---

## Additional Environment Variables Needed

While you're in the Amplify environment variables, also add:

### Stripe Public Key
```
Key: VITE_STRIPE_PUBLISHABLE_KEY
Value: pk_test_51Sr3L0Q7nTHP9xHXgChpmIYUxFAAJWmoHDCR2mggUQdyL0drxh2MyVz9TdtnQCgp9r0X4K0uFPeVe6uSP2hExlYO00UMaCjEYr
```

This ensures payment modal works correctly on staging.

---

## Alternative: Check Current Env Vars

To see if `VITE_API_URL` is already set (but with wrong value):

1. Go to Amplify Console → BilluminateMD → staging
2. App settings → Environment variables
3. Look for `VITE_API_URL`
4. If it exists but is wrong (e.g., pointing to localhost or old URL), update it
5. If it doesn't exist, add it

---

## Expected Behavior After Fix

### Before (Current):
```
Frontend: https://stage.billuminate.com/support
API Call: undefined/api/support/submit
Result: Network error → HTML error page → JSON parse error
```

### After (Fixed):
```
Frontend: https://stage.billuminate.com/support
API Call: https://stage-api.billuminate.com/api/support/submit
Result: JSON response → Success message → Incident number displayed
```

---

## Testing After Fix

1. **Visit support page:**
   https://stage.billuminate.com/support

2. **Fill out form:**
   - Name: Test User
   - Email: your-email@example.com
   - Subject: Technical Problem
   - Audit ID: (leave blank or enter test ID)
   - Priority: Medium
   - Description: Testing support form after env var fix

3. **Submit and verify:**
   - Form submits successfully
   - Success message shows
   - Incident number displayed (e.g., INC-20260124-001)
   - TWO emails received:
     - To: support@billuminate.com (your email via ImprovMX)
     - To: your-email@example.com (customer confirmation)

4. **Check browser console:**
   - No errors
   - Network tab shows successful POST to `stage-api.billuminate.com`

---

## Root Cause Explanation

This is a common deployment issue where:

1. **Local development** works because `.env` file has `VITE_API_URL=http://localhost:3001`
2. **Staging deployment** fails because Amplify doesn't automatically copy `.env` files
3. **Environment variables must be configured in Amplify UI** for each branch/environment

This is by design for security - you don't want to commit API URLs and keys to git.

---

## Similar Issue: Payment Flow

The same fix applies to the payment flow. If customers can't pay on staging, it's likely the same missing env var issue:

```
VITE_API_URL → Needed for /api/payment/create-intent endpoint
VITE_STRIPE_PUBLISHABLE_KEY → Needed for Stripe.js
```

Both must be set in Amplify environment variables.

---

## Production Note

When deploying to production (main branch), you'll need to set the same variables but with production values:

```
VITE_API_URL=https://api.billuminate.com
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx (your LIVE key)
```

---

## Quick Fix Commands (If Using AWS CLI)

If you prefer using AWS CLI instead of the console:

```bash
# Note: Amplify CLI doesn't support env var updates directly
# You must use the console UI or AWS Amplify API

# But you can check current env vars:
aws amplify get-app --app-id <your-app-id> --query "app.environmentVariables"
```

**Recommendation:** Use the Amplify Console UI - it's faster and shows the variables clearly.

---

## Status After Fix

Once `VITE_API_URL` is added to Amplify staging environment:

- ✅ Support form will work
- ✅ Payment flow will work (if `VITE_STRIPE_PUBLISHABLE_KEY` also added)
- ✅ All API calls will go to correct backend
- ✅ No more JSON parse errors
- ✅ CORS will work (backend already configured for stage.billuminate.com)

---

## Verification Checklist

After adding environment variables and redeploying:

- [ ] Support form submits successfully
- [ ] Incident number displayed
- [ ] Confirmation emails received (2 emails)
- [ ] No console errors
- [ ] Network tab shows calls to stage-api.billuminate.com
- [ ] Payment modal can be tested (if testing payment flow)

---

**Priority:** HIGH - Blocking staging testing
**Time to Fix:** 5 minutes (add env var + redeploy)
**Testing:** 2 minutes (submit test ticket)

Let me know once you've added the environment variable and I can help verify the fix!
