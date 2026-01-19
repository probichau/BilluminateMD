/**
 * Appeal Letter Generation Service
 * Creates professionally crafted appeal letters for medical bill disputes
 * that are legally defensible and maximize chances of bill reduction
 */

import Anthropic from '@anthropic-ai/sdk'
import { lookupNPI } from './npiLookupService.js'

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
 * Get provider address, using NPI lookup if needed
 */
async function getProviderAddress(auditData) {
  // First try the address from the bill
  if (auditData.providerInfo?.address) {
    return auditData.providerInfo.address
  }

  // If no address but we have NPI, lookup via NPI registry
  const npi = auditData.charityAnalysis?.eligibilityCheck?.npiData?.npi || auditData.providerInfo?.npi
  if (npi) {
    console.log(`📍 No provider address on bill, looking up via NPI ${npi}`)
    const npiData = await lookupNPI(npi)
    if (npiData?.address) {
      const addr = npiData.address
      const addressParts = [
        addr.line1,
        addr.line2,
        `${addr.city}, ${addr.state} ${addr.zip}`
      ].filter(Boolean)

      if (addressParts.length > 0) {
        return addressParts.join('\n')
      }
    }
  }

  // Fallback: construct generic billing department address
  const facilityName = auditData.providerInfo?.facilityName || 'Hospital'
  return `${facilityName}\nPatient Financial Services\nBilling Department\n[Address to be confirmed]`
}

/**
 * Generate a professional appeal letter for medical billing disputes
 * @param {object} auditData - Complete audit data including errors, patient info, provider info
 * @param {object} verifiedPatientInfo - Patient-verified contact information
 * @returns {object} Generated letter with subject line and body
 */
