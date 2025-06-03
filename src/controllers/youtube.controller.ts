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
		const result =
			await YoutubeService.getYoutubeScreenshot(validatedQuery);
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
		const result =
			await YoutubeService.getYoutubeScreenshotMultiple(validatedQuery);
		res.json(result);
	} catch (error) {
		next(error);
	}
};

// Controller function for CLI usage, directly calls the service
export const getYoutubeCaptionCli = async (
	params: z.infer<typeof YoutubeCaptionQuerySchema>,
): Promise<{ success: boolean; data: any; error?: string }> => {
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
