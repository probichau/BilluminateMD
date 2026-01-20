# Rollback System for HIPAA Architecture Migration

## Overview

This document describes the complete rollback system for reverting the HIPAA-compliant architecture changes if needed.

---

## Pre-Migration Snapshot Checklist

### 1. Git Snapshot
- [x] Create snapshot tag: `snapshot-before-hipaa-migration`
- [x] Push tag to remote
- [x] Document exact commit SHA

### 2. Database Snapshot
- [ ] Export Supabase staging database schema
- [ ] Export staging database data (if needed for testing)
- [ ] Store backup locally and in secure location

### 3. Code Backup
- [ ] Create full codebase archive: `staging-backup-YYYY-MM-DD.tar.gz`
- [ ] Store in safe location outside repository

### 4. Environment Configuration Backup
- [ ] Document all AWS Amplify environment variables (staging)
- [ ] Document all Elastic Beanstalk environment variables (staging)
- [ ] Save to secure file: `env-backup-staging.txt`

### 5. Deployment Package Backup
- [ ] Save current staging deployment zip
- [ ] Label: `staging-pre-hipaa-backup.zip`

---

## Snapshot Creation Scripts

### Create Complete Snapshot

```bash
#!/bin/bash
# File: create-snapshot.sh

set -e

SNAPSHOT_DATE=$(date +%Y%m%d-%H%M%S)
SNAPSHOT_DIR="snapshots/snapshot-$SNAPSHOT_DATE"

echo "🔒 Creating complete snapshot: $SNAPSHOT_DATE"
echo "================================================"

# Create snapshot directory
mkdir -p "$SNAPSHOT_DIR"

# 1. Git snapshot
echo ""
echo "📸 Creating git snapshot..."
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse HEAD)

git tag -a "snapshot-before-hipaa-$SNAPSHOT_DATE" -m "Snapshot before HIPAA architecture migration - $SNAPSHOT_DATE"
git push origin "snapshot-before-hipaa-$SNAPSHOT_DATE"

echo "✅ Git tag created: snapshot-before-hipaa-$SNAPSHOT_DATE"
echo "   Branch: $CURRENT_BRANCH"
echo "   Commit: $CURRENT_COMMIT"

# Save git info
cat > "$SNAPSHOT_DIR/git-info.txt" <<EOF
Snapshot Date: $SNAPSHOT_DATE
Branch: $CURRENT_BRANCH
Commit: $CURRENT_COMMIT
Tag: snapshot-before-hipaa-$SNAPSHOT_DATE

To rollback:
  git checkout $CURRENT_COMMIT
  # or
  git checkout snapshot-before-hipaa-$SNAPSHOT_DATE
EOF

# 2. Code archive
echo ""
echo "📦 Creating code archive..."
tar -czf "$SNAPSHOT_DIR/codebase-backup.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='*.zip' \
  --exclude='snapshots' \
  .

echo "✅ Code archived: $SNAPSHOT_DIR/codebase-backup.tar.gz"

# 3. Database schema export
echo ""
echo "💾 Exporting database schema..."
cat > "$SNAPSHOT_DIR/export-db-schema.sql" <<'EOSQL'
-- Supabase Staging Database Schema Export
-- Date: $(date)
-- Database: staging

-- Instructions:
-- Run this in Supabase SQL Editor to export current schema

-- Export audits table
SELECT
  'CREATE TABLE audits (' ||
  string_agg(
    column_name || ' ' || data_type ||
    CASE WHEN character_maximum_length IS NOT NULL
         THEN '(' || character_maximum_length || ')'
         ELSE '' END,
    ', '
  ) || ');'
FROM information_schema.columns
WHERE table_name = 'audits';

-- Export intermediate_audits table
SELECT
  'CREATE TABLE intermediate_audits (' ||
  string_agg(
    column_name || ' ' || data_type,
    ', '
  ) || ');'
FROM information_schema.columns
WHERE table_name = 'intermediate_audits';

-- Export users table
SELECT
  'CREATE TABLE users (' ||
  string_agg(
    column_name || ' ' || data_type,
    ', '
  ) || ');'
FROM information_schema.columns
WHERE table_name = 'users';

-- Export subscriptions table
SELECT
  'CREATE TABLE subscriptions (' ||
  string_agg(
    column_name || ' ' || data_type,
    ', '
  ) || ');'
FROM information_schema.columns
WHERE table_name = 'subscriptions';

-- Export indexes
SELECT indexdef FROM pg_indexes
WHERE schemaname = 'public';
EOSQL

echo "✅ Database schema export template created"
echo "   File: $SNAPSHOT_DIR/export-db-schema.sql"
echo "   ⚠️  ACTION REQUIRED: Run this in Supabase SQL Editor and save output"

# 4. Environment variables backup instructions
cat > "$SNAPSHOT_DIR/env-backup-instructions.txt" <<'EOF'
ENVIRONMENT VARIABLES BACKUP INSTRUCTIONS
==========================================

1. AWS Amplify (Staging Frontend)
   - Go to: AWS Amplify Console → BilluminateMD → staging branch → Environment variables
   - Copy:
     VITE_API_URL=
     VITE_STRIPE_PUBLIC_KEY=

2. Elastic Beanstalk (Staging Backend)
   - Go to: AWS EB Console → billuminate-staging → Configuration → Software
   - Copy all environment variables:
     DATABASE_URL=
     AWS_S3_BUCKET=
     STRIPE_SECRET_KEY=
     ANTHROPIC_API_KEY=
     AWS_ACCESS_KEY_ID=
     AWS_SECRET_ACCESS_KEY=
     JWT_SECRET=
     NODE_ENV=
     PORT=

Save these in: $SNAPSHOT_DIR/env-backup-staging.txt
EOF

echo ""
echo "✅ Environment backup instructions created"
echo "   File: $SNAPSHOT_DIR/env-backup-instructions.txt"

# 5. Create deployment package backup
echo ""
echo "📦 Creating deployment package backup..."
cd backend
zip -r "../$SNAPSHOT_DIR/staging-pre-hipaa-backup.zip" . \
  -x "*.git*" \
  -x "node_modules/*" \
  -x ".env" \
  -x ".elasticbeanstalk/*" \
  -x "*.log" \
  -x "*.pid" \
  -q
cd ..

echo "✅ Deployment package created"
echo "   File: $SNAPSHOT_DIR/staging-pre-hipaa-backup.zip"

# 6. Create rollback script
cat > "$SNAPSHOT_DIR/ROLLBACK.sh" <<'EOROLLBACK'
#!/bin/bash
set -e

echo "🔙 ROLLBACK: Reverting to pre-HIPAA architecture"
echo "================================================"

SNAPSHOT_DIR=$(dirname "$0")

# Check we're in the right place
if [ ! -f "$SNAPSHOT_DIR/git-info.txt" ]; then
  echo "❌ Error: Cannot find git-info.txt. Are you in the snapshot directory?"
  exit 1
fi

# Read git info
COMMIT=$(grep "Commit:" "$SNAPSHOT_DIR/git-info.txt" | cut -d' ' -f2)
TAG=$(grep "Tag:" "$SNAPSHOT_DIR/git-info.txt" | cut -d' ' -f2)

echo ""
echo "Snapshot Information:"
cat "$SNAPSHOT_DIR/git-info.txt"
echo ""

read -p "⚠️  This will revert your code to commit $COMMIT. Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
  echo "Rollback cancelled."
  exit 0
fi

# Git rollback
echo ""
echo "📝 Rolling back git..."
cd ../..  # Go to repo root

# Ensure we're on staging branch
git checkout staging

# Reset to snapshot commit
git reset --hard "$COMMIT"

echo "✅ Git rolled back to: $COMMIT"
echo ""
echo "Next steps:"
echo "1. Push to remote (CAREFUL - this is a force push):"
echo "   git push origin staging --force"
echo ""
echo "2. Deploy the backed up package to Elastic Beanstalk:"
echo "   File: $SNAPSHOT_DIR/staging-pre-hipaa-backup.zip"
echo ""
echo "3. Restore database (if changed):"
echo "   - Go to Supabase"
echo "   - Run SQL from: $SNAPSHOT_DIR/database-schema-backup.sql"
echo ""
echo "4. Verify environment variables in:"
echo "   - AWS Amplify (frontend)"
echo "   - Elastic Beanstalk (backend)"
echo ""
EOROLLBACK

chmod +x "$SNAPSHOT_DIR/ROLLBACK.sh"

echo ""
echo "✅ Rollback script created"
echo "   File: $SNAPSHOT_DIR/ROLLBACK.sh"

# 7. Create verification script
cat > "$SNAPSHOT_DIR/VERIFY.sh" <<'EOVERIFY'
#!/bin/bash

echo "🔍 Snapshot Verification Checklist"
echo "=================================="
echo ""

SNAPSHOT_DIR=$(dirname "$0")

echo "Files to verify:"
echo ""

echo "1. Git Info"
if [ -f "$SNAPSHOT_DIR/git-info.txt" ]; then
  echo "   ✅ git-info.txt"
  cat "$SNAPSHOT_DIR/git-info.txt"
else
  echo "   ❌ git-info.txt MISSING"
fi

echo ""
echo "2. Code Archive"
if [ -f "$SNAPSHOT_DIR/codebase-backup.tar.gz" ]; then
  SIZE=$(ls -lh "$SNAPSHOT_DIR/codebase-backup.tar.gz" | awk '{print $5}')
  echo "   ✅ codebase-backup.tar.gz ($SIZE)"
else
  echo "   ❌ codebase-backup.tar.gz MISSING"
fi

echo ""
echo "3. Deployment Package"
if [ -f "$SNAPSHOT_DIR/staging-pre-hipaa-backup.zip" ]; then
  SIZE=$(ls -lh "$SNAPSHOT_DIR/staging-pre-hipaa-backup.zip" | awk '{print $5}')
  echo "   ✅ staging-pre-hipaa-backup.zip ($SIZE)"
else
  echo "   ❌ staging-pre-hipaa-backup.zip MISSING"
fi

echo ""
echo "4. Database Schema Export"
if [ -f "$SNAPSHOT_DIR/export-db-schema.sql" ]; then
  echo "   ✅ export-db-schema.sql"
  echo "   ⚠️  Remember to run this in Supabase and save output"
else
  echo "   ❌ export-db-schema.sql MISSING"
fi

echo ""
echo "5. Environment Backup Instructions"
if [ -f "$SNAPSHOT_DIR/env-backup-instructions.txt" ]; then
  echo "   ✅ env-backup-instructions.txt"
  echo "   ⚠️  Remember to save actual values"
else
  echo "   ❌ env-backup-instructions.txt MISSING"
fi

echo ""
echo "6. Rollback Script"
if [ -f "$SNAPSHOT_DIR/ROLLBACK.sh" ] && [ -x "$SNAPSHOT_DIR/ROLLBACK.sh" ]; then
  echo "   ✅ ROLLBACK.sh (executable)"
else
  echo "   ❌ ROLLBACK.sh MISSING or not executable"
fi

echo ""
echo "=================================="
echo "Manual actions required:"
echo "1. Run export-db-schema.sql in Supabase SQL Editor"
echo "2. Save output to: database-schema-backup.sql"
echo "3. Save environment variables to: env-backup-staging.txt"
echo "4. Verify git tag exists: git tag -l 'snapshot-before-hipaa-*'"
echo ""
EOVERIFY

chmod +x "$SNAPSHOT_DIR/VERIFY.sh"

# Summary
echo ""
echo "=============================================="
echo "✅ SNAPSHOT CREATED SUCCESSFULLY"
echo "=============================================="
echo ""
echo "Snapshot location: $SNAPSHOT_DIR"
echo ""
echo "Contents:"
echo "  - git-info.txt (git commit, tag, branch)"
echo "  - codebase-backup.tar.gz (full code archive)"
echo "  - staging-pre-hipaa-backup.zip (deployment package)"
echo "  - export-db-schema.sql (database schema export template)"
echo "  - env-backup-instructions.txt (how to backup env vars)"
echo "  - ROLLBACK.sh (automated rollback script)"
echo "  - VERIFY.sh (verification checklist)"
echo ""
echo "⚠️  ACTION REQUIRED:"
echo "1. Run: $SNAPSHOT_DIR/VERIFY.sh"
echo "2. Complete database schema export"
echo "3. Save environment variables"
echo ""
echo "To rollback in the future:"
echo "  cd $SNAPSHOT_DIR"
echo "  ./ROLLBACK.sh"
echo ""
```

