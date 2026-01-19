/**
 * Authentication Routes
 */

import express from 'express'
import { register, login, getCurrentUser, googleAuth, googleCallback } from '../controllers/authController.js'
import { authenticateToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)

// Google OAuth routes
router.get('/google', googleAuth)
router.get('/google/callback', googleCallback)

// Protected routes
router.get('/me', authenticateToken, getCurrentUser)

export default router
