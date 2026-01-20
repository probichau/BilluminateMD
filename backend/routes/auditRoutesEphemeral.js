/**
 * Ephemeral Audit Routes (HIPAA-Compliant)
 *
 * All routes process data ephemerally (in-memory only).
 * NO PHI is persisted server-side.
 */

import express from 'express'
import multer from 'multer'
import {
  analyzeBillEphemeral,
  calculateCharityEligibility,
  generateAppealLetterEphemeral,
  verifyPayment,
} from '../controllers/auditControllerEphemeral.js'

const router = express.Router()

// Configure multer for in-memory file storage (NO disk writes)
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images and PDFs only
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WebP) or PDF.'))
    }
  },
})

// Analyze uploaded bill (ephemeral, returns data to client)
router.post('/analyze', upload.single('file'), analyzeBillEphemeral)

// Calculate charity care eligibility (client sends data)
router.post('/charity-analysis', calculateCharityEligibility)

// Generate appeal letter (client sends full data)
router.post('/generate-letter', generateAppealLetterEphemeral)

// Verify payment status
router.post('/verify-payment', verifyPayment)

export default router
