/**
 * NPI Lookup Service
 * Queries the CMS NPI Registry to get provider information
 * and determine if a hospital is non-profit
 */

import fetch from 'node-fetch'

const CMS_NPI_API = 'https://nppesapi.cms.hhs.gov/api/'

// Cache for NPI lookups (in production, use Redis with TTL)
const npiCache = new Map()

/**
 * Look up provider information by NPI number
 * @param {string} npi - National Provider Identifier
 * @returns {object} Provider details including organization type and tax status
 */
export async function lookupNPI(npi) {
  // Check cache first
  if (npiCache.has(npi)) {
    console.log(`📋 NPI ${npi} found in cache`)
    return npiCache.get(npi)
  }

  try {
    console.log(`🔍 Looking up NPI ${npi} via CMS API...`)

    const response = await fetch(
      `${CMS_NPI_API}?version=2.1&number=${npi}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`CMS API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      console.log(`⚠️  NPI ${npi} not found in CMS registry`)
      return null
    }

    const provider = data.results[0]

    // Extract relevant information
    const providerInfo = {
      npi: provider.number,
      entityType: provider.enumeration_type, // 'NPI-1' = Individual, 'NPI-2' = Organization
      organizationName: provider.basic?.organization_name || null,
      ein: provider.basic?.ein || null, // Tax ID
      organizationType: provider.taxonomies?.[0]?.desc || null,
      address: {
        line1: provider.addresses?.[0]?.address_1,
        line2: provider.addresses?.[0]?.address_2,
        city: provider.addresses?.[0]?.city,
        state: provider.addresses?.[0]?.state,
        zip: provider.addresses?.[0]?.postal_code,
      },
      lastUpdated: provider.basic?.last_updated || null
    }

    // Determine if likely non-profit based on organization type
    providerInfo.likelyNonProfit = isLikelyNonProfit(providerInfo)

    // Cache the result
    npiCache.set(npi, providerInfo)
    console.log(`✅ NPI ${npi} lookup complete: ${providerInfo.organizationName}`)

    return providerInfo
  } catch (error) {
    console.error(`❌ Error looking up NPI ${npi}:`, error.message)
    return null
  }
}

/**
 * Determine if a provider is likely non-profit based on organization type and name
 * This is a heuristic - for definitive status, would need IRS database
 */
function isLikelyNonProfit(providerInfo) {
  if (!providerInfo.organizationName) {
    return false
  }

  const name = providerInfo.organizationName.toLowerCase()
  const type = providerInfo.organizationType?.toLowerCase() || ''

  // Common indicators of non-profit hospitals
  const nonProfitIndicators = [
    'university',
    'memorial',
    'community',
    'county',
    'regional',
    'medical center',
    'children\'s',
    'veterans',
    'va ',
    'saint',
    'st.',
    'holy',
    'mercy',
    'providence',
    'catholic',
    'baptist',
    'methodist',
    'presbyterian',
    'lutheran',
    'adventist',
    'shriners',
    'city of',
    'county of',
    'public',
    'health system',
    'healthcare system',
    'hospital district',
    'medical district',
    'public hospital',
    'district hospital'
  ]

  // Known non-profit systems (add specific cases here)
  const knownNonProfits = [
    'spartanburg regional',
    'mayo clinic',
    'cleveland clinic',
    'johns hopkins',
    'kaiser permanente'
  ]

  // Check if it's a known non-profit (highest priority)
  const isKnownNonProfit = knownNonProfits.some(known =>
    name.includes(known)
  )

  if (isKnownNonProfit) {
    console.log(`✅ ${providerInfo.organizationName} is a known non-profit`)
    return true
  }

  // For-profit chains (check before general indicators)
  const forProfitChains = [
    'hca ',
    'tenet',
    'healthsouth',
    'select medical',
    'kindred',
    'lifepoint',
    'community health systems',
    'universal health services'
  ]

  const hasForProfitIndicator = forProfitChains.some(chain =>
    name.includes(chain)
  )

  if (hasForProfitIndicator) {
    console.log(`❌ ${providerInfo.organizationName} appears to be for-profit (matches known chain)`)
    return false
  }

  // Check if name contains non-profit indicators
  const hasNonProfitIndicator = nonProfitIndicators.some(indicator =>
    name.includes(indicator)
  )

  if (hasNonProfitIndicator) {
    console.log(`✅ ${providerInfo.organizationName} likely non-profit (name indicator)`)
  }

  return hasNonProfitIndicator
}

/**
 * Look up provider by Tax ID (EIN)
 * Useful when NPI is not available but Tax ID is on the bill
 */
