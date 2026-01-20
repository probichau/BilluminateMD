#!/bin/bash
set -e

# Deployment Safeguard Script for BilluminateMD
# This script ensures only functional code is deployed to production

echo "🔒 BilluminateMD Production Deployment Safeguard"
echo "================================================"

# Check we're on staging branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "❌ Error: You must be on the staging branch to run this script"
    echo "   Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "❌ Error: You have uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Show what will be merged
echo ""
echo "📊 Comparing staging vs main branches..."
echo ""
echo "Files that will be changed in production:"
git diff main..staging --stat

echo ""
echo "Detailed code changes:"
git diff main..staging

echo ""
echo "⚠️  IMPORTANT CHECKS:"
echo ""

# Check for staging-specific files in the diff
STAGING_FILES=$(git diff main..staging --name-only | grep -E '(setup-staging|test-|staging)' || true)
if [ ! -z "$STAGING_FILES" ]; then
    echo "❌ WARNING: Staging-specific files detected in diff:"
    echo "$STAGING_FILES"
    echo ""
    echo "These files should NOT be merged to production."
    echo "Please review and remove them from the staging branch."
    exit 1
fi

# Check for .env files
ENV_FILES=$(git diff main..staging --name-only | grep -E '\.env' || true)
if [ ! -z "$ENV_FILES" ]; then
    echo "❌ ERROR: .env files detected in diff:"
    echo "$ENV_FILES"
    echo ""
    echo "Environment files should NEVER be committed to git."
    exit 1
fi

# Check for test files
TEST_FILES=$(git diff main..staging --name-only | grep -E 'test-.*\.js$' || true)
if [ ! -z "$TEST_FILES" ]; then
    echo "⚠️  WARNING: Test files detected in diff:"
    echo "$TEST_FILES"
    echo ""
    read -p "Do you want to proceed anyway? (yes/no): " PROCEED
    if [ "$PROCEED" != "yes" ]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Check for deployment scripts
DEPLOY_SCRIPTS=$(git diff main..staging --name-only | grep -E '(deploy|setup-.*\.sh)' || true)
if [ ! -z "$DEPLOY_SCRIPTS" ]; then
    echo "⚠️  WARNING: Deployment scripts detected in diff:"
    echo "$DEPLOY_SCRIPTS"
    echo ""
    read -p "Do you want to proceed anyway? (yes/no): " PROCEED
    if [ "$PROCEED" != "yes" ]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi

# Final confirmation
echo ""
echo "✅ All automatic checks passed!"
echo ""
echo "Summary of changes to be deployed:"
git diff main..staging --stat
echo ""
read -p "Do you want to merge staging into main and prepare for production deployment? (yes/no): " FINAL_CONFIRM

if [ "$FINAL_CONFIRM" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Perform the merge
echo ""
echo "📦 Merging staging into main..."
git checkout main
git merge staging --no-ff -m "Deploy: Merge staging to production

$(git log main..staging --oneline)"

echo ""
echo "✅ Merge complete!"
echo ""
echo "Next steps:"
echo "1. Push to remote: git push origin main"
echo "2. Create backend deployment package: ./create-production-deployment.sh"
echo "3. Deploy backend via AWS Elastic Beanstalk Console"
echo "4. Frontend will auto-deploy via AWS Amplify"
echo ""
echo "To rollback this merge (before pushing):"
echo "  git reset --hard HEAD~1"
