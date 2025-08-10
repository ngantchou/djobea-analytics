/**
 * Comprehensive API Testing Suite for Settings Integration
 * Tests all GET, POST, PUT requests for all settings endpoints
 * 
 * Usage: node test_setting_integration.js
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api/settings';
const TEST_TIMEOUT = 10000;

// Test results storage
let testResults = {
    passed: 0,
    failed: 0,
    errors: []
};

// Color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

// Helper function to log test results
function logTest(testName, passed, error = null) {
    if (passed) {
        console.log(`${colors.green}✓ ${testName}${colors.reset}`);
        testResults.passed++;
    } else {
        console.log(`${colors.red}✗ ${testName}${colors.reset}`);
        if (error) {
            console.log(`  Error: ${error.message}`);
            testResults.errors.push({ test: testName, error: error.message });
        }
        testResults.failed++;
    }
}

// Helper function to make HTTP requests
async function makeRequest(method, endpoint, data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            timeout: TEST_TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (data && (method === 'POST' || method === 'PUT')) {
            config.data = data;
        }
        
        const response = await axios(config);
        return { success: true, data: response.data, status: response.status };
    } catch (error) {
        return { 
            success: false, 
            error: error.response ? error.response.data : error.message,
            status: error.response ? error.response.status : 0
        };
    }
}

// Test System Settings
async function testSystemSettings() {
    console.log(`${colors.blue}Testing System Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/system');
    logTest('System Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const systemData = {
        app_name: "Djobea AI Test",
        version: "1.0.0",
        maintenance_mode: false,
        debug_mode: true,
        timezone: "Africa/Douala"
    };
    
    const postResult = await makeRequest('POST', '/system', systemData);
    logTest('System Settings POST', postResult.success, postResult.error);
}

// Test Business Settings
async function testBusinessSettings() {
    console.log(`${colors.blue}Testing Business Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/business');
    logTest('Business Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const businessData = {
        company_name: "Test Company",
        address: "123 Test Street",
        phone: "+237123456789",
        email: "test@company.com",
        website: "https://testcompany.com",
        currency: "XAF",
        tax_rate: 19.25,
        commission_rate: 15.0,
        minimum_order: 5000,
        working_hours_start: "08:00",
        working_hours_end: "18:00",
        working_days: ["monday", "tuesday", "wednesday", "thursday", "friday"],
        emergency_available: true
    };
    
    const postResult = await makeRequest('POST', '/business', businessData);
    logTest('Business Settings POST', postResult.success, postResult.error);
}

// Test AI Settings
async function testAISettings() {
    console.log(`${colors.blue}Testing AI Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/ai');
    logTest('AI Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const aiData = {
        provider: "openai",
        model_name: "gpt-4",
        temperature: 0.7,
        max_tokens: 2048,
        enabled: true,
        priority: 1,
        rate_limit: 100,
        config: {
            api_key: "test-key",
            organization: "test-org"
        }
    };
    
    const postResult = await makeRequest('POST', '/ai', aiData);
    logTest('AI Settings POST', postResult.success, postResult.error);
}

// Test WhatsApp Settings
async function testWhatsAppSettings() {
    console.log(`${colors.blue}Testing WhatsApp Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/whatsapp');
    logTest('WhatsApp Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const whatsappData = {
        business_account_id: "123456789",
        phone_number_id: "987654321",
        access_token: "test-access-token",
        webhook_url: "https://example.com/webhook",
        verify_token: "test-verify-token",
        enabled: true,
        rate_limit: 1000,
        templates: [
            {
                name: "greeting",
                content: "Hello {name}, welcome to our service!"
            }
        ]
    };
    
    const postResult = await makeRequest('POST', '/whatsapp', whatsappData);
    logTest('WhatsApp Settings POST', postResult.success, postResult.error);
}

// Test Performance Settings
async function testPerformanceSettings() {
    console.log(`${colors.blue}Testing Performance Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/performance');
    logTest('Performance Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const performanceData = {
        cache_enabled: true,
        cache_ttl: 3600,
        cdn_enabled: true,
        compression_enabled: true,
        minify_assets: true,
        lazy_loading: true,
        image_optimization: true,
        database_pool_size: 10,
        request_timeout: 30000,
        max_file_size: 50000000
    };
    
    const postResult = await makeRequest('POST', '/performance', performanceData);
    logTest('Performance Settings POST', postResult.success, postResult.error);
}

// Test Provider Settings
async function testProviderSettings() {
    console.log(`${colors.blue}Testing Provider Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/providers');
    logTest('Provider Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const providerData = {
        require_documents: true,
        background_check: true,
        minimum_rating: 3.0,
        probation_period: 30,
        commission_rate: 15.0,
        payment_schedule: "weekly",
        minimum_payout: 10000,
        minimum_reviews: 5,
        auto_suspend_threshold: 2.0,
        improvement_period: 14
    };
    
    const postResult = await makeRequest('POST', '/providers', providerData);
    logTest('Provider Settings POST', postResult.success, postResult.error);
}

// Test Request Settings
async function testRequestSettings() {
    console.log(`${colors.blue}Testing Request Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/requests');
    logTest('Request Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const requestData = {
        auto_assignment: true,
        assignment_timeout: 300,
        max_retries: 3,
        priority_levels: ["low", "medium", "high", "urgent"],
        matching_algorithm: "distance_rating",
        max_distance: 10.0,
        rating_weight: 0.6,
        distance_weight: 0.4,
        require_phone: true,
        require_email: false,
        minimum_description: 20
    };
    
    const postResult = await makeRequest('POST', '/requests', requestData);
    logTest('Request Settings POST', postResult.success, postResult.error);
}

// Test Admin Settings
async function testAdminSettings() {
    console.log(`${colors.blue}Testing Admin Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/admin');
    logTest('Admin Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const adminData = {
        max_users: 1000,
        default_role: "user",
        session_timeout: 86400,
        audit_log_retention: 365,
        backup_frequency: "daily",
        maintenance_mode: false,
        debug_mode: false
    };
    
    const postResult = await makeRequest('POST', '/admin', adminData);
    logTest('Admin Settings POST', postResult.success, postResult.error);
}

// Test Notification Settings
async function testNotificationSettings() {
    console.log(`${colors.blue}Testing Notification Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/notifications');
    logTest('Notification Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const notificationData = {
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        whatsapp_notifications: true,
        email_provider: "smtp",
        smtp_host: "smtp.example.com",
        smtp_port: 587,
        smtp_username: "test@example.com",
        smtp_password: "test-password",
        from_email: "noreply@djobea.com",
        from_name: "Djobea AI"
    };
    
    const postResult = await makeRequest('POST', '/notifications', notificationData);
    logTest('Notification Settings POST', postResult.success, postResult.error);
}

// Test Security Settings
async function testSecuritySettings() {
    console.log(`${colors.blue}Testing Security Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/security');
    logTest('Security Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const securityData = {
        password_min_length: 8,
        password_require_uppercase: true,
        password_require_lowercase: true,
        password_require_numbers: true,
        password_require_symbols: true,
        password_expiry_days: 90,
        max_login_attempts: 5,
        lockout_duration: 300,
        two_factor_enabled: true,
        session_encryption: true,
        api_rate_limit: 1000,
        cors_origins: ["http://localhost:3000"]
    };
    
    const postResult = await makeRequest('POST', '/security', securityData);
    logTest('Security Settings POST', postResult.success, postResult.error);
}

// Test Analytics Settings
async function testAnalyticsSettings() {
    console.log(`${colors.blue}Testing Analytics Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/analytics');
    logTest('Analytics Settings GET', getResult.success, getResult.error);
    
    // Test POST with valid data
    const analyticsData = {
        google_analytics_id: "GA-TEST-123456",
        facebook_pixel_id: "FB-TEST-123456",
        track_user_behavior: true,
        track_performance_metrics: true,
        data_retention_days: 365,
        anonymize_user_data: true,
        export_enabled: true,
        report_frequency: "weekly"
    };
    
    const postResult = await makeRequest('POST', '/analytics', analyticsData);
    logTest('Analytics Settings POST', postResult.success, postResult.error);
}

// Test Maintenance Settings
async function testMaintenanceSettings() {
    console.log(`${colors.blue}Testing Maintenance Settings...${colors.reset}`);
    
    // Test GET
    const getResult = await makeRequest('GET', '/maintenance');
    logTest('Maintenance Settings GET', getResult.success, getResult.error);
}

// Test error handling with invalid data
async function testErrorHandling() {
    console.log(`${colors.blue}Testing Error Handling...${colors.reset}`);
    
    // Test POST with invalid data
    const invalidData = {
        invalid_field: "invalid_value"
    };
    
    const postResult = await makeRequest('POST', '/system', invalidData);
    // Error handling should return proper error response
    logTest('Error Handling - Invalid Data', !postResult.success || postResult.status >= 400, postResult.error);
    
    // Test GET with invalid endpoint
    const invalidEndpoint = await makeRequest('GET', '/nonexistent');
    logTest('Error Handling - Invalid Endpoint', !invalidEndpoint.success, invalidEndpoint.error);
}

// Main test runner
async function runAllTests() {
    console.log(`${colors.yellow}========================================${colors.reset}`);
    console.log(`${colors.yellow} Djobea AI Settings API Test Suite${colors.reset}`);
    console.log(`${colors.yellow}========================================${colors.reset}`);
    console.log(`Testing against: ${BASE_URL}\n`);
    
    try {
        // Run all test suites
        await testSystemSettings();
        await testBusinessSettings();
        await testAISettings();
        await testWhatsAppSettings();
        await testPerformanceSettings();
        await testProviderSettings();
        await testRequestSettings();
        await testAdminSettings();
        await testNotificationSettings();
        await testSecuritySettings();
        await testAnalyticsSettings();
        await testMaintenanceSettings();
        await testErrorHandling();
        
        // Display results
        console.log(`\n${colors.yellow}========================================${colors.reset}`);
        console.log(`${colors.yellow} Test Results${colors.reset}`);
        console.log(`${colors.yellow}========================================${colors.reset}`);
        console.log(`${colors.green}Passed: ${testResults.passed}${colors.reset}`);
        console.log(`${colors.red}Failed: ${testResults.failed}${colors.reset}`);
        console.log(`Total: ${testResults.passed + testResults.failed}`);
        
        if (testResults.failed > 0) {
            console.log(`\n${colors.red}Failed Tests:${colors.reset}`);
            testResults.errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error.test}: ${error.error}`);
            });
        }
        
        const successRate = ((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1);
        console.log(`\nSuccess Rate: ${successRate}%`);
        
        if (testResults.failed === 0) {
            console.log(`${colors.green}🎉 All tests passed!${colors.reset}`);
            process.exit(0);
        } else {
            console.log(`${colors.red}❌ Some tests failed. Please check the API endpoints.${colors.reset}`);
            process.exit(1);
        }
        
    } catch (error) {
        console.error(`${colors.red}Test suite crashed: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    makeRequest,
    testSystemSettings,
    testBusinessSettings,
    testAISettings,
    testWhatsAppSettings,
    testPerformanceSettings,
    testProviderSettings,
    testRequestSettings,
    testAdminSettings,
    testNotificationSettings,
    testSecuritySettings,
    testAnalyticsSettings,
    testMaintenanceSettings,
    testErrorHandling
};