import express from 'express'
import multer from 'multer'
import { uploadBill, submitFinancialInfo, getAuditResults, unlockReport, generateLetter } from '../controllers/auditController.js'
import { optionalAuth } from '../middleware/authMiddleware.js'

const router = express.Router()

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf']
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, HEIC, and PDF are allowed.'))
    }
  },
})

// Routes with optional authentication
router.post('/upload', optionalAuth, (req, res, next) => {
  upload.single('bill')(req, res, (err) => {
    if (err) {
      console.error('Multer error:', err.message)
      return res.status(400).json({
        error: 'File upload error',
        details: err.message
      })
    }
    next()
  })
}, uploadBill)

router.post('/:auditId/financial-info', optionalAuth, submitFinancialInfo)
router.get('/:auditId', getAuditResults)
router.post('/:auditId/unlock', unlockReport)
router.post('/:auditId/generate-letter', generateLetter)

export default router
