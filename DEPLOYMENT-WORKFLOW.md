# Deployment Workflow for BilluminateMD

## Environment Overview

### Staging Environment
- **Frontend**: stage.billuminate.com (AWS Amplify - staging branch)
- **Backend**: stage-api.billuminate.com (AWS Elastic Beanstalk - manual deployment)
- **Database**: Supabase staging database
- **Storage**: S3 bucket `billuminatemd-staging-uploads`

### Production Environment
- **Frontend**: app.billuminate.com (AWS Amplify - main branch)
- **Backend**: api.billuminate.com (AWS Elastic Beanstalk - manual deployment)
- **Database**: Supabase production database
- **Storage**: S3 bucket `billuminatemd-uploads`

## Deployment Process

### 1. Develop and Test in Staging

```bash
# Make changes on the staging branch
git checkout staging
# ... make your changes ...
git add .
git commit -m "Your change description"
git push origin staging
```

#### Deploy Staging Frontend (Automatic)
- AWS Amplify automatically deploys when you push to the `staging` branch
- Monitor: AWS Amplify Console → staging branch

#### Deploy Staging Backend (Manual)
```bash
# Create deployment package
cd backend
rm -f ../staging-backend-deploy.zip
zip -r ../staging-backend-deploy.zip . -x "*.git*" -x "node_modules/*" -x ".env" -x ".elasticbeanstalk/*" -x "*.log" -x "*.pid"
```

Then in AWS Console:
1. Go to Elastic Beanstalk → staging environment
2. Click "Upload and deploy"
3. Upload `staging-backend-deploy.zip`
4. Deploy

#### Test Staging
- Visit https://stage.billuminate.com
- Test all functionality
- Verify uploads, payments, and API calls work correctly

### 2. Promote to Production

Once staging is working correctly:

```bash
# Switch to main branch
git checkout main

# Merge staging into main
git merge staging

# Push to remote
git push origin main
```

#### Deploy Production Frontend (Automatic)
- AWS Amplify automatically deploys when you push to the `main` branch
- Monitor: AWS Amplify Console → main branch

#### Deploy Production Backend (Manual)
```bash
# Create deployment package from main branch
cd backend
rm -f ../production-backend-deploy.zip
zip -r ../production-backend-deploy.zip . -x "*.git*" -x "node_modules/*" -x ".env" -x ".elasticbeanstalk/*" -x "*.log" -x "*.pid"
```

Then in AWS Console:
1. Go to Elastic Beanstalk → production environment
2. Click "Upload and deploy"
3. Upload `production-backend-deploy.zip`
4. Deploy

#### Test Production
- Visit https://app.billuminate.com
- Verify everything works as expected

## Key Differences Between Environments

### Code Differences
The ONLY code difference is in `backend/server.js` CORS configuration:
- **Staging** includes: staging URLs + production URLs
- **Production** includes: staging URLs + production URLs (same as staging)

This means **both environments run identical code**. The staging URLs in production's CORS list are harmless - they'll never be used.

### Configuration Differences (Environment Variables)
These are set in AWS Console and are DIFFERENT between environments:

#### Backend (Elastic Beanstalk Environment Variables)
**Staging:**
- `DATABASE_URL` → Staging Supabase database
- `AWS_S3_BUCKET` → `billuminatemd-staging-uploads`
- `STRIPE_SECRET_KEY` → Stripe test key
- `ANTHROPIC_API_KEY` → (shared or separate, your choice)

**Production:**
- `DATABASE_URL` → Production Supabase database
- `AWS_S3_BUCKET` → `billuminatemd-uploads`
- `STRIPE_SECRET_KEY` → Stripe live key
- `ANTHROPIC_API_KEY` → (shared or separate, your choice)

#### Frontend (AWS Amplify Environment Variables)
**Staging:**
- `VITE_API_URL` → `https://stage-api.billuminate.com`
- `VITE_STRIPE_PUBLIC_KEY` → Stripe test public key

**Production:**
- `VITE_API_URL` → `https://api.billuminate.com`
- `VITE_STRIPE_PUBLIC_KEY` → Stripe live public key

## Safety Notes

1. **Code is identical** - Both environments run the same code, separated only by environment variables
2. **CORS is safe** - Having staging URLs in production's CORS list doesn't create any security risk
3. **No branch-specific code** - Never add `if (env === 'staging')` logic; use environment variables instead
4. **Test thoroughly in staging** - Since code is identical, what works in staging will work in production
5. **Environment variables are key** - All environment differences are controlled via AWS Console settings, not code

## Rollback Process

### Frontend Rollback (Amplify)
1. Go to AWS Amplify Console
2. Select the branch (main or staging)
3. Click on a previous successful deployment
4. Click "Redeploy this version"

### Backend Rollback (Elastic Beanstalk)
1. Go to Elastic Beanstalk Console
2. Select the environment
3. Click "Application versions" in the left sidebar
4. Select a previous version
5. Click "Deploy"

## Common Issues

### Backend not picking up changes
- Verify you created the zip file from the correct branch
- Check the deployment logs in EB Console
- Verify environment variables are set correctly in EB Console

### Frontend shows old code
- Check Amplify build logs
- Verify the correct branch is deployed
- Check browser cache (hard refresh: Cmd+Shift+R)

### CORS errors
- Verify the origin URL is in the CORS list in `backend/server.js`
- Verify the backend deployment succeeded
- Check that frontend is using the correct API URL
