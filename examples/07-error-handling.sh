#!/bin/bash
# =============================================================================
# 07-error-handling.sh - Timeouts, Retries, and Error Handling
# =============================================================================
# Demonstrates: -t/--timeout, --retry, --retry-delay, -f/--fail
# API: httpbin.org
# =============================================================================

# Note: Not using set -e because we want to demonstrate error scenarios

echo "=============================================="
echo "  CURLY EXAMPLES: Error Handling"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Timeouts
# -----------------------------------------------------------------------------

echo "1. Request with timeout (success - completes before timeout)"
echo "   Command: curly https://httpbin.org/delay/1 -t 5000"
echo "   ---"
curly https://httpbin.org/delay/1 -t 5000
echo ""
echo ""

echo "2. Request that times out (2 second delay, 1 second timeout)"
echo "   Command: curly https://httpbin.org/delay/2 -t 1000"
echo "   ---"
curly https://httpbin.org/delay/2 -t 1000 || echo "   [Request timed out as expected]"
echo ""
echo ""

echo "3. Using --timeout long form"
echo "   Command: curly https://httpbin.org/delay/1 --timeout 3000"
echo "   ---"
curly https://httpbin.org/delay/1 --timeout 3000
echo ""
echo ""

# -----------------------------------------------------------------------------
# Retries
# -----------------------------------------------------------------------------

echo "4. Request with retry on 500 error"
echo "   Command: curly https://httpbin.org/status/500 --retry 2 --retry-delay 500"
echo "   ---"
curly https://httpbin.org/status/500 --retry 2 --retry-delay 500
echo ""
echo ""

echo "5. Successful request (no retries needed)"
echo "   Command: curly https://httpbin.org/get --retry 3"
echo "   ---"
curly https://httpbin.org/get --retry 3
echo ""
echo ""

echo "6. Retry with exponential backoff (default behavior)"
echo "   Note: Delays double each retry: 1000ms, 2000ms, 4000ms..."
echo "   Command: curly https://httpbin.org/status/503 --retry 2 --retry-delay 1000"
echo "   ---"
curly https://httpbin.org/status/503 --retry 2 --retry-delay 1000
echo ""
echo ""

# -----------------------------------------------------------------------------
# Fail on HTTP Error (-f/--fail)
# -----------------------------------------------------------------------------

echo "7. Fail mode on 404 (exit code 22)"
echo "   Command: curly https://httpbin.org/status/404 -f"
echo "   ---"
curly https://httpbin.org/status/404 -f
EXIT_CODE=$?
echo "   Exit code: $EXIT_CODE"
echo ""
echo ""

echo "8. Fail mode on 500 error"
echo "   Command: curly https://httpbin.org/status/500 -f"
echo "   ---"
curly https://httpbin.org/status/500 -f
EXIT_CODE=$?
echo "   Exit code: $EXIT_CODE"
echo ""
echo ""

echo "9. Fail mode on success (no error)"
echo "   Command: curly https://httpbin.org/status/200 -f"
echo "   ---"
curly https://httpbin.org/status/200 -f
EXIT_CODE=$?
echo "   Exit code: $EXIT_CODE"
echo ""
echo ""

echo "10. Using --fail long form"
echo "    Command: curly https://httpbin.org/status/403 --fail"
echo "    ---"
curly https://httpbin.org/status/403 --fail
EXIT_CODE=$?
echo "    Exit code: $EXIT_CODE"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Combining Error Handling Options
# -----------------------------------------------------------------------------

echo "11. Timeout with retries"
echo "    Command: curly https://httpbin.org/delay/3 -t 1000 --retry 2 --retry-delay 500"
echo "    ---"
curly https://httpbin.org/delay/3 -t 1000 --retry 2 --retry-delay 500 || echo "    [Failed after retries]"
echo ""
echo ""

echo "12. Fail mode with retries"
echo "    Command: curly https://httpbin.org/status/500 -f --retry 2 --retry-delay 500"
echo "    ---"
curly https://httpbin.org/status/500 -f --retry 2 --retry-delay 500
EXIT_CODE=$?
echo "    Exit code: $EXIT_CODE"
echo ""
echo ""

echo "13. All error handling options combined"
echo "    Command: curly https://httpbin.org/status/502 -f -t 5000 --retry 1 --retry-delay 500"
echo "    ---"
curly https://httpbin.org/status/502 -f -t 5000 --retry 1 --retry-delay 500
EXIT_CODE=$?
echo "    Exit code: $EXIT_CODE"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Checking Different HTTP Status Codes
# -----------------------------------------------------------------------------

echo "14. Various HTTP status codes"
echo "    ---"

for status in 200 201 204 301 400 401 403 404 500 502 503; do
    echo -n "    Status $status: "
    curly "https://httpbin.org/status/$status" -w '%{http_code}' --quiet
    echo ""
done
echo ""

# -----------------------------------------------------------------------------
# Dry Run Mode (Debugging)
# -----------------------------------------------------------------------------

echo "15. Dry run - show request details without sending"
echo "    Command: curly --dry-run https://httpbin.org/get"
echo "    ---"
curly --dry-run https://httpbin.org/get
echo ""
echo ""

echo "16. Dry run with POST data"
echo "    Command: curly --dry-run -X POST -d name=test -d value=123 https://httpbin.org/post"
echo "    ---"
curly --dry-run -X POST -d name=test -d value=123 https://httpbin.org/post
echo ""
echo ""

echo "17. Dry run with headers and query params"
echo "    Command: curly --dry-run -H \"Authorization: Bearer token123\" -q search=term https://httpbin.org/get"
echo "    ---"
curly --dry-run -H "Authorization: Bearer token123" -q search=term https://httpbin.org/get
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Error Handling"
echo "=============================================="
echo ""
echo "  Timeouts:"
echo "    -t, --timeout MS   Abort after MS milliseconds"
echo ""
echo "  Retries:"
echo "    --retry N          Retry N times on failure"
echo "    --retry-delay MS   Initial delay (doubles each retry)"
echo ""
echo "  Fail Mode:"
echo "    -f, --fail         Exit code 22 on HTTP 4xx/5xx"
echo ""
echo "  Dry Run:"
echo "    --dry-run          Show request details without sending"
echo ""
echo "  Exit Codes:"
echo "    0   Success"
echo "    1   General error"
echo "    22  HTTP error (with -f flag)"
echo ""
