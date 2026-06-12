'use client'

import { useState, useEffect } from 'react'

export default function TestNavigationPage() {
  const [cookies, setCookies] = useState('')
  const [authStatus, setAuthStatus] = useState('Unknown')
  const [testResults, setTestResults] = useState<string[]>([])

  useEffect(() => {
    // Check current cookies
    setCookies(document.cookie)
    
    // Check auth status
    const authCookie = document.cookie
      .split('; ')
      .find(cookie => cookie.trim().startsWith('admin-auth='))
    
    setAuthStatus(authCookie ? 'Authenticated' : 'Not Authenticated')
  }, [])

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`])
  }

  const testDirectNavigation = () => {
    addTestResult('Testing direct window.location navigation...')
    try {
      window.location.href = '/admin/login'
      addTestResult('✓ Direct navigation successful')
    } catch (error) {
      addTestResult(`✗ Direct navigation failed: ${error}`)
    }
  }

  const testRouterNavigation = async () => {
    addTestResult('Testing Next.js router navigation...')
    try {
      window.location.href = '/admin/login'
      addTestResult('✓ Router navigation successful')
    } catch (error) {
      addTestResult(`✗ Router navigation failed: ${error}`)
    }
  }

  const testLinkNavigation = () => {
    addTestResult('Testing Link component navigation...')
    try {
      const link = document.createElement('a')
      link.href = '/admin/login'
      link.click()
      addTestResult('✓ Link navigation successful')
    } catch (error) {
      addTestResult(`✗ Link navigation failed: ${error}`)
    }
  }

  const clearAuth = () => {
    addTestResult('Clearing authentication...')
    document.cookie = 'admin-auth=; path=/; max-age=0'
    document.cookie = 'admin-auth=; path=/admin; max-age=0'
    setCookies(document.cookie)
    setAuthStatus('Not Authenticated')
    addTestResult('✓ Authentication cleared')
  }

  const setAuth = () => {
    addTestResult('Setting authentication...')
    document.cookie = 'admin-auth=true; path=/; max-age=3600'
    setCookies(document.cookie)
    setAuthStatus('Authenticated')
    addTestResult('✓ Authentication set')
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Navigation Debug Tool</h1>
        
        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="font-semibold mb-2">Current State:</h2>
          <p><strong>Cookies:</strong> {cookies || 'None'}</p>
          <p><strong>Auth Status:</strong> {authStatus}</p>
        </div>

        <div className="space-y-4 mb-6">
          <h2 className="font-semibold">Test Navigation Methods:</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={testDirectNavigation}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test Direct Navigation
            </button>
            <button
              onClick={testRouterNavigation}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Test Router Navigation
            </button>
            <button
              onClick={testLinkNavigation}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test Link Navigation
            </button>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <h2 className="font-semibold">Authentication Controls:</h2>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={clearAuth}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Clear Auth
            </button>
            <button
              onClick={setAuth}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Set Auth
            </button>
          </div>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Test Results:</h2>
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet</p>
            ) : (
              testResults.map((result, index) => (
                <p key={index} className="text-sm">{result}</p>
              ))
            )}
          </div>
        </div>

        <div className="mt-6">
          <a href="/admin" className="text-blue-600 hover:text-blue-800 underline">
            ← Back to Admin
          </a>
        </div>
      </div>
    </div>
  )
}
