import { v4 as uuidv4 } from 'uuid'
import { analyzeBillWithAI } from '../services/aiService.js'
import { detectErrors } from '../services/errorDetectionService.js'
import { analyzeCharityCare } from '../services/charityCareService.js'
import { storeAuditResult, getAuditById, markAuditAsPaid, storeIntermediateAudit, getIntermediateAudit, deleteIntermediateAudit } from '../services/databaseService.js'
import { uploadFile } from '../services/storageService.js'
import { generateAppealLetter } from '../services/appealLetterService.js'
import { hasActiveSubscription } from '../services/subscriptionService.js'
import { doesBillMatchUser } from '../services/nameMatchingService.js'

// Note: Intermediate audits now stored in database (intermediate_audits table)

export async function uploadBill(req, res) {
  let auditId
  try {
    console.log('📤 Upload request received')

    if (!req.file) {
      console.log('❌ No file in request')
      return res.status(400).json({ error: 'No file uploaded' })
    }

    auditId = uuidv4()
    const file = req.file

    console.log(`📋 Processing bill upload - Audit ID: ${auditId}`)
    console.log(`📄 File: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`)

    // Step 1: Upload file to storage
    console.log('⏳ Step 1/4: Starting file upload to storage...')
    let fileUrl
    try {
      fileUrl = await uploadFile(file, auditId)
      console.log(`✅ Step 1/4: File uploaded to storage: ${fileUrl}`)
    } catch (storageError) {
      console.error('❌ Step 1/4 FAILED: Storage upload error:', storageError.message)
      throw new Error(`Storage upload failed: ${storageError.message}`)
    }

    // Step 2: Analyze bill with AI (extract data)
    console.log('⏳ Step 2/4: Starting AI analysis...')
    let extractedData
    try {
      extractedData = await analyzeBillWithAI(file)
      console.log(`✅ Step 2/4: AI extraction complete`)
    } catch (aiError) {
      console.error('❌ Step 2/4 FAILED: AI analysis error:', aiError.message)
      throw new Error(`AI analysis failed: ${aiError.message}`)
    }

    // Step 3: Run error detection logic
    console.log('⏳ Step 3/4: Running error detection...')
    let errors
    try {
      errors = await detectErrors(extractedData)
      console.log(`✅ Step 3/4: Error detection complete - Found ${errors.length} issues`)
    } catch (detectionError) {
      console.error('❌ Step 3/4 FAILED: Error detection failed:', detectionError.message)
      throw new Error(`Error detection failed: ${detectionError.message}`)
    }

    // Step 4: Store intermediate results (waiting for financial info)
    console.log('⏳ Step 4/4: Storing intermediate results...')
    const intermediateData = {
      auditId,
      fileUrl,
      extractedData,
      errors,
      createdAt: new Date().toISOString(),
    }

    // Store intermediate data in database
    await storeIntermediateAudit(auditId, intermediateData)
    console.log(`✅ Step 4/4: Intermediate data stored in database, awaiting financial information`)

    console.log(`🎉 SUCCESS: Bill analysis complete for audit ${auditId}`)
    console.log(`⏭️  Next step: Collect household income and family size`)

    res.json({
      auditId,
      message: 'Bill analyzed successfully',
      requiresFinancialInfo: true,
      providerName: extractedData.providerInfo?.facilityName,
      patientResponsibility: extractedData.financials?.patientResponsibility,
    })
  } catch (error) {
    console.error('💥 FATAL ERROR processing bill:', error.message)
    console.error('Full error stack:', error.stack)

    res.status(500).json({
      error: 'Failed to process bill',
      details: error.message,
      auditId: auditId || 'unknown',
    })
  }
}

/**
 * Submit financial information and complete the audit analysis
 * This endpoint receives household income and family size, then:
 * 1. Retrieves intermediate audit data
 * 2. Calculates charity care eligibility
 * 3. Combines billing errors + charity savings
 * 4. Stores final audit result in database
 */