export async function generateAppealLetter(auditData, verifiedPatientInfo) {
  console.log('📝 Starting appeal letter generation...')

  // Get provider address (from bill, NPI lookup, or default)
  const providerAddress = await getProviderAddress(auditData)

  // Prepare context for the AI
  const billingErrors = auditData.errors || []
  const charityEligible = auditData.charityAnalysis?.recommendation?.eligible || false
  const fplPercentage = auditData.charityAnalysis?.fplData?.fplPercentage || null
  const isNonProfit = auditData.charityAnalysis?.eligibilityCheck?.isNonProfit || false
  const totalSavings = auditData.savings?.total || 0

  const prompt = `You are a medical billing advocate helping a patient write a professional, legally defensible appeal letter to dispute medical charges. The letter should be firm but respectful, cite specific regulations where applicable, and maximize the likelihood of bill reduction.

PATIENT INFORMATION:
- Name: ${verifiedPatientInfo.fullName}
- Address: ${verifiedPatientInfo.address}
- Date of Birth: ${auditData.patientInfo?.dob || 'Not provided'}
- Account/Member ID: ${auditData.patientInfo?.memberId || 'Not provided'}
- Date of Service: ${auditData.serviceInfo?.dateOfService || 'Not provided'}

PROVIDER INFORMATION:
- Facility: ${auditData.providerInfo?.facilityName || 'Hospital'}
- Address: ${providerAddress}
- NPI: ${auditData.charityAnalysis?.eligibilityCheck?.npiData?.npi || auditData.providerInfo?.npi || 'Not provided'}
- Tax ID/EIN: ${auditData.charityAnalysis?.eligibilityCheck?.npiData?.ein || auditData.providerInfo?.taxId || 'Not provided'}

BILLING DETAILS (AFTER INSURANCE ADJUSTMENTS):
- Original Total Billed: $${auditData.financials?.totalBilled?.toLocaleString() || '0'}
- Insurance Payment: $${auditData.financials?.insurancePayment?.toLocaleString() || '0'}
- Insurance Discount/Adjustment: $${auditData.financials?.insuranceDiscount?.toLocaleString() || '0'}
- Current Patient Responsibility (Amount Being Disputed): $${auditData.financials?.patientResponsibility?.toLocaleString() || '0'}

IDENTIFIED BILLING ERRORS (${billingErrors.length} issues found):
${billingErrors.map((error, idx) => `
${idx + 1}. ${error.errorType}
   - CPT Code: ${error.cptCode || 'N/A'}
   - Description: ${error.description}
   - Issue: ${error.explanation}
   - Financial Impact: $${error.potentialSavings?.toFixed(2) || '0.00'}
   - Recommendation: ${error.recommendation}
`).join('\n')}

CHARITY CARE ELIGIBILITY:
- Hospital Non-Profit Status: ${isNonProfit ? 'Yes' : 'No'}
- Federal Poverty Level: ${fplPercentage ? `${fplPercentage}% of FPL` : 'Not calculated'}
- Charity Care Eligible: ${charityEligible ? 'Yes' : 'No'}
${charityEligible ? `- Household Income: $${auditData.patientInfo?.householdIncome?.toLocaleString()}
- Household Size: ${auditData.patientInfo?.householdSize}` : ''}

TOTAL POTENTIAL SAVINGS: $${totalSavings.toLocaleString()}

CRITICAL INSTRUCTIONS FOR LETTER STRUCTURE:

1. OPENING PARAGRAPH:
   - State the current patient responsibility amount being disputed: $${auditData.financials?.patientResponsibility?.toLocaleString() || '0'}
   - Clearly state this is the amount AFTER insurance adjustments
   - Express intent to work with the hospital to resolve billing issues

2. BILLING ERRORS SECTION:
   - List each specific billing error with CPT codes, dates, and dollar amounts
   - Reference relevant regulations:
     * For duplicate charges: Cite Medicare billing rules and anti-fraud provisions
     * For upcoding/unbundling: Reference CMS National Correct Coding Initiative (NCCI)
     * For non-covered services: Cite insurance policy language
   - Calculate the total reduction requested from billing error corrections

3. RATE REASONABLENESS SECTION (if applicable):
   - DO NOT reference "Medicare rates" unless specifically relevant
   - Instead, request that charges be reduced to "reasonable and customary rates" for the geographic area
   - Note that the current charges appear unconscionably high compared to regional standards
   - Request adjustment to rates that reflect fair market value for similar services
   - Use language like "commercially reasonable rates" or "prevailing community rates"

4. CHARITY CARE SECTION (CRITICAL - Include if fplPercentage is provided):
${fplPercentage ? `
   - Start a dedicated section titled "REQUEST FOR FINANCIAL ASSISTANCE"
   - State household income: $${auditData.patientInfo?.householdIncome?.toLocaleString()}
   - State household size: ${auditData.patientInfo?.householdSize} ${auditData.patientInfo?.householdSize === 1 ? 'person' : 'people'}
   - State FPL percentage: ${fplPercentage}% of Federal Poverty Level
   ${isNonProfit ? `- Reference IRS Section 501(r) requirement that non-profit hospitals MUST provide charity care
   - Note that under 501(r), hospitals must have written financial assistance policies` : ''}
   ${fplPercentage <= 200 ? `- Request 100% charity care discount (full write-off) as patient is at ${fplPercentage}% FPL
   - Emphasize that patients under 200% FPL typically qualify for full charity care` : ''}
   ${fplPercentage > 200 && fplPercentage <= 400 ? `- Request charity care on a sliding scale as patient is at ${fplPercentage}% FPL
   - Note that patients between 200-400% FPL typically qualify for substantial discounts (50-100%)
   - Request the hospital's financial assistance policy and application` : ''}
   ${fplPercentage > 400 ? `- While above standard charity care thresholds, request consideration for financial hardship assistance
   - Request information about payment plans or reduced rates for financial hardship` : ''}
   - Request retroactive application of financial assistance to this account
   - Request a charity care application form and detailed financial assistance policy
` : '- DO NOT include a charity care section as financial information was not provided'}

5. CLOSING REQUESTS:
   - Request corrected itemized bill showing all adjustments
   - Request written response within 30 days
   - Provide contact information: ${verifiedPatientInfo.phone || 'Phone on file'}, ${verifiedPatientInfo.email || 'Email on file'}
   - Express willingness to provide additional documentation if needed

6. TONE AND STYLE:
   - Professional and respectful throughout
   - Firm but not threatening or litigious
   - Show that patient is informed about billing practices and their rights
   - Focus on partnership and resolution, not confrontation
   - DO NOT use placeholder text like [Date] or [Your Name] - use actual data provided
   - Use today's date: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
   - DO NOT include a signature block - patient will sign it themselves

7. AMOUNTS TO REFERENCE:
   - Focus on the PATIENT RESPONSIBILITY amount ($${auditData.financials?.patientResponsibility?.toLocaleString() || '0'}), NOT the original total billed
   - This is the actual amount the patient owes after insurance adjustments
   - Billing error corrections should reduce THIS amount
   - Charity care should be applied to THIS amount

Return the letter in plain text format. Start with the patient's address block, then the provider address, then date, then the letter body.`

  try {
    const client = getAnthropicClient()
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      temperature: 0.3, // Lower temperature for more consistent, professional output
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const letterContent = response.content[0].text

    console.log('✅ Appeal letter generated successfully')

    return {
      letter: letterContent,
      summary: {
        errorsCount: billingErrors.length,
        charityEligible,
        totalSavings,
        generatedDate: new Date().toISOString(),
      },
    }
  } catch (error) {
    console.error('❌ Error generating appeal letter:', error.message)
    throw new Error('Failed to generate appeal letter')
  }
}

/**
 * Generate a subject line for the appeal
 */
export function generateSubjectLine(auditData) {
  const patientName = auditData.patientInfo?.name || 'Patient'
  const accountId = auditData.patientInfo?.memberId || 'N/A'
  const dos = auditData.serviceInfo?.dateOfService || 'N/A'

  return `Billing Dispute - ${patientName} - Account ${accountId} - DOS ${dos}`
}
