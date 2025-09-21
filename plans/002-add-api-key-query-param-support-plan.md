# Implementation Plan: Add API Key Query Parameter Support for Streamable HTTP Transport

## Overview

Add support for accepting API keys via URL query parameters (`?api_key=...`) in the VidCap MCP server's Streamable HTTP transport. The API key from query parameters should be automatically assigned to the `x-api-key` header in outgoing VidCap API requests, while maintaining backward compatibility with environment variable-based API keys.

## Requirements

### Functional Requirements
- Accept `api_key` parameter in URL query strings for HTTP transport requests
- Automatically use query parameter API key in `x-api-key` header for VidCap API calls
- Maintain backward compatibility with `VIDCAP_API_KEY` environment variable
- Support per-request API keys for multi-tenant scenarios
- Graceful fallback when no query parameter is provided

### Non-Functional Requirements
- Secure handling of API keys (no logging of actual values)
- Request-scoped context management for API keys
- Minimal performance impact
- Thread-safe implementation
- Comprehensive error handling
- HTTPS enforcement for query parameter API keys (security warning)

## Architecture

### Current Architecture Analysis
- **Transport Layer**: Express.js server with StreamableHTTPServerTransport from MCP SDK
- **Service Layer**: `youtube.service.ts` uses static Axios client with environment-based API key
- **Configuration**: `env.ts` manages environment variables including `VIDCAP_API_KEY`
- **Request Flow**: HTTP Request → Express → MCP Transport → Tools → Services → VidCap API

### Proposed Architecture Changes
1. **Request Context Management**: Implement AsyncLocalStorage for per-request API key storage
2. **Middleware Layer**: Add Express middleware to extract and validate API keys from query parameters
3. **Dynamic API Client**: Modify service layer to create Axios clients with context-aware API keys
4. **Validation Layer**: Add API key format validation and security checks

### Component Interactions
```
HTTP Request (?api_key=xyz)
    ↓
Express Middleware (extract & validate API key)
    ↓
AsyncLocalStorage Context (store API key)
    ↓
MCP Transport → Tool Execution
    ↓
Service Layer (resolve API key from context/env)
    ↓
Dynamic Axios Client (with x-api-key header)
    ↓
VidCap API
```

## Implementation Steps

### Step 1: Create API Context Management Utility
**File**: `/src/utils/api-context.util.ts`

**Tasks**:
- Implement AsyncLocalStorage-based context storage
- Create functions to set/get API keys from context
- Add context validation and error handling
- Implement fallback to environment variables

**Key Functions**:
- `setApiKey(apiKey: string): void`
- `getApiKey(): string | undefined`
- `getEffectiveApiKey(): string` (with env fallback)
- `withApiKeyContext<T>(apiKey: string, fn: () => Promise<T>): Promise<T>`

### Step 2: Create API Key Types and Schemas
**File**: `/src/types/api.types.ts`

**Tasks**:
- Define TypeScript interfaces for API context
- Create Zod schemas for API key validation
- Define error types for API key-related failures

**Key Types**:
```typescript
interface ApiKeyContext {
    apiKey?: string;
    source: 'query' | 'environment' | 'none';
}

interface ApiKeyValidationResult {
    isValid: boolean;
    apiKey?: string;
    error?: string;
}
```

### Step 3: Add Express Middleware for API Key Extraction
**File**: `/src/middleware/api-key.middleware.ts`

**Tasks**:
- Create middleware to extract `api_key` from query parameters
- Validate API key format and length
- Store API key in AsyncLocalStorage context
- Add security warnings for HTTP (non-HTTPS) usage
- Implement rate limiting considerations

**Middleware Features**:
- Extract `api_key` from `req.query.api_key`
- Validate API key format (e.g., length, characters)
- Store in request context using AsyncLocalStorage
- Log API key usage (without exposing actual values)
- Warn about HTTP vs HTTPS usage

### Step 4: Modify Main Server File
**File**: `/src/index.ts`

**Tasks**:
- Import and register API key middleware
- Apply middleware to HTTP transport routes
- Ensure middleware runs before MCP request handling
- Add error handling for API key validation failures

