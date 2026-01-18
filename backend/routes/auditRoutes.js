import express from 'express'
import multer from 'multer'
import { uploadBill, getAuditResults, unlockReport } from '../controllers/auditController.js'

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

// Routes
router.post('/upload', upload.single('bill'), uploadBill)
router.get('/:auditId', getAuditResults)
router.post('/:auditId/unlock', unlockReport)

export default router
