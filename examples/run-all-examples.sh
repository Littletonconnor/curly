#!/bin/bash
# =============================================================================
# run-all-examples.sh - Comprehensive Curly CLI Validation Script
# =============================================================================
# This script runs through all curly features to validate the CLI is working.
# Use this for regression testing after making changes.
#
# Usage: ./examples/run-all-examples.sh [--quick] [--verbose]
#   --quick    Run only essential tests (faster)
#   --verbose  Show full output instead of pass/fail summary
# =============================================================================

set -o pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
QUICK_MODE=false
VERBOSE_MODE=false
for arg in "$@"; do
    case $arg in
        --quick) QUICK_MODE=true ;;
        --verbose) VERBOSE_MODE=true ;;
    esac
done

# Counters
PASSED=0
FAILED=0
SKIPPED=0

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Temp directory for test files
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

run_test() {
    local name="$1"
    local cmd="$2"
    local expected_exit="${3:-0}"

    if $VERBOSE_MODE; then
        echo ""
        echo -e "${YELLOW}TEST: $name${NC}"
        echo "  CMD: $cmd"
    fi

    # Run command and capture output
    output=$(eval "$cmd" 2>&1)
    actual_exit=$?

    if [ "$actual_exit" -eq "$expected_exit" ]; then
        if $VERBOSE_MODE; then
            echo -e "  ${GREEN}PASS${NC} (exit code: $actual_exit)"
            echo "$output" | head -5 | sed 's/^/  > /'
        else
            echo -ne "${GREEN}.${NC}"
        fi
        ((PASSED++))
        return 0
    else
        echo ""
        echo -e "${RED}FAIL: $name${NC}"
        echo "  CMD: $cmd"
        echo "  Expected exit: $expected_exit, Got: $actual_exit"
        echo "$output" | head -10 | sed 's/^/  > /'
        ((FAILED++))
        return 1
    fi
}

run_test_output() {
    local name="$1"
    local cmd="$2"
    local expected_pattern="$3"

    if $VERBOSE_MODE; then
        echo ""
        echo -e "${YELLOW}TEST: $name${NC}"
        echo "  CMD: $cmd"
        echo "  EXPECT: $expected_pattern"
    fi

    output=$(eval "$cmd" 2>&1)
    actual_exit=$?

    if echo "$output" | grep -qE "$expected_pattern"; then
        if $VERBOSE_MODE; then
            echo -e "  ${GREEN}PASS${NC}"
        else
            echo -ne "${GREEN}.${NC}"
        fi
        ((PASSED++))
        return 0
    else
        echo ""
        echo -e "${RED}FAIL: $name${NC}"
        echo "  CMD: $cmd"
        echo "  Expected pattern: $expected_pattern"
        echo "  Output:"
        echo "$output" | head -10 | sed 's/^/  > /'
        ((FAILED++))
        return 1
    fi
}

skip_test() {
    local name="$1"
    local reason="$2"
    if $VERBOSE_MODE; then
        echo -e "${YELLOW}SKIP: $name - $reason${NC}"
    else
        echo -ne "${YELLOW}S${NC}"
    fi
    ((SKIPPED++))
}

# =============================================================================
# TESTS BEGIN
# =============================================================================

echo ""
echo "=============================================="
echo "  CURLY CLI VALIDATION SUITE"
echo "=============================================="
echo ""
echo "Mode: $($QUICK_MODE && echo 'Quick' || echo 'Full')"
echo "Verbose: $VERBOSE_MODE"
echo ""

# -----------------------------------------------------------------------------
# 1. BASIC REQUESTS (HTTP Methods)
# -----------------------------------------------------------------------------

print_header "1. HTTP Methods"

run_test "GET request" \
    "curly https://httpbin.org/get --quiet"

run_test "GET with explicit -X" \
    "curly -X GET https://httpbin.org/get --quiet"

run_test "POST with -d auto-detection" \
    "curly https://httpbin.org/post -d test=value --quiet"

run_test "POST with --data-raw" \
    "curly https://httpbin.org/post --data-raw '{\"key\":\"value\"}' --quiet"

