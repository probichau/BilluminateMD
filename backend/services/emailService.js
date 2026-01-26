/**
 * Email Service
 * Handles all email sending via AWS SES
 */

import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

// Configure AWS SES Client
const sesClient = new SESClient({
  region: process.env.SES_AWS_REGION || process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.SES_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const FROM_EMAIL = process.env.SES_FROM_EMAIL || 'support@billuminate.com'
const APP_URL = process.env.NODE_ENV === 'production'
  ? 'https://billuminate.com'
  : 'https://stage.billuminate.com'

/**
 * Send payment confirmation email to customer
 * @param {string} customerEmail - Customer's email address
 * @param {object} audit - Audit object from database
 */
export async function sendPaymentConfirmation(customerEmail, audit) {
  const reportUrl = `${APP_URL}/results/${audit.auditId}`
  const totalSavings = audit.savings?.total || 0
  const providerName = audit.providerInfo?.facilityName || 'your healthcare provider'
  const patientName = audit.patientInfo?.name || 'Patient'

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #334155;
      margin: 0;
      padding: 0;
      background-color: #f8fafc;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .savings-box {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
      margin: 30px 0;
    }
    .savings-box h2 {
      margin: 0 0 8px 0;
      color: #ffffff;
      font-size: 16px;
      font-weight: 500;
      opacity: 0.9;
    }
    .savings-amount {
      color: #ffffff;
      font-size: 48px;
      font-weight: 700;
      margin: 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-weight: 600;
      margin: 20px 0;
      text-align: center;
    }
    .info-section {
      background-color: #f1f5f9;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .info-section h3 {
      margin: 0 0 12px 0;
      color: #1e293b;
      font-size: 16px;
      font-weight: 600;
    }
    .info-section p {
      margin: 8px 0;
      color: #475569;
      font-size: 14px;
    }
    .footer {
      background-color: #f8fafc;
      padding: 30px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
    }
    .footer p {
      margin: 8px 0;
      color: #64748b;
      font-size: 14px;
    }
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <h1>✅ Payment Confirmed</h1>
    </div>

    <!-- Main Content -->
    <div class="content">
      <p>Hi there,</p>

      <p>Thank you for your purchase! Your medical bill analysis for <strong>${providerName}</strong> is now complete and ready to view.</p>

      <!-- Savings Highlight -->
      <div class="savings-box">
        <h2>Potential Savings Identified</h2>
        <p class="savings-amount">$${totalSavings.toFixed(2)}</p>
      </div>

      <!-- CTA Button -->
      <div style="text-align: center;">
        <a href="${reportUrl}" class="button">View Your Full Report</a>
      </div>

      <!-- What's Included -->
      <div class="info-section">
        <h3>📋 What's Included in Your Report:</h3>
        <p>✓ Detailed analysis of all billing errors</p>
        <p>✓ Charity care eligibility assessment</p>
        <p>✓ Professional appeal letter template</p>
        <p>✓ Step-by-step guidance for disputing charges</p>
      </div>

      <!-- Receipt Info -->
      <div class="info-section">
        <h3>🧾 Payment Receipt</h3>
        <p><strong>Amount Paid:</strong> $49.00</p>
        <p><strong>Report ID:</strong> ${audit.auditId}</p>
        <p><strong>Patient:</strong> ${patientName}</p>
        <p><strong>Provider:</strong> ${providerName}</p>
      </div>

      <!-- Next Steps -->
      <p style="margin-top: 30px;"><strong>Next Steps:</strong></p>
      <ol style="color: #475569; line-height: 1.8;">
        <li>Review your full report at the link above</li>
        <li>Download your personalized appeal letter</li>
        <li>Follow the guidance to dispute overcharges</li>
        <li>Contact your provider's billing department</li>
      </ol>

      <!-- Support -->
      <p style="margin-top: 30px;">Questions or need help? Reply to this email or visit our <a href="${APP_URL}/support" style="color: #3b82f6; text-decoration: none;">support page</a>.</p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p><strong>BilluminateMD</strong></p>
      <p>Helping you fight medical billing errors</p>
      <p style="margin-top: 20px;">
        <a href="${APP_URL}">Home</a> •
        <a href="${APP_URL}/support">Support</a> •
        <a href="${APP_URL}/privacy">Privacy</a>
      </p>
      <p style="font-size: 12px; color: #94a3b8; margin-top: 20px;">
        You're receiving this email because you purchased a bill analysis from BilluminateMD.
      </p>
    </div>
  </div>
</body>
</html>
`

  const textBody = `
Payment Confirmed - Your BilluminateMD Report is Ready

Hi there,

Thank you for your purchase! Your medical bill analysis for ${providerName} is now complete and ready to view.

POTENTIAL SAVINGS IDENTIFIED: $${totalSavings.toFixed(2)}

View Your Full Report:
${reportUrl}

What's Included in Your Report:
✓ Detailed analysis of all billing errors
✓ Charity care eligibility assessment
✓ Professional appeal letter template
✓ Step-by-step guidance for disputing charges

Payment Receipt:
- Amount Paid: $49.00
- Report ID: ${audit.auditId}
- Patient: ${patientName}
- Provider: ${providerName}

Next Steps:
1. Review your full report at the link above
2. Download your personalized appeal letter
3. Follow the guidance to dispute overcharges
4. Contact your provider's billing department

Questions or need help? Reply to this email or visit ${APP_URL}/support

Best regards,
The BilluminateMD Team
`

  const params = {
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [customerEmail],
    },
    ReplyToAddresses: [FROM_EMAIL],
    Message: {
      Subject: {
        Data: `✅ Your BilluminateMD Report is Ready - $${totalSavings.toFixed(2)} in Potential Savings`,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
      },
    },
  }

  try {
    const command = new SendEmailCommand(params)
    const result = await sesClient.send(command)
    console.log(`✅ Payment confirmation email sent to ${customerEmail}`, result.MessageId)
    return result
  } catch (error) {
    console.error('❌ Failed to send payment confirmation email:', error)
    throw error
  }
}

/**
 * Send admin notification email for new purchase
 * @param {string} customerEmail - Customer's email address
 * @param {object} audit - Audit object from database
 * @param {string} paymentIntentId - Stripe payment intent ID
 */
export async function sendAdminPurchaseNotification(customerEmail, audit, paymentIntentId) {
  const adminEmail = process.env.ADMIN_EMAIL || 'bernard@probichau.com'
  const reportUrl = `${APP_URL}/results/${audit.auditId}`
  const totalSavings = audit.savings?.total || 0
  const providerName = audit.providerInfo?.facilityName || 'Unknown Provider'
  const patientName = audit.patientInfo?.name || 'Unknown Patient'
  const stripeUrl = `https://dashboard.stripe.com/${process.env.NODE_ENV === 'production' ? '' : 'test/'}payments/${paymentIntentId}`

  const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: monospace; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
    .section { background: #f8f9fa; padding: 15px; margin: 15px 0; border-left: 4px solid #3b82f6; }
    .amount { font-size: 24px; font-weight: bold; color: #10b981; }
    a { color: #3b82f6; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0;">💰 New Purchase - $49.00</h2>
    </div>

    <div class="section">
      <h3>Transaction Details</h3>
      <p><strong>Amount:</strong> <span class="amount">$49.00</span></p>
      <p><strong>Payment ID:</strong> ${paymentIntentId}</p>
      <p><strong>Stripe Dashboard:</strong> <a href="${stripeUrl}">View Transaction</a></p>
      <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
    </div>

    <div class="section">
      <h3>Customer Information</h3>
      <p><strong>Email:</strong> ${customerEmail}</p>
      <p><strong>Patient:</strong> ${patientName}</p>
    </div>

    <div class="section">
      <h3>Report Details</h3>
      <p><strong>Report ID:</strong> ${audit.auditId}</p>
      <p><strong>Provider:</strong> ${providerName}</p>
      <p><strong>Potential Savings:</strong> $${totalSavings.toFixed(2)}</p>
      <p><strong>Report URL:</strong> <a href="${reportUrl}">${reportUrl}</a></p>
    </div>

    <div class="section">
      <h3>Quick Actions</h3>
      <p>• <a href="${stripeUrl}">View in Stripe Dashboard</a></p>
      <p>• <a href="${reportUrl}">View Customer's Report</a></p>
      <p>• Reply to this email to contact customer</p>
    </div>
  </div>
</body>
</html>`

  const textBody = `
🎉 NEW PURCHASE - $49.00

TRANSACTION DETAILS
-------------------
Amount: $49.00
Payment ID: ${paymentIntentId}
Stripe: ${stripeUrl}
Date: ${new Date().toLocaleString()}

CUSTOMER INFO
-------------
Email: ${customerEmail}
Patient: ${patientName}

REPORT DETAILS
--------------
Report ID: ${audit.auditId}
Provider: ${providerName}
Potential Savings: $${totalSavings.toFixed(2)}
Report URL: ${reportUrl}

QUICK ACTIONS
-------------
- View in Stripe: ${stripeUrl}
- View Report: ${reportUrl}
- Reply to contact customer
`

  const params = {
    Source: FROM_EMAIL,
    Destination: {
      ToAddresses: [adminEmail],
    },
    ReplyToAddresses: [customerEmail],
    Message: {
      Subject: {
        Data: `💰 New Purchase: $49.00 - ${providerName}`,
        Charset: 'UTF-8',
      },
      Body: {
        Text: {
          Data: textBody,
          Charset: 'UTF-8',
        },
        Html: {
          Data: htmlBody,
          Charset: 'UTF-8',
        },
      },
    },
  }

  try {
    const command = new SendEmailCommand(params)
    const result = await sesClient.send(command)
    console.log(`✅ Admin notification sent to ${adminEmail}`, result.MessageId)
    return result
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error)
    // Don't throw - admin notification failure shouldn't break the purchase flow
    return null
  }
}
