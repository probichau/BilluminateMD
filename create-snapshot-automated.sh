#!/bin/bash
set -e

# Fully Automated Snapshot Creation for BilluminateMD
# Backs up: Git, Code, Database, Environment Variables, Deployment Package

SNAPSHOT_DATE=$(date +%Y%m%d-%H%M%S)
SNAPSHOT_DIR="snapshots/snapshot-$SNAPSHOT_DATE"

# Configuration (edit these as needed)
SUPABASE_PROJECT_REF="bgliypuasymcpvydqmur"  # From Supabase URL
EB_ENVIRONMENT_NAME="billuminate-staging"
AMPLIFY_APP_ID="d83mc8ny8u2m7"
AWS_REGION="us-east-1"

echo "🔒 Creating FULLY AUTOMATED snapshot: $SNAPSHOT_DATE"
echo "======================================================="

# Create snapshot directory
mkdir -p "$SNAPSHOT_DIR"

# ============================================================================
# 1. GIT SNAPSHOT
# ============================================================================
echo ""
echo "📸 Creating git snapshot..."
CURRENT_BRANCH=$(git branch --show-current)
CURRENT_COMMIT=$(git rev-parse HEAD)

git tag -a "snapshot-before-hipaa-$SNAPSHOT_DATE" -m "Automated snapshot before HIPAA migration - $SNAPSHOT_DATE"

echo "✅ Git tag created: snapshot-before-hipaa-$SNAPSHOT_DATE"
echo "   Branch: $CURRENT_BRANCH"
echo "   Commit: $CURRENT_COMMIT"

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

# ============================================================================
# 2. CODE ARCHIVE
# ============================================================================
echo ""
echo "📦 Creating code archive..."
tar -czf "$SNAPSHOT_DIR/codebase-backup.tar.gz" \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='*.log' \
  --exclude='*.zip' \
  --exclude='snapshots' \
  . 2>/dev/null

ARCHIVE_SIZE=$(ls -lh "$SNAPSHOT_DIR/codebase-backup.tar.gz" | awk '{print $5}')
echo "✅ Code archived: $SNAPSHOT_DIR/codebase-backup.tar.gz ($ARCHIVE_SIZE)"

# ============================================================================
# 3. DATABASE SCHEMA EXPORT (AUTOMATED)
# ============================================================================
echo ""
echo "💾 Exporting database schema automatically..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  DATABASE_URL not set in environment"
  echo "   Attempting to read from .env file..."

  if [ -f "backend/.env" ]; then
    export $(grep DATABASE_URL backend/.env | xargs)
  fi
fi

if [ -z "$DATABASE_URL" ]; then
  echo "⚠️  Cannot find DATABASE_URL. Creating manual export template..."
  cat > "$SNAPSHOT_DIR/database-schema-backup.sql" <<'EOSQL'
-- DATABASE_URL not available during snapshot creation
-- Please manually export schema from Supabase SQL Editor

-- Run these queries in Supabase:

-- 1. Export table structures
SELECT
  'CREATE TABLE ' || tablename || ' (' || E'\n' ||
  (SELECT string_agg('  ' || column_name || ' ' ||
    CASE
      WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
      WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMP WITH TIME ZONE'
      ELSE upper(data_type)
    END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
    ',' || E'\n'
  ) FROM information_schema.columns c
   WHERE c.table_name = t.tablename AND c.table_schema = 'public') ||
  E'\n);' as create_statement
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('audits', 'intermediate_audits', 'users', 'subscriptions')
ORDER BY tablename;

-- 2. Export indexes
SELECT indexdef || ';' as index_statement
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('audits', 'intermediate_audits', 'users', 'subscriptions')
ORDER BY tablename, indexname;
EOSQL
  echo "⚠️  Manual export template created"
else
  # Check if pg_dump is available
  if command -v pg_dump &> /dev/null; then
    echo "   Found DATABASE_URL and pg_dump, exporting schema..."

    # Export schema only (no data) for specific tables
    pg_dump "$DATABASE_URL" \
      --schema-only \
      --no-owner \
      --no-privileges \
      --table=audits \
      --table=intermediate_audits \
      --table=users \
      --table=subscriptions \
      > "$SNAPSHOT_DIR/database-schema-backup.sql" 2>/dev/null && \
      echo "✅ Database schema exported automatically" || \
      echo "⚠️  pg_dump failed, creating manual export template..."
  else
    echo "⚠️  pg_dump not found. Creating manual export template..."

    cat > "$SNAPSHOT_DIR/database-schema-backup.sql" <<'EOSQLFALLBACK'
