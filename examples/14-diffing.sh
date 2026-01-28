#!/bin/bash
# =============================================================================
# 14-diffing.sh - Response Diffing
# =============================================================================
# Demonstrates: -o (save baseline), --diff
# API: httpbin.org
# =============================================================================

set -e  # Exit on error

TEMP_DIR=$(mktemp -d)
trap "rm -rf $TEMP_DIR" EXIT

echo "=============================================="
echo "  CURLY EXAMPLES: Response Diffing"
echo "=============================================="
echo ""

# -----------------------------------------------------------------------------
# Save Baseline (using -o)
# -----------------------------------------------------------------------------

echo "1. Save a response as a baseline using -o"
echo "   Command: curly --quiet -o ${TEMP_DIR}/baseline.json https://httpbin.org/ip"
echo "   ---"
curly --quiet -o "${TEMP_DIR}/baseline.json" https://httpbin.org/ip
echo "   Baseline contents:"
cat "${TEMP_DIR}/baseline.json"
echo ""
echo ""

# -----------------------------------------------------------------------------
# Diff Against Baseline (--diff)
# -----------------------------------------------------------------------------

echo "2. Compare response against baseline (same endpoint, should match)"
echo "   Command: curly --diff ${TEMP_DIR}/baseline.json https://httpbin.org/ip"
echo "   ---"
curly --diff "${TEMP_DIR}/baseline.json" https://httpbin.org/ip
echo ""
echo ""

echo "3. Compare response against different endpoint (should show diff)"
echo "   Creating baseline from /ip, comparing against /user-agent"
echo "   ---"
# This should exit with code 1, so we catch it
curly --diff "${TEMP_DIR}/baseline.json" https://httpbin.org/user-agent || true
echo ""
echo ""

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------

echo "=============================================="
echo "  Summary: Response Diffing"
echo "=============================================="
echo ""
echo "  -o FILE                 Save response body to file (use as baseline)"
echo "  --diff FILE             Compare current response against baseline"
echo "                          Exit code 0 = no differences"
echo "                          Exit code 1 = differences found"
echo ""
