import axios, { AxiosInstance } from 'axios';
import { getCurrentApiKey } from './apiKeyContext.js';
import { Logger } from './logger.util.js';

const logger = Logger.forContext('apiClientFactory');

// Cache for API clients by API key
const clientCache = new Map<string, AxiosInstance>();

/**
 * Get or create an Axios client with the current API key
 */
export function getApiClient(): AxiosInstance {
	const apiKey = getCurrentApiKey();

	if (!apiKey) {
		throw new Error('No API key available in context or environment');
	}

	// Check cache
	let client = clientCache.get(apiKey);
	if (client) {
		return client;
	}

	// Create new client
	logger.debug('Creating new API client for request');
	client = axios.create({
		headers: {
			'x-api-key': apiKey,
			'Content-Type': 'application/json',
		},
		timeout: 30000,
	});

	// Add response interceptor for error handling
	client.interceptors.response.use(
		(response) => response,
		(error) => {
			if (error.response?.status === 401) {
				logger.error('API key authentication failed');
			} else if (error.response?.status === 403) {
				logger.error('API key authorization failed');
			}
			return Promise.reject(error);
		},
	);

	// Cache the client (limit cache size to prevent memory issues)
	if (clientCache.size > 100) {
		const firstKey = clientCache.keys().next().value;
		if (firstKey) {
			clientCache.delete(firstKey);
		}
	}
	clientCache.set(apiKey, client);

	return client;
}

/**
 * Clear the client cache (useful for testing)
 */
export function clearClientCache(): void {
	clientCache.clear();
}
