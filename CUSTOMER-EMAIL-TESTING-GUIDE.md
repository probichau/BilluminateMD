# Customer Email Collection - Testing Guide

**Date:** 2026-01-24
**Status:** Implementation Complete - Ready for Testing
**Branch:** staging

---

## ✅ Implementation Summary

We've successfully implemented customer email collection to resolve the critical production deployment blocker.

### Changes Made:

1. **Database Migration:**
   - Added `customer_email` VARCHAR(255) column to `audits` table
   - Created index on `customer_email` for efficient support lookups
   - Migration: `backend/migrations/004_add_customer_email.sql`

2. **Frontend Changes:**
   - Updated `PaymentModal.jsx` to collect email before card payment
   - Added email validation (must include "@")
   - Sends `customerEmail` to backend on unlock

3. **Backend Changes:**
   - Updated `unlockReport()` controller to accept `customerEmail`
   - Modified `markAuditAsPaid()` to store customer email
   - Created `emailService.js` for sending payment confirmations

4. **Email Service:**
   - Professional HTML receipt email with:
     - Report link
     - Savings amount
     - Payment receipt
     - Next steps
   - Sends automatically after successful payment

5. **Support Integration:**
   - Support form already has optional `auditId` field
   - Support team can now look up audits by customer email
   - Audit ID shown in support ticket emails

---

## 🧪 Local Testing

### Test 1: Email Collection in Payment Modal

**Steps:**
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`
3. Visit http://localhost:5173/app
4. Upload a test medical bill (use any PDF or image)
5. Complete financial info form
6. Click "Unlock Report" on results page
7. **Verify:** Email input field appears before card details
8. **Verify:** Placeholder text: "your.email@example.com"
9. **Verify:** Helper text: "We'll send your report and receipt to this email"

**Expected UI:**
```
Email Address *
[input field with placeholder]
We'll send your report and receipt to this email

Card Information
[Stripe card element]
```

### Test 2: Email Validation

**Steps:**
1. In payment modal, leave email blank
2. Enter card details
3. Click "Pay $49.00"
4. **Verify:** Error message: "Please enter a valid email address"

**Steps:**
1. Enter invalid email (e.g., "notanemail")
2. Click "Pay $49.00"
3. **Verify:** Error message appears

**Steps:**
1. Enter valid email (e.g., "test@example.com")
2. **Verify:** Can proceed to payment

### Test 3: Database Storage

**Prerequisites:**
- Use Stripe test card: 4242 4242 4242 4242
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC (e.g., 123)

**Steps:**
1. Enter your real email address (to receive confirmation)
2. Enter Stripe test card details
3. Complete payment
4. **Verify:** Payment succeeds
5. Check database:

```bash
cd backend && node -e "
const pg = require('pg');
require('dotenv').config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const result = await pool.query('SELECT audit_id, customer_email, is_paid FROM audits ORDER BY created_at DESC LIMIT 5');
  console.table(result.rows);
  await pool.end();
})();
"
```

6. **Verify:** `customer_email` column contains your email
7. **Verify:** `is_paid` is `true`

### Test 4: Confirmation Email Sent

**Prerequisites:**
- Backend must have SES credentials configured
- Use your real email address in test

**Steps:**
1. Complete payment with your email
2. Check your inbox
3. **Verify:** Email received from support@billuminate.com
4. **Verify:** Subject: "✅ Your BilluminateMD Report is Ready - $X.XX in Potential Savings"
5. **Verify:** Email contains:
   - Savings amount highlighted
   - "View Your Full Report" button/link
   - Payment receipt (Amount: $49.00, Report ID, Patient name, Provider)
   - Next steps instructions
   - Support link

**Email Screenshot Checklist:**
- [ ] Professional HTML formatting
- [ ] BilluminateMD header/branding
- [ ] Green savings box with dollar amount
- [ ] Blue CTA button
- [ ] Payment receipt details
- [ ] Footer with links

### Test 5: Report Link Works

**Steps:**
1. Open confirmation email
2. Click "View Your Full Report" button
3. **Verify:** Link goes to correct URL format: `https://stage.billuminate.com/results/{auditId}`
4. **Verify:** Results page loads
5. **Verify:** Full report is unlocked (no blur)
6. **Verify:** Can download appeal letter

