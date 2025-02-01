# Curly

![Curly Banner](./banner.svg)

A command-line tool for making `curl` requests simpler and more intuitive. Think of `curly` as a light wrapper around `fetch` in Node.js - plus some handy CLI niceties.

## Features
* **Simple JSON Posting**: Automatically sets `Content-Type`: `application/json` if you're posting data. 
* **Automatic Content-Type Parsing**: Tries to parse JSON responses by default. This makes it easier to make requests to JSON APIs or HTML documents without having to specify `Content-Type` headers.
* **Helper Flags** (like `--help`, `--debug`, `--include`) for easier debugging and data introspection.
* **Familiar options**: Mimics some curl style flags (`-X`, `-H`, `-d`, `-I`).
* **Pretty Printing**: The CLI automatically pretty prints the output for you, and groups response data into easily viewable chunks.
* **Viewing history**: Easily view history of commands you have written.

## Installation

There are two main ways to install curly: globally via npm (for everyday usage) or by "linking" locally for development.

### Global Installation
* Ensure you have Node >= 20 installed.
* Run `npm install -g @cwl/curly` 
* Verify that curly is installed `curly --help`

### Linking
If you're developing `curly` and want to test your changes without publishing:
* Clone or download this repository.
* Install dependencies `npm install`
* Build the CLI `npm run build`
* Create a symlink in your global `npm` bin folder: `npm link`
* Confirm the CLI is now accessible: `which curly`

## Usage
```sh
Usage: curly [OPTIONS] <url>
```

### Examples:

Simple GET request

```sh
curly https://jsonplaceholder.typicode.com/posts/1
```
* By default curly will use GET.


Quickly get a summary of your request, which includes the byte size of the response and the status code.
```sh
curly -S https://jsonplaceholder.typicode.com/posts/1

# OR 

curly --summary https://jsonplaceholder.typicode.com/posts/1
```
* Status codes are automatically colored red for you if they are > 300 and green otherwise.

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
* History is automatically written to ~/curly_history.txt

Debug mode:
```sh
curly --debug https://jsonplaceholder.typicode.com/posts/1
```
