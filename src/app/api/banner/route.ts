import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

const bannerFile = path.join(process.cwd(), 'src/lib/banner.json')
const uploadDir = path.join(process.cwd(), 'public/uploads')

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Default banner data
const defaultBanner = {
  url: '/images/banner01.jpg'
}

// Ensure banner file exists
if (!fs.existsSync(bannerFile)) {
  fs.writeFileSync(bannerFile, JSON.stringify(defaultBanner, null, 2))
}

export async function GET() {
  try {
    const data = fs.readFileSync(bannerFile, 'utf8')
    const banner = JSON.parse(data)
    return NextResponse.json(banner)
  } catch (error) {
    return NextResponse.json(defaultBanner)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const url = formData.get('url') as string | null

    let bannerUrl = url

    // Handle file upload if provided
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `banner-${Date.now()}.${file.name.split('.').pop()}`
      const filePath = path.join(uploadDir, fileName)
      await writeFile(filePath, buffer)
      bannerUrl = `/uploads/${fileName}`
    }

    // Read current banner data
    const data = fs.readFileSync(bannerFile, 'utf8')
    const banner = JSON.parse(data)
    
    // Update banner URL
    if (bannerUrl) {
      banner.url = bannerUrl
      fs.writeFileSync(bannerFile, JSON.stringify(banner, null, 2))
      return NextResponse.json({ message: 'Banner updated successfully', banner })
    }

    return NextResponse.json({ error: 'No file or URL provided' }, { status: 400 })
  } catch (error) {
    console.error('Banner update error:', error)
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 })
  }
}
