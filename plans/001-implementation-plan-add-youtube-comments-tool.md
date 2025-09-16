# Implementation Plan: Add YouTube Comments Tool

## Executive Summary

- **Problem Statement**
    - The VidCap API added `GET /api/v1/youtube/comments` to fetch video comments with pagination and optional replies. The MCP server currently exposes several YouTube tools but lacks comments retrieval.
- **Proposed Solution (KISS)**
    - Mirror existing patterns for YouTube endpoints: add Zod schemas, add a service method using the existing axios client, register a new MCP tool (`youtube_getComments`), and optionally add a CLI command/controller for parity.
- **Resource Requirements**
    - 1 engineer familiar with this codebase, ~3–5 hours (including review and docs).
- **Timeline (realistic)**
    - Day 1 (0.5 day): Schemas + service + tool
    - Day 1 (0.5 day): CLI/controller + README + manual tests
    - Day 2 (optional): Light refactors/tests if needed

## Architecture Overview

- **System Components (minimal viable set)**
    - Zod schemas (`types/youtube.schemas.ts`): request + response data for comments
    - Service (`services/youtube.service.ts`): `getYoutubeComments(params)`
    - Tool (`tools/youtube.tool.ts`): `youtube_getComments`
    - CLI/controller (`controllers/youtube.controller.ts`, `cli/youtube.cli.ts`): getComments parity with other commands
- **Data Flow (simplified)**
    - MCP client calls `youtube_getComments` → tool validates args → service calls VidCap API with API key → transforms/validates response via Zod → MCP returns JSON text to client.
- **Integration Points (essential only)**
    - Existing axios `apiClient` with baseURL `https://vidcap.xyz/api/v1` and `X-API-Key` header (`env.VIDCAP_API_KEY`)
    - No new env vars; reuse existing `VIDCAP_API_KEY`.

## Implementation Phases

### Phase 1: Core Functionality (YAGNI applied)

1. Define types and schemas (`src/types/youtube.schemas.ts`)

- Add `YoutubeCommentsQuerySchema`
    - Fields:
        - `url?: string` (url)
        - `videoId?: string`
        - `order?: enum('time', 'relevance')` default `'time'`
        - `format?: enum('plainText', 'html')` default `'plainText'`
        - `pageToken?: string`
        - `includeReplies?: boolean` default `false`
        - `hl?: string` default `'en'`
    - Add refine to enforce “either url or videoId required”.
- Add `YoutubeCommentSchema`:
    - Minimal safe shape aligned to docs:
        - `id: string`
        - `videoId: string`
        - `textOriginal: string`
        - `authorDisplayName: string`
        - `likeCount: number`
        - `publishedAt: string`
        - `totalReplyCount: number`
        - `replies: any[]` optional (YAGNI: don’t over-spec replies without stable doc)
- Add `YoutubeCommentsDataSchema`:
    - `{ nextPageToken?: string; data: YoutubeCommentSchema[] }`
- Add `YoutubeCommentsResponseSchema` via `successDataSchema(YoutubeCommentsDataSchema)`

2. Implement service method (`src/services/youtube.service.ts`)

- `export const getYoutubeComments = async (
  params: z.infer<typeof YoutubeCommentsQuerySchema>
): Promise<z.infer<typeof YoutubeCommentsResponseSchema>>`
- Behavior:
    - `GET /youtube/comments` with params
    - Log raw response (debug)
    - Transform to `{ success: raw.status === 1, data: { nextPageToken, data: [] } | null, error?: string }`
        - Accept both `raw.data` and `raw.data.data` nesting patterns for robustness (project already does this)
    - Zod-parse into `YoutubeCommentsResponseSchema`
    - On errors, mirror other service methods:
        - ZodError → validation message + return `{ success: false, data: null, error }`
        - Axios errors → include message and log `response.data` if present
        - Unknown errors → generic message, null data

3. Register MCP tool (`src/tools/youtube.tool.ts`)

- Import `YoutubeCommentsQuerySchema` and `YoutubeService.getYoutubeComments`
- `server.tool(
  'youtube_getComments',
  'Get YouTube video comments with optional pagination and replies. Provide either a video URL or a videoId.',
  YoutubeCommentsQuerySchema.shape,
  async (args) => handleServiceToolExecution(YoutubeService.getYoutubeComments, args, 'youtube_getComments')
)`
- Keep output formatting consistent: JSON.stringify of result.data as text

### Phase 2: Essential Integrations

4. CLI parity (optional but recommended for developer workflow)

- Controller (`src/controllers/youtube.controller.ts`)
    - Add `getYoutubeCommentsCli(params: z.infer<typeof YoutubeCommentsQuerySchema>)`
    - Follow same pattern as other CLI controllers: call service, return `{ success, data }` or `{ success: false, error }`
- CLI (`src/cli/youtube.cli.ts`)
    - Add `youtube getComments` command with options:
        - `--url <url>`
        - `--videoId <id>`
        - `--order <time|relevance>`
        - `--format <plainText|html>`
        - `--pageToken <token>`
        - `--includeReplies` (boolean)
        - `--hl <lang>`
    - Parse via `YoutubeCommentsQuerySchema`
    - Invoke `youtubeController.getYoutubeCommentsCli`
    - Print JSON or error

5. Documentation update (`README.md`)

- Add new tool: `youtube_getComments` (args and description)
- Add CLI example:
    - `npm run dev:cli -- youtube getComments --url "https://www.youtube.com/watch?v=..." --includeReplies true --order relevance`
- Note pagination via `pageToken` and presence of `nextPageToken` in response

