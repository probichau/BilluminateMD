/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */

import { verifyToken, getUserById } from '../services/authService.js'

/**
 * Middleware to verify JWT token
 * Attaches user object to req.user if token is valid
 */
export async function authenticateToken(req, res, next) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    console.log('🔐 Auth check:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      path: req.path
    })

    if (!token) {
      console.log('❌ No token provided')
      return res.status(401).json({ error: 'Authentication token required' })
    }

    // Verify token
    const decoded = verifyToken(token)
    console.log('✅ Token decoded:', { userId: decoded.userId })

    // Get user from database
    const user = await getUserById(decoded.userId)
    console.log('✅ User found:', { id: user.id, email: user.email })

    // Attach user to request
    req.user = user

    next()
  } catch (error) {
    console.error('❌ Authentication error:', error.message)
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Optional authentication middleware
 * Attaches user object if token is present, but doesn't fail if missing
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = verifyToken(token)
      const user = await getUserById(decoded.userId)
      req.user = user
    }

    next()
  } catch (error) {
    // Token invalid but that's okay for optional auth
    next()
  }
}