---

## 🚀 Staging Testing

### Prerequisites:
- AWS Amplify frontend deployed from staging branch
- Elastic Beanstalk backend updated with SES credentials
- SES verified and DKIM passing

### Test 1: Full E2E Flow on Staging

**URL:** https://stage.billuminate.com

**Steps:**
1. Visit /app page
2. Upload test medical bill
3. Complete financial info
4. View results preview (blurred)
5. Click "Unlock Report"
6. **Verify:** Payment modal shows email field
7. Enter your email address
8. Enter Stripe TEST card: 4242 4242 4242 4242
9. Complete payment
10. **Verify:** Report unlocks
11. Check your email
12. **Verify:** Confirmation email received
13. Click report link in email
14. **Verify:** Link goes to correct audit

### Test 2: Support Ticket with Audit ID

**Steps:**
1. Complete a payment (get auditId from URL)
2. Visit https://stage.billuminate.com/support
3. Fill in support form
4. **Important:** Enter Audit ID in "Audit ID (Optional)" field
5. Submit ticket
6. **Verify:** Confirmation email includes incident number
7. Check support@billuminate.com
8. **Verify:** Support ticket email shows Audit ID field

### Test 3: Email Deliverability

**Steps:**
1. Complete payment with your email
2. Check email headers (View > Show Original in Gmail)
3. **Verify:** Authentication-Results shows:
   - `spf=pass`
   - `dkim=pass` (if DKIM verification complete)
   - `dmarc=pass`
4. **Verify:** Email in INBOX (not spam)

### Test 4: Database Verification (Staging)

**Query staging database:**
```bash
# From local machine with DATABASE_URL
node -e "
const pg = require('pg');
require('dotenv').config();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  const result = await pool.query(
    'SELECT audit_id, customer_email, is_paid, payment_intent_id, created_at FROM audits WHERE is_paid = true ORDER BY created_at DESC LIMIT 10'
  );
  console.log('Recent Paid Audits:');
  console.table(result.rows);

  // Test email lookup
  const email = 'YOUR_TEST_EMAIL@example.com';
  const emailResult = await pool.query(
    'SELECT audit_id, created_at FROM audits WHERE customer_email = $1',
    [email]
  );
  console.log(\`\\nAudits for \${email}:\`);
  console.table(emailResult.rows);

  await pool.end();
})();
"
```

**Verify:**
- Paid audits have customer email
- Can search audits by email
- Index makes lookup fast

---

## 🐛 Troubleshooting

### Issue: Email field not showing in payment modal

**Symptoms:** Payment modal opens but no email input

**Debug Steps:**
1. Check browser console for errors
2. Verify frontend deployed from latest staging commit
3. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
4. Check git commit: `git log -1 --oneline` should show "Implement customer email collection"

**Fix:** Redeploy frontend from staging branch

### Issue: Email not being saved to database

**Symptoms:** Payment succeeds but `customer_email` is NULL

**Debug Steps:**
1. Check backend logs for errors
2. Verify `customerEmail` in request body:
   ```bash
   # Check recent backend logs
   aws elasticbeanstalk retrieve-environment-info \
     --region us-east-1 \
     --environment-name Billuminate-staging-env-env \
     --info-type tail
   ```
3. Check database schema:
   ```sql
   SELECT column_name, data_type FROM information_schema.columns
   WHERE table_name = 'audits' AND column_name = 'customer_email';
   ```

**Fix:**
- Run migration manually if needed
- Verify backend code updated with customerEmail parameter

### Issue: Confirmation email not sent

**Symptoms:** Payment succeeds, email saved, but no confirmation email

