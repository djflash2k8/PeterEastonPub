'use client'

import { useState, useEffect } from 'react'

export default function TestStylingPage() {
  const [result, setResult] = useState<string>('')

  const testStylingAPI = async () => {
    try {
      setResult('Testing GET request...')
      const getResponse = await fetch('/api/global-styling')
      const getData = await getResponse.json()
      setResult(`GET Success: ${JSON.stringify(getData, null, 2)}`)

      setResult(prev => prev + '\n\nTesting POST request...')
      
      const postData = {
        backgroundColor: '#FF0000',
        primaryTextColor: '#00FF00',
        secondaryTextColor: '#0000FF',
        accentTextColor: '#FFFF00',
        altTextColor: '#FF00FF',
        fontFamily: 'Arial, sans-serif',
        fontSize: '18px',
        borderRadius: '12px',
        padding: '20px'
      }

      console.log('Sending POST data:', JSON.stringify(postData, null, 2))
      
      const postResponse = await fetch('/api/global-styling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      const postResult = await postResponse.json()
      setResult(prev => prev + `\n\nPOST Success: ${JSON.stringify(postResult, null, 2)}`)

    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Global Styling API Test</h1>
        
        <button
          onClick={testStylingAPI}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500 transition-colors mb-8"
        >
          Test Styling API
        </button>

        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Results:</h2>
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">
            {result}
          </pre>
        </div>

        <div className="mt-8">
          <a href="/admin/global-styling" className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500 transition-colors">
            Back to Global Styling
          </a>
        </div>
      </div>
    </div>
  )
}
