import { Command } from 'commander';
import { z } from 'zod';
import { YoutubeCaptionQuerySchema } from '../types/youtube.schemas';
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
				const result =
					await youtubeController.getYoutubeCaptionCli(parsedOptions);

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

	// Add other YouTube commands here if needed
	// e.g., youtubeCommand.command('getInfo')...
}
