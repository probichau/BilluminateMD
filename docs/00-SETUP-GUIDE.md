# Setup Guide: BilluminateMD Development Environment

## Prerequisites Installation

### Step 1: Install Node.js
Node.js is required to run both the frontend and backend of this application.

1. Visit: https://nodejs.org/
2. Download the **LTS (Long Term Support)** version for macOS
3. Run the installer and follow the prompts
4. Verify installation by opening Terminal and running:
   ```bash
   node --version
   npm --version
   ```
   You should see version numbers (e.g., v20.x.x and 10.x.x)

### Step 2: Install a Code Editor (if needed)
- **Recommended**: VS Code - https://code.visualstudio.com/

---

## External Services Setup

You'll need to create accounts and obtain API keys for the following services. Don't worry about this yet - I'll remind you when we need each one.

### Service 1: Anthropic API (Claude AI) - NEEDED IN PHASE 2
**Purpose**: Powers the AI vision and bill analysis

**Setup Instructions**:
1. Go to: https://console.anthropic.com/
2. Sign up for an account
3. Navigate to "API Keys" in the dashboard
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. **IMPORTANT**: Store this securely - you'll add it to the backend `.env` file

**Estimated Cost**: Pay-as-you-go. Claude 3.5 Sonnet costs approximately $3 per 1M input tokens. For bill analysis, expect ~$0.01-0.05 per bill.

---

### Service 2: AWS S3 or CloudFlare R2 (File Storage) - NEEDED IN PHASE 2
**Purpose**: Temporarily stores uploaded bill images during processing

**Option A: AWS S3** (More complex but widely used)
1. Go to: https://aws.amazon.com/
2. Create an AWS account
3. Navigate to S3 service
4. Create a new bucket (e.g., `billuminatemd-uploads-prod`)
5. Set bucket to private (no public access)
6. Create an IAM user with S3 access
7. Generate access keys (Access Key ID + Secret Access Key)

**Option B: CloudFlare R2** (Simpler, S3-compatible, cheaper)
1. Go to: https://www.cloudflare.com/products/r2/
2. Sign up for CloudFlare account
3. Navigate to R2 in dashboard
4. Create a bucket
5. Generate API tokens
6. **Benefit**: S3-compatible API, no egress fees

**Estimated Cost**:
- AWS S3: ~$0.023/GB storage + transfer fees
- CloudFlare R2: $0.015/GB storage, $0 egress

---

### Service 3: PostgreSQL Database - NEEDED IN PHASE 2
**Purpose**: Stores user sessions, audit results, and payment records

**Recommended Option: Supabase** (Easiest)
1. Go to: https://supabase.com/
2. Sign up for free account
3. Create a new project
4. Wait for database to provision (~2 minutes)
5. Go to Project Settings > Database
6. Copy the "Connection String" (URI format)
7. You'll add this to the backend `.env` file

**Free Tier**: Includes 500MB database, 2GB bandwidth, 50MB file storage

**Alternative Options**:
- Railway.app (https://railway.app/)
- Render.com (https://render.com/)
- Local PostgreSQL installation

---

### Service 4: Stripe Payment Processing - NEEDED IN PHASE 4
**Purpose**: Handles payment for unlocking full reports

**Setup Instructions**:
1. Go to: https://stripe.com/
2. Create a Stripe account
3. Complete business verification (required for live payments)
4. Navigate to Developers > API Keys
5. Copy both:
   - **Publishable Key** (starts with `pk_test_` for testing)
   - **Secret Key** (starts with `sk_test_` for testing)
6. For testing, use Test Mode keys
7. When ready to go live, switch to Live Mode keys

**Estimated Cost**: 2.9% + $0.30 per successful transaction

---

## What to Do Now

1. **Install Node.js** (Step 1 above) - DO THIS NOW
2. After Node.js is installed, return to Claude Code and let me know
3. I'll initialize the project structure and create the frontend/backend scaffolding
4. We'll set up the external services (Steps 2-4) as we need them in each phase

---

## Environment Variables Overview
Once services are set up, you'll create two `.env` files:

**Backend** (`/backend/.env`):
```
ANTHROPIC_API_KEY=sk-ant-xxxxx
AWS_ACCESS_KEY_ID=xxxxx
AWS_SECRET_ACCESS_KEY=xxxxx
AWS_BUCKET_NAME=billuminatemd-uploads
AWS_REGION=us-east-1
DATABASE_URL=postgresql://user:pass@host:5432/dbname
STRIPE_SECRET_KEY=sk_test_xxxxx
PORT=3001
```

**Frontend** (`/frontend/.env`):
```
VITE_API_URL=http://localhost:3001
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

Don't create these files yet - I'll generate them with placeholders when we set up each phase.
