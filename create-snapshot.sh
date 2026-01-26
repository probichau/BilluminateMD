#!/bin/bash
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

ARCHIVE_SIZE=$(ls -lh "$SNAPSHOT_DIR/codebase-backup.tar.gz" | awk '{print $5}')
echo "✅ Code archived: $SNAPSHOT_DIR/codebase-backup.tar.gz ($ARCHIVE_SIZE)"

# 3. Database schema export instructions
echo ""
echo "💾 Creating database schema export template..."
cat > "$SNAPSHOT_DIR/export-db-schema.sql" <<'EOSQL'
-- Supabase Staging Database Schema Export
-- Run this in Supabase SQL Editor and save the output

-- Get table structures
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

-- Get indexes
SELECT indexdef || ';' as index_statement
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('audits', 'intermediate_audits', 'users', 'subscriptions')
ORDER BY tablename, indexname;
EOSQL

echo "✅ Database schema export template created"
echo "   File: $SNAPSHOT_DIR/export-db-schema.sql"
echo "   ⚠️  ACTION REQUIRED: Run this in Supabase SQL Editor and save output"

# 4. Environment variables backup instructions
cat > "$SNAPSHOT_DIR/env-backup-instructions.txt" <<EOF
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

DEPLOY_SIZE=$(ls -lh "$SNAPSHOT_DIR/staging-pre-hipaa-backup.zip" | awk '{print $5}')
echo "✅ Deployment package created ($DEPLOY_SIZE)"
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
echo "4. Database Schema Export Template"
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
echo "4. Verify git tag exists remotely"
echo ""
EOVERIFY

chmod +x "$SNAPSHOT_DIR/VERIFY.sh"

# 8. Create snapshot info file
cat > "$SNAPSHOT_DIR/SNAPSHOT-INFO.txt" <<EOF
Snapshot Date: $SNAPSHOT_DATE
Git Commit: $CURRENT_COMMIT
Git Tag: snapshot-before-hipaa-$SNAPSHOT_DATE
Branch: $CURRENT_BRANCH

Reason: Pre-HIPAA architecture migration snapshot

Contents:
- git-info.txt (commit, tag, branch info)
- codebase-backup.tar.gz (full code archive, $ARCHIVE_SIZE)
- staging-pre-hipaa-backup.zip (deployment package, $DEPLOY_SIZE)
- export-db-schema.sql (database schema export template)
- env-backup-instructions.txt (environment variable backup guide)
- ROLLBACK.sh (automated rollback script)
- VERIFY.sh (verification checklist)

Created by: create-snapshot.sh
EOF

# Summary
echo ""
echo "=============================================="
echo "✅ SNAPSHOT CREATED SUCCESSFULLY"
echo "=============================================="
echo ""
echo "Snapshot location: $SNAPSHOT_DIR"
echo ""
echo "⚠️  IMPORTANT: Complete these manual steps:"
echo "1. Run verification: $SNAPSHOT_DIR/VERIFY.sh"
echo "2. Export database schema from Supabase"
echo "3. Save environment variables"
echo "4. Push git tag to remote:"
echo "   git push origin snapshot-before-hipaa-$SNAPSHOT_DATE"
echo ""
echo "To rollback in the future:"
echo "  cd $SNAPSHOT_DIR"
echo "  ./ROLLBACK.sh"
echo ""
