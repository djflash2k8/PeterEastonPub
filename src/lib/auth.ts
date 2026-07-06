import { timingSafeEqual, createHmac } from 'crypto'
import { queryCollectionFromFirebase } from './firebase'

// Credentials are read from environment variables, with fallback to Firestore settings
async function getCredentials() {
  let username = process.env.ADMIN_USERNAME ?? ''
  let password = process.env.ADMIN_PASSWORD ?? ''

  try {
    const settings = await queryCollectionFromFirebase('settings')
    if (settings.length > 0 && settings[0].admin) {
      username = settings[0].admin.username || username
      password = settings[0].admin.password || password
    }
  } catch (error) {
    console.error('[Auth] Failed to fetch credentials from Firestore:', error)
  }

  return { username, password }
}

/**
 * Validates admin credentials using constant-time comparison
 */
export async function validateCredentials(username: string, password: string): Promise<boolean> {
  const { username: storedUser, password: storedPass } = await getCredentials()

  if (!storedUser || !storedPass) {
    console.error('[Auth] ADMIN_USERNAME or ADMIN_PASSWORD env vars are not set.')
    return false
  }

  try {
    const userBuf     = Buffer.alloc(256)
    const storedBuf   = Buffer.alloc(256)
    const passBuf     = Buffer.alloc(256)
    const storedPBuf  = Buffer.alloc(256)

    userBuf.write(username)
    storedBuf.write(storedUser)
    passBuf.write(password)
    storedPBuf.write(storedPass)

    const userMatch = timingSafeEqual(userBuf, storedBuf)
    const passMatch = timingSafeEqual(passBuf, storedPBuf)

    return userMatch && passMatch
  } catch {
    return false
  }
}

/**
 * Simple JWT-like token implementation (HMAC-SHA256)
 * We use this instead of a heavy library to keep dependencies low
 */
export async function signToken(payload: object): Promise<string> {
  const { password: secret } = await getCredentials()
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) })).toString('base64url')
  
  const hmac = createHmac('sha256', secret)
  hmac.update(`${header}.${data}`)
  const signature = hmac.digest('base64url')
  
  return `${header}.${data}.${signature}`
}

// Synchronous version for middleware or quick checks (uses env vars only)
function getCredentialsSync() {
  return {
    username: process.env.ADMIN_USERNAME ?? '',
    password: process.env.ADMIN_PASSWORD ?? '',
  }
}

export function verifyToken(token: string): boolean {
  const { password: secret } = getCredentialsSync()
  const parts = token.split('.')
  if (parts.length !== 3) return false

  const [header, data, signature] = parts
  const hmac = createHmac('sha256', secret)
  hmac.update(`${header}.${data}`)
  const expectedSignature = hmac.digest('base64url')

  if (signature !== expectedSignature) return false

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (payload.exp && Date.now() / 1000 > payload.exp) return false
    return true
  } catch {
    return false
  }
}
