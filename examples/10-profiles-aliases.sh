#!/bin/bash
# =============================================================================
# 10-profiles-aliases.sh - Profiles and Request Aliases
# =============================================================================
# Demonstrates: -p/--profile, --save, --use, --aliases, --delete-alias
# =============================================================================

# Note: These examples may modify ~/.config/curly/ configuration files

echo "=============================================="
echo "  CURLY EXAMPLES: Profiles and Aliases"
echo "=============================================="
echo ""

# Create config directory if needed
mkdir -p ~/.config/curly

# -----------------------------------------------------------------------------
# Profiles
# -----------------------------------------------------------------------------

echo "PROFILES"
echo "--------"
echo ""
echo "Profiles are defined in ~/.config/curly/config.json"
echo ""
echo "Example config.json:"
echo '{'
echo '  "profiles": {'
echo '    "dev": {'
echo '      "baseUrl": "http://localhost:3000",'
echo '      "timeout": 5000,'
echo '      "headers": {'
echo '        "X-Environment": "development"'
echo '      }'
echo '    },'
echo '    "prod": {'
echo '      "baseUrl": "https://api.example.com",'
echo '      "timeout": 30000,'
echo '      "headers": {'
echo '        "X-Environment": "production"'
echo '      },'
echo '      "retry": 3,'
echo '      "retryDelay": 1000'
echo '    }'
echo '  }'
echo '}'
echo ""

# Create a sample config for demo
cat > ~/.config/curly/config.json << 'EOF'
{
  "profiles": {
    "httpbin": {
      "baseUrl": "https://httpbin.org",
      "timeout": 10000,
      "headers": {
        "X-Profile": "httpbin-demo"
      }
    },
    "jsonapi": {
      "baseUrl": "https://jsonplaceholder.typicode.com",
      "timeout": 5000,
      "headers": {
        "Accept": "application/json"
      }
    }
  }
}
EOF
echo "Created sample config at ~/.config/curly/config.json"
echo ""

echo "1. Using a profile"
echo "   Command: curly /get -p httpbin"
echo "   Note: /get is appended to profile's baseUrl"
echo "   ---"
curly /get -p httpbin
echo ""
echo ""

echo "2. Profile with different base URL"
echo "   Command: curly /users/1 -p jsonapi"
echo "   ---"
curly /users/1 -p jsonapi
echo ""
echo ""

echo "3. Override profile settings with flags"
echo "   Command: curly /get -p httpbin -H \"X-Override: true\""
echo "   ---"
curly /get -p httpbin -H "X-Override: true"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Aliases (Request Templates)
# -----------------------------------------------------------------------------

echo "ALIASES"
echo "-------"
echo ""

echo "4. Save a request as an alias"
echo "   Command: curly https://httpbin.org/get -H \"X-Custom: header\" --save get-with-header"
echo "   ---"
curly https://httpbin.org/get -H "X-Custom: header" --save get-with-header
echo ""
echo ""

echo "5. Save a POST request alias"
echo "   Command: curly https://httpbin.org/post -d name=test -d value=123 --save post-data"
echo "   ---"
curly https://httpbin.org/post -d name=test -d value=123 --save post-data
echo ""
echo ""

echo "6. Save an authenticated request"
echo "   Command: curly https://httpbin.org/basic-auth/user/pass -u user:pass --save auth-request"
echo "   ---"
curly https://httpbin.org/basic-auth/user/pass -u user:pass --save auth-request
echo ""
echo ""

echo "7. List all saved aliases"
echo "   Command: curly --aliases"
echo "   ---"
curly --aliases
echo ""
echo ""

echo "8. Use a saved alias"
echo "   Command: curly --use get-with-header"
echo "   ---"
curly --use get-with-header
echo ""
echo ""

echo "9. Use alias and override with additional flags"
echo "   Command: curly --use get-with-header -H \"X-Extra: override\""
echo "   ---"
curly --use get-with-header -H "X-Extra: override"
echo ""
echo ""

echo "10. Use the POST alias"
echo "    Command: curly --use post-data"
echo "    ---"
curly --use post-data
echo ""
echo ""

echo "11. Use alias with different data"
echo "    Command: curly --use post-data -d name=different -d value=456"
echo "    ---"
curly --use post-data -d name=different -d value=456
echo ""
echo ""

echo "12. Delete an alias"
echo "    Command: curly --delete-alias auth-request"
echo "    ---"
curly --delete-alias auth-request
echo ""
echo ""

echo "13. Verify alias was deleted"
echo "    Command: curly --aliases"
echo "    ---"
curly --aliases
echo ""
echo ""

# Clean up demo aliases
echo "14. Cleaning up demo aliases"
curly --delete-alias get-with-header 2>/dev/null || true
curly --delete-alias post-data 2>/dev/null || true
echo "    Demo aliases cleaned up"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Verbose Mode
# -----------------------------------------------------------------------------

echo "VERBOSE MODE"
echo "------------"
echo ""

echo "15. Verbose mode shows detailed request/response info"
echo "    Command: curly https://httpbin.org/get -v"
echo "    ---"
curly https://httpbin.org/get -v
echo ""
echo ""

# -----------------------------------------------------------------------------
# History
# -----------------------------------------------------------------------------

echo "HISTORY"
echo "-------"
echo ""

echo "16. View command history"
echo "    Command: curly --history"
echo "    Note: Shows recent commands from ~/curly_history.txt"
echo "    ---"
curly --history | head -20 || echo "    No history available yet"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Profiles and Aliases"
echo "=============================================="
echo ""
echo "  Profiles (~/.config/curly/config.json):"
echo "    -p, --profile NAME   Use named profile"
echo "    Profile provides: baseUrl, timeout, headers, retry, retryDelay"
echo ""
echo "  Aliases (~/.config/curly/aliases.json):"
echo "    --save NAME          Save current request as alias"
echo "    --use NAME           Execute a saved alias"
echo "    --aliases            List all saved aliases"
echo "    --delete-alias NAME  Remove an alias"
echo ""
echo "  Other:"
echo "    -v, --verbose        Show detailed request/response info"
echo "    --history            View command history"
echo ""
