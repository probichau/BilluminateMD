/**
 * Google OAuth Service
 * Handles Google sign-in and account linking
 */

import pg from 'pg'
import jwt from 'jsonwebtoken'

const { Pool } = pg

let pool
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    })
  }
  return pool
}

async function query(text, params) {
  return await getPool().query(text, params)
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d'

/**
 * Handle Google OAuth callback
 * Links to existing account if email matches, or creates new account
 */
export async function handleGoogleAuth(profile) {
  const googleId = profile.id
  const email = profile.emails[0].value.toLowerCase()
  const fullName = profile.displayName
  const picture = profile.photos?.[0]?.value

  console.log(`🔐 Google auth for: ${email}`)

  // Check if user already exists by Google ID
  let result = await query(
    'SELECT * FROM users WHERE google_id = $1',
    [googleId]
  )

  if (result.rows.length > 0) {
    // User exists with this Google ID
    const user = result.rows[0]
    console.log(`✅ Existing Google user: ${user.email}`)
    return generateToken(user)
  }

  // Check if user exists with this email (local account)
  result = await query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  )

  if (result.rows.length > 0) {
    // Email exists - link Google account to existing user
    console.log(`🔗 Linking Google account to existing user: ${email}`)
    
    const updatedUser = await query(
      `UPDATE users 
       SET google_id = $1, 
           google_email = $2, 
           google_picture = $3,
           auth_provider = 'google',
           updated_at = CURRENT_TIMESTAMP
       WHERE email = $4
       RETURNING id, email, full_name, google_id, google_picture, created_at`,
      [googleId, email, picture, email]
    )

    return generateToken(updatedUser.rows[0])
  }

  // New user - create account with Google
  console.log(`✨ Creating new Google user: ${email}`)
  
  const newUser = await query(
    `INSERT INTO users (email, full_name, google_id, google_email, google_picture, auth_provider, password_hash)
     VALUES ($1, $2, $3, $4, $5, 'google', NULL)
     RETURNING id, email, full_name, google_id, google_picture, created_at`,
    [email, fullName, googleId, email, picture]
  )

  return generateToken(newUser.rows[0])
}

/**
 * Generate JWT token for user
 */
function generateToken(user) {
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      picture: user.google_picture,
      authProvider: 'google'
    }
  }
}
