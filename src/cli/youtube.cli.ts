/* eslint-disable prettier/prettier */
import { Command } from 'commander';
import { z } from 'zod';
import {
	YoutubeInfoQuerySchema,
	YoutubeMediaQuerySchema,
	YoutubeCaptionQuerySchema,
	YoutubeSummaryQuerySchema,
	YoutubeScreenshotQuerySchema,
	YoutubeScreenshotMultipleQuerySchema,
} from '../types/youtube.schemas';
import * as youtubeController from '../controllers/youtube.controller';
import { Logger } from '../utils/logger.util';

const logger = Logger.forContext('cli/youtube.cli.ts');

export function registerYoutubeCommands(program: Command) {
	const youtubeCommand = program
		.command('youtube')
		.description('YouTube related commands');

	youtubeCommand
		.command('getCaption')
		.description('Get video captions/transcript from YouTube.')
		.option('-u, --url <url>', 'YouTube video URL (required)')
		.option(
			'-l, --locale <locale>',
			'Language code for captions (e.g., en, es, fr). Default: en',
		)
		.option('-m, --model <model>', 'AI model for processing (optional)')
		.option(
			'-e, --ext <ext>',
			'File extension for captions (json3, srv1, srv2, srv3, ttml, vtt). Default: json3',
		)
		.action(async (options) => {
			logger.debug(
				'youtube getCaption CLI command invoked with options:',
				options,
			);
			try {
				// Validate URL presence manually as Zod schema marks it required
				if (!options.url) {
					console.error('Error: --url option is required.');
					process.exit(1);
				}

				const parsedOptions = YoutubeCaptionQuerySchema.parse({
					url: options.url,
					locale: options.locale,
					model: options.model,
					ext: options.ext,
				});

				logger.debug(
					'Parsed CLI options for getCaption:',
					parsedOptions,
				);
				const result = await youtubeController.getYoutubeCaptionCli(
					parsedOptions,
				);

				if (result.success) {
					console.log(JSON.stringify(result.data, null, 2));
				} else {
					console.error(
						'Error fetching captions:',
						result.error || 'Unknown error',
					);
				}
			} catch (error: any) {
				logger.error('Error in youtube getCaption CLI command:', error);
				if (error instanceof z.ZodError) {
					console.error(
						'Validation Error:',
						error.errors
							.map((e) => `${e.path.join('.')} - ${e.message}`)
							.join('\n'),
					);
				} else {
					console.error(
						'An unexpected error occurred:',
						error.message || error,
					);
				}
				process.exit(1);
			}
		});

	// YouTube Info Command
	youtubeCommand
		.command('getInfo')
		.description('Get and save YouTube video information.')
		.option('-u, --url <url>', 'YouTube video URL (required)')
		.option(
			'-c, --cache <boolean>',
			'Whether to cache video info. Default: true',
		)
		.action(async (options) => {
			logger.debug(
				'youtube getInfo CLI command invoked with options:',
				options,
			);
			try {
				// Validate URL presence manually
				if (!options.url) {
					console.error('Error: --url option is required.');
					process.exit(1);
				}

				const parsedOptions = YoutubeInfoQuerySchema.parse({
					url: options.url,
					cache:
						options.cache === 'false'
							? false
							: options.cache === 'true'
							? true
							: undefined,
				});

				logger.debug('Parsed CLI options for getInfo:', parsedOptions);
				const result = await youtubeController.getYoutubeInfoCli(
					parsedOptions,
				);

				if (result.success) {
					console.log(JSON.stringify(result.data, null, 2));
				} else {
					console.error(
						'Error fetching video info:',
						result.error || 'Unknown error',
					);
				}
			} catch (error: any) {
				logger.error('Error in youtube getInfo CLI command:', error);
				if (error instanceof z.ZodError) {
					console.error(
						'Validation Error:',
						error.errors
							.map((e) => `${e.path.join('.')} - ${e.message}`)
							.join('\n'),
					);
				} else {
					console.error(
						'An unexpected error occurred:',
						error.message || error,
					);
				}
				process.exit(1);
			}
		});

	// YouTube Media Command
	youtubeCommand
		.command('getMedia')
		.description('Get available media formats for a YouTube video.')
		.option('-u, --url <url>', 'YouTube video URL (required)')
		.action(async (options) => {
			logger.debug(
				'youtube getMedia CLI command invoked with options:',
				options,
			);
			try {
				// Validate URL presence manually
				if (!options.url) {
					console.error('Error: --url option is required.');
					process.exit(1);
				}

				const parsedOptions = YoutubeMediaQuerySchema.parse({
					url: options.url,
				});

				logger.debug('Parsed CLI options for getMedia:', parsedOptions);
				const result = await youtubeController.getYoutubeMediaCli(
					parsedOptions,
				);

				if (result.success) {
					console.log(JSON.stringify(result.data, null, 2));
				} else {
					console.error(
						'Error fetching media formats:',
						result.error || 'Unknown error',
					);
				}
			} catch (error: any) {
				logger.error('Error in youtube getMedia CLI command:', error);
				if (error instanceof z.ZodError) {
					console.error(
						'Validation Error:',
						error.errors
							.map((e) => `${e.path.join('.')} - ${e.message}`)
							.join('\n'),
					);
				} else {
					console.error(
						'An unexpected error occurred:',
						error.message || error,
					);
				}
				process.exit(1);
			}
		});

	// YouTube Summary Command
	youtubeCommand
		.command('getSummary')
		.description('Get AI-generated summary of YouTube video content.')
		.option('-u, --url <url>', 'YouTube video URL (required)')
		.option(
			'-l, --locale <locale>',
			'Target language code for summary. Default: en',
		)
		.option('-m, --model <model>', 'AI model for summarization')
		.option(
			'-s, --screenshot <value>',
			"'1' to enable auto-screenshots for summary parts. Default: '0'",
		)
		.option('-c, --cache <boolean>', 'Whether to use cached results')
		.action(async (options) => {
			logger.debug(
				'youtube getSummary CLI command invoked with options:',
				options,
			);
			try {
				// Validate URL presence manually
				if (!options.url) {
					console.error('Error: --url option is required.');
					process.exit(1);
				}

				const parsedOptions = YoutubeSummaryQuerySchema.parse({
					url: options.url,
					locale: options.locale,
					model: options.model,
					screenshot: options.screenshot,
					cache:
						options.cache === 'false'
							? false
							: options.cache === 'true'
							? true
							: undefined,
				});

				logger.debug(
					'Parsed CLI options for getSummary:',
					parsedOptions,
				);
				const result = await youtubeController.getYoutubeSummaryCli(
					parsedOptions,
				);

				if (result.success) {
					console.log(JSON.stringify(result.data, null, 2));
				} else {
					console.error(
						'Error fetching summary:',
						result.error || 'Unknown error',
					);
				}
			} catch (error: any) {
				logger.error('Error in youtube getSummary CLI command:', error);
				if (error instanceof z.ZodError) {
					console.error(
						'Validation Error:',
						error.errors
							.map((e) => `${e.path.join('.')} - ${e.message}`)
							.join('\n'),
					);
				} else {
					console.error(
						'An unexpected error occurred:',
						error.message || error,
					);
				}
				process.exit(1);
			}
		});

	// YouTube Screenshot Command
	youtubeCommand
		.command('getScreenshot')
		.description('Get screenshot from YouTube video at specific timestamp.')
		.option('-u, --url <url>', 'YouTube video URL (required)')
		.option(
			'-s, --second <second>',
			'Timestamp in seconds or YouTube time format. Default: 0',
		)
		.action(async (options) => {
			logger.debug(
				'youtube getScreenshot CLI command invoked with options:',
				options,
			);
			try {
				// Validate URL presence manually
				if (!options.url) {
					console.error('Error: --url option is required.');
					process.exit(1);
				}

				const parsedOptions = YoutubeScreenshotQuerySchema.parse({
					url: options.url,
					second: options.second,
				});

				logger.debug(
					'Parsed CLI options for getScreenshot:',
					parsedOptions,
				);
				const result = await youtubeController.getYoutubeScreenshotCli(
					parsedOptions,
				);

				if (result.success) {
					console.log(JSON.stringify(result.data, null, 2));
				} else {
					console.error(
						'Error fetching screenshot:',
						result.error || 'Unknown error',
					);
				}
			} catch (error: any) {
				logger.error(
					'Error in youtube getScreenshot CLI command:',
					error,
				);
				if (error instanceof z.ZodError) {
					console.error(
						'Validation Error:',
						error.errors
							.map((e) => `${e.path.join('.')} - ${e.message}`)
							.join('\n'),
					);
				} else {
					console.error(
						'An unexpected error occurred:',
						error.message || error,
					);
				}
				process.exit(1);
			}
		});

	// YouTube Screenshot Multiple Command
	youtubeCommand
		.command('getScreenshotMultiple')
		.description(
			'Get multiple screenshots from YouTube video at different timestamps.',
		)
		.option('-u, --url <url>', 'YouTube video URL (required)')
		.option(
			'-s, --seconds <seconds...>',
			'Array of timestamps in seconds. Example: 10 30 60',
		)
		.action(async (options) => {
			logger.debug(
				'youtube getScreenshotMultiple CLI command invoked with options:',
				options,
			);
			try {
				// Validate URL presence manually
				if (!options.url) {
					console.error('Error: --url option is required.');
					process.exit(1);
				}

				// Convert CLI array input to the expected format
				const seconds = options.seconds || ['0'];

				const parsedOptions =
					YoutubeScreenshotMultipleQuerySchema.parse({
						url: options.url,
						second: seconds,
					});

				logger.debug(
					'Parsed CLI options for getScreenshotMultiple:',
					parsedOptions,
				);
				const result =
					await youtubeController.getYoutubeScreenshotMultipleCli(
						parsedOptions,
					);

				if (result.success) {
					console.log(JSON.stringify(result.data, null, 2));
				} else {
					console.error(
						'Error fetching multiple screenshots:',
						result.error || 'Unknown error',
					);
				}
			} catch (error: any) {
				logger.error(
					'Error in youtube getScreenshotMultiple CLI command:',
					error,
				);
				if (error instanceof z.ZodError) {
					console.error(
						'Validation Error:',
						error.errors
							.map((e) => `${e.path.join('.')} - ${e.message}`)
							.join('\n'),
					);
				} else {
					console.error(
						'An unexpected error occurred:',
						error.message || error,
					);
				}
				process.exit(1);
			}
		});
}