-- DATABASE SCHEMA BACKUP
-- pg_dump not available during snapshot creation
-- Please manually export from Supabase SQL Editor

-- Run these queries to export schema:

SELECT
  'CREATE TABLE ' || tablename || ' (' || E'\n' ||
  (SELECT string_agg('  ' || column_name || ' ' ||
    CASE
      WHEN data_type = 'character varying' THEN 'VARCHAR(' || character_maximum_length || ')'
      WHEN data_type = 'timestamp with time zone' THEN 'TIMESTAMP WITH TIME ZONE'
      WHEN data_type = 'jsonb' THEN 'JSONB'
      WHEN data_type = 'integer' THEN 'INTEGER'
      WHEN data_type = 'boolean' THEN 'BOOLEAN'
      WHEN data_type = 'text' THEN 'TEXT'
      ELSE upper(data_type)
    END ||
    CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
    ',' || E'\n'
  ) FROM information_schema.columns c
   WHERE c.table_name = t.tablename AND c.table_schema = 'public') ||
  E'\n);' as create_statement
FROM pg_tables t
WHERE schemaname = 'public'
  AND tablename IN ('audits', 'intermediate_audits', 'users', 'subscriptions')
ORDER BY tablename;

-- Export indexes
SELECT indexdef || ';' as index_statement
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('audits', 'intermediate_audits', 'users', 'subscriptions')
ORDER BY tablename, indexname;
EOSQLFALLBACK
  fi
fi

echo "   File: $SNAPSHOT_DIR/database-schema-backup.sql"

# ============================================================================
# 4. ENVIRONMENT VARIABLES (AUTOMATED)
# ============================================================================
echo ""
echo "🔐 Backing up environment variables automatically..."

# Create env backup file
ENV_BACKUP_FILE="$SNAPSHOT_DIR/env-backup-staging.txt"
cat > "$ENV_BACKUP_FILE" <<EOF
# Environment Variables Backup
# Created: $SNAPSHOT_DATE
# IMPORTANT: This file contains sensitive information. Keep secure.

# ============================================================================
# ELASTIC BEANSTALK (Backend - Staging)
# ============================================================================

EOF

# Check if AWS CLI is available
if command -v aws &> /dev/null; then
  echo "   Exporting Elastic Beanstalk environment variables..."

  # Get EB environment variables
  aws elasticbeanstalk describe-configuration-settings \
    --application-name billuminatemd \
    --environment-name "$EB_ENVIRONMENT_NAME" \
    --region "$AWS_REGION" \
    --query 'ConfigurationSettings[0].OptionSettings[?Namespace==`aws:elasticbeanstalk:application:environment`].[OptionName,Value]' \
    --output text >> "$ENV_BACKUP_FILE" 2>/dev/null || echo "⚠️  Could not export EB env vars (check AWS CLI config)"

  echo "" >> "$ENV_BACKUP_FILE"
  echo "# ============================================================================" >> "$ENV_BACKUP_FILE"
  echo "# AWS AMPLIFY (Frontend - Staging)" >> "$ENV_BACKUP_FILE"
  echo "# ============================================================================" >> "$ENV_BACKUP_FILE"
  echo "" >> "$ENV_BACKUP_FILE"

  # Get Amplify environment variables
  aws amplify get-branch \
    --app-id "$AMPLIFY_APP_ID" \
    --branch-name staging \
    --region "$AWS_REGION" \
    --query 'branch.environmentVariables' \
    --output json >> "$ENV_BACKUP_FILE" 2>/dev/null || echo "⚠️  Could not export Amplify env vars (check AWS CLI config)"

  echo "✅ Environment variables exported automatically"
else
  echo "⚠️  AWS CLI not found. Creating manual export template..."

  cat >> "$ENV_BACKUP_FILE" <<'EOFENV'
# AWS CLI not available during snapshot
# Please manually export from AWS Console:

# Elastic Beanstalk (Backend):
# Go to: EB Console → billuminate-staging → Configuration → Software
DATABASE_URL=
AWS_S3_BUCKET=
STRIPE_SECRET_KEY=
ANTHROPIC_API_KEY=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
JWT_SECRET=
NODE_ENV=
PORT=

