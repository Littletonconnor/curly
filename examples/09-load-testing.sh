#!/bin/bash
# =============================================================================
# 09-load-testing.sh - Load Testing Features
# =============================================================================
# Demonstrates: -n/--requests, -c/--concurrency, load test statistics
# API: httpbin.org
# =============================================================================

set -e  # Exit on error

echo "=============================================="
echo "  CURLY EXAMPLES: Load Testing"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Basic Load Testing
# -----------------------------------------------------------------------------

echo "1. Simple load test (10 requests)"
echo "   Command: curly https://httpbin.org/get -n 10"
echo "   ---"
curly https://httpbin.org/get -n 10
echo ""
echo ""

echo "2. Load test with concurrency (10 requests, 5 concurrent)"
echo "   Command: curly https://httpbin.org/get -n 10 -c 5"
echo "   ---"
curly https://httpbin.org/get -n 10 -c 5
echo ""
echo ""

echo "3. Using long form flags"
echo "   Command: curly https://httpbin.org/get --requests 10 --concurrency 3"
echo "   ---"
curly https://httpbin.org/get --requests 10 --concurrency 3
echo ""
echo ""

# -----------------------------------------------------------------------------
# Auto-Detection of Load Test Mode
# -----------------------------------------------------------------------------

echo "4. Auto-detect load test mode with -n only"
echo "   Note: -c defaults to 50 when only -n is specified"
echo "   Command: curly https://httpbin.org/get -n 15"
echo "   ---"
curly https://httpbin.org/get -n 15
echo ""
echo ""

echo "5. Auto-detect load test mode with -c only"
echo "   Note: -n defaults to 200 when only -c is specified"
echo "   Command: curly https://httpbin.org/get -c 5"
echo "   Note: Running with fewer requests for demo"
echo "   ---"
curly https://httpbin.org/get -n 20 -c 5
echo ""
echo ""

# -----------------------------------------------------------------------------
# Load Testing Different Endpoints
# -----------------------------------------------------------------------------

echo "6. Load test a slow endpoint"
echo "   Command: curly https://httpbin.org/delay/1 -n 5 -c 5"
echo "   ---"
curly https://httpbin.org/delay/1 -n 5 -c 5
echo ""
echo ""

echo "7. Load test POST requests"
echo "   Command: curly https://httpbin.org/post -n 10 -c 5 -d test=data"
echo "   ---"
curly https://httpbin.org/post -n 10 -c 5 -d test=data
echo ""
echo ""

echo "8. Load test with headers"
echo "   Command: curly https://httpbin.org/headers -n 10 -c 5 -H \"X-Test: load-test\""
echo "   ---"
curly https://httpbin.org/headers -n 10 -c 5 -H "X-Test: load-test"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Load Testing with Mixed Status Codes
# -----------------------------------------------------------------------------

echo "9. Load test endpoint with random failures"
echo "   Note: Shows status code distribution in results"
echo "   Command: curly https://httpbin.org/status/200,500 -n 20 -c 5"
echo "   ---"
curly "https://httpbin.org/status/200,500" -n 20 -c 5
echo ""
echo ""

# -----------------------------------------------------------------------------
# Understanding the Statistics
# -----------------------------------------------------------------------------

echo "10. Larger load test with detailed statistics"
echo "    Command: curly https://httpbin.org/get -n 50 -c 10"
echo "    ---"
curly https://httpbin.org/get -n 50 -c 10
echo ""
echo ""

# -----------------------------------------------------------------------------
# Load Testing with Timeouts
# -----------------------------------------------------------------------------

echo "11. Load test with timeout"
echo "    Command: curly https://httpbin.org/delay/2 -n 5 -c 5 -t 1000"
echo "    ---"
curly https://httpbin.org/delay/2 -n 5 -c 5 -t 1000 || true
echo ""
echo ""

# -----------------------------------------------------------------------------
# Real-World Scenarios
# -----------------------------------------------------------------------------

echo "12. Simulate API burst traffic"
echo "    Command: curly https://httpbin.org/anything -n 30 -c 10 -d action=burst"
echo "    ---"
curly https://httpbin.org/anything -n 30 -c 10 -d action=burst
echo ""
echo ""

echo "13. Test with varying response sizes"
echo "    Command: curly https://httpbin.org/bytes/1024 -n 20 -c 5"
echo "    ---"
curly https://httpbin.org/bytes/1024 -n 20 -c 5
echo ""
echo ""

# -----------------------------------------------------------------------------
# Exporting Results
# -----------------------------------------------------------------------------

echo "14. Export results to JSON"
echo "    Command: curly https://httpbin.org/get -n 10 -c 5 --export json"
echo "    ---"
curly https://httpbin.org/get -n 10 -c 5 --export json
echo ""
echo ""

echo "15. Export results to CSV"
echo "    Command: curly https://httpbin.org/get -n 10 -c 5 --export csv"
echo "    ---"
curly https://httpbin.org/get -n 10 -c 5 --export csv
echo ""
echo ""

echo "16. Export results to a JSON file"
echo "    Command: curly https://httpbin.org/get -n 10 -c 5 --export json -o /tmp/results.json"
echo "    ---"
curly https://httpbin.org/get -n 10 -c 5 --export json -o /tmp/results.json
echo "    File contents:"
cat /tmp/results.json
rm -f /tmp/results.json
echo ""
echo ""

echo "17. Export results to a CSV file"
echo "    Command: curly https://httpbin.org/get -n 10 -c 5 --export csv -o /tmp/results.csv"
echo "    ---"
curly https://httpbin.org/get -n 10 -c 5 --export csv -o /tmp/results.csv
echo "    File contents:"
cat /tmp/results.csv
rm -f /tmp/results.csv
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Load Testing"
echo "=============================================="
echo ""
echo "  Load Test Flags:"
echo "    -n, --requests N      Number of total requests"
echo "    -c, --concurrency N   Number of concurrent requests"
echo "    -e, --export FORMAT   Export results (json, csv)"
echo ""
echo "  Auto-Detection:"
echo "    Using -n or -c triggers load test mode"
echo "    Default: -n 200, -c 50"
echo ""
echo "  Statistics Provided:"
echo "    - Summary: Total time, Slowest, Fastest, Average, Req/sec"
echo "    - Response time histogram (visual distribution)"
echo "    - Latency percentiles (p10, p25, p50, p75, p90, p99)"
echo "    - Status code distribution"
echo ""
echo "  Export Formats:"
echo "    - JSON: Structured data for programmatic consumption"
echo "    - CSV: Tabular data for spreadsheet analysis"
echo ""
echo "  Tips:"
echo "    - Start with small -n and -c values"
echo "    - Increase gradually to find limits"
echo "    - Watch for timeout errors at high concurrency"
echo "    - Use --export json -o file.json to save results"
echo ""
