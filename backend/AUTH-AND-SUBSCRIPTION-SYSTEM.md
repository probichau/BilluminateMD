# Authentication and Subscription System

## Overview

BilluminateMD now supports two pricing models:
1. **$29.99 per bill** (one-time payment, no account required)
2. **$99.97/year unlimited** (subscription with account required)

Subscription users can analyze unlimited bills, but only for bills where the patient name matches the registered user's name (with intelligent nickname matching).

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_customer_id VARCHAR(255),
  plan_type VARCHAR(50) NOT NULL, -- 'unlimited_annual' or 'per_bill'
  status VARCHAR(50) NOT NULL,    -- 'active', 'canceled', 'past_due', 'incomplete'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Audits Table (Updated)
```sql
ALTER TABLE audits ADD COLUMN user_id INTEGER REFERENCES users(id);
ALTER TABLE audits ADD COLUMN payment_type VARCHAR(50); -- 'one_time' or 'subscription'
```

## API Endpoints

### Authentication (`/api/auth`)

#### POST /api/auth/register
Register a new user.
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword123",
  "fullName": "Elizabeth Wilson"
}

Response:
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "fullName": "Elizabeth Wilson"
  },
  "token": "eyJhbGc..."
}
```

#### POST /api/auth/login
Login existing user.
```json
Request:
{
  "email": "user@example.com",
  "password": "securepassword123"
}

Response:
{
  "success": true,
  "user": { ... },
  "token": "eyJhbGc..."
}
```

#### GET /api/auth/me
Get current user info (requires authentication).
```
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "user": { ... }
}
```

### Subscriptions (`/api/subscription`)

#### POST /api/subscription/create-checkout
Create Stripe checkout session for annual subscription.
```
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "sessionId": "cs_test_...",
  "url": "https://checkout.stripe.com/..."
}
```

#### GET /api/subscription/status
Check if user has active subscription.
```
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "hasActiveSubscription": true,
  "subscription": {
    "planType": "unlimited_annual",
    "status": "active",
    "currentPeriodEnd": "2027-01-18T00:00:00Z"
  }
}
```

#### POST /api/subscription/cancel
Cancel subscription (at end of billing period).
```
Headers: Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Subscription will be canceled at the end of the billing period"
}
```

#### POST /api/subscription/webhook
Stripe webhook handler for subscription events.

### Audits (Updated)

#### POST /api/audit/upload
Upload bill with optional authentication.
```
Headers: Authorization: Bearer <token> (optional)
Body: FormData with 'bill' file

Response: { auditId, message, requiresFinancialInfo, ... }
```

#### POST /api/audit/:auditId/financial-info
Submit financial info with optional authentication.
```
Headers: Authorization: Bearer <token> (optional)

Body:
{
  "householdIncome": 45000,
  "householdSize": 3
}

Response:
{
  "auditId": "...",
  "message": "Analysis complete",
  "savings": { ... }
}

Note: If user has active subscription and bill name matches user name,
the report is automatically unlocked (isPaid: true).
```

## Name Matching Logic

The system uses intelligent name matching to verify that a bill belongs to the registered user.

### Supported Name Variations

**Nicknames:**
- Andrew ↔ Andy, Drew
- Elizabeth ↔ Beth, Liz, Lizzie, Betty
- William ↔ Will, Bill, Billy
- Robert ↔ Rob, Bob, Bobby
- And many more...

**Examples:**
- Bill for "Andy Smith" matches user "Andrew Smith" ✅
- Bill for "Beth Wilson" matches user "Elizabeth Wilson" ✅
- Bill for "Mary Johnson" DOES NOT match user "Elizabeth Wilson" ❌

### Name Matching Rules
1. Last name must match exactly
2. First name can match via:
   - Exact match
   - Nickname mapping
   - Formal name mapping

See `backend/services/nameMatchingService.js` for complete implementation.

## Payment Flow

### Flow 1: One-Time Payment ($29.99)
1. User uploads bill (no account required)
2. User enters financial info
3. Analysis complete, report blurred
4. User pays $29.99 one-time
5. Report unlocked

### Flow 2: Subscription ($99.97/year)
1. User creates account
2. User subscribes to annual plan
3. User uploads bill
4. User enters financial info
5. System verifies: bill patient name matches user name
   - ✅ Match → Report auto-unlocked
   - ❌ No match → Error message (must use one-time payment)

## Security Features

### JWT Authentication
- Tokens valid for 7 days
- HS256 algorithm
- Secret configurable via JWT_SECRET environment variable

### Password Security
- Bcrypt hashing with 10 salt rounds
- Minimum 8 characters required
- Never stored in plain text

### Subscription Verification
- Active subscription checked on every audit
- Name matching enforced server-side
- Webhook signature verification for Stripe events

## Environment Variables

```bash
# Authentication
JWT_SECRET=your-secret-key-change-in-production

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL (for subscription redirect)
FRONTEND_URL=https://yourdomain.com
```

## Next Steps: Frontend Implementation

1. Create authentication context (stores user + token)
2. Build login/register pages
3. Create pricing page with two options:
   - $29.99 per bill (guest checkout)
   - $99.97/year unlimited (requires login)
4. Update ResultsPage to show subscription benefits
5. Add subscription management page

## Testing

### Test Subscription Flow
```bash
# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","fullName":"Elizabeth Wilson"}'

# Create subscription checkout
curl -X POST http://localhost:3001/api/subscription/create-checkout \
  -H "Authorization: Bearer <token>"

# Complete payment on Stripe Checkout page

# Upload bill with matching name
curl -X POST http://localhost:3001/api/audit/upload \
  -H "Authorization: Bearer <token>" \
  -F "bill=@bill.pdf"

# Submit financial info (auto-unlocked if name matches)
curl -X POST http://localhost:3001/api/audit/<auditId>/financial-info \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"householdIncome":45000,"householdSize":3}'
```

### Test Name Matching
```bash
# Test in Node REPL
node
> const { doesBillMatchUser } = require('./backend/services/nameMatchingService.js')
> doesBillMatchUser('Andy Smith', 'Andrew Smith')
true
> doesBillMatchUser('Beth Wilson', 'Elizabeth Wilson')
true
> doesBillMatchUser('Mary Johnson', 'Elizabeth Wilson')
false
```
