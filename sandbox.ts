import * as Mosaia from './src';
import dotenv from 'dotenv';

dotenv.config();

const {
    API_URL,
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
        let mosaia = new Mosaia.MosaiaClient({
            apiURL: API_URL,
            verbose: true,
            clientId: CLIENT_ID as string
        });

        console.log(' Attempting to sign in...');
        const authConfig = await mosaia.auth.signInWithPassword(
            USER_EMAIL as string, 
            USER_PASSWORD as string
        );

        // console.log('authConfig:', authConfig);
        // console.log(' Attempting to refresh...');
        // const auth = new Mosaia.MosaiaAuth(authConfig);
        // const refreshConfig = await auth.refreshToken();

        // console.log('refreshConfig:', refreshConfig);
        mosaia.config = authConfig;

        const session = await mosaia.session();
        // console.log('session:', session);
        console.log('session user:', session.user);
        console.log('session orgUser:', session.orgUser);
        console.log('session org:', session.org);
        console.log('session client:', session.client);
        console.log('session permissions:', session.permissions);
        return mosaia;
    } catch (error) {
        console.error('❌ Error testing SDK:', error);
        if ((error as any).message) {
            console.error('Error message:', (error as any).message);
        }
        process.exit(1);
    }
}

async function getAllLogs(mosaia: Mosaia.MosaiaClient) {
    const logsResponse = await mosaia.logs.get();
    if (!logsResponse) {
        console.log('No logs found');
        return;
    }
    const { data, paging } = logsResponse;
    console.log('log data:', data);
    console.log('log paging:', paging);
    return data;
}

async function searchAgents(mosaia: Mosaia.MosaiaClient, query: Mosaia.QueryParams) {
    const agentsResponse = await mosaia.agents.get(query);
    if (!agentsResponse) {
        console.log('No agents found');
        return;
    }
    const { data, paging } = agentsResponse;

    console.log('agent data:', data);
    console.log('agent paging:', paging);
    return data;
}

async function chatWithAgent(agent: Mosaia.AgentInterface, message: string) {
    try {
        const res = await agent?.chat.completions.create({
            messages: [
                { role: "user", content: message }
            ],
            tools: [
                {
                    type: "function",
                    function: {
                        name: "get_weather",
                        description: "Get the weather for a given city",
                        parameters: {
                            type: "object",
                            properties: {
                                city: { type: "string", description: "The city to get the weather for" }
                            },
                            required: ["city"]
                        }
                    }
                }
            ]
        });
        return res.choices[0].message;
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

    const logs = await getAllLogs(mosaia);
    console.log('--------------------------------');
    console.log('logs:', logs);
    const agents = await searchAgents(mosaia, {q: "cafe"});
    console.log('--------------------------------');
    console.log('agents:', agents);
    if (agents && agents.length > 0) {
        const agent = agents![0];

        console.log('agent name:', agent.name);
        console.log('agent short description:', agent.data.short_description);
        const chat = await chatWithAgent(agent as unknown as Mosaia.AgentInterface, "Hello, What is the the weather in Tokyo?");
        console.log('--------------------------------');
        console.log('chat with agent:', chat);
    }

    // const { user } = await mosaia.session();
    // console.log('user:', user);
    // console.log('agents api:', user?.agents);
    
    // const orgUser = await user?.orgs.get({}, "65a9a716660e8cf0600b5095");
    // console.log('orgUser:', orgUser);
    // if (orgUser && !Array.isArray(orgUser)) {
    //     const orgConfig = await orgUser.session();
    //     console.log('orgConfig:', orgConfig);
        
    //     // Create new MosaiaClient instance with org config
    //     const mosaia2 = new Mosaia.MosaiaClient(orgConfig);
    //     const session = await mosaia2.session();
    //     console.log('session:', session);
    //     console.log('session user:', session.user);
    //     console.log('session org:', session.org);
    //     console.log('session orgUser:', session.orgUser);
    //     console.log('session permission:', session.permissions);
    // }
}

testSDK();