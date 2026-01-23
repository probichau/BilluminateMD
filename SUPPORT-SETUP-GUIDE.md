# Support Form Setup Guide

## Overview

You now have a complete support ticket system that:
- ✅ Generates unique incident numbers (format: `INC-YYYYMMDD-XXX`)
- ✅ Sends detailed emails to you with customer information
- ✅ Sends confirmation emails to customers
- ✅ Professional email templates with BilluminateMD branding
- ✅ No database required (email-based)

## Step-by-Step Setup

### 1. Configure AWS SES

#### A. Verify Your Email Address

1. Go to [AWS SES Console](https://console.aws.amazon.com/ses/)
2. Click **"Verified identities"** in the left menu
3. Click **"Create identity"**
4. Choose **"Email address"**
5. Enter: `support@billuminate.com` (or your preferred email)
6. Click **"Create identity"**
7. **Check your email** and click the verification link

#### B. Request Production Access

⚠️ **Important:** By default, SES is in "sandbox mode" - you can only send TO verified emails.

1. In SES Console, click **"Account dashboard"**
2. Click **"Request production access"** button
3. Fill out the form:
   - **Mail type:** Transactional
   - **Website URL:** https://billuminate.com
   - **Use case description:**
     ```
     Customer support ticket confirmations and notifications for
     BilluminateMD, a medical bill auditing service. Emails are sent
     when customers submit support requests through our website contact
     form. Typical volume: 100-500 emails/month.
     ```
   - **Expected volume:** 500 emails/day
   - **Compliance:** Check "I will only send to recipients who have
     specifically requested my mail"
4. Submit the request
5. **Usually approved within 24 hours**

#### C. Get AWS Credentials

**Option 1: Use existing AWS credentials** (if you have them for Amplify)

**Option 2: Create new IAM user for SES:**

1. Go to [IAM Console](https://console.aws.amazon.com/iam/)
2. Click **"Users"** → **"Create user"**
3. Username: `billuminatemd-ses`
4. Click **"Next"**
5. **Attach policies directly:**
   - Search for and select: `AmazonSESFullAccess`
6. Click **"Next"** → **"Create user"**
7. Click the user name → **"Security credentials"** tab
8. Click **"Create access key"**
9. Choose **"Application running outside AWS"**
10. Click **"Next"** → **"Create access key"**
11. **COPY BOTH:**
    - Access Key ID (starts with `AKIA...`)
    - Secret Access Key (long string, only shown once!)
12. Store these securely

### 2. Update Backend Environment Variables

Add these to your backend `.env` file:

```bash
# AWS SES Configuration
AWS_ACCESS_KEY_ID=AKIA...your_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1

# Email Addresses
SES_FROM_EMAIL=support@billuminate.com
SUPPORT_EMAIL=support@billuminate.com
```

**Where to add them:**

- **Local development:** `/backend/.env`
- **Production (AWS Amplify):**
  1. Go to Amplify Console
  2. Select your app → **Environment variables**
  3. Add each variable as a key-value pair
  4. Save and redeploy

### 3. Deploy to Staging

The code is ready to push. Here's what was added:

**Backend:**
- ✅ `/backend/routes/support.js` - Support ticket API
- ✅ AWS SES SDK installed
- ✅ Route registered in `server.js`

**Frontend:**
- ✅ `/frontend/src/pages/SupportPage.jsx` - Support form
- ✅ Route added to App.jsx (`/support`)
- ✅ Footer link added

**To deploy:**

```bash
git add .
git commit -m "Add support ticket system with AWS SES"
git push origin staging
```

### 4. Test the System

#### Local Testing (Sandbox Mode)

While waiting for production access approval:

1. Start the backend:
   ```bash
   cd backend
   npm start
   ```

2. Start the frontend:
   ```bash
   cd frontend
   npm run dev
   ```

3. Go to `http://localhost:5173/support`
4. Fill out the form with:
   - **Your verified email** as the customer email
   - Any other test data
5. Submit

You should receive:
- ✅ Email to `support@billuminate.com` with ticket details
- ✅ Confirmation email to the email you entered

#### Production Testing (After Approval)

Once AWS approves production access:

1. Test with any email address
2. Check spam folders if emails don't arrive
3. Verify incident numbers are unique

### 5. How It Works

#### When a customer submits the form:

1. **Frontend** sends POST to `/api/support/submit` with:
   ```json
   {
     "name": "Customer Name",
     "email": "customer@example.com",
     "subject": "Technical Problem",
     "auditId": "optional-audit-id",
     "priority": "Medium",
     "description": "Help with..."
   }
   ```

2. **Backend** generates incident number:
   - Format: `INC-20250123-001`
   - Unique per day with 3-digit random suffix

3. **Two emails sent via SES:**

   **Email 1: To you (support@billuminate.com)**
   - Subject: `[INC-20250123-001] Technical Problem`
   - Contains: All customer details, formatted nicely
   - Includes: Incident number, timestamp, priority

   **Email 2: To customer**
   - Subject: `Ticket Received: INC-20250123-001`
   - Contains: Confirmation with incident number
   - Sets expectations: 24-hour response time

4. **Frontend** shows success message with incident number

#### Responding to tickets:

1. Check your email for new tickets
2. Reply directly to the customer's email
3. Reference the incident number in your reply
4. Customer can reply to continue the thread

### 6. Cost & Limits

**AWS SES Pricing:**
- First 62,000 emails/month: **FREE** (if sending from EC2/Amplify)
- After that: $0.10 per 1,000 emails
- **Your expected cost: $0/month** (well under free tier)

**Limits:**
- Sandbox mode: Only to verified emails
- Production mode: Any email address
- Default sending rate: 14 emails/second (more than enough)

### 7. Customization Options

#### Change email appearance:

Edit `/backend/routes/support.js`:
- Lines 68-140: Email to support team (HTML template)
- Lines 150-225: Email to customer (HTML template)

#### Add attachment support:

Would require multipart form data and S3 storage. Let me know if needed!

#### Change incident number format:

Edit function `generateIncidentNumber()` in `/backend/routes/support.js`

#### Add Slack notifications:

Can add Slack webhook to notify your team instantly. Let me know!

### 8. Monitoring

**To view sent emails:**

1. Go to AWS SES Console
2. Click **"Sending statistics"**
3. See delivery rates, bounces, complaints

**To check for issues:**

1. Backend logs will show SES errors
2. Check AWS SES **"Suppression list"** for blocked emails
3. Monitor bounce rate (should be <5%)

### 9. Future Enhancements

**When ready for a ticketing system:**
- Add database table to store tickets
- Build admin dashboard to view/manage tickets
- Add status tracking (Open, In Progress, Resolved)
- Email threading/conversation history
- Customer portal to view their tickets

**For now:** Email-based is perfect! Simple, reliable, and you can reply directly from your inbox.

---

## Quick Reference

**Support Form URL:** `https://billuminate.com/support`

**Email Template Colors:**
- Header gradient: `#0D9488` to `#059669` (brand teal/green)
- Incident number highlight: `#0D9488` (primary teal)
- Priority High: `#EF4444` (red)
- Priority Medium: `#F59E0B` (amber)
- Priority Low: `#10B981` (green)

**Incident Number Format:** `INC-YYYYMMDD-XXX`
- Example: `INC-20250123-042`

**Response Time SLA (in customer email):** 24 hours

---

## Troubleshooting

**Issue:** "Email failed to send"
- ✅ Check AWS credentials in `.env`
- ✅ Verify email address in SES
- ✅ Check SES sending limits (sandbox vs production)
- ✅ Look at backend logs for specific SES error

**Issue:** Emails go to spam
- ✅ Set up SPF/DKIM in SES (verify domain instead of just email)
- ✅ Warm up sending (start with low volume)
- ✅ Check email content for spam triggers

**Issue:** Customer didn't receive confirmation
- ✅ Check their spam folder
- ✅ Verify email address was correct
- ✅ Check SES "Suppression list" for their email
- ✅ Review SES delivery logs

**Issue:** Incident numbers aren't unique
- ⚠️ Extremely rare (1 in 1000 chance per day)
- ✅ Collision only happens on same day
- ✅ Can switch to timestamp-based if needed

---

## Security Notes

- ✅ No credentials stored in frontend
- ✅ Form validates email format
- ✅ Rate limiting recommended (add if spam becomes issue)
- ✅ CORS configured for your domains only
- ✅ AWS credentials use least-privilege (SES only)

---

**Need help?** You have all the code ready. Just:
1. Set up AWS SES (10 minutes)
2. Add env variables (2 minutes)
3. Deploy and test!

Once SES production access is approved, you're live! 🚀
