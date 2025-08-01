import Mosaia, { MosaiaAuth } from './src';
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
        if (!API_URL || !CLIENT_ID || !USER_EMAIL || !USER_PASSWORD) {
            console.error('❌ Missing required environment variables:');
            console.log('API_URL:', API_URL);
            console.log('CLIENT_ID:', CLIENT_ID);
            console.log('USER_EMAIL:', USER_EMAIL);
            console.log('USER_PASSWORD:', USER_PASSWORD ? '[SET]' : '[MISSING]');
            process.exit(1);
        }

        console.log('🚀 Initializing Mosaia SDK...');
        let mosaia = new Mosaia({
            apiURL: API_URL,
            verbose: true,
            clientId: CLIENT_ID as string
        });

        console.log(' Attempting to sign in...');
        const authConfig = await mosaia.auth.signInWithPassword(
            USER_EMAIL as string, 
            USER_PASSWORD as string
        );

        console.log('authConfig:', authConfig);
        console.log(' Attempting to refresh...');
        const auth = new MosaiaAuth(authConfig);
        const refreshConfig = await auth.refreshToken();

        console.log('refreshConfig:', refreshConfig);
        mosaia.config = refreshConfig;

        const session = await mosaia.session();
        console.log('session:', session);
        
        return mosaia;
    } catch (error) {
        console.error('❌ Error testing SDK:', error);
        if ((error as any).message) {
            console.error('Error message:', (error as any).message);
        }
        process.exit(1);
    }
}

async function testSDK() {
    const mosaia = await authentication();

    const results = await mosaia.agents.get({q: "cafe"});
    console.log(results);

    if (Array.isArray(results) && results.length > 0) {
        const firstAgent = results![0];
        console.log('firstAgent:', (firstAgent as any).name);
        console.log('firstAgent:', (firstAgent as any).description);

        try {
            const res = await firstAgent?.chatCompletion({
                messages: [
                    { role: "user", content: "Hello, who are you?" }
                ]
            });
    
            console.log(res.choices[0].message);
        } catch (error) {
            console.error('❌ Error testing SDK:', error);
            if ((error as any).message) {
                console.error('Error message:', (error as any).message);
            }
            process.exit(1);
        }
    }

    const { user } = await mosaia.session();
    console.log('user:', user);
    console.log('agents api:', user?.agents);


    
    // const orgUser = await user?.orgs.get({}, "65a9a716660e8cf0600b5095");
    // console.log('orgUser:', orgUser);
    // if (orgUser && !Array.isArray(orgUser)) {
    //     const mosaia2 = await orgUser.session();
    //     console.log('mosaia2:', mosaia2);
    // }
}

testSDK();