#!/bin/bash
# =============================================================================
# 06-output-control.sh - Output Formatting and Control
# =============================================================================
# Demonstrates: -i, -I, -o, -w/--write-out, --quiet
# API: httpbin.org
# =============================================================================

set -e  # Exit on error

TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "=============================================="
echo "  CURLY EXAMPLES: Output Control"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Include Headers (-i/--include)
# -----------------------------------------------------------------------------

echo "1. Include response headers in output"
echo "   Command: curly https://httpbin.org/get -i"
echo "   ---"
curly https://httpbin.org/get -i
echo ""
echo ""

echo "2. Include headers with POST request"
echo "   Command: curly https://httpbin.org/post -d test=value -i"
echo "   ---"
curly https://httpbin.org/post -d test=value -i
echo ""
echo ""

# -----------------------------------------------------------------------------
# Headers Only (-I/--head)
# -----------------------------------------------------------------------------

echo "3. Fetch headers only (HEAD request)"
echo "   Command: curly -I https://httpbin.org/get"
echo "   ---"
curly -I https://httpbin.org/get
echo ""
echo ""

echo "4. Check content type without downloading body"
echo "   Command: curly -I https://httpbin.org/image/png"
echo "   ---"
curly -I https://httpbin.org/image/png
echo ""
echo ""

# -----------------------------------------------------------------------------
# Output to File (-o/--output)
# -----------------------------------------------------------------------------

echo "5. Save response to file"
echo "   Command: curly https://httpbin.org/get -o ${TEMP_DIR}/response.json"
echo "   ---"
curly https://httpbin.org/get -o "${TEMP_DIR}/response.json"
echo "   File contents:"
cat "${TEMP_DIR}/response.json"
echo ""
echo ""

echo "6. Download and save (simulate file download)"
echo "   Command: curly https://httpbin.org/json -o ${TEMP_DIR}/data.json"
echo "   ---"
curly https://httpbin.org/json -o "${TEMP_DIR}/data.json"
echo "   Saved file size: $(wc -c < "${TEMP_DIR}/data.json") bytes"
echo "   File contents:"
cat "${TEMP_DIR}/data.json"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Write-Out Format (-w/--write-out)
# -----------------------------------------------------------------------------

echo "7. Get HTTP status code only"
echo "   Command: curly https://httpbin.org/status/200 -w '%{http_code}' --quiet"
echo "   ---"
curly https://httpbin.org/status/200 -w '%{http_code}' --quiet
echo ""
echo ""

echo "8. Get status code (using status_code alias)"
echo "   Command: curly https://httpbin.org/status/201 -w '%{status_code}' --quiet"
echo "   ---"
curly https://httpbin.org/status/201 -w '%{status_code}' --quiet
echo ""
echo ""

echo "9. Get total request time"
echo "   Command: curly https://httpbin.org/delay/1 -w '%{time_total}' --quiet"
echo "   ---"
curly https://httpbin.org/delay/1 -w '%{time_total}' --quiet
echo ""
echo ""

echo "10. Get download size"
echo "    Command: curly https://httpbin.org/bytes/1024 -w '%{size_download}' --quiet"
echo "    ---"
curly https://httpbin.org/bytes/1024 -w '%{size_download}' --quiet
echo ""
echo ""

echo "11. Multiple write-out variables"
echo "    Command: curly https://httpbin.org/get -w 'Status: %{http_code}, Time: %{time_total}s, Size: %{size_download} bytes' --quiet"
echo "    ---"
curly https://httpbin.org/get -w 'Status: %{http_code}, Time: %{time_total}s, Size: %{size_download} bytes' --quiet
echo ""
echo ""

echo "12. Write-out with response body"
echo "    Command: curly https://httpbin.org/ip -w '\\nStatus: %{http_code}'"
echo "    ---"
curly https://httpbin.org/ip -w '\nStatus: %{http_code}'
echo ""
echo ""

# -----------------------------------------------------------------------------
# Quiet Mode (--quiet)
# -----------------------------------------------------------------------------

echo "13. Quiet mode (suppress status line)"
echo "    Command: curly https://httpbin.org/get --quiet"
echo "    ---"
curly https://httpbin.org/get --quiet
echo ""
echo ""

echo "14. Quiet mode for piping (just body, no status)"
echo "    Command: curly https://httpbin.org/uuid --quiet | head -c 100"
echo "    ---"
curly https://httpbin.org/uuid --quiet | head -c 100
echo ""
echo ""

# -----------------------------------------------------------------------------
# Combining Output Options
# -----------------------------------------------------------------------------

echo "15. Save to file and show status"
echo "    Command: curly https://httpbin.org/json -o ${TEMP_DIR}/out.json -w 'Saved! Status: %{http_code}'"
echo "    ---"
curly https://httpbin.org/json -o "${TEMP_DIR}/out.json" -w 'Saved! Status: %{http_code}'
echo ""
echo ""

echo "16. Headers + output file"
echo "    Command: curly https://httpbin.org/get -i -o ${TEMP_DIR}/with-headers.txt"
echo "    ---"
curly https://httpbin.org/get -i -o "${TEMP_DIR}/with-headers.txt"
echo "   File contents (first 20 lines):"
head -20 "${TEMP_DIR}/with-headers.txt"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Output Control"
echo "=============================================="
echo ""
echo "  Response Headers:"
echo "    -i, --include      Include headers with body"
echo "    -I, --head         Headers only (HEAD request)"
echo ""
echo "  Output Destination:"
echo "    -o, --output FILE  Write body to file"
echo ""
echo "  Write-Out Format (-w/--write-out):"
echo "    %{http_code}       HTTP status code"
echo "    %{status_code}     Alias for http_code"
echo "    %{time_total}      Total time in seconds"
echo "    %{size_download}   Response size in bytes"
echo ""
echo "  Quiet Mode:"
echo "    --quiet            Suppress status line"
echo ""
