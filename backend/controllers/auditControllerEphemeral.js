/**
 * Ephemeral Audit Controller (HIPAA-Compliant)
 *
 * NO PHI is stored server-side.
 * All PHI is:
 * - Processed in memory during API call
 * - Returned to client immediately
 * - Garbage collected after response
 * - Stored in client browser sessionStorage only
 */

import { analyzeBillWithAI } from '../services/aiService.js'
import { detectErrors } from '../services/errorDetectionService.js'
import { analyzeCharityCare, checkCharityEligibility } from '../services/charityCareService.js'
import { generateAppealLetter } from '../services/appealLetterService.js'
import { createSession, getSession, isSessionPaid } from '../services/sessionService.js'

/**
 * POST /api/audit/analyze
 *
 * Analyzes uploaded medical bill ephemerally (in-memory only).
 * Returns complete analysis to client for storage in sessionStorage.
 *
 * NO database storage, NO file storage.
 */
export async function analyzeBillEphemeral(req, res) {
  try {
    console.log('📋 Starting ephemeral bill analysis...')

    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        details: 'Please upload a medical bill (PDF, JPEG, or PNG)',
      })
    }

    const file = req.file

    console.log(`📄 Received file: ${file.originalname} (${file.size} bytes)`)

    // Create anonymous session
    const sessionId = createSession()

    // Step 1: Analyze bill with AI (file held in memory, never saved)
    console.log('🤖 Analyzing bill with Claude AI...')
    const extractedData = await analyzeBillWithAI(file)

    // File buffer is now garbage collected

    console.log('✅ Bill analysis complete')
    console.log(`   Provider: ${extractedData.provider_info?.facilityName || 'Unknown'}`)
    console.log(`   Patient: ${extractedData.patient_info?.name || 'Unknown'}`)
    console.log(`   Total billed: $${extractedData.financials?.totalBilled || 0}`)

    // Step 2: Detect billing errors
    console.log('🔍 Detecting billing errors...')
    const errors = detectErrors(extractedData)

    console.log(`✅ Found ${errors.length} potential billing error(s)`)

    // Calculate error savings
    const errorSavings = errors.reduce(
      (sum, error) => sum + (error.potentialSavings || 0),
      0
    )

    // Step 3: Check charity care eligibility (without income - preliminary)
    console.log('🏥 Checking charity care eligibility...')
    const preliminaryCharityCheck = await checkCharityEligibility(
      extractedData.provider_info
    )

    console.log('✅ Charity eligibility check complete')

    // Combine all data
    const analyzedData = {
      provider_info: extractedData.provider_info,
      patient_info: extractedData.patient_info,
      service_info: extractedData.service_info,
      financials: extractedData.financials,
      line_items: extractedData.line_items,
      errors,
      errorSavings,
      charityEligibilityPreliminary: preliminaryCharityCheck,
    }

    // Create summary (visible without payment)
    const summary = {
      providerName: extractedData.provider_info?.facilityName || 'Unknown Provider',
      patientName: extractedData.patient_info?.name || 'Unknown Patient',
      dateOfService: extractedData.service_info?.dateOfService || null,
      totalBilled: extractedData.financials?.totalBilled || 0,
      patientResponsibility: extractedData.financials?.patientResponsibility || 0,
      errorsFound: errors.length,
      potentialSavings: errorSavings,
      nonprofitStatus: preliminaryCharityCheck.isNonprofit ? 'Verified' : 'Unknown',
    }

    // Return everything to client (client will store in sessionStorage)
    console.log(`✅ Ephemeral analysis complete for session: ${sessionId}`)
    console.log('   Data returned to client (NO server storage)')

    res.json({
      sessionId,
      summary,
      analyzedData,
      message:
        'Analysis complete. Data stored in your browser only and will be deleted when you close it.',
    })

    // All data is now garbage collected on the server
  } catch (error) {
    console.error('❌ Ephemeral bill analysis error:', error)
    res.status(500).json({
      error: 'Failed to analyze bill',
      details: error.message,
    })
  }
}

/**
 * POST /api/audit/charity-analysis
 *
 * Calculates charity care eligibility with household income.
 * Client sends full provider info + income (NO retrieval from database).
 */
export async function calculateCharityEligibility(req, res) {
  try {
    const { sessionId, providerInfo, householdIncome, householdSize } = req.body

    console.log(`🏥 Calculating charity eligibility for session: ${sessionId}`)

    // Validate session exists (no PHI in session, just payment status)
    const session = getSession(sessionId)
    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired',
        details:
          'Your session has expired. Please upload your bill again to start a new analysis.',
      })
    }

    // Validate input
    if (!providerInfo || !householdIncome || !householdSize) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'providerInfo, householdIncome, and householdSize are required',
      })
    }

    // Calculate charity care eligibility
    const charityAnalysis = await analyzeCharityCare(
      { provider_info: providerInfo },
      householdIncome,
      householdSize
    )

    console.log('✅ Charity analysis complete')
    console.log(`   FPL: ${charityAnalysis.fplPercentage}%`)
    console.log(`   Eligible: ${charityAnalysis.eligible}`)

    // Return to client (NO storage)
    res.json({
      charityAnalysis,
      message: 'Charity care analysis complete. Update your browser storage with this data.',
    })

    // Data garbage collected
  } catch (error) {
    console.error('❌ Charity analysis error:', error)
    res.status(500).json({
      error: 'Failed to calculate charity eligibility',
      details: error.message,
    })
  }
}

/**
 * POST /api/audit/generate-letter
 *
 * Generates appeal letter from data sent by client.
 * Client sends full analyzed data + verified patient info.
 */
export async function generateAppealLetterEphemeral(req, res) {
  try {
    const { sessionId, analyzedData, verifiedPatientInfo } = req.body

    console.log(`📝 Generating appeal letter for session: ${sessionId}`)

    // Validate session and payment
    const session = getSession(sessionId)
    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired',
      })
    }

    if (!session.paid) {
      return res.status(403).json({
        error: 'Payment required',
        details: 'Please complete payment before generating the appeal letter.',
      })
    }

    // Validate input
    if (!analyzedData || !verifiedPatientInfo) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'analyzedData and verifiedPatientInfo are required',
      })
    }

    // Generate appeal letter
    console.log('🤖 Generating appeal letter with Claude AI...')
    const { letter, summary } = await generateAppealLetter(analyzedData, verifiedPatientInfo)

    console.log('✅ Appeal letter generated')
    console.log(`   Length: ${letter.length} characters`)

    // Return letter to client (client will convert to PDF and download)
    res.json({
      letterText: letter,
      summary,
      message: 'Appeal letter generated. Download it to your device.',
    })

    // Letter is garbage collected
  } catch (error) {
    console.error('❌ Appeal letter generation error:', error)
    res.status(500).json({
      error: 'Failed to generate appeal letter',
      details: error.message,
    })
  }
}

/**
 * POST /api/audit/verify-payment
 *
 * Verifies payment status for a session.
 * Returns whether the session is paid (for unlocking detailed report).
 */
export async function verifyPayment(req, res) {
  try {
    const { sessionId } = req.body

    if (!sessionId) {
      return res.status(400).json({
        error: 'Missing sessionId',
      })
    }

    const session = getSession(sessionId)

    if (!session) {
      return res.status(404).json({
        error: 'Session not found or expired',
        paid: false,
      })
    }

    res.json({
      paid: session.paid,
      paymentIntentId: session.paymentIntentId,
    })
  } catch (error) {
    console.error('❌ Payment verification error:', error)
    res.status(500).json({
      error: 'Failed to verify payment',
      details: error.message,
    })
  }
}
