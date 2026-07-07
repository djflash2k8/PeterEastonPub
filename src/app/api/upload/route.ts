import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import path from 'path'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
const MAX_FILENAME_LENGTH = 200

// Magic bytes for allowed image types
const MAGIC_BYTES: Record<string, number[][]> = {
  'image/jpeg': [[0xff, 0xd8, 0xff]],
  'image/png':  [[0x89, 0x50, 0x4e, 0x47]],
  'image/gif':  [[0x47, 0x49, 0x46, 0x38]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF header
}

function verifyMagicBytes(buffer: Buffer, mimeType: string): boolean {
  const signatures = MAGIC_BYTES[mimeType]
  if (!signatures) return false
  return signatures.some(sig =>
    sig.every((byte, i) => buffer[i] === byte)
  )
}

function validateFile(file: File): { isValid: boolean; error?: string } {
  if (file.size > MAX_FILE_SIZE)
    return { isValid: false, error: `File exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit.` }

  if (!ALLOWED_MIME_TYPES.includes(file.type))
    return { isValid: false, error: `File type "${file.type}" is not allowed.` }

  const name = file.name
  if (!name || name.length > MAX_FILENAME_LENGTH)
    return { isValid: false, error: 'Filename is missing or too long.' }

  if (name.includes('..') || name.includes('/') || name.includes('\\'))
    return { isValid: false, error: 'Filename contains invalid characters.' }

  return { isValid: true }
}

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/\.\./g, '_')
    .substring(0, MAX_FILENAME_LENGTH)
}

export async function POST(request: Request) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const cookieStore = cookies()
  if (cookieStore.get('admin-auth')?.value !== 'true') {
    return NextResponse.json({ error: 'Unauthorised.' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 })
    }

    // ── MIME type + filename validation ───────────────────────────────────
    const validation = validateFile(file)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // ── Magic-byte verification (prevents MIME spoofing) ──────────────────
    if (!verifyMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: 'File content does not match its declared type.' },
        { status: 400 }
      )
    }

    // ── Cloudinary upload (persistent, no local filesystem) ───────────────
    const cloudName  = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey     = process.env.CLOUDINARY_API_KEY
    const apiSecret  = process.env.CLOUDINARY_API_SECRET

    if (cloudName && apiKey && apiSecret) {
      const { v2: cloudinary } = await import('cloudinary')
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret })

      const base64 = `data:${file.type};base64,${buffer.toString('base64')}`
      const result = await cloudinary.uploader.upload(base64, {
        folder: 'peter-easton-pub',
        resource_type: 'image',
      })

      return NextResponse.json({
        url:      result.secure_url,
        fileName: result.public_id,
        size:     file.size,
        type:     file.type,
      })
    }

    // ── Fallback: local filesystem (development only) ─────────────────────
    const { mkdir, writeFile } = await import('fs/promises')
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })

    const safeName    = sanitizeFileName(file.name)
    const uniqueName  = `${randomUUID()}-${safeName}`
    const filePath    = path.join(uploadDir, uniqueName)
    await writeFile(filePath, buffer)

    return NextResponse.json({
      url:      `/uploads/${uniqueName}`,
      fileName: uniqueName,
      size:     file.size,
      type:     file.type,
    })
  } catch {
    return NextResponse.json({ error: 'Upload failed.' }, { status: 500 })
  }
}
