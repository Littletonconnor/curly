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

### Options

| Option          | Short | Description                                                             |
| --------------- | ----- | ----------------------------------------------------------------------- |
| `--help`        | `-h`  | Display help information                                                |
| `--method`      | `-X`  | HTTP method (GET, POST, PUT, DELETE, etc.)                              |
| `--headers`     | `-H`  | Add custom headers (can be used multiple times)                         |
| `--data`        | `-d`  | Send data as key=value pairs (can be used multiple times)               |
| `--data-raw`    |       | Send raw JSON data                                                      |
| `--query`       | `-q`  | Add query parameters (can be used multiple times)                       |
| `--cookie`      | `-b`  | Send cookies (file path or key=value pairs, can be used multiple times) |
| `--cookie-jar`  |       | Save received cookies to a file                                         |
| `--output`      | `-o`  | Write response to a file                                                |
| `--include`     | `-i`  | Include response headers in output                                      |
| `--head`        | `-I`  | Send HEAD request (headers only)                                        |
| `--summary`     | `-S`  | Show request summary (status, size)                                     |
| `--table`       | `-T`  | Format output as a table                                                |
| `--debug`       |       | Enable debug logging                                                    |
| `--history`     |       | View command history                                                    |
| `--load-test`   |       | Run load testing mode                                                   |
| `--requests`    | `-n`  | Number of requests for load testing                                     |
| `--concurrency` | `-c`  | Concurrency level for load testing                                      |

### Examples

#### Basic Requests

##### Simple GET request (default method)

```sh
curly https://jsonplaceholder.typicode.com/posts/1
```

##### POST request with method flag

```sh
curly -X POST https://jsonplaceholder.typicode.com/posts
```

##### PUT request

```sh
curly -X PUT https://jsonplaceholder.typicode.com/posts/1
```

##### DELETE request

```sh
curly -X DELETE https://jsonplaceholder.typicode.com/posts/1
```

#### Working with Headers

##### Add custom headers

```sh
curly -H "Authorization: Bearer token123" -H "Accept: application/json" https://api.example.com/data
```

##### Include response headers in output

```sh
curly -i https://jsonplaceholder.typicode.com/posts/1
```

##### HEAD request (headers only, no body)

```sh
curly -I https://jsonplaceholder.typicode.com/posts/1
# OR
curly --head https://jsonplaceholder.typicode.com/posts/1
```

#### Sending Data

##### POST JSON data using key=value pairs (automatically converted to JSON)

```sh
curly -X POST -d title=foo -d body=bar -d userId=1 https://jsonplaceholder.typicode.com/posts
# Sends: {"title": "foo", "body": "bar", "userId": "1"}
```

##### POST raw JSON data

```sh
curly -X POST --data-raw '{"title": "foo", "body": "bar", "userId": 1}' https://jsonplaceholder.typicode.com/posts
```

##### Multiple data fields

```sh
curly -X POST -d name=John -d email=john@example.com -d age=30 https://api.example.com/users
```

#### Query Parameters

##### Add query parameters using URL

```sh
curly https://jsonplaceholder.typicode.com/posts?userId=1&completed=true
```

##### Add query parameters using flags

```sh
curly -q userId=1 -q completed=true https://jsonplaceholder.typicode.com/posts
```

#### Cookie Management

##### Send cookies as key=value pairs

```sh
curly -b sessionId=abc123 -b userId=456 https://example.com/api
# Sends Cookie header: sessionId=abc123; userId=456
```

##### Send cookies from a file

```sh
# Reads cookies from a JSON or Netscape format file
curly -b ./cookies.txt https://example.com/api
```

##### Save received cookies to a jar file

```sh
curly --cookie-jar ./cookies.json https://example.com/login
```

##### Send and save cookies in one request

```sh
curly -b sessionId=old123 --cookie-jar ./new-cookies.json https://example.com/refresh
```

**Note:** Unlike curl which uses `-c` for cookie jar, curly uses `--cookie-jar` for clarity

#### Output Options

##### Save response to a file

```sh
curly -o ./response.json https://jsonplaceholder.typicode.com/posts/1
```

##### Show request summary (status, size, method)

```sh
curly -S https://jsonplaceholder.typicode.com/posts/1
# OR
curly --summary https://jsonplaceholder.typicode.com/posts/1
```

##### Format output as a table (works with summary and headers)

```sh
curly -S -T https://jsonplaceholder.typicode.com/posts/1
curly -I -T https://jsonplaceholder.typicode.com/posts/1
```

#### Load Testing

##### Load test with POST data

```sh
curly --load-test -X POST -d name=test -n 50 https://api.example.com/create
```

#### Debugging and History

##### Enable debug mode (shows detailed request/response information)

```sh
curly --debug https://jsonplaceholder.typicode.com/posts/1
# OR set DEBUG environment variable
DEBUG=true curly https://jsonplaceholder.typicode.com/posts/1
```

##### View command history

```sh
curly --history
```

- History is automatically saved to `~/curly_history.txt`

#### Complex Examples

##### API request with authentication and custom headers

```sh
curly -X GET \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Accept: application/json" \
  -H "X-API-Version: 2" \
  https://api.example.com/users/profile
```

##### POST form data with cookies

```sh
curly -X POST \
  -d username=john \
  -d password=secret \
  -b ./cookies.txt \
  --cookie-jar ./new-cookies.txt \
  https://example.com/login
```

##### Download file with progress info

```sh
curly -S -o ./download.pdf https://example.com/files/document.pdf
```

##### Complex query with multiple parameters

```sh
curly -q page=1 \
  -q limit=20 \
  -q sort=created_at \
  -q order=desc \
  -q status=active \
  https://api.example.com/items
```

## Architecture

Curly follows a modular architecture designed for maintainability, testability, and extensibility. The codebase is organized into clear functional areas with well-defined separation of concerns.

### Project Structure

```text
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
