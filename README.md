# VidCap YouTube API - MCP Server

This project provides a Model Context Protocol (MCP) server that acts as a proxy to the VidCap YouTube API, allowing AI assistants to easily access YouTube video data and functionalities. It also serves as a boilerplate for building custom MCP servers.

- [Github](https://github.com/mrgoonie/vidcap-mcp-server)
- [NPM](https://www.npmjs.com/package/vidcap-mcp-server)

## VidCap YouTube API

This server also proxies requests to the VidCap YouTube API, providing convenient access to YouTube video data and functionalities. You will need a `VIDCAP_API_KEY` set in your environment variables.

Endpoints are available under the `/api/v1/youtube/` path:

- **GET `/info`**
    - Description: Get and save YouTube video information.
    - Query Parameters:
        - `url` (string, required): YouTube video URL.
        - `cache` (boolean, optional, default: true): Whether to cache video info.
- **GET `/media`**
    - Description: Get available media formats for a YouTube video.
    - Query Parameters:
        - `url` (string, required): YouTube video URL.
- **GET `/caption`**
    - Description: Get video captions/transcript.
    - Query Parameters:
        - `url` (string, required): YouTube video URL.
        - `locale` (string, optional, default: 'en'): Language code for captions.
        - `model` (string, optional): AI model for processing.
        - `ext` (enum, optional): File extension for captions (json3, srv1, srv2, srv3, ttml, vtt).
- **GET `/summary`**
    - Description: Get AI-generated summary of video content.
    - Query Parameters:
        - `url` (string, required): YouTube video URL.
        - `locale` (string, optional, default: 'en'): Target language code for summary.
        - `model` (string, optional): AI model for summarization.
        - `screenshot` (string, optional, default: '0'): '1' to enable auto-screenshots for summary parts.
        - `cache` (boolean, optional): Whether to use cached results.
- **GET `/screenshot`**
    - Description: Get screenshot from video at specific timestamp.
    - Query Parameters:
        - `url` (string, required): YouTube video URL.
        - `second` (string, optional, default: '0'): Timestamp in seconds or YouTube time format.
- **GET `/screenshot-multiple`**
    - Description: Get multiple screenshots from video at different timestamps.
    - Query Parameters:
        - `url` (string, required): YouTube video URL.
        - `second` (array of strings, optional, default: ['0']): Array of timestamps in seconds.
- **GET `/comments`**
    - Description: Get YouTube video comments with optional pagination and replies.
    - Query Parameters:
        - `url` (string, optional): YouTube video URL.
        - `videoId` (string, optional): YouTube video ID. Note: Either `url` or `videoId` is required.
        - `order` (enum, optional, default: 'time'): Sort order for comments ('time', 'relevance').
        - `format` (enum, optional, default: 'plainText'): Format of comment text ('plainText', 'html').
        - `pageToken` (string, optional): Pagination token for retrieving next page of comments.
        - `includeReplies` (boolean, optional, default: false): Include comment replies.
        - `hl` (string, optional, default: 'en'): Language code for comments.

## Supported Transports

- [x] ["stdio"](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#stdio) transport - Default transport for CLI usage
- [x] ["Streamable HTTP"](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#streamable-http) transport - For web-based clients
    - [ ] Implement auth ("Authorization" headers with `Bearer <token>`)
- [ ] ~~"sse" transport~~ **[(Deprecated)](https://modelcontextprotocol.io/specification/2025-03-26/basic/transports#backwards-compatibility)**
- [ ] Write tests

## How to use

### CLI

This server can be extended with CLI commands. Currently, the primary interaction is via the HTTP API endpoints for the VidCap YouTube API.

Example of running the server (which exposes the API):

```bash
npm run dev:server:http
```

Examples of running the CLI commands:

```bash
# Get YouTube video information
npm run dev:cli -- youtube getInfo --url "<your_youtube_url>" --cache true

# Get available media formats for a YouTube video
npm run dev:cli -- youtube getMedia --url "<your_youtube_url>"

# Get video captions/transcript
npm run dev:cli -- youtube getCaption --url "<your_youtube_url>" --locale "en" --model "<optional_model>"

# Get AI-generated summary of video content
npm run dev:cli -- youtube getSummary --url "<your_youtube_url>" --locale "en" --model "<optional_model>" --screenshot "0" --cache true

# Get screenshot from video at specific timestamp
npm run dev:cli -- youtube getScreenshot --url "<your_youtube_url>" --second "30"

# Get multiple screenshots from video at different timestamps
npm run dev:cli -- youtube getScreenshotMultiple --url "<your_youtube_url>" --seconds 10 30 60

# Get YouTube video comments with pagination and replies
npm run dev:cli -- youtube getComments --url "<your_youtube_url>" --includeReplies --order relevance

# Get YouTube video comments using videoId with specific page
npm run dev:cli -- youtube getComments --videoId "dQw4w9WgXcQ" --pageToken "<next_page_token>"
```

### MCP Setup

**For local configuration with stdio transport:**

```json
{
	"mcpServers": {
		"vidcap-youtube-api": {
			"command": "node",
			"args": ["/path/to/vidcap-mcp-server/dist/index.js"],
			"transportType": "stdio"
		}
	}
}
```

**For remote HTTP configuration:**

```json
{
	"mcpServers": {
		"vidcap-youtube-api": {
			"type": "http",
			"url": "http://localhost:8080/mcp"
		}
	}
}
```

**Environment Variables for HTTP Transport:**

You can configure the HTTP server using these environment variables:

- `MCP_HTTP_HOST`: The host to bind to (default: `127.0.0.1`)
- `MCP_HTTP_PORT`: The port to listen on (default: `8080`)
- `MCP_HTTP_PATH`: The endpoint path (default: `/mcp`)

---

# Source Code Overview

## What is MCP?

Model Context Protocol (MCP) is an open standard that allows AI systems to securely and contextually connect with external tools and data sources.

This project implements the MCP specification with a clean, layered architecture. It serves as an example and boilerplate for building custom MCP servers, currently featuring integration with the VidCap YouTube API.

## Why Use This Boilerplate?

- **Production-Ready Architecture**: Follows the same pattern used in published MCP servers, with clear separation between CLI, tools, controllers, and services.

- **Type Safety**: Built with TypeScript for improved developer experience, code quality, and maintainability.

- **Working Example**: Includes a fully implemented IP lookup tool demonstrating the complete pattern from CLI to API integration.

- **Testing Framework**: Comes with testing infrastructure for both unit and CLI integration tests, including coverage reporting.

- **Development Tooling**: Includes ESLint, Prettier, TypeScript, and other quality tools preconfigured for MCP server development.

---

# Getting Started

## Prerequisites

- **Node.js** (>=18.x): [Download](https://nodejs.org/)
- **Git**: For version control

---

## Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/mrgoonie/vidcap-mcp-server.git
cd vidcap-mcp-server

# Install dependencies
npm install
```

---

## Step 2: Run Development Server

Start the server in development mode with stdio transport (default):

```bash
npm run dev:server
```

Or with the Streamable HTTP transport:

```bash
npm run dev:server:http
```

This starts the MCP server with hot-reloading and enables the MCP Inspector at http://localhost:5173.

⚙️ Proxy server listening on port 6277
🔍 MCP Inspector is up and running at http://127.0.0.1:6274

When using HTTP transport, the server will be available at http://127.0.0.1:8080/mcp by default.

---

## Step 3: Test the API Endpoints

Once the server is running (e.g., via `npm run dev:server:http`), you can test the VidCap YouTube API endpoints using a tool like `curl` or Postman.

For example, to test the `/youtube/info` endpoint:

```bash
curl "http://localhost:8080/api/v1/youtube/info?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
```

(Ensure your `VIDCAP_API_KEY` is set in your `.env` file and the server is running on the correct port.)

---

# Architecture

This boilerplate follows a clean, layered architecture pattern that separates concerns and promotes maintainability.

## Project Structure

```
src/
├── cli/              # Command-line interfaces
├── controllers/      # Business logic
├── resources/        # MCP resources: expose data and content from your servers to LLMs
├── services/         # External API interactions
├── tools/            # MCP tool definitions
├── types/            # Type definitions
├── utils/            # Shared utilities
└── index.ts          # Entry point
```

## Layers and Responsibilities

### CLI Layer (`src/cli/*.cli.ts`)

- **Purpose**: Define command-line interfaces that parse arguments and call controllers
- **Naming**: Files should be named `<feature>.cli.ts`
- **Testing**: CLI integration tests in `<feature>.cli.test.ts`

### Tools Layer (`src/tools/*.tool.ts`)

- **Purpose**: Define MCP tools with schemas and descriptions for AI assistants
- **Naming**: Files should be named `<feature>.tool.ts` with types in `<feature>.types.ts`
- **Pattern**: Each tool should use zod for argument validation

### Controllers Layer (`src/controllers/*.controller.ts`)

- **Purpose**: Implement business logic, handle errors, and format responses
- **Naming**: Files should be named `<feature>.controller.ts`
- **Pattern**: Should return standardized `ControllerResponse` objects

### Services Layer (`src/services/*.service.ts`)

- **Purpose**: Interact with external APIs or data sources
- **Naming**: Files should be named `<feature>.service.ts`
- **Pattern**: Pure API interactions with minimal logic

### Utils Layer (`src/utils/*.util.ts`)

- **Purpose**: Provide shared functionality across the application
- **Key Utils**:
    - `logger.util.ts`: Structured logging
    - `error.util.ts`: Error handling and standardization
    - `formatter.util.ts`: Markdown formatting helpers

---

# Development Guide

## Development Scripts

```bash
# Start server in development mode (hot-reload & inspector)
npm run dev:server

# Run CLI in development mode
npm run dev:cli -- [command] [args]

# Build the project
npm run build

# Start server in production mode
npm run start:server

# Run CLI in production mode
npm run start:cli -- [command] [args]
```

## Testing

```bash
# Run all tests
npm test

# Run specific tests
npm test -- src/path/to/test.ts

# Generate test coverage report
npm run test:coverage
```

## Code Quality

```bash
# Lint code
npm run lint

# Format code with Prettier
npm run format

# Check types
npm run typecheck
```

---

# Building Custom Tools

Follow these steps to add your own tools to the server:

## 1. Define Service Layer

Create a new service in `src/services/` to interact with your external API:

```typescript
// src/services/example.service.ts
import { Logger } from '../utils/logger.util.js';

const logger = Logger.forContext('services/example.service.ts');

export async function getData(param: string): Promise<any> {
	logger.debug('Getting data', { param });
	// API interaction code here
	return { result: 'example data' };
}
```

## 2. Create Controller

Add a controller in `src/controllers/` to handle business logic:

```typescript
// src/controllers/example.controller.ts
import { Logger } from '../utils/logger.util.js';
import * as exampleService from '../services/example.service.js';
import { formatMarkdown } from '../utils/formatter.util.js';
import { handleControllerError } from '../utils/error-handler.util.js';
import { ControllerResponse } from '../types/common.types.js';

const logger = Logger.forContext('controllers/example.controller.ts');

export interface GetDataOptions {
	param?: string;
}

export async function getData(
	options: GetDataOptions = {},
): Promise<ControllerResponse> {
	try {
		logger.debug('Getting data with options', options);

		const data = await exampleService.getData(options.param || 'default');

		const content = formatMarkdown(data);

		return { content };
	} catch (error) {
		throw handleControllerError(error, {
			entityType: 'ExampleData',
			operation: 'getData',
			source: 'controllers/example.controller.ts',
		});
	}
}
```

## 3. Implement MCP Tool

Create a tool definition in `src/tools/`:

```typescript
// src/tools/example.tool.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { Logger } from '../utils/logger.util.js';
import { formatErrorForMcpTool } from '../utils/error.util.js';
import * as exampleController from '../controllers/example.controller.js';

const logger = Logger.forContext('tools/example.tool.ts');

const GetDataArgs = z.object({
	param: z.string().optional().describe('Optional parameter'),
});

type GetDataArgsType = z.infer<typeof GetDataArgs>;

async function handleGetData(args: GetDataArgsType) {
	try {
		logger.debug('Tool get_data called', args);

		const result = await exampleController.getData({
			param: args.param,
		});

		return {
			content: [{ type: 'text' as const, text: result.content }],
		};
	} catch (error) {
		logger.error('Tool get_data failed', error);
		return formatErrorForMcpTool(error);
	}
}

export function register(server: McpServer) {
	server.tool(
		'get_data',
		`Gets data from the example API, optionally using \`param\`.
Use this to fetch example data. Returns formatted data as Markdown.`,
		GetDataArgs.shape,
		handleGetData,
	);
}
```

## 4. Add CLI Support

Create a CLI command in `src/cli/`:

```typescript
// src/cli/example.cli.ts
import { program } from 'commander';
import { Logger } from '../utils/logger.util.js';
import * as exampleController from '../controllers/example.controller.js';
import { handleCliError } from '../utils/error-handler.util.js';

const logger = Logger.forContext('cli/example.cli.ts');

program
	.command('get-data')
	.description('Get example data')
	.option('--param <value>', 'Optional parameter')
	.action(async (options) => {
		try {
			logger.debug('CLI get-data called', options);

			const result = await exampleController.getData({
				param: options.param,
			});

			console.log(result.content);
		} catch (error) {
			handleCliError(error);
		}
	});
```

## 5. Register Components

Update the entry points to register your new components:

```typescript
// In src/cli/index.ts
import '../cli/example.cli.js';

// In src/index.ts (for the tool)
import exampleTool from './tools/example.tool.js';
// Then in registerTools function:
exampleTool.register(server);
```

---

# Debugging Tools

## MCP Inspector

Access the visual MCP Inspector to test your tools and view request/response details:

1. Run `npm run dev:server`
2. Open http://localhost:5173 in your browser
3. Test your tools and view logs directly in the UI

## Server Logs

Enable debug logs for development:

```bash
# Set environment variable
DEBUG=true npm run dev:server

# Or configure in ~/.mcp/configs.json
```

---

# Publishing Your MCP Server

When ready to publish your custom MCP server:

1. Update package.json with your details
2. Update README.md with your tool documentation
3. Build the project: `npm run build`
4. Test the production build: `npm run start:server`
5. Publish to npm: `npm publish`

---

# License

[ISC License](https://opensource.org/licenses/ISC)

```json
{
	"vidcap-youtube-api": {
		"environments": {
			"DEBUG": "true",
			"VIDCAP_API_KEY": "your_vidcap_api_key_here"
		}
	}
}
```

**Note:** The key used in `~/.mcp/configs.json` (e.g., `vidcap-youtube-api`) should match the server name you prefer for your MCP client configuration.
