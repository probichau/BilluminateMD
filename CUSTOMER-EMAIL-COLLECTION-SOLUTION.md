# Customer Email Collection Solution

**Date:** 2026-01-24
**Priority:** CRITICAL - Blocking production deployment
**Status:** Design phase

---

## Problem Statement

Currently, when customers use the pay-per-use model:
1. Upload bill → Creates audit with `auditId`
2. Complete financial info → Analysis runs
3. Pay $49 → Report unlocks
4. Download results

**Critical Gap:** We have NO record of customer email or contact information.

This means we CANNOT:
- Send customers a copy of their report
- Follow up on support tickets (no way to link ticket → audit)
- Contact customers about their specific bill analysis
- Track which audit belongs to which customer
- Send payment receipts
- Provide customer support

---

## Current Data Flow

### What We Store:
```sql
audits table:
- audit_id (UUID)
- file_url
- provider_info (JSON)
- patient_info (JSON) - Contains patient name from BILL, not customer email
- service_info (JSON)
- financials (JSON)
- line_items (JSON)
- errors (JSON)
- charity_analysis (JSON)
- savings (JSON)
- is_paid (boolean)
- payment_intent_id (when paid)
- created_at
```

### What We DON'T Store:
- ❌ Customer email
- ❌ Customer phone number
- ❌ Any way to contact the person who paid

---

## Proposed Solutions

### Option 1: Collect Email During Payment (Recommended)

**When:** Before Stripe payment modal
**Where:** Add email field to PaymentModal.jsx

**Flow:**
1. User clicks "Unlock Report" → PaymentChoiceModal opens
2. PaymentChoiceModal shows email input field
3. User enters email → Opens PaymentModal (Stripe)
4. User pays → Backend receives:
   - `paymentIntentId`
   - `customerEmail` ← NEW
5. Backend stores customer email in audits table
6. Backend sends confirmation email with report link

**Pros:**
- Minimal friction (email already required by Stripe)
- Natural place to collect contact info
- Can send immediate payment receipt + report link
- Simple implementation

