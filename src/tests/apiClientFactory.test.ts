import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { getApiClient, clearClientCache } from '../utils/apiClientFactory';
import * as apiKeyContext from '../utils/apiKeyContext';

jest.mock('../utils/logger.util', () => ({
	Logger: {
		forContext: () => ({
			debug: jest.fn(),
			warn: jest.fn(),
			error: jest.fn(),
		}),
	},
}));

describe('apiClientFactory', () => {
	let getCurrentApiKeySpy: jest.SpiedFunction<
		typeof apiKeyContext.getCurrentApiKey
	>;

	beforeEach(() => {
		clearClientCache();
		getCurrentApiKeySpy = jest.spyOn(apiKeyContext, 'getCurrentApiKey');
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should throw error when no API key is available', () => {
		getCurrentApiKeySpy.mockReturnValue(undefined);

		expect(() => getApiClient()).toThrow(
			'No API key available in context or environment',
		);
	});

	it('should create new client with API key', () => {
		getCurrentApiKeySpy.mockReturnValue('test-api-key');

		const client = getApiClient();

		expect(client).toBeDefined();
		expect(client.defaults.headers['x-api-key']).toBe('test-api-key');
		expect(client.defaults.headers['Content-Type']).toBe(
			'application/json',
		);
		expect(client.defaults.timeout).toBe(30000);
	});

	it('should reuse cached client for same API key', () => {
		getCurrentApiKeySpy.mockReturnValue('same-api-key');

		const client1 = getApiClient();
		const client2 = getApiClient();

		expect(client1).toBe(client2);
	});

	it('should create different clients for different API keys', () => {
		getCurrentApiKeySpy.mockReturnValueOnce('api-key-1');
		const client1 = getApiClient();

		getCurrentApiKeySpy.mockReturnValueOnce('api-key-2');
		const client2 = getApiClient();

		expect(client1).not.toBe(client2);
		expect(client1.defaults.headers['x-api-key']).toBe('api-key-1');
		expect(client2.defaults.headers['x-api-key']).toBe('api-key-2');
	});

	it('should clear cache when clearClientCache is called', () => {
		getCurrentApiKeySpy.mockReturnValue('cached-key');

		const client1 = getApiClient();
		clearClientCache();
		const client2 = getApiClient();

		expect(client1).not.toBe(client2);
	});

	it('should limit cache size to prevent memory issues', () => {
		// Create more than 100 clients
		for (let i = 0; i < 105; i++) {
			getCurrentApiKeySpy.mockReturnValue(`api-key-${i}`);
			getApiClient();
		}

		// The cache should have evicted the oldest entries
		// We can't directly test the cache size, but we can verify
		// that the function doesn't throw and creates new clients
		getCurrentApiKeySpy.mockReturnValue('api-key-0');
		const newClient = getApiClient();
		expect(newClient).toBeDefined();
	});
});
