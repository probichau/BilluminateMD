#!/bin/bash
set -e

# Staging Deployment Package Creator

echo "📦 Creating Staging Deployment Package"
echo "======================================="

# Check we're on staging branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "staging" ]; then
    echo "❌ Error: You must be on the staging branch to create a staging deployment"
    echo "   Current branch: $CURRENT_BRANCH"
    exit 1
fi

cd backend

# Remove old deployment package
rm -f ../staging-backend-deploy.zip

echo ""
echo "Creating deployment package..."
echo ""

# Create the zip file with explicit exclusions
zip -r ../staging-backend-deploy.zip . \
    -x "*.git*" \
    -x "node_modules/*" \
    -x ".env*" \
    -x ".elasticbeanstalk/*" \
    -x "*.log" \
    -x "*.pid" \
    -x "test-*.js" \
    -x "check-subscription.js" \
    -x "setup-*.js" \
    -x "setup-*.sh" \
    -x "set-env-vars.sh" \
    -x "*.md" \
    -q

cd ..

# Show package info
PACKAGE_SIZE=$(ls -lh staging-backend-deploy.zip | awk '{print $5}')
echo "✅ Staging deployment package created!"
echo ""
echo "Package: staging-backend-deploy.zip"
echo "Size: $PACKAGE_SIZE"
echo ""
echo "Next steps:"
echo "1. Go to AWS Elastic Beanstalk Console"
echo "2. Select billuminate-staging environment"
echo "3. Click 'Upload and deploy'"
echo "4. Upload: staging-backend-deploy.zip"
