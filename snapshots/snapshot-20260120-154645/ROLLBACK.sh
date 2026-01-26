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
