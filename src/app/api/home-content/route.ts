import { NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import path from 'path'

const CONTENT_FILE = path.join(process.cwd(), 'data', 'home-content.json')

export async function GET() {
  try {
    const data = await readFile(CONTENT_FILE, 'utf-8')
    const content = JSON.parse(data)
    
    return NextResponse.json(content)
  } catch (error) {
    // Return default values if file doesn't exist
    return NextResponse.json({
      welcomeTitle: 'Welcome to Peter Easton\'s Pub!',
      welcomeDescription: 'Your local destination for great entertainment and good times!',
      aboutTitle: 'About Us',
      aboutContent: 'Located in the heart of St. John\'s, Peter Easton\'s Pub has been serving the community with great food, drinks, and entertainment for years. Join us for a memorable experience!',
      whatWeOfferTitle: 'What We Offer',
      offerings: [
        { title: 'Live Entertainment', description: 'Regular live music performances and special events' },
        { title: 'Great Atmosphere', description: 'Friendly staff and welcoming environment' }
      ],
      tags: ['Live Music', 'Karaoke', 'Open Mic']
    })
  }
}

export async function POST(request: Request) {
  try {
    const {
      welcomeTitle,
      welcomeDescription,
      aboutTitle,
      aboutContent,
      whatWeOfferTitle,
      offerings,
      tags
    } = await request.json()
    
    await writeFile(CONTENT_FILE, JSON.stringify({
      welcomeTitle,
      welcomeDescription,
      aboutTitle,
      aboutContent,
      whatWeOfferTitle,
      offerings,
      tags
    }), 'utf-8')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save content' }, { status: 500 })
  }
}
