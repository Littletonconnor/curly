#!/bin/bash
# =============================================================================
# 04-query-params.sh - Query String Parameters
# =============================================================================
# Demonstrates: -q/--query for adding URL query parameters
# API: httpbin.org, jsonplaceholder.typicode.com
# =============================================================================

set -e  # Exit on error

echo "=============================================="
echo "  CURLY EXAMPLES: Query Parameters"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Basic Query Parameters
# -----------------------------------------------------------------------------

echo "1. Single query parameter"
echo "   Command: curly https://httpbin.org/get -q name=John"
echo "   ---"
curly https://httpbin.org/get -q name=John
echo ""
echo ""

echo "2. Multiple query parameters"
echo "   Command: curly https://httpbin.org/get -q name=John -q age=30 -q city=NYC"
echo "   ---"
curly https://httpbin.org/get -q name=John -q age=30 -q city=NYC
echo ""
echo ""

echo "3. Using --query long form"
echo "   Command: curly https://httpbin.org/get --query search=curly --query limit=10"
echo "   ---"
curly https://httpbin.org/get --query search=curly --query limit=10
echo ""
echo ""

# -----------------------------------------------------------------------------
# Query Parameters with Special Characters
# -----------------------------------------------------------------------------

echo "4. Query parameter with spaces"
echo "   Command: curly https://httpbin.org/get -q \"name=John Doe\""
echo "   ---"
curly https://httpbin.org/get -q "name=John Doe"
echo ""
echo ""

echo "5. Query parameter with special characters"
echo "   Command: curly https://httpbin.org/get -q \"email=user@example.com\" -q \"tag=a+b\""
echo "   ---"
curly https://httpbin.org/get -q "email=user@example.com" -q "tag=a+b"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Real API Examples
# -----------------------------------------------------------------------------

echo "6. Filter posts by userId (jsonplaceholder)"
echo "   Command: curly https://jsonplaceholder.typicode.com/posts -q userId=1"
echo "   ---"
curly https://jsonplaceholder.typicode.com/posts -q userId=1
echo ""
echo ""

echo "7. Pagination example"
echo "   Command: curly https://jsonplaceholder.typicode.com/posts -q _page=1 -q _limit=3"
echo "   ---"
curly https://jsonplaceholder.typicode.com/posts -q _page=1 -q _limit=3
echo ""
echo ""

echo "8. Search GitHub repositories"
echo "   Command: curly https://api.github.com/search/repositories -q q=curly -q per_page=3"
echo "   ---"
curly https://api.github.com/search/repositories -q q=curly -q per_page=3
echo ""
echo ""

# -----------------------------------------------------------------------------
# Combining with URL Query String
# -----------------------------------------------------------------------------

echo "9. Adding to existing URL query string"
echo "   Command: curly \"https://httpbin.org/get?existing=param\" -q added=value"
echo "   ---"
curly "https://httpbin.org/get?existing=param" -q added=value
echo ""
echo ""

# -----------------------------------------------------------------------------
# Query Parameters with Other Options
# -----------------------------------------------------------------------------

echo "10. Query params with headers"
echo "    Command: curly https://httpbin.org/get -q format=json -H \"Accept: application/json\""
echo "    ---"
curly https://httpbin.org/get -q format=json -H "Accept: application/json"
echo ""
echo ""

echo "11. Query params with POST (less common but valid)"
echo "    Command: curly https://httpbin.org/post -q action=create -d name=NewItem"
echo "    ---"
curly https://httpbin.org/post -q action=create -d name=NewItem
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Query Parameters"
echo "=============================================="
echo ""
echo "  Basic Usage:"
echo "    -q key=value         Add single parameter"
echo "    -q k1=v1 -q k2=v2    Add multiple parameters"
echo "    --query key=value    Long form"
echo ""
echo "  Special Characters:"
echo "    Quote values with spaces: -q \"name=John Doe\""
echo "    Special chars are URL-encoded automatically"
echo ""
echo "  Combined with URL:"
echo "    Query params merge with existing URL params"
echo ""
