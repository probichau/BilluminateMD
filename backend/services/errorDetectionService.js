import { getMedicareAllowableRate } from './aiService.js'

/**
 * Main error detection function
 * Analyzes extracted bill data and identifies billing errors
 */
export async function detectErrors(extractedData) {
  const errors = []

  const { lineItems, serviceInfo } = extractedData

  // Run all detection algorithms
  errors.push(...detectDuplicateCharges(lineItems))
  errors.push(...detectUnbundling(lineItems))
  errors.push(...detectUpcoding(lineItems))
  errors.push(...detectPriceAnomalies(lineItems))

  return errors
}

/**
 * Detects duplicate charges - same CPT code billed multiple times on same date
 */
function detectDuplicateCharges(lineItems) {
  const errors = []
  const cptCodesByDate = {}

  lineItems.forEach((item, index) => {
    const key = `${item.dateOfService}_${item.cptCode}`

    if (!cptCodesByDate[key]) {
      cptCodesByDate[key] = []
    }
    cptCodesByDate[key].push({ ...item, index })
  })

  // Find duplicates
  Object.entries(cptCodesByDate).forEach(([key, items]) => {
    if (items.length > 1) {
      const [date, cptCode] = key.split('_')
      const totalCharged = items.reduce((sum, item) => sum + item.billedAmount, 0)
      const potentialSavings = totalCharged - items[0].billedAmount // Keep only one

      errors.push({
        type: 'Duplicate Charge',
        severity: 'high',
        cptCode,
        description: `${cptCode} - ${items[0].description}`,
        explanation: `This service appears ${items.length} times on ${date}. Unless multiple sessions occurred, this is likely a duplicate charge.`,
        potentialSavings,
        actionableAdvice: `Contact the billing department and reference ${cptCode} on ${date}. Ask why this service was charged ${items.length} times and request removal of duplicate(s).`,
        dateOfService: date,
      })
    }
  })

  return errors
}

/**
 * Detects unbundling - when components of a comprehensive service are billed separately
 */
function detectUnbundling(lineItems) {
  const errors = []

  // Define common bundling rules (CPT codes that shouldn't be billed together)
  const bundlingRules = [
    {
      comprehensive: '99213',
      components: ['99211', '99212'],
      description: 'Office visit levels should not be bundled',
    },
    {
      comprehensive: '80053',
      components: ['82040', '82248', '82310', '82374', '82435', '82565', '82947', '84132', '84155', '84295', '84450'],
      description: 'Comprehensive Metabolic Panel (CMP) includes individual tests',
    },
    {
      comprehensive: '80048',
      components: ['80061', '84478'],
      description: 'Basic Metabolic Panel should not be unbundled',
    },
  ]

  const cptCodesPresent = new Set(lineItems.map(item => item.cptCode))

  bundlingRules.forEach(rule => {
    const hasComprehensive = cptCodesPresent.has(rule.comprehensive)
    const hasComponents = rule.components.filter(code => cptCodesPresent.has(code))

    if (hasComponents.length > 0 && !hasComprehensive) {
      // Check if billing components separately costs more than comprehensive
      const comprehensiveItem = lineItems.find(item => item.cptCode === rule.comprehensive)
      const componentItems = lineItems.filter(item => hasComponents.includes(item.cptCode))

      if (componentItems.length >= 2) {
        const componentTotal = componentItems.reduce((sum, item) => sum + item.billedAmount, 0)
        const estimatedComprehensiveRate = getMedicareAllowableRate(rule.comprehensive) || componentTotal * 0.7

        if (componentTotal > estimatedComprehensiveRate * 1.2) {
          errors.push({
            type: 'Unbundling',
            severity: 'high',
            cptCode: hasComponents.join(', '),
            description: `${rule.description}`,
            explanation: `These services (${hasComponents.join(', ')}) were billed separately but should typically be included in a single comprehensive code (${rule.comprehensive}). Unbundling increases the total charge.`,
            potentialSavings: componentTotal - estimatedComprehensiveRate,
            actionableAdvice: `Ask why codes ${hasComponents.join(', ')} were billed separately instead of using the comprehensive code ${rule.comprehensive}. Request re-billing using the appropriate bundled code.`,
            dateOfService: componentItems[0].dateOfService,
          })
        }
      }
    }
  })

  return errors
}

/**
 * Detects upcoding - billing for a more expensive service than what was provided
 */
