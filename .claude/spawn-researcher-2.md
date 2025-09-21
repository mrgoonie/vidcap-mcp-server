# Research Task: Directory Path Extraction and State Management

## Research Assignment

**Task**: Analyze the directory path extraction logic and session state management

**Focus Areas**:
1. **Directory path validation** - Examine `_validateAndCleanDirectoryPath` method
2. **Session state updates** - Analyze how `currentWorkingDirectory` is updated in session
3. **Output parsing logic** - Review how pwd output is extracted from shell output
4. **State persistence** - Investigate if the working directory state persists correctly
5. **Terminal ANSI sequence handling** - Check if ANSI escape sequences interfere with parsing

**Key Files to Analyze**:
- `/Users/duynguyen/www/devpocket-mvp-app/lib/core/services/ssh_service.dart` (focus on directory path extraction logic)
- `/Users/duynguyen/www/devpocket-mvp-app/lib/data/models/ssh_session.dart` (session state management)

**Log Evidence Analysis**:
- Line 70 shows: `pwd\n\^[[?2004l/home\n\^[[?2004h\^[]0;testpwd@vmi2757774: /home\^G`
- The `/home` path is embedded in ANSI escape sequences
- The output contains shell prompt formatting that may interfere with parsing

**Research Questions**:
1. Is the directory path `/home` being correctly extracted from the ANSI-formatted output?
2. Are the ANSI escape sequences (`\^[[?2004l`, `\^[[?2004h`) being properly handled?
3. Is the session state update (`copyWith(currentWorkingDirectory:)`) working correctly?
4. Why does the UI still show `~` as working directory instead of `/home`?

**Expected Output**:
Detailed analysis report in `./plans/reports/002-from-researcher-path-extraction-to-planner-report.md`

**Success Criteria**:
- Analyze the pwd output parsing logic for ANSI sequence handling
- Verify session state update mechanism is working
- Identify why extracted directory path isn't being reflected in UI
- Propose improvements to path extraction robustness