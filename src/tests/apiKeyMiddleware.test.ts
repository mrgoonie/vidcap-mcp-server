import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { Request, Response, NextFunction } from 'express';
import { apiKeyMiddleware } from '../middleware/apiKeyMiddleware';
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

describe('apiKeyMiddleware', () => {
	let req: Partial<Request>;
	let res: Partial<Response>;
	let next: NextFunction;
	let runWithApiKeySpy: jest.SpiedFunction<
		typeof apiKeyContext.runWithApiKey
	>;

	beforeEach(() => {
		req = {
			query: {},
			protocol: 'https',
		};
		res = {
			status: jest.fn().mockReturnThis() as any,
			json: jest.fn().mockReturnThis() as any,
		};
		next = jest.fn();

		// Spy on runWithApiKey
		runWithApiKeySpy = jest.spyOn(apiKeyContext, 'runWithApiKey');
		runWithApiKeySpy.mockImplementation((_apiKey, fn) => fn());
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('should call next when no API key is provided', () => {
		apiKeyMiddleware(req as Request, res as Response, next);

		expect(runWithApiKeySpy).toHaveBeenCalledWith(
			undefined,
			expect.any(Function),
		);
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	it('should extract API key from query parameters', () => {
		req.query = { api_key: 'test-api-key-123' };

		apiKeyMiddleware(req as Request, res as Response, next);

		expect(runWithApiKeySpy).toHaveBeenCalledWith(
			'test-api-key-123',
			expect.any(Function),
		);
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	it('should reject API key that is too short', () => {
		req.query = { api_key: 'short' };

		apiKeyMiddleware(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: 'Invalid API key format',
		});
		expect(next).not.toHaveBeenCalled();
	});

	it('should reject API key that is too long', () => {
		req.query = { api_key: 'a'.repeat(201) };

		apiKeyMiddleware(req as Request, res as Response, next);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.json).toHaveBeenCalledWith({
			error: 'Invalid API key format',
		});
		expect(next).not.toHaveBeenCalled();
	});

	it('should accept valid API key length', () => {
		req.query = { api_key: 'valid-api-key-with-proper-length' };

		apiKeyMiddleware(req as Request, res as Response, next);

		expect(runWithApiKeySpy).toHaveBeenCalledWith(
			'valid-api-key-with-proper-length',
			expect.any(Function),
		);
		expect(next).toHaveBeenCalled();
		expect(res.status).not.toHaveBeenCalled();
	});

	it('should handle non-string API key in query', () => {
		req.query = { api_key: ['array', 'value'] as any };

		apiKeyMiddleware(req as Request, res as Response, next);

		// Should treat array as undefined and proceed
		expect(runWithApiKeySpy).toHaveBeenCalledWith(
			undefined,
			expect.any(Function),
		);
		expect(next).toHaveBeenCalled();
	});
});