run_test "PUT request" \
    "curly -X PUT https://httpbin.org/put -d id=1 --quiet"

run_test "PATCH request" \
    "curly -X PATCH https://httpbin.org/patch -d field=updated --quiet"

run_test "DELETE request" \
    "curly -X DELETE https://httpbin.org/delete --quiet"

run_test "HEAD request (-I)" \
    "curly -I https://httpbin.org/get"

run_test "OPTIONS request" \
    "curly -X OPTIONS https://httpbin.org/get -i --quiet"

# -----------------------------------------------------------------------------
# 2. HEADERS AND AUTH
# -----------------------------------------------------------------------------

print_header "2. Headers and Authentication"

run_test "Custom header (-H)" \
    "curly https://httpbin.org/headers -H 'X-Test: value' --quiet"

run_test "Multiple headers" \
    "curly https://httpbin.org/headers -H 'X-One: 1' -H 'X-Two: 2' --quiet"

run_test "Basic auth (-u)" \
    "curly -u user:pass https://httpbin.org/basic-auth/user/pass --quiet"

run_test_output "Auth header is set" \
    "curly -u testuser:testpass https://httpbin.org/headers --quiet" \
    "Authorization.*Basic"

# -----------------------------------------------------------------------------
# 3. DATA AND FORMS
# -----------------------------------------------------------------------------

print_header "3. Data and Forms"

run_test "Key-value data (-d)" \
    "curly https://httpbin.org/post -d name=test --quiet"

run_test "Multiple -d flags" \
    "curly https://httpbin.org/post -d a=1 -d b=2 -d c=3 --quiet"

run_test "Raw JSON data" \
    "curly https://httpbin.org/post --data-raw '[1,2,3]' --quiet"

run_test "Form data (-F)" \
    "curly https://httpbin.org/post -F field=value --quiet"

run_test "File upload (-F @file)" \
    "curly https://httpbin.org/post -F 'upload=@${SCRIPT_DIR}/sample-data/upload.txt' --quiet"

run_test "Data from file (-d @file)" \
    "curly https://httpbin.org/post -d @${SCRIPT_DIR}/sample-data/data.json --quiet"

# -----------------------------------------------------------------------------
# 4. QUERY PARAMETERS
# -----------------------------------------------------------------------------

print_header "4. Query Parameters"

run_test "Single query param (-q)" \
    "curly https://httpbin.org/get -q name=test --quiet"

run_test "Multiple query params" \
    "curly https://httpbin.org/get -q a=1 -q b=2 --quiet"

run_test_output "Query params in URL" \
    "curly https://httpbin.org/get -q search=term --quiet" \
    "search.*term"

# -----------------------------------------------------------------------------
# 5. COOKIES
# -----------------------------------------------------------------------------

print_header "5. Cookies"

run_test "Inline cookie (-b)" \
    "curly https://httpbin.org/cookies -b 'session=abc123' --quiet"

run_test "Multiple cookies" \
    "curly https://httpbin.org/cookies -b 's1=v1' -b 's2=v2' --quiet"

run_test "Cookie from JSON file" \
    "curly https://httpbin.org/cookies -b '${SCRIPT_DIR}/sample-data/cookies.json' --quiet"

run_test "Cookie from Netscape file" \
    "curly https://httpbin.org/cookies -b '${SCRIPT_DIR}/sample-data/cookies.txt' --quiet"

run_test "Cookie jar (--cookie-jar)" \
    "curly 'https://httpbin.org/cookies/set/testcookie/testvalue' --cookie-jar '${TEMP_DIR}/jar.json' --quiet && test -f '${TEMP_DIR}/jar.json'"

# -----------------------------------------------------------------------------
# 6. OUTPUT CONTROL
# -----------------------------------------------------------------------------

print_header "6. Output Control"

run_test "Include headers (-i)" \
    "curly https://httpbin.org/get -i --quiet"

run_test "Headers only (-I)" \
    "curly -I https://httpbin.org/get"

run_test "Output to file (-o)" \
    "curly https://httpbin.org/get -o '${TEMP_DIR}/output.json' && test -s '${TEMP_DIR}/output.json'"

