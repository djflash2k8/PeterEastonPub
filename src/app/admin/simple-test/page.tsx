'use client'

import { useState } from 'react'

export default function SimpleTestPage() {
  const [result, setResult] = useState<string>('Click to test')

  async function testAPI() {
    setResult('Testing...')
    
    try {
      console.log('Starting fetch test...')
      
      const response = await fetch('/api/events', {
        method: 'GET',
        headers: { 
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        credentials: 'same-origin'
      })
      
      console.log('Response received:', response.status, response.statusText)
      
      const data = await response.json()
      console.log('Data received:', data)
      
      setResult(`SUCCESS: ${response.status} - ${JSON.stringify(data).substring(0, 100)}...`)
    } catch (error) {
      console.error('Fetch error:', error)
      setResult(`ERROR: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Simple API Test</h1>
        
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <button 
            onClick={testAPI}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test API Connection
          </button>
          
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="font-medium mb-2">Result:</h3>
            <pre className="text-sm whitespace-pre-wrap">{result}</pre>
          </div>
          
          <div className="text-sm text-gray-600">
            <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Loading...'}</p>
            <p>Check browser console for detailed logs</p>
          </div>
        </div>
      </div>
    </div>
  )
}
