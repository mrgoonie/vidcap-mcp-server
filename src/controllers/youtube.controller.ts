/* eslint-disable prettier/prettier */
import { Request, Response, NextFunction } from 'express';
import * as YoutubeService from '../services/youtube.service';
import {
	YoutubeInfoQuerySchema,
	YoutubeMediaQuerySchema,
	YoutubeCaptionQuerySchema,
	YoutubeSummaryQuerySchema,
	YoutubeScreenshotQuerySchema,
	YoutubeScreenshotMultipleQuerySchema,
} from '../types/youtube.schemas';
import { z } from 'zod';

export const getInfo = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validatedQuery = YoutubeInfoQuerySchema.parse(req.query);
		const result = await YoutubeService.getYoutubeInfo(validatedQuery);
		res.json(result);
	} catch (error) {
		next(error);
	}
};

export const getMedia = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validatedQuery = YoutubeMediaQuerySchema.parse(req.query);
		const result = await YoutubeService.getYoutubeMedia(validatedQuery);
		res.json(result);
	} catch (error) {
		next(error);
	}
};

export const getCaption = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validatedQuery = YoutubeCaptionQuerySchema.parse(req.query);
		const result = await YoutubeService.getYoutubeCaption(validatedQuery);
		res.json(result);
	} catch (error) {
		next(error);
	}
};

export const getSummary = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validatedQuery = YoutubeSummaryQuerySchema.parse(req.query);
		const result = await YoutubeService.getYoutubeSummary(validatedQuery);
		res.json(result);
	} catch (error) {
		next(error);
	}
};

export const getScreenshot = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validatedQuery = YoutubeScreenshotQuerySchema.parse(req.query);
		const result = await YoutubeService.getYoutubeScreenshot(
			validatedQuery,
		);
		res.json(result);
	} catch (error) {
		next(error);
	}
};

export const getScreenshotMultiple = async (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	try {
		const validatedQuery = YoutubeScreenshotMultipleQuerySchema.parse(
			req.query,
		);
		const result = await YoutubeService.getYoutubeScreenshotMultiple(
			validatedQuery,
		);
		res.json(result);
	} catch (error) {
		next(error);
	}
};

// Generic CLI controller response type
type CliControllerResponse = { success: boolean; data: any; error?: string };

// Controller functions for CLI usage, directly calls the service
export const getYoutubeCaptionCli = async (
	params: z.infer<typeof YoutubeCaptionQuerySchema>,
): Promise<CliControllerResponse> => {
	try {
		const serviceResponse = await YoutubeService.getYoutubeCaption(params); // Returns { success: boolean, data: T }

		if (serviceResponse.success) {
			return {
				success: true,
				data: serviceResponse.data,
			};
		} else {
			// Service indicated failure (e.g. API returned success: false, or status !== 1 from VidCap API)
			// The 'data' field from the service in this case might contain the API's error details.
			return {
				success: false,
				data: null, // Don't pass API's raw error data directly as CLI's 'data' field
				error: `Failed to get captions. API/Service indicated failure. Details: ${JSON.stringify(
					serviceResponse.data,
					null,
					2,
				)}`,
			};
		}
	} catch (error) {
		// Catches errors THROWN by YoutubeService.getYoutubeCaption (e.g. network, Zod parse of API response)
		return {
			success: false,
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred in the controller processing the service call',
		};
	}
};

// YouTube Info CLI controller
export const getYoutubeInfoCli = async (
	params: z.infer<typeof YoutubeInfoQuerySchema>,
): Promise<CliControllerResponse> => {
	try {
		const serviceResponse = await YoutubeService.getYoutubeInfo(params);

		if (serviceResponse.success) {
			return {
				success: true,
				data: serviceResponse.data,
			};
		} else {
			return {
				success: false,
				data: null,
				error: `Failed to get video info. API/Service indicated failure. Details: ${JSON.stringify(
					serviceResponse.data,
					null,
					2,
				)}`,
			};
		}
	} catch (error) {
		return {
			success: false,
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred in the controller processing the service call',
		};
	}
};

// YouTube Media CLI controller
export const getYoutubeMediaCli = async (
	params: z.infer<typeof YoutubeMediaQuerySchema>,
): Promise<CliControllerResponse> => {
	try {
		const serviceResponse = await YoutubeService.getYoutubeMedia(params);

		if (serviceResponse.success) {
			return {
				success: true,
				data: serviceResponse.data,
			};
		} else {
			return {
				success: false,
				data: null,
				error: `Failed to get media formats. API/Service indicated failure. Details: ${JSON.stringify(
					serviceResponse.data,
					null,
					2,
				)}`,
			};
		}
	} catch (error) {
		return {
			success: false,
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred in the controller processing the service call',
		};
	}
};

// YouTube Summary CLI controller
export const getYoutubeSummaryCli = async (
	params: z.infer<typeof YoutubeSummaryQuerySchema>,
): Promise<CliControllerResponse> => {
	try {
		const serviceResponse = await YoutubeService.getYoutubeSummary(params);

		if (serviceResponse.success) {
			return {
				success: true,
				data: serviceResponse.data,
			};
		} else {
			return {
				success: false,
				data: null,
				error: `Failed to get summary. API/Service indicated failure. Details: ${JSON.stringify(
					serviceResponse.data,
					null,
					2,
				)}`,
			};
		}
	} catch (error) {
		return {
			success: false,
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred in the controller processing the service call',
		};
	}
};

// YouTube Screenshot CLI controller
export const getYoutubeScreenshotCli = async (
	params: z.infer<typeof YoutubeScreenshotQuerySchema>,
): Promise<CliControllerResponse> => {
	try {
		const serviceResponse = await YoutubeService.getYoutubeScreenshot(
			params,
		);

		if (serviceResponse.success) {
			return {
				success: true,
				data: serviceResponse.data,
			};
		} else {
			return {
				success: false,
				data: null,
				error: `Failed to get screenshot. API/Service indicated failure. Details: ${JSON.stringify(
					serviceResponse.data,
					null,
					2,
				)}`,
			};
		}
	} catch (error) {
		return {
			success: false,
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred in the controller processing the service call',
		};
	}
};

// YouTube Screenshot Multiple CLI controller
export const getYoutubeScreenshotMultipleCli = async (
	params: z.infer<typeof YoutubeScreenshotMultipleQuerySchema>,
): Promise<CliControllerResponse> => {
	try {
		const serviceResponse =
			await YoutubeService.getYoutubeScreenshotMultiple(params);

		if (serviceResponse.success) {
			return {
				success: true,
				data: serviceResponse.data,
			};
		} else {
			return {
				success: false,
				data: null,
				error: `Failed to get multiple screenshots. API/Service indicated failure. Details: ${JSON.stringify(
					serviceResponse.data,
					null,
					2,
				)}`,
			};
		}
	} catch (error) {
		return {
			success: false,
			data: null,
			error:
				error instanceof Error
					? error.message
					: 'An unknown error occurred in the controller processing the service call',
		};
	}
};
