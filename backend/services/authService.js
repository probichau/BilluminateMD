/**
 * Authentication Service
 * Handles user registration, login, and JWT token management
 */

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pg from 'pg'

const { Pool } = pg
const SALT_ROUNDS = 10
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_EXPIRES_IN = '7d' // Token valid for 7 days

// Database pool
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

// Helper function for queries
async function query(text, params) {
  return await getPool().query(text, params)
}

/**
 * Register a new user
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @param {string} fullName - User's full name
 * @returns {Promise<Object>} User object with JWT token
 */
export async function registerUser(email, password, fullName) {
  // Check if user already exists
  const existingUser = await query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  )

  if (existingUser.rows.length > 0) {
    throw new Error('User with this email already exists')
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)

  // Insert new user
  const result = await query(
    `INSERT INTO users (email, password_hash, full_name)
     VALUES ($1, $2, $3)
     RETURNING id, email, full_name, created_at`,
    [email.toLowerCase(), passwordHash, fullName]
  )

  const user = result.rows[0]

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      createdAt: user.created_at,
    },
    token,
  }
}

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - Plain text password
 * @returns {Promise<Object>} User object with JWT token
 */
export async function loginUser(email, password) {
  // Find user by email
  const result = await query(
    'SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = $1',
    [email.toLowerCase()]
  )

  if (result.rows.length === 0) {
    throw new Error('Invalid email or password')
  }

  const user = result.rows[0]

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash)

  if (!isPasswordValid) {
    throw new Error('Invalid email or password')
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      createdAt: user.created_at,
    },
    token,
  }
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Decoded token payload
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Get user by ID
 * @param {number} userId - User ID
 * @returns {Promise<Object>} User object
 */
export async function getUserById(userId) {
  const result = await query(
    'SELECT id, email, full_name, created_at FROM users WHERE id = $1',
    [userId]
  )

  if (result.rows.length === 0) {
    throw new Error('User not found')
  }

  return {
    id: result.rows[0].id,
    email: result.rows[0].email,
    fullName: result.rows[0].full_name,
    createdAt: result.rows[0].created_at,
  }
}
