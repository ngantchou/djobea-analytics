/**
 * Frontend-Backend Integration Test
 * Tests the conversation API integration
 */

const API_BASE_URL = 'http://localhost:5000'

// Test credentials (use your actual test account)
const TEST_CREDENTIALS = {
    username: 'admin',
    password: 'admin123' // Updated with actual test password
}

let authToken = null

async function authenticateForTesting() {
    try {
        console.log('🔐 Authenticating for testing...')
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(TEST_CREDENTIALS)
        })
        
        if (response.ok) {
            const data = await response.json()
            authToken = data.data?.token
            console.log('✅ Authentication successful')
            return true
        } else {
            console.log('❌ Authentication failed')
            return false
        }
    } catch (error) {
        console.log('❌ Authentication error:', error.message)
        return false
    }
}

async function testIntegration() {
    console.log('🧪 Testing Frontend-Backend Integration...\n')
    
    // First authenticate
    const authenticated = await authenticateForTesting()
    if (!authenticated) {
        console.log('Cannot proceed without authentication. Please check credentials.')
        return
    }
    
    const tests = [
        {
            name: 'API Health Check',
            method: 'GET',
            url: '/api/messages/health',
            expectedStatus: 200,
            requireAuth: false
        },
        {
            name: 'Get Conversations',
            method: 'GET', 
            url: '/api/messages/conversations?page=1&limit=5',
            expectedStatus: 200,
            requireAuth: true
        },
        {
            name: 'Get Conversation Stats',
            method: 'GET',
            url: '/api/messages/stats',
            expectedStatus: 200,
            requireAuth: true
        },
        {
            name: 'Get Unread Count',
            method: 'GET',
            url: '/api/messages/unread-count',
            expectedStatus: 200,
            requireAuth: true
        }
    ]
    
    let passedTests = 0
    let totalTests = tests.length
    
    for (const test of tests) {
        try {
            console.log(`Testing: ${test.name}`)
            
            const headers = {
                'Content-Type': 'application/json'
            }
            
            // Add Bearer token for authenticated endpoints
            if (authToken && test.requireAuth !== false) {
                headers['Authorization'] = `Bearer ${authToken}`
            }
            
            const response = await fetch(`${API_BASE_URL}${test.url}`, {
                method: test.method,
                headers: headers
            })
            
            if (response.status === test.expectedStatus) {
                console.log(`✅ ${test.name}: PASSED`)
                
                if (response.headers.get('content-type')?.includes('application/json')) {
                    const data = await response.json()
                    console.log(`   Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...')
                }
                
                passedTests++
            } else {
                console.log(`❌ ${test.name}: FAILED (HTTP ${response.status})`)
                const errorText = await response.text()
                console.log(`   Error:`, errorText.substring(0, 200))
            }
            
        } catch (error) {
            console.log(`❌ ${test.name}: ERROR`)
            console.log(`   ${error.message}`)
        }
        
        console.log('')
    }
    
    console.log('=' * 50)
    console.log(`Test Results: ${passedTests}/${totalTests} passed`)
    
    if (passedTests === totalTests) {
        console.log('🎉 All tests passed! Integration is working.')
        console.log('\n🚀 Ready to test frontend:')
        console.log('1. Start frontend: npm run dev (in djobea-analytics folder)')
        console.log('2. Visit: http://localhost:3000/messages')
        console.log('3. Test conversation features')
    } else {
        console.log('❌ Some tests failed. Check backend server and API endpoints.')
        console.log('\n🔧 Troubleshooting:')
        console.log('1. Ensure backend is running: python djobea_app.py')
        console.log('2. Check server logs for errors')
        console.log('3. Verify database is accessible')
    }
}

// Run the test
if (typeof window === 'undefined') {
    // Node.js environment - use native fetch (Node 18+)
    testIntegration()
} else {
    // Browser environment
    console.log('Run this script with Node.js: node test-integration.js')
}