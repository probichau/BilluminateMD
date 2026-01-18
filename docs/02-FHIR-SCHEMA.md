# FHIR-Inspired Data Schema

## Overview
BilluminateMD's data structure is loosely based on FHIR (Fast Healthcare Interoperability Resources) standards, specifically:
- **Patient Resource**: Patient demographics
- **Practitioner/Organization Resources**: Provider information
- **Claim Resource**: Billing details and line items
- **ExplanationOfBenefit**: Insurance adjustments and patient responsibility

This design prepares the application for future integration with SMART on FHIR and patient portal connections (Epic MyChart, Cerner, etc.).

---

## Core Data Structure

### Complete Audit Result Schema

```json
{
  "auditId": "uuid-v4-string",
  "fileUrl": "string (S3 URL or local path)",
  "providerInfo": {
    "facilityName": "string",
    "providerName": "string | null",
    "npi": "string | null",
    "address": "string | null",
    "phone": "string | null"
  },
  "patientInfo": {
    "name": "string",
    "dob": "YYYY-MM-DD",
    "address": "string | null",
    "memberId": "string | null",
    "insuranceCompany": "string | null"
  },
  "serviceInfo": {
    "dateOfService": "YYYY-MM-DD",
    "admissionDate": "YYYY-MM-DD | null",
    "dischargeDate": "YYYY-MM-DD | null",
    "serviceType": "string | null"
  },
  "lineItems": [
    {
      "cptCode": "string (5 digits)",
      "revenueCode": "string | null",
      "description": "string",
      "quantity": "number",
      "billedAmount": "number (USD)",
      "dateOfService": "YYYY-MM-DD"
    }
  ],
  "financials": {
    "totalBilled": "number",
    "insurancePayment": "number",
    "insuranceDiscount": "number",
    "copay": "number",
    "deductible": "number",
    "patientResponsibility": "number"
  },
  "errors": [
    {
      "type": "string (Duplicate Charge | Unbundling | Potential Upcoding | Price Anomaly)",
      "severity": "string (high | medium | low)",
      "cptCode": "string",
      "description": "string",
      "explanation": "string",
      "potentialSavings": "number (USD)",
      "actionableAdvice": "string",
      "dateOfService": "YYYY-MM-DD"
    }
  ],
  "isPaid": "boolean",
  "paymentIntentId": "string | null",
  "createdAt": "ISO 8601 timestamp",
  "updatedAt": "ISO 8601 timestamp"
}
```

---

## FHIR Mapping Reference

### Current Schema → FHIR Resources

| Our Field | FHIR Resource | FHIR Path |
|-----------|---------------|-----------|
| `patientInfo.name` | Patient | `Patient.name[0].text` |
| `patientInfo.dob` | Patient | `Patient.birthDate` |
| `patientInfo.address` | Patient | `Patient.address[0].text` |
| `patientInfo.memberId` | Coverage | `Coverage.subscriberId` |
| `providerInfo.facilityName` | Organization | `Organization.name` |
| `providerInfo.npi` | Organization | `Organization.identifier[0].value` |
| `providerInfo.providerName` | Practitioner | `Practitioner.name[0].text` |
| `serviceInfo.dateOfService` | Claim | `Claim.billablePeriod.start` |
| `lineItems[].cptCode` | Claim | `Claim.item[].productOrService.coding[0].code` |
| `lineItems[].billedAmount` | Claim | `Claim.item[].net.value` |
| `financials.totalBilled` | Claim | `Claim.total.value` |
| `financials.patientResponsibility` | ExplanationOfBenefit | `ExplanationOfBenefit.payment.amount` |

---

## Future SMART on FHIR Integration

### Phase 1: Read-Only Access
When connecting to patient portals (Epic MyChart, Cerner, etc.), the app will:
1. Authenticate using OAuth 2.0 + SMART launch
2. Request scopes:
   - `patient/Claim.read`
   - `patient/ExplanationOfBenefit.read`
   - `patient/Coverage.read`
3. Fetch billing data directly from EHR
4. Convert FHIR resources to our internal schema
5. Run error detection on fetched data

### Example FHIR Query
```http
GET https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4/Claim?patient=123&status=active
Authorization: Bearer {access_token}
Accept: application/fhir+json
```

### Phase 2: Write-Back (Future)
Potential features:
- Submit dispute notes back to EHR as `Communication` resources
- Create `Task` resources for billing department follow-up
- Update claim status after successful dispute

---

## CPT Code System

