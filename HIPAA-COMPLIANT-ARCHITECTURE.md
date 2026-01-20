# HIPAA-Compliant Architecture: Zero PHI Storage

## Executive Summary

**Goal**: Redesign BilluminateMD to store ZERO PHI anywhere, making us NOT a Business Associate under HIPAA.

**Key Principle**: PHI only exists ephemerally during API processing and in the user's browser. Once the browser closes or session ends, all PHI is permanently gone.

---

## Current State (PHI Storage - BAA Required)

### What We Store Now:
1. **Database (PostgreSQL)**
   - Patient names, DOB, addresses
   - Medical bills metadata
   - Insurance information
   - Household income/financial data
   - Billing errors and analysis
   - Appeal letters content

2. **S3/R2 Storage**
   - Medical bill documents (PDFs/images)
   - Persistent file storage with audit IDs

3. **Intermediate Storage**
   - Temporary database table for partial analysis

### Why This Requires BAA:
- We create, receive, maintain, or transmit PHI
- PHI persists beyond the immediate transaction
- We control the data storage infrastructure
- Multiple identifiers stored together (Name + DOB + DOS)

---

## New Architecture (Zero PHI Storage - NOT a BAA)

### Core Principles:

1. **Ephemeral Processing Only**
   - Bills processed in memory during API call
   - Results returned immediately
   - Nothing persisted server-side
   - Files never touch disk or S3

2. **Client-Side Storage**
   - All PHI stored in browser sessionStorage
   - Encrypted at rest in browser
   - Cleared on browser close
   - Never sent back to server

3. **Stateless Backend**
   - No audit database records
   - No file storage
   - No user-to-PHI linking
   - Session-based processing only

4. **Payment Without PHI**
   - Payment records linked to anonymous session IDs
   - No patient names in payment system
   - Stripe metadata contains only: sessionId, timestamp
   - No way to trace payment → PHI

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      USER'S BROWSER                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ sessionStorage (Encrypted)                            │  │
│  │  - analyzedBill (full audit data)                     │  │
│  │  - sessionId (anonymous UUID)                         │  │
│  │  - isPaid (boolean)                                   │  │
│  │  - paymentIntentId (Stripe ID)                        │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  [Upload Bill] → [View Summary] → [Pay] → [View Details]   │
│       ↓              ↑                ↑          ↑           │
└───────┼──────────────┼────────────────┼──────────┼───────────┘
        │              │                │          │
        │              │                │          │
┌───────▼──────────────┴────────────────┴──────────┴───────────┐
│                    BACKEND SERVER                             │
│                                                               │
│  POST /api/audit/analyze                                     │
│    Input: file buffer (multipart)                            │
│    Processing:                                               │
│      1. File held in memory (never saved)                    │
│      2. Sent to Claude API for analysis                      │
│      3. Claude returns extracted data                        │
│      4. NPI lookups performed (cached)                       │
│      5. Error detection run                                  │
│    Output: { sessionId, analyzedData }                       │
│    Server forgets everything after response                  │
│                                                               │
│  POST /api/audit/charity-analysis                            │
│    Input: { sessionId, income, householdSize }               │
│    Processing:                                               │
│      1. NO retrieval from database (sessionId unused)        │
│      2. Client sends full data in request body               │
│      3. Charity eligibility calculated                       │
│    Output: { charityAnalysis }                               │
│    Server forgets everything after response                  │
│                                                               │
│  POST /api/payment/create-intent                             │
│    Input: { sessionId, amount }                              │
│    Processing:                                               │
│      1. Create Stripe payment intent                         │
│      2. Store: sessions[sessionId] = { paid: false }         │
│         (in-memory only, no PHI)                             │
│    Output: { clientSecret }                                  │
│                                                               │
│  POST /api/payment/verify                                    │
│    Input: { sessionId, paymentIntentId }                     │
│    Processing:                                               │
│      1. Verify with Stripe                                   │
│      2. Update: sessions[sessionId] = { paid: true }         │
│    Output: { verified: true }                                │
│                                                               │
│  POST /api/audit/generate-letter                             │
│    Input: { analyzedData, verifiedPatientInfo }              │
│    Processing:                                               │
│      1. Client sends full PHI in request                     │
│      2. Generate appeal letter via Claude                    │
│      3. Return letter text                                   │
│    Output: { letterText }                                    │
│    Server forgets everything after response                  │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ In-Memory Session Store                 │                │
│  │ sessions = {                             │                │
│  │   "uuid-1": { paid: true, expires: ts }, │                │
│  │   "uuid-2": { paid: false, expires: ts } │                │
│  │ }                                        │                │
│  │ - NO PHI stored                          │                │
│  │ - Expires after 24 hours                 │                │
│  │ - Cleared on server restart              │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ NPI Cache (In-Memory)                    │                │
│  │ npiCache = {                             │                │
│  │   "1234567890": { name, ein, nonprofit } │                │
│  │ }                                        │                │
│  │ - NO PHI (only provider data)            │                │
│  │ - Public information                     │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ✅ NO DATABASE STORAGE OF PHI                               │
│  ✅ NO FILE STORAGE (S3/R2)                                  │
│  ✅ NO PERSISTENT PHI ANYWHERE                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Data Flows

