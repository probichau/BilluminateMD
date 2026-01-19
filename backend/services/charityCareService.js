/**
 * Charity Care and Financial Assistance Service
 * Calculates eligibility for hospital charity care programs based on Federal Poverty Level (FPL)
 */

import { checkCharityEligibility } from './npiLookupService.js'

/**
 * 2026 Federal Poverty Level Guidelines (Continental US)
 * Source: HHS updates annually
 */
const FPL_2026 = {
  1: 15730,  // 1 person household
  2: 21200,
  3: 26670,
  4: 32140,
  5: 37610,
  6: 43080,
  7: 48550,
  8: 54020,
}

/**
 * Calculate Federal Poverty Level percentage for a household
 */
export function calculateFPLPercentage(householdIncome, householdSize) {
  // Get base FPL for household size
  let baseFPL = FPL_2026[householdSize]

  // For households larger than 8, add $5,470 per additional person
  if (householdSize > 8) {
    baseFPL = FPL_2026[8] + ((householdSize - 8) * 5470)
  }

  // Calculate percentage of FPL
  const fplPercentage = (householdIncome / baseFPL) * 100

  return {
    fplPercentage: Math.round(fplPercentage),
    baseFPL,
    householdIncome,
    householdSize
  }
}

/**
 * Determine charity care discount based on FPL percentage
 * Standard non-profit hospital charity care policy:
 * - 0-100% FPL: 100% discount
 * - 101-200% FPL: Sliding scale (decreasing from 100% to 20%)
 * - 201-400% FPL: Sliding scale (20% to 0%)
 * - Above 400% FPL: No charity care discount
 */
export function calculateCharityDiscount(fplPercentage) {
  if (fplPercentage <= 100) {
    return {
      discountPercent: 100,
      tier: 'Full Charity Care',
      description: 'You likely qualify for 100% charity care (free care) at non-profit hospitals.'
    }
  } else if (fplPercentage <= 200) {
    // Sliding scale from 100% to 20%
    const discountPercent = Math.round(100 - ((fplPercentage - 100) * 0.8))
    return {
      discountPercent,
      tier: 'High Discount',
      description: `You likely qualify for ${discountPercent}% discount on your bill through charity care.`
    }
  } else if (fplPercentage <= 400) {
    // Sliding scale from 20% to 0%
    const discountPercent = Math.round(20 - ((fplPercentage - 200) * 0.1))
    return {
      discountPercent: Math.max(discountPercent, 0),
      tier: 'Moderate Discount',
      description: `You may qualify for ${discountPercent}% discount on your bill through financial assistance.`
    }
  } else {
    return {
      discountPercent: 0,
      tier: 'No Discount',
      description: 'You likely do not qualify for charity care based on income, but billing errors may still reduce your bill.'
    }
  }
}

/**
 * Check if hospital is required to provide charity care
 * Non-profit hospitals with 501(c)(3) status are required by IRS to provide charity care
 */
export function isCharityEligibleHospital(providerInfo) {
  // This will be enhanced with actual NPI lookup
  // For now, we'll check if the provider info indicates non-profit status
  const isNonProfit = providerInfo.isNonProfit === true
  const has501c3 = providerInfo.taxStatus === '501(c)(3)'

  return isNonProfit || has501c3
}

/**
 * Calculate total potential savings from charity care
 */
export function calculateCharitySavings(financials, fplData, charityDiscount) {
  // Charity care applies to patient responsibility AFTER insurance
  const patientResponsibility = financials.patientResponsibility || 0
  const charitySavings = patientResponsibility * (charityDiscount.discountPercent / 100)

  return {
    originalAmount: patientResponsibility,
    discountAmount: Math.round(charitySavings * 100) / 100,
    finalAmount: Math.round((patientResponsibility - charitySavings) * 100) / 100,
    discountPercent: charityDiscount.discountPercent,
    fplPercentage: fplData.fplPercentage
  }
}

/**
 * Main function to analyze charity care eligibility
 * Now with NPI lookup for automatic non-profit verification
 */
export async function analyzeCharityCare(extractedData, householdIncome, householdSize) {
  // Calculate FPL percentage
  const fplData = calculateFPLPercentage(householdIncome, householdSize)

  // Determine charity discount eligibility
  const charityDiscount = calculateCharityDiscount(fplData.fplPercentage)

  // Check if hospital is charity-eligible (non-profit) with NPI lookup
  const eligibilityCheck = await checkCharityEligibility(extractedData.providerInfo)
  const isEligibleHospital = eligibilityCheck.isNonProfit

  console.log(`🏥 Non-profit status: ${isEligibleHospital} (confidence: ${eligibilityCheck.confidence})`)
  console.log(`   Reason: ${eligibilityCheck.reason}`)

  // Calculate potential savings
  let charitySavings = null
  if (isEligibleHospital && charityDiscount.discountPercent > 0) {
    charitySavings = calculateCharitySavings(
      extractedData.financials,
      fplData,
      charityDiscount
    )
  }

  return {
    fplData,
    charityDiscount,
    isEligibleHospital,
    eligibilityCheck, // Include NPI lookup data
    charitySavings,
    recommendation: generateCharityRecommendation(
      extractedData,
      fplData,
      charityDiscount,
      isEligibleHospital,
      charitySavings,
      eligibilityCheck
    )
  }
}

/**
 * Generate actionable recommendation for patient
 */
function generateCharityRecommendation(extractedData, fplData, charityDiscount, isEligibleHospital, charitySavings, eligibilityCheck) {
  if (!isEligibleHospital) {
    return {
      eligible: false,
      message: 'This hospital may not be required to offer charity care. However, you can still request financial assistance or negotiate your bill.',
      actions: [
        'Ask the hospital billing department if they have any financial assistance programs',
        'Request a payment plan to make the bill more manageable',
        'Negotiate for a cash discount if you can pay in full'
      ]
    }
  }

  if (charityDiscount.discountPercent === 0) {
    return {
      eligible: false,
      message: 'Based on your income, you may not qualify for charity care. However, you should still check for billing errors.',
      actions: [
        'Review the billing errors we found',
        'Ask about payment plans',
        'Request an itemized bill to verify all charges'
      ]
    }
  }

  return {
    eligible: true,
    message: `You likely qualify for ${charityDiscount.discountPercent}% charity care discount at this non-profit hospital.`,
    actions: [
      `Request a charity care application from ${extractedData.providerInfo?.facilityName || 'the hospital'}`,
      'Provide proof of income (tax returns, pay stubs, bank statements)',
      `Mention that you are at ${fplData.fplPercentage}% of Federal Poverty Level`,
      'Ask about retroactive charity care application (many hospitals allow this)',
      'Reference IRS requirements for 501(c)(3) hospitals to provide charity care'
    ],
    potentialSavings: charitySavings?.discountAmount || 0
  }
}
