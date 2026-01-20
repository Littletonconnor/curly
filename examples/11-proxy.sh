#!/bin/bash
# =============================================================================
# 11-proxy.sh - HTTP Proxy Support
# =============================================================================
# Demonstrates: -x/--proxy for routing requests through a proxy server
# Note: These examples require a proxy server to be running
# =============================================================================

echo "=============================================="
echo "  CURLY EXAMPLES: Proxy Support"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Basic Proxy Usage
# -----------------------------------------------------------------------------

echo "PROXY SUPPORT"
echo "-------------"
echo ""
echo "The proxy flag routes all HTTP requests through a proxy server."
echo "This is useful for debugging, corporate networks, or security testing."
echo ""

echo "1. Basic proxy usage (syntax demo)"
echo "   Command: curly https://httpbin.org/ip -x http://localhost:8080"
echo "   Note: Requires a proxy running on localhost:8080"
echo "   ---"
echo "   (Skipped - requires active proxy)"
echo ""
echo ""

echo "2. Using --proxy long form"
echo "   Command: curly https://httpbin.org/get --proxy http://proxy.example.com:3128"
echo "   ---"
echo "   (Skipped - requires active proxy)"
echo ""
echo ""

echo "3. HTTPS proxy"
echo "   Command: curly https://httpbin.org/get -x https://secure-proxy.example.com:443"
echo "   ---"
echo "   (Skipped - requires active proxy)"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Common Proxy Use Cases
# -----------------------------------------------------------------------------

echo "COMMON USE CASES"
echo "----------------"
echo ""
echo "Corporate proxy:"
echo "  curly https://api.example.com/data -x http://corp-proxy.company.com:8080"
echo ""
echo "Debugging with mitmproxy/Charles/Fiddler:"
echo "  curly https://api.example.com/users -x http://localhost:8080"
echo ""
echo "Security testing with Burp Suite:"
echo "  curly https://target.com/api -x http://127.0.0.1:8080"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Combining Proxy with Other Options
# -----------------------------------------------------------------------------

echo "COMBINING WITH OTHER OPTIONS"
echo "----------------------------"
echo ""
echo "Proxy with headers:"
echo "  curly https://api.example.com -x http://localhost:8080 -H \"Authorization: Bearer token\""
echo ""
echo "Proxy with POST data:"
echo "  curly https://api.example.com -x http://localhost:8080 -d name=test"
echo ""
echo "Proxy with timeout:"
echo "  curly https://api.example.com -x http://localhost:8080 -t 5000"
echo ""
echo "Proxy with verbose mode (useful for debugging):"
echo "  curly https://api.example.com -x http://localhost:8080 -v"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Live Test (if httpbin is available)
# -----------------------------------------------------------------------------

echo "LIVE TEST (without proxy)"
echo "-------------------------"
echo ""
echo "To verify proxy works, compare these two requests:"
echo ""

echo "Request without proxy (showing your real IP):"
echo "  Command: curly https://httpbin.org/ip"
echo "  ---"
curly https://httpbin.org/ip
echo ""
echo ""

echo "With a proxy, the IP shown would be the proxy's IP address."
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Proxy Support"
echo "=============================================="
echo ""
echo "  Proxy Flag:"
echo "    -x, --proxy URL    Route through HTTP/HTTPS proxy"
echo ""
echo "  Supported Formats:"
echo "    http://host:port   HTTP proxy"
echo "    https://host:port  HTTPS proxy"
echo ""
echo "  Common Ports:"
echo "    8080  - Common HTTP proxy port"
echo "    3128  - Squid default port"
echo "    8888  - mitmproxy/Charles default"
echo ""
echo "  Testing Tools:"
echo "    - mitmproxy (free, open-source)"
echo "    - Charles Proxy (commercial)"
echo "    - Fiddler (free for basic use)"
echo "    - Burp Suite (security testing)"
echo ""
