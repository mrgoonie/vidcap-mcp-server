/**
 * Test script to demonstrate API key query parameter functionality
 *
 * Usage:
 * 1. Start the MCP server with HTTP transport:
 *    npm run dev:server -- --transport http
 *
 * 2. Run this test script:
 *    node test-api-key.js
 */

const axios = require('axios');

const MCP_SERVER_URL = 'http://localhost:8080/mcp';

// Test API key from query parameter
async function testApiKeyFromQuery() {
	console.log('Testing API key from query parameter...\n');

	try {
		// Initialize session with API key in query parameter
		const response = await axios.post(
			`${MCP_SERVER_URL}?api_key=your-test-api-key-12345`,
			{
				jsonrpc: '2.0',
				method: 'initialize',
				params: {
					protocolVersion: '2024-11-05',
					capabilities: {},
					clientInfo: {
						name: 'test-client',
						version: '1.0.0',
					},
				},
				id: 1,
			},
			{
				headers: {
					'Content-Type': 'application/json',
				},
			}
		);

		console.log('✅ Server accepted request with API key from query parameter');
		console.log('Session ID:', response.headers['mcp-session-id']);
		console.log('Response:', JSON.stringify(response.data, null, 2));

		// The API key from the query parameter will be automatically used
		// for all subsequent VidCap API calls made during this session

	} catch (error) {
		console.error('❌ Error:', error.response?.data || error.message);
	}
}

// Run the test
testApiKeyFromQuery().catch(console.error);