**Debug Steps:**
1. Check backend logs for email send errors
2. Verify SES credentials in environment:
   ```bash
   aws elasticbeanstalk describe-configuration-settings \
     --application-name BilluminateMD \
     --environment-name Billuminate-staging-env-env \
     --query "ConfigurationSettings[0].OptionSettings[?Namespace=='aws:elasticbeanstalk:application:environment' && OptionName=='SES_FROM_EMAIL'].Value"
   ```
3. Test SES manually:
   ```bash
   aws ses send-email \
     --from support@billuminate.com \
     --destination ToAddresses=your-email@example.com \
     --message Subject={Data="Test"},Body={Text={Data="Test"}} \
     --region us-east-1
   ```

**Fix:**
- Verify SES credentials configured
- Check SES sending quota
- Verify DKIM status

### Issue: Emails going to spam

**Symptoms:** Email sent but arrives in spam folder

**Debug Steps:**
1. Check email headers for authentication results
2. Verify DKIM verification status:
   ```bash
   aws ses get-identity-dkim-attributes \
     --identities support@billuminate.com \
     --region us-east-1
   ```
3. Check DMARC policy:
   ```bash
   dig _dmarc.billuminate.com TXT +short
   ```

**Fix:**
- Wait for DKIM verification to complete
- Mark test emails as "Not Spam" to train filters
- Check SPF/DMARC records in DNS

---

## ✅ Production Readiness Checklist

Before deploying to production, verify ALL items:

### Database:
- [ ] Migration run successfully on staging
- [ ] `customer_email` column exists in audits table
- [ ] Index created on `customer_email`
- [ ] Test queries by email work

### Frontend:
- [ ] PaymentModal shows email input field
- [ ] Email validation works (requires "@")
- [ ] Email sent to backend with payment
- [ ] Staging deployment successful

### Backend:
- [ ] `unlockReport()` accepts customerEmail
- [ ] `markAuditAsPaid()` stores email
- [ ] Email service imported and called
- [ ] No errors in logs
- [ ] Staging deployment successful

### Email System:
- [ ] SES credentials configured
- [ ] DKIM verification: Success
- [ ] Test confirmation email sent
- [ ] Email arrives in inbox (not spam)
- [ ] All links in email work
- [ ] HTML formatting displays correctly

### Support Integration:
- [ ] Support form has Audit ID field
- [ ] Audit ID sent in support emails
- [ ] Can lookup audits by email in database

### Testing:
- [ ] Local testing completed
- [ ] Staging E2E flow tested
- [ ] Multiple test payments verified
- [ ] Email deliverability confirmed
- [ ] Database queries tested

---

## 📊 Metrics to Monitor

After production deployment:

### Day 1:
- Email collection rate (% of payments with email)
- Email delivery rate (sent vs bounced)
- Email inbox rate (inbox vs spam)
- Support ticket correlation rate (% with audit ID)

### Week 1:
- Customer email engagement (link clicks)
- Support ticket resolution time
- Email authentication pass rates (SPF, DKIM, DMARC)

### Month 1:
- Email reputation score
- Customer satisfaction with receipts
- Support team efficiency gains

---

## 🎯 Success Criteria

The implementation is successful when:

1. ✅ 100% of paying customers provide email
2. ✅ 100% of paid audits have customer_email stored
3. ✅ 95%+ of confirmation emails delivered
4. ✅ 90%+ of emails land in inbox (not spam)
5. ✅ Support team can lookup customer audits
6. ✅ No payment failures due to email collection
7. ✅ Email authentication passes (SPF + DKIM + DMARC)

---

## 📝 Post-Production Tasks

### Immediate (Day 1):
- Monitor email send success rate
- Check for any email delivery errors
- Verify customers receiving emails
- Test support ticket lookup

### Short-term (Week 1):
- Collect customer feedback on emails
- Monitor spam complaints
- Analyze email open rates
- Review support ticket correlation

### Long-term (Month 1):
- A/B test email templates
- Add email preference center
- Consider email marketing integration
- Implement resend capability

---

**Current Status:** Implementation complete, ready for testing
**Next Step:** Complete local testing, then staging testing
**Production Deploy:** After all checklist items verified ✅
