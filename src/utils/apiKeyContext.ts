import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Context for storing request-scoped API key
 */
export interface ApiKeyContext {
	apiKey?: string;
}

/**
 * AsyncLocalStorage instance for managing API key context
 */
export const apiKeyStorage = new AsyncLocalStorage<ApiKeyContext>();

/**
 * Get the current API key from context or environment
 */
export function getCurrentApiKey(): string | undefined {
	const context = apiKeyStorage.getStore();
	return context?.apiKey || process.env.VIDCAP_API_KEY;
}

/**
 * Run a function with a specific API key context
 */
export function runWithApiKey<T>(apiKey: string | undefined, fn: () => T): T {
	return apiKeyStorage.run({ apiKey }, fn);
}
