import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

/**
 * Analyzes a medical bill using Claude Vision API
 * Extracts all relevant data from the bill image/PDF
 */
export async function analyzeBillWithAI(file) {
  try {
    // Convert file buffer to base64
    const base64Image = file.buffer.toString('base64')

    // Determine media type
    let mediaType = 'image/jpeg'
    if (file.mimetype === 'image/png') {
      mediaType = 'image/png'
    } else if (file.mimetype === 'application/pdf') {
      mediaType = 'application/pdf'
    }

    const prompt = `You are a medical billing expert analyzing a medical bill. Extract ALL the following information from this bill image with high accuracy:

PROVIDER INFORMATION:
- Facility Name
- Provider Name (individual doctor/practitioner if visible)
- NPI (National Provider Identifier) if visible
- Provider Address
- Phone Number

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

FINANCIAL SUMMARY:
- Total Billed Amount
- Insurance Payment/Adjustment
- Insurance Discount/Negotiated Rate
- Co-pay
- Deductible
- Patient Responsibility (amount patient owes)

Return the data in this EXACT JSON structure (use null for missing values):

{
  "providerInfo": {
    "facilityName": "string",
    "providerName": "string",
    "npi": "string",
    "address": "string",
    "phone": "string"
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

IMPORTANT:
- Return ONLY valid JSON, no additional text
- Use exact field names as shown
- Convert all dollar amounts to numbers (remove $ and commas)
- Use YYYY-MM-DD format for dates
- If a line item has the same CPT code appearing multiple times on the same date, include each instance separately`

    // Call Claude Vision API
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
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
