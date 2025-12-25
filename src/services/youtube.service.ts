import axios from 'axios';
import { getApiClient } from '../utils/apiClientFactory.js';
import {
	YoutubeInfoQuerySchema,
	YoutubeInfoResponseSchema,
	YoutubeMediaQuerySchema,
	YoutubeMediaResponseSchema,
	YoutubeCaptionQuerySchema,
	YoutubeCaptionResponseSchema,
	YoutubeCaptionApiResponseSchema,
	YoutubeSummaryQuerySchema,
	YoutubeSummaryResponseSchema,
	YoutubeScreenshotQuerySchema,
	YoutubeScreenshotResponseSchema,
	YoutubeScreenshotMultipleQuerySchema,
	YoutubeScreenshotMultipleResponseSchema,
	YoutubeCommentsQuerySchema,
	YoutubeCommentsResponseSchema,
	YoutubeSearchQuerySchema,
	YoutubeSearchResponseSchema,
} from '../types/youtube.schemas';
import { z } from 'zod';
import { Logger } from '../utils/logger.util.js';

const logger = Logger.forContext('services/youtube.service.ts');

const VIDCAP_API_BASE_URL = 'https://vidcap.xyz/api/v1';

export const getVideoById = async (id: string): Promise<any> => {
	try {
		const apiClient = getApiClient();
		const response = await apiClient.get(
			`${VIDCAP_API_BASE_URL}/youtube/video/${id}`,
		);
		logger.debug(
			'Raw VidCap API response data for /youtube/video:',
			response.data,
		);
		return response.data;
	} catch (error) {
		logger.error('Error in getVideoById:', error);
		let errorMessage = 'Failed to fetch video information.';
		if (axios.isAxiosError(error)) {
			errorMessage = `API request failed for getVideoById: ${error.message}`;
			if (error.response) {
				logger.error(
					'Axios error response data for getVideoById:',
					error.response.data,
				);
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
			logger.error('Generic error in getVideoById:', error);
		} else {
			logger.error('Unknown error type in getVideoById:', error);
		}
		logger.info(`getVideoById resolved to error state: ${errorMessage}`);
		return {
			success: false,
			data: null,
			error: errorMessage,
		};
	}
};

/**
 * Fetches YouTube video information.
 * @param params - Query parameters including URL and cache option.
 * @returns Parsed video information.
 */
export const getYoutubeInfo = async (
	params: z.infer<typeof YoutubeInfoQuerySchema>,
): Promise<z.infer<typeof YoutubeInfoResponseSchema>> => {
	try {
		const apiClient = getApiClient();
		const response = await apiClient.get(
			`${VIDCAP_API_BASE_URL}/youtube/info`,
			{ params },
		);
		logger.debug(
			'Raw VidCap API response data for /youtube/info:',
			response.data,
		);
		const rawApiResponse = response.data as any; // Use 'as any' for easier raw access

		// Prepare the object for Zod parsing according to YoutubeInfoResponseSchema
		const transformedForParsing: z.infer<typeof YoutubeInfoResponseSchema> =
			{
				success: rawApiResponse.status === 1,
				data: null, // Initialize data as null
				error: undefined as string | undefined, // Initialize error as undefined
			};

		if (transformedForParsing.success) {
			// API returns flat structure: { status: 1, data: { title, description, duration, ... } }
			if (rawApiResponse.data) {
				transformedForParsing.data = {
					title: rawApiResponse.data.title,
					description: rawApiResponse.data.description,
					duration: rawApiResponse.data.duration,
				};
			} else {
				logger.warn(
					'API response for getYoutubeInfo: data is missing, but status is 1.',
				);
			}
		} else {
			// API call was not successful (status !== 1)
			transformedForParsing.error =
				rawApiResponse.message || 'API request indicated failure.';
		}

		return YoutubeInfoResponseSchema.parse(transformedForParsing);
	} catch (error) {
		logger.error('Error in getYoutubeInfo:', error);
		let errorMessage = 'Failed to fetch YouTube video information.';
		if (error instanceof z.ZodError) {
			errorMessage =
				'Validation error processing API response for getYoutubeInfo.';
			logger.error(
				'Zod validation errors in getYoutubeInfo:',
				error.errors,
			);
		} else if (axios.isAxiosError(error)) {
			errorMessage = `API request failed for getYoutubeInfo: ${error.message}`;
			if (error.response) {
				logger.error(
					'Axios error response data for getYoutubeInfo:',
					error.response.data,
				);
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
			logger.error('Generic error in getYoutubeInfo:', error);
		} else {
			logger.error('Unknown error type in getYoutubeInfo:', error);
		}
		logger.info(`getYoutubeInfo resolved to error state: ${errorMessage}`);
		return YoutubeInfoResponseSchema.parse({
			success: false,
			data: null,
			error: errorMessage,
		});
	}
};

/**
 * Fetches available media formats for a YouTube video.
 * @param params - Query parameters including URL.
 * @returns Parsed media formats information.
 */
export const getYoutubeMedia = async (
	params: z.infer<typeof YoutubeMediaQuerySchema>,
): Promise<z.infer<typeof YoutubeMediaResponseSchema>> => {
	try {
		const apiClient = getApiClient();
		const response = await apiClient.get(
			`${VIDCAP_API_BASE_URL}/youtube/media`,
			{ params },
		);
		logger.debug(
			'Raw VidCap API response data for /youtube/media:',
			response.data,
		);

		const rawApiResponse = response.data as any; // Use 'as any' for easier raw access

		// Prepare the object for Zod parsing according to YoutubeMediaResponseSchema
		const transformedForParsing: z.infer<
			typeof YoutubeMediaResponseSchema
		> = {
			success: rawApiResponse.status === 1,
			data: null, // Initialize data as null
			error: undefined as string | undefined, // Initialize error as undefined
		};

		if (transformedForParsing.success) {
			// If the API call was successful and the expected nested data structure exists
			if (rawApiResponse.data) {
				// Extract the media data according to the schema expectation
				transformedForParsing.data =
					rawApiResponse.data.data || rawApiResponse.data;
			} else {
				// API reported success, but the crucial data field is missing
				logger.warn(
					'API response for getYoutubeMedia: data field is missing, but status is 1.',
				);
			}
		} else {
			// API call was not successful (status !== 1)
			transformedForParsing.error =
				rawApiResponse.message || 'API request indicated failure.';
		}

		return YoutubeMediaResponseSchema.parse(transformedForParsing);
	} catch (error) {
		let errorMessage = 'Failed to fetch YouTube media formats.';
		if (error instanceof z.ZodError) {
			errorMessage =
				'Validation error processing API response for getYoutubeMedia.';
			logger.error(
				'Zod validation errors in getYoutubeMedia:',
				error.errors,
			);
		} else if (axios.isAxiosError(error)) {
			errorMessage = `API request failed for getYoutubeMedia: ${error.message}`;
			if (error.response) {
				logger.error(
					'Axios error response data for getYoutubeMedia:',
					error.response.data,
				);
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
			logger.error('Generic error in getYoutubeMedia:', error);
		} else {
			logger.error('Unknown error type in getYoutubeMedia:', error);
		}
		logger.info(`getYoutubeMedia resolved to error state: ${errorMessage}`);
		return YoutubeMediaResponseSchema.parse({
			success: false,
			data: null,
			error: errorMessage,
		});
	}
};

/**
 * Fetches video captions/transcript.
 * @param params - Query parameters including URL, locale, model, and extension.
 * @returns Parsed caption data.
 */
export const getYoutubeCaption = async (
	params: z.infer<typeof YoutubeCaptionQuerySchema>,
): Promise<z.infer<typeof YoutubeCaptionResponseSchema>> => {
	try {
		const apiClient = getApiClient();
		const apiResponse = await apiClient.get(
			`${VIDCAP_API_BASE_URL}/youtube/caption`,
			{ params },
		);
		logger.debug(
			'Raw VidCap API response data for /youtube/caption:',
			apiResponse.data,
		);

		const parsedApiResponse = YoutubeCaptionApiResponseSchema.parse(
			apiResponse.data,
		);

		if (parsedApiResponse.status === 1) {
			const videoData = parsedApiResponse.data?.videoId
				? await getVideoById(parsedApiResponse.data?.videoId)
				: null;
			const json = JSON.stringify({
				video: videoData?.data,
				caption: parsedApiResponse.data?.content,
			});
			return YoutubeCaptionResponseSchema.parse({
				success: true,
				data: json,
				error: null,
			});
		} else {
			logger.warn(
				`getYoutubeCaption API returned status ${parsedApiResponse.status}: ${parsedApiResponse.message}`,
			);
			return YoutubeCaptionResponseSchema.parse({
				success: false,
				data: null,
				error:
					parsedApiResponse.message ||
					'Failed to get captions due to API error.',
			});
		}
	} catch (error) {
		let errorMessage = 'Failed to process YouTube caption request.';
		if (error instanceof z.ZodError) {
			errorMessage =
				'Validation error processing API response for getYoutubeCaption.';
			logger.error(
				'Zod validation errors in getYoutubeCaption:',
				error.errors,
			);
		} else if (axios.isAxiosError(error)) {
			errorMessage = `API request failed for getYoutubeCaption: ${error.message}`;
			if (error.response) {
				logger.error(
					'Axios error response data for getYoutubeCaption:',
					error.response.data,
				);
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
			logger.error('Generic error in getYoutubeCaption:', error);
		} else {
			logger.error('Unknown error type in getYoutubeCaption:', error);
		}
		logger.info(
			`getYoutubeCaption resolved to error state: ${errorMessage}`,
		);
		return YoutubeCaptionResponseSchema.parse({
			success: false,
			data: null,
			error: errorMessage,
		});
	}
};

/**
 * Fetches AI-generated summary of video content.
 * @param params - Query parameters including URL, locale, model, screenshot, and cache options.
 * @returns Parsed summary data.
 */
export const getYoutubeSummary = async (
	params: z.infer<typeof YoutubeSummaryQuerySchema>,
): Promise<z.infer<typeof YoutubeSummaryResponseSchema>> => {
	try {
		const apiClient = getApiClient();
		const response = await apiClient.get(
			`${VIDCAP_API_BASE_URL}/youtube/summary`,
			{ params },
		);
		logger.debug(
			'Raw VidCap API response data for /youtube/summary:',
			response.data,
		);
		const rawApiResponse = response.data as any; // Use 'as any' for easier raw access

		// Prepare the object for Zod parsing according to YoutubeSummaryResponseSchema
		const transformedForParsing: z.infer<
			typeof YoutubeSummaryResponseSchema
		> = {
			success: rawApiResponse.status === 1,
			data: null, // Initialize data as null
			error: undefined as string | undefined, // Initialize error as undefined
		};

		if (transformedForParsing.success) {
			// If the API call was successful and the expected nested data structure exists
			if (rawApiResponse.data && rawApiResponse.data.content) {
				// The YoutubeSummaryDataSchema expects a string, and the content is in data.content
				transformedForParsing.data = rawApiResponse.data.content;
			} else if (
				rawApiResponse.data &&
				rawApiResponse.data.data &&
				rawApiResponse.data.data.content
			) {
				// Alternative location - sometimes the API nests data deeper as data.data.content
				transformedForParsing.data = rawApiResponse.data.data.content;
			} else if (
				rawApiResponse.data &&
				typeof rawApiResponse.data === 'string'
			) {
				// Handle case where data might be a direct string
				transformedForParsing.data = rawApiResponse.data;
			} else {
				// API reported success, but the crucial content field is missing
				logger.warn(
					'API response for getYoutubeSummary: content field is missing, but status is 1.',
				);
			}
		} else {
			// API call was not successful (status !== 1)
			transformedForParsing.error =
				rawApiResponse.message || 'API request indicated failure.';
		}

		return YoutubeSummaryResponseSchema.parse(transformedForParsing);
	} catch (error) {
		logger.error('Error in getYoutubeSummary:', error);
		let errorMessage = 'Failed to fetch YouTube video summary.';
		if (error instanceof z.ZodError) {
			errorMessage =
				'Validation error processing API response for getYoutubeSummary.';
			logger.error(
				'Zod validation errors in getYoutubeSummary:',
				error.errors,
			);
		} else if (axios.isAxiosError(error)) {
			errorMessage = `API request failed for getYoutubeSummary: ${error.message}`;
			if (error.response) {
				logger.error(
					'Axios error response data for getYoutubeSummary:',
					error.response.data,
				);
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
			logger.error('Generic error in getYoutubeSummary:', error);
		} else {
			logger.error('Unknown error type in getYoutubeSummary:', error);
		}
		logger.info(
			`getYoutubeSummary resolved to error state: ${errorMessage}`,
		);
		return YoutubeSummaryResponseSchema.parse({
			success: false,
			data: null,
			error: errorMessage,
		});
	}
};

/**
 * Fetches a screenshot from a video at a specific timestamp.
 * @param params - Query parameters including URL and timestamp (second).
 * @returns Parsed screenshot data.
 */
export const getYoutubeScreenshot = async (
	params: z.infer<typeof YoutubeScreenshotQuerySchema>,
): Promise<z.infer<typeof YoutubeScreenshotResponseSchema>> => {
	try {
		const apiClient = getApiClient();
		const response = await apiClient.get(
			`${VIDCAP_API_BASE_URL}/youtube/screenshot`,
			{ params },
		);
		logger.debug(
			'Raw VidCap API response data for /youtube/screenshot:',
			response.data,
		);

		const rawApiResponse = response.data as any; // Use 'as any' for easier raw access

		// Prepare the object for Zod parsing according to YoutubeScreenshotResponseSchema
		const transformedForParsing: z.infer<
			typeof YoutubeScreenshotResponseSchema
		> = {
			success: rawApiResponse.status === 1,
			data: null, // Initialize data as null
			error: undefined as string | undefined, // Initialize error as undefined
		};

		if (transformedForParsing.success) {
			// If the API call was successful and the expected nested data structure exists
			if (rawApiResponse.data) {
				// Extract the screenshot data according to the schema expectation
				transformedForParsing.data =
					rawApiResponse.data.data || rawApiResponse.data;
			} else {
				// API reported success, but the crucial data field is missing
				logger.warn(
					'API response for getYoutubeScreenshot: data field is missing, but status is 1.',
				);
			}
		} else {
			// API call was not successful (status !== 1)
			transformedForParsing.error =
				rawApiResponse.message || 'API request indicated failure.';
		}

		return YoutubeScreenshotResponseSchema.parse(transformedForParsing);
	} catch (error) {
		logger.error('Error in getYoutubeScreenshot:', error);
		let errorMessage = 'Failed to fetch YouTube video screenshot.';
		if (error instanceof z.ZodError) {
			errorMessage =
				'Validation error processing API response for getYoutubeScreenshot.';
			logger.error(
				'Zod validation errors in getYoutubeScreenshot:',
				error.errors,
			);
		} else if (axios.isAxiosError(error)) {
			errorMessage = `API request failed for getYoutubeScreenshot: ${error.message}`;
			if (error.response) {
				logger.error(
					'Axios error response data for getYoutubeScreenshot:',
					error.response.data,
				);
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
			logger.error('Generic error in getYoutubeScreenshot:', error);
		} else {
			logger.error('Unknown error type in getYoutubeScreenshot:', error);
		}
		logger.info(
			`getYoutubeScreenshot resolved to error state: ${errorMessage}`,
		);
		return YoutubeScreenshotResponseSchema.parse({
			success: false,
			data: null,
			error: errorMessage,
		});
	}
};

/**
 * Fetches multiple screenshots from a video at different timestamps.
 * @param params - Query parameters including URL and array of timestamps (second).
 * @returns Parsed multiple screenshots data.
 */
export const getYoutubeScreenshotMultiple = async (
	params: z.infer<typeof YoutubeScreenshotMultipleQuerySchema>,
): Promise<z.infer<typeof YoutubeScreenshotMultipleResponseSchema>> => {
	try {
		// The 'second' parameter for this endpoint is an array. Axios by default serializes
		// arrays as second[]=value1&second[]=value2. We need to ensure the API expects this format.
		// If it expects comma-separated values or a different format, paramsSerializer might be needed.
		// Assuming default serialization works for now based on typical API behavior.
		const apiClient = getApiClient();
		const response = await apiClient.get(
			`${VIDCAP_API_BASE_URL}/youtube/screenshot-multiple`,
			{
				params,
			},
		);
		logger.debug(
			'Raw VidCap API response data for /youtube/screenshot-multiple:',
			response.data,
		);

		const rawApiResponse = response.data as any; // Use 'as any' for easier raw access

		// Prepare the object for Zod parsing according to YoutubeScreenshotMultipleResponseSchema
		const transformedForParsing: z.infer<
			typeof YoutubeScreenshotMultipleResponseSchema
		> = {
			success: rawApiResponse.status === 1,
			data: null, // Initialize data as null
			error: undefined as string | undefined, // Initialize error as undefined
		};

		if (transformedForParsing.success) {
			// If the API call was successful and the expected nested data structure exists
			if (rawApiResponse.data) {
				// Extract the screenshot data according to the schema expectation
				transformedForParsing.data =
					rawApiResponse.data.data || rawApiResponse.data;
			} else {
				// API reported success, but the crucial data field is missing
				logger.warn(
					'API response for getYoutubeScreenshotMultiple: data field is missing, but status is 1.',
				);
			}
		} else {
			// API call was not successful (status !== 1)
			transformedForParsing.error =
				rawApiResponse.message || 'API request indicated failure.';
		}

		return YoutubeScreenshotMultipleResponseSchema.parse(
			transformedForParsing,
		);
	} catch (error) {
		logger.error('Error in getYoutubeScreenshotMultiple:', error);
		let errorMessage =
			'Failed to fetch multiple YouTube video screenshots.';
		if (error instanceof z.ZodError) {
			errorMessage =
				'Validation error processing API response for getYoutubeScreenshotMultiple.';
			logger.error(
				'Zod validation errors in getYoutubeScreenshotMultiple:',
				error.errors,
			);
		} else if (axios.isAxiosError(error)) {
			errorMessage = `API request failed for getYoutubeScreenshotMultiple: ${error.message}`;
			if (error.response) {
				logger.error(
					'Axios error response data for getYoutubeScreenshotMultiple:',
					error.response.data,
				);
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
			logger.error(
				'Generic error in getYoutubeScreenshotMultiple:',
				error,
			);
		} else {
			logger.error(
				'Unknown error type in getYoutubeScreenshotMultiple:',
				error,
			);
		}
		logger.info(
			`getYoutubeScreenshotMultiple resolved to error state: ${errorMessage}`,
		);
		return YoutubeScreenshotMultipleResponseSchema.parse({
			success: false,
			data: null,
			error: errorMessage,
		});
	}
};

/**
 * Fetches YouTube video comments with optional pagination and replies.
 * @param params - Query parameters including URL/videoId, order, format, pagination, and replies.
 * @returns Parsed comments data.
 */
export const getYoutubeComments = async (
	params: z.infer<typeof YoutubeCommentsQuerySchema>,
): Promise<z.infer<typeof YoutubeCommentsResponseSchema>> => {
	try {
		const apiClient = getApiClient();
		const response = await apiClient.get(
			`${VIDCAP_API_BASE_URL}/youtube/comments`,
			{ params },
		);
		logger.debug(
			'Raw VidCap API response data for /youtube/comments:',
			response.data,
		);

		const rawApiResponse = response.data as any; // Use 'as any' for easier raw access

		// Prepare the object for Zod parsing according to YoutubeCommentsResponseSchema
		const transformedForParsing: z.infer<
			typeof YoutubeCommentsResponseSchema
		> = {
			success: rawApiResponse.status === 1,
			data: null, // Initialize data as null
			error: undefined as string | undefined, // Initialize error as undefined
		};

		if (transformedForParsing.success) {
			// If the API call was successful and the expected data structure exists
			if (rawApiResponse.data) {
				// Check if data is directly an array of comments (current API behavior)
				if (Array.isArray(rawApiResponse.data)) {
					transformedForParsing.data = {
						nextPageToken: rawApiResponse.nextPageToken, // Check top level for pagination token
						data: rawApiResponse.data, // Use the array of comments directly
					};
				} else {
					// Handle nested structure for backward compatibility
					const commentsData =
						rawApiResponse.data.data || rawApiResponse.data;
					transformedForParsing.data = {
						nextPageToken: commentsData.nextPageToken,
						data: commentsData.data || commentsData.comments || [],
					};
				}
			} else {
				// API reported success, but the crucial data field is missing
				logger.warn(
					'API response for getYoutubeComments: data field is missing, but status is 1.',
				);
			}
		} else {
			// API call was not successful (status !== 1)
			transformedForParsing.error =
				rawApiResponse.message || 'API request indicated failure.';
		}

		return YoutubeCommentsResponseSchema.parse(transformedForParsing);
	} catch (error) {
		logger.error('Error in getYoutubeComments:', error);
		let errorMessage = 'Failed to fetch YouTube video comments.';
		if (error instanceof z.ZodError) {
			errorMessage =
				'Validation error processing API response for getYoutubeComments.';
			logger.error(
				'Zod validation errors in getYoutubeComments:',
				error.errors,
			);
		} else if (axios.isAxiosError(error)) {
			errorMessage = `API request failed for getYoutubeComments: ${error.message}`;
			if (error.response) {
				logger.error(
					'Axios error response data for getYoutubeComments:',
					error.response.data,
				);
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
			logger.error('Generic error in getYoutubeComments:', error);
		} else {
			logger.error('Unknown error type in getYoutubeComments:', error);
		}
		logger.info(
			`getYoutubeComments resolved to error state: ${errorMessage}`,
		);
		return YoutubeCommentsResponseSchema.parse({
			success: false,
			data: null,
			error: errorMessage,
		});
	}
};

/**
 * Searches YouTube videos based on query parameters.
 * @param params - Query parameters including search query, pagination, and filters.
 * @returns Parsed search results data.
 */
export const getYoutubeSearch = async (
	params: z.infer<typeof YoutubeSearchQuerySchema>,
): Promise<z.infer<typeof YoutubeSearchResponseSchema>> => {
	try {
		const apiClient = getApiClient();
		const response = await apiClient.get(
			`${VIDCAP_API_BASE_URL}/youtube/search`,
			{ params },
		);
		logger.debug(
			'Raw VidCap API response data for /youtube/search:',
			response.data,
		);

		const rawApiResponse = response.data as any; // Use 'as any' for easier raw access

		// Prepare the object for Zod parsing according to YoutubeSearchResponseSchema
		const transformedForParsing: z.infer<
			typeof YoutubeSearchResponseSchema
		> = {
			success: rawApiResponse.status === 1,
			data: null, // Initialize data as null
			error: undefined as string | undefined, // Initialize error as undefined
		};

		if (transformedForParsing.success) {
			// If the API call was successful and the expected data structure exists
			if (rawApiResponse.data) {
				// Check if data is directly the search results structure
				if (
					rawApiResponse.data.items ||
					Array.isArray(rawApiResponse.data)
				) {
					const searchData = rawApiResponse.data;
					transformedForParsing.data = {
						nextPageToken: searchData.nextPageToken,
						prevPageToken: searchData.prevPageToken,
						totalResults: searchData.totalResults,
						resultsPerPage: searchData.resultsPerPage,
						items: Array.isArray(searchData)
							? searchData
							: searchData.items || [],
					};
				} else {
					// Handle nested structure for backward compatibility
					const searchData =
						rawApiResponse.data.data || rawApiResponse.data;
					transformedForParsing.data = {
						nextPageToken: searchData.nextPageToken,
						prevPageToken: searchData.prevPageToken,
						totalResults: searchData.totalResults,
						resultsPerPage: searchData.resultsPerPage,
						items: searchData.items || searchData.results || [],
					};
				}
			} else {
				// API reported success, but the crucial data field is missing
				logger.warn(
					'API response for getYoutubeSearch: data field is missing, but status is 1.',
				);
			}
		} else {
			// API call was not successful (status !== 1)
			transformedForParsing.error =
				rawApiResponse.message || 'API request indicated failure.';
		}

		return YoutubeSearchResponseSchema.parse(transformedForParsing);
	} catch (error) {
		logger.error('Error in getYoutubeSearch:', error);
		let errorMessage = 'Failed to search YouTube videos.';
		if (error instanceof z.ZodError) {
			errorMessage =
				'Validation error processing API response for getYoutubeSearch.';
			logger.error(
				'Zod validation errors in getYoutubeSearch:',
				error.errors,
			);
		} else if (axios.isAxiosError(error)) {
			errorMessage = `API request failed for getYoutubeSearch: ${error.message}`;
			if (error.response) {
				logger.error(
					'Axios error response data for getYoutubeSearch:',
					error.response.data,
				);
			}
		} else if (error instanceof Error) {
			errorMessage = error.message;
			logger.error('Generic error in getYoutubeSearch:', error);
		} else {
			logger.error('Unknown error type in getYoutubeSearch:', error);
		}
		logger.info(
			`getYoutubeSearch resolved to error state: ${errorMessage}`,
		);
		return YoutubeSearchResponseSchema.parse({
			success: false,
			data: null,
			error: errorMessage,
		});
	}
};