**Changes**:
- Add middleware registration in Express app setup
- Apply to `/mcp` endpoint (both POST and GET)
- Ensure proper error responses for invalid API keys
- Maintain existing functionality for non-HTTP transports

### Step 5: Update Service Layer for Dynamic API Keys
**File**: `/src/services/youtube.service.ts`

**Tasks**:
- Replace static Axios client with dynamic client factory
- Implement API key resolution from context
- Update all service functions to use dynamic clients
- Add error handling for missing API keys
- Maintain backward compatibility

**Key Changes**:
```typescript
// Before: Static client
const apiClient = axios.create({
    baseURL: VIDCAP_API_BASE_URL,
    headers: { 'X-API-Key': env.VIDCAP_API_KEY },
});

// After: Dynamic client factory
function createApiClient(): AxiosInstance {
    const apiKey = getEffectiveApiKey();
    if (!apiKey) {
        throw new Error('VidCap API key not available');
    }
    return axios.create({
        baseURL: VIDCAP_API_BASE_URL,
        headers: { 'X-API-Key': apiKey },
    });
}
```

### Step 6: Update Environment Configuration
**File**: `/src/env.ts`

**Tasks**:
- Make `VIDCAP_API_KEY` optional in schema
- Update validation to allow missing environment API key
- Add documentation comments

**Changes**:
```typescript
export const envSchema = z.object({
    VIDCAP_API_KEY: z.string().optional(), // Made optional
    // ... other fields
});
```

### Step 7: Create Comprehensive Error Handling
**File**: `/src/utils/api-key-errors.util.ts`

**Tasks**:
- Define specific error classes for API key issues
- Create user-friendly error messages
- Implement proper HTTP status codes
- Add logging without exposing API key values

**Error Types**:
- `ApiKeyMissingError`: No API key provided
- `ApiKeyInvalidError`: Invalid API key format
- `ApiKeyUnauthorizedError`: API key rejected by VidCap API

### Step 8: Add Configuration Options
**File**: `/src/utils/config.util.ts`

**Tasks**:
- Add configuration flags for API key features
- Implement HTTPS enforcement options
- Add debugging/logging configuration

**New Config Options**:
- `REQUIRE_HTTPS_FOR_API_KEY`: boolean
- `API_KEY_MAX_LENGTH`: number
- `ENABLE_API_KEY_QUERY_PARAMS`: boolean

## Files to Modify/Create/Delete

### Files to Create
1. `/src/utils/api-context.util.ts` - API key context management
2. `/src/types/api.types.ts` - API key related types and schemas
3. `/src/middleware/api-key.middleware.ts` - Express middleware for API key extraction
4. `/src/utils/api-key-errors.util.ts` - Specialized error handling

### Files to Modify
1. `/src/index.ts` - Add middleware registration and error handling
2. `/src/services/youtube.service.ts` - Dynamic Axios client creation
3. `/src/env.ts` - Make VIDCAP_API_KEY optional
4. `/src/utils/config.util.ts` - Add new configuration options
5. `/src/types/youtube.schemas.ts` - Update if needed for error responses

### Files to Delete
None - all changes are additive to maintain backward compatibility.

## Testing Strategy

### Unit Tests
**File**: `/src/tests/unit/api-context.test.ts`
- Test AsyncLocalStorage context management
- Test API key resolution with various scenarios
- Test error handling for invalid contexts

**File**: `/src/tests/unit/api-key-middleware.test.ts`
- Test query parameter extraction
- Test API key validation
- Test context storage functionality
- Test error scenarios

**File**: `/src/tests/unit/youtube-service.test.ts`
- Test dynamic Axios client creation
- Test API key resolution in service calls
- Test fallback behavior
- Test error propagation

### Integration Tests
**File**: `/src/tests/integration/api-key-e2e.test.ts`
- Test full HTTP request flow with query API keys
- Test backward compatibility with env variables
- Test error responses for various failure modes
- Test concurrent requests with different API keys

### Test Scenarios
1. **Valid query API key**: Should use query param key
2. **Missing query API key**: Should fallback to environment variable
3. **Invalid API key format**: Should return proper error
4. **Empty API key**: Should return proper error
5. **Multiple API keys**: Should handle precedence correctly
6. **Concurrent requests**: Should maintain request isolation
7. **HTTPS vs HTTP**: Should show appropriate warnings
8. **Backward compatibility**: Existing setups should continue working