function detectUpcoding(lineItems) {
  const errors = []

  // Define typical patterns for upcoding
  const upcodingRules = [
    {
      codes: ['99211', '99212', '99213', '99214', '99215'],
      type: 'Office Visit Levels',
      description: 'Office visit levels should match complexity',
    },
    {
      codes: ['99281', '99282', '99283', '99284', '99285'],
      type: 'Emergency Department Levels',
      description: 'ED visit levels should match acuity',
    },
  ]

  upcodingRules.forEach(rule => {
    const relevantItems = lineItems.filter(item => rule.codes.includes(item.cptCode))

    relevantItems.forEach(item => {
      // Check if highest level codes (99215, 99285) are being used
      // These should be rare - only for very complex cases
      const isHighestLevel = item.cptCode === rule.codes[rule.codes.length - 1]

      if (isHighestLevel) {
        const oneCodeDown = rule.codes[rule.codes.length - 2]
        const expectedRate = getMedicareAllowableRate(oneCodeDown)
        const actualRate = item.billedAmount

        if (expectedRate && actualRate > expectedRate * 1.3) {
          errors.push({
            type: 'Potential Upcoding',
            severity: 'medium',
            cptCode: item.cptCode,
            description: `${item.cptCode} - ${item.description}`,
            explanation: `This visit was billed at the highest level (${item.cptCode}), which should only be used for highly complex cases. Verify that the service actually met the criteria for this level.`,
            potentialSavings: actualRate - expectedRate,
            actionableAdvice: `Request documentation showing why the highest level code was medically necessary. Ask for the clinical notes to verify complexity justifies ${item.cptCode}.`,
            dateOfService: item.dateOfService,
          })
        }
      }
    })
  })

  return errors
}

/**
 * Detects price anomalies - charges that are significantly higher than typical rates
 */
function detectPriceAnomalies(lineItems) {
  const errors = []

  lineItems.forEach(item => {
    const medicareRate = getMedicareAllowableRate(item.cptCode)

    if (medicareRate) {
      const ratio = item.billedAmount / medicareRate

      // Flag if billed amount is more than 300% of Medicare rate
      if (ratio > 3.0) {
        errors.push({
          type: 'Price Anomaly',
          severity: 'medium',
          cptCode: item.cptCode,
          description: `${item.cptCode} - ${item.description}`,
          explanation: `This service is billed at $${item.billedAmount.toFixed(2)}, which is ${(ratio * 100).toFixed(0)}% of the Medicare allowable rate ($${medicareRate.toFixed(2)}). While providers can set their own rates, this is significantly higher than typical.`,
          potentialSavings: item.billedAmount - (medicareRate * 2), // Assume 2x Medicare is reasonable
          actionableAdvice: `Reference the Medicare allowable rate of $${medicareRate.toFixed(2)} for ${item.cptCode} and ask why your charge is ${(ratio * 100).toFixed(0)}% higher. Request an adjustment to a more reasonable rate.`,
          dateOfService: item.dateOfService,
        })
      }

      // Flag suspiciously round numbers (like $500.00, $1000.00) for specific codes
      if (item.billedAmount % 100 === 0 && item.billedAmount > 500) {
        errors.push({
          type: 'Price Anomaly',
          severity: 'low',
          cptCode: item.cptCode,
          description: `${item.cptCode} - ${item.description}`,
          explanation: `This service is billed at exactly $${item.billedAmount.toFixed(2)}, which is an unusually round number. While not necessarily incorrect, round numbers can sometimes indicate estimated rather than actual charges.`,
          potentialSavings: item.billedAmount * 0.15, // Estimate 15% reduction
          actionableAdvice: `Ask for a detailed breakdown of how the $${item.billedAmount.toFixed(2)} charge was calculated. Request itemized costs if this is a bundled service.`,
          dateOfService: item.dateOfService,
        })
      }
    }
  })

  return errors
}

/**
 * Helper function to check if two services are typically bundled
 * Based on NCCI (National Correct Coding Initiative) guidelines
 */
function areServicesBundled(cptCode1, cptCode2) {
  // Simplified version - in production, use full NCCI database
  const bundledPairs = {
    '99213': ['36415', '94760'],  // Office visit typically includes venipuncture, pulse ox
    '99214': ['36415', '94760'],
    '71046': ['71045'],  // 2-view chest xray includes single view
  }

  return (
    (bundledPairs[cptCode1] && bundledPairs[cptCode1].includes(cptCode2)) ||
    (bundledPairs[cptCode2] && bundledPairs[cptCode2].includes(cptCode1))
  )
}