### Phase 3: Performance Optimization (if actually needed)

- Not needed now. Comments payloads are moderate and paginated.
- Optional later: auto-pagination helper at CLI level. YAGNI for now.

## Risk Assessment & Mitigation

- **High-Risk Items**
    - API response nesting inconsistency (`data` vs `data.data`)
        - Mitigation: parse both shapes (pattern used in existing services)
    - Replies structure may vary or be large
        - Mitigation: treat replies as `z.array(z.any())` and do not auto-expand replies unless requested (`includeReplies` default false)
    - Zod validation failures due to undocumented fields or missing fields
        - Mitigation: Keep schema lenient; only validate fields we truly need; allow optional where uncertain
- **Probable Failure Points**
    - Missing `VIDCAP_API_KEY` at runtime
        - Mitigation: `env.ts` already enforces it; logs clearly on failures
    - Bad pagination token
        - Mitigation: Service returns `success:false` with meaningful error message from API
- **Mitigation Strategies**
    - Log raw responses at debug for troubleshooting
    - Maintain consistent error shape (`success:false, data:null, error:string`)
    - Validate with zod and fall back gracefully

## Success Criteria

- **Measurable Outcomes**
    - New MCP tool `youtube_getComments` appears in the MCP Inspector and executes successfully with required/optional args
    - CLI command returns comments JSON with `nextPageToken` when available
- **Performance Benchmarks**
    - Single request typical p95 < 2s given remote API; pagination confirmed works
- **Quality Gates**
    - `npm run typecheck` passes
    - `npm run lint` passes
    - Manual tests for:
        - url only
        - videoId only
        - includeReplies true
        - order relevance
        - format html
        - hl non-default (e.g., es)
        - pageToken flow

## Concrete Change List (by file)

- `src/types/youtube.schemas.ts`
    - Add:
        - `YoutubeCommentsQuerySchema` (with refine: require url or videoId)
        - `YoutubeCommentSchema`
        - `YoutubeCommentsDataSchema`
        - `YoutubeCommentsResponseSchema = successDataSchema(YoutubeCommentsDataSchema)`
- `src/services/youtube.service.ts`
    - Add `getYoutubeComments(params)`
        - `GET /youtube/comments`
        - Transform + Zod-parse + robust error handling
- `src/tools/youtube.tool.ts`
    - Register `youtube_getComments` tool using shared `handleServiceToolExecution`
- `src/controllers/youtube.controller.ts` (optional but recommended)
    - Add `getYoutubeCommentsCli(params)` mirroring style of other CLI controllers
- `src/cli/youtube.cli.ts` (optional but recommended)
    - Add `youtube getComments` command with options; validate via schema; call controller; print JSON
- `README.md`
    - Add tool + CLI documentation, examples, pagination note

## Manual Test Plan

- MCP Inspector (dev server)
    - Call `youtube_getComments` with:
        - `{ url: "<video_url>" }`
        - `{ videoId: "dQw4w9WgXcQ" }`
        - `{ url, includeReplies: true }`
        - `{ url, order: "relevance" }`
        - `{ url, format: "html" }`
        - `{ url, hl: "es" }`
    - If `nextPageToken` present, re-call with `pageToken`
- CLI
    - `npm run dev:cli -- youtube getComments --url "<url>" --includeReplies true --order relevance`
    - Verify JSON includes `nextPageToken`, top-level `data` list

## Brutal Honesty Checklist

- Unrealistic expectations identified?
    - No myths of auto-pagination or nested reply modeling; kept simple and manual
- Over-engineering called out?
    - Avoided deep reply schema and auto-pagination; replies typed as `any[]`
- Questioned “requirements”?
    - Not auto-fetching all pages; optional CLI/controller parity flagged as “recommended,” not mandatory
- Probable failure points identified?
    - API nesting variance, pagination token errors, missing key
- Realistic timelines?
    - 3–5 hours including docs and review

## YAGNI Application

- Can features be removed?
    - Yes, CLI/controller parity can be deferred; reply structure modeling deferred
- Is this solving a real problem?
    - Deliver the tool endpoint; skip batch pagination until needed
- Build later when needed?
    - Auto-pagination, detailed reply models
- Building for scale we don’t have?
    - No; simple single call + pageToken

## KISS Validation

- Simplest solution that works?
    - Yes: schema + service + tool
- Can a junior developer understand this?
    - Yes; mirrors existing endpoint patterns
- Added complexity for complexity’s sake?
    - No; avoided
- Explain in one sentence?
    - Add a new MCP tool that calls VidCap’s comments endpoint and returns comments (with optional replies) and nextPageToken.

## DRY Verification

- Duplicating existing functionality?
    - No; reusing `successDataSchema` and existing axios client
- Can existing solutions be reused?
    - Yes; same error/log patterns as other YouTube methods
- Reinventing the wheel?
    - No; consistent with current code style

## Dependencies and Constraints

- Env: `VIDCAP_API_KEY` must be set (already enforced)
- External API contract: https://vidcap.xyz/api-docs/#/YouTube/get_api_v1_youtube_comments
- Transport: No changes needed to MCP/HTTP transports

## Security Considerations

- API key stays in header `X-API-Key` (already in `apiClient`)
- No additional PII handling beyond VidCap’s returned `authorDisplayName`; return data as-is and rely on client usage policies

## Rollback Plan

- Changes are additive; tool can be unregistered by removing code and rebuild
- No schema or API surface breaking changes to existing tools

## Approval Gate

- Proceed once the above plan is accepted
- After implementation, produce a small smoke-test report with sample outputs and confirm MCP Inspector tool visibility
