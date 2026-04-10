'use client'

import { useState, useEffect } from 'react'

export default function Banner() {
  const [bannerUrl, setBannerUrl] = useState('/images/banner01.jpg')

  useEffect(() => {
    fetch('/api/banner')
      .then(res => res.json())
      .then(data => {
        if (data.url) setBannerUrl(data.url)
      })
      .catch(err => console.error('Failed to load banner:', err))
  }, [])

  return (
    <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 xl:h-80 flex items-center justify-center overflow-hidden bg-gray-200">
      <img 
        src={bannerUrl} 
        alt="Peter Easton's Pub Banner" 
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        loading="eager"
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, (max-width: 1024px) 100vw, 100vw"
      />
    </div>
  )
}