run_test_output "Write-out status code" \
    "curly https://httpbin.org/status/201 -w '%{http_code}' --quiet" \
    "^201"

run_test_output "Write-out time_total" \
    "curly https://httpbin.org/get -w '%{time_total}' --quiet" \
    "[0-9]+\\.[0-9]+"

run_test_output "Write-out size_download" \
    "curly https://httpbin.org/get -w '%{size_download}' --quiet" \
    "[0-9]+"

run_test "Quiet mode (--quiet)" \
    "curly https://httpbin.org/get --quiet"

# -----------------------------------------------------------------------------
# 7. ERROR HANDLING
# -----------------------------------------------------------------------------

print_header "7. Error Handling"

run_test "Timeout success (-t)" \
    "curly https://httpbin.org/delay/1 -t 5000 --quiet"

run_test "Timeout failure" \
    "curly https://httpbin.org/delay/5 -t 1000 --quiet" \
    1

run_test "Fail mode on 404 (-f)" \
    "curly https://httpbin.org/status/404 -f --quiet" \
    22

run_test "Fail mode on 200" \
    "curly https://httpbin.org/status/200 -f --quiet"

run_test "Retry (--retry)" \
    "curly https://httpbin.org/get --retry 1 --quiet"

# -----------------------------------------------------------------------------
# 8. REDIRECTS
# -----------------------------------------------------------------------------

print_header "8. Redirects"

run_test_output "No follow by default (302)" \
    "curly https://httpbin.org/redirect/1 -w '%{http_code}' --quiet" \
    "^302"

run_test_output "Follow redirects (-L)" \
    "curly https://httpbin.org/redirect/1 -L -w '%{http_code}' --quiet" \
    "^200"

run_test "Follow multiple redirects" \
    "curly https://httpbin.org/redirect/3 -L --quiet"

run_test "Max redirects exceeded" \
    "curly https://httpbin.org/redirect/5 -L --max-redirects 2 --quiet" \
    1

# -----------------------------------------------------------------------------
# 9. LOAD TESTING
# -----------------------------------------------------------------------------

if ! $QUICK_MODE; then
    print_header "9. Load Testing"

    run_test_output "Load test (-n)" \
        "curly https://httpbin.org/get -n 5 -c 2" \
        "Summary|Requests/sec"

    run_test_output "Load test stats" \
        "curly https://httpbin.org/get -n 10 -c 5" \
        "p50|p90|p99"
else
    print_header "9. Load Testing (SKIPPED in quick mode)"
    skip_test "Load testing" "Quick mode"
fi

# -----------------------------------------------------------------------------
# 10. PROFILES AND ALIASES
# -----------------------------------------------------------------------------

print_header "10. Profiles and Aliases"

# Create temporary config for testing
CONFIG_DIR="$HOME/.config/curly"
CONFIG_BAK="$CONFIG_DIR/config.json.test-backup"
ALIASES_BAK="$CONFIG_DIR/aliases.json.test-backup"

mkdir -p "$CONFIG_DIR"
[ -f "$CONFIG_DIR/config.json" ] && cp "$CONFIG_DIR/config.json" "$CONFIG_BAK"
[ -f "$CONFIG_DIR/aliases.json" ] && cp "$CONFIG_DIR/aliases.json" "$ALIASES_BAK"

# Create test config
cat > "$CONFIG_DIR/config.json" << 'EOF'
{
  "profiles": {
    "test-profile": {
      "baseUrl": "https://httpbin.org",
      "timeout": 10000
    }
  }
}
EOF

echo "{}" > "$CONFIG_DIR/aliases.json"

run_test "Profile usage (-p)" \
    "curly /get -p test-profile --quiet"

run_test "Save alias (--save)" \
    "curly https://httpbin.org/get --save test-alias --quiet"

run_test "Use alias (--use)" \
    "curly --use test-alias --quiet"

run_test "List aliases (--aliases)" \
    "curly --aliases"

run_test "Delete alias (--delete-alias)" \
    "curly --delete-alias test-alias"

