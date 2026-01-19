import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

let s3Client

/**
 * Initialize S3 client (supports both AWS S3 and CloudFlare R2)
 */
function getS3Client() {
  if (!s3Client) {
    const config = {
      region: process.env.AWS_REGION || 'auto',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    }

    // If using CloudFlare R2, add custom endpoint
    if (process.env.S3_ENDPOINT) {
      config.endpoint = process.env.S3_ENDPOINT
    }

    s3Client = new S3Client(config)
  }
  return s3Client
}

/**
 * Upload file to S3-compatible storage
 * Returns the file URL
 */
export async function uploadFileToStorage(file, auditId) {
  try {
    const client = getS3Client()
    const bucketName = process.env.AWS_BUCKET_NAME

    if (!bucketName) {
      throw new Error('AWS_BUCKET_NAME not configured')
    }

    // Generate unique filename
    const fileExtension = file.originalname.split('.').pop()
    const fileName = `${auditId}-${uuidv4()}.${fileExtension}`
    const key = `bills/${fileName}`

    // Upload to S3/R2
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      // Optional: Add metadata
      Metadata: {
        auditId,
        uploadedAt: new Date().toISOString(),
      },
    })

    await client.send(command)

    // Construct file URL
    let fileUrl
    if (process.env.S3_ENDPOINT) {
      // CloudFlare R2 URL format
      fileUrl = `${process.env.S3_ENDPOINT}/${bucketName}/${key}`
    } else {
      // AWS S3 URL format
      fileUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`
    }

    console.log(`File uploaded successfully: ${fileUrl}`)

    return fileUrl
  } catch (error) {
    console.error('Error uploading file to storage:', error)
    throw new Error(`Storage upload failed: ${error.message}`)
  }
}

/**
 * Alternative: Local file storage (for development/testing)
 * Use this if you don't want to set up S3 immediately
 */
export async function uploadFileToLocal(file, auditId) {
  try {
    const fs = await import('fs/promises')
    const path = await import('path')

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'uploads', 'bills')
    await fs.mkdir(uploadsDir, { recursive: true })

    // Generate filename
    const fileExtension = file.originalname.split('.').pop()
    const fileName = `${auditId}-${uuidv4()}.${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Write file
    await fs.writeFile(filePath, file.buffer)

    // Return relative URL
    const fileUrl = `/uploads/bills/${fileName}`

    console.log(`File saved locally: ${filePath}`)

    return fileUrl
  } catch (error) {
    console.error('Error saving file locally:', error)
    throw new Error(`Local storage failed: ${error.message}`)
  }
}

/**
 * Main export - switches between S3 and local storage based on environment
 */
export async function uploadFile(file, auditId) {
  // Use local storage if AWS credentials are not configured
  if (!process.env.AWS_ACCESS_KEY_ID || process.env.USE_LOCAL_STORAGE === 'true') {
    console.log('Using local file storage')
    return uploadFileToLocal(file, auditId)
  }

  return uploadFileToStorage(file, auditId)
}
