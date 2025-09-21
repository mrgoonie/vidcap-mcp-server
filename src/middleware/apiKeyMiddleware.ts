import { Request, Response, NextFunction } from 'express';
import { runWithApiKey } from '../utils/apiKeyContext.js';
import { Logger } from '../utils/logger.util.js';

const logger = Logger.forContext('apiKeyMiddleware');

/**
 * Express middleware to extract API key from query parameters
 * and store it in AsyncLocalStorage context
 */
export function apiKeyMiddleware(
	req: Request,
	res: Response,
	next: NextFunction,
): void {
	const apiKey = req.query.api_key as string | undefined;

	if (apiKey) {
		logger.debug('API key found in query parameters');

		// Validate API key format (basic validation)
		if (apiKey.length < 10 || apiKey.length > 200) {
			logger.warn('Invalid API key format in query parameters');
			res.status(400).json({ error: 'Invalid API key format' });
			return;
		}

		// Warn if not using HTTPS (in production)
		if (process.env.NODE_ENV === 'production' && req.protocol !== 'https') {
			logger.warn('API key transmitted over non-HTTPS connection');
		}
	}

	// Run the rest of the request handling with the API key context
	runWithApiKey(apiKey, () => {
		next();
	});
}