export async function lookupByTaxId(taxId) {
  try {
    console.log(`🔍 Looking up Tax ID ${taxId} via CMS API...`)

    // Clean the tax ID (remove dashes, spaces)
    const cleanTaxId = taxId.replace(/[^0-9]/g, '')

    const response = await fetch(
      `${CMS_NPI_API}?version=2.1&enumeration_type=NPI-2&ein=${cleanTaxId}`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`CMS API returned ${response.status}`)
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      console.log(`⚠️  Tax ID ${taxId} not found in CMS registry`)
      return null
    }

    // Return the first result's NPI and look it up
    const npi = data.results[0].number
    return await lookupNPI(npi)
  } catch (error) {
    console.error(`❌ Error looking up Tax ID ${taxId}:`, error.message)
    return null
  }
}

/**
 * Verify 501(c)(3) status with IRS Tax Exempt Organization database
 * The IRS provides a public API for checking tax-exempt status
 */
export async function verifyIRS501c3(ein) {
  // Cache for IRS lookups
  const cacheKey = `irs_${ein}`
  if (npiCache.has(cacheKey)) {
    console.log(`📋 IRS data for EIN ${ein} found in cache`)
    return npiCache.get(cacheKey)
  }

  try {
    console.log(`🔍 Verifying 501(c)(3) status for EIN ${ein} via IRS...`)

    // Clean the EIN (remove dashes, spaces)
    const cleanEIN = ein.replace(/[^0-9]/g, '')

    // IRS Tax Exempt Organization Search API
    // Note: The IRS API endpoint - using their public data
    const response = await fetch(
      `https://apps.irs.gov/app/eos/pub78Search.do?ein=${cleanEIN}&names=&city=&state=All&country=US&deductibility=all&dispatchMethod=searchCharities&submitName=Search`,
      {
        headers: {
          'User-Agent': 'BilluminateMD/1.0 (Medical Bill Auditor)',
          'Accept': 'text/html'
        },
        timeout: 5000 // 5 second timeout
      }
    )

    if (!response.ok) {
      console.log(`⚠️  IRS API returned ${response.status} for EIN ${ein}`)
      return null
    }

    const html = await response.text()

    // Parse the HTML response to check for 501(c)(3) status
    // The IRS page will show "No records found" if not tax-exempt
    const is501c3 = html.includes('501(c)(3)') && !html.includes('No records found')

    let organizationName = null
    // Try to extract organization name from the HTML
    const nameMatch = html.match(/<td[^>]*>([^<]+)<\/td>/i)
    if (nameMatch && nameMatch[1]) {
      organizationName = nameMatch[1].trim()
    }

    const irsData = {
      ein: cleanEIN,
      is501c3,
      organizationName,
      verifiedDate: new Date().toISOString()
    }

    // Cache the result (valid for 30 days typically)
    npiCache.set(cacheKey, irsData)

    if (is501c3) {
      console.log(`✅ IRS confirmed: EIN ${ein} is 501(c)(3) tax-exempt`)
    } else {
      console.log(`❌ IRS check: EIN ${ein} is not 501(c)(3) or not found`)
    }

    return irsData
  } catch (error) {
    console.error(`❌ Error verifying IRS 501(c)(3) status for EIN ${ein}:`, error.message)
    // Don't fail the whole process if IRS lookup fails
    return null
  }
}

/**
 * Enhanced charity eligibility check with NPI lookup AND IRS 501(c)(3) verification
 * Option 3: Combined Approach
 * 1. Use NPI → get Tax ID from CMS
 * 2. Use Tax ID → verify 501(c)(3) status from IRS
 * 3. Cache results to avoid repeated lookups
 *
 * @param {object} providerInfo - Provider info from bill (may include NPI or Tax ID)
 * @returns {object} Eligibility information with NPI and IRS lookup data
 */
