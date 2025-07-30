import Mosaia from './src';
import dotenv from 'dotenv';

dotenv.config();

const {
    API_URL,
    APP_URL,
    CLIENT_ID,
    USER_EMAIL,
    USER_PASSWORD
} = process.env;

const authentication = async () => {
    try {
        // Validate environment variables
        if (!API_URL || !APP_URL || !CLIENT_ID || !USER_EMAIL || !USER_PASSWORD) {
            console.error('❌ Missing required environment variables:');
            console.log('API_URL:', API_URL);
            console.log('APP_URL:', APP_URL);
            console.log('CLIENT_ID:', CLIENT_ID);
            console.log('USER_EMAIL:', USER_EMAIL);
            console.log('USER_PASSWORD:', USER_PASSWORD ? '[SET]' : '[MISSING]');
            process.exit(1);
        }

        console.log('🚀 Initializing Mosaia SDK...');
        let mosaia = new Mosaia({
            apiURL: API_URL,
            appURL: APP_URL,
            verbose: true
        });

        console.log(' Attempting to sign in...');
        mosaia = await mosaia.auth.signInWithPassword(
            USER_EMAIL as string, 
            USER_PASSWORD as string, 
            CLIENT_ID as string
        );
        
        return mosaia;
    } catch (error) {
        console.error('❌ Error testing SDK:', error);
        if ((error as any).message) {
            console.error('Error message:', (error as any).message);
        }
        process.exit(1);
    }
}

const getSelf = async (mosaia: Mosaia) => {
    return mosaia.self();
}

const testModels = async (mosaia: Mosaia) => {
    console.log('\n🧪 Testing Models API...');
    
    try {
        // Get all models
        console.log('📋 Getting all models...');
        const allModels = await mosaia.models.getAll();
        const modelsArray = allModels.data.data || allModels.data;
        console.log('✅ All models retrieved:', modelsArray?.length || 0, 'models found');
        if (modelsArray && modelsArray.length > 0) {
            const firstModel = modelsArray[0];
            console.log('📝 First model:', {
                id: firstModel.id,
                name: firstModel.name,
                provider: firstModel.provider,
                model_id: firstModel.model_id
            });
            
            // Get specific model by ID
            console.log('🔍 Getting specific model...');
            const specificModel = await mosaia.models.getById(firstModel.id!);
            console.log('✅ Specific model retrieved:', specificModel.data.data.name);
            
            // Test chat completion if model is available
            console.log('💬 Testing chat completion...');
            const chatResponse = await mosaia.models.chatCompletion({
                model: firstModel.model_id,
                messages: [
                    { role: 'system', content: 'You are a helpful assistant.' },
                    { role: 'user', content: 'Say hello in a friendly way.' }
                ],
                max_tokens: 50,
                temperature: 0.7
            });
            console.log('✅ Chat completion successful:', chatResponse.data.choices[0].message.content);
        }
        
        // Test filtering by provider
        console.log('🔍 Testing provider filtering...');
        const openaiModels = await mosaia.models.getAll({ provider: 'openai' });
        console.log('✅ OpenAI models found:', openaiModels.data.data.length);
        
        const anthropicModels = await mosaia.models.getAll({ provider: 'anthropic' });
        console.log('✅ Anthropic models found:', anthropicModels.data.data.length);
        
        // Test search functionality
        console.log('🔍 Testing search functionality...');
        const searchResults = await mosaia.models.getAll({ 
            search: 'gpt',
            limit: 5 
        });
        console.log('✅ Search results:', searchResults.data.data.length, 'models found');
        
    } catch (error) {
        console.error('❌ Error testing models:', error);
        if ((error as any).message) {
            console.error('Error message:', (error as any).message);
        }
    }
}

const testModelCreation = async (mosaia: Mosaia) => {
    console.log('\n🧪 Testing Model Creation...');
    
    try {
        // Create a test model
        console.log('📝 Creating test model...');
        const newModel = await mosaia.models.create({
            name: 'Test GPT-4 Model',
            short_description: 'A test model for SDK testing',
            provider: 'openai',
            model_id: 'gpt-4',
            max_tokens: 4096,
            temperature: 0.7,
            public: false,
            active: true,
            tags: ['test', 'sdk', 'gpt-4']
        });
        
        console.log('✅ Test model created:', newModel.data.data.id);
        
        // Update the model
        console.log('📝 Updating test model...');
        const updatedModel = await mosaia.models.update(newModel.data.data.id!, {
            name: 'Updated Test GPT-4 Model',
            short_description: 'Updated test model description',
            temperature: 0.8
        });
        
        console.log('✅ Test model updated:', updatedModel.data.data.name);
        
        // Clean up - delete the test model
        console.log('🗑️ Cleaning up test model...');
        await mosaia.models.delete(newModel.data.data.id!);
        console.log('✅ Test model deleted');
        
    } catch (error) {
        console.error('❌ Error testing model creation:', error);
        if ((error as any).message) {
            console.error('Error message:', (error as any).message);
        }
    }
}

