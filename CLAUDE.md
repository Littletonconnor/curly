# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

## Task Tracking

**After completing any feature or task**, always update `TODO.md`:
- Mark the completed item with strikethrough (`~~item~~`) and a checkmark (`✓`)
- This keeps the roadmap accurate and helps track progress

## Example Maintenance

**When adding new flags or features**, always update the examples:

1. **Update existing example scripts** if the feature fits an existing category:
   - `01-basic-requests.sh` - HTTP methods
   - `02-headers-and-auth.sh` - Headers and authentication
   - `03-data-and-forms.sh` - Request body and form data
   - `04-query-params.sh` - Query string parameters
   - `05-cookies.sh` - Cookie handling
   - `06-output-control.sh` - Output formatting (`-i`, `-o`, `-w`, `--quiet`)
   - `07-error-handling.sh` - Timeouts, retries, fail mode
   - `08-redirects.sh` - Redirect following
   - `09-load-testing.sh` - Load testing (`-n`, `-c`)
   - `10-profiles-aliases.sh` - Profiles and aliases
   - `11-proxy.sh` - Proxy support
   - `12-env-interpolation.sh` - Environment variable interpolation
   - `13-completions.sh` - Shell completions

2. **Create a new example script** if the feature is substantial and doesn't fit existing categories

3. **Update `run-all-examples.sh`** to include tests for the new feature

4. **Update `examples/README.md`** if adding a new example file

This ensures all features are documented with working examples and can be validated through the test suite.
