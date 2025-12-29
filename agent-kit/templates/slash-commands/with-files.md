---
description: [YOUR_DESCRIPTION] (e.g., "Analyze and explain a specific file")
argument-hint: [YOUR_ARG_HINT] (e.g., "<file-path>")
---

# [YOUR_COMMAND_NAME]

## File Contents

**File**: @$1

[ADDITIONAL_FILE_REFERENCES]
Examples:
- Single file: @src/utils/helpers.ts
- Multiple files: @$1 and @$2
- With arguments: @$1 for file path from user

## Analysis

[YOUR_INSTRUCTIONS_FOR_ANALYZING_THE_FILE_CONTENTS]

Example:
Provide a detailed explanation of:
1. **Purpose**: What is this file responsible for?
2. **Key Components**: Main functions, classes, and exports
3. **Dependencies**: External libraries and internal imports
4. **Architecture**: How does it fit in the larger system?
5. **Potential Issues**: Bugs, performance concerns, or technical debt
6. **Improvements**: Specific refactoring suggestions

## Usage Examples

```bash
# Analyze a single file
/analyze src/utils/helpers.ts

# Compare two files
/compare src/v1/api.ts src/v2/api.ts

# Document a file
/document src/components/Button.tsx
```

## Notes

- The `@` prefix includes file contents in the prompt
- Files are read at command execution time
- Combine with arguments: `@$1` for dynamic file paths
- Works with relative paths from project root
