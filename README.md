# Curly

![Curly Banner](./banner.svg)

A command-line tool for making `curl` requests simpler and more intuitive. Think of `curly` as a light wrapper around `fetch` in Node.js - plus some handy CLI niceties.

## Features

- **Simple JSON Posting**: Automatically sets `Content-Type`: `application/json` if you're posting data.
- **Automatic Content-Type Parsing**: Tries to parse JSON responses by default. This makes it easier to make requests to JSON APIs or HTML documents without having to specify `Content-Type` headers.
- **Helper Flags** (like `--help`, `--debug`, `--include`) for easier debugging and data introspection.
- **Familiar options**: Mimics some curl style flags (`-X`, `-H`, `-d`, `-I`).
- **Pretty Printing**: The CLI automatically pretty prints the output for you, and groups response data into easily viewable chunks.
- **Viewing history**: Easily view history of commands you have written.

## Installation

There are two main ways to install curly: globally via npm (for everyday usage) or by "linking" locally for development.

### Global Installation

- Ensure you have Node >= 20 installed.
- Run `npm install -g @cwl/curly`
- Verify that curly is installed `curly --help`

### Linking

If you're developing `curly` and want to test your changes without publishing:

- Clone or download this repository.
- Install dependencies `npm install`
- Build the CLI `npm run build`
- Create a symlink in your global `npm` bin folder: `npm link`
- Confirm the CLI is now accessible: `which curly`

## Usage

```sh
Usage: curly [OPTIONS] <url>
```

### Examples:

Simple GET request

```sh
curly https://jsonplaceholder.typicode.com/posts/1
```

- By default curly will use GET.

Quickly get a summary of your request, which includes the byte size of the response and the status code.

```sh
curly -S https://jsonplaceholder.typicode.com/posts/1

# OR

curly --summary https://jsonplaceholder.typicode.com/posts/1
```

- Status codes are automatically colored red for you if they are > 300 and green otherwise.

HEAD request

```sh
curly -I https://jsonplaceholder.typicode.com/posts/1

# OR

curly --head https://jsonplaceholder.typicode.com/posts/1
```

Include only headers in output

```sh
curly -i https://jsonplaceholder.typicode.com/posts/1
```

POST raw JSON data

```sh
curly -X POST --data-raw '{"title": "foo", "body": "bar"}' https://jsonplaceholder.typicode.com/posts
```

POST key/value pairs as JSON (an easier alternative to --data-raw)

```sh
curly -X POST -d title=foo -d body=bar https://jsonplaceholder.typicode.com/posts
```

Write to an output file

```sh
curly -o ./test.txt https://jsonplaceholder.typicode.com/posts
```

Save cookies to a cookie jar file

```sh
curly -c ./cookies.json https://example.com/login
```

Send cookies with your request

```sh
curly -b "NAME1=VALUE1;" https://example.com/login

# OR pass cookies through regular headers

curly -H "Set-Cookie: NAME1=VALUE1;" https://example.com/login

# OR use a file (can be json or netscape)

curly -b ./cookie_file.json https://example.com/login
```

Send and save cookies with your request

```sh
curly -b "NAME1=VALUE1;" -c ./cookies.json https://example.com/login
```

Query params

```sh
curly https://jsonplaceholder.typicode.com/posts?userId=1

# OR

curly -q userId=1 https://jsonplaceholder.typicode.com/posts
```

Viewing history

```sh
Usage: curly --history
```

- History is automatically written to ~/curly_history.txt

Debug mode:

```sh
curly --debug https://jsonplaceholder.typicode.com/posts/1
```

## Architecture

Curly follows a modular architecture designed for maintainability, testability, and extensibility. The codebase is organized into clear functional areas with well-defined separation of concerns.

### Project Structure

```
src/
├── commands/           # CLI command implementations
│   ├── request/       # Default HTTP request command
│   │   └── index.ts   # Single request execution
│   └── load-test/     # Load testing command
│       ├── index.ts   # Load test orchestration
│       └── stats.ts   # Statistics collection and analysis
├── core/              # Core business logic
│   ├── http/          # HTTP-related functionality
│   │   ├── client.ts  # HTTP client and request building
│   │   ├── cookies.ts # Cookie parsing and handling
│   │   └── index.ts   # HTTP module exports
│   └── config/        # Configuration and constants
│       ├── constants.ts # Content-type definitions
│       └── index.ts    # Config module exports
├── lib/               # Shared libraries and utilities
│   ├── cli/           # CLI-specific utilities
│   │   ├── parser.ts  # Command-line argument parsing
│   │   ├── help.ts    # Help text generation
│   │   └── index.ts   # CLI module exports
│   ├── output/        # Output formatting utilities
│   │   ├── formatters.ts # Response output formatting
│   │   ├── table.ts      # Table rendering utilities
│   │   └── index.ts      # Output module exports
│   └── utils/         # General utilities
│       ├── logger.ts  # Debug and error logging
│       ├── history.ts # Command history management
│       ├── file.ts    # File operations and validation
│       └── index.ts   # Utils module exports
├── types/             # TypeScript type definitions
│   └── index.ts       # Shared type definitions
└── index.ts           # Main entry point and orchestration
```

### Directory Overview

#### `commands/`

Contains implementations for different CLI commands. Each command is self-contained and focuses on a specific functionality:

- **`request/`**: Handles single HTTP requests with output formatting
- **`load-test/`**: Manages load testing scenarios with statistics collection

This structure makes it easy to add new commands without affecting existing functionality.

#### `core/`

Houses the essential business logic that powers the application:

- **`http/`**: All HTTP-related functionality including request building, response handling, and cookie management
- **`config/`**: Application configuration, constants, and settings

Core modules are designed to be reusable across different commands.

#### `lib/`

Contains shared libraries and utilities organized by function:

- **`cli/`**: Command-line interface utilities including argument parsing and help generation
- **`output/`**: Response formatting, table rendering, and output management
- **`utils/`**: General-purpose utilities like logging, file operations, and history management

#### `types/`

Centralized TypeScript type definitions used throughout the application.

### Naming Conventions

- **Files**: Use kebab-case for file names (`load-test.ts`, `cookie-jar.ts`)
- **Directories**: Use kebab-case for directory names (`load-test/`, `cli/`)
- **Functions**: Use camelCase (`executeRequest`, `buildResponse`)
- **Types**: Use PascalCase (`FetchOptions`, `RequestResult`)
- **Constants**: Use SCREAMING_SNAKE_CASE (`CONTENT_TYPES`, `DEFAULT_REQUESTS`)

### Adding New Features

When adding new functionality to Curly, follow these guidelines:

1. **New Commands**: Add to `src/commands/` with a dedicated directory
2. **Core Logic**: Add shared business logic to `src/core/`
3. **Utilities**: Add reusable utilities to appropriate `src/lib/` subdirectories
4. **Types**: Add shared types to `src/types/index.ts`

### Import Strategy

The architecture uses barrel exports (`index.ts` files) to provide clean import paths:

```typescript
// Clean imports using barrel exports
import { cli, printHelpMessage } from './lib/cli'
import { curl, buildResponse } from './core/http'

// Avoid deep imports when possible
import { logger } from './lib/utils/logger' // Only when needed
```
