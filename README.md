# @mosaia/mosaia-node-sdk
[![Publish to NPM](https://github.com/mosaia-development/mosaia-node-sdk/actions/workflows/deploy.yml/badge.svg)](https://github.com/mosaia-development/mosaia-node-sdk/actions/workflows/deploy.yml)
![GitHub all releases](https://img.shields.io/github/commit-activity/m/mosaia-development/mosaia-node-sdk)
![GitHub contributors](https://img.shields.io/github/contributors-anon/mosaia-development/mosaia-node-sdk)
![NPM Downloads](https://img.shields.io/npm/dm/%40mosaia%2Fmosaia-node-sdk)

## Mosaia's TypeScript SDK for interfacing with the Mosaia Core platform

## Current Features
- Get and manage Mosaia Apps
- Manage agent and group bots
- Agent inference

## Getting Started
### Installation
Run any of the following commands to install the SDK using choice of package manager
##### NPM
```shell
npm i @mosaia/mosaia-node-sdk
```
##### PNPM
```shell
pnpm add @mosaia/mosaia-node-sdk
```
##### YARN
```shell
yarn add @mosaia/mosaia-node-sdk
```

### Implementation
##### In Node.js or NextJS
To use the TypeScript definition files within a Node.js or NextJS project, simply import @mosaia/mosaia-node-sdk as you normally would.
In a TypeScript file:
```typescript
// import entire SDK
import Mosaia from '@mosaia/mosaia-node-sdk';
// import SDK with type references
import Mosaia, { AppInterface } from '@mosaia/mosaia-node-sdk';
```
In a JavaScript file:
```javascript
// import entire SDK
const Mosaia = require('@mosaia/mosaia-node-sdk');
```
##### Create a Mosaia instance
In a TypeScript file:
```typescript
const {
    MOSAIA_CORE_URL,
    MOSAIA_CORE_VERSION,
    MOSAIA_API_KEY,
    MOSAIA_FRONTEND_URL,
    MOSAIA_CLIENT_ID,
    MOSAIA_CLIENT_SECRET
} = process.env;
// Apply API configs 
const mosaia = new Mosaia({
    apiKey: MOSAIA_API_KEY as string,
    version: MOSAIA_CORE_VERSION as string,
    baseURL: MOSAIA_CORE_URL as string,
    frontendURL: MOSAIA_FRONTEND_URL as string,
    clientId: MOSAIA_CLIENT_ID as string,
    clientSecret: MOSAIA_CLIENT_SECRET as string
});
```
In a JavaScript file:
```javascript
const {
    MOSAIA_CORE_URL,
    MOSAIA_CORE_VERSION,
    MOSAIA_API_KEY,
    MOSAIA_FRONTEND_URL,
    MOSAIA_CLIENT_ID,
    MOSAIA_CLIENT_SECRET
} = process.env;
// Apply API configs 
const mosaia = new Mosaia({
    apiKey: MOSAIA_API_KEY,
    version: MOSAIA_CORE_VERSION,
    baseURL: MOSAIA_CORE_URL,
    frontendURL: MOSAIA_FRONTEND_URL,
    clientId: MOSAIA_CLIENT_ID,
    clientSecret: MOSAIA_CLIENT_SECRET
});
```
##### Get the app by ID
In a TypeScript file:
```typescript
// get by app ID
const { MOSAIA_APP_ID } = process.env;
const app = await mosaia.apps.get({ id: MOSAIA_APP_ID as string } as AppInterface);
```
In a JavaScript file:
```javascript
// get by app ID
const { MOSAIA_APP_ID } = process.env;
const app = await mosaia.apps.get({ id: MOSAIA_APP_ID });
```
##### Create an app bot
In a TypeScript file or JavaScript file
```typescript
// get by app ID
const coreBot = await app.bots.create({
    response_url: `<optional webhook URL for async agent calls>`,
    user: `<optional user ID reference>`,
    org: `<optional org ID reference>`,
    agent: `<optional agent ID reference>`,
    agent_group: `<optional agent_group ID reference>`,
    external_id: `<optional external ID reference>`
});
```
##### OAuth Authentication
The SDK supports OAuth2 Authorization Code flow with PKCE for secure authentication. Here's how to implement it:

In a TypeScript file:
```typescript
// Initialize Mosaia with client ID and client secret
const mosaia = new Mosaia({
    clientId: MOSAIA_CLIENT_ID as string,
    clientSecret: MOSAIA_CLIENT_SECRET as string,
    version: MOSAIA_CORE_VERSION as string,
    baseURL: MOSAIA_CORE_URL as string,
    frontendURL: MOSAIA_FRONTEND_URL as string
});

// Create OAuth instance
const oauth = mosaia.oauth({
    redirectUri: 'https://your-app.com/callback',
    scopes: ['agent:read', 'agent:write'] // Optional scopes
});

// Get authorization URL and code verifier
const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();

// Redirect user to the authorization URL
// After user authorizes, they will be redirected to your callback URL with a code

// Exchange the code for tokens
const tokens = await oauth.exchangeCodeForToken(code, codeVerifier);

// Use the access token
const { access_token, refresh_token } = tokens;

// Refresh the access token when it expires
const newTokens = await oauth.refreshToken(refresh_token);
```

In a JavaScript file:
```javascript
// Initialize Mosaia with client ID and client secret
const mosaia = new Mosaia({
    clientId: MOSAIA_CLIENT_ID,
    clientSecret: MOSAIA_CLIENT_SECRET,
    version: MOSAIA_CORE_VERSION,
    baseURL: MOSAIA_CORE_URL,
    frontendURL: MOSAIA_FRONTEND_URL
});

// Create OAuth instance
const oauth = mosaia.oauth({
    redirectUri: 'https://your-app.com/callback',
    scopes: ['agent:read', 'agent:write'] // Optional scopes
});

// Get authorization URL and code verifier
const { url, codeVerifier } = oauth.getAuthorizationUrlAndCodeVerifier();

// Redirect user to the authorization URL
// After user authorizes, they will be redirected to your callback URL with a code

// Exchange the code for tokens
const tokens = await oauth.exchangeCodeForToken(code, codeVerifier);

// Use the access token
const { access_token, refresh_token } = tokens;

// Refresh the access token when it expires
const newTokens = await oauth.refreshToken(refresh_token);
```

## Contributing
Want to contribute? Great!

We welcome community contributions and pull requests. See [CONTRIBUTING.md][contributing] for information on how to set up a development environment and submit code.

## License

[Apache license][license]

**Free Software, Hell Yeah!**

[issues]: https://github.com/mosaia-development/mosaia-node-sdk/issues
[pr]: https://github.com/mosaia-development/mosaia-node-sdk/pulls
[license]: https://github.com/mosaia-development/mosaia-node-sdk/blob/main/LICENSE
[contributing]: https://github.com/mosaia-development/mosaia-node-sdk/blob/main/CONTRIBUTING.md
[cla]: http://en.wikipedia.org/wiki/Contributor_License_Agreement
