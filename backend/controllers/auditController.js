import { v4 as uuidv4 } from 'uuid'
import { analyzeBillWithAI } from '../services/aiService.js'
import { detectErrors } from '../services/errorDetectionService.js'
import { storeAuditResult, getAuditById, markAuditAsPaid } from '../services/databaseService.js'
import { uploadFile } from '../services/storageService.js'

export async function uploadBill(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' })
    }

    const auditId = uuidv4()
    const file = req.file

    console.log(`Processing bill upload - Audit ID: ${auditId}`)

    // Step 1: Upload file to storage
    const fileUrl = await uploadFile(file, auditId)
    console.log(`File uploaded to storage: ${fileUrl}`)

    // Step 2: Analyze bill with AI (extract data)
    const extractedData = await analyzeBillWithAI(file)
    console.log(`AI extraction complete`)

    // Step 3: Run error detection logic
    const errors = await detectErrors(extractedData)
    console.log(`Error detection complete - Found ${errors.length} issues`)

    // Step 4: Store audit result in database
    const auditResult = {
      auditId,
      fileUrl,
      providerInfo: extractedData.providerInfo,
      patientInfo: extractedData.patientInfo,
      serviceInfo: extractedData.serviceInfo,
      financials: extractedData.financials,
      lineItems: extractedData.lineItems,
      errors,
      isPaid: false,
      createdAt: new Date().toISOString(),
    }

    await storeAuditResult(auditResult)
    console.log(`Audit result stored in database`)

    res.json({
      auditId,
      message: 'Bill processed successfully',
    })
  } catch (error) {
    console.error('Error processing bill:', error)
    res.status(500).json({
      error: 'Failed to process bill',
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
