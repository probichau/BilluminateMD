# Quick Email Authentication Setup - billuminate.com

**Goal:** Stop support emails from going to spam (10 minutes)

---

## Why This Works Without ImprovMX DKIM

- **ImprovMX** = Incoming mail only (forwards mail TO you)
- **AWS SES** = Outgoing mail only (sends support emails FROM you)
- **You only need DKIM for outgoing mail** = AWS SES DKIM is enough!

---

## Step 1: Add SPF Record (2 minutes)

1. Go to: https://console.aws.amazon.com/route53/
2. Click **Hosted zones** → **billuminate.com**
3. Click **Create record**
4. Enter exactly:
   ```
   Record name: (leave blank)
   Record type: TXT
   Value: "v=spf1 include:spf.improvmx.com include:amazonses.com ~all"
   TTL: 300
   ```
5. Click **Create records**

---

## Step 2: Add DMARC Record (1 minute)

1. Click **Create record**
2. Enter exactly:
   ```
   Record name: _dmarc
   Record type: TXT
   Value: "v=DMARC1; p=none; rua=mailto:support@billuminate.com"
   TTL: 300
   ```
3. Click **Create records**

---

## Step 3: Set Up AWS SES DKIM (5 minutes)

### A. Verify Your Email in SES

1. Go to: https://console.aws.amazon.com/ses/
2. Click **Verified identities** → **Create identity**
3. Choose **Email address**
4. Enter: `support@billuminate.com`
5. Click **Create identity**
6. **Check your email** (ImprovMX will forward it) and click verification link

### B. Enable DKIM

1. Once verified, click on **support@billuminate.com**
2. Click **Authentication** tab
3. Under **DKIM**, click **Edit**
4. Select **Easy DKIM**
5. DKIM signing key length: **2048-bit**
6. Click **Save changes**

### C. Add the 3 CNAME Records

AWS will show you 3 CNAME records. For each one:

1. Go back to Route 53 → billuminate.com
2. Click **Create record**
3. Enter:
   ```
   Record name: (just the prefix, e.g., "abc123._domainkey")
   Record type: CNAME
   Value: (full value from SES, e.g., "abc123.dkim.amazonses.com")
   TTL: 300
   ```
4. Click **Create records**
5. Repeat for all 3 records

**IMPORTANT:** Remove `.billuminate.com` from record name if Route 53 adds it automatically.

---

## Step 4: Wait & Verify (5-15 minutes)

### Check DNS Propagation:

```bash
# Check SPF
dig billuminate.com TXT +short | grep spf1

# Check DMARC
dig _dmarc.billuminate.com TXT +short

# Check AWS SES DKIM (replace with your actual record name)
dig abc123._domainkey.billuminate.com CNAME +short
```

### Check SES Console:

1. Go to SES → Verified identities → support@billuminate.com
2. Click **Authentication** tab
3. DKIM status should show: **"Successful"** (green checkmark)
4. If "Pending", wait a few minutes and refresh

---

## Step 5: Configure Backend & Test

### A. Add AWS Credentials to Backend

1. Go to IAM Console: https://console.aws.amazon.com/iam/
2. Create user with `AmazonSESFullAccess` policy (see SUPPORT-SETUP-GUIDE.md for details)
3. Get Access Key ID and Secret Access Key

### B. Update Environment Variables

Add to `/backend/.env`:
```bash
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
SES_FROM_EMAIL=support@billuminate.com
SUPPORT_EMAIL=support@billuminate.com
```

### C. Request Production Access

1. In SES Console, click **Account dashboard**
2. Click **Request production access**
3. Fill out form (see SUPPORT-SETUP-GUIDE.md for example)
4. Usually approved within 24 hours

### D. Test Support Form

1. Go to: https://stage.billuminate.com/support
2. Submit test ticket
3. Check your inbox (should NOT be in spam!)
4. Verify email headers show:
   - `spf=pass`
   - `dkim=pass`
   - `dmarc=pass`

---

## Final DNS Records Summary

You should have these 5 records in Route 53:

```
# Authentication Records
billuminate.com          TXT     "v=spf1 include:spf.improvmx.com include:amazonses.com ~all"
_dmarc.billuminate.com   TXT     "v=DMARC1; p=none; rua=mailto:support@billuminate.com"
abc123._domainkey        CNAME   abc123.dkim.amazonses.com
def456._domainkey        CNAME   def456.dkim.amazonses.com
ghi789._domainkey        CNAME   ghi789.dkim.amazonses.com

# Existing Records (already configured)
billuminate.com          MX      10 mx1.improvmx.com, 20 mx2.improvmx.com
```

---

## Expected Results

After setup:
- ✅ Support emails arrive in inbox (not spam)
- ✅ 99%+ delivery rate
- ✅ Protected from email spoofing
- ✅ Professional sender reputation

---

## Why You Don't Need ImprovMX DKIM

**ImprovMX DKIM** would only authenticate emails that ImprovMX sends on your behalf. But:
1. ImprovMX only **forwards** emails (doesn't send them)
2. Your support form emails are **sent by AWS SES**
3. AWS SES DKIM authenticates those emails
4. SPF allows both ImprovMX and SES to send for your domain
5. DMARC ties it all together

**Bottom line:** You're fully authenticated without paying for ImprovMX Pro!

---

**Questions?** See EMAIL-AUTHENTICATION-SETUP.md for detailed explanations or SUPPORT-SETUP-GUIDE.md for AWS SES setup.
