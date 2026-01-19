/**
 * Name Matching Service
 * Intelligently matches patient names on bills with registered user names
 * Handles common variations like nicknames, middle names, and formatting
 */

/**
 * Common nickname mappings
 */
const NICKNAME_MAPPINGS = {
  // Male names
  andrew: ['andy', 'drew'],
  anthony: ['tony'],
  benjamin: ['ben', 'benny'],
  charles: ['charlie', 'chuck'],
  christopher: ['chris'],
  daniel: ['dan', 'danny'],
  david: ['dave', 'davey'],
  edward: ['ed', 'eddie', 'ted'],
  james: ['jim', 'jimmy', 'jamie'],
  john: ['jack', 'johnny'],
  joseph: ['joe', 'joey'],
  michael: ['mike', 'mikey'],
  nicholas: ['nick'],
  peter: ['pete'],
  richard: ['dick', 'rick', 'ricky'],
  robert: ['rob', 'bob', 'bobby', 'robbie'],
  samuel: ['sam', 'sammy'],
  stephen: ['steve'],
  thomas: ['tom', 'tommy'],
  william: ['will', 'bill', 'billy', 'willy'],

  // Female names
  abigail: ['abby', 'gail'],
  alexandra: ['alex', 'sandy'],
  catherine: ['cathy', 'kate', 'katie'],
  christine: ['chris', 'christina', 'tina'],
  deborah: ['deb', 'debbie'],
  dorothy: ['dot', 'dottie'],
  elizabeth: ['liz', 'lizzie', 'beth', 'betty', 'eliza'],
  emily: ['em', 'emmy'],
  jennifer: ['jen', 'jenny'],
  jessica: ['jess', 'jessie'],
  katherine: ['kate', 'katie', 'kathy'],
  kimberly: ['kim'],
  margaret: ['maggie', 'meg', 'peggy'],
  mary: ['marie'],
  patricia: ['pat', 'patty', 'tricia'],
  rebecca: ['becky', 'becca'],
  stephanie: ['steph', 'steffi'],
  susan: ['sue', 'suzie'],
  victoria: ['vicky', 'vikki'],
}

/**
 * Build reverse mapping (nickname -> formal name)
 */
const REVERSE_NICKNAME_MAP = {}
for (const [formal, nicknames] of Object.entries(NICKNAME_MAPPINGS)) {
  for (const nickname of nicknames) {
    if (!REVERSE_NICKNAME_MAP[nickname]) {
      REVERSE_NICKNAME_MAP[nickname] = []
    }
    REVERSE_NICKNAME_MAP[nickname].push(formal)
  }
}

/**
 * Normalize a name for comparison
 * @param {string} name - Name to normalize
 * @returns {string} Normalized name
 */
function normalizeName(name) {
  if (!name) return ''

  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Extract first and last names from full name
 * @param {string} fullName - Full name
 * @returns {Object} { firstName, lastName, middleName }
 */
function parseFullName(fullName) {
  const normalized = normalizeName(fullName)
  const parts = normalized.split(' ').filter(p => p.length > 0)

  if (parts.length === 0) {
    return { firstName: '', lastName: '', middleName: '' }
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '', middleName: '' }
  }

  if (parts.length === 2) {
    return { firstName: parts[0], lastName: parts[1], middleName: '' }
  }

  // 3+ parts: first, middle(s), last
  return {
    firstName: parts[0],
    lastName: parts[parts.length - 1],
    middleName: parts.slice(1, -1).join(' '),
  }
}

/**
 * Check if two first names match (including nicknames)
 * @param {string} name1 - First name 1
 * @param {string} name2 - First name 2
 * @returns {boolean} True if names match
 */
function firstNamesMatch(name1, name2) {
  const n1 = normalizeName(name1)
  const n2 = normalizeName(name2)

  // Exact match
  if (n1 === n2) return true

  // Check if one is a nickname of the other
  const n1Nicknames = NICKNAME_MAPPINGS[n1] || []
  const n2Nicknames = NICKNAME_MAPPINGS[n2] || []

  // Check if n2 is a nickname of n1
  if (n1Nicknames.includes(n2)) return true

  // Check if n1 is a nickname of n2
  if (n2Nicknames.includes(n1)) return true

  // Check if both map to the same formal name
  const n1Formals = REVERSE_NICKNAME_MAP[n1] || []
  const n2Formals = REVERSE_NICKNAME_MAP[n2] || []

  for (const formal of n1Formals) {
    if (n2Formals.includes(formal)) return true
  }

  return false
}

/**
 * Check if bill patient name matches registered user name
 * @param {string} billPatientName - Patient name from bill
 * @param {string} registeredUserName - Registered user's full name
 * @returns {boolean} True if names match
 */
export function doesBillMatchUser(billPatientName, registeredUserName) {
  const billName = parseFullName(billPatientName)
  const userName = parseFullName(registeredUserName)

  console.log('🔍 Name matching:')
  console.log('  Bill:', billPatientName, '→', billName)
  console.log('  User:', registeredUserName, '→', userName)

  // Last name must match exactly (or one must be empty)
  const lastNameMatches =
    billName.lastName === '' ||
    userName.lastName === '' ||
    billName.lastName === userName.lastName

  if (!lastNameMatches) {
    console.log('  ❌ Last names do not match')
    return false
  }

  // First name must match (including nicknames)
  const firstNameMatches = firstNamesMatch(billName.firstName, userName.firstName)

  if (!firstNameMatches) {
    console.log('  ❌ First names do not match')
    return false
  }

  console.log('  ✅ Names match!')
  return true
}

/**
 * Batch check: Does bill match any family member?
 * @param {string} billPatientName - Patient name from bill
 * @param {string[]} familyNames - Array of family member names
 * @returns {Object} { matches: boolean, matchedName: string|null }
 */
export function doesBillMatchFamily(billPatientName, familyNames) {
  for (const familyName of familyNames) {
    if (doesBillMatchUser(billPatientName, familyName)) {
      return {
        matches: true,
        matchedName: familyName,
      }
    }
  }

  return {
    matches: false,
    matchedName: null,
  }
}
