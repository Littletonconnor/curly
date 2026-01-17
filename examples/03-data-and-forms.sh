#!/bin/bash
# =============================================================================
# 03-data-and-forms.sh - Request Data and Form Submissions
# =============================================================================
# Demonstrates: -d/--data, --data-raw, -F/--form, file references (@file)
# API: httpbin.org
# =============================================================================

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=============================================="
echo "  CURLY EXAMPLES: Data and Forms"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Key-Value Data (-d/--data)
# -----------------------------------------------------------------------------

echo "1. Single key-value pair"
echo "   Command: curly https://httpbin.org/post -d username=johndoe"
echo "   ---"
curly https://httpbin.org/post -d username=johndoe
echo ""
echo ""

echo "2. Multiple key-value pairs"
echo "   Command: curly https://httpbin.org/post -d name=John -d email=john@example.com -d role=admin"
echo "   ---"
curly https://httpbin.org/post -d name=John -d email=john@example.com -d role=admin
echo ""
echo ""

echo "3. Key-value with spaces (quoted)"
echo "   Command: curly https://httpbin.org/post -d \"full_name=John Doe\" -d \"city=New York\""
echo "   ---"
curly https://httpbin.org/post -d "full_name=John Doe" -d "city=New York"
echo ""
echo ""

echo "4. Using --data long form"
echo "   Command: curly https://httpbin.org/post --data name=Alice --data age=25"
echo "   ---"
curly https://httpbin.org/post --data name=Alice --data age=25
echo ""
echo ""

# -----------------------------------------------------------------------------
# Raw Data (--data-raw)
# -----------------------------------------------------------------------------

echo "5. Raw JSON object"
echo "   Command: curly https://httpbin.org/post --data-raw '{\"user\":{\"name\":\"John\",\"email\":\"john@example.com\"}}'"
echo "   ---"
curly https://httpbin.org/post --data-raw '{"user":{"name":"John","email":"john@example.com"}}'
echo ""
echo ""

echo "6. Raw JSON array"
echo "   Command: curly https://httpbin.org/post --data-raw '[1, 2, 3, 4, 5]'"
echo "   ---"
curly https://httpbin.org/post --data-raw '[1, 2, 3, 4, 5]'
echo ""
echo ""

echo "7. Raw nested JSON"
echo "   Command: curly https://httpbin.org/post --data-raw '{\"items\":[{\"id\":1,\"name\":\"Item 1\"},{\"id\":2,\"name\":\"Item 2\"}]}'"
echo "   ---"
curly https://httpbin.org/post --data-raw '{"items":[{"id":1,"name":"Item 1"},{"id":2,"name":"Item 2"}]}'
echo ""
echo ""

echo "8. Raw XML data with Content-Type"
echo "   Command: curly https://httpbin.org/post --data-raw '<root><item>value</item></root>' -H \"Content-Type: application/xml\""
echo "   ---"
curly https://httpbin.org/post --data-raw '<root><item>value</item></root>' -H "Content-Type: application/xml"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Data from File (@file syntax)
# -----------------------------------------------------------------------------

echo "9. Load JSON data from file"
echo "   Command: curly https://httpbin.org/post -d @${SCRIPT_DIR}/sample-data/data.json"
echo "   ---"
curly https://httpbin.org/post -d @"${SCRIPT_DIR}/sample-data/data.json"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Form Data (-F/--form)
# -----------------------------------------------------------------------------

echo "10. Simple form field"
echo "    Command: curly https://httpbin.org/post -F username=johndoe"
echo "    ---"
curly https://httpbin.org/post -F username=johndoe
echo ""
echo ""

echo "11. Multiple form fields"
echo "    Command: curly https://httpbin.org/post -F name=John -F email=john@example.com -F subscribe=yes"
echo "    ---"
curly https://httpbin.org/post -F name=John -F email=john@example.com -F subscribe=yes
echo ""
echo ""

echo "12. File upload with form data"
echo "    Command: curly https://httpbin.org/post -F \"file=@${SCRIPT_DIR}/sample-data/upload.txt\" -F description=\"My uploaded file\""
echo "    ---"
curly https://httpbin.org/post -F "file=@${SCRIPT_DIR}/sample-data/upload.txt" -F description="My uploaded file"
echo ""
echo ""

echo "13. Multiple file uploads"
echo "    Command: curly https://httpbin.org/post -F \"doc1=@${SCRIPT_DIR}/sample-data/upload.txt\" -F \"doc2=@${SCRIPT_DIR}/sample-data/data.json\""
echo "    ---"
curly https://httpbin.org/post -F "doc1=@${SCRIPT_DIR}/sample-data/upload.txt" -F "doc2=@${SCRIPT_DIR}/sample-data/data.json"
echo ""
echo ""

echo "14. Form with --form long syntax"
echo "    Command: curly https://httpbin.org/post --form field1=value1 --form field2=value2"
echo "    ---"
curly https://httpbin.org/post --form field1=value1 --form field2=value2
echo ""
echo ""

# -----------------------------------------------------------------------------
# Combining Data Methods
# -----------------------------------------------------------------------------

echo "15. POST to REST API with structured data"
echo "    Command: curly https://jsonplaceholder.typicode.com/posts --data-raw '{\"title\":\"My New Post\",\"body\":\"This is the content\",\"userId\":1}'"
echo "    ---"
curly https://jsonplaceholder.typicode.com/posts --data-raw '{"title":"My New Post","body":"This is the content","userId":1}'
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Data and Forms"
echo "=============================================="
echo ""
echo "  Key-Value Data (-d/--data):"
echo "    -d key=value         Single field"
echo "    -d k1=v1 -d k2=v2    Multiple fields"
echo "    -d @file.json        Load from file"
echo ""
echo "  Raw Data (--data-raw):"
echo "    --data-raw '{...}'   Send raw JSON/XML/text"
echo ""
echo "  Form Data (-F/--form):"
echo "    -F field=value       Form field"
echo "    -F file=@path        File upload"
echo ""
echo "  Content-Type is auto-detected:"
echo "    -d sets application/json"
echo "    -F sets multipart/form-data"
echo ""
