# Curly Examples

This directory contains comprehensive examples demonstrating all features of the curly CLI tool.

## Prerequisites

Make sure curly is installed and available in your PATH:

```bash
# From the project root
npm install
npm run build
npm link
```

## Running Examples

Each example file is a standalone shell script that can be run directly:

```bash
# Make executable (if needed)
chmod +x examples/*.sh

# Run a specific example file
./examples/01-basic-requests.sh

# Or run with bash
bash examples/01-basic-requests.sh
```

## Open APIs Used

These examples use public APIs that are freely available for testing:

| API | Description | Used For |
|-----|-------------|----------|
| [httpbin.org](https://httpbin.org) | HTTP request/response testing | Echo requests, test headers, auth, cookies |
| [jsonplaceholder.typicode.com](https://jsonplaceholder.typicode.com) | Fake REST API | CRUD operations |
| [api.github.com](https://api.github.com) | GitHub public API | Real-world API example |

## Example Files

| File | Description |
|------|-------------|
| `01-basic-requests.sh` | GET, POST, PUT, PATCH, DELETE methods |
| `02-headers-and-auth.sh` | Custom headers, basic authentication |
| `03-data-and-forms.sh` | JSON data, form data, file uploads |
| `04-query-params.sh` | Query string manipulation |
| `05-cookies.sh` | Cookie handling (inline and file-based) |
| `06-output-control.sh` | Output formatting, write-out, headers |
| `07-error-handling.sh` | Timeouts, retries, fail mode |
| `08-redirects.sh` | Following redirects |
| `09-load-testing.sh` | Load testing with concurrency |
| `10-profiles-aliases.sh` | Profiles and request aliases |
| `11-proxy.sh` | HTTP proxy support |
| `12-env-interpolation.sh` | Environment variable interpolation |
| `13-completions.sh` | Shell completions (bash/zsh) |

## Sample Data

The `sample-data/` directory contains files used by the examples:

- `cookies.json` - Sample cookies in JSON format
- `cookies.txt` - Sample cookies in Netscape format
- `data.json` - Sample JSON payload
- `upload.txt` - Sample file for upload testing

## Validation Script

Run the comprehensive validation script to test all curly features:

```bash
# Run full test suite
./examples/run-all-examples.sh

# Quick mode (essential tests only)
./examples/run-all-examples.sh --quick

# Verbose mode (show full output)
./examples/run-all-examples.sh --verbose
```

This script is useful for:
- Regression testing after making changes
- Verifying installation is working correctly
- CI/CD pipeline integration

## Tips

- Use `--verbose` or `-v` with any command to see detailed request/response info
- Use `--quiet` to suppress status output (useful for piping)
- Use `-i` to include response headers in output
- Use `-w '%{http_code}'` to extract just the status code
- Use `{{ENV_VAR}}` syntax for environment variable interpolation
