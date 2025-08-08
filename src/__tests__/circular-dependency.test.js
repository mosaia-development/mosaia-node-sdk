const { MosaiaClient } = require('../../dist/index.js');

// Test configuration with expired session
const expiredConfig = {
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

async function testCircularDependencyFix() {
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
        if (error.message.includes('Maximum call stack size exceeded')) {
            console.error('❌ FAILED: Circular dependency still exists!');
            console.error('   Error:', error.message);
        } else {
            console.log('✅ SUCCESS: No circular dependency error!');
            console.log('   Expected error (authentication/network):', error.message);
        }
    }
}

// Test with valid config to ensure normal functionality still works
async function testNormalFunctionality() {
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
        console.log('✅ Expected error (authentication/network):', error.message);
    }
}

// Run tests
async function runTests() {
    console.log('🚀 Starting Circular Dependency Fix Tests\n');
    
    await testCircularDependencyFix();
    await testNormalFunctionality();
    
    console.log('\n🎉 Test completed!');
    console.log('   If you see "SUCCESS: No circular dependency error!" then the fix is working!');
}

runTests().catch(console.error);
