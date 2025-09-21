# VidCap MCP Server - Agent Instructions

## Build & Development Commands

- Build: `npm run build` (TypeScript to CommonJS)
- Lint: `npm run lint` (ESLint with Prettier)
- Format: `npm run format` (Prettier auto-format)
- Test: `npm run test` (Jest with no-tests-pass)
- Test Coverage: `npm run test:coverage`
- Dev Server: `npm run dev:server` (builds & starts with DEBUG=true)

## Code Style & Conventions

- **Indentation**: Tabs (4-space width), SwitchCase: 1 level
- **Quotes**: Single quotes, semicolons required, trailing commas
- **Imports**: Use `.js` extensions for imports (ESM syntax, CommonJS output)
- **Naming**: camelCase for variables/functions, PascalCase for types/classes
- **Types**: Strict TypeScript, Zod schemas for validation, explicit return types
- **Error Handling**: Try-catch blocks, proper error logging with contextual loggers
- **Logging**: Use `Logger.forContext('filename', 'method')` pattern
- **Comments**: JSDoc for public APIs, minimal inline comments

## Project Structure

- MCP server with YouTube API integration using VidCap
- TypeScript source in `src/`, CommonJS output in `dist/`
- Zod schemas in `types/`, services in `services/`, tools in `tools/`