# Restore config
[ -f "$CONFIG_BAK" ] && mv "$CONFIG_BAK" "$CONFIG_DIR/config.json" || rm -f "$CONFIG_DIR/config.json"
[ -f "$ALIASES_BAK" ] && mv "$ALIASES_BAK" "$CONFIG_DIR/aliases.json" || rm -f "$CONFIG_DIR/aliases.json"

# -----------------------------------------------------------------------------
# 11. ENVIRONMENT VARIABLE INTERPOLATION
# -----------------------------------------------------------------------------

print_header "11. Environment Variables"

export TEST_VAR="interpolated-value"

run_test_output "Header interpolation" \
    "curly https://httpbin.org/headers -H 'X-Test: {{TEST_VAR}}' --quiet" \
    "interpolated-value"

run_test_output "Auth interpolation" \
    "TEST_USER=user TEST_PASS=pass curly https://httpbin.org/headers -u '{{TEST_USER}}:{{TEST_PASS}}' --quiet" \
    "Authorization"

# -----------------------------------------------------------------------------
# 12. SHELL COMPLETIONS
# -----------------------------------------------------------------------------

print_header "12. Shell Completions"

run_test "Bash completions" \
    "curly --completions bash | head -1"

run_test "Zsh completions" \
    "curly --completions zsh | head -1"

# -----------------------------------------------------------------------------
# 13. HELP AND MISC
# -----------------------------------------------------------------------------

print_header "13. Help and Miscellaneous"

run_test "Help (-h)" \
    "curly -h"

run_test "Help (--help)" \
    "curly --help"

run_test "History (--history)" \
    "curly --history" \
    0

run_test "Verbose mode (-v)" \
    "curly https://httpbin.org/get -v --quiet"

# -----------------------------------------------------------------------------
# 14. DRY RUN AND DEBUGGING
# -----------------------------------------------------------------------------

print_header "14. Dry Run and Debugging"

run_test_output "Dry run mode" \
    "curly https://httpbin.org/post -X POST -d test=value --dry-run" \
    "DRY RUN"

run_test_output "Dry run shows method" \
    "curly https://httpbin.org/post -X POST --dry-run" \
    "Method:.*POST"

run_test_output "Dry run shows URL" \
    "curly https://httpbin.org/get --dry-run" \
    "URL:.*httpbin.org"

# -----------------------------------------------------------------------------
# 15. JSON OUTPUT MODE
# -----------------------------------------------------------------------------

print_header "15. JSON Output Mode"

run_test_output "JSON output format" \
    "curly https://httpbin.org/get --json" \
    '"request".*"response"'

run_test_output "JSON includes timing" \
    "curly https://httpbin.org/get --json" \
    '"timing"'

run_test_output "JSON includes status" \
    "curly https://httpbin.org/get --json" \
    '"status".*200'

# -----------------------------------------------------------------------------
# 16. LOAD TEST EXPORT
# -----------------------------------------------------------------------------

if ! $QUICK_MODE; then
    print_header "16. Load Test Export"

    run_test_output "Export to JSON" \
        "curly https://httpbin.org/get -n 3 -c 1 --export json" \
        '"summary".*"latency"'

    run_test_output "Export to CSV" \
        "curly https://httpbin.org/get -n 3 -c 1 --export csv" \
        "timestamp,latency_ms,status_code"
else
    print_header "16. Load Test Export (SKIPPED in quick mode)"
    skip_test "Load test export" "Quick mode"
fi

# =============================================================================
# SUMMARY
# =============================================================================

echo ""
echo ""
echo "=============================================="
echo "  TEST RESULTS"
echo "=============================================="
echo ""
echo -e "  ${GREEN}PASSED:${NC}  $PASSED"
echo -e "  ${RED}FAILED:${NC}  $FAILED"
echo -e "  ${YELLOW}SKIPPED:${NC} $SKIPPED"
echo ""

TOTAL=$((PASSED + FAILED))
if [ $FAILED -eq 0 ]; then
    echo -e "  ${GREEN}All $TOTAL tests passed!${NC}"
    exit 0
else
    echo -e "  ${RED}$FAILED of $TOTAL tests failed${NC}"
    exit 1
fi
