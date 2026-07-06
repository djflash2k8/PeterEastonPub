import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const navigationFile = path.join(process.cwd(), 'src/lib/frontend-navigation.json')

const defaultNavigation = {
  brandName: "Peter Easton's Pub",
  navigationItems: [
    {
      id: 'home',
      text: 'Home',
      href: '/',
      target: '_self'
    },
    {
      id: 'events',
      text: 'Events',
      href: '/events',
      target: '_self'
    },
    {
      id: 'about',
      text: 'About Us',
      href: '/about-us',
      target: '_self'
    },
    {
      id: 'contact',
      text: 'Contact Us',
      href: '/contact-us',
      target: '_self'
    }
  ]
}

// In-memory storage for production (Vercel serverless)
let inMemoryNavigation: any = null

// Initialize file if it doesn't exist
const initializeFile = async () => {
  try {
    const fs = await import('fs')
    const pathModule = await import('path')
    
    if (!fs.existsSync(pathModule.dirname(navigationFile))) {
      fs.mkdirSync(pathModule.dirname(navigationFile), { recursive: true })
    }

    if (!fs.existsSync(navigationFile)) {
      fs.writeFileSync(navigationFile, JSON.stringify(defaultNavigation, null, 2))
    }
  } catch (error) {
    console.error('Failed to initialize file:', error)
  }
}

// Initialize file
initializeFile()

export async function GET() {
  try {
    let navigation
    
    // In production (Vercel), use in-memory storage
    if (process.env.NODE_ENV === 'production') {
      if (!inMemoryNavigation) {
        // Try to read from file first, then fallback to default
        try {
          const fs = await import('fs')
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
      const fs = await import('fs')
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
    console.error('Error fetching frontend navigation:', error)
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
    const { writeFile } = await import('fs/promises')
    await writeFile(navigationFile, JSON.stringify(data, null, 2))
    
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating frontend navigation:', error)
    return NextResponse.json({ error: 'Failed to update navigation' }, { status: 500 })
  }
}