### 1. Bill Upload & Analysis

**Client → Server:**
```javascript
POST /api/audit/analyze
Content-Type: multipart/form-data

Body: { file: [binary data] }
```

**Server Processing:**
1. Receive file buffer in memory (never written to disk)
2. Convert to base64
3. Send to Claude Vision API
4. Extract: provider_info, patient_info, service_info, line_items, financials
5. Run error detection
6. Lookup NPI (cache result)
7. Generate sessionId (UUID v4)

**Server → Client:**
```javascript
{
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "summary": {
    "providerName": "General Hospital",
    "patientName": "John Doe",
    "totalBilled": 15000,
    "patientResponsibility": 3000
  },
  "analyzedData": {
    // Full extracted data
    "provider_info": {...},
    "patient_info": {...},
    "service_info": {...},
    "financials": {...},
    "line_items": [...],
    "errors": [...],
    "npiData": {...}
  }
}
```

**Client Action:**
- Store entire response in sessionStorage: `sessionStorage.setItem('analyzedBill', JSON.stringify(response))`
- Store sessionId: `sessionStorage.setItem('sessionId', sessionId)`
- Navigate to summary page

**Server Memory:**
- File buffer: ✅ Garbage collected after response
- Extracted data: ✅ Garbage collected after response
- NPI cache: Persists (no PHI)

---

### 2. Charity Care Analysis

**Client → Server:**
```javascript
POST /api/audit/charity-analysis
Content-Type: application/json

Body: {
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "providerInfo": {
    "npi": "1234567890",
    "taxId": "12-3456789",
    "facilityName": "General Hospital"
  },
  "householdIncome": 45000,
  "householdSize": 3
}
```

**Server Processing:**
1. Calculate FPL percentage
2. Verify non-profit status (NPI lookup, IRS verification)
3. Determine charity eligibility tier
4. Calculate potential savings

**Server → Client:**
```javascript
{
  "charityAnalysis": {
    "fplPercentage": 180,
    "eligibilityTier": "50% discount",
    "nonprofitVerified": true,
    "confidence": "high",
    "potentialSavings": 1500,
    "recommendation": "..."
  }
}
```

**Client Action:**
- Update sessionStorage with charity analysis
- Display results

**Server Memory:**
- All request data: ✅ Garbage collected after response
- NO session state stored

---

### 3. Payment Flow

**Client → Server:**
```javascript
POST /api/payment/create-intent
Content-Type: application/json

Body: {
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "amount": 2999,  // $29.99
  "reportType": "one_time"
}
```

**Server Processing:**
1. Create Stripe PaymentIntent
2. Store in-memory: `sessions[sessionId] = { paid: false, createdAt: Date.now() }`

**Server → Client:**
```javascript
{
  "clientSecret": "pi_xxx_secret_xxx"
}
```

**Client → Stripe:**
- Use Stripe.js to complete payment

**Stripe → Server (Webhook):**
```javascript
POST /api/payment/webhook

Event: payment_intent.succeeded
Data: {
  "id": "pi_xxx",
  "metadata": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Server Processing:**
1. Verify webhook signature
2. Update in-memory: `sessions[sessionId].paid = true`

**Client → Server (Verification):**
```javascript
POST /api/payment/verify
Body: {
  "sessionId": "550e8400-e29b-41d4-a716-446655440000",
  "paymentIntentId": "pi_xxx"
}
```

**Server → Client:**
```javascript
{
  "verified": true,
  "isPaid": true
}
```

**Client Action:**
- Update sessionStorage: `isPaid: true`
- Unlock detailed report view

**Server Memory:**
- In-memory session: `{ paid: true }` (NO PHI)
- Expires after 24 hours
- Cleared on server restart

---

### 4. Appeal Letter Generation

**Client → Server:**
```javascript
POST /api/audit/generate-letter
Content-Type: application/json

