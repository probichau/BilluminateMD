import Anthropic from '@anthropic-ai/sdk'

let anthropic = null

/**
 * Get or create Anthropic client instance
 * Lazy initialization ensures environment variables are loaded first
 */
function getAnthropicClient() {
  if (!anthropic) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    })
  }
  return anthropic
}

/**
 * Validates and fixes financial data extracted by AI
 * Ensures patient responsibility is calculated correctly
 */
function validateAndFixFinancials(extractedData) {
  const financials = extractedData.financials || {}

  console.log('🔍 Validating extracted financials:', {
    totalBilled: financials.totalBilled,
    insurancePayment: financials.insurancePayment,
    insuranceDiscount: financials.insuranceDiscount,
    copay: financials.copay,
    deductible: financials.deductible,
    patientResponsibility: financials.patientResponsibility
  })

  // Convert null to 0 for calculations
  const totalBilled = financials.totalBilled || 0
  const insurancePayment = financials.insurancePayment || 0
  const insuranceDiscount = financials.insuranceDiscount || 0
  const copay = financials.copay || 0
  const deductible = financials.deductible || 0
  let patientResponsibility = financials.patientResponsibility

  // Calculate expected patient responsibility
  // Formula: Total Billed - Insurance Payment - Insurance Discount
  const calculatedPatientResponsibility = totalBilled - insurancePayment - insuranceDiscount

  console.log(`💰 Calculated patient responsibility: $${calculatedPatientResponsibility.toFixed(2)}`)

  // If AI returned 0 or null, but calculated amount is > 0, use calculated
  if ((patientResponsibility === 0 || patientResponsibility === null) && calculatedPatientResponsibility > 0) {
    console.log(`⚠️  AI extracted patientResponsibility as ${patientResponsibility}, but calculated value is $${calculatedPatientResponsibility.toFixed(2)}`)
    console.log(`✅ Using calculated value instead`)
    financials.patientResponsibility = Math.round(calculatedPatientResponsibility * 100) / 100
  }

  // Warn if numbers don't add up
  if (patientResponsibility !== null && Math.abs(patientResponsibility - calculatedPatientResponsibility) > 0.50) {
    console.log(`⚠️  WARNING: Extracted patientResponsibility ($${patientResponsibility}) differs from calculated ($${calculatedPatientResponsibility.toFixed(2)})`)
    console.log(`✅ Using calculated value for accuracy`)
    financials.patientResponsibility = Math.round(calculatedPatientResponsibility * 100) / 100
  }

  console.log(`✅ Final patient responsibility: $${financials.patientResponsibility}`)
}

/**
 * Analyzes a medical bill using Claude Vision API
 * Extracts all relevant data from the bill image/PDF
 */
