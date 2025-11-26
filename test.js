const MosaiaClient = require('./dist/index.js')

async function main () {
  const mosaiaClient = new MosaiaClient.MosaiaClient({
    apiKey:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjZlODU3OTFmODZjZDJkZmNiN2Q0ZDY4IiwiYWN0aXZlX2lkIjoiZTg5MzkwODE5ZWI4ODc0N2EzMzkxOTdiYTJiNWEzYjYiLCJzdWJzY3JpcHRpb24iOiJFeHBsb3JlciIsImVudGl0bGVtZW50cyI6WyJjcmVkaXRzIiwicHJpdmF0ZV9hZ2VudHMiLCJ0ZWFtcyJdLCJ0eXBlIjoib2F1dGgiLCJwcm92aWRlciI6Imdvb2dsZSIsImlhdCI6MTc2Mjg4MjExOCwiZXhwIjoxNzYyOTY4NTE4fQ.2qddfV1K73YW7U8u8SlyBHzkadI95BxXXkYwfAqW1D8',
    apiURL: 'http://localhost:8000',
    // clientId: process.env.MOSAIA_CLIENT_ID!,
    verbose: true // Enable verbose logging for debugging
  })

  const agentInstance = await mosaiaClient.agents.get(
    {},
    '68f7ce69ff2ac37ab9c9921f'
  )
//   console.log(agentInstance)

  const response = await agentInstance.chat.completions.create({
    messages: [{role: 'user', content: 'say hello'}],
    temperature: 0.7,
    max_tokens: 1000
  })

  console.log(response)
}

main()