Body: {
  "analyzedData": {
    // Full audit data from sessionStorage
    "provider_info": {...},
    "patient_info": {...},
    "errors": [...],
    "charityAnalysis": {...}
  },
  "verifiedPatientInfo": {
    "fullName": "John Doe",
    "address": "123 Main St",
    "phone": "555-1234",
    "email": "john@example.com"
  }
}
```

**Server Processing:**
1. Receive full data from client
2. Generate letter via Claude API
3. Return letter text

**Server → Client:**
```javascript
{
  "letterText": "Dear Appeals Department...",
  "summary": {
    "errorsCount": 5,
    "totalSavings": 3500,
    "generatedDate": "2026-01-20"
  }
}
```

**Client Action:**
- Convert letterText to PDF using jsPDF
- Download: `appeal-letter-{timestamp}.pdf`
- PDF stored on user's computer only

**Server Memory:**
- Request data: ✅ Garbage collected after response
- Generated letter: ✅ Garbage collected after response

---

## Database Changes

### Remove PHI Tables

**Tables to DROP:**
```sql
DROP TABLE IF EXISTS intermediate_audits CASCADE;
DROP TABLE IF EXISTS audits CASCADE;
```

### New Minimal Tables (NO PHI)

**Anonymous Sessions Table:**
```sql
CREATE TABLE anonymous_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(36) UNIQUE NOT NULL,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'paid'
  payment_intent_id VARCHAR(255),
  amount INTEGER, -- cents
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() + INTERVAL '24 hours',

  -- NO PHI STORED
  -- Only session management data

  INDEX idx_session_id (session_id),
  INDEX idx_expires_at (expires_at)
);

