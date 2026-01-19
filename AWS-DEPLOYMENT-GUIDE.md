# AWS Deployment Guide for BilluminateMD

## Prerequisites Completed ✅
- EB CLI installed
- Backend prepared with EB configuration files
- Procfile created
- .ebignore configured

## Step 1: Configure AWS Credentials

Since you're logged into AWS, you need to set up CLI access:

1. **Get your AWS credentials:**
   - Go to AWS Console → IAM → Users → Your User
   - Click "Security credentials" tab
   - Click "Create access key"
   - Choose "Command Line Interface (CLI)"
   - Download the credentials

2. **Run in terminal:**
```bash
cd /Users/bernardpeterrobichau/Library/CloudStorage/Dropbox/Claude\ Code/BilluminateMD/backend
export PATH="/Users/bernardpeterrobichau/Library/Python/3.13/bin:$PATH"
```

## Step 2: Initialize Elastic Beanstalk

Run this command and follow the prompts:

```bash
eb init
```

**Choose the following options:**
- Region: `us-east-1` (or your preferred region)
- Application name: `billuminatemd` (or your choice)
- Platform: `Node.js`
- Platform version: Latest (e.g., Node.js 18 or 20)
- CodeCommit: `n` (no)
- SSH: `y` (yes, for debugging)

This creates a `.elasticbeanstalk/config.yml` file.

## Step 3: Create Environment and Deploy

```bash
eb create billuminatemd-prod --instance-type t3.small
```

This will:
- Create an Elastic Beanstalk environment
- Set up a load balancer
- Deploy your application
- Provide you with a URL (e.g., `billuminatemd-prod.us-east-1.elasticbeanstalk.com`)

**Wait 5-10 minutes** for the environment to be created.

## Step 4: Set Environment Variables

After deployment, configure your environment variables:

```bash
eb setenv \
  NODE_ENV=production \
  ANTHROPIC_API_KEY=your-key-here \
  DATABASE_URL=your-neon-db-url \
  AWS_ACCESS_KEY_ID=your-aws-key \
  AWS_SECRET_ACCESS_KEY=your-aws-secret \
  AWS_REGION=us-east-1 \
  AWS_S3_BUCKET=your-bucket-name \
  STRIPE_SECRET_KEY=your-stripe-key \
  STRIPE_WEBHOOK_SECRET=your-webhook-secret \
  JWT_SECRET=your-secure-random-string \
  FRONTEND_URL=https://your-frontend-url.com
```

**Important:** Replace all placeholder values with your actual credentials.

## Step 5: Configure HTTPS/SSL

After deployment, enable HTTPS:

1. Go to AWS Console → Elastic Beanstalk
2. Select your environment
3. Configuration → Load balancer
4. Add listener on port 443
5. Upload or use AWS Certificate Manager for SSL

## Step 6: Get Your Backend URL

```bash
eb status
```

Look for the "CNAME" - this is your backend URL.

Example: `billuminatemd-prod.us-east-1.elasticbeanstalk.com`

## Step 7: Update Frontend

Update your frontend to use the new backend URL instead of `localhost:5001`.

## Common EB Commands

```bash
# View logs
eb logs

# Open app in browser
eb open

# Deploy updates
eb deploy

# Check health
eb health

# SSH into instance
eb ssh

# Terminate environment
eb terminate billuminatemd-prod
```

## Troubleshooting

If deployment fails:

1. **Check logs:**
```bash
eb logs --all
```

2. **View recent logs:**
```bash
eb logs --tail
```

3. **Check environment health:**
```bash
eb health --refresh
```

4. **Common issues:**
   - Missing environment variables → Use `eb setenv`
   - Port mismatch → EB uses port 8080 (already configured)
   - Database connection → Ensure DATABASE_URL is correct
   - S3 permissions → Verify AWS credentials have S3 access

## Cost Estimate

With a t3.small instance:
- **EC2 instance:** ~$15-20/month
- **Load balancer:** ~$20/month
- **Data transfer:** Variable
- **Total:** ~$35-50/month

## Scaling

To scale your application:

```bash
eb scale 2
```

This runs 2 instances behind the load balancer.

## Next Steps

1. Set up custom domain (Route 53)
2. Configure HTTPS/SSL
3. Set up CloudWatch alarms
4. Configure auto-scaling policies
5. Deploy frontend to AWS Amplify