---

## Manual Backup Steps

### 1. Database Schema Export

**Via Supabase Dashboard:**
```sql
-- Run in Supabase SQL Editor
-- Copy this entire schema export

\d+ audits;
\d+ intermediate_audits;
\d+ users;
\d+ subscriptions;

-- Get CREATE TABLE statements
SELECT
  'CREATE TABLE ' || tablename || ' (' || E'\n' ||
  string_agg('  ' || column_name || ' ' || data_type, ',' || E'\n') ||
  E'\n);' as create_statement
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('audits', 'intermediate_audits', 'users', 'subscriptions')
GROUP BY tablename;

-- Get indexes
SELECT indexdef FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('audits', 'intermediate_audits', 'users', 'subscriptions');
```

Save output to: `snapshots/snapshot-YYYYMMDD-HHMMSS/database-schema-backup.sql`

### 2. Environment Variables Export

**AWS Amplify (Frontend - Staging):**
1. Go to AWS Amplify Console
2. Select BilluminateMD app
3. Click on "staging" branch
4. Go to "Environment variables"
5. Copy all variables

Save to: `snapshots/snapshot-YYYYMMDD-HHMMSS/env-backup-amplify-staging.txt`

**Elastic Beanstalk (Backend - Staging):**
1. Go to AWS EB Console
2. Select billuminate-staging environment
3. Click "Configuration" → "Software"
4. Copy all environment variables

