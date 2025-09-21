import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { Logger } from '../utils/logger.util';
import { formatErrorForMcpTool } from '../utils/error.util';
import * as YoutubeService from '../services/youtube.service.js';
import {
	YoutubeInfoQuerySchema,
	YoutubeMediaQuerySchema,
	YoutubeCaptionQuerySchema,
	YoutubeSummaryQuerySchema,
	YoutubeScreenshotQuerySchema,
	YoutubeScreenshotMultipleQuerySchema,
	YoutubeCommentsToolSchema,
	YoutubeSearchQuerySchema,
} from '../types/youtube.schemas';
// ControllerResponse is not directly used here when calling services

const logger = Logger.forContext('tools/youtube.tool.ts');

// Helper to wrap service calls and format for MCP
async function handleServiceToolExecution<TArgs extends object, TData>(
	serviceFunction: (
		args: TArgs,
	) => Promise<{ success: boolean; data: TData; error?: any }>,
	args: TArgs,
	toolName: string,
): Promise<CallToolResult> {
	try {
		logger.debug(`Tool ${toolName} called with args`, args); // Reverted to single line
		const result = await serviceFunction(args);
		if (result.success) {
			return {
				content: [
					{
						type: 'text' as const,
						text: JSON.stringify(result.data),
					},
				],
			};
		} else {
			// Handle cases where success is false but not an exception (e.g., API-level error)
			logger.error(
				`Tool ${toolName} service call returned success:false`,
				result.error || result,
			);
			return formatErrorForMcpTool(
				result.error || new Error('Service returned success:false'),
			);
		}
	} catch (error) {
		logger.error(`Tool ${toolName} failed`, error); // Reverted to single line
		return formatErrorForMcpTool(error);
	}
}

export function register(server: McpServer) {
	server.tool(
		'youtube_getInfo',
		'Get and save YouTube video information. Provide a YouTube video URL.',
		YoutubeInfoQuerySchema.shape,
		async (args: z.infer<typeof YoutubeInfoQuerySchema>) =>
			handleServiceToolExecution(
				YoutubeService.getYoutubeInfo,
				args,
				'youtube_getInfo',
			),
	);

	server.tool(
		'youtube_getMedia',
		'Get available media formats for a YouTube video. Provide a YouTube video URL.',
		YoutubeMediaQuerySchema.shape,
		async (args: z.infer<typeof YoutubeMediaQuerySchema>) =>
			handleServiceToolExecution(
				YoutubeService.getYoutubeMedia,
				args,
				'youtube_getMedia',
			),
	);

	server.tool(
		'youtube_getCaption',
		'Get video captions/transcript. Provide a YouTube video URL and optionally locale, model, and extension.',
		YoutubeCaptionQuerySchema.shape,
		async (args: z.infer<typeof YoutubeCaptionQuerySchema>) =>
			handleServiceToolExecution(
				YoutubeService.getYoutubeCaption,
				args,
				'youtube_getCaption',
			),
	);

	server.tool(
		'youtube_getSummary',
		'Get AI-generated summary of video content. Provide a YouTube video URL and optionally locale, model, screenshot flag, and cache preference.',
		YoutubeSummaryQuerySchema.shape,
		async (args: z.infer<typeof YoutubeSummaryQuerySchema>) =>
			handleServiceToolExecution(
				YoutubeService.getYoutubeSummary,
				args,
				'youtube_getSummary',
			),
	);

	server.tool(
		'youtube_getScreenshot',
		'Get screenshot from video at specific timestamp. Provide a YouTube video URL and optionally a timestamp (in seconds or YouTube format).',
		YoutubeScreenshotQuerySchema.shape,
		async (args: z.infer<typeof YoutubeScreenshotQuerySchema>) =>
			handleServiceToolExecution(
				YoutubeService.getYoutubeScreenshot,
				args,
				'youtube_getScreenshot',
			),
	);

	server.tool(
		'youtube_getScreenshotMultiple',
		'Get multiple screenshots from video at different timestamps. Provide a YouTube video URL and an array of timestamps.',
		YoutubeScreenshotMultipleQuerySchema.shape,
		async (args: z.infer<typeof YoutubeScreenshotMultipleQuerySchema>) =>
			handleServiceToolExecution(
				YoutubeService.getYoutubeScreenshotMultiple,
				args,
				'youtube_getScreenshotMultiple',
			),
	);

	server.tool(
		'youtube_getComments',
		'Get YouTube video comments with optional pagination and replies. Provide a YouTube video ID.',
		YoutubeCommentsToolSchema.shape,
		async (args: z.infer<typeof YoutubeCommentsToolSchema>) =>
			handleServiceToolExecution(
				YoutubeService.getYoutubeComments,
				args,
				'youtube_getComments',
			),
	);

	server.tool(
		'youtube_search',
		'Search YouTube videos with query and optional filters. Provide search query and optional parameters for pagination and filtering.',
		YoutubeSearchQuerySchema.shape,
		async (args: z.infer<typeof YoutubeSearchQuerySchema>) =>
			handleServiceToolExecution(
				YoutubeService.getYoutubeSearch,
				args,
				'youtube_search',
			),
	);

	logger.info('YouTube tools registered');
}

export default { register };