export async function submitFinancialInfo(req, res) {
  try {
    const { auditId } = req.params
    const { householdIncome, householdSize } = req.body

    console.log(`💰 Financial info received for audit ${auditId}`)
    console.log(`   Household Income: $${householdIncome}, Size: ${householdSize}`)

    // Validate input
    if (!householdIncome || !householdSize) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Both householdIncome and householdSize are required'
      })
    }

    if (householdIncome < 0 || householdSize < 1) {
      return res.status(400).json({
        error: 'Invalid input',
        details: 'Income must be non-negative and household size must be at least 1'
      })
    }

    // Retrieve intermediate data from database
    const intermediateData = await getIntermediateAudit(auditId)
    if (!intermediateData) {
      return res.status(404).json({
        error: 'Audit not found',
        details: 'This audit may have expired or does not exist. Please upload your bill again.'
      })
    }

    console.log('✅ Retrieved intermediate audit data from database')

    // Check if user has active subscription and if bill matches their name
    let autoUnlocked = false
    if (req.user) {
      const hasSubscription = await hasActiveSubscription(req.user.id)

      if (hasSubscription) {
        const billPatientName = intermediateData.extractedData.patientInfo?.name || ''
        const registeredUserName = req.user.fullName

        const nameMatches = doesBillMatchUser(billPatientName, registeredUserName)

        if (nameMatches) {
          console.log(`✅ Subscription user: ${req.user.email} - Bill auto-unlocked`)
          autoUnlocked = true
        } else {
          console.log(`⚠️  Subscription user: ${req.user.email} - Name mismatch`)
          console.log(`   Bill name: "${billPatientName}" vs User name: "${registeredUserName}"`)
          return res.status(403).json({
            error: 'Name verification failed',
            details: 'This bill does not appear to be for the registered user. Subscription benefits only apply to bills for the account holder.',
            billPatientName,
            registeredUserName,
          })
        }
      }
    }

    // Analyze charity care eligibility
    console.log('🏥 Analyzing charity care eligibility...')
    const charityAnalysis = await analyzeCharityCare(
      intermediateData.extractedData,
      householdIncome,
      householdSize
    )
    console.log(`✅ Charity analysis complete - FPL: ${charityAnalysis.fplData.fplPercentage}%`)

    // Calculate total potential savings
    const billingErrorSavings = intermediateData.errors.reduce(
      (sum, error) => sum + (error.potentialSavings || 0),
      0
    )

    const charitySavings = charityAnalysis.charitySavings?.discountAmount || 0
    const totalPotentialSavings = billingErrorSavings + charitySavings

    console.log(`💵 Billing Error Savings: $${billingErrorSavings.toFixed(2)}`)
    console.log(`💵 Charity Care Savings: $${charitySavings.toFixed(2)}`)
    console.log(`💵 Total Potential Savings: $${totalPotentialSavings.toFixed(2)}`)

    // Create final audit result
    const auditResult = {
      auditId,
      fileUrl: intermediateData.fileUrl,
      providerInfo: intermediateData.extractedData.providerInfo,
      patientInfo: {
        ...intermediateData.extractedData.patientInfo,
        householdIncome,
        householdSize
      },
      serviceInfo: intermediateData.extractedData.serviceInfo,
      financials: intermediateData.extractedData.financials,
      lineItems: intermediateData.extractedData.lineItems,
      errors: intermediateData.errors,
      charityAnalysis,
      savings: {
        billingErrors: Math.round(billingErrorSavings * 100) / 100,
        charityCare: Math.round(charitySavings * 100) / 100,
        total: Math.round(totalPotentialSavings * 100) / 100
      },
      isPaid: autoUnlocked, // Auto-unlock for subscription users with matching names
      paymentType: autoUnlocked ? 'subscription' : null,
      userId: req.user?.id || null,
      createdAt: intermediateData.createdAt,
    }

    // Store in database
    console.log('💾 Storing final audit result in database...')
    await storeAuditResult(auditResult)
    console.log('✅ Audit result stored successfully')

    // Clean up intermediate data from database
    await deleteIntermediateAudit(auditId)

    console.log(`🎉 SUCCESS: Complete audit analysis for ${auditId}`)

    res.json({
      auditId,
      message: 'Analysis complete',
      savings: auditResult.savings,
      charityEligible: charityAnalysis.recommendation.eligible,
    })
  } catch (error) {
    console.error('💥 ERROR submitting financial info:', error.message)
    console.error('Full error stack:', error.stack)

    res.status(500).json({
      error: 'Failed to complete analysis',
      details: error.message,
    })
  }
}

export async function getAuditResults(req, res) {
  try {
    const { auditId } = req.params

    const audit = await getAuditById(auditId)

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' })
    }

    // Return all data - frontend will handle blurring if not paid
    res.json(audit)
  } catch (error) {
    console.error('Error fetching audit results:', error)
    res.status(500).json({
      error: 'Failed to fetch audit results',
      details: error.message,
    })
  }
}

export async function unlockReport(req, res) {
  try {
    const { auditId } = req.params
    const { paymentIntentId } = req.body

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment intent ID required' })
    }

    await markAuditAsPaid(auditId, paymentIntentId)

    res.json({
      success: true,
      message: 'Report unlocked successfully',
    })
  } catch (error) {
    console.error('Error unlocking report:', error)
    res.status(500).json({
      error: 'Failed to unlock report',
      details: error.message,
    })
  }
}

export async function generateLetter(req, res) {
  try {
    const { auditId } = req.params
    const { verifiedPatientInfo } = req.body

    console.log(`📝 Appeal letter generation requested for audit ${auditId}`)

    // Validate required fields
    if (!verifiedPatientInfo || !verifiedPatientInfo.fullName || !verifiedPatientInfo.address) {
      return res.status(400).json({
        error: 'Patient information required',
        details: 'Full name and address must be provided',
      })
    }

    // Get audit data
    const audit = await getAuditById(auditId)

    if (!audit) {
      return res.status(404).json({ error: 'Audit not found' })
    }

    // Ensure audit is paid
    if (!audit.isPaid) {
      return res.status(403).json({ error: 'Report must be unlocked to generate appeal letter' })
    }

    // Generate the letter
    const result = await generateAppealLetter(audit, verifiedPatientInfo)

    console.log('✅ Appeal letter generated successfully')

    res.json({
      success: true,
      letter: result.letter,
      summary: result.summary,
    })
  } catch (error) {
    console.error('❌ Error generating appeal letter:', error.message)
    console.error('Full error stack:', error.stack)

    res.status(500).json({
      error: 'Failed to generate appeal letter',
      details: error.message,
    })
  }
}
