import { NextResponse } from 'next/server'
import { validateCredentials, signToken } from '@/lib/auth'

const loginAttempts = new Map<string, { count: number; lockedUntil: number }>()
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 15 * 60 * 1000

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown'
}

function checkBruteForce(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (entry) {
    if (entry.lockedUntil > now) {
      return { allowed: false, retryAfter: Math.ceil((entry.lockedUntil - now) / 1000) }
    }
    if (entry.lockedUntil <= now) {
      loginAttempts.delete(ip)
    }
  }
  return { allowed: true }
}

function recordFailedAttempt(ip: string) {
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  const count = (entry?.count ?? 0) + 1
  loginAttempts.set(ip, {
    count,
    lockedUntil: count >= MAX_ATTEMPTS ? now + LOCKOUT_MS : 0,
  })
}

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const bruteForce = checkBruteForce(ip)
  if (!bruteForce.allowed) {
    return NextResponse.json(
      { error: `Too many failed attempts. Try again in ${bruteForce.retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(bruteForce.retryAfter) } }
    )
  }

  try {
    const body = await request.json()
    const username = body.username?.trim()
    const password = body.password

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 })
    }

    const isValid = await validateCredentials(username, password)
    if (!isValid) {
      recordFailedAttempt(ip)
      return NextResponse.json({ error: 'Invalid credentials.' }, { status: 401 })
    }

    // Success — generate token
    loginAttempts.delete(ip)
    const token = await signToken({ user: username })

    return NextResponse.json({ 
      success: true,
      token: token 
    })
  } catch {
    return NextResponse.json({ error: 'Authentication failed.' }, { status: 500 })
  }
}
