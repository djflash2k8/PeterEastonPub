import type { NextRequest } from 'next/server'

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000,
  maxRequests: 200,
}

export function rateLimit(identifier: string): { success: boolean; resetIn?: number } {
  const now = Date.now()
  for (const [key, data] of rateLimitStore.entries()) {
    if (data.resetTime < now) rateLimitStore.delete(key)
  }
  const existing = rateLimitStore.get(identifier)
  if (!existing || existing.resetTime < now) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_CONFIG.windowMs })
    return { success: true }
  }
  if (existing.count >= RATE_LIMIT_CONFIG.maxRequests) {
    return { success: false, resetIn: Math.ceil((existing.resetTime - now) / 1000) }
  }
  rateLimitStore.set(identifier, { count: existing.count + 1, resetTime: existing.resetTime })
  return { success: true }
}

export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : (request as any).ip ?? 'unknown'
  return Buffer.from(ip).toString('base64').substring(0, 16)
}

// ─── Input sanitisation ───────────────────────────────────────────────────────
export const sanitizeInput = {
  string: (input: string): string => {
    if (typeof input !== 'string') return ''
    return input.trim().replace(/[<>]/g, '').replace(/javascript:/gi, '').replace(/on\w+\s*=/gi, '')
  },
  html: (input: string): string => input.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'),
}

// ─── Validation patterns ──────────────────────────────────────────────────────
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  alphanumeric: /^[a-zA-Z0-9\s]+$/,
  url: /^https?:\/\/.+/,
  slug: /^[a-z0-9-]+$/,
  title: /^.{1,100}$/,
  description: /^[\s\S]{1,2000}$/,
}

// ─── Security headers ─────────────────────────────────────────────────────────
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  // Loosened CSP for maximum compatibility with Next.js and Vercel
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https://res.cloudinary.com https://*.openstreetmap.org",
    "frame-src 'self' https://www.openstreetmap.org",
    "connect-src 'self'",
    "frame-ancestors 'self'",
  ].join('; '),
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
}