export async function analyzeBillWithAI(file) {
  try {
    // Convert file buffer to base64
    const base64Data = file.buffer.toString('base64')

    // Determine media type and content type
    let mediaType = 'image/jpeg'
    let contentType = 'image'

    if (file.mimetype === 'image/png') {
      mediaType = 'image/png'
      contentType = 'image'
    } else if (file.mimetype === 'image/gif') {
      mediaType = 'image/gif'
      contentType = 'image'
    } else if (file.mimetype === 'image/webp') {
      mediaType = 'image/webp'
      contentType = 'image'
    } else if (file.mimetype === 'application/pdf') {
      mediaType = 'application/pdf'
      contentType = 'document'
    } else if (file.mimetype === 'image/heic' || file.mimetype === 'image/heif') {
      // HEIC/HEIF not supported by Claude - needs conversion or reject
      throw new Error('HEIC/HEIF images are not supported. Please convert to JPEG or PNG first.')
    }

    const prompt = `You are a medical billing expert analyzing a medical bill. Extract ALL the following information from this bill image with high accuracy:

PROVIDER INFORMATION:
- Facility Name
- Provider Name (individual doctor/practitioner if visible)
- NPI (National Provider Identifier) if visible
- Tax ID / EIN (Employer Identification Number) if visible
- Provider Address
- Phone Number
- Any mention of "non-profit", "501(c)(3)", "charity care policy", "financial assistance", "public entity", "government hospital", or "tax-exempt" on the bill

PATIENT DEMOGRAPHICS:
- Full Name
- Date of Birth (DOB)
- Patient Address (if visible)
- Member ID / Policy Number
- Insurance Company Name

SERVICE DETAILS:
- Date of Service (DOS)
- Admission Date (if applicable)
- Discharge Date (if applicable)
- Type of Service (e.g., Emergency, Outpatient, etc.)

LINE ITEMS (for EACH service listed):
- CPT Code or HCPCS Code
- Revenue Code (if visible)
- Description of Service
- Quantity
- Billed Amount (charge)
- Date of Service for this specific line item

FINANCIAL SUMMARY (CRITICAL - Extract these values accurately):
- Total Billed Amount (Total Charges)
- Insurance Payment/Adjustment (amount insurance paid)
- Insurance Discount/Negotiated Rate (contractual adjustment, discount, or write-off)
- Co-pay (patient copayment)
- Deductible (patient deductible)
- Patient Responsibility (VERY IMPORTANT: The final amount the patient owes. Look for labels like "Patient Balance", "Amount Due", "Patient Responsibility", "Balance Due", or "You Owe". This is typically: Total Billed - Insurance Payment - Insurance Discount - Copay - Deductible)

Return the data in this EXACT JSON structure (use null for missing values):

{
  "providerInfo": {
    "facilityName": "string",
    "providerName": "string",
    "npi": "string",
    "taxId": "string",
    "address": "string",
    "phone": "string",
    "charityCareMentioned": boolean,
    "nonprofitMentioned": boolean
  },
  "patientInfo": {
    "name": "string",
    "dob": "YYYY-MM-DD",
    "address": "string",
    "memberId": "string",
    "insuranceCompany": "string"
  },
  "serviceInfo": {
    "dateOfService": "YYYY-MM-DD",
    "admissionDate": "YYYY-MM-DD",
    "dischargeDate": "YYYY-MM-DD",
    "serviceType": "string"
  },
  "lineItems": [
    {
      "cptCode": "string",
      "revenueCode": "string",
      "description": "string",
      "quantity": number,
      "billedAmount": number,
      "dateOfService": "YYYY-MM-DD"
    }
  ],
  "financials": {
    "totalBilled": number,
    "insurancePayment": number,
    "insuranceDiscount": number,
    "copay": number,
    "deductible": number,
    "patientResponsibility": number
  }
}

CRITICAL INSTRUCTIONS:
- Return ONLY valid JSON, no additional text
- Use exact field names as shown
- Convert all dollar amounts to numbers (remove $ and commas)
- Use YYYY-MM-DD format for dates
- If a line item has the same CPT code appearing multiple times on the same date, include each instance separately
- PAY SPECIAL ATTENTION to extracting the patientResponsibility field accurately - this is the most important financial value
- DO NOT return 0 for patientResponsibility unless the bill explicitly shows $0.00 owed by the patient
- Look carefully at the bottom of the bill for "Amount Due", "Patient Balance", or similar labels
- If you cannot find a specific value, use null rather than guessing or using 0`

    // Build content array based on file type
    const contentArray = []

    // Add document or image based on content type
    if (contentType === 'document') {
      contentArray.push({
        type: 'document',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      })
    } else {
      contentArray.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: mediaType,
          data: base64Data,
        },
      })
    }

    // Add text prompt
    contentArray.push({
      type: 'text',
      text: prompt,
    })

    // Call Claude Vision API with Sonnet 4 (best for document analysis)
    const client = getAnthropicClient()
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: contentArray,
        },
      ],
    })

    // Parse the response
    const responseText = message.content[0].text

    // Extract JSON from response (in case Claude adds any extra text)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to extract JSON from AI response')
    }

    const extractedData = JSON.parse(jsonMatch[0])

    // Validate that we got the expected structure
    if (!extractedData.providerInfo || !extractedData.patientInfo || !extractedData.lineItems) {
      throw new Error('AI response missing required fields')
    }

    console.log(`AI extracted ${extractedData.lineItems.length} line items from bill`)

    // Validate and fix financial data
    validateAndFixFinancials(extractedData)

    return extractedData
  } catch (error) {
    console.error('Error in AI analysis:', error)
    throw new Error(`AI analysis failed: ${error.message}`)
  }
}

/**
 * Helper function to get typical Medicare allowable rate for a CPT code
 * This is a simplified version - in production, you'd query a real fee schedule database
 */
export function getMedicareAllowableRate(cptCode) {
  // Simplified mapping - in production, use actual Medicare fee schedules
  const commonRates = {
    '99213': 93.00,  // Office visit, level 3
    '99214': 131.00, // Office visit, level 4
    '99215': 183.00, // Office visit, level 5
    '99283': 160.00, // Emergency dept visit, level 3
    '99284': 277.00, // Emergency dept visit, level 4
    '99285': 408.00, // Emergency dept visit, level 5
    '80053': 25.00,  // Comprehensive metabolic panel
    '85025': 10.00,  // Complete blood count
    '71045': 35.00,  // Chest X-ray, single view
    '71046': 45.00,  // Chest X-ray, 2 views
    '70450': 180.00, // CT head without contrast
    '70553': 450.00, // MRI brain with contrast
  }

  return commonRates[cptCode] || null
}
