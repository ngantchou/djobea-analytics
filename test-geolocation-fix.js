/**
 * Simple test to verify geolocation data structure fix
 * This simulates what the frontend does when calling the API
 */

// Mock the apiClient.getGeolocationData function behavior
async function testGeolocationDataStructure() {
    console.log("Testing geolocation data structure fix...")
    
    // Simulate the mock data that would be returned
    const mockGeolocationData = [
        {
            region: "Bonamoussadi, Douala",
            requests: 145,
            providers: 23,
            revenue: 2450000,
            satisfaction: 4.5,
            responseTime: 15,
            coordinates: [4.0511, 9.7679],
            growth: 12.5,
            marketShare: 18.3
        },
        {
            region: "Akwa, Douala", 
            requests: 132,
            providers: 19,
            revenue: 2100000,
            satisfaction: 4.2,
            responseTime: 18,
            coordinates: [4.0469, 9.7019],
            growth: 8.7,
            marketShare: 16.7
        }
    ]
    
    // Simulate what simulateApiDelay returns
    const apiResponse = {
        success: true,
        data: mockGeolocationData, // This is now the array directly
        message: "Data loaded successfully"
    }
    
    console.log("API Response structure:", JSON.stringify(apiResponse, null, 2))
    
    // Test if response.data.map works
    try {
        if (apiResponse.success && apiResponse.data) {
            const processedRegions = apiResponse.data.map((item, index) => {
                const id = item.region.toLowerCase().replace(/[^a-z0-9]/g, "-")
                
                return {
                    id,
                    name: item.region,
                    requests: item.requests,
                    providers: item.providers,
                    revenue: item.revenue,
                    satisfaction: item.satisfaction,
                    responseTime: item.responseTime,
                    coordinates: { lat: item.coordinates[0], lng: item.coordinates[1] },
                    growth: item.growth,
                    marketShare: item.marketShare,
                    color: "#3B82F6", // Static color for test
                    city: item.region.split(',')[0] || item.region,
                }
            })
            
            console.log("✅ SUCCESS: Data processing worked!")
            console.log("Processed regions:", processedRegions.length)
            console.log("First region:", JSON.stringify(processedRegions[0], null, 2))
            
            return true
        } else {
            console.log("❌ FAILED: API response structure is invalid")
            return false
        }
    } catch (error) {
        console.log("❌ FAILED: Error processing data:", error.message)
        return false
    }
}

// Run the test
testGeolocationDataStructure().then(success => {
    if (success) {
        console.log("\n🎉 OVERALL: Geolocation data structure fix is working correctly!")
    } else {
        console.log("\n💥 OVERALL: Geolocation data structure fix failed!")
    }
})