**Cons:**
- Email collection happens late in funnel (after they've seen preview)

**Implementation:**

1. Add `customer_email` column to `audits` table:
```sql
ALTER TABLE audits ADD COLUMN customer_email VARCHAR(255);
```

2. Update PaymentModal.jsx to collect email:
```javascript
// Add email state
const [email, setEmail] = useState('')

// Add email input before card element
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="your.email@example.com"
  required
/>
```

3. Update `/api/audit/:auditId/unlock` endpoint:
```javascript
export async function unlockReport(req, res) {
  const { auditId } = req.params
  const { paymentIntentId, customerEmail } = req.body // Add customerEmail

  // Store customer email with audit
  await markAuditAsPaid(auditId, paymentIntentId, customerEmail)

  // Send confirmation email via SES
  await sendPaymentConfirmation(customerEmail, auditId)

  res.json({ success: true })
}
```

4. Send confirmation email after payment:
```javascript
// Email template
Subject: Your BilluminateMD Report is Ready
Body:
  Thank you for your purchase!

  Your medical bill analysis is complete.
  View your full report: https://billuminate.com/results/{auditId}

  Potential savings identified: ${totalSavings}

  Questions? Reply to this email or visit /support
```

---

### Option 2: Collect Email Earlier (Financial Info Page)

**When:** During financial info submission
**Where:** FinancialInfoPage.jsx (alongside household income/size)

**Flow:**
1. User uploads bill → AI analysis
2. User sees FinancialInfoPage
3. Form includes:
   - Household income
   - Family size
   - **Email address** ← NEW
4. Submit → Audit created with customer email
5. Results page shows locked preview
6. User pays → Already have their email

**Pros:**
- Captures email earlier in funnel
- Can send "analysis complete" email even if they don't pay
- Better for abandoned cart follow-up
- Email collected before payment

**Cons:**
- Additional friction in conversion funnel
- User might not provide real email if they haven't decided to pay yet

---

### Option 3: Email Required After Upload

**When:** Immediately after bill upload
**Where:** New step between upload and financial info

**Flow:**
1. User uploads bill
2. **NEW STEP:** "Enter your email to receive results"
3. Proceed to financial info
4. Complete analysis
5. View results
6. Pay to unlock

**Pros:**
- Earliest capture point
- Can send status updates during analysis
- Better email deliverability (they're expecting email)

**Cons:**
- Most friction
- Might reduce conversion if required too early

---

## Recommended Approach: Option 1 (Email During Payment)

### Why Option 1:
1. **Minimal friction** - Email already expected at payment
2. **Simple implementation** - One component change
3. **Natural UX** - Stripe already asks for card details
4. **Payment receipt** - Can send immediate confirmation
5. **Works with Stripe** - Stripe recommends collecting email for receipts

### Implementation Plan:

#### Frontend Changes:
1. **PaymentModal.jsx** - Add email input field
2. **PaymentForm component** - Validate email before payment
3. **unlockReport API call** - Send customerEmail with paymentIntentId

#### Backend Changes:
1. **Database migration** - Add `customer_email` to audits table
2. **auditController.js** - Update `unlockReport()` to accept email
3. **databaseService.js** - Update `markAuditAsPaid()` to store email
4. **emailService.js** - Create `sendPaymentConfirmation()` function

#### Email Service:
```javascript
// backend/services/emailService.js
export async function sendPaymentConfirmation(customerEmail, audit) {
  const params = {
    Source: 'support@billuminate.com',
    Destination: {
      ToAddresses: [customerEmail]
    },
    Message: {
      Subject: {
        Data: 'Your BilluminateMD Report is Ready'
      },
      Body: {
        Html: {
          Data: `
            <h2>Thank you for your purchase!</h2>
            <p>Your medical bill analysis for <strong>${audit.providerInfo.facilityName}</strong> is complete.</p>
            <p><strong>Potential Savings: $${audit.savings.total.toFixed(2)}</strong></p>
            <p><a href="https://billuminate.com/results/${audit.auditId}">View Your Full Report</a></p>
            <p>Questions? Reply to this email or visit our <a href="https://billuminate.com/support">support page</a>.</p>
          `
        }
      }
    }
  }

  await sesClient.send(new SendEmailCommand(params))
}
```

---

## Support Ticket Correlation

Once we collect customer email, we can link support tickets to audits:

### Current Support Form:
```javascript
// User submits support ticket with:
{
  name: "John Doe",
  email: "john@example.com",
  subject: "Question about my bill",
  description: "I need help with my analysis"
}
```

### Enhanced Support Form:
Add optional field: "Audit ID (if applicable)"

```javascript
{
  name: "John Doe",
  email: "john@example.com",
  auditId: "abc-123-xyz", // OPTIONAL
  subject: "Question about my bill",
  description: "I need help with my analysis"
}
```

### Support Lookup:
When support team receives ticket:
1. Check if `auditId` provided → Direct link to audit
2. If no `auditId`, search audits by `customer_email`
3. Show all audits associated with that email

---

## Database Schema Update

```sql
-- Migration: Add customer email to audits
ALTER TABLE audits
ADD COLUMN customer_email VARCHAR(255);

-- Add index for support lookups
CREATE INDEX idx_audits_customer_email ON audits(customer_email);

-- Add index for audit ID + email combination
CREATE INDEX idx_audits_email_id ON audits(audit_id, customer_email);
```

---

## Testing Plan

### 1. Local Testing:
- [ ] Add email field to PaymentModal
- [ ] Test form validation (valid email required)
- [ ] Test payment flow with email
- [ ] Verify email stored in database
- [ ] Test confirmation email sent

### 2. Staging Testing:
- [ ] Upload test bill
- [ ] Complete financial info
- [ ] Click "Unlock Report"
- [ ] Enter test email
- [ ] Complete payment (Stripe test mode)
- [ ] Verify confirmation email received
- [ ] Check database has customer_email stored

### 3. Production Testing:
- [ ] Same flow with real payment
- [ ] Verify email arrives in customer inbox (not spam)
- [ ] Test support ticket lookup by email
- [ ] Verify support team can find customer audits

---

## Timeline

### Phase 1: Database + Backend (30 minutes)
- Add `customer_email` column to audits table
- Update `markAuditAsPaid()` function
- Update `unlockReport()` controller
- Create `sendPaymentConfirmation()` function

### Phase 2: Frontend (20 minutes)
- Add email input to PaymentModal.jsx
- Add email validation
- Update unlock API call to send email

### Phase 3: Testing (20 minutes)
- Test locally with Stripe test mode
- Test on staging
- Verify email delivery

### Phase 4: Support Integration (10 minutes)
- Add optional "Audit ID" field to support form
- Create support lookup by email query

**Total: ~1.5 hours**

---

## Production Deployment Blocker

**⚠️ CRITICAL: This must be implemented before production deployment**

**Current State:**
- Staging has authentication removed
- Pay-per-use flow works
- Email support system configured
- **BUT:** No way to contact paying customers

**Blocker Resolved When:**
- ✅ Customer email collected during payment
- ✅ Email stored in database
- ✅ Confirmation email sent after payment
- ✅ Support team can lookup audits by email
- ✅ Tested end-to-end on staging

---

## Alternative: Stripe Customer Portal

If we want more robust customer management, we could:

1. Create Stripe Customer objects with email
2. Link Stripe Customer to audit
3. Use Stripe's built-in receipt emails
4. Access Stripe dashboard for customer support

**Pros:**
- Stripe handles email delivery
- Built-in receipt system
- Customer payment history in Stripe

**Cons:**
- More complex implementation
- Still need our own database linkage
- Adds Stripe dependency for support

**Recommendation:** Start with Option 1 (simple email collection), upgrade to Stripe Customers later if needed.

---

## Next Steps

1. **Immediate:** Implement Option 1 (email during payment)
2. **Short-term:** Test thoroughly on staging
3. **Before production:** Verify email delivery and support lookup
4. **Future enhancement:** Consider Stripe Customer objects for better CRM

---

## Questions to Resolve

1. **Required vs Optional?** Should email be required to complete payment?
   - Recommendation: **Required** (needed for support)

2. **Email verification?** Should we verify email address?
   - Recommendation: **No** for MVP (adds friction), consider later

3. **Email format?** Plain text or HTML?
   - Recommendation: **HTML** (better branding, includes links)

4. **BCC support team?** Should support@ be BCC'd on confirmation emails?
   - Recommendation: **No** (too much noise), only on support tickets

5. **Resend capability?** Should customers be able to request email resend?
   - Recommendation: **Yes** - Add "Resend Report" button on results page

---

**Status:** Ready for implementation
**Estimated Time:** 1.5 hours
**Priority:** CRITICAL - Must complete before production deployment
