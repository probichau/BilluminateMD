/**
 * Support Ticket Routes
 * Handles customer support form submissions
 * - Generates incident numbers
 * - Sends email to support team
 * - Sends confirmation to customer
 */

import express from 'express'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

const router = express.Router()

// Configure AWS SES Client
const sesClient = new SESClient({
  region: process.env.SES_AWS_REGION || process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.SES_AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.SES_AWS_SECRET_ACCESS_KEY || process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// Generate incident number (format: INC-YYYYMMDD-XXX)
function generateIncidentNumber() {
  const now = new Date()
  const date = now.toISOString().split('T')[0].replace(/-/g, '')
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0')
  return `INC-${date}-${random}`
}

// POST /api/support/submit - Submit support ticket
router.post('/submit', async (req, res) => {
  try {
    const { name, email, subject, auditId, priority, description } = req.body

    // Validate required fields
    if (!name || !email || !subject || !description) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, subject, description',
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Generate incident number
    const incidentNumber = generateIncidentNumber()

    // Email to support team
    const supportEmailParams = {
      Source: process.env.SES_FROM_EMAIL || 'support@billuminate.com',
      Destination: {
        ToAddresses: [process.env.SUPPORT_EMAIL || 'support@billuminate.com'],
      },
      Message: {
        Subject: {
          Data: `[${incidentNumber}] ${subject}`,
        },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0D9488 0%, #059669 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #0D9488; }
    .value { margin-top: 5px; }
    .priority-high { color: #EF4444; font-weight: bold; }
    .priority-medium { color: #F59E0B; font-weight: bold; }
    .priority-low { color: #10B981; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎫 New Support Ticket</h2>
      <p style="margin: 0;">Incident Number: <strong>${incidentNumber}</strong></p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Customer Name:</div>
        <div class="value">${name}</div>
      </div>

      <div class="field">
        <div class="label">Email:</div>
        <div class="value"><a href="mailto:${email}">${email}</a></div>
      </div>

      <div class="field">
        <div class="label">Subject:</div>
        <div class="value">${subject}</div>
      </div>

      ${auditId ? `
      <div class="field">
        <div class="label">Audit ID:</div>
        <div class="value">${auditId}</div>
      </div>
      ` : ''}

      <div class="field">
        <div class="label">Priority:</div>
        <div class="value priority-${priority?.toLowerCase() || 'medium'}">${priority || 'Medium'}</div>
      </div>

      <div class="field">
        <div class="label">Description:</div>
        <div class="value" style="white-space: pre-wrap;">${description}</div>
      </div>

      <div class="field">
        <div class="label">Submitted:</div>
        <div class="value">${new Date().toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles',
          dateStyle: 'full',
          timeStyle: 'long'
        })}</div>
      </div>
    </div>
  </div>
</body>
</html>
            `,
          },
        },
      },
    }

    // Email confirmation to customer
    const customerEmailParams = {
      Source: process.env.SES_FROM_EMAIL || 'support@billuminate.com',
      Destination: {
        ToAddresses: [email],
      },
      Message: {
        Subject: {
          Data: `Ticket Received: ${incidentNumber}`,
        },
        Body: {
          Html: {
            Data: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0D9488 0%, #059669 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
    .incident-box { background: #F3F4F6; border-left: 4px solid #0D9488; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
    a { color: #0D9488; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">✅ Ticket Received</h1>
      <p style="margin: 10px 0 0 0;">BilluminateMD Support</p>
    </div>
    <div class="content">
      <p>Hi ${name},</p>

      <p>Thank you for contacting BilluminateMD support. We've received your request and our team will review it shortly.</p>

      <div class="incident-box">
        <strong>Your Incident Number:</strong><br>
        <span style="font-size: 24px; font-weight: bold; color: #0D9488;">${incidentNumber}</span>
      </div>

      <p><strong>What you submitted:</strong></p>
      <ul style="line-height: 1.8;">
        <li><strong>Subject:</strong> ${subject}</li>
        ${auditId ? `<li><strong>Audit ID:</strong> ${auditId}</li>` : ''}
        <li><strong>Priority:</strong> ${priority || 'Medium'}</li>
      </ul>

      <p><strong>What happens next?</strong></p>
      <ul style="line-height: 1.8;">
        <li>We'll review your request within 24 hours</li>
        <li>You'll receive a response at this email address</li>
        <li>Reference incident number <strong>${incidentNumber}</strong> in any follow-up communication</li>
      </ul>

      <p>If you have additional information to add, simply reply to this email.</p>

      <p>Best regards,<br>
      <strong>BilluminateMD Support Team</strong></p>
    </div>
    <div class="footer">
      <p>BilluminateMD | <a href="https://billuminate.com">billuminate.com</a><br>
      This is an automated confirmation. Please do not reply to this email directly.</p>
    </div>
  </div>
</body>
</html>
            `,
          },
        },
      },
    }

    // Send both emails
    try {
      await sesClient.send(new SendEmailCommand(supportEmailParams))
      await sesClient.send(new SendEmailCommand(customerEmailParams))

      res.json({
        success: true,
        incidentNumber,
        message: 'Support ticket submitted successfully',
      })
    } catch (emailError) {
      console.error('SES Error:', emailError)
      throw new Error(`Failed to send email: ${emailError.message}`)
    }
  } catch (error) {
    console.error('Support ticket error:', error)
    res.status(500).json({
      error: 'Failed to submit support ticket',
      details: error.message,
    })
  }
})

export default router
