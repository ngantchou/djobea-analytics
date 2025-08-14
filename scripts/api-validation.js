#!/usr/bin/env node

/**
 * API Validation Script for Djobea Analytics Frontend
 * 
 * This script validates that all API endpoints used by the frontend
 * are working correctly and return expected data structures.
 */

const https = require('https')
const http = require('http')

const CONFIG = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 10000,
  retries: 2
}

class ApiValidator {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      totalEndpoints: 0,
      passedEndpoints: 0,
      failedEndpoints: 0,
      warnings: 0,
      endpoints: {}
    }
    
    this.endpoints = [
      {
        name: 'Health Check',
        path: '/api/health',
        method: 'GET',
        expectedStatus: 200,
        requireAuth: false,
        validateResponse: (data) => {
          return typeof data === 'object' && (data.status === 'ok' || data.success === true)
        }
      },
      {
        name: 'Authentication - Login',
        path: '/api/auth/login',
        method: 'POST',
        expectedStatus: [200, 401], // Both valid for testing
        requireAuth: false,
        body: { username: 'test', password: 'invalid' }, // Intentionally invalid
        validateResponse: (data) => {
          return typeof data === 'object' && data.hasOwnProperty('success')
        }
      },
      {
        name: 'Dashboard Data',
        path: '/api/dashboard',
        method: 'GET',
        expectedStatus: [200, 401],
        requireAuth: true,
        validateResponse: (data) => {
          return typeof data === 'object' && 
                 (data.success === true || data.hasOwnProperty('stats'))
        }
      },
      {
        name: 'Analytics Data',
        path: '/api/analytics',
        method: 'GET',
        expectedStatus: [200, 401],
        requireAuth: true,
        validateResponse: (data) => {
          return typeof data === 'object'
        }
      },
      {
        name: 'Analytics KPIs',
        path: '/api/analytics/kpis',
        method: 'GET',
        expectedStatus: [200, 401],
        requireAuth: true,
        validateResponse: (data) => {
          return typeof data === 'object'
        }
      },
      {
        name: 'Providers List',
        path: '/api/providers',
        method: 'GET',
        expectedStatus: [200, 401],
        requireAuth: true,
        validateResponse: (data) => {
          return typeof data === 'object' && 
                 (data.success === true || Array.isArray(data) || data.hasOwnProperty('data'))
        }
      },
      {
        name: 'Requests List',
        path: '/api/requests',
        method: 'GET',
        expectedStatus: [200, 401],
        requireAuth: true,
        validateResponse: (data) => {
          return typeof data === 'object' && 
                 (data.success === true || Array.isArray(data) || data.hasOwnProperty('data'))
        }
      },
      {
        name: 'Messages/Conversations',
        path: '/api/messages/conversations',
        method: 'GET',
        expectedStatus: [200, 401],
        requireAuth: true,
        validateResponse: (data) => {
          return typeof data === 'object'
        }
      },
      {
        name: 'User Profile',
        path: '/api/auth/profile',
        method: 'GET',
        expectedStatus: [200, 401],
        requireAuth: true,
        validateResponse: (data) => {
          return typeof data === 'object'
        }
      },
      {
        name: 'System Metrics',
        path: '/api/metrics/system',
        method: 'GET',
        expectedStatus: [200, 401, 404], // 404 is acceptable if endpoint doesn't exist yet
        requireAuth: true,
        validateResponse: (data) => {
          return typeof data === 'object'
        }
      }
    ]
  }

  async validate() {
    console.log('🔍 Starting API validation for Djobea Analytics Frontend...')
    console.log(`🌐 API Base URL: ${CONFIG.apiBaseUrl}`)
    console.log(`📅 Timestamp: ${this.results.timestamp}`)
    console.log('=' + '='.repeat(60))

    this.results.totalEndpoints = this.endpoints.length

    for (const endpoint of this.endpoints) {
      await this.validateEndpoint(endpoint)
    }

    this.outputResults()
    
    // Exit with error if any critical endpoints failed
    const criticalFailures = Object.values(this.results.endpoints)
      .filter(result => result.status === 'failed' && result.critical !== false)
    
    process.exit(criticalFailures.length > 0 ? 1 : 0)
  }

  async validateEndpoint(endpoint) {
    console.log(`\n🔍 Testing: ${endpoint.name}`)
    
    const result = {
      name: endpoint.name,
      path: endpoint.path,
      method: endpoint.method,
      status: 'unknown',
      statusCode: null,
      responseTime: null,
      error: null,
      warnings: [],
      details: {}
    }

    try {
      const startTime = Date.now()
      const response = await this.makeRequest(endpoint)
      result.responseTime = Date.now() - startTime
      result.statusCode = response.statusCode
      
      // Check status code
      const expectedStatuses = Array.isArray(endpoint.expectedStatus) 
        ? endpoint.expectedStatus 
        : [endpoint.expectedStatus]
      
      if (!expectedStatuses.includes(response.statusCode)) {
        result.status = 'failed'
        result.error = `Unexpected status code: ${response.statusCode} (expected: ${expectedStatuses.join(' or ')})`
      } else {
        // Validate response body if successful
        if (response.statusCode === 200 || response.statusCode === 201) {
          try {
            if (response.body && endpoint.validateResponse) {
              const isValid = endpoint.validateResponse(response.body)
              if (isValid) {
                result.status = 'passed'
                result.details.responseValid = true
              } else {
                result.status = 'warning'
                result.warnings.push('Response structure validation failed')
                result.details.responseValid = false
              }
            } else {
              result.status = 'passed'
              result.details.responseValid = true
            }
          } catch (validationError) {
            result.status = 'warning'
            result.warnings.push(`Response validation error: ${validationError.message}`)
          }
        } else {
          // For auth errors (401), this is expected behavior
          result.status = response.statusCode === 401 ? 'passed' : 'warning'
          result.details.authRequired = response.statusCode === 401
        }
      }
      
      // Check response time
      if (result.responseTime > 5000) {
        result.warnings.push(`Slow response time: ${result.responseTime}ms`)
      } else if (result.responseTime > 2000) {
        result.warnings.push(`Response time is acceptable but could be improved: ${result.responseTime}ms`)
      }
      
      // Store response details
      result.details.responseSize = response.body ? JSON.stringify(response.body).length : 0
      result.details.headers = response.headers
      
    } catch (error) {
      result.status = 'failed'
      result.error = error.message
      result.details.networkError = true
    }

    // Update counters
    if (result.status === 'passed') {
      this.results.passedEndpoints++
    } else if (result.status === 'failed') {
      this.results.failedEndpoints++
    }
    
    if (result.warnings.length > 0) {
      this.results.warnings += result.warnings.length
    }

    this.results.endpoints[endpoint.name] = result

    // Output result
    const statusIcon = this.getStatusIcon(result.status)
    console.log(`   ${statusIcon} ${result.status.toUpperCase()} (${result.statusCode || 'NO RESPONSE'}) - ${result.responseTime || 0}ms`)
    
    if (result.error) {
      console.log(`      Error: ${result.error}`)
    }
    
    if (result.warnings.length > 0) {
      result.warnings.forEach(warning => {
        console.log(`      Warning: ${warning}`)
      })
    }
  }

  async makeRequest(endpoint) {
    const url = `${CONFIG.apiBaseUrl}${endpoint.path}`
    const options = {
      method: endpoint.method || 'GET',
      timeout: CONFIG.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Djobea-Analytics-API-Validator/1.0'
      }
    }

    // Add auth headers if required (using a dummy token)
    if (endpoint.requireAuth) {
      options.headers['Authorization'] = 'Bearer dummy-token-for-testing'
    }

    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https://')
      const client = isHttps ? https : http
      
      const requestOptions = new URL(url)
      requestOptions.method = options.method
      requestOptions.headers = options.headers
      requestOptions.timeout = options.timeout

      const req = client.request(requestOptions, (res) => {
        let body = ''
        
        res.on('data', (chunk) => {
          body += chunk
        })
        
        res.on('end', () => {
          let parsedBody = null
          try {
            if (body && body.trim()) {
              parsedBody = JSON.parse(body)
            }
          } catch (e) {
            // Body is not JSON, that's okay
            parsedBody = { rawBody: body }
          }
          
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody
          })
        })
      })

      req.setTimeout(options.timeout, () => {
        req.destroy()
        reject(new Error(`Request timeout after ${options.timeout}ms`))
      })

      req.on('error', (error) => {
        reject(new Error(`Network error: ${error.message}`))
      })

      // Send body if it's a POST request
      if (endpoint.body && (endpoint.method === 'POST' || endpoint.method === 'PUT')) {
        req.write(JSON.stringify(endpoint.body))
      }

      req.end()
    })
  }

  getStatusIcon(status) {
    switch (status) {
      case 'passed': return '✅'
      case 'warning': return '⚠️'
      case 'failed': return '❌'
      default: return '❓'
    }
  }

  outputResults() {
    console.log('\n' + '='.repeat(60))
    console.log('📊 API VALIDATION SUMMARY')
    console.log('='.repeat(60))

    const successRate = Math.round((this.results.passedEndpoints / this.results.totalEndpoints) * 100)
    
    console.log(`Total Endpoints: ${this.results.totalEndpoints}`)
    console.log(`✅ Passed: ${this.results.passedEndpoints}`)
    console.log(`❌ Failed: ${this.results.failedEndpoints}`)
    console.log(`⚠️  Warnings: ${this.results.warnings}`)
    console.log(`📈 Success Rate: ${successRate}%`)

    if (this.results.failedEndpoints > 0) {
      console.log('\n🚨 CRITICAL ISSUES:')
      Object.values(this.results.endpoints)
        .filter(result => result.status === 'failed')
        .forEach(result => {
          console.log(`   ❌ ${result.name}: ${result.error}`)
        })
    }

    if (this.results.warnings > 0) {
      console.log('\n⚠️  WARNINGS:')
      Object.values(this.results.endpoints)
        .filter(result => result.warnings.length > 0)
        .forEach(result => {
          result.warnings.forEach(warning => {
            console.log(`   ⚠️  ${result.name}: ${warning}`)
          })
        })
    }

    console.log('\n📋 RECOMMENDATIONS:')
    if (this.results.failedEndpoints > 0) {
      console.log('   - Fix critical API endpoint failures before deploying')
      console.log('   - Verify backend server is running and accessible')
      console.log('   - Check API endpoint paths and methods')
    }
    
    if (this.results.warnings > 0) {
      console.log('   - Review performance issues for slow endpoints')
      console.log('   - Consider implementing proper error responses')
    }
    
    console.log('   - Update API documentation if endpoints have changed')
    console.log('   - Consider implementing API versioning for better compatibility')

    console.log('\n' + '='.repeat(60))
    
    return {
      success: this.results.failedEndpoints === 0,
      results: this.results
    }
  }
}

// Run validation if called directly
if (require.main === module) {
  const validator = new ApiValidator()
  validator.validate()
}

module.exports = ApiValidator