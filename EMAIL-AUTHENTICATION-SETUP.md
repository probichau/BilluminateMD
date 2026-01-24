# Email Authentication Setup for billuminate.com

Complete guide to setting up SPF, DKIM, and DMARC for professional email deliverability.

---

## Why This Matters

Adding these DNS records will:
- ✅ **Prevent emails from going to spam** (90%+ inbox delivery)
- ✅ **Verify you own the domain** (email authentication)
- ✅ **Protect against spoofing** (prevents others from sending as you)
- ✅ **Improve sender reputation**
- ✅ **Required for production email at scale**

---

## Quick Summary

You'll add **5 DNS records** to Route 53:
1. SPF (1 TXT record)
2. DMARC (1 TXT record)
3. AWS SES DKIM (3 CNAME records)

**Note:** You do NOT need ImprovMX DKIM (requires paid tier). AWS SES DKIM is sufficient since SES sends your support emails.

**Total time:** 10-15 minutes

---

## Step 1: Add SPF Record

**What it does:** Authorizes ImprovMX and AWS SES to send email for your domain

### Route 53 Instructions:

1. Go to: https://console.aws.amazon.com/route53/
2. Click **"Hosted zones"** → **"billuminate.com"**
3. Click **"Create record"**
4. Enter:
   ```
   Record name: (leave blank)
   Record type: TXT
   Value: "v=spf1 include:spf.improvmx.com include:amazonses.com ~all"
   TTL: 300
   ```
5. Click **"Create records"**

---

## Step 2: Add DMARC Record

**What it does:** Tells email providers what to do if SPF/DKIM checks fail

### Route 53 Instructions:

1. Click **"Create record"**
2. Enter:
   ```
   Record name: _dmarc
   Record type: TXT
   Value: "v=DMARC1; p=none; rua=mailto:support@billuminate.com"
   TTL: 300
   ```
3. Click **"Create records"**

**Note:** `p=none` means "monitor but don't reject." After 2-4 weeks of monitoring, you can change to `p=quarantine` or `p=reject` for stronger protection.

---

## Step 3: Set Up AWS SES DKIM

**Why skip ImprovMX DKIM?** ImprovMX only handles INCOMING mail forwarding. Your support emails are SENT by AWS SES, so only AWS SES DKIM is needed for email authentication.

### Enable DKIM in AWS SES:

