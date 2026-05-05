import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { writeFile } from 'fs/promises'

const navigationFile = path.join(process.cwd(), 'src/lib/admin-navigation.json')

const defaultNavigation = {
  adminTitle: 'Peter Easton Admin',
  navigationItems: [
    {
      id: 'dashboard',
      text: 'Dashboard',
      href: '/admin',
      target: '_self'
    },
    {
      id: 'about',
      text: 'About Us',
      href: '/admin/about',
      target: '_self'
    },
    {
      id: 'viewSite',
      text: 'View Site',
      href: '/',
      target: '_blank'
    }
  ]
}

// In-memory storage for production (Vercel serverless)
let inMemoryNavigation: any = null

// Initialize file if it doesn't exist
if (!fs.existsSync(path.dirname(navigationFile))) {
  fs.mkdirSync(path.dirname(navigationFile), { recursive: true })
}

if (!fs.existsSync(navigationFile)) {
  fs.writeFileSync(navigationFile, JSON.stringify(defaultNavigation, null, 2))
}

export async function GET() {
  try {
    let navigation
    
    // In production (Vercel), use in-memory storage
    if (process.env.NODE_ENV === 'production') {
      if (!inMemoryNavigation) {
        // Try to read from file first, then fallback to default
        try {
          if (fs.existsSync(navigationFile)) {
            const fileContent = fs.readFileSync(navigationFile, 'utf-8')
            navigation = JSON.parse(fileContent)
          } else {
            navigation = defaultNavigation
          }
        } catch {
          navigation = defaultNavigation
        }
        inMemoryNavigation = navigation
      } else {
        navigation = inMemoryNavigation
      }
    } else {
      // In development, read from file
      if (fs.existsSync(navigationFile)) {
        const fileContent = fs.readFileSync(navigationFile, 'utf-8')
        navigation = JSON.parse(fileContent)
      } else {
        navigation = defaultNavigation
        fs.writeFileSync(navigationFile, JSON.stringify(defaultNavigation, null, 2))
      }
    }
    
    return NextResponse.json(navigation)
  } catch (error) {
    console.error('Error fetching admin navigation:', error)
    return NextResponse.json(defaultNavigation)
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Update in-memory storage for production
    if (process.env.NODE_ENV === 'production') {
      inMemoryNavigation = data
    }
    
    // Save to file
    await writeFile(navigationFile, JSON.stringify(data, null, 2))
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating admin navigation:', error)
    return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 })
  }
}