### Code Structure
- **Format**: 5 digits (e.g., 99213)
- **Categories**:
  - **99xxx**: Evaluation & Management (office visits, ER visits)
  - **80xxx-89xxx**: Laboratory tests
  - **70xxx-79xxx**: Radiology/imaging
  - **90xxx**: Immunizations, injections
  - **00xxx**: Anesthesia

### Example Codes Used in Error Detection
- `99213`: Office visit, level 3 (established patient)
- `99214`: Office visit, level 4
- `99215`: Office visit, level 5 (most complex)
- `99283-99285`: Emergency department visits (levels 3-5)
- `80053`: Comprehensive Metabolic Panel (CMP)
- `71046`: Chest X-ray, 2 views

### Revenue Codes
- **Format**: 4 digits (e.g., 0450)
- Used primarily for facility billing (hospitals)
- **Examples**:
  - `0450`: Emergency room
  - `0510`: Inpatient clinic
  - `0250`: Pharmacy

---

## Database Schema (PostgreSQL)

### Table: `audits`

```sql
CREATE TABLE audits (
  audit_id VARCHAR(255) PRIMARY KEY,
  file_url TEXT,
  provider_info JSONB,
  patient_info JSONB,
  service_info JSONB,
  financials JSONB,
  line_items JSONB,
  errors JSONB,
  is_paid BOOLEAN DEFAULT FALSE,
  payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audits_created_at ON audits(created_at);
CREATE INDEX idx_audits_is_paid ON audits(is_paid);
```

### Why JSONB?
- Flexible schema for healthcare data (varies by provider)
- Fast querying with PostgreSQL's JSONB operators
- Easy to add new fields without migrations
- Supports nested queries: `WHERE provider_info->>'facilityName' = 'ABC Hospital'`

---

## Extension Points for Future Features

### 1. Multi-Bill Analysis
Track multiple bills for the same patient:
```json
{
  "patientId": "uuid",
  "audits": ["audit-id-1", "audit-id-2"],
  "totalSavingsAcrossAllBills": 1250.00
}
```

### 2. Appeals Management
Link audit to appeal workflow:
```json
{
  "auditId": "uuid",
  "appealStatus": "submitted | under_review | approved | denied",
  "submittedAt": "ISO timestamp",
  "responseReceived": "ISO timestamp",
  "actualSavings": 450.00
}
```

### 3. Provider Network Integration
Enrich provider data:
```json
{
  "providerInfo": {
    "npi": "1234567890",
    "facilityName": "ABC Hospital",
    "networkStatus": "in-network",
    "qualityRating": 4.5,
    "averageChargeRatio": 2.8
  }
}
```

---

## API Endpoints

### Current Implementation

**POST /api/audit/upload**
- Accepts: `multipart/form-data` (image or PDF)
- Returns: `{ auditId: string }`

**GET /api/audit/:auditId**
- Returns: Full audit object (see schema above)

**POST /api/audit/:auditId/unlock**
- Body: `{ paymentIntentId: string }`
- Returns: `{ success: boolean }`

**POST /api/payment/create-intent**
- Body: `{ auditId: string, amount: number }`
- Returns: `{ clientSecret: string }`

### Future FHIR Endpoints

**GET /api/fhir/connect**
- Initiates SMART launch flow

**GET /api/fhir/callback**
- OAuth callback, exchanges code for token

**GET /api/fhir/claims**
- Fetches claims from connected EHR
- Converts to our internal schema

---

## Validation Rules

### Required Fields
- `patientInfo.name`: Must be non-empty
- `patientInfo.dob`: Valid date format
- `lineItems`: At least 1 item required
- `lineItems[].cptCode`: Must be 5 digits or valid HCPCS
- `lineItems[].billedAmount`: Must be > 0

### Data Quality Checks
- Dates should not be in the future
- Total billed should equal sum of line items
- Patient responsibility should not exceed total billed

---

## Testing Data Structure

### Sample Valid Audit Object
See `backend/test/fixtures/sample-audit.json` (to be created for testing)

### Sample Medical Bill Images
For testing the AI extraction:
- `backend/test/fixtures/sample-bill-1.pdf`
- `backend/test/fixtures/sample-bill-2.jpg`

---

## Related Standards & Resources

- **FHIR R4 Specification**: https://hl7.org/fhir/R4/
- **SMART on FHIR**: https://docs.smarthealthit.org/
- **CPT Code Database**: https://www.aapc.com/codes/cpt-codes-range/
- **NCCI Edits**: https://www.cms.gov/Medicare/Coding/NationalCorrectCodInitEd
- **Medicare Fee Schedule**: https://www.cms.gov/medicare/physician-fee-schedule
