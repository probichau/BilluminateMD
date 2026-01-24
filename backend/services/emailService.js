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
