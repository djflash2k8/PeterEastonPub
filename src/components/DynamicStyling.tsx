'use client'

import { useEffect, useState } from 'react'

interface GlobalStyling {
  backgroundColor: string
  primaryTextColor: string
  secondaryTextColor: string
  accentTextColor: string
  altTextColor: string
  fontFamily: string
  fontSize: string
  borderRadius: string
  padding: string
}

export default function DynamicStyling() {
  const [styling, setStyling] = useState<GlobalStyling>({
    backgroundColor: '#36454F',
    primaryTextColor: '#FFD700',
    secondaryTextColor: '#FFD700',
    accentTextColor: '#FFD700',
    altTextColor: '#FFFFFF',
    fontFamily: 'Arial, sans-serif',
    fontSize: '16px',
    borderRadius: '8px',
    padding: '16px'
  })

  useEffect(() => {
    const fetchStyling = async () => {
      try {
        const response = await fetch('/api/global-styling')
        const data = await response.json()
        setStyling(data)
        applyStyling(data)
      } catch (error) {
        console.error('Failed to fetch styling:', error)
      }
    }

    // Only fetch styling if we're not on the login page
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      if (!pathname.includes('/admin/login')) {
        fetchStyling()
        
        // Set up polling for real-time updates (every 5 seconds)
        const interval = setInterval(fetchStyling, 5000)
        
        return () => clearInterval(interval)
      }
    }
  }, [])

  const applyStyling = (stylingData: GlobalStyling) => {
    // Apply styles to document root
    const root = document.documentElement
    
    // Apply CSS custom properties
    root.style.setProperty('--bg-color', stylingData.backgroundColor)
    root.style.setProperty('--primary-text-color', stylingData.primaryTextColor)
    root.style.setProperty('--secondary-text-color', stylingData.secondaryTextColor)
    root.style.setProperty('--accent-text-color', stylingData.accentTextColor)
    root.style.setProperty('--alt-text-color', stylingData.altTextColor)
    root.style.setProperty('--font-family', stylingData.fontFamily)
    root.style.setProperty('--font-size', stylingData.fontSize)
    root.style.setProperty('--border-radius', stylingData.borderRadius)
    root.style.setProperty('--padding', stylingData.padding)

    // Apply styles directly to body
    document.body.style.backgroundColor = stylingData.backgroundColor
    document.body.style.color = stylingData.primaryTextColor
    document.body.style.fontFamily = stylingData.fontFamily
    document.body.style.fontSize = stylingData.fontSize

    // Apply styles to headings
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
    headings.forEach(heading => {
      (heading as HTMLElement).style.color = stylingData.primaryTextColor
    })

    // Apply styles to paragraphs and spans
    const textElements = document.querySelectorAll('p, span, div')
    textElements.forEach(element => {
      (element as HTMLElement).style.color = stylingData.secondaryTextColor
    })

    // Apply styles to links
    const links = document.querySelectorAll('a')
    links.forEach(link => {
      (link as HTMLElement).style.color = stylingData.accentTextColor
    })
  }

  return null // This component doesn't render anything, it just applies styles
}
