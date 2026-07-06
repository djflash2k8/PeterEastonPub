'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TestLoginPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Login Button Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-semibold">Test Different Navigation Methods:</h2>
          
          {/* Method 1: Next.js Link */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Method 1: Next.js Link Component</h3>
            <Link 
              href="/admin/login" 
              className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go to Login (Link)
            </Link>
          </div>
          
          {/* Method 2: Window.location */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Method 2: Window.location</h3>
            <button 
              onClick={() => window.location.href = '/admin/login'}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Go to Login (window.location)
            </button>
          </div>
          
          {/* Method 3: Router.push */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Method 3: Router.push</h3>
            <button 
              onClick={() => {
                router.push('/admin/login')
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Go to Login (router.push)
            </button>
          </div>
          
          {/* Method 4: Direct HTML link */}
          <div className="border rounded p-4">
            <h3 className="font-medium mb-2">Method 4: HTML Anchor Tag</h3>
            <a 
              href="/admin/login" 
              className="inline-block px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Go to Login (anchor tag)
            </a>
          </div>
        </div>
        
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-2">Debugging Info:</h2>
          <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
          <p>User Agent: {typeof window !== 'undefined' ? navigator.userAgent : 'Loading...'}</p>
          <button 
            onClick={() => alert('JavaScript is working!')}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Test JavaScript
          </button>
        </div>
      </div>
    </div>
  )
}