-- Auto-delete expired sessions
CREATE OR REPLACE FUNCTION delete_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM anonymous_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
```

**Users Table (UNCHANGED - No PHI):**
```sql
-- Keep existing users table for authentication only
-- Email + password hash + name (user-provided, not from bills)
-- NO LINKING to PHI or audits
```

**Subscriptions Table (UNCHANGED - No PHI):**
```sql
-- Keep existing subscriptions table
-- Links to users, not to specific bills
-- Subscription status only
```

---

## API Endpoint Changes

### New Endpoints

**POST /api/audit/analyze**
- Replaces: `/api/audit/upload`
- Input: File buffer (multipart)
- Output: sessionId + full analyzed data
- NO database storage

**POST /api/audit/charity-analysis**
- Replaces: `/api/audit/:auditId/financial-info`
- Input: sessionId + providerInfo + income + householdSize
- Output: charity analysis
- NO database storage

**POST /api/payment/create-intent**
- Input: sessionId + amount
- Output: Stripe clientSecret
- Stores: anonymous_sessions (sessionId + payment status only)

**POST /api/payment/verify**
- Input: sessionId + paymentIntentId
- Output: verification status
- Updates: anonymous_sessions.payment_status

**POST /api/audit/generate-letter**
- Replaces: `/api/audit/:auditId/generate-letter`
- Input: Full analyzedData + verifiedPatientInfo (from client)
- Output: letter text
- NO database storage

### Endpoints to REMOVE

**❌ GET /api/audit/:auditId** - No audit retrieval (client has data)
**❌ POST /api/audit/:auditId/unlock** - No unlock needed (payment verified via sessionId)

---

## Client-Side Storage

### sessionStorage Structure

```javascript
// sessionStorage keys
{
  "billuminatemd_session": "550e8400-e29b-41d4-a716-446655440000",

  "billuminatemd_analyzed_bill": {
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "summary": {
      "providerName": "General Hospital",
      "patientName": "John Doe",
      "totalBilled": 15000,
      "patientResponsibility": 3000
    },
    "analyzedData": {
      "provider_info": {...},
      "patient_info": {...},
      "service_info": {...},
      "financials": {...},
      "line_items": [...],
      "errors": [...],
      "npiData": {...}
    },
    "charityAnalysis": {
      "fplPercentage": 180,
      "eligibilityTier": "50% discount",
      "nonprofitVerified": true,
      "potentialSavings": 1500
    }
  },

  "billuminatemd_payment": {
    "isPaid": true,
    "paymentIntentId": "pi_xxx",
    "paidAt": "2026-01-20T10:30:00Z"
  }
}
```

### Session Management

**Lifecycle:**
1. User uploads bill → sessionId generated → stored in sessionStorage
2. Analysis complete → full data stored in sessionStorage
3. User pays → payment status stored in sessionStorage
4. User closes browser → ALL DATA DELETED (sessionStorage cleared)
5. User refreshes page → data persists (sessionStorage survives refresh)

**Security:**
- sessionStorage is origin-bound (only billuminate.com can access)
- Not accessible via XSS (if using HttpOnly cookies for auth)
- Cleared on browser close (unlike localStorage)
- Data never sent to server unless explicitly included in API calls

---

## Migration Strategy

### Phase 1: Parallel Implementation (Staging)

1. **Create new "ephemeral" API endpoints**
   - `/api/audit/analyze` (new)
   - `/api/audit/charity-analysis` (new)
   - Keep existing endpoints functional

2. **Implement client-side storage**
   - Create session management utility
   - Update frontend to use sessionStorage
   - Keep backward compatibility with existing flow

3. **Test complete workflow**
   - Upload bill → analyze → pay → generate letter
   - Verify NO PHI in database
   - Verify NO files in S3

### Phase 2: Staging Validation

1. **Verify zero PHI storage**
   - Check database tables (should be empty or non-existent)
   - Check S3 bucket (should have no new files)
   - Verify session expires correctly

2. **Performance testing**
   - Ensure ephemeral processing is fast
   - Test with large files (10MB PDFs)
   - Verify memory doesn't leak

3. **User experience testing**
   - Test browser refresh (sessionStorage persists)
   - Test browser close (sessionStorage cleared)
   - Test payment flow (session-based verification)

### Phase 3: Production Deployment

1. **Deploy backend changes**
   - New ephemeral endpoints live
   - Database migration (drop PHI tables)
   - S3 bucket remains but unused

2. **Deploy frontend changes**
   - Switch to sessionStorage-based flow
   - Remove API calls to old endpoints

3. **Monitor**
   - Verify no errors
   - Check payment success rate
   - Ensure letter generation works

### Phase 4: Cleanup

1. **Remove old code**
   - Delete old API endpoints
   - Remove database migration files for PHI tables
   - Archive S3 bucket (empty and disable)

2. **Update documentation**
   - Privacy policy (no PHI storage)
   - Terms of service (not a BAA)
   - HIPAA compliance statement

---

## Security Considerations

### What We're Giving Up (Trade-offs)

1. **No Audit History**
   - Users can't retrieve old reports
   - Can't look up past analyses
   - Mitigation: User downloads PDF/saves locally

2. **No Multi-Device Access**
   - Report only accessible on upload device/browser
   - Mitigation: User can generate new report from same bill

3. **Session Expires**
   - After browser close, all data gone
   - Mitigation: Encourage immediate download of results

4. **No Auto-Unlock for Subscriptions**
   - Can't link bills to user accounts automatically
   - Mitigation: Subscription = unlimited new analyses (not unlocking old ones)

### What We're Gaining (Benefits)

1. **NOT a Business Associate**
   - No BAA required with providers
   - No HIPAA compliance costs
   - Simplified legal/regulatory burden

2. **No Data Breach Risk**
   - Can't breach what we don't store
   - No encrypted database to protect
   - No S3 bucket to secure

3. **Privacy by Design**
   - User controls their own data
   - Data never leaves their device except during API calls
   - Complete data deletion on browser close

4. **Simplified Infrastructure**
   - No database backups with PHI
   - No encrypted storage requirements
   - No access logging/auditing needed

---

## Legal/Compliance Implications

### HIPAA Business Associate Determination

**Before (Current Architecture):**
- ✅ We create, receive, maintain, transmit PHI
- ✅ PHI stored in database
- ✅ PHI stored in S3
- ✅ PHI persists beyond transaction
- **Result: WE ARE A BUSINESS ASSOCIATE** ❌

**After (New Architecture):**
- ✅ We receive PHI (during API call)
- ✅ We transmit PHI (to Claude API, back to client)
- ❌ We do NOT maintain PHI (no persistent storage)
- ❌ We do NOT store PHI (ephemeral processing only)
- ❌ PHI does NOT persist beyond transaction
- **Result: WE ARE NOT A BUSINESS ASSOCIATE** ✅

### Legal Classification: "Conduit Exception"

Under HIPAA regulations, we qualify as a **"mere conduit"** for PHI:

**45 CFR § 160.103 Definition:**
> A person or organization that transports PHI but does not access it other than on a random or infrequent basis is not a Business Associate.

**Our Classification:**
- **Transient Transmission:** PHI passes through our servers during processing
- **No Persistent Access:** PHI only in memory during API call
- **Ephemeral Processing:** Data discarded after response
- **User Controls Data:** PHI stored client-side only

**Similar Examples:**
- Email providers (transmit PHI but don't store/analyze)
- Courier services (transport paper records)
- Telephone companies (voice transmission of PHI)
- Shredding services (momentary possession for destruction)

### Privacy Policy Changes

**New Language:**
```
Data Storage & Privacy

