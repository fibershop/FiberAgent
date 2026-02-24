#!/bin/bash

# Test Fiber API directly
# Usage: bash TEST_FIBER_API.sh

echo "=== Testing Fiber API ==="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="https://api.staging.fiber.shop/v1"
AGENT_ID="fiberagent_test_001"

echo -e "${YELLOW}Test 1: Basic search with agent_id${NC}"
echo "curl \"${BASE_URL}/agent/search?keywords=shoes&agent_id=${AGENT_ID}\""
curl -v "${BASE_URL}/agent/search?keywords=shoes&agent_id=${AGENT_ID}" 2>&1 | head -50
echo ""
echo ""

echo -e "${YELLOW}Test 2: Different keyword (laptop)${NC}"
echo "curl \"${BASE_URL}/agent/search?keywords=laptop&agent_id=${AGENT_ID}\""
curl -s "${BASE_URL}/agent/search?keywords=laptop&agent_id=${AGENT_ID}" | jq '.' 2>/dev/null || curl -s "${BASE_URL}/agent/search?keywords=laptop&agent_id=${AGENT_ID}"
echo ""
echo ""

echo -e "${YELLOW}Test 3: Without agent_id (check if required)${NC}"
echo "curl \"${BASE_URL}/agent/search?keywords=shoes\""
curl -s "${BASE_URL}/agent/search?keywords=shoes" | jq '.' 2>/dev/null || curl -s "${BASE_URL}/agent/search?keywords=shoes"
echo ""
echo ""

echo -e "${YELLOW}Test 4: Check response headers${NC}"
echo "curl -i \"${BASE_URL}/agent/search?keywords=shoes&agent_id=${AGENT_ID}\""
curl -i "${BASE_URL}/agent/search?keywords=shoes&agent_id=${AGENT_ID}" 2>&1 | head -30
echo ""
echo ""

echo -e "${YELLOW}Test 5: Try POST instead of GET${NC}"
echo "curl -X POST \"${BASE_URL}/agent/search\" -d \"keywords=shoes&agent_id=${AGENT_ID}\""
curl -s -X POST "${BASE_URL}/agent/search" -d "keywords=shoes&agent_id=${AGENT_ID}" | jq '.' 2>/dev/null || curl -s -X POST "${BASE_URL}/agent/search" -d "keywords=shoes&agent_id=${AGENT_ID}"
echo ""
echo ""

echo -e "${YELLOW}Test 6: Try with size parameter${NC}"
echo "curl \"${BASE_URL}/agent/search?keywords=shoes&agent_id=${AGENT_ID}&size=5\""
curl -s "${BASE_URL}/agent/search?keywords=shoes&agent_id=${AGENT_ID}&size=5" | jq '.' 2>/dev/null || curl -s "${BASE_URL}/agent/search?keywords=shoes&agent_id=${AGENT_ID}&size=5"
echo ""
echo ""

echo -e "${GREEN}Tests complete. Check results above.${NC}"
echo ""
echo "If all tests return total_results: 0, the issue is likely:"
echo "1. API key validation"
echo "2. Agent ID not whitelisted"
echo "3. Wrong endpoint URL"
echo "4. Missing required parameter"
echo ""
echo "If tests return 200 but zero results, check with Fiber team:"
echo "- Is catalog live?"
echo "- Are there any products for test keywords?"
echo "- Is the API key rate-limited?"
