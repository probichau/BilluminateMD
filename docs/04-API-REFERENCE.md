# API Reference

Complete documentation for BilluminateMD backend API.

---

## Base URL

**Development**: `http://localhost:3001`
**Production**: `https://your-api.railway.app` (or your deployed URL)

---

## Authentication

Currently, the API does not require authentication. All endpoints are public.

**Future**: Consider adding API keys or JWT tokens for production to prevent abuse.

---

## Endpoints

### 1. Health Check

Check if the API is running.

```http
GET /health
```

**Response** (200 OK):
```json
{
  "status": "ok",
  "message": "BilluminateMD API is running"
}
```

---

### 2. Upload Bill

Upload a medical bill (image or PDF) for analysis.

```http
POST /api/audit/upload
Content-Type: multipart/form-data
```

**Request Body**:
- `bill` (file): Image (JPG, PNG, HEIC) or PDF file (max 10MB)

**Example** (using curl):
```bash
curl -X POST http://localhost:3001/api/audit/upload \
  -F "bill=@/path/to/medical-bill.pdf"
```

**Response** (200 OK):
```json
{
  "auditId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "message": "Bill processed successfully"
}
```

**Error Responses**:

- `400 Bad Request`: No file uploaded or invalid file type
```json
{
  "error": "No file uploaded"
}
```

- `500 Internal Server Error`: AI analysis or processing failed
```json
{
  "error": "Failed to process bill",
  "details": "AI analysis failed: ..."
}
```

**Processing Steps**:
1. File uploaded to storage (S3 or local)
2. AI extracts data using Claude Vision
3. Error detection algorithms run
4. Results stored in database
5. Audit ID returned

---

### 3. Get Audit Results

Retrieve the analysis results for a specific audit.

```http
GET /api/audit/:auditId
```

**Path Parameters**:
- `auditId` (string): The audit ID returned from upload

