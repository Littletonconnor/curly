#!/bin/bash
# =============================================================================
# 12-env-interpolation.sh - Environment Variable Interpolation
# =============================================================================
# Demonstrates: {{VAR}} syntax for environment variable substitution
# API: httpbin.org
# =============================================================================

set -e  # Exit on error

echo "=============================================="
echo "  CURLY EXAMPLES: Environment Variables"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Setup: Export test environment variables
# -----------------------------------------------------------------------------

export TEST_API_KEY="my-secret-api-key-12345"
export TEST_USER="testuser"
export TEST_PASS="testpass123"
export TEST_HEADER_VALUE="custom-value-from-env"
export TEST_QUERY_VALUE="search-term"

echo "Environment variables set for this demo:"
echo "  TEST_API_KEY=$TEST_API_KEY"
echo "  TEST_USER=$TEST_USER"
echo "  TEST_PASS=$TEST_PASS"
echo "  TEST_HEADER_VALUE=$TEST_HEADER_VALUE"
echo "  TEST_QUERY_VALUE=$TEST_QUERY_VALUE"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Header Interpolation
# -----------------------------------------------------------------------------

echo "HEADER INTERPOLATION"
echo "--------------------"
echo ""

echo "1. API key in Authorization header"
echo "   Command: curly https://httpbin.org/headers -H \"Authorization: Bearer {{TEST_API_KEY}}\""
echo "   ---"
curly https://httpbin.org/headers -H "Authorization: Bearer {{TEST_API_KEY}}"
echo ""
echo ""

echo "2. Custom header with env variable"
echo "   Command: curly https://httpbin.org/headers -H \"X-Custom-Header: {{TEST_HEADER_VALUE}}\""
echo "   ---"
curly https://httpbin.org/headers -H "X-Custom-Header: {{TEST_HEADER_VALUE}}"
echo ""
echo ""

echo "3. Multiple headers with interpolation"
echo "   Command: curly https://httpbin.org/headers -H \"Authorization: Bearer {{TEST_API_KEY}}\" -H \"X-User: {{TEST_USER}}\""
echo "   ---"
curly https://httpbin.org/headers -H "Authorization: Bearer {{TEST_API_KEY}}" -H "X-User: {{TEST_USER}}"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Authentication Interpolation
# -----------------------------------------------------------------------------

echo "AUTHENTICATION INTERPOLATION"
echo "----------------------------"
echo ""

echo "4. Basic auth with env variables"
echo "   Command: curly https://httpbin.org/basic-auth/testuser/testpass123 -u \"{{TEST_USER}}:{{TEST_PASS}}\""
echo "   ---"
curly https://httpbin.org/basic-auth/testuser/testpass123 -u "{{TEST_USER}}:{{TEST_PASS}}"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Query Parameter Interpolation
# -----------------------------------------------------------------------------

echo "QUERY PARAMETER INTERPOLATION"
echo "-----------------------------"
echo ""

echo "5. Query parameter from env variable"
echo "   Command: curly https://httpbin.org/get -q \"search={{TEST_QUERY_VALUE}}\""
echo "   ---"
curly https://httpbin.org/get -q "search={{TEST_QUERY_VALUE}}"
echo ""
echo ""

echo "6. Multiple query params with interpolation"
echo "   Command: curly https://httpbin.org/get -q \"user={{TEST_USER}}\" -q \"key={{TEST_API_KEY}}\""
echo "   ---"
curly https://httpbin.org/get -q "user={{TEST_USER}}" -q "key={{TEST_API_KEY}}"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Data Interpolation
# -----------------------------------------------------------------------------

echo "DATA INTERPOLATION"
echo "------------------"
echo ""

echo "7. POST data with env variable"
echo "   Command: curly https://httpbin.org/post -d \"username={{TEST_USER}}\" -d \"apiKey={{TEST_API_KEY}}\""
echo "   ---"
curly https://httpbin.org/post -d "username={{TEST_USER}}" -d "apiKey={{TEST_API_KEY}}"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Combined Usage
# -----------------------------------------------------------------------------

echo "COMBINED USAGE"
echo "--------------"
echo ""

echo "8. Full request with multiple interpolations"
echo "   Command: curly https://httpbin.org/post -H \"Authorization: Bearer {{TEST_API_KEY}}\" -d \"user={{TEST_USER}}\" -q \"ref={{TEST_HEADER_VALUE}}\""
echo "   ---"
curly https://httpbin.org/post -H "Authorization: Bearer {{TEST_API_KEY}}" -d "user={{TEST_USER}}" -q "ref={{TEST_HEADER_VALUE}}"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Undefined Variables
# -----------------------------------------------------------------------------

echo "UNDEFINED VARIABLES"
echo "-------------------"
echo ""

echo "9. Undefined variable behavior"
echo "   Note: Undefined variables are left as-is (not replaced)"
echo "   Command: curly https://httpbin.org/headers -H \"X-Undefined: {{UNDEFINED_VAR}}\""
echo "   ---"
curly https://httpbin.org/headers -H "X-Undefined: {{UNDEFINED_VAR}}"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Aliases with Interpolation
# -----------------------------------------------------------------------------

echo "ALIASES WITH INTERPOLATION"
echo "--------------------------"
echo ""
echo "Aliases can contain {{VAR}} syntax that gets resolved at execution time."
echo "This allows you to save request templates that use dynamic values."
echo ""
echo "Example workflow:"
echo "  1. Save: curly https://api.example.com -H \"Authorization: Bearer {{API_KEY}}\" --save api-request"
echo "  2. Set:  export API_KEY=production-key"
echo "  3. Use:  curly --use api-request"
echo ""
echo "The API_KEY will be resolved when --use is executed, not when --save was called."
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Environment Variable Interpolation"
echo "=============================================="
echo ""
echo "  Syntax: {{VARIABLE_NAME}}"
echo ""
echo "  Supported in:"
echo "    - Headers:     -H \"Authorization: Bearer {{API_KEY}}\""
echo "    - Auth:        -u \"{{USER}}:{{PASS}}\""
echo "    - Query:       -q \"key={{VALUE}}\""
echo "    - Data:        -d \"field={{VALUE}}\""
echo "    - URLs:        https://{{HOST}}/api"
echo ""
echo "  Behavior:"
echo "    - Defined variables are replaced with their values"
echo "    - Undefined variables are left as-is"
echo ""
echo "  Use Cases:"
echo "    - API keys and secrets (keep out of command history)"
echo "    - Environment-specific configuration (dev/staging/prod)"
echo "    - CI/CD pipelines with secret injection"
echo "    - Reusable alias templates"
echo ""
