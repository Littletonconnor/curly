#!/bin/bash
# =============================================================================
# 01-basic-requests.sh - Basic HTTP Request Methods
# =============================================================================
# Demonstrates: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
# API: httpbin.org, jsonplaceholder.typicode.com
# =============================================================================

set -e  # Exit on error

echo "=============================================="
echo "  CURLY EXAMPLES: Basic HTTP Requests"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# GET Requests
# -----------------------------------------------------------------------------

echo "1. Simple GET request"
echo "   Command: curly https://httpbin.org/get"
echo "   ---"
curly https://httpbin.org/get
echo ""
echo ""

echo "2. GET request to a REST API (fetch a user)"
echo "   Command: curly https://jsonplaceholder.typicode.com/users/1"
echo "   ---"
curly https://jsonplaceholder.typicode.com/users/1
echo ""
echo ""

echo "3. GET request with explicit method flag"
echo "   Command: curly -X GET https://httpbin.org/get"
echo "   ---"
curly -X GET https://httpbin.org/get
echo ""
echo ""

# -----------------------------------------------------------------------------
# POST Requests
# -----------------------------------------------------------------------------

echo "4. POST request with JSON data (auto-detects POST method)"
echo "   Command: curly https://httpbin.org/post -d name=John -d email=john@example.com"
echo "   ---"
curly https://httpbin.org/post -d name=John -d email=john@example.com
echo ""
echo ""

echo "5. POST request with raw JSON data"
echo "   Command: curly https://httpbin.org/post --data-raw '{\"title\":\"Hello\",\"body\":\"World\"}'"
echo "   ---"
curly https://httpbin.org/post --data-raw '{"title":"Hello","body":"World"}'
echo ""
echo ""

echo "6. POST to create a resource"
echo "   Command: curly https://jsonplaceholder.typicode.com/posts -d title=\"My Post\" -d body=\"Content here\" -d userId=1"
echo "   ---"
curly https://jsonplaceholder.typicode.com/posts -d title="My Post" -d body="Content here" -d userId=1
echo ""
echo ""

# -----------------------------------------------------------------------------
# PUT Requests
# -----------------------------------------------------------------------------

echo "7. PUT request to update a resource (full replacement)"
echo "   Command: curly -X PUT https://jsonplaceholder.typicode.com/posts/1 -d id=1 -d title=\"Updated Title\" -d body=\"Updated body\" -d userId=1"
echo "   ---"
curly -X PUT https://jsonplaceholder.typicode.com/posts/1 -d id=1 -d title="Updated Title" -d body="Updated body" -d userId=1
echo ""
echo ""

echo "8. PUT with raw JSON"
echo "   Command: curly -X PUT https://httpbin.org/put --data-raw '{\"id\":1,\"status\":\"active\"}'"
echo "   ---"
curly -X PUT https://httpbin.org/put --data-raw '{"id":1,"status":"active"}'
echo ""
echo ""

# -----------------------------------------------------------------------------
# PATCH Requests
# -----------------------------------------------------------------------------

echo "9. PATCH request (partial update)"
echo "   Command: curly -X PATCH https://jsonplaceholder.typicode.com/posts/1 -d title=\"Only Title Changed\""
echo "   ---"
curly -X PATCH https://jsonplaceholder.typicode.com/posts/1 -d title="Only Title Changed"
echo ""
echo ""

# -----------------------------------------------------------------------------
# DELETE Requests
# -----------------------------------------------------------------------------

echo "10. DELETE request"
echo "    Command: curly -X DELETE https://jsonplaceholder.typicode.com/posts/1"
echo "    ---"
curly -X DELETE https://jsonplaceholder.typicode.com/posts/1
echo ""
echo ""

echo "11. DELETE with httpbin (shows request details)"
echo "    Command: curly -X DELETE https://httpbin.org/delete"
echo "    ---"
curly -X DELETE https://httpbin.org/delete
echo ""
echo ""

# -----------------------------------------------------------------------------
# HEAD Requests
# -----------------------------------------------------------------------------

echo "12. HEAD request (fetch only headers, no body)"
echo "    Command: curly -I https://httpbin.org/get"
echo "    ---"
curly -I https://httpbin.org/get
echo ""
echo ""

echo "13. HEAD request with explicit method"
echo "    Command: curly -X HEAD https://httpbin.org/get -i"
echo "    ---"
curly -X HEAD https://httpbin.org/get -i
echo ""
echo ""

# -----------------------------------------------------------------------------
# OPTIONS Requests
# -----------------------------------------------------------------------------

echo "14. OPTIONS request (check allowed methods)"
echo "    Command: curly -X OPTIONS https://httpbin.org/get -i"
echo "    ---"
curly -X OPTIONS https://httpbin.org/get -i
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Basic Request Methods"
echo "=============================================="
echo ""
echo "  GET     - Retrieve data (default method)"
echo "  POST    - Create new resources (-d auto-detects POST)"
echo "  PUT     - Full resource replacement"
echo "  PATCH   - Partial resource update"
echo "  DELETE  - Remove resources"
echo "  HEAD    - Get headers only (-I shortcut)"
echo "  OPTIONS - Check allowed methods"
echo ""
echo "  Use -X or --method to explicitly set the HTTP method"
echo ""
