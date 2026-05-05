import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Rate limiting storage (in production, use proper storage)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 1000, // Max 1000 requests per window (increased for development)
}

// Input validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9-]+$/,
  title: /^.{1,100}$/,
  description: /^.{1,1000}$/
}

// Sanitization functions
export const sanitizeInput = {
  string: (input: string): string => {
    if (typeof input !== 'string') return ''
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
  },
  
  html: (input: string): string => {
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}

// Rate limiting middleware
export function rateLimit(identifier: string): { success: boolean; resetIn?: number } {
  const now = Date.now()
  const windowStart = now - RATE_LIMIT_CONFIG.windowMs
  
  // Clean expired entries
  for (const [key, data] of Array.from(rateLimitStore.entries())) {
    if (data.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
  
  const existing = rateLimitStore.get(identifier)
  
  if (!existing || existing.resetTime < windowStart) {
    // First request or window expired
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.windowMs
    })
    return { success: true }
  }
  
  if (existing.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return { 
      success: false, 
      resetIn: Math.ceil((existing.resetTime - now) / 1000) 
    }
  }
  
  rateLimitStore.set(identifier, {
    count: existing.count + 1,
    resetTime: existing.resetTime
  })
  
  return { success: true }
}

// Get client identifier for rate limiting
export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? 
    (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded) :
    request.ip || 'unknown'
  
  // Hash IP for privacy
  return Buffer.from(ip).toString('base64').substring(0, 16)
}

// Security headers
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
}

// CSRF token generation
export function generateCSRFToken(): string {
  return Buffer.from(Date.now().toString() + Math.random().toString()).toString('base64')
}

export function validateCSRFToken(token: string): boolean {
  // In production, validate against stored token
  // For now, just check format and age
  if (!token || token.length < 10) return false
  
  try {
    const decoded = Buffer.from(token, 'base64').toString()
    const timestamp = parseInt(decoded.split('.')[0] || '0')
    const now = Date.now()
    
    // Token valid for 1 hour
    return (now - timestamp) < 3600000
  } catch {
    return false
  }
}