**Example**:
```bash
curl http://localhost:3001/api/audit/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

**Response** (200 OK):
```json
{
  "auditId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "fileUrl": "https://bucket.s3.amazonaws.com/bills/...",
  "providerInfo": {
    "facilityName": "ABC Medical Center",
    "providerName": "Dr. John Smith",
    "npi": "1234567890",
    "address": "123 Main St, City, ST 12345",
    "phone": "(555) 123-4567"
  },
  "patientInfo": {
    "name": "Jane Doe",
    "dob": "1985-06-15",
    "address": "456 Oak Ave, City, ST 12345",
    "memberId": "ABC123456",
    "insuranceCompany": "Blue Cross Blue Shield"
  },
  "serviceInfo": {
    "dateOfService": "2024-01-15",
    "admissionDate": null,
    "dischargeDate": null,
    "serviceType": "Outpatient"
  },
  "lineItems": [
    {
      "cptCode": "99213",
      "revenueCode": null,
      "description": "Office visit, established patient, level 3",
      "quantity": 1,
      "billedAmount": 150.00,
      "dateOfService": "2024-01-15"
    },
    {
      "cptCode": "80053",
      "revenueCode": null,
      "description": "Comprehensive metabolic panel",
      "quantity": 1,
      "billedAmount": 75.00,
      "dateOfService": "2024-01-15"
    }
  ],
  "financials": {
    "totalBilled": 225.00,
    "insurancePayment": 150.00,
    "insuranceDiscount": 25.00,
    "copay": 20.00,
    "deductible": 0.00,
    "patientResponsibility": 50.00
  },
  "errors": [
    {
      "type": "Price Anomaly",
      "severity": "medium",
      "cptCode": "99213",
      "description": "99213 - Office visit, established patient, level 3",
      "explanation": "This service is billed at $150.00, which is 161% of the Medicare allowable rate ($93.00)...",
      "potentialSavings": 57.00,
      "actionableAdvice": "Reference the Medicare allowable rate of $93.00 for 99213...",
      "dateOfService": "2024-01-15"
    }
  ],
  "isPaid": false,
  "paymentIntentId": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses**:

- `404 Not Found`: Audit ID doesn't exist
```json
{
  "error": "Audit not found"
}
```

**Note**: The frontend handles blurring the `errors` array if `isPaid` is `false`. The backend always returns the full data.

---

### 4. Unlock Report

Mark an audit as paid after successful payment.

```http
POST /api/audit/:auditId/unlock
Content-Type: application/json
```

**Path Parameters**:
- `auditId` (string): The audit ID

**Request Body**:
```json
{
  "paymentIntentId": "pi_1234567890abcdef"
}
```

**Example**:
```bash
curl -X POST http://localhost:3001/api/audit/a1b2c3d4.../unlock \
  -H "Content-Type: application/json" \
  -d '{"paymentIntentId": "pi_1234567890abcdef"}'
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Report unlocked successfully"
}
```

**Error Responses**:

- `400 Bad Request`: Missing payment intent ID
- `500 Internal Server Error`: Database update failed

---

### 5. Create Payment Intent

Create a Stripe payment intent for unlocking a report.

```http
POST /api/payment/create-intent
Content-Type: application/json
```

**Request Body**:
```json
{
  "auditId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "amount": 999
}
```

**Note**: Amount is in cents (999 = $9.99)

**Example**:
```bash
curl -X POST http://localhost:3001/api/payment/create-intent \
  -H "Content-Type: application/json" \
  -d '{"auditId": "a1b2c3d4...", "amount": 999}'
```

**Response** (200 OK):
```json
{
  "clientSecret": "pi_1234567890_secret_abcdefghijklmnop"
}
```

**Usage**: Pass this `clientSecret` to Stripe.js on the frontend to complete payment.

**Error Responses**:

- `400 Bad Request`: Missing required fields
- `500 Internal Server Error`: Stripe API error

---

### 6. Stripe Webhook

Receives webhook events from Stripe (for server-side verification).

```http
POST /api/payment/webhook
Content-Type: application/json
Stripe-Signature: <signature>
```

**Note**: This endpoint is called by Stripe, not by your frontend.

**Setup**:
1. Stripe Dashboard > Webhooks > Add Endpoint
2. URL: `https://your-api.railway.app/api/payment/webhook`
3. Events: Select `payment_intent.succeeded`

**Response** (200 OK):
```json
{
  "received": true
}
```

---

## Error Codes

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad Request (missing parameters, invalid input) |
| 404 | Not Found (audit ID doesn't exist) |
| 500 | Internal Server Error (AI failed, database error, etc.) |

---

## Rate Limiting

**Current**: No rate limiting implemented

**Recommended for Production**:
```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 uploads per 15 minutes per IP
})

app.use('/api/audit/upload', limiter)
```

---

## CORS Configuration

**Development**: Allows all origins

**Production**: Should be restricted to your frontend domain

```javascript
// backend/server.js
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'https://billuminatemd.com',
  credentials: true,
}

app.use(cors(corsOptions))
```

---

## Data Retention

**Current**: No automatic deletion

**Recommended Policy**:
- Delete uploaded files after 30 days
- Keep audit results for 1 year
- Anonymize after dispute is resolved

**Implementation** (future):
```sql
-- Cron job to delete old files
DELETE FROM audits WHERE created_at < NOW() - INTERVAL '30 days';
```

---

## Webhooks

### Future: Outbound Webhooks

Allow users to receive notifications when audit is complete:

```http
POST https://user-webhook-url.com/audit-complete
Content-Type: application/json
X-Webhook-Signature: <hmac-sha256>
```

**Payload**:
```json
{
  "event": "audit.completed",
  "auditId": "a1b2c3d4...",
  "errorsFound": 3,
  "potentialSavings": 450.00
}
```

---

## Testing the API

### Manual Testing with curl

**Upload a bill**:
```bash
curl -X POST http://localhost:3001/api/audit/upload \
  -F "bill=@test-bill.pdf"
```

**Get results**:
```bash
curl http://localhost:3001/api/audit/<audit-id>
```

### Automated Testing with Postman

Import this collection: (to be created - `postman-collection.json`)

### Integration Tests

```bash
cd backend
npm test  # (requires test suite to be written)
```

---

## SDK / Client Libraries

**JavaScript/TypeScript**:
```typescript
// frontend/src/services/apiClient.ts
class BilluminateAPI {
  async uploadBill(file: File): Promise<string> {
    const formData = new FormData()
    formData.append('bill', file)

    const response = await fetch('/api/audit/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    return data.auditId
  }

  async getAudit(auditId: string): Promise<Audit> {
    const response = await fetch(`/api/audit/${auditId}`)
    return response.json()
  }
}
```

---

## Performance

**Expected Response Times**:
- Health check: <50ms
- Upload bill: 30-60 seconds (due to AI processing)
- Get audit: <200ms
- Create payment intent: <500ms

**Optimization Tips**:
- Add Redis caching for CPT code lookups
- Compress images before AI analysis
- Use database connection pooling
- Enable gzip compression on responses

---

## Security

### Input Validation

All endpoints validate:
- File size limits (10MB)
- File types (images, PDFs only)
- Required fields present
- Valid UUID format for auditId

### Sensitive Data

**Never log**:
- Patient names
- Dates of birth
- Member IDs
- Credit card details

**Encryption**:
- Use HTTPS in production
- Database connection uses SSL
- Files stored with private ACL

---

## Changelog

### v1.0.0 (Initial Release)
- POST /api/audit/upload
- GET /api/audit/:auditId
- POST /api/audit/:auditId/unlock
- POST /api/payment/create-intent
- POST /api/payment/webhook

### Future Versions
- v1.1.0: Add user accounts and authentication
- v1.2.0: Add FHIR endpoints
- v1.3.0: Add batch upload support
