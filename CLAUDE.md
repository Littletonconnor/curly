# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Learning Mode

**Important:** Always use the `learning` output style when working on this project. This mode:
- Identifies opportunities for the user to write meaningful code (5-10 lines) that shapes the solution
- Provides educational insights about implementation choices using `★ Insight` blocks
- Focuses on business logic, design choices, and implementation strategies where user input matters
- Explains trade-offs and guidance rather than just implementing everything directly

Sessions should be collaborative and educational, helping the user learn while building features.

## Project Overview

Curly is a Node.js CLI tool that simplifies making HTTP requests, acting as a wrapper around the fetch API with curl-like syntax. The project is written in TypeScript and uses ES modules.

## Build and Development Commands

### Building

```bash
npm run build        # Build the TypeScript source to dist/
npm run dev         # Build and run the CLI locally
```

### Code Quality

```bash
npm run lint           # Run oxlint to check for issues
npm run lint:fix       # Run oxlint and auto-fix issues
npm run prettier:write # Format code with Prettier
npm run types          # Type check with tsc --noEmit
```

**After making changes**, always run:
```bash
npm run types && npm run lint
```

### Testing

```bash
npm run test           # Build and run tests with Vitest
```

### Installation for Development

```bash
npm install            # Install dependencies
npm run build          # Build the project
npm link               # Create global symlink for testing
```

## Architecture Overview

### Core Structure

The application follows a modular architecture with clear separation of concerns:

- **Entry Point**: `bin/curly.js` - Checks Node version requirements and calls main()
- **Main Flow**: `src/index.ts` - Orchestrates CLI parsing, request execution, and output
- **CLI Parsing**: `src/lib/cli/parser.ts` - Uses Node's native parseArgs for command-line options
- **CLI Help**: `src/lib/cli/help.ts` - Help message generation
- **HTTP Logic**: `src/core/http/client.ts` - Handles URL building, headers, body formatting, and fetch execution
- **Cookie Handling**: `src/core/http/cookies.ts` - Parses and formats cookie headers
- **Output**: `src/lib/output/formatters.ts` - Manages stdout formatting and file writing
- **Table Output**: `src/lib/output/table.ts` - Table formatting utilities
- **Logging**: `src/lib/utils/logger.ts` - Debug and error logging based on DEBUG env var
- **History**: `src/lib/utils/history.ts` - Command history management
- **File Utils**: `src/lib/utils/file.ts` - File reading and validation utilities
- **Request Command**: `src/commands/request/index.ts` - Single request execution
- **Load Test Command**: `src/commands/load-test/index.ts` - Load testing orchestration
- **Load Test Stats**: `src/commands/load-test/stats.ts` - Statistics collection and reporting

### Key Design Patterns

1. **Options Flow**: CLI options are parsed once and passed through the application as a typed `FetchOptions` object
2. **Content-Type Detection**: Automatically infers response type when not specified, with fallback to text
3. **Smart Defaults**: Automatically sets Content-Type to JSON for POST requests with data
4. **Error Handling**: Comprehensive validation of user inputs with clear error messages
5. **Load Test Auto-Detection**: Automatically detects load test mode when `-n` or `-c` flags are present

### Build Configuration

- **TypeScript**: Targets ESNext with ES module output
- **Bundler**: Uses tsup for bundling with source maps
- **Node Version**: Requires Node.js >= 20
- **Code Style**: Prettier with no semicolons, single quotes, 100-char line width

### Important Implementation Details

- The CLI supports both short and long option formats (e.g., `-X` and `--method`)
- Cookie handling supports both file-based and inline cookie specifications
- History is automatically written to `~/curly_history.txt`
- Verbose mode is activated via `--verbose` or `-v` flag for user-friendly logging
- The tool attempts to parse JSON responses by default for better API interaction
- Load testing mode is auto-detected when `-n` (requests) or `-c` (concurrency) flags are present
- Load testing uses batched Promise.all for concurrent request execution