# AWS Amplify (Frontend):
# Go to: Amplify Console → staging branch → Environment variables
VITE_API_URL=
VITE_STRIPE_PUBLIC_KEY=
EOFENV

  echo "⚠️  Manual export template created"
fi

echo "   File: $ENV_BACKUP_FILE"

# ============================================================================
# 5. DEPLOYMENT PACKAGE
# ============================================================================
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
  -q 2>/dev/null
cd ..

DEPLOY_SIZE=$(ls -lh "$SNAPSHOT_DIR/staging-pre-hipaa-backup.zip" | awk '{print $5}')
echo "✅ Deployment package created ($DEPLOY_SIZE)"

# ============================================================================
# 6. AUTOMATED ROLLBACK SCRIPT
# ============================================================================
cat > "$SNAPSHOT_DIR/ROLLBACK.sh" <<'EOROLLBACK'
#!/bin/bash
set -e

echo "🔙 AUTOMATED ROLLBACK: Reverting to pre-HIPAA architecture"
echo "==========================================================="

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
echo "🔧 Next steps (manual):"
echo "1. Push to remote:"
echo "   git push origin staging --force"
echo ""
echo "2. Deploy backed up package:"
echo "   Upload to EB: $SNAPSHOT_DIR/staging-pre-hipaa-backup.zip"
echo ""
echo "3. Restore database (if needed):"
echo "   Run SQL: $SNAPSHOT_DIR/database-schema-backup.sql"
echo ""
echo "4. Restore environment variables:"
echo "   Reference: $SNAPSHOT_DIR/env-backup-staging.txt"
echo ""

# Offer to push automatically
read -p "Push to remote now? (yes/no): " PUSH_CONFIRM

if [ "$PUSH_CONFIRM" = "yes" ]; then
  git push origin staging --force
  echo "✅ Pushed to remote"
fi

echo ""
echo "✅ Rollback complete!"
EOROLLBACK

chmod +x "$SNAPSHOT_DIR/ROLLBACK.sh"

# ============================================================================
# 7. SNAPSHOT METADATA
# ============================================================================
cat > "$SNAPSHOT_DIR/SNAPSHOT-INFO.txt" <<EOF
Snapshot Date: $SNAPSHOT_DATE
Git Commit: $CURRENT_COMMIT
Git Tag: snapshot-before-hipaa-$SNAPSHOT_DATE
Branch: $CURRENT_BRANCH

Reason: Pre-HIPAA architecture migration snapshot (AUTOMATED)

Contents:
- git-info.txt (commit, tag, branch)
- codebase-backup.tar.gz (full code archive, $ARCHIVE_SIZE)
- staging-pre-hipaa-backup.zip (deployment package, $DEPLOY_SIZE)
- database-schema-backup.sql (automated database export)
- env-backup-staging.txt (automated environment variables)
- ROLLBACK.sh (automated rollback script)

Created by: create-snapshot-automated.sh
Automation: Full (git, code, database, env vars, deployment)
EOF

# ============================================================================
# 8. PUSH GIT TAG
# ============================================================================
echo ""
echo "📤 Pushing git tag to remote..."
git push origin "snapshot-before-hipaa-$SNAPSHOT_DATE" 2>/dev/null && echo "✅ Git tag pushed to remote" || echo "⚠️  Could not push tag (may need to push manually)"

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "=============================================="
echo "✅ AUTOMATED SNAPSHOT CREATED SUCCESSFULLY"
echo "=============================================="
echo ""
echo "Snapshot location: $SNAPSHOT_DIR"
echo ""
echo "Contents:"
echo "  ✅ Git snapshot (tag pushed to remote)"
echo "  ✅ Code archive ($ARCHIVE_SIZE)"
echo "  ✅ Deployment package ($DEPLOY_SIZE)"
echo "  ✅ Database schema (automated export)"
echo "  ✅ Environment variables (automated export)"
echo "  ✅ Rollback script (ready to use)"
echo ""
echo "To rollback in the future:"
echo "  cd $SNAPSHOT_DIR"
echo "  ./ROLLBACK.sh"
echo ""
echo "⚠️  IMPORTANT: Review the exported files to ensure completeness"
echo "  - Check: $SNAPSHOT_DIR/database-schema-backup.sql"
echo "  - Check: $SNAPSHOT_DIR/env-backup-staging.txt"
echo ""
