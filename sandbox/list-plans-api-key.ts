/**
 * List all task plans visible to an API key.
 *
 * Env:
 *   API_URL  — base API URL (e.g. https://api.mosaia.ai or http://localhost:8000)
 *   API_KEY  — secret API key (sent as Authorization bearer)
 *
 * Run: npx tsx sandbox/list-plans-api-key.ts
 */
import * as Mosaia from '../src';
import dotenv from 'dotenv';

dotenv.config();

const { API_URL, API_KEY } = process.env;

const PAGE_SIZE = 100;

async function fetchAllPlans(mosaia: Mosaia.MosaiaClient): Promise<Mosaia.Plan[]> {
    const all: Mosaia.Plan[] = [];
    let offset = 0;

    // { limit: PAGE_SIZE, offset }
    while (true) {
        const res = await mosaia.plans.get();
        const batch = res.data ?? [];
        all.push(...batch);

        const total = res.paging?.total;
        offset += batch.length;

        if (batch.length === 0 || batch.length < PAGE_SIZE) {
            break;
        }
        if (total !== undefined && offset >= total) {
            break;
        }
    }

    return all;
}

async function main() {
    if (!API_URL || !API_KEY) {
        console.error('Missing required environment variables:');
        console.error('  API_URL —', API_URL ? '[set]' : '[missing]');
        console.error('  API_KEY —', API_KEY ? '[set]' : '[missing]');
        process.exit(1);
    }

    const mosaia = new Mosaia.MosaiaClient({
        apiURL: API_URL,
        apiKey: API_KEY,
        verbose: process.env.VERBOSE === '1' || process.env.VERBOSE === 'true',
    });

    console.log('Fetching plans…');
    const plans = await fetchAllPlans(mosaia);

    console.log(`Total plans: ${plans.length}`);
    const payload = plans.map((p) => p.toJSON());
    console.log(JSON.stringify(payload, null, 2));
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
