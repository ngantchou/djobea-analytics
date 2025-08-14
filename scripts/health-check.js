#!/usr/bin/env node

/**
 * Health Check Script for Djobea Analytics Frontend
 * 
 * This script performs comprehensive health checks on the frontend application
 * to ensure it's ready for production deployment.
 */

const https = require('https')
const http = require('http')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

const CONFIG = {
  // Frontend health check endpoints
  endpoints: [
    { name: 'Health Check', path: '/api/health', timeout: 5000 },
    { name: 'Dashboard API', path: '/api/dashboard', timeout: 10000 },
    { name: 'Analytics API', path: '/api/analytics', timeout: 10000 },
  ],
  
  // Backend API health check
  backendApi: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // Application URLs
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Performance thresholds
  thresholds: {
    responseTime: 2000, // ms
    memoryUsage: 512, // MB
    cpuUsage: 80 // percentage
  }
}

class HealthChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      status: 'unknown',
      checks: {},
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0
      }
    }
  }

  async run() {
    console.log('🏥 Starting health check for Djobea Analytics Frontend...')
    console.log(`📅 Timestamp: ${this.results.timestamp}`)
    console.log('=' + '='.repeat(60))

    try {
      // Run all health checks
      await this.checkEnvironmentVariables()
      await this.checkDependencies()
      await this.checkBackendConnectivity()
      await this.checkBuildStatus()
      await this.checkApplicationEndpoints()
      await this.checkPerformanceMetrics()
      
      // Calculate final status
      this.calculateFinalStatus()
      
      // Output results
      this.outputResults()
      
      // Exit with appropriate code
      process.exit(this.results.status === 'healthy' ? 0 : 1)
      
    } catch (error) {
      console.error('❌ Health check failed:', error.message)
      process.exit(1)
    }
  }

  async checkEnvironmentVariables() {
    console.log('🔧 Checking environment variables...')
    
    const requiredVars = [
      'NODE_ENV',
      'NEXT_PUBLIC_API_URL'
    ]
    
    const optionalVars = [
      'NEXT_PUBLIC_APP_URL'
    ]
    
    const results = {
      status: 'passed',
      message: 'All environment variables are properly set',
      details: {}
    }
    
    // Check required variables
    for (const varName of requiredVars) {
      const value = process.env[varName]
      if (!value) {
        results.status = 'failed'
        results.message = `Missing required environment variable: ${varName}`
        results.details[varName] = 'MISSING'
      } else {
        results.details[varName] = value.length > 50 ? value.substring(0, 47) + '...' : value
      }
    }
    
    // Check optional variables
    for (const varName of optionalVars) {
      const value = process.env[varName]
      results.details[varName] = value || 'NOT SET'
    }
    
    this.results.checks.environmentVariables = results
    this.updateSummary(results.status)
    
    console.log(`   ${this.getStatusIcon(results.status)} ${results.message}`)
  }

  async checkDependencies() {
    console.log('📦 Checking dependencies...')
    
    try {
      const { stdout } = await execAsync('npm list --depth=0 --json', { timeout: 30000 })
      const packageInfo = JSON.parse(stdout)
      
      const results = {
        status: 'passed',
        message: `Dependencies check passed (${Object.keys(packageInfo.dependencies || {}).length} packages)`,
        details: {
          dependencies: Object.keys(packageInfo.dependencies || {}).length,
          devDependencies: Object.keys(packageInfo.devDependencies || {}).length,
          problems: packageInfo.problems || []
        }
      }
      
      if (packageInfo.problems && packageInfo.problems.length > 0) {
        results.status = 'warning'
        results.message = `Dependencies have issues: ${packageInfo.problems.length} problems found`
      }
      
      this.results.checks.dependencies = results
      this.updateSummary(results.status)
      
      console.log(`   ${this.getStatusIcon(results.status)} ${results.message}`)
      
    } catch (error) {
      const results = {
        status: 'failed',
        message: `Failed to check dependencies: ${error.message}`,
        details: { error: error.message }
      }
      
      this.results.checks.dependencies = results
      this.updateSummary(results.status)
      
      console.log(`   ${this.getStatusIcon(results.status)} ${results.message}`)
    }
  }

  async checkBackendConnectivity() {
    console.log('🔗 Checking backend API connectivity...')
    
    const backendUrl = CONFIG.backendApi
    const healthEndpoint = `${backendUrl}/api/health`
    
    try {
      const startTime = Date.now()
      const response = await this.makeHttpRequest(healthEndpoint, { timeout: 10000 })
      const responseTime = Date.now() - startTime
      
      const results = {
        status: 'passed',
        message: `Backend API is reachable (${responseTime}ms)`,
        details: {
          url: backendUrl,
          endpoint: healthEndpoint,
          responseTime: responseTime,
          status: response.statusCode || 'unknown'
        }
      }
      
      if (responseTime > CONFIG.thresholds.responseTime) {
        results.status = 'warning'
        results.message = `Backend API is slow (${responseTime}ms > ${CONFIG.thresholds.responseTime}ms)`
      }
      
      this.results.checks.backendConnectivity = results
      this.updateSummary(results.status)
      
      console.log(`   ${this.getStatusIcon(results.status)} ${results.message}`)
      
    } catch (error) {
      const results = {
        status: 'failed',
        message: `Cannot reach backend API: ${error.message}`,
        details: {
          url: backendUrl,
          endpoint: healthEndpoint,
          error: error.message
        }
      }
      
      this.results.checks.backendConnectivity = results
      this.updateSummary(results.status)
      
      console.log(`   ${this.getStatusIcon(results.status)} ${results.message}`)
    }
  }

  async checkBuildStatus() {
    console.log('🏗️  Checking build status...')
    
    try {
      // Check if .next directory exists
      const { stdout } = await execAsync('ls -la .next 2>/dev/null || dir .next 2>NUL', { timeout: 5000 })
      
      const results = {
        status: 'passed',
        message: 'Build artifacts found',
        details: {
          buildDir: '.next directory exists',
          lastCheck: new Date().toISOString()
        }
      }
      
      this.results.checks.buildStatus = results
      this.updateSummary(results.status)
      
      console.log(`   ${this.getStatusIcon(results.status)} ${results.message}`)
      
    } catch (error) {
      const results = {
        status: 'warning',
        message: 'No build artifacts found - run npm run build',
        details: {
          buildDir: '.next directory not found',
          recommendation: 'Run npm run build before deployment'
        }
      }
      
      this.results.checks.buildStatus = results
      this.updateSummary(results.status)
      
      console.log(`   ${this.getStatusIcon(results.status)} ${results.message}`)
    }
  }

  async checkApplicationEndpoints() {
    console.log('🌐 Checking application endpoints...')
    
    const results = {
      status: 'passed',
      message: 'Application endpoints check passed',
      details: {}
    }
    
    for (const endpoint of CONFIG.endpoints) {
      try {
        const url = `${CONFIG.appUrl}${endpoint.path}`
        const startTime = Date.now()
        const response = await this.makeHttpRequest(url, { timeout: endpoint.timeout })
        const responseTime = Date.now() - startTime
        
        results.details[endpoint.name] = {
          url: url,
          status: 'passed',
          responseTime: responseTime,
          statusCode: response.statusCode
        }
        
        if (responseTime > CONFIG.thresholds.responseTime) {
          results.status = 'warning'
          results.details[endpoint.name].status = 'slow'
        }
        
      } catch (error) {
        results.status = 'failed'
        results.message = `Some endpoints are not responding`
        results.details[endpoint.name] = {
          status: 'failed',
          error: error.message
        }
      }
    }
    
    this.results.checks.applicationEndpoints = results
    this.updateSummary(results.status)
    
    console.log(`   ${this.getStatusIcon(results.status)} ${results.message}`)
  }

  async checkPerformanceMetrics() {
    console.log('⚡ Checking performance metrics...')
    
    const results = {
      status: 'passed',
      message: 'Performance metrics are within acceptable ranges',
      details: {}
    }
    
    try {
      // Check memory usage
      const memoryUsage = process.memoryUsage()
      const memoryUsageMB = Math.round(memoryUsage.heapUsed / 1024 / 1024)
      
      results.details.memory = {
        heapUsed: memoryUsageMB + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        status: memoryUsageMB < CONFIG.thresholds.memoryUsage ? 'good' : 'high'
      }
      
      if (memoryUsageMB > CONFIG.thresholds.memoryUsage) {
        results.status = 'warning'
        results.message = `High memory usage detected: ${memoryUsageMB}MB`
      }
      
      // Add timestamp
      results.details.timestamp = new Date().toISOString()
      
    } catch (error) {
      results.status = 'warning'
      results.message = `Could not check performance metrics: ${error.message}`
      results.details.error = error.message
    }
    
    this.results.checks.performanceMetrics = results
    this.updateSummary(results.status)
    
    console.log(`   ${this.getStatusIcon(results.status)} ${results.message}`)
  }

  makeHttpRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const timeout = options.timeout || 5000
      const isHttps = url.startsWith('https://')
      const client = isHttps ? https : http
      
      const req = client.get(url, (res) => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers
        })
      })
      
      req.setTimeout(timeout, () => {
        req.destroy()
        reject(new Error(`Request timeout after ${timeout}ms`))
      })
      
      req.on('error', (error) => {
        reject(error)
      })
    })
  }

  calculateFinalStatus() {
    const { passed, failed, warnings } = this.results.summary
    
    if (failed > 0) {
      this.results.status = 'unhealthy'
    } else if (warnings > 0) {
      this.results.status = 'degraded'
    } else {
      this.results.status = 'healthy'
    }
  }

  updateSummary(status) {
    this.results.summary.total++
    if (status === 'passed') {
      this.results.summary.passed++
    } else if (status === 'failed') {
      this.results.summary.failed++
    } else if (status === 'warning') {
      this.results.summary.warnings++
    }
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
    console.log('📊 HEALTH CHECK SUMMARY')
    console.log('='.repeat(60))
    
    const { total, passed, failed, warnings } = this.results.summary
    
    console.log(`Overall Status: ${this.getStatusIcon(this.results.status)} ${this.results.status.toUpperCase()}`)
    console.log(`Total Checks: ${total}`)
    console.log(`✅ Passed: ${passed}`)
    console.log(`⚠️  Warnings: ${warnings}`)
    console.log(`❌ Failed: ${failed}`)
    
    console.log('\n📋 DETAILED RESULTS:')
    for (const [checkName, result] of Object.entries(this.results.checks)) {
      console.log(`\n${checkName}:`)
      console.log(`   Status: ${this.getStatusIcon(result.status)} ${result.status}`)
      console.log(`   Message: ${result.message}`)
    }
    
    if (this.results.status !== 'healthy') {
      console.log('\n🚨 RECOMMENDATIONS:')
      if (failed > 0) {
        console.log('   - Fix critical issues before deploying to production')
        console.log('   - Check backend API connectivity')
        console.log('   - Verify environment variables')
      }
      if (warnings > 0) {
        console.log('   - Monitor performance metrics')
        console.log('   - Consider optimizing slow endpoints')
        console.log('   - Update dependencies if needed')
      }
    }
    
    console.log('\n' + '='.repeat(60))
  }
}

// Run health check if called directly
if (require.main === module) {
  const checker = new HealthChecker()
  checker.run()
}

module.exports = HealthChecker