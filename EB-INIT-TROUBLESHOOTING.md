# Troubleshooting `eb init`

## Common Issues and Solutions

### Issue 1: "eb: command not found"

**Solution:**
```bash
export PATH="/Users/bernardpeterrobichau/Library/Python/3.13/bin:$PATH"
eb --version  # Should show: EB CLI 3.26
```

### Issue 2: "AWS credentials not found"

The EB CLI needs AWS credentials to work. Here's how to set them up:

**Option A: Interactive Configuration**
```bash
eb init
# When prompted, choose:
# "Do you want to set up AWS credentials?" → Yes
# Then enter your AWS Access Key ID and Secret Access Key
```

**Option B: Manual Configuration**
```bash
# Create AWS credentials file
mkdir -p ~/.aws
cat > ~/.aws/credentials << EOL
[default]
aws_access_key_id = YOUR_ACCESS_KEY_ID
aws_secret_access_key = YOUR_SECRET_ACCESS_KEY
EOL

cat > ~/.aws/config << EOL
[default]
region = us-east-1
EOL
```

**Getting AWS Credentials:**
1. Go to AWS Console: https://console.aws.amazon.com/
2. Click your name (top right) → Security credentials
3. Scroll to "Access keys"
4. Click "Create access key"
5. Choose "Command Line Interface (CLI)"
6. Download or copy the keys

### Issue 3: "Select a default region"

**Recommended regions:**
- `us-east-1` - US East (N. Virginia) - Most services, lowest cost
- `us-west-2` - US West (Oregon) - Good alternative
- `eu-west-1` - Europe (Ireland) - If targeting EU

Choose the one closest to your users.

### Issue 4: "Select an application to use"

If you see existing applications:
- Choose "Create new Application"
- Application name: `billuminatemd` (or your choice)

### Issue 5: "Select a platform"

Choose:
- Platform: **Node.js**
- Platform version: **Node.js 20** (or latest available)

### Issue 6: "Do you want to set up SSH for your instances?"

Choose: **Yes (y)**

This allows you to SSH into your instances for debugging.

If asked for keypair:
- Choose "Create new keypair"
- Keypair name: `billuminatemd-keypair`

---

## Full `eb init` Walkthrough

Here's what you'll see and what to answer:

```
$ eb init

Select a default region
1) us-east-1 : US East (N. Virginia)
2) us-west-1 : US West (N. California)
3) us-west-2 : US West (Oregon)
...
(default is 3): 1  ← Choose 1 for us-east-1

Enter Application Name
(default is "backend"): billuminatemd  ← Enter your app name

It appears you are using Node.js. Is this correct?
(Y/n): Y  ← Confirm

Select a platform branch.
1) Node.js 20 running on 64bit Amazon Linux 2023
2) Node.js 18 running on 64bit Amazon Linux 2023
...
(default is 1): 1  ← Choose latest Node.js

Do you wish to continue with CodeCommit?
(Y/n): n  ← Say no

Do you want to set up SSH for your instances?
(Y/n): Y  ← Say yes

Select a keypair.
1) my-keypair
2) [ Create new KeyPair ]
(default is 1): 2  ← Create new

Type a keypair name.
(Default is aws-eb): billuminatemd-keypair  ← Name it
```

---

## Verification

After `eb init` completes successfully, you should see:
```
Application billuminatemd has been created.
```

And a new directory should exist:
```bash
ls -la .elasticbeanstalk/
# Should show: config.yml
```

---

## Alternative: Skip Interactive Mode

If you want to skip the interactive prompts:

```bash
eb init billuminatemd \
  --platform node.js \
  --region us-east-1 \
  --keyname billuminatemd-keypair
```

---

## Still Stuck?

Tell me:
1. What command you ran
2. The exact error message you see
3. Where in the process you're stuck

I'll provide specific help!
