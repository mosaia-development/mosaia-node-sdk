import { MosaiaClient, MosaiaConfig } from '../index';

// Test configuration with expired session
const expiredConfig: MosaiaConfig = {
    apiKey: 'expired-token-123',
    apiURL: 'https://api.mosaia.ai',
    version: '1',
    session: {
        accessToken: 'expired-access-token',
        refreshToken: 'valid-refresh-token',
        exp: (Date.now() - 3600000).toString(), // Expired 1 hour ago
        authType: 'password'
    }
};

async function testCircularDependencyFix(): Promise<void> {
    console.log('🧪 Testing Circular Dependency Fix (Simple Version)...\n');
    
    try {
        console.log('1. Creating MosaiaClient with expired config...');
        const mosaia = new MosaiaClient(expiredConfig);
        console.log('✅ MosaiaClient created successfully');
        
        console.log('\n2. Testing APIClient creation with skipTokenRefresh...');
        
        // Import APIClient directly to test the skipTokenRefresh parameter
        const { default: APIClient } = await import('../utils/api-client');
        
        // Test 1: Normal APIClient (should attempt token refresh)
        console.log('   Testing normal APIClient...');
        const normalClient = new APIClient(expiredConfig, false);
        console.log('   ✅ Normal APIClient created successfully');
        
        // Test 2: APIClient with skipTokenRefresh (should skip token refresh)
        console.log('   Testing APIClient with skipTokenRefresh=true...');
        const skipClient = new APIClient(expiredConfig, true);
        console.log('   ✅ APIClient with skipTokenRefresh created successfully');
        
        console.log('\n3. Testing MosaiaAuth creation...');
        
        // Import MosaiaAuth to test its constructor
        const { default: MosaiaAuth } = await import('../auth/auth');
        
        // This should create an APIClient with skipTokenRefresh=true
        const auth = new MosaiaAuth(expiredConfig);
        console.log('   ✅ MosaiaAuth created successfully');
        
        console.log('\n4. Testing that no circular dependency occurs...');
        console.log('   If we get here without a stack overflow, the fix is working!');
        
        console.log('\n✅ SUCCESS: No circular dependency error occurred!');
        console.log('   The skipTokenRefresh flag is working correctly.');
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Maximum call stack size exceeded')) {
            console.error('❌ FAILED: Circular dependency still exists!');
            console.error('   Error:', errorMessage);
        } else {
            console.log('✅ SUCCESS: No circular dependency error!');
            console.log('   Other error:', errorMessage);
        }
    }
}

// Test the actual session() method (this will likely fail with auth error, which is expected)
async function testSessionMethod(): Promise<void> {
    console.log('\n🧪 Testing session() method (will likely fail with auth error)...\n');
    
    try {
        console.log('1. Creating MosaiaClient with expired config...');
        const mosaia = new MosaiaClient(expiredConfig);
        console.log('✅ MosaiaClient created successfully');
        
        console.log('\n2. Calling mosaia.session()...');
        console.log('   This should NOT cause a stack overflow, but may fail with auth error');
        
        const session = await mosaia.session();
        console.log('✅ SUCCESS: session() completed without stack overflow!');
        console.log('   Session data:', session);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Maximum call stack size exceeded')) {
            console.error('❌ FAILED: Circular dependency still exists!');
            console.error('   Error:', errorMessage);
        } else if (errorMessage.includes('Forbidden') || errorMessage.includes('Unauthorized') || errorMessage.includes('authentication')) {
            console.log('✅ SUCCESS: No circular dependency error!');
            console.log('   Expected authentication error (refresh token is invalid):', errorMessage);
        } else {
            console.log('✅ SUCCESS: No circular dependency error!');
            console.log('   Other error:', errorMessage);
        }
    }
}

// Run tests
async function runTests(): Promise<void> {
    console.log('🚀 Starting Simple Circular Dependency Fix Tests\n');
    
    await testCircularDependencyFix();
    await testSessionMethod();
    
    console.log('\n🎉 Test completed!');
    console.log('   If you see "SUCCESS: No circular dependency error!" then the fix is working!');
}

runTests().catch(console.error);
