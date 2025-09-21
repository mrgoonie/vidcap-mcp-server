import { describe, it, expect, beforeEach } from '@jest/globals';
import {
	apiKeyStorage,
	getCurrentApiKey,
	runWithApiKey,
} from '../utils/apiKeyContext';

describe('apiKeyContext', () => {
	beforeEach(() => {
		// Clear any existing context
		delete process.env.VIDCAP_API_KEY;
	});

	describe('getCurrentApiKey', () => {
		it('should return undefined when no context or env var is set', () => {
			const apiKey = getCurrentApiKey();
			expect(apiKey).toBeUndefined();
		});

		it('should return API key from environment when no context is set', () => {
			process.env.VIDCAP_API_KEY = 'env-api-key';
			const apiKey = getCurrentApiKey();
			expect(apiKey).toBe('env-api-key');
		});

		it('should return API key from context when set', (done) => {
			runWithApiKey('context-api-key', () => {
				const apiKey = getCurrentApiKey();
				expect(apiKey).toBe('context-api-key');
				done();
			});
		});

		it('should prefer context API key over environment', (done) => {
			process.env.VIDCAP_API_KEY = 'env-api-key';
			runWithApiKey('context-api-key', () => {
				const apiKey = getCurrentApiKey();
				expect(apiKey).toBe('context-api-key');
				done();
			});
		});
	});

	describe('runWithApiKey', () => {
		it('should run function with API key context', (done) => {
			const result = runWithApiKey('test-api-key', () => {
				const store = apiKeyStorage.getStore();
				expect(store).toBeDefined();
				expect(store?.apiKey).toBe('test-api-key');
				return 'success';
			});
			expect(result).toBe('success');
			done();
		});

		it('should handle undefined API key', (done) => {
			const result = runWithApiKey(undefined, () => {
				const store = apiKeyStorage.getStore();
				expect(store).toBeDefined();
				expect(store?.apiKey).toBeUndefined();
				return 'success';
			});
			expect(result).toBe('success');
			done();
		});

		it('should isolate contexts between calls', async () => {
			const results: string[] = [];

			await Promise.all([
				new Promise<void>((resolve) => {
					runWithApiKey('api-key-1', () => {
						setTimeout(() => {
							results.push(getCurrentApiKey() || 'none');
							resolve();
						}, 10);
					});
				}),
				new Promise<void>((resolve) => {
					runWithApiKey('api-key-2', () => {
						setTimeout(() => {
							results.push(getCurrentApiKey() || 'none');
							resolve();
						}, 5);
					});
				}),
			]);

			expect(results).toContain('api-key-1');
			expect(results).toContain('api-key-2');
		});
	});
});
