/**
 * Authentication Controller
 * Handles user registration and login endpoints
 */

import { registerUser, loginUser } from '../services/authService.js'
import { handleGoogleAuth } from '../services/googleAuthService.js'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

// Configure Google OAuth Strategy
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5001/api/auth/google/callback'

if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const result = await handleGoogleAuth(profile)
      done(null, result)
    } catch (error) {
      done(error, null)
    }
  }))
} else {
  console.warn('⚠️  Google OAuth not configured - missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET')
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res) {
  try {
    const { email, password, fullName } = req.body

    // Validation
    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Email, password, and full name are required',
      })
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
      })
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
      })
    }

    const result = await registerUser(email, password, fullName)

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      ...result,
    })
  } catch (error) {
    console.error('Registration error:', error)

    if (error.message === 'User with this email already exists') {
      return res.status(409).json({ error: error.message })
    }

    res.status(500).json({
      error: 'Failed to register user',
    })
  }
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function login(req, res) {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      })
    }

    const result = await loginUser(email, password)

    res.json({
      success: true,
      message: 'Login successful',
      ...result,
    })
  } catch (error) {
    console.error('Login error:', error)

    if (error.message === 'Invalid email or password') {
      return res.status(401).json({ error: error.message })
    }

    res.status(500).json({
      error: 'Failed to login',
    })
  }
}

/**
 * Get current user info
 * GET /api/auth/me
 */
export async function getCurrentUser(req, res) {
  try {
    // User is already attached by authenticateToken middleware
    res.json({
      success: true,
      user: req.user,
    })
  } catch (error) {
    console.error('Get current user error:', error)
    res.status(500).json({
      error: 'Failed to get user info',
    })
  }
}

/**
 * Initiate Google OAuth flow
 * GET /api/auth/google
 */
export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
  session: false
})

/**
 * Handle Google OAuth callback
 * GET /api/auth/google/callback
 */
export const googleCallback = (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, result, info) => {
    if (err || !result) {
      console.error('Google auth error:', err)
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`)
    }

    // Redirect to frontend with token
    const { token, user } = result
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?token=${token}&provider=google`)
  })(req, res, next)
}