Save to: `snapshots/snapshot-YYYYMMDD-HHMMSS/env-backup-eb-staging.txt`

---

## Rollback Procedures

### Full Rollback (Code + Database + Deployment)

**Step 1: Verify Snapshot Exists**
```bash
cd snapshots/snapshot-YYYYMMDD-HHMMSS
./VERIFY.sh
```

**Step 2: Run Rollback Script**
```bash
./ROLLBACK.sh
```

**Step 3: Force Push to Remote (⚠️ CAREFUL)**
```bash
git push origin staging --force
```

**Step 4: Deploy Backed Up Package**
1. Go to AWS Elastic Beanstalk Console
2. Select billuminate-staging environment
3. Click "Upload and deploy"
4. Upload: `snapshots/snapshot-YYYYMMDD-HHMMSS/staging-pre-hipaa-backup.zip`
5. Deploy

**Step 5: Restore Database (if migrations were run)**
1. Go to Supabase Dashboard
2. Open SQL Editor
3. Run: `snapshots/snapshot-YYYYMMDD-HHMMSS/database-schema-backup.sql`

**Step 6: Verify Environment Variables**
1. Check AWS Amplify environment variables
2. Check Elastic Beanstalk environment variables
3. Compare with backed up values

**Step 7: Trigger Frontend Redeploy**
1. Go to AWS Amplify Console
2. Select staging branch
3. Click "Redeploy this version"

