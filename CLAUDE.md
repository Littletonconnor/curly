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
npm run prettier:write  # Format code with Prettier
npm run types          # Type check with tsc --noEmit
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
- **CLI Parsing**: `src/cli.ts` - Uses Node's native parseArgs for command-line options
- **HTTP Logic**: `src/fetch.ts` - Handles URL building, headers, body formatting, and fetch execution
- **Output**: `src/utils.ts` - Manages stdout formatting, file writing, and history
- **Cookie Handling**: `src/cookies.ts` - Parses and formats cookie headers
- **Logging**: `src/logger.ts` - Debug and error logging based on DEBUG env var

### Key Design Patterns

1. **Options Flow**: CLI options are parsed once and passed through the application as a typed `FetchOptions` object
2. **Content-Type Detection**: Automatically infers response type when not specified, with fallback to text
3. **Smart Defaults**: Automatically sets Content-Type to JSON for POST requests with data
4. **Error Handling**: Comprehensive validation of user inputs with clear error messages

### Build Configuration

- **TypeScript**: Targets ESNext with ES module output
- **Bundler**: Uses tsup for bundling with source maps
- **Node Version**: Requires Node.js >= 20
- **Code Style**: Prettier with no semicolons, single quotes, 100-char line width

### Important Implementation Details

- The CLI supports both short and long option formats (e.g., `-X` and `--method`)
- Cookie handling supports both file-based and inline cookie specifications
- History is automatically written to `~/curly_history.txt`
- Debug mode is activated via `--debug` flag or `DEBUG=true` environment variable
- The tool attempts to parse JSON responses by default for better API interaction