1. Go to: https://console.aws.amazon.com/ses/
2. Click **"Verified identities"** in left menu
3. Click **"Create identity"** (if you haven't verified support@billuminate.com yet)
   - Choose **"Email address"**
   - Enter: `support@billuminate.com`
   - Click **"Create identity"**
   - **Check your email** and verify (will forward via ImprovMX)

4. Once verified, click on: **support@billuminate.com**
5. Click **"Authentication"** tab
6. Under **"DomainKeys Identified Mail (DKIM)"**, click **"Edit"**
7. Select **"Easy DKIM"**
8. DKIM signing key length: **2048-bit** (recommended)
9. Click **"Save changes"**

### AWS will generate 3 CNAME records:

Example (your values will be different):
```
Name: abcdef123456._domainkey.billuminate.com
Type: CNAME
Value: abcdef123456.dkim.amazonses.com

Name: ghijkl789012._domainkey.billuminate.com
Type: CNAME
Value: ghijkl789012.dkim.amazonses.com

Name: mnopqr345678._domainkey.billuminate.com
Type: CNAME
Value: mnopqr345678.dkim.amazonses.com
```

### Add to Route 53:

For **each** of the 3 CNAME records:

1. Click **"Create record"** in Route 53
2. Enter:
   ```
   Record name: (the first part, e.g., "abcdef123456._domainkey")
   Record type: CNAME
   Value: (the full value, e.g., "abcdef123456.dkim.amazonses.com")
   TTL: 300
   ```
3. Click **"Create records"**
4. Repeat for all 3 records

**IMPORTANT:**
- Remove `.billuminate.com` from the record name if Route 53 adds it automatically
- Just use the prefix: `abcdef123456._domainkey`
- CNAME values do NOT need quotes

---

## Step 4: Verify Everything Works

### Check DNS Propagation (wait 5-15 minutes after adding):

```bash
# Check SPF
dig billuminate.com TXT +short | grep spf1

# Check DMARC
dig _dmarc.billuminate.com TXT +short

# Check AWS SES DKIM (use your actual record name)
dig abcdef123456._domainkey.billuminate.com CNAME +short
```

### Check AWS SES Console:

1. Go to SES → Verified identities → support@billuminate.com
2. Click **"Authentication"** tab
3. DKIM status should show: **"Successful"** (green checkmark)
4. If still "Pending", wait a few more minutes and refresh

### Send Test Email:

1. Use the support form at: https://stage.billuminate.com/support
2. Submit a test ticket
3. Check your inbox (should NOT be in spam now!)
4. Check email headers for authentication results:
   - `Authentication-Results` header should show:
     - `spf=pass`
     - `dkim=pass`
     - `dmarc=pass`

---

## Complete DNS Record Summary

After setup, your Route 53 should have:

```
# Existing Records
billuminate.com          A       [your IP]
billuminate.com          NS      [AWS nameservers]
billuminate.com          MX      10 mx1.improvmx.com
                                 20 mx2.improvmx.com

# New Authentication Records
billuminate.com          TXT     "v=spf1 include:spf.improvmx.com include:amazonses.com ~all"
_dmarc.billuminate.com   TXT     "v=DMARC1; p=none; rua=mailto:support@billuminate.com"
abc123._domainkey        CNAME   abc123.dkim.amazonses.com
def456._domainkey        CNAME   def456.dkim.amazonses.com
ghi789._domainkey        CNAME   ghi789.dkim.amazonses.com
```

---

## Troubleshooting

### SPF Issues

**Problem:** Emails still marked as spam
**Solution:**
- Verify SPF record with: `dig billuminate.com TXT +short | grep spf1`
- Make sure it includes both `spf.improvmx.com` and `amazonses.com`
- Wait 15-30 minutes for DNS propagation

### DKIM Issues

**Problem:** AWS SES shows "Pending" for DKIM
**Solution:**
- Verify all 3 CNAME records were added correctly
- Check for typos in record names (should end with `._domainkey`)
- Remove `.billuminate.com` from record name if Route 53 added it twice
- Wait 15-30 minutes

### DMARC Issues

**Problem:** DMARC record not found
**Solution:**
- Verify record name is exactly `_dmarc` (with underscore)
- Value should be in quotes
- Test with: `dig _dmarc.billuminate.com TXT +short`

---

## Email Authentication Checker Tools

Use these free tools to verify your setup:

1. **MXToolbox:** https://mxtoolbox.com/SuperTool.aspx
   - Enter: `billuminate.com`
   - Check: SPF, DKIM, DMARC tabs

2. **Google Admin Toolbox:** https://toolbox.googleapps.com/apps/checkmx/
   - Enter: `billuminate.com`
   - Comprehensive check of all email records

3. **Mail-Tester:** https://www.mail-tester.com/
   - Send a test email from your support form
   - Get a deliverability score (should be 9/10 or 10/10)

---

## Next Steps After Setup

1. **Wait 24-48 hours** for full DNS propagation globally
2. **Monitor DMARC reports** (you'll get weekly XML emails to support@billuminate.com)
3. **After 2-4 weeks of monitoring**, consider strengthening DMARC:
   ```
   Change: "v=DMARC1; p=none; rua=mailto:support@billuminate.com"
   To:     "v=DMARC1; p=quarantine; rua=mailto:support@billuminate.com"
   ```

4. **Test regularly** by submitting support tickets and checking deliverability

---

## Security Benefits

With full SPF + DKIM + DMARC setup:

- ✅ **99%+ inbox delivery rate**
- ✅ Gmail/Outlook won't flag as spam
- ✅ Protects your brand from email spoofing
- ✅ Prevents phishing attacks using your domain
- ✅ Builds sender reputation over time
- ✅ Required for sending at scale (>100 emails/day)

---

## Reference Links

- **AWS SES DKIM:** https://docs.aws.amazon.com/ses/latest/dg/send-email-authentication-dkim.html
- **ImprovMX Docs:** https://improvmx.com/guides/
- **SPF Syntax:** https://dmarcian.com/spf-syntax-table/
- **DMARC Guide:** https://dmarcian.com/dmarc-guide/

---

**Questions?** Check the SUPPORT-SETUP-GUIDE.md for the full AWS SES setup!
