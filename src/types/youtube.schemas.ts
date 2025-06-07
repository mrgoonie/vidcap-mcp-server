import { z } from 'zod';

// Common success/data wrapper
const successDataSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
	z.object({
		success: z.boolean(),
		data: dataSchema.nullable(), // data key is required, value is Type | null
		error: z.any().optional(),
	});

// /youtube/info
export const YoutubeInfoQuerySchema = z.object({
	url: z.string().url(),
	cache: z.boolean().optional().default(true),
});

export const YoutubeInfoDataSchema = z.object({
	title: z.string(),
	description: z.string(),
	duration: z.number(),
});

export const YoutubeInfoResponseSchema = successDataSchema(
	YoutubeInfoDataSchema,
);

// /youtube/media
export const YoutubeMediaQuerySchema = z.object({
	url: z.string().url(),
});

export const YoutubeMediaDataSchema = z.object({
	videoFiles: z.array(z.any()), // Define more specific object schema if known
	audioFiles: z.array(z.any()), // Define more specific object schema if known
});

export const YoutubeMediaResponseSchema = successDataSchema(
	YoutubeMediaDataSchema,
);

// /youtube/caption
export const YoutubeCaptionQuerySchema = z.object({
	url: z.string().url(),
	locale: z.string().optional().default('en'),
	model: z.string().optional(),
	ext: z.enum(['json3', 'srv1', 'srv2', 'srv3', 'ttml', 'vtt']).optional(),
});

// This schema was accidentally corrupted. Restoring it.
export const YoutubeVideoMetadataSchema = z.object({
	id: z.string(), // Assuming 'id' was part of it, common field.
	sourceId: z.string(),
	channelId: z.string().optional(),
	channelName: z.string().optional(),
	channelUrl: z.string().url().optional(),
	videoProvider: z.string(),
	title: z.string(),
	description: z.string().optional(),
	duration: z.number(),
	thumbnailUrl: z.string().url().optional(),
	publishedAt: z.string().datetime().optional(),
	viewCount: z.number().optional(),
	likeCount: z.number().optional(),
	commentCount: z.number().optional(),
	tags: z.array(z.string()).optional(),
	category: z.string().optional(),
	defaultAudioLanguage: z.string().optional(),
	defaultCaptionLanguage: z.string().optional(),
	captionLocales: z.array(z.string()).optional(),
	chapters: z
		.array(
			z.object({
				title: z.string(),
				startTime: z.number(),
			}),
		)
		.optional(),
	width: z.number().optional(),
	height: z.number().optional(),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
}); // End of YoutubeVideoMetadataSchema

// Schema for a single caption segment as returned by VidCap API /youtube/caption
export const YoutubeCaptionSegmentSchema = z.object({
	text: z.string(),
	start: z.number(),
	duration: z.number(),
});

// Represents the 'data' field for caption results in the MCP tool's response.
// This will be an array of caption segments, aligning with VidCap API for /youtube/caption.
export const YoutubeCaptionDataSchema = z.union([
	z.array(YoutubeCaptionSegmentSchema),
	z.string(),
]);

// Schema for the 'data' object within the API's caption response
export const YoutubeApiCaptionDataObjectSchema = z.object({
	id: z.string(),
	videoProvider: z.string(),
	sourceId: z.string(),
	videoId: z.string(),
	ext: z.string(),
	content: z.string(),
});

// YoutubeCaptionApiResponseSchema: This is the schema for the raw response from the VidCap API /youtube/caption endpoint.
export const YoutubeCaptionApiResponseSchema = z.object({
	status: z.number(), // Vidcap uses 'status', not 'success'
	message: z.string().optional(), // Optional message from Vidcap
	data: YoutubeApiCaptionDataObjectSchema.optional(), // API returns this object structure
});

// YoutubeCaptionResponseSchema: This remains the schema for the service function's standardized return value.
// It uses the successDataSchema wrapper with the (newly redefined) YoutubeCaptionDataSchema.
export const YoutubeCaptionResponseSchema = z.object({
	success: z.boolean(),
	data: YoutubeCaptionDataSchema.nullable(), // data key is required, value is Type[] | null
	error: z.any().optional(),
});

// /youtube/summary
export const YoutubeSummaryQuerySchema = z.object({
	url: z.string().url(),
	locale: z.string().optional().default('en'),
	model: z.string().optional(),
	screenshot: z.string().optional().default('0'), // '1' to enable
	cache: z.boolean().optional(),
});

export const YoutubeSummaryDataSchema = z.string(); // Summary is a string

export const YoutubeSummaryResponseSchema = successDataSchema(
	YoutubeSummaryDataSchema,
);

// /youtube/screenshot
export const YoutubeScreenshotQuerySchema = z.object({
	url: z.string().url(),
	second: z.string().optional().default('0'),
});

export const YoutubeScreenshotDataSchema = z.object({
	url: z.string().url(),
	second: z.number(),
	image_url: z.string().url(),
});

export const YoutubeScreenshotResponseSchema = successDataSchema(
	YoutubeScreenshotDataSchema,
);

// /youtube/screenshot-multiple
export const YoutubeScreenshotMultipleQuerySchema = z.object({
	url: z.string().url(),
	second: z.array(z.string()).optional().default(['0']),
});

export const YoutubeScreenshotMultipleDataSchema = z.object({
	url: z.string().url(),
	image_urls: z.array(z.string().url()),
	seconds: z.array(z.number()),
});

export const YoutubeScreenshotMultipleResponseSchema = successDataSchema(
	YoutubeScreenshotMultipleDataSchema,
);