**Step 8: Test**
1. Visit https://stage.billuminate.com
2. Upload a test bill
3. Complete payment flow
4. Generate appeal letter
5. Verify everything works

---

### Partial Rollback (Code Only)

If you only need to revert code changes (no database changes made):

```bash
cd /path/to/BilluminateMD
git checkout snapshot-before-hipaa-YYYYMMDD-HHMMSS
git checkout -b staging-rollback
git push origin staging-rollback:staging --force
```

Then redeploy backend and frontend.

---

### Partial Rollback (Database Only)

If you need to restore database schema but keep new code:

```bash
# In Supabase SQL Editor
-- Drop new tables (if created)
DROP TABLE IF EXISTS anonymous_sessions CASCADE;

-- Restore old tables (if dropped)
-- Run: snapshots/snapshot-YYYYMMDD-HHMMSS/database-schema-backup.sql
```

---

## Testing the Rollback System

Before migration, test the rollback process:

**Dry Run:**
1. Create snapshot
2. Make a small test change (e.g., add console.log)
3. Commit and push
4. Run rollback script
5. Verify code reverted
6. Verify deployment package works
7. Delete test commit and snapshot

---

## Snapshot Storage

### Storage Locations

**Local:**
- `snapshots/snapshot-YYYYMMDD-HHMMSS/` - All snapshot files
- Keep locally until migration confirmed successful

**Remote (Optional):**
- Upload to Dropbox/Google Drive/S3 for extra safety
- Encrypt archive before uploading

**Git:**
- Git tag: `snapshot-before-hipaa-YYYYMMDD-HHMMSS`
- Pushed to origin
- Never deleted

### Retention Policy

**Keep snapshots for:**
- 30 days after successful migration
- Until production deployment confirmed
- Longer if any issues arise

---

## Emergency Contacts

If rollback fails:

1. **Check git reflog:**
   ```bash
   git reflog
   # Find the commit before rollback
   git reset --hard HEAD@{n}
   ```

2. **Restore from archive:**
   ```bash
   cd /path/to/BilluminateMD
   tar -xzf snapshots/snapshot-YYYYMMDD-HHMMSS/codebase-backup.tar.gz
   ```

3. **Contact support:**
   - AWS Support (for Amplify/EB issues)
   - Supabase Support (for database issues)

---

## Post-Rollback Checklist

After successful rollback:

- [ ] Staging frontend is accessible
- [ ] Can upload bills
- [ ] Bill analysis works
- [ ] Payment flow works
- [ ] Appeal letter generation works
- [ ] Database queries succeed
- [ ] No console errors
- [ ] Environment variables correct
- [ ] All API endpoints respond

---

## Snapshot Metadata

Each snapshot includes a `SNAPSHOT-INFO.txt` file:

```
Snapshot Date: 2026-01-20 15:30:00
Git Commit: abc123def456
Git Tag: snapshot-before-hipaa-20260120-153000
Branch: staging

Reason: Pre-HIPAA architecture migration snapshot

Contents:
- Full codebase archive
- Deployment package backup
- Database schema export instructions
- Environment variable backup instructions
- Automated rollback script
- Verification script

Created by: create-snapshot.sh
```

---

This rollback system ensures we can safely revert to the current working state
if anything goes wrong during the HIPAA architecture migration.
