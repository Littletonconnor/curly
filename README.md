# Curly

![Curly Banner](./banner.svg)

A command-line tool for making HTTP requests simpler and more intuitive. Think of `curly` as a modern alternative to `curl` - a light wrapper around `fetch` in Node.js with curl-like syntax, plus built-in load testing capabilities.

## Features

- **Simple JSON Posting**: Automatically sets `Content-Type`: `application/json` if you're posting data.
- **Automatic Content-Type Parsing**: Tries to parse JSON responses by default. This makes it easier to make requests to JSON APIs or HTML documents without having to specify `Content-Type` headers.
- **Load Testing**: Built-in load testing with automatic mode detection. Fire off multiple concurrent requests and get detailed performance statistics including response time histograms.
- **Helper Flags** (like `--help`, `--debug`, `--include`) for easier debugging and data introspection.
- **Familiar options**: Mimics curl-style flags (`-X`, `-H`, `-d`, `-I`) for easy migration from curl.
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
| `--requests`    | `-n`  | Number of requests for load testing (auto-detects load test mode)       |
| `--concurrency` | `-c`  | Concurrency level for load testing (auto-detects load test mode)        |

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
curly -H "Accept: application/json" -H "X-Custom-Header: my-value" https://jsonplaceholder.typicode.com/posts/1
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
curly -X POST -d title="My Post" -d body="Post content" -d userId=1 https://jsonplaceholder.typicode.com/posts
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
curly -b sessionId=abc123 -b userId=456 https://jsonplaceholder.typicode.com/posts/1
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

Load testing mode is automatically detected when `-n` or `-c` flags are present.

##### Basic load test

```sh
curly -n 100 -c 10 https://jsonplaceholder.typicode.com/posts/1
```

##### Load test with POST data

```sh
curly -n 50 -c 5 -X POST -d title=test -d body=content -d userId=1 https://jsonplaceholder.typicode.com/posts
```

##### High concurrency load test

```sh
curly -n 1000 -c 50 https://jsonplaceholder.typicode.com/users
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

##### GET request with query parameters

```sh
curly -q userId=1 https://jsonplaceholder.typicode.com/posts
```

##### GET nested resource (comments for a post)

```sh
curly https://jsonplaceholder.typicode.com/posts/1/comments
```

##### GET with multiple query parameters

```sh
curly -q postId=1 -q id=1 https://jsonplaceholder.typicode.com/comments
```

##### POST with JSON data (key=value pairs)

```sh
curly -X POST \
  -d title="My New Post" \
  -d body="This is the content" \
  -d userId=1 \
  https://jsonplaceholder.typicode.com/posts
```

##### POST with raw JSON data

```sh
curly -X POST \
  --data-raw '{"title": "My New Post", "body": "This is the content", "userId": 1}' \
  https://jsonplaceholder.typicode.com/posts
```

##### PUT request (update existing resource)

```sh
curly -X PUT \
  -d id=1 \
  -d title="Updated Title" \
  -d body="Updated body content" \
  -d userId=1 \
  https://jsonplaceholder.typicode.com/posts/1
```

##### PATCH request (partial update)

```sh
curly -X PATCH \
  -d title="Only Update Title" \
  https://jsonplaceholder.typicode.com/posts/1
```

##### DELETE resource

```sh
curly -X DELETE https://jsonplaceholder.typicode.com/posts/1
```

##### GET with custom headers

```sh
curly -H "Accept: application/json" \
  -H "X-Custom-Header: my-value" \
  https://jsonplaceholder.typicode.com/posts/1
```

##### GET with headers and query parameters

```sh
curly -H "Accept: application/json" \
  -q userId=1 \
  https://jsonplaceholder.typicode.com/posts
```

##### POST with headers and data

```sh
curly -X POST \
  -H "Content-Type: application/json" \
  -H "X-Request-ID: 12345" \
  -d title="New Post" \
  -d body="Post body" \
  -d userId=1 \
  https://jsonplaceholder.typicode.com/posts
```

##### GET with summary and table format

```sh
curly -S -T https://jsonplaceholder.typicode.com/posts/1
```

##### GET headers only (HEAD request)

```sh
curly -I https://jsonplaceholder.typicode.com/posts/1
```

##### GET with included response headers

```sh
curly -i https://jsonplaceholder.typicode.com/posts/1
```

##### Save response to file

```sh
curly -o ./post.json https://jsonplaceholder.typicode.com/posts/1
```

##### GET user's posts and albums

```sh
# Get all posts by user 1
curly -q userId=1 https://jsonplaceholder.typicode.com/posts

# Get all albums by user 1
curly -q userId=1 https://jsonplaceholder.typicode.com/albums
```

##### GET photos from an album

```sh
curly -q albumId=1 https://jsonplaceholder.typicode.com/photos
```

##### GET todos for a user

```sh
curly -q userId=1 https://jsonplaceholder.typicode.com/todos
```

##### POST and save response to file

```sh
curly -X POST \
  -d title="Test Post" \
  -d body="Test body" \
  -d userId=1 \
  -o ./new-post.json \
  https://jsonplaceholder.typicode.com/posts
```

##### Debug mode to see request details

```sh
curly --debug https://jsonplaceholder.typicode.com/posts/1
```

##### Load test a specific endpoint

```sh
# Test GET endpoint
curly -n 100 -c 10 https://jsonplaceholder.typicode.com/posts/1

# Test POST endpoint with data
curly -n 50 -c 5 -X POST \
  -d title="Load Test" \
  -d body="Testing" \
  -d userId=1 \
  https://jsonplaceholder.typicode.com/posts
```
