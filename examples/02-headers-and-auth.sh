#!/bin/bash
# =============================================================================
# 02-headers-and-auth.sh - Custom Headers and Authentication
# =============================================================================
# Demonstrates: -H/--header, -u/--user (Basic Auth), custom Content-Type
# API: httpbin.org
# =============================================================================

set -e  # Exit on error

echo "=============================================="
echo "  CURLY EXAMPLES: Headers and Authentication"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Custom Headers
# -----------------------------------------------------------------------------

echo "1. Single custom header"
echo "   Command: curly https://httpbin.org/headers -H \"X-Custom-Header: MyValue\""
echo "   ---"
curly https://httpbin.org/headers -H "X-Custom-Header: MyValue"
echo ""
echo ""

echo "2. Multiple custom headers"
echo "   Command: curly https://httpbin.org/headers -H \"X-Request-ID: 12345\" -H \"X-Client-Version: 1.0.0\""
echo "   ---"
curly https://httpbin.org/headers -H "X-Request-ID: 12345" -H "X-Client-Version: 1.0.0"
echo ""
echo ""

echo "3. Setting Accept header"
echo "   Command: curly https://httpbin.org/headers -H \"Accept: application/xml\""
echo "   ---"
curly https://httpbin.org/headers -H "Accept: application/xml"
echo ""
echo ""

echo "4. Custom Content-Type header"
echo "   Command: curly https://httpbin.org/post -X POST --data-raw '<user><name>John</name></user>' -H \"Content-Type: application/xml\""
echo "   ---"
curly https://httpbin.org/post -X POST --data-raw '<user><name>John</name></user>' -H "Content-Type: application/xml"
echo ""
echo ""

echo "5. Authorization header (Bearer token)"
echo "   Command: curly https://httpbin.org/headers -H \"Authorization: Bearer my-secret-token-123\""
echo "   ---"
curly https://httpbin.org/headers -H "Authorization: Bearer my-secret-token-123"
echo ""
echo ""

echo "6. User-Agent header"
echo "   Command: curly https://httpbin.org/user-agent -H \"User-Agent: MyCurlyClient/1.0\""
echo "   ---"
curly https://httpbin.org/user-agent -H "User-Agent: MyCurlyClient/1.0"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Basic Authentication
# -----------------------------------------------------------------------------

echo "7. Basic Authentication with -u flag"
echo "   Command: curly -u testuser:testpass https://httpbin.org/basic-auth/testuser/testpass"
echo "   ---"
curly -u testuser:testpass https://httpbin.org/basic-auth/testuser/testpass
echo ""
echo ""

echo "8. Basic Auth with --user long form"
echo "   Command: curly --user admin:secret123 https://httpbin.org/basic-auth/admin/secret123"
echo "   ---"
curly --user admin:secret123 https://httpbin.org/basic-auth/admin/secret123
echo ""
echo ""

echo "9. View the Authorization header httpbin receives"
echo "   Command: curly -u myuser:mypass https://httpbin.org/headers"
echo "   ---"
curly -u myuser:mypass https://httpbin.org/headers
echo ""
echo ""

# -----------------------------------------------------------------------------
# Combining Headers and Auth
# -----------------------------------------------------------------------------

echo "10. Combining custom headers with authentication"
echo "    Command: curly -u api:key123 https://httpbin.org/headers -H \"X-API-Version: v2\" -H \"Accept: application/json\""
echo "    ---"
curly -u api:key123 https://httpbin.org/headers -H "X-API-Version: v2" -H "Accept: application/json"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Content-Type Auto-Detection
# -----------------------------------------------------------------------------

echo "11. Auto Content-Type for JSON POST (no explicit header needed)"
echo "    Command: curly https://httpbin.org/post -d name=John -d age=30"
echo "    ---"
curly https://httpbin.org/post -d name=John -d age=30
echo ""
echo ""

echo "12. Override auto-detected Content-Type"
echo "    Command: curly https://httpbin.org/post -d name=John -H \"Content-Type: text/plain\""
echo "    ---"
curly https://httpbin.org/post -d name=John -H "Content-Type: text/plain"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Headers and Authentication"
echo "=============================================="
echo ""
echo "  Headers:"
echo "    -H \"Name: Value\"  Add custom header"
echo "    Multiple -H flags  Add multiple headers"
echo ""
echo "  Authentication:"
echo "    -u user:pass       HTTP Basic Authentication"
echo "    --user user:pass   Long form of -u"
echo ""
echo "  Auto-Detection:"
echo "    Content-Type is auto-set to application/json for POST with -d"
echo "    Use -H to override the auto-detected Content-Type"
echo ""
