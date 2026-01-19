# AWS Amplify Frontend Deployment Guide

## Prerequisites Completed ✅
- `amplify.yml` build configuration created
- Frontend uses environment variables (VITE_API_URL, VITE_STRIPE_PUBLIC_KEY)
- Vite build configured

## Deployment Options

### Option 1: AWS Amplify Console (Recommended - Easiest)

This method provides automatic CI/CD from your Git repository.

#### Step 1: Push Code to Git

If you haven't already, initialize git and push to GitHub/GitLab/Bitbucket:

```bash
cd /Users/bernardpeterrobichau/Library/CloudStorage/Dropbox/Claude\ Code/BilluminateMD
git init
git add .
git commit -m "Initial commit - BilluminateMD"

# Create a GitHub repository and push
git remote add origin https://github.com/yourusername/billuminatemd.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy with Amplify Console

1. **Go to AWS Amplify Console:**
   - Open AWS Console → Search for "Amplify"
   - Click "Get Started" under "Amplify Hosting"

2. **Connect Repository:**
   - Choose your Git provider (GitHub, GitLab, Bitbucket)
   - Authorize AWS Amplify to access your repository
   - Select repository: `billuminatemd`
   - Select branch: `main`

3. **Configure Build Settings:**
   - App name: `billuminatemd-frontend`
   - Environment: `production`
   - **Build settings are auto-detected** from `amplify.yml`
   - Monorepo: Yes, set build directory to `frontend`

4. **Advanced Settings - Environment Variables:**
   Click "Advanced settings" and add:
   ```
   VITE_API_URL = https://your-backend-url.elasticbeanstalk.com
   VITE_STRIPE_PUBLIC_KEY = pk_live_your_stripe_key
   ```
   
   **Important:** Use your actual Elastic Beanstalk backend URL from Step 6 of the backend deployment.

5. **Deploy:**
   - Review and click "Save and deploy"
   - Wait 5-10 minutes for initial deployment
   - You'll get a URL like: `https://main.d1234abcd.amplifyapp.com`

6. **Custom Domain (Optional):**
   - In Amplify Console → Domain management
   - Add your custom domain (e.g., `app.billuminatemd.com`)
   - Follow DNS configuration steps
   - SSL certificate is automatically provisioned

---

### Option 2: Manual S3 + CloudFront Deployment

This method gives you more control but requires more setup.

#### Step 1: Build the Frontend

```bash
cd /Users/bernardpeterrobichau/Library/CloudStorage/Dropbox/Claude\ Code/BilluminateMD/frontend

# Create production .env
cat > .env.production << EOL
VITE_API_URL=https://your-backend-url.elasticbeanstalk.com
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_key
EOL

# Build
npm run build
```

This creates a `dist/` folder with your production build.

#### Step 2: Create S3 Bucket

1. Go to AWS S3 Console
2. Click "Create bucket"
3. Bucket name: `billuminatemd-frontend` (must be globally unique)
4. Region: Same as your backend
5. **Uncheck** "Block all public access"
6. Create bucket

#### Step 3: Enable Static Website Hosting

1. Select your bucket
2. Properties tab → Static website hosting
3. Enable it
4. Index document: `index.html`
5. Error document: `index.html` (for React Router)

#### Step 4: Add Bucket Policy

Go to Permissions → Bucket policy and add:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::billuminatemd-frontend/*"
    }
  ]
}
```

#### Step 5: Upload Files

```bash
aws s3 sync dist/ s3://billuminatemd-frontend --delete
```

Your site is now live at: `http://billuminatemd-frontend.s3-website-us-east-1.amazonaws.com`

#### Step 6: Set Up CloudFront CDN (Recommended)

1. Go to CloudFront Console
2. Create distribution
3. Origin domain: Select your S3 bucket
4. Viewer protocol policy: Redirect HTTP to HTTPS
5. Default root object: `index.html`
6. Create distribution
7. Wait 10-15 minutes for deployment

You'll get a CloudFront URL: `https://d1234abcd.cloudfront.net`

#### Step 7: Configure Error Pages (React Router)

In CloudFront distribution settings:
1. Error pages → Create custom error response
2. HTTP error code: `404`
3. Customize error response: Yes
4. Response page path: `/index.html`
5. HTTP response code: `200`

---

## Comparison: Amplify vs S3+CloudFront

| Feature | Amplify | S3 + CloudFront |
|---------|---------|-----------------|
| **Setup** | Very Easy | Moderate |
| **CI/CD** | Built-in | Manual/GitHub Actions |
| **SSL** | Automatic | ACM + Manual config |
| **Cost** | ~$15-20/month | ~$5-10/month |
| **Previews** | Branch previews | Manual |
| **Rollbacks** | One-click | Manual |

**Recommendation:** Use **Amplify** for ease of use and automatic deployments.

---

## Environment Variables Reference

Set these in Amplify Console or your `.env.production`:

```bash
# Backend API URL (from EB deployment)
VITE_API_URL=https://billuminatemd-prod.us-east-1.elasticbeanstalk.com

# Stripe Publishable Key (from Stripe Dashboard)
VITE_STRIPE_PUBLIC_KEY=pk_live_51ABC...

# Optional: Google Analytics, etc.
VITE_GA_TRACKING_ID=UA-XXXXXXXXX-X
```

---

## Updating the Deployment

### With Amplify:
Just push to your git repository:
```bash
git add .
git commit -m "Update frontend"
git push
```
Amplify automatically rebuilds and deploys.

### With S3+CloudFront:
```bash
npm run build
aws s3 sync dist/ s3://billuminatemd-frontend --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## Connecting Frontend to Backend

After both deployments:

1. **Update Backend CORS:**
   Add your Amplify URL to backend CORS config in `server.js`:
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:5173',
       'https://main.d1234abcd.amplifyapp.com', // Your Amplify URL
       'https://app.billuminatemd.com' // Your custom domain
     ]
   }))
   ```

2. **Update Google OAuth Callback:**
   Add to Google Cloud Console authorized redirect URIs:
   ```
   https://your-backend-url.elasticbeanstalk.com/api/auth/google/callback
   ```

3. **Update Stripe Webhooks:**
   Point webhook to:
   ```
   https://your-backend-url.elasticbeanstalk.com/api/payment/webhook
   ```

4. **Test End-to-End:**
   - Visit your Amplify URL
   - Sign up/login
   - Upload a bill
   - Process payment
   - Verify everything works

---

## Cost Estimate

### Amplify Hosting:
- Build minutes: ~$0.01/minute
- Hosting: ~$0.15/GB served
- **Estimated:** $15-20/month (with free tier)

### S3 + CloudFront:
- S3 storage: ~$0.023/GB
- CloudFront: ~$0.085/GB (first 10TB)
- **Estimated:** $5-10/month

---

## Troubleshooting

### Build Fails in Amplify:
- Check build logs in Amplify Console
- Verify `amplify.yml` is correct
- Ensure all dependencies are in `package.json`

### API Calls Failing:
- Check CORS settings in backend
- Verify `VITE_API_URL` is correct
- Check browser console for errors

### React Router 404s:
- Ensure error page redirects to `index.html`
- Configure CloudFront custom error responses

### Environment Variables Not Working:
- Ensure they start with `VITE_`
- Rebuild after adding new variables
- Check browser console: `import.meta.env`

---

## Next Steps

1. **Custom Domain:** Set up `app.billuminatemd.com`
2. **Monitoring:** Set up CloudWatch alerts
3. **Analytics:** Add Google Analytics
4. **SEO:** Configure meta tags and sitemap
5. **Performance:** Enable gzip/brotli compression
