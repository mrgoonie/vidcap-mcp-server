# Directory Navigation Fix - Critical Stream Conflict Issue

## Problem Analysis

The directory navigation implementation has a critical runtime error causing stream conflicts and uninitialized variable errors.

### Issues Identified:

1. **Stream Already Listened Error**:
   - `_executeDirectoryChangeCommand` already has stdout/stderr listeners (lines 640-657)
   - `_updateCurrentWorkingDirectory` tries to create NEW listeners on same streams (lines 750, 764)
   - Results in "Bad state: Stream has already been listened to" error

2. **Late Initialization Error**:
   - Timeout cleanup tries to cancel uninitialized `stdoutSub` and `stderrSub`
   - Causes LateInitializationError in cleanup function

3. **Directory State Not Updated**:
   - Session state remains at `~` instead of updating to `/home` after `cd ..`
   - SSH shell shows correct directory change but session state never gets updated

### Root Cause:
The `_updateCurrentWorkingDirectory` method at lines 717-800 conflicts with existing stream listeners in `_executeDirectoryChangeCommand` at lines 602-714.

### File Context:
- **Main File**: `/Users/duynguyen/www/devpocket-mvp-app/lib/core/services/ssh_service.dart`
- **Error Location**: `_updateCurrentWorkingDirectory` method (lines 717-800)
- **Calling Context**: `_executeDirectoryChangeCommand` method (lines 602-714)

### Success Criteria:
- Fix stream listening conflict - no multiple listeners on same stream
- Ensure proper cleanup - handle timeouts and cancellations correctly
- Maintain directory state consistency - session state must reflect actual shell directory
- Preserve pwd-based approach - don't revert to fragile regex parsing
- Handle edge cases - network issues, command failures, etc.

### Current Evidence:
From logs.txt line 76, the `cd ..` command was successful:
- Shows `DIR_CHANGE_SUCCESS_1758277420565`
- Prompt shows correct directory: `testpwd@vmi2757774: /home`
- But session state never gets updated

## Task for Planner Agent

Create a comprehensive implementation plan to fix this critical issue while maintaining:
1. Reliability of pwd-based directory tracking
2. Clean stream management without conflicts
3. Proper error handling and cleanup
4. Session state consistency

### Required Research Areas:
Please spawn multiple researcher agents to explore:

1. **Stream Management Solutions**: Different approaches to handle single vs multiple stream listeners
2. **Directory Tracking Alternatives**: Other ways to get current directory without conflicting streams
3. **SSH Session Patterns**: Best practices for managing SSH command execution and state tracking
4. **Error Handling Patterns**: Proper cleanup and initialization patterns for async operations
5. **State Synchronization**: Strategies for keeping session state in sync with actual shell state

### Implementation Requirements:
- Must not break existing terminal functionality
- Must maintain backward compatibility with current session management
- Must handle network failures gracefully
- Must follow project coding standards from `/Users/duynguyen/www/devpocket-mvp-app/docs/code-standards.md`
- Must include comprehensive testing strategy

### Output Expected:
Create detailed plan in `/Users/duynguyen/www/devpocket-mvp-app/plans/` directory with:
- Technical solution approach
- Specific code changes needed
- Files to modify/create
- Testing strategy
- Risk mitigation
- Implementation steps with clear instructions