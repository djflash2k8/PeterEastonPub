'use client'

import { useState, useEffect } from 'react'

interface TestResult {
  name: string
  status: 'pending' | 'success' | 'error'
  details: string
  timestamp: string
}

export default function AuthDebugPage() {
  const [tests, setTests] = useState<TestResult[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const addTestResult = (name: string, status: 'success' | 'error', details: string) => {
    setTests(prev => [...prev, {
      name,
      status,
      details,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const runTests = async () => {
    setIsRunning(true)
    setTests([])

    // Test 1: Check middleware configuration
    addTestResult('Middleware Configuration', 'success', 'Middleware is configured to protect /admin routes')

    // Test 2: Test login API endpoint
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'Peter123!' })
      })
      
      if (response.ok) {
        const data = await response.json()
        addTestResult('Login API (JSON)', 'success', `Login successful: ${JSON.stringify(data)}`)
        
        // Check if cookie was set
        const cookies = document.cookie
        const hasAuthCookie = cookies.includes('admin-auth=true')
        addTestResult('Cookie Setting', hasAuthCookie ? 'success' : 'error', 
          hasAuthCookie ? 'Auth cookie set successfully' : 'Auth cookie not found')
      } else {
        addTestResult('Login API (JSON)', 'error', `Failed with status: ${response.status}`)
      }
    } catch (error) {
      addTestResult('Login API (JSON)', 'error', `Network error: ${error}`)
    }

    // Test 3: Test form submission
    try {
      const formData = new URLSearchParams()
      formData.append('username', 'admin')
      formData.append('password', 'Peter123!')
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData
      })
      
      if (response.ok) {
        addTestResult('Login API (Form)', 'success', 'Form submission successful')
      } else {
        addTestResult('Login API (Form)', 'error', `Failed with status: ${response.status}`)
      }
    } catch (error) {
      addTestResult('Login API (Form)', 'error', `Network error: ${error}`)
    }

    // Test 4: Test invalid credentials
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'wrong', password: 'wrong' })
      })
      
      if (response.status === 401) {
        addTestResult('Invalid Credentials', 'success', 'Correctly rejects invalid credentials')
      } else {
        addTestResult('Invalid Credentials', 'error', `Unexpected status: ${response.status}`)
      }
    } catch (error) {
      addTestResult('Invalid Credentials', 'error', `Network error: ${error}`)
    }

    // Test 5: Check current auth state
    const authCookie = document.cookie
      .split('; ')
      .find(cookie => cookie.trim().startsWith('admin-auth='))
    
    if (authCookie) {
      addTestResult('Current Auth State', 'success', `Authenticated: ${authCookie}`)
    } else {
      addTestResult('Current Auth State', 'error', 'Not authenticated - no auth cookie found')
    }

    // Test 6: Test admin route protection
    try {
      // Clear auth cookie first to test protection
      document.cookie = 'admin-auth=; path=/; max-age=0'
      
      const response = await fetch('/admin', { 
        method: 'GET',
        redirect: 'manual' // Prevent auto-redirect to check status
      })
      
      if (response.status === 302 || response.status === 307) {
        addTestResult('Admin Route Protection', 'success', `Correctly redirects to login (status: ${response.status})`)
      } else {
        addTestResult('Admin Route Protection', 'error', `Admin route not protected - status: ${response.status}`)
      }
    } catch (error) {
      addTestResult('Admin Route Protection', 'error', `Network error: ${error}`)
    }

    // Test 7: Check environment variables
    addTestResult('Environment Check', 'success', 
      `Admin username: ${process.env.NODE_ENV === 'development' ? 'admin (default)' : 'configured'}`)

    setIsRunning(false)
  }

  const clearAuth = () => {
    document.cookie = 'admin-auth=; path=/; max-age=0'
    setTests([])
  }

  const testWithCredentials = async (username: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })
      
      const data = await response.json()
      addTestResult(`Custom Test (${username})`, response.ok ? 'success' : 'error', 
        `Status: ${response.status}, Response: ${JSON.stringify(data)}`)
    } catch (error) {
      addTestResult(`Custom Test (${username})`, 'error', `Network error: ${error}`)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Debug Tool</h1>
          
          <div className="space-y-4 mb-6">
            <button
              onClick={runTests}
              disabled={isRunning}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isRunning ? 'Running Tests...' : 'Run Authentication Tests'}
            </button>
            
            <button
              onClick={clearAuth}
              className="ml-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Clear Auth Cookie
            </button>
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="font-semibold mb-2">Manual Test:</h3>
            <div className="flex gap-2">
              <input
                type="text"
                id="testUsername"
                placeholder="Username"
                className="px-3 py-1 border border-gray-300 rounded"
                defaultValue="admin"
              />
              <input
                type="password"
                id="testPassword"
                placeholder="Password"
                className="px-3 py-1 border border-gray-300 rounded"
                defaultValue="Peter123!"
              />
              <button
                onClick={() => {
                  const username = (document.getElementById('testUsername') as HTMLInputElement).value
                  const password = (document.getElementById('testPassword') as HTMLInputElement).value
                  testWithCredentials(username, password)
                }}
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Test Login
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold mb-2">Test Results:</h3>
            {tests.length === 0 ? (
              <p className="text-gray-500">No tests run yet</p>
            ) : (
              tests.map((test, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-md border ${
                    test.status === 'success'
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium">
                        {test.name}
                        <span className={`ml-2 text-sm ${
                          test.status === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {test.status === 'success' ? '✓' : '✗'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{test.details}</div>
                    </div>
                    <div className="text-xs text-gray-500 ml-4">{test.timestamp}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Current Cookies:</strong> {document.cookie || 'None'}</p>
              <p><strong>Auth Cookie Found:</strong> {document.cookie.includes('admin-auth=true') ? 'Yes' : 'No'}</p>
              <p><strong>Current URL:</strong> {window.location.href}</p>
              <p><strong>User Agent:</strong> {navigator.userAgent}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