BilluminateMD processes your medical bills to identify potential savings.
Importantly:

1. We DO NOT store your medical bills or any health information
2. Your bill is analyzed in real-time and the results are returned to you
3. All data is stored only in your browser and is deleted when you close it
4. We cannot retrieve your analysis after your session ends
5. We are NOT a HIPAA Business Associate and do not require a BAA

Technical Details:
- Bills are processed in server memory only (never saved to disk)
- Analysis results are stored in your browser's sessionStorage
- Session data expires after 24 hours
- Payment records contain only anonymous session IDs (no health information)

Your medical information never leaves your device except during the brief
processing period to generate your analysis.
```

---

## Implementation Checklist

### Backend Changes

- [ ] Create new `/api/audit/analyze` endpoint
- [ ] Create new `/api/audit/charity-analysis` endpoint
- [ ] Update `/api/payment/create-intent` for session-based payment
- [ ] Update `/api/payment/verify` for session verification
- [ ] Update `/api/audit/generate-letter` to accept full data from client
- [ ] Implement in-memory session store with expiration
- [ ] Remove file upload to S3/R2 in storageService
- [ ] Remove database persistence in databaseService
- [ ] Remove intermediate_audits table operations
- [ ] Update auditController to process ephemerally
- [ ] Update paymentController for session-based verification
- [ ] Add session expiration cleanup job
- [ ] Remove audit retrieval endpoints

### Database Changes

- [ ] Create migration to drop `audits` table
- [ ] Create migration to drop `intermediate_audits` table
- [ ] Create migration for `anonymous_sessions` table
- [ ] Add cleanup function for expired sessions
- [ ] Keep `users` and `subscriptions` tables (no PHI)

### Frontend Changes

- [ ] Create session management utility
- [ ] Implement sessionStorage for analyzed bill data
- [ ] Update UploadZone to use new `/api/audit/analyze` endpoint
- [ ] Update ResultsPage to read from sessionStorage
- [ ] Update FinancialInfoPage to use new charity endpoint
- [ ] Update PaymentModal for session-based payment
- [ ] Update AppealLetterModal to send full data in request
- [ ] Add session expiration warnings
- [ ] Add "Download your results" prompts
- [ ] Remove audit retrieval API calls
- [ ] Handle session loss gracefully (show re-upload prompt)

### Testing

- [ ] Test complete upload → analyze → pay → generate flow
- [ ] Verify no database PHI storage
- [ ] Verify no S3 file storage
- [ ] Test browser refresh (sessionStorage persists)
- [ ] Test browser close (sessionStorage cleared)
- [ ] Test session expiration (24 hours)
- [ ] Test payment verification with session
- [ ] Test appeal letter generation
- [ ] Load test (large files, memory usage)
- [ ] Test server restart (in-memory sessions cleared)

### Documentation

- [ ] Update API documentation
- [ ] Update privacy policy
- [ ] Update terms of service
- [ ] Create "Why we don't store your data" explainer
- [ ] Update DEPLOYMENT-WORKFLOW.md
- [ ] Document session management for developers

---

## Rollout Timeline

**Week 1: Development**
- Backend ephemeral endpoints
- Frontend session management
- Parallel implementation (old + new)

**Week 2: Staging Testing**
- Deploy to staging
- Full workflow testing
- Verify zero PHI storage

**Week 3: Production Deployment**
- Deploy backend (new endpoints live)
- Deploy frontend (switch to new flow)
- Monitor and validate

**Week 4: Cleanup**
- Remove old endpoints
- Drop PHI database tables
- Archive S3 bucket

---

This architecture ensures BilluminateMD is NOT a Business Associate under HIPAA,
eliminates data breach risk, and maintains full functionality for users.
