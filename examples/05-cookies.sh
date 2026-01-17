#!/bin/bash
# =============================================================================
# 05-cookies.sh - Cookie Handling
# =============================================================================
# Demonstrates: -b/--cookie (inline and file), --cookie-jar
# API: httpbin.org
# =============================================================================

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "=============================================="
echo "  CURLY EXAMPLES: Cookie Handling"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Inline Cookies
# -----------------------------------------------------------------------------

echo "1. Single inline cookie"
echo "   Command: curly https://httpbin.org/cookies -b \"session=abc123\""
echo "   ---"
curly https://httpbin.org/cookies -b "session=abc123"
echo ""
echo ""

echo "2. Multiple cookies in one flag"
echo "   Command: curly https://httpbin.org/cookies -b \"session=abc123; user=john; theme=dark\""
echo "   ---"
curly https://httpbin.org/cookies -b "session=abc123; user=john; theme=dark"
echo ""
echo ""

echo "3. Multiple -b flags"
echo "   Command: curly https://httpbin.org/cookies -b session=xyz789 -b user=alice"
echo "   ---"
curly https://httpbin.org/cookies -b session=xyz789 -b user=alice
echo ""
echo ""

echo "4. Using --cookie long form"
echo "   Command: curly https://httpbin.org/cookies --cookie \"token=secret-token-value\""
echo "   ---"
curly https://httpbin.org/cookies --cookie "token=secret-token-value"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Cookies from Files
# -----------------------------------------------------------------------------

echo "5. Cookies from JSON file"
echo "   Command: curly https://httpbin.org/cookies -b ${SCRIPT_DIR}/sample-data/cookies.json"
echo "   ---"
curly https://httpbin.org/cookies -b "${SCRIPT_DIR}/sample-data/cookies.json"
echo ""
echo ""

echo "6. Cookies from Netscape format file"
echo "   Command: curly https://httpbin.org/cookies -b ${SCRIPT_DIR}/sample-data/cookies.txt"
echo "   ---"
curly https://httpbin.org/cookies -b "${SCRIPT_DIR}/sample-data/cookies.txt"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Cookie Jar (Saving Cookies)
# -----------------------------------------------------------------------------

echo "7. Save cookies to a jar file"
echo "   Command: curly https://httpbin.org/cookies/set/mycookie/myvalue --cookie-jar ${TEMP_DIR}/jar.json"
echo "   ---"
curly "https://httpbin.org/cookies/set/mycookie/myvalue" --cookie-jar "${TEMP_DIR}/jar.json"
echo ""
echo "   Cookie jar contents:"
cat "${TEMP_DIR}/jar.json"
echo ""
echo ""

echo "8. Set multiple cookies and save to jar"
echo "   Command: curly \"https://httpbin.org/cookies/set?cookie1=value1&cookie2=value2\" --cookie-jar ${TEMP_DIR}/multi-jar.json"
echo "   ---"
curly "https://httpbin.org/cookies/set?cookie1=value1&cookie2=value2" --cookie-jar "${TEMP_DIR}/multi-jar.json"
echo ""
echo "   Cookie jar contents:"
cat "${TEMP_DIR}/multi-jar.json"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Using Saved Cookies
# -----------------------------------------------------------------------------

echo "9. Use cookies from previously saved jar"
echo "   Command: curly https://httpbin.org/cookies -b ${TEMP_DIR}/jar.json"
echo "   ---"
curly https://httpbin.org/cookies -b "${TEMP_DIR}/jar.json"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Cookies with Other Options
# -----------------------------------------------------------------------------

echo "10. Cookies with headers and auth"
echo "    Command: curly https://httpbin.org/cookies -b \"session=test123\" -H \"X-Request-ID: req-001\" -u user:pass"
echo "    ---"
curly https://httpbin.org/cookies -b "session=test123" -H "X-Request-ID: req-001" -u user:pass
echo ""
echo ""

echo "11. Cookies with POST data"
echo "    Command: curly https://httpbin.org/post -b \"auth=token123\" -d action=submit"
echo "    ---"
curly https://httpbin.org/post -b "auth=token123" -d action=submit
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Cookie Handling"
echo "=============================================="
echo ""
echo "  Inline Cookies (-b/--cookie):"
echo "    -b \"name=value\"              Single cookie"
echo "    -b \"n1=v1; n2=v2\"            Multiple in one flag"
echo "    -b name=val1 -b name2=val2   Multiple -b flags"
echo ""
echo "  Cookie Files:"
echo "    -b /path/to/cookies.json     JSON format"
echo "    -b /path/to/cookies.txt      Netscape format"
echo ""
echo "  Cookie Jar:"
echo "    --cookie-jar file.json       Save response cookies"
echo "    Then use: -b file.json       To send saved cookies"
echo ""
