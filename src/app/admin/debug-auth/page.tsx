'use client'

import { useState } from 'react'
import { useEffect } from 'react'

type TestResult = {
  success: boolean
  status?: number
  statusText?: string
  headers?: Record<string, string>
  dataPreview?: string
  error?: string
  type?: string
}

type LoginResult = TestResult & {
  data?: any
  hasSetCookie?: boolean
}

type CookieResult = {
  hasAdminCookie: boolean
  adminCookieValue: string | null
  allCookies: { name: string; value: string }[]
  cookieString: string
}

type AdminResult = {
  status: number
  statusText: string
  redirected: boolean
  type: ResponseType
  url: string
  contentPreview: string
}

type MiddlewareResult = {
  tests: Array<{
    name: string
    url: string
    status?: number
    expected?: number
    passed: boolean
    error?: string
  }>
  allPassed: boolean
}

export default function DebugAuthPage() {
  const [testResults, setTestResults] = useState<{
    connectivity: TestResult | null
    login: LoginResult | null
    cookies: CookieResult | null
    admin: AdminResult | null
    middleware: MiddlewareResult | null
  }>({
    connectivity: null,
    login: null,
    cookies: null,
    admin: null,
    middleware: null
  })
  
  const [completedTests, setCompletedTests] = useState(0)

  useEffect(() => {
    updateProgress()
  }, [testResults])

  function updateProgress() {
    const completed = Object.values(testResults).filter(r => r !== null).length
    setCompletedTests(completed)
  }

  async function testConnectivity() {
    try {
      const response = await fetch('/api/events', {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      
      const data = await response.json()
      
      const result = {
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        dataPreview: JSON.stringify(data).substring(0, 200)
      }
      
      setTestResults(prev => ({ ...prev, connectivity: result }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        connectivity: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          type: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      }))
    }
  }

  async function testLoginAPI() {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin',
          password: 'Peter123!'
        })
      })
      
      const data = await response.json()
      
      const responseHeaders: Record<string, string> = {}
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value
      })
      
      const result = {
        success: response.ok && data.success,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data: data,
        hasSetCookie: !!responseHeaders['set-cookie']
      }
      
      setTestResults(prev => ({ ...prev, login: result }))
      
      // Auto-test cookies after successful login
      if (response.ok && data.success) {
        setTimeout(analyzeCookies, 1000)
      }
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        login: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
          type: error instanceof Error ? error.constructor.name : 'Unknown'
        }
      }))
    }
  }

  function analyzeCookies() {
    const allCookies = document.cookie
    const cookies = allCookies ? allCookies.split('; ').map(cookie => {
      const [name, value] = cookie.split('=')
      return { name: name?.trim(), value: value?.trim() }
    }) : []
    
    const adminCookie = cookies.find(c => c.name === 'admin-auth')
    
    const result = {
      hasAdminCookie: !!adminCookie,
      adminCookieValue: adminCookie?.value || null,
      allCookies: cookies,
      cookieString: allCookies
    }
    
    setTestResults(prev => ({ ...prev, cookies: result }))
  }

  async function testAdminAccess() {
    try {
      const response = await fetch('/admin', {
        method: 'GET',
        credentials: 'include',
        redirect: 'manual'
      })
      
      const text = await response.text()
      
      const result = {
        status: response.status,
        statusText: response.statusText,
        redirected: response.redirected,
        type: response.type,
        url: response.url,
        contentPreview: text.substring(0, 500)
      }
      
      setTestResults(prev => ({ ...prev, admin: result }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        admin: {
          status: 0,
          statusText: 'Error',
          redirected: false,
          type: 'error',
          url: '',
          contentPreview: `Error: ${error instanceof Error ? error.message : String(error)}`
        }
      }))
    }
  }

  async function testMiddleware() {
    try {
      const tests = [
        { name: 'API without auth', url: '/api/events', expectedStatus: 200 },
        { name: 'Admin without auth', url: '/admin', expectedStatus: 302 },
        { name: 'Admin login page', url: '/admin/login', expectedStatus: 200 }
      ]
      
      const results: Array<{
        name: string
        url: string
        status?: number
        expected?: number
        passed: boolean
        error?: string
      }> = []
      
      for (const test of tests) {
        try {
          const response = await fetch(test.url, {
            method: 'GET',
            credentials: 'include',
            redirect: 'manual'
          })
          
          results.push({
            name: test.name,
            url: test.url,
            status: response.status,
            expected: test.expectedStatus,
            passed: response.status === test.expectedStatus
          })
        } catch (error) {
          results.push({
            name: test.name,
            url: test.url,
            error: error instanceof Error ? error.message : String(error),
            passed: false
          })
        }
      }
      
      setTestResults(prev => ({ 
        ...prev, 
        middleware: {
          tests: results,
          allPassed: results.every(r => r.passed)
        }
      }))
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        middleware: {
          tests: [],
          allPassed: false
        }
      }))
    }
  }

  async function runAllTests() {
    clearAll()
    
    await testConnectivity()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testLoginAPI()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    analyzeCookies()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testAdminAccess()
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    await testMiddleware()
  }

  function clearAll() {
    // Clear cookies
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    })
    
    // Reset test results
    setTestResults({
      connectivity: null,
      login: null,
      cookies: null,
      admin: null,
      middleware: null
    })
  }

  function generateReport() {
    const diagnosis = generateDiagnosis()
    const recommendations = generateRecommendations()
    
    return `
=== COMPREHENSIVE AUTHENTICATION DIAGNOSTIC REPORT ===
Generated: ${new Date().toISOString()}

OVERALL STATUS:
${completedTests}/5 tests completed

DETAILED RESULTS:

1. CONNECTIVITY: ${testResults.connectivity ? (testResults.connectivity.success ? 'PASS' : 'FAIL') : 'NOT TESTED'}
   ${testResults.connectivity ? JSON.stringify(testResults.connectivity, null, 2) : 'No data'}

2. LOGIN API: ${testResults.login ? (testResults.login.success ? 'PASS' : 'FAIL') : 'NOT TESTED'}
   ${testResults.login ? JSON.stringify(testResults.login, null, 2) : 'No data'}

3. COOKIES: ${testResults.cookies ? (testResults.cookies.hasAdminCookie ? 'PASS' : 'FAIL') : 'NOT TESTED'}
   ${testResults.cookies ? JSON.stringify(testResults.cookies, null, 2) : 'No data'}

4. ADMIN ACCESS: ${testResults.admin ? (testResults.admin.status === 200 ? 'PASS' : 'FAIL') : 'NOT TESTED'}
   ${testResults.admin ? JSON.stringify(testResults.admin, null, 2) : 'No data'}

5. MIDDLEWARE: ${testResults.middleware ? (testResults.middleware.allPassed ? 'PASS' : 'FAIL') : 'NOT TESTED'}
   ${testResults.middleware ? JSON.stringify(testResults.middleware, null, 2) : 'No data'}

DIAGNOSIS:
${diagnosis}

RECOMMENDATIONS:
${recommendations}
    `
  }

  function generateDiagnosis() {
    if (completedTests < 5) {
      return 'Incomplete testing - run all tests for full diagnosis'
    }
    
    if (!testResults.connectivity?.success) {
      return 'Server connectivity issues - check if development server is running'
    }
    
    if (!testResults.login?.success) {
      return 'Login API not working - check credentials and API endpoint'
    }
    
    if (!testResults.cookies?.hasAdminCookie) {
      return 'Cookie not being set - check cookie configuration in login API'
    }
    
    if (testResults.admin?.status !== 200) {
      return 'Admin access blocked - check middleware authentication logic'
    }
    
    if (!testResults.middleware?.allPassed) {
      return 'Middleware issues - check authentication flow'
    }
    
    return 'All tests passed - authentication should be working'
  }

  function generateRecommendations() {
    const recommendations = []
    
    if (!testResults.connectivity?.success) {
      recommendations.push('1. Ensure development server is running on localhost:3000')
      recommendations.push('2. Check for any server errors in the terminal')
    }
    
    if (!testResults.login?.success) {
      recommendations.push('3. Verify admin credentials are correct')
      recommendations.push('4. Check login API endpoint for errors')
      recommendations.push('5. Ensure environment variables are set correctly')
    }
    
    if (!testResults.cookies?.hasAdminCookie) {
      recommendations.push('6. Check cookie settings in login API response')
      recommendations.push('7. Verify cookie domain and path settings')
      recommendations.push('8. Check browser cookie settings')
    }
    
    if (testResults.admin?.status !== 200) {
      recommendations.push('9. Check middleware authentication logic')
      recommendations.push('10. Verify cookie reading in middleware')
      recommendations.push('11. Check admin layout authentication check')
    }
    
    if (!testResults.middleware?.allPassed) {
      recommendations.push('12. Review middleware configuration')
      recommendations.push('13. Check route matching in middleware')
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Authentication appears to be working correctly')
      recommendations.push('If still experiencing issues, check browser console for JavaScript errors')
    }
    
    return recommendations.join('\n')
  }

  const progress = (completedTests / 5) * 100

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">Comprehensive Authentication Test Suite</h1>
        <p className="mb-6 text-gray-600">This tool will systematically test every aspect of the authentication flow to identify exactly where the issue occurs.</p>
        
        <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
          <div 
            className="bg-blue-600 h-6 rounded-full transition-all duration-300 flex items-center justify-center text-white text-sm font-medium"
            style={{ width: `${progress}%` }}
          >
            {completedTests}/5 tests
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            <div className="space-y-3">
              <button 
                onClick={testConnectivity}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Test Server Connectivity
              </button>
              <button 
                onClick={testLoginAPI}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Test Login API
              </button>
              <button 
                onClick={analyzeCookies}
                className="w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
              >
                Analyze Cookies
              </button>
              <button 
                onClick={testAdminAccess}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 transition-colors"
              >
                Test Admin Access
              </button>
              <button 
                onClick={testMiddleware}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors"
              >
                Test Middleware
              </button>
              <div className="pt-4 border-t space-y-3">
                <button 
                  onClick={runAllTests}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded hover:bg-indigo-700 transition-colors font-semibold"
                >
                  Run All Tests Automatically
                </button>
                <button 
                  onClick={clearAll}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Clear All Results
                </button>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            <div className="space-y-4">
              {testResults.connectivity && (
                <div className={`p-3 rounded ${testResults.connectivity.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <strong>Connectivity:</strong> {testResults.connectivity.success ? 'PASS' : 'FAIL'}
                  <pre className="text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(testResults.connectivity, null, 2)}</pre>
                </div>
              )}
              
              {testResults.login && (
                <div className={`p-3 rounded ${testResults.login.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <strong>Login API:</strong> {testResults.login.success ? 'PASS' : 'FAIL'}
                  <pre className="text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(testResults.login, null, 2)}</pre>
                </div>
              )}
              
              {testResults.cookies && (
                <div className={`p-3 rounded ${testResults.cookies.hasAdminCookie ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  <strong>Cookies:</strong> {testResults.cookies.hasAdminCookie ? 'PASS' : 'FAIL'}
                  <pre className="text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(testResults.cookies, null, 2)}</pre>
                </div>
              )}
              
              {testResults.admin && (
                <div className={`p-3 rounded ${testResults.admin.status === 200 ? 'bg-green-100 text-green-800' : testResults.admin.status === 302 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                  <strong>Admin Access:</strong> {testResults.admin.status === 200 ? 'PASS' : testResults.admin.status === 302 ? 'REDIRECT' : 'FAIL'}
                  <pre className="text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(testResults.admin, null, 2)}</pre>
                </div>
              )}
              
              {testResults.middleware && (
                <div className={`p-3 rounded ${testResults.middleware.allPassed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  <strong>Middleware:</strong> {testResults.middleware.allPassed ? 'PASS' : 'FAIL'}
                  <pre className="text-xs mt-1 whitespace-pre-wrap">{JSON.stringify(testResults.middleware, null, 2)}</pre>
                </div>
              )}
              
              {!testResults.connectivity && !testResults.login && !testResults.cookies && !testResults.admin && !testResults.middleware && (
                <p className="text-gray-500 text-center py-8">No tests run yet. Click a test button above to start.</p>
              )}
            </div>
          </div>
        </div>
        
        {completedTests === 5 && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Diagnostic Report</h2>
            <pre className="text-xs bg-gray-100 p-4 rounded whitespace-pre-wrap overflow-auto max-h-96">
              {generateReport()}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
