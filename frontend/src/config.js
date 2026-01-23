/**
 * Application Configuration
 * Centralized configuration for API endpoints and other environment-specific settings
 * Updated: 2026-01-19 - Production deployment with HTTPS
 */

// API Base URL - uses environment variable in production, localhost in development
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

// Stripe Public Key
export const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_your_key_here'

// File upload limits
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

// Accepted file types
export const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
}

// Payment amounts
export const REPORT_PRICE = 49.00 // Per bill
export const SUBSCRIPTION_PRICE = 14.99 // Monthly (coming soon)

export default {
  API_URL,
  STRIPE_PUBLIC_KEY,
  MAX_FILE_SIZE_MB,
  MAX_FILE_SIZE_BYTES,
  ACCEPTED_FILE_TYPES,
  REPORT_PRICE,
  SUBSCRIPTION_PRICE,
}