const testClients = async (mosaia: Mosaia) => {
    console.log('\n🧪 Testing Clients API...');
    
    try {
        // Get all clients
        console.log('📋 Getting all clients...');
        const allClients = await mosaia.clients.getAll();
        const clientsArray = allClients.data.data || allClients.data;
        console.log('✅ All clients retrieved:', clientsArray?.length || 0, 'clients found');
        
        if (clientsArray && clientsArray.length > 0) {
            const firstClient = clientsArray[0];
            console.log('📝 First client:', {
                id: firstClient.id,
                name: firstClient.name,
                client_id: firstClient.client_id,
                active: firstClient.active
            });
            
            // Get specific client by ID
            console.log('🔍 Getting specific client...');
            const specificClient = await mosaia.clients.getById(firstClient.id!);
            console.log('✅ Specific client retrieved:', specificClient.data.data.name);
        }
        
        // Test filtering by active status
        console.log('🔍 Testing active client filtering...');
        const activeClients = await mosaia.clients.getAll({ active: true });
        const activeClientsArray = activeClients.data.data || activeClients.data;
        console.log('✅ Active clients found:', activeClientsArray?.length || 0);
        
        // Test search functionality
        console.log('🔍 Testing search functionality...');
        const searchResults = await mosaia.clients.getAll({ 
            search: 'test',
            limit: 5 
        });
        const searchResultsArray = searchResults.data.data || searchResults.data;
        console.log('✅ Search results:', searchResultsArray?.length || 0, 'clients found');
        
    } catch (error) {
        console.error('❌ Error testing clients:', error);
        if ((error as any).message) {
            console.error('Error message:', (error as any).message);
        }
        console.log('ℹ️  Note: Clients API endpoint may not be available on this server');
    }
}

const testClientCreation = async (mosaia: Mosaia) => {
    console.log('\n🧪 Testing Client Creation...');
    
    try {
        // Create a test client
        console.log('📝 Creating test client...');
        const newClient = await mosaia.clients.create({
            name: 'Test SDK Client',
            client_id: 'test-sdk-client-' + Date.now(),
            redirect_uris: ['https://test.com/callback'],
            scopes: ['read', 'write'],
            active: true
        });
        
        console.log('✅ Test client created:', newClient.data.data.id);
        
        // Update the client
        console.log('📝 Updating test client...');
        const updatedClient = await mosaia.clients.update(newClient.data.data.id!, {
            name: 'Updated Test SDK Client',
            scopes: ['read', 'write', 'admin']
        });
        
        console.log('✅ Test client updated:', updatedClient.data.data.name);
        
        // Clean up - delete the test client
        console.log('🗑️ Cleaning up test client...');
        await mosaia.clients.delete(newClient.data.data.id!);
        console.log('✅ Test client deleted');
        
    } catch (error) {
        console.error('❌ Error testing client creation:', error);
        if ((error as any).message) {
            console.error('Error message:', (error as any).message);
        }
    }
}

async function testSDK() {
    const mosaia = await authentication();
    const self = await getSelf(mosaia);
    const { user } = self;
    console.log('user:', user);
    console.log('agents api:', user?.agents);
    const orgUser = await user?.orgUsers.get({}, "65a9a716660e8cf0600b5095");
    console.log('orgUser:', orgUser);
    if (orgUser && !Array.isArray(orgUser)) {
        const mosaia2 = await orgUser.session();
        console.log('mosaia2:', mosaia2);
    }
    
    // Test models functionality
    await testModels(mosaia);
    
    // Test clients functionality
    await testClients(mosaia);
    
    // Test model creation (commented out to avoid creating test data)
    // await testModelCreation(mosaia);
    
    // Test client creation (commented out to avoid creating test data)
    // await testClientCreation(mosaia);
}

testSDK();