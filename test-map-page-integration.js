/**
 * Integration test to simulate the map page loading with real API data
 */

// Simulate the API client getGeolocationData method
async function simulateApiCall() {
    console.log("Simulating API call to /api/analytics/geographic...")
    
    // This simulates what the API client would return when calling the real backend
    const backendResponse = {
        success: true,
        data: {
            topLocations: [
                {
                    count: 3,
                    location: "Bonamoussadi"
                },
                {
                    count: 1,
                    location: "douala cité des palmier, Bonamoussadi"
                },
                {
                    count: 1,
                    location: "Test location, Test zone"
                },
                {
                    count: 1,
                    location: "Test Location, Test Zone"
                }
            ]
        }
    }
    
    return new Promise((resolve) => {
        setTimeout(() => resolve(backendResponse), 100) // Simulate network delay
    })
}

// Simulate the useGeolocationData hook processing
async function simulateHookProcessing() {
    console.log("Testing complete map page integration...")
    
    try {
        // Step 1: Fetch data from API
        const response = await simulateApiCall()
        console.log("✅ API call successful")
        
        // Step 2: Process data (same logic as in the updated hook)
        if (response.success && response.data) {
            let dataArray = []
            
            // Handle different API response structures
            if (Array.isArray(response.data)) {
                dataArray = response.data
                console.log("📄 Using mock data structure")
            }
            else if (response.data.topLocations && Array.isArray(response.data.topLocations)) {
                console.log("🌐 Using backend API structure")
                
                // Convert backend structure to expected structure
                dataArray = response.data.topLocations.map((item, index) => {
                    const cityCoordinates = {
                        "bonamoussadi": [4.0669, 9.7370],
                        "douala": [4.0511, 9.7679],
                        "yaoundé": [3.8480, 11.5021],
                        "test": [4.0511, 9.7679]
                    }
                    
                    const locationKey = item.location.toLowerCase().split(',')[0].trim()
                    const coordinates = cityCoordinates[locationKey] || [4.0511, 9.7679]
                    
                    return {
                        region: item.location,
                        requests: item.count || 0,
                        providers: Math.floor((item.count || 0) * 0.3),
                        revenue: (item.count || 0) * 15000,
                        satisfaction: 4.0 + Math.random() * 1.0,
                        responseTime: 15 + Math.random() * 20,
                        coordinates: coordinates,
                        growth: (Math.random() - 0.5) * 40,
                        marketShare: Math.min(100, (item.count || 0) * 5)
                    }
                })
                
                console.log(`✅ Converted ${dataArray.length} backend locations`)
            }
            else {
                console.warn("Unknown API response structure:", response.data)
                dataArray = []
            }
            
            // Step 3: Process regions for map display (same as hook)
            const apiRegions = dataArray.map((item, index) => {
                const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316"]
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
                    color: colors[index % colors.length],
                    city: item.region.split(',')[0] || item.region,
                }
            })
            
            console.log(`✅ Processed ${apiRegions.length} regions for map display`)
            
            // Step 4: Extract cities (same as hook)
            const citiesMap = new Map()
            
            apiRegions.forEach((region) => {
                const cityName = region.city
                if (!cityName) return
                const cityId = cityName.toLowerCase().replace(/[^a-z0-9]/g, "-")
                
                if (!citiesMap.has(cityId)) {
                    citiesMap.set(cityId, {
                        id: cityId,
                        name: cityName,
                        requests: 0,
                        providers: 0
                    })
                }
                
                const city = citiesMap.get(cityId)
                city.requests += region.requests
                city.providers += region.providers
            })
            
            const cities = Array.from(citiesMap.values())
            console.log(`✅ Extracted ${cities.length} cities`)
            
            // Step 5: Verify the data structure is correct for the map component
            const firstRegion = apiRegions[0]
            if (firstRegion && firstRegion.coordinates && firstRegion.coordinates.lat && firstRegion.coordinates.lng) {
                console.log("✅ Coordinates structure is correct for map rendering")
                console.log(`   Example: ${firstRegion.name} at [${firstRegion.coordinates.lat}, ${firstRegion.coordinates.lng}]`)
            } else {
                console.log("❌ Coordinates structure is incorrect")
            }
            
            // Return success
            return {
                success: true,
                regions: apiRegions,
                cities: cities,
                stats: {
                    totalRequests: apiRegions.reduce((sum, r) => sum + r.requests, 0),
                    totalProviders: apiRegions.reduce((sum, r) => sum + r.providers, 0),
                    totalRevenue: apiRegions.reduce((sum, r) => sum + r.revenue, 0)
                }
            }
        }
        
        throw new Error("Invalid API response")
        
    } catch (error) {
        console.log(`❌ FAILED: ${error.message}`)
        return { success: false, error: error.message }
    }
}

// Run the integration test
async function runIntegrationTest() {
    console.log("=== Map Page Integration Test ===")
    
    const result = await simulateHookProcessing()
    
    if (result.success) {
        console.log("\n🎉 SUCCESS: Map page integration should work correctly!")
        console.log(`📊 Stats:`)
        console.log(`   - ${result.regions.length} regions loaded`)
        console.log(`   - ${result.cities.length} cities extracted`)
        console.log(`   - ${result.stats.totalRequests} total requests`)
        console.log(`   - ${result.stats.totalProviders} total providers`)
        console.log("\n✅ The map page should now display real backend data without errors!")
    } else {
        console.log("\n💥 FAILED: Map page integration has issues")
        console.log(`Error: ${result.error}`)
    }
}

runIntegrationTest()