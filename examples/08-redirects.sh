#!/bin/bash
# =============================================================================
# 08-redirects.sh - Following HTTP Redirects
# =============================================================================
# Demonstrates: -L/--follow, --max-redirects
# API: httpbin.org
# =============================================================================

set -e  # Exit on error

echo "=============================================="
echo "  CURLY EXAMPLES: HTTP Redirects"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Default Behavior (No Follow)
# -----------------------------------------------------------------------------

echo "1. Default: Don't follow redirects"
echo "   Command: curly https://httpbin.org/redirect/1 -i"
echo "   ---"
curly https://httpbin.org/redirect/1 -i
echo ""
echo ""

echo "2. Show redirect status code"
echo "   Command: curly https://httpbin.org/redirect/1 -w '%{http_code}' --quiet"
echo "   ---"
curly https://httpbin.org/redirect/1 -w '%{http_code}' --quiet
echo ""
echo ""

# -----------------------------------------------------------------------------
# Follow Redirects (-L/--follow)
# -----------------------------------------------------------------------------

echo "3. Follow single redirect"
echo "   Command: curly https://httpbin.org/redirect/1 -L"
echo "   ---"
curly https://httpbin.org/redirect/1 -L
echo ""
echo ""

echo "4. Follow multiple redirects"
echo "   Command: curly https://httpbin.org/redirect/3 -L"
echo "   ---"
curly https://httpbin.org/redirect/3 -L
echo ""
echo ""

echo "5. Using --follow long form"
echo "   Command: curly https://httpbin.org/redirect/2 --follow"
echo "   ---"
curly https://httpbin.org/redirect/2 --follow
echo ""
echo ""

echo "6. Follow redirects with headers shown"
echo "   Command: curly https://httpbin.org/redirect/1 -L -i"
echo "   ---"
curly https://httpbin.org/redirect/1 -L -i
echo ""
echo ""

# -----------------------------------------------------------------------------
# Redirect Types
# -----------------------------------------------------------------------------

echo "7. 301 Permanent redirect"
echo "   Command: curly https://httpbin.org/status/301 -L -i"
echo "   ---"
curly https://httpbin.org/status/301 -L -i || true
echo ""
echo ""

echo "8. 302 Temporary redirect"
echo "   Command: curly https://httpbin.org/status/302 -L -i"
echo "   ---"
curly https://httpbin.org/status/302 -L -i || true
echo ""
echo ""

echo "9. Redirect to specific URL"
echo "   Command: curly \"https://httpbin.org/redirect-to?url=https://httpbin.org/get\" -L"
echo "   ---"
curly "https://httpbin.org/redirect-to?url=https://httpbin.org/get" -L
echo ""
echo ""

# -----------------------------------------------------------------------------
# Max Redirects
# -----------------------------------------------------------------------------

echo "10. Limit maximum redirects"
echo "    Command: curly https://httpbin.org/redirect/5 -L --max-redirects 3"
echo "    ---"
curly https://httpbin.org/redirect/5 -L --max-redirects 3 || echo "    [Exceeded max redirects]"
echo ""
echo ""

echo "11. Max redirects set high enough"
echo "    Command: curly https://httpbin.org/redirect/3 -L --max-redirects 5"
echo "    ---"
curly https://httpbin.org/redirect/3 -L --max-redirects 5
echo ""
echo ""

echo "12. Single redirect allowed"
echo "    Command: curly https://httpbin.org/redirect/1 -L --max-redirects 1"
echo "    ---"
curly https://httpbin.org/redirect/1 -L --max-redirects 1
echo ""
echo ""

# -----------------------------------------------------------------------------
# Redirects with Other Options
# -----------------------------------------------------------------------------

echo "13. Follow redirects with cookies"
echo "    Command: curly \"https://httpbin.org/redirect-to?url=https://httpbin.org/cookies\" -L -b \"session=abc123\""
echo "    ---"
curly "https://httpbin.org/redirect-to?url=https://httpbin.org/cookies" -L -b "session=abc123"
echo ""
echo ""

echo "14. Follow redirects with authentication"
echo "    Command: curly \"https://httpbin.org/redirect-to?url=https://httpbin.org/headers\" -L -u user:pass"
echo "    ---"
curly "https://httpbin.org/redirect-to?url=https://httpbin.org/headers" -L -u user:pass
echo ""
echo ""

echo "15. Follow redirects with custom headers"
echo "    Command: curly \"https://httpbin.org/redirect-to?url=https://httpbin.org/headers\" -L -H \"X-Custom: value\""
echo "    ---"
curly "https://httpbin.org/redirect-to?url=https://httpbin.org/headers" -L -H "X-Custom: value"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Absolute vs Relative Redirects
# -----------------------------------------------------------------------------

echo "16. Relative redirect handling"
echo "    Command: curly https://httpbin.org/relative-redirect/2 -L"
echo "    ---"
curly https://httpbin.org/relative-redirect/2 -L
echo ""
echo ""

echo "17. Absolute redirect handling"
echo "    Command: curly https://httpbin.org/absolute-redirect/2 -L"
echo "    ---"
curly https://httpbin.org/absolute-redirect/2 -L
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: HTTP Redirects"
echo "=============================================="
echo ""
echo "  Follow Redirects:"
echo "    -L, --follow        Follow HTTP redirects"
echo "    --max-redirects N   Limit redirect hops (default: 20)"
echo ""
echo "  Default Behavior:"
echo "    Redirects are NOT followed by default"
echo "    Use -i to see the redirect response headers"
echo ""
echo "  Redirect Types Handled:"
echo "    301 - Permanent redirect"
echo "    302 - Temporary redirect"
echo "    303 - See Other"
echo "    307 - Temporary redirect (preserves method)"
echo "    308 - Permanent redirect (preserves method)"
echo ""
