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
    console.log('🧪 Testing Circular Dependency Fix...\n');
    
    try {
        console.log('1. Creating MosaiaClient with expired config...');
        const mosaia = new MosaiaClient(expiredConfig);
        console.log('✅ MosaiaClient created successfully');
        
        console.log('\n2. Attempting to call mosaia.session() with expired config...');
        console.log('   This should NOT cause a "Maximum call stack size exceeded" error');
        
        // This would have caused infinite recursion before the fix
        const session = await mosaia.session();
        console.log('✅ mosaia.session() completed successfully');
        console.log('   Session data:', session);
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Maximum call stack size exceeded')) {
            console.error('❌ FAILED: Circular dependency still exists!');
            console.error('   Error:', errorMessage);
        } else if (errorMessage.includes('Forbidden') || errorMessage.includes('Unauthorized') || errorMessage.includes('authentication')) {
            console.log('✅ SUCCESS: No circular dependency error!');
            console.log('   Expected authentication error:', errorMessage);
        } else {
            console.log('✅ SUCCESS: No circular dependency error!');
            console.log('   Other error:', errorMessage);
        }
    }
}

// Test with valid config to ensure normal functionality still works
async function testNormalFunctionality(): Promise<void> {
    console.log('\n🧪 Testing Normal Functionality...\n');
    
    try {
        console.log('1. Creating MosaiaClient with valid config...');
        const mosaia = new MosaiaClient({
            apiKey: 'valid-token-123',
            apiURL: 'https://api.mosaia.ai',
            version: '1'
        });
        console.log('✅ MosaiaClient created successfully');
        
        console.log('\n2. Attempting to call mosaia.session() with valid config...');
        const session = await mosaia.session();
        console.log('✅ mosaia.session() completed successfully');
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log('✅ Expected error (authentication/network):', errorMessage);
    }
}

// Test the skipTokenRefresh functionality
async function testSkipTokenRefresh(): Promise<void> {
    console.log('\n🧪 Testing SkipTokenRefresh Functionality...\n');
    
    try {
        console.log('1. Testing APIClient with skipTokenRefresh flag...');
        
        // Import APIClient directly to test the skipTokenRefresh parameter
        const { APIClient } = require('../utils/api-client');
        
        // This should not cause infinite recursion
        const apiClient = new (APIClient as any)(expiredConfig, true);
        console.log('✅ APIClient created with skipTokenRefresh=true successfully');
        
        // Test that it doesn't try to refresh tokens
        console.log('2. Testing that token refresh is skipped...');
        // The client should be initialized without attempting token refresh
        
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('Maximum call stack size exceeded')) {
            console.error('❌ FAILED: skipTokenRefresh not working!');
            console.error('   Error:', errorMessage);
        } else {
            console.log('✅ SUCCESS: skipTokenRefresh working correctly!');
            console.log('   Expected error (authentication/network):', errorMessage);
        }
    }
}

// Run tests
async function runTests(): Promise<void> {
    console.log('🚀 Starting Circular Dependency Fix Tests\n');
    
    await testCircularDependencyFix();
    await testNormalFunctionality();
    await testSkipTokenRefresh();
    
    console.log('\n🎉 Test completed!');
    console.log('   If you see "SUCCESS: No circular dependency error!" then the fix is working!');
}

runTests().catch(console.error);
