#!/bin/bash
set -e

# Production Deployment Package Creator
# Ensures only production-ready files are included

echo "📦 Creating Production Deployment Package"
echo "=========================================="

# Check we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Error: You must be on the main branch to create a production deployment"
    echo "   Current branch: $CURRENT_BRANCH"
    exit 1
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    echo "⚠️  Warning: You have uncommitted changes"
    git status --short
    read -p "Continue anyway? (yes/no): " PROCEED
    if [ "$PROCEED" != "yes" ]; then
        exit 1
    fi
fi

cd backend

# Remove old deployment package
rm -f ../production-backend-deploy.zip

echo ""
echo "Creating deployment package..."
echo "Excluding:"
echo "  - .git files"
echo "  - node_modules"
echo "  - .env files"
echo "  - .elasticbeanstalk directory"
echo "  - log files"
echo "  - pid files"
echo "  - test files"
echo "  - setup scripts"
echo ""

# Create the zip file with explicit exclusions
zip -r ../production-backend-deploy.zip . \
    -x "*.git*" \
    -x "node_modules/*" \
    -x ".env*" \
    -x ".elasticbeanstalk/*" \
    -x "*.log" \
    -x "*.pid" \
    -x "test-*.js" \
    -x "check-subscription.js" \
    -x "setup-staging-db.js" \
    -x "setup-staging-env.sh" \
    -x "setup-production-env.sh" \
    -x "set-env-vars.sh" \
    -x "*.md" \
    -q

cd ..

# Show package info
PACKAGE_SIZE=$(ls -lh production-backend-deploy.zip | awk '{print $5}')
echo "✅ Production deployment package created!"
echo ""
echo "Package: production-backend-deploy.zip"
echo "Size: $PACKAGE_SIZE"
echo ""

# List critical files to verify
echo "Verifying critical files are included:"
unzip -l production-backend-deploy.zip | grep -E "(server\.js|package\.json|\.ebextensions|routes/|controllers/|services/)" | head -20

echo ""
echo "✅ Package ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Go to AWS Elastic Beanstalk Console"
echo "2. Select billuminatemd-prod environment"
echo "3. Click 'Upload and deploy'"
echo "4. Upload: production-backend-deploy.zip"
echo "5. Monitor deployment logs"
echo ""
echo "⚠️  Remember: Environment variables must be set in EB Console:"
echo "  - DATABASE_URL (production Supabase)"
echo "  - AWS_S3_BUCKET (billuminatemd-uploads)"
echo "  - STRIPE_SECRET_KEY (live key)"
echo "  - ANTHROPIC_API_KEY"
echo "  - AWS_ACCESS_KEY_ID"
echo "  - AWS_SECRET_ACCESS_KEY"
echo "  - JWT_SECRET"