## Security Considerations

### API Key Handling
- **No Logging**: Never log actual API key values, only masked versions
- **Memory Security**: Clear API keys from memory when possible
- **Context Isolation**: Ensure request-scoped isolation using AsyncLocalStorage
- **Validation**: Validate API key format and length limits

### Transport Security
- **HTTPS Enforcement**: Warn users when API keys are used over HTTP
- **Query Parameter Risks**: Document risks of API keys in URLs (logs, history, etc.)
- **Rate Limiting**: Consider implementing per-API-key rate limiting
- **Error Messages**: Avoid exposing API keys in error responses

### Input Validation
- **Length Limits**: Enforce reasonable API key length limits (e.g., 1-500 chars)
- **Character Validation**: Allow only valid API key characters
- **Injection Prevention**: Sanitize inputs to prevent injection attacks
- **DoS Prevention**: Implement limits to prevent resource exhaustion

## Performance Considerations

### Optimization Strategies
- **Minimal Overhead**: AsyncLocalStorage has minimal performance impact
- **Client Reuse**: Consider caching Axios clients per API key when possible
- **Memory Usage**: Clean up contexts after requests complete
- **Concurrent Requests**: Ensure no bottlenecks for multiple simultaneous requests

### Monitoring
- **Response Times**: Monitor impact on request processing times
- **Memory Usage**: Track memory consumption with context storage
- **Error Rates**: Monitor API key validation and authentication failures
- **Throughput**: Ensure no reduction in request throughput

## Risks & Mitigations

### Risk 1: API Key Exposure in Logs
**Mitigation**: Implement strict logging policies to never log actual API key values

### Risk 2: Breaking Backward Compatibility
**Mitigation**: Maintain environment variable support and existing behavior as default

### Risk 3: Context Leakage Between Requests
**Mitigation**: Use AsyncLocalStorage correctly and add comprehensive tests for isolation

### Risk 4: Performance Degradation
**Mitigation**: Benchmark changes and implement efficient context management

### Risk 5: Security Vulnerabilities
**Mitigation**: Follow security best practices, validate inputs, and use HTTPS warnings

### Risk 6: Complex Error Scenarios
**Mitigation**: Implement comprehensive error handling and testing

## Deployment Considerations

### Environment Setup
- **Backward Compatibility**: Existing deployments continue working without changes
- **Configuration**: New config options are optional with sensible defaults
- **Documentation**: Update deployment docs with new API key options

### Rolling Deployment
1. Deploy code with feature flag disabled by default
2. Test with internal API keys first
3. Enable feature gradually with monitoring
4. Document new capabilities for users

### Monitoring & Alerting
- **API Key Usage**: Track usage of query param vs environment API keys
- **Error Rates**: Monitor authentication failures
- **Performance**: Track request processing times
- **Security Events**: Alert on suspicious API key usage patterns

## TODO Tasks

- [ ] Create API context management utility with AsyncLocalStorage
- [ ] Define TypeScript types and Zod schemas for API key handling
- [ ] Implement Express middleware for API key extraction and validation
- [ ] Modify main server file to register middleware
- [ ] Update YouTube service to use dynamic Axios clients
- [ ] Make VIDCAP_API_KEY optional in environment schema
- [ ] Create specialized error handling for API key scenarios
- [ ] Add new configuration options for API key features
- [ ] Write comprehensive unit tests for all components
- [ ] Write integration tests for end-to-end functionality
- [ ] Add security validation and HTTPS warnings
- [ ] Update documentation and deployment guides
- [ ] Implement performance monitoring and optimization
- [ ] Add logging and debugging capabilities (without exposing API keys)
- [ ] Test backward compatibility with existing setups
- [ ] Create deployment and rollback procedures

## Conclusion

This implementation plan provides a comprehensive approach to adding API key query parameter support while maintaining security, backward compatibility, and performance. The use of AsyncLocalStorage for request-scoped context management ensures proper isolation between concurrent requests, while the middleware-based approach provides clean separation of concerns.

The plan addresses all security considerations including API key exposure risks, implements proper validation and error handling, and maintains the existing architecture patterns of the VidCap MCP server.