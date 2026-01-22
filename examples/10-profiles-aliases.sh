#!/bin/bash
# =============================================================================
# 10-profiles-aliases.sh - Profiles and Request Aliases
# =============================================================================
# Demonstrates: --init, -p/--profile, --save, --use, --aliases, --delete-alias
# =============================================================================

set -e

echo "=============================================="
echo "  CURLY EXAMPLES: Profiles and Aliases"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Setup: Backup existing config files
# -----------------------------------------------------------------------------

CONFIG_DIR="$HOME/.config/curly"
CONFIG_FILE="$CONFIG_DIR/config.json"
ALIASES_FILE="$CONFIG_DIR/aliases.json"
CONFIG_BACKUP="$CONFIG_DIR/config.json.example-backup"
ALIASES_BACKUP="$CONFIG_DIR/aliases.json.example-backup"

# Create config directory if needed
mkdir -p "$CONFIG_DIR"

# Backup existing files
if [ -f "$CONFIG_FILE" ]; then
    cp "$CONFIG_FILE" "$CONFIG_BACKUP"
    echo "Backed up existing config.json"
fi
if [ -f "$ALIASES_FILE" ]; then
    cp "$ALIASES_FILE" "$ALIASES_BACKUP"
    echo "Backed up existing aliases.json"
fi

# Cleanup function to restore backups
cleanup() {
    echo ""
    echo "Restoring original configuration..."
    if [ -f "$CONFIG_BACKUP" ]; then
        mv "$CONFIG_BACKUP" "$CONFIG_FILE"
        echo "  Restored config.json"
    else
        rm -f "$CONFIG_FILE"
    fi
    if [ -f "$ALIASES_BACKUP" ]; then
        mv "$ALIASES_BACKUP" "$ALIASES_FILE"
        echo "  Restored aliases.json"
    else
        rm -f "$ALIASES_FILE"
    fi
    echo "Done!"
}

# Restore on exit (normal or error)
trap cleanup EXIT

echo ""

# -----------------------------------------------------------------------------
# Interactive Setup (--init)
# -----------------------------------------------------------------------------

echo "INTERACTIVE SETUP"
echo "-----------------"
echo ""
echo "The easiest way to create profiles is with the interactive wizard:"
echo "  curly --init"
echo ""
echo "This guides you through creating profiles with base URLs, headers,"
echo "timeouts, and retry settings. The wizard will:"
echo "  - Detect existing config and offer to merge"
echo "  - Create multiple named profiles"
echo "  - Set a default profile"
echo "  - Configure headers, timeouts, and retry settings"
echo ""
echo "(Note: --init is interactive and not run in this automated script)"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Profiles
# -----------------------------------------------------------------------------

echo "PROFILES"
echo "--------"
echo ""
echo "Profiles are defined in ~/.config/curly/config.json"
echo ""
echo "Example config.json structure:"
echo '{'
echo '  "profiles": {'
echo '    "dev": {'
echo '      "baseUrl": "http://localhost:3000",'
echo '      "timeout": 5000,'
echo '      "headers": { "X-Environment": "development" }'
echo '    },'
echo '    "prod": {'
echo '      "baseUrl": "https://api.example.com",'
echo '      "timeout": 30000,'
echo '      "retry": 3,'
echo '      "retryDelay": 1000'
echo '    }'
echo '  }'
echo '}'
echo ""

# Create demo config (will be restored on exit)
cat > "$CONFIG_FILE" << 'EOF'
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
echo "(Using temporary demo config for examples)"
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

# Clear aliases file for clean demo
echo "{}" > "$ALIASES_FILE"

echo "ALIASES"
echo "-------"
echo ""

echo "4. Save a request as an alias"
echo "   Command: curly https://httpbin.org/get -H \"X-Custom: header\" --save my-get"
echo "   ---"
curly https://httpbin.org/get -H "X-Custom: header" --save my-get
echo ""
echo ""

echo "5. Save a POST request alias"
echo "   Command: curly https://httpbin.org/post -d name=test -d value=123 --save my-post"
echo "   ---"
curly https://httpbin.org/post -d name=test -d value=123 --save my-post
echo ""
echo ""

echo "6. Save an authenticated request"
echo "   Command: curly https://httpbin.org/basic-auth/user/pass -u user:pass --save my-auth"
echo "   ---"
curly https://httpbin.org/basic-auth/user/pass -u user:pass --save my-auth
echo ""
echo ""

echo "7. List all saved aliases"
echo "   Command: curly --aliases"
echo "   ---"
curly --aliases
echo ""
echo ""

echo "8. Use a saved alias"
echo "   Command: curly --use my-get"
echo "   ---"
curly --use my-get
echo ""
echo ""

echo "9. Use alias and override with additional flags"
echo "   Command: curly --use my-get -H \"X-Extra: override\""
echo "   ---"
curly --use my-get -H "X-Extra: override"
echo ""
echo ""

echo "10. Use the POST alias"
echo "    Command: curly --use my-post"
echo "    ---"
curly --use my-post
echo ""
echo ""

echo "11. Use alias with different data"
echo "    Command: curly --use my-post -d name=different -d value=456"
echo "    ---"
curly --use my-post -d name=different -d value=456
echo ""
echo ""

echo "12. Delete an alias"
echo "    Command: curly --delete-alias my-auth"
echo "    ---"
curly --delete-alias my-auth
echo ""
echo ""

echo "13. Verify alias was deleted"
echo "    Command: curly --aliases"
echo "    ---"
curly --aliases
echo ""
echo ""

# -----------------------------------------------------------------------------
# Verbose Mode
# -----------------------------------------------------------------------------

echo "VERBOSE MODE"
echo "------------"
echo ""

echo "14. Verbose mode shows detailed request/response info"
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

echo "15. View command history"
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
echo "  Setup:"
echo "    --init               Interactive config wizard"
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

# Cleanup happens automatically via trap