export async function checkCharityEligibility(providerInfo) {
  console.log('🔍 Starting charity eligibility check...')
  console.log('Provider Info:', {
    facilityName: providerInfo.facilityName,
    npi: providerInfo.npi,
    taxId: providerInfo.taxId,
    nonprofitMentioned: providerInfo.nonprofitMentioned,
    charityCareMentioned: providerInfo.charityCareMentioned
  })

  let npiData = null

  // Try NPI lookup first
  if (providerInfo.npi) {
    npiData = await lookupNPI(providerInfo.npi)
  }

  // If no NPI or lookup failed, try Tax ID
  if (!npiData && providerInfo.taxId) {
    npiData = await lookupByTaxId(providerInfo.taxId)
  }

  // If still no data, try to infer from facility name
  if (!npiData && providerInfo.facilityName) {
    console.log(`📝 No NPI/Tax ID lookup data. Analyzing facility name: ${providerInfo.facilityName}`)
    npiData = {
      organizationName: providerInfo.facilityName,
      likelyNonProfit: isLikelyNonProfit({ organizationName: providerInfo.facilityName })
    }
  }

  // STEP 2: Verify 501(c)(3) status with IRS
  let irsData = null
  let ein = providerInfo.taxId || npiData?.ein

  if (ein) {
    irsData = await verifyIRS501c3(ein)
  }

  // Determine non-profit status with confidence levels
  let isNonProfit = false
  let confidence = 'unknown'
  let reason = []

  // Highest confidence: IRS confirmed 501(c)(3)
  if (irsData && irsData.is501c3) {
    isNonProfit = true
    confidence = 'confirmed'
    reason.push(`IRS confirmed 501(c)(3) tax-exempt status${irsData.organizationName ? ` for ${irsData.organizationName}` : ''}`)
  }
  // High confidence: Bill explicitly mentions non-profit or 501(c)(3)
  else if (providerInfo.nonprofitMentioned) {
    isNonProfit = true
    confidence = 'high'
    reason.push('Bill explicitly mentions non-profit or 501(c)(3) status')
  }
  // Medium confidence: CMS data suggests non-profit
  else if (npiData && npiData.likelyNonProfit) {
    isNonProfit = true
    confidence = 'likely'
    reason.push(`CMS registry data suggests ${npiData.organizationName} is non-profit`)
  }
  // Low confidence: Bill mentions charity care but no other confirmation
  else if (providerInfo.charityCareMentioned) {
    isNonProfit = false // Can't confirm, but there's a hint
    confidence = 'uncertain'
    reason.push('Bill mentions charity care or financial assistance policy, but non-profit status unconfirmed')
  }
  else {
    reason.push('Unable to verify non-profit status from available data')
  }

  // Add charity care mention as additional context if present
  if (providerInfo.charityCareMentioned && confidence !== 'uncertain') {
    reason.push('Bill mentions charity care or financial assistance policy')
  }

  console.log('📊 Charity eligibility determination:')
  console.log(`  - Non-Profit: ${isNonProfit}`)
  console.log(`  - Confidence: ${confidence}`)
  console.log(`  - Reason: ${reason.join('. ')}`)

  return {
    isNonProfit,
    confidence, // 'unknown', 'uncertain', 'likely', 'high', 'confirmed'
    reason: reason.join('. '),
    npiData,
    irsData,
    recommendation: generateRecommendation(isNonProfit, confidence, npiData, irsData)
  }
}

/**
 * Generate recommendation based on non-profit status confidence
 */
function generateRecommendation(isNonProfit, confidence, npiData, irsData) {
  if (isNonProfit && confidence === 'confirmed') {
    return {
      shouldApply: true,
      message: `This hospital is IRS-verified 501(c)(3) non-profit. You have a strong legal right to apply for charity care.`,
      nextSteps: [
        'Request a charity care application from the billing department',
        'Provide proof of income (tax returns, pay stubs, bank statements)',
        'Reference IRS requirements that 501(c)(3) hospitals MUST provide charity care',
        `Mention the hospital's Tax ID (${irsData?.ein}) if needed for verification`
      ]
    }
  }

  if (isNonProfit && confidence === 'high') {
    return {
      shouldApply: true,
      message: 'This hospital identifies as non-profit. You should definitely apply for charity care if you qualify.',
      nextSteps: [
        'Request a charity care application',
        'Provide proof of income',
        'Reference IRS requirements for 501(c)(3) hospitals'
      ]
    }
  }

  if (isNonProfit && confidence === 'likely') {
    return {
      shouldApply: true,
      message: 'This hospital appears to be non-profit based on CMS registry data. You should apply for charity care.',
      nextSteps: [
        'Confirm non-profit status by asking the billing department',
        'Request a charity care application',
        'Provide proof of income'
      ]
    }
  }

  if (confidence === 'uncertain') {
    return {
      shouldApply: true,
      message: 'This hospital mentions financial assistance. Even if not required by law, many hospitals offer payment help.',
      nextSteps: [
        'Ask the billing department about financial assistance programs',
        'Request information about charity care eligibility',
        'Inquire about payment plans or discount policies'
      ]
    }
  }

  return {
    shouldApply: false,
    message: 'We could not confirm non-profit status. Contact the hospital or provider directly to verify their status and available financial assistance programs.',
    nextSteps: [
      'Contact the hospital billing department to confirm if they are a non-profit 501(c)(3) organization',
      'Ask the billing department about available financial assistance programs',
      'Request a payment plan to make the bill more manageable',
      'Negotiate for a cash discount or prompt-pay discount (typically 10-30% off)',
      'Request an itemized bill to verify all charges are correct'
    ]
  }
}
