# VidCap YouTube API - MCP Server

This project provides a Model Context Protocol (MCP) server that acts as a proxy to the VidCap YouTube API, allowing AI assistants to easily access YouTube video data and functionalities. It also serves as a boilerplate for building custom MCP servers.

- [Github](https://github.com/mrgoonie/vidcap-mcp-server)
- [NPM](https://www.npmjs.com/package/vidcap-mcp-server)

## Table of Contents

- [VidCap YouTube API](#vidcap-youtube-api)
- [MCP Client Integration](#mcp-client-integration)
  - [Claude Desktop Configuration](#claude-desktop-configuration)
  - [Claude Code Integration](#claude-code-integration)
  - [Security Best Practices](#security-best-practices)
  - [Advanced Configuration](#advanced-configuration)
  - [Troubleshooting](#troubleshooting)
- [Available MCP Tools](#available-mcp-tools)
- [Source Code Overview](#source-code-overview)

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
- **GET `/search`**
    - Description: Search YouTube videos with comprehensive filtering and pagination support.
    - Query Parameters:
        - `query` (string, required): Search query for YouTube videos.
        - `maxResults` (number, optional, default: 10): Maximum number of results to return (1-50).
        - `order` (enum, optional, default: 'relevance'): Sort order for search results ('date', 'rating', 'relevance', 'title', 'videoCount', 'viewCount').
        - `publishedAfter` (string, optional): Filter videos published after this date (ISO 8601 format).
        - `publishedBefore` (string, optional): Filter videos published before this date (ISO 8601 format).
        - `videoDuration` (enum, optional, default: 'any'): Filter by video duration ('short', 'medium', 'long', 'any').
        - `videoDefinition` (enum, optional, default: 'any'): Filter by video quality ('high', 'standard', 'any').
        - `pageToken` (string, optional): Pagination token for retrieving next page of results.

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

# Note: YouTube search functionality is currently available as an MCP tool only
# Use the youtube_search tool through your MCP-compatible AI assistant
```

# MCP Client Integration

This server provides 8 YouTube-related MCP tools that can be integrated with any MCP-compatible AI assistant. The tools include video information retrieval, media format discovery, caption/transcript extraction, AI-powered summarization, screenshot capture, comment analysis, and comprehensive video search.

## Quick Setup

### 1. Get VidCap API Key

1. Visit [vidcap.xyz](https://vidcap.xyz) to obtain your API key
2. Set the API key in your environment or MCP client configuration

### 2. Configure Your MCP Client

The server is available on NPM and can be run directly with `npx` - no installation required!

Choose your configuration method based on your AI assistant:

## Claude Desktop Configuration

### Automatic Configuration (Recommended)

Claude Desktop provides a user-friendly interface for MCP server configuration:

1. **Open Claude Desktop Settings**
   - Click the settings icon (⚙️) in Claude Desktop
   - Navigate to the **"Developer"** tab
   - Click **"Edit Config"** to open the configuration file

2. **Add VidCap MCP Server**

   Add the following configuration to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Manual Configuration

**Location:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows)

```json
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here",
        "DEBUG": "false"
      }
    }
  }
}
```

### Troubleshooting Claude Desktop

- **Configuration Issues**: Verify JSON syntax using a JSON validator
- **Server Not Starting**: Check logs at `~/Library/Logs/Claude/mcp.log` (macOS)
- **Permission Errors**: Ensure Node.js and npm are properly installed
- **Test Manually**: Run `npx vidcap-mcp-server` in terminal to verify server functionality

## Claude Code Integration

Claude Code supports MCP servers with multiple configuration methods:

### Method 1: CLI Configuration (Recommended)

Use Claude Code's built-in MCP management:

```bash
# Add the VidCap MCP server
claude mcp add --transport stdio vidcap-youtube-api npx vidcap-mcp-server

# Set environment variables
claude mcp env set vidcap-youtube-api VIDCAP_API_KEY=your_api_key_here
```

### Method 2: Project-Level Configuration

Create a `.mcp.json` file in your project root for team-shared configuration:

```json
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "transport": "stdio",
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Method 3: User-Level Configuration

For cross-project accessibility, configure in your user settings:

```json
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "transportType": "stdio",
      "scope": "user",
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Claude Code Features

- **Resource References**: Use `@vidcap-youtube-api` to reference server capabilities
- **Slash Commands**: Access tools via `/youtube` commands (if supported)
- **Environment Variables**: Supports secure credential management
- **Scope Management**: Control server accessibility at project, user, or local levels

### Import from Claude Desktop

If you have existing Claude Desktop configuration:

```bash
# Import configuration from Claude Desktop
claude mcp import-from-claude-desktop
```

## Quick Reference

### Essential Commands

```bash
# Install and test server
npx vidcap-mcp-server

# Claude Code: Add server
claude mcp add --transport stdio vidcap-youtube-api npx vidcap-mcp-server

# Claude Code: Set API key
claude mcp env set vidcap-youtube-api VIDCAP_API_KEY=your_key

# Claude Code: List servers
claude mcp list

# Claude Code: Remove server
claude mcp remove vidcap-youtube-api
```

### Minimal Configurations

**Claude Desktop (Basic):**
```json
{
  "mcpServers": {
    "vidcap": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "env": { "VIDCAP_API_KEY": "your_key" }
    }
  }
}
```

**Claude Code (Project `.mcp.json`):**
```json
{
  "mcpServers": {
    "vidcap": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "env": { "VIDCAP_API_KEY": "your_key" }
    }
  }
}
```

## Cline (VS Code Extension)

Add to your Cline MCP configuration:

```json
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Cursor Configuration

Add to your Cursor MCP settings:

```json
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "transportType": "stdio",
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## HTTP Transport Configuration

For web-based clients or remote access:

```json
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "type": "http",
      "url": "http://localhost:8080/mcp",
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

**HTTP Server Environment Variables:**

- `MCP_HTTP_HOST`: Host to bind to (default: `127.0.0.1`)
- `MCP_HTTP_PORT`: Port to listen on (default: `8080`)
- `MCP_HTTP_PATH`: Endpoint path (default: `/mcp`)

**Start HTTP Server:**
```bash
# Using npx
npx vidcap-mcp-server --http

# Or with custom configuration
MCP_HTTP_PORT=3000 npx vidcap-mcp-server --http

# Using local development server
npm run start:server:http
```

## Alternative Installation Methods

### NPX (Recommended)
The configurations above use `npx` which automatically downloads and runs the latest version without installation.

### Global Installation
For better performance or offline usage:

```bash
# Install globally
npm install -g vidcap-mcp-server

# Use in MCP config (replace npx with direct command)
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "vidcap-mcp-server",
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Local Development
For development or customization:

```bash
# Clone and build locally
git clone https://github.com/mrgoonie/vidcap-mcp-server.git
cd vidcap-mcp-server
npm install
npm run build

# Use local build in MCP config
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "node",
      "args": ["/path/to/vidcap-mcp-server/dist/index.js"],
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

## Available MCP Tools

Once configured, your AI assistant will have access to these tools:

- **`youtube_getInfo`**: Get video metadata (title, description, duration, etc.)
- **`youtube_getMedia`**: List available video/audio formats and quality options
- **`youtube_getCaption`**: Extract captions/transcripts with timing information
- **`youtube_getSummary`**: Generate AI-powered video content summaries
- **`youtube_getScreenshot`**: Capture screenshots at specific timestamps
- **`youtube_getScreenshotMultiple`**: Batch capture multiple screenshots
- **`youtube_getComments`**: Retrieve video comments with pagination and replies
- **`youtube_search`**: Search YouTube videos with advanced filtering options (query, date range, duration, quality, sorting)

### YouTube Search Tool Features

The `youtube_search` tool provides powerful video discovery capabilities with multiple filtering options:

**Basic Search:**
- Search by keywords, phrases, or topics
- Configurable result limits (1-50 videos per request)
- Pagination support for browsing large result sets

**Advanced Filtering:**
- **Sort Options**: relevance, date, rating, title, videoCount, viewCount
- **Duration Filters**: short (<4 min), medium (4-20 min), long (>20 min), or any
- **Quality Filters**: high definition, standard definition, or any quality
- **Date Range**: Filter videos published within specific date ranges
- **Pagination**: Navigate through search results with page tokens

**Example Use Cases:**
- Find recent tutorials: `"Python tutorial"` + `order: "date"` + `videoDuration: "medium"`
- Discover popular content: `"machine learning"` + `order: "viewCount"` + `maxResults: 25`
- Research within timeframe: `"AI developments"` + `publishedAfter: "2024-01-01"`
- Quality-focused search: `"4K nature documentary"` + `videoDefinition: "high"`

**Response Data:**
Each search result includes video metadata such as title, description, channel information, thumbnails, publication date, and engagement metrics (views, likes when available).

## Configuration Options

### API Key Sources (Priority Order)

1. **Environment Variables**: `VIDCAP_API_KEY`
2. **MCP Client Config**: `env.VIDCAP_API_KEY` in server config
3. **Global MCP Config**: `~/.mcp/configs.json`
4. **HTTP Query Parameter**: `?api_key=your_key` (HTTP transport only)

### Debug Mode

Enable detailed logging for troubleshooting:

```json
{
  "env": {
    "VIDCAP_API_KEY": "your_api_key_here",
    "DEBUG": "true"
  }
}
```

## Security Best Practices

### API Key Management

- **Environment Variables**: Store API keys in environment variables, not in configuration files
- **Project Scope**: Use project-level `.mcp.json` for team configurations without exposing keys
- **User Scope**: Keep sensitive credentials in user-level configurations
- **Key Rotation**: Regularly rotate API keys and update configurations

### Permission Control

- **Scope Limitation**: Configure servers with appropriate scope (local, project, or user)
- **Access Control**: Only grant necessary permissions to MCP servers
- **Audit Logs**: Monitor MCP server activity through Claude's logging system

## Advanced Configuration

### Remote Server Configuration

For production or shared environments, configure HTTP transport:

```json
{
  "mcpServers": {
    "vidcap-youtube-api-remote": {
      "transport": "http",
      "url": "https://your-domain.com/mcp",
      "headers": {
        "Authorization": "Bearer your_token_here"
      },
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

### Environment Variable Expansion

Both Claude Desktop and Claude Code support environment variable expansion:

```json
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "env": {
        "VIDCAP_API_KEY": "${VIDCAP_API_KEY}",
        "DEBUG": "${DEBUG:-false}"
      }
    }
  }
}
```

### Output Management

Configure output limits for better performance:

```json
{
  "mcpServers": {
    "vidcap-youtube-api": {
      "command": "npx",
      "args": ["vidcap-mcp-server"],
      "env": {
        "VIDCAP_API_KEY": "your_api_key_here"
      },
      "outputLimit": 10000
    }
  }
}
```

### Troubleshooting

#### Claude Desktop Issues

**Server Not Starting:**
- Verify Node.js version ≥18.x
- Check that the build completed: `npm run build`
- Ensure API key is properly set
- Review logs at `~/Library/Logs/Claude/mcp.log` (macOS) or `%APPDATA%\Claude\Logs\mcp.log` (Windows)

**Configuration Issues:**
- Validate JSON syntax using a JSON validator
- Check file permissions on configuration directory
- Ensure absolute paths are used for local commands
- Test server manually: `npx vidcap-mcp-server`

#### Claude Code Issues

**Tools Not Available:**
- Confirm MCP client supports stdio transport
- Check server logs for connection errors
- Verify file paths in configuration are absolute
- Run `claude mcp list` to verify server registration

**Authentication Errors:**
- Validate your VidCap API key at vidcap.xyz
- Check network connectivity
- Review error messages in debug mode
- Verify environment variable expansion

#### General Debugging

**Enable Debug Mode:**
```bash
# For Claude Desktop
{
  "env": {
    "VIDCAP_API_KEY": "your_api_key_here",
    "DEBUG": "true"
  }
}

# For Claude Code CLI
claude mcp env set vidcap-youtube-api DEBUG=true
```

**Manual Testing:**
```bash
# Test server directly
npx vidcap-mcp-server

# Test with specific transport
npx vidcap-mcp-server --stdio

# Test HTTP transport
npx vidcap-mcp-server --http
```

**Common Issues:**
- **"Command not found"**: Ensure npm and Node.js are in PATH
- **"Permission denied"**: Check file permissions and user access
- **"Connection refused"**: Verify server is running and ports are open
- **"Invalid API key"**: Confirm key is correct and account is active

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

To test the `/youtube/search` endpoint (available via VidCap API):

```bash
# Basic search (replace YOUR_API_KEY with your actual VidCap API key)
curl "https://vidcap.xyz/api/v1/youtube/search?query=machine%20learning%20tutorial&api_key=YOUR_API_KEY"

# Advanced search with filters
curl "https://vidcap.xyz/api/v1/youtube/search?query=Python%20programming&order=date&videoDuration=medium&maxResults=20&api_key=YOUR_API_KEY"
```

Note: The search functionality is primarily designed for use through the MCP tool `youtube_search` rather than direct HTTP calls.

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
