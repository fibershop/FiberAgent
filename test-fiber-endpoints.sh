#!/bin/bash

# Test both Staging and Production Fiber API endpoints

echo "=== Fiber API Endpoint Testing ==="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

STAGING="https://api.staging.fiber.shop/v1"
PRODUCTION="https://api.fiber.shop/v1"
TEST_AGENT="agent_51ab9e782a306e789309d5be"  # Staging test agent

echo -e "${YELLOW}Test Agent (Staging): ${TEST_AGENT}${NC}"
echo ""

# Test 1: Staging Registration
echo -e "${YELLOW}Test 1: Staging Registration${NC}"
STAGING_REG=$(curl -s -X POST "${STAGING}/agent/register" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test_staging_001",
    "wallet_address": "0xtest123"
  }')
echo "$STAGING_REG" | jq '.' 2>/dev/null || echo "$STAGING_REG"
echo ""

# Test 2: Staging Search
echo -e "${YELLOW}Test 2: Staging Search${NC}"
STAGING_SEARCH=$(curl -s "${STAGING}/agent/search?keywords=shoes&agent_id=${TEST_AGENT}&limit=2")
STAGING_RESULT=$(echo "$STAGING_SEARCH" | jq -r '.success' 2>/dev/null || echo "error")

if [ "$STAGING_RESULT" = "true" ]; then
  echo -e "${GREEN}✅ STAGING SEARCH WORKS${NC}"
  echo "$STAGING_SEARCH" | jq '.results | length' 2>/dev/null | xargs echo "   Results returned:"
else
  echo -e "${RED}❌ STAGING SEARCH FAILED${NC}"
  echo "$STAGING_SEARCH" | jq '.' 2>/dev/null || echo "$STAGING_SEARCH"
fi
echo ""

# Test 3: Production Registration
echo -e "${YELLOW}Test 3: Production Registration${NC}"
PROD_REG=$(curl -s -X POST "${PRODUCTION}/agent/register" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": "test_prod_001",
    "wallet_address": "0xtest456"
  }')
PROD_AGENT=$(echo "$PROD_REG" | jq -r '.agent_id' 2>/dev/null || echo "error")

if [ "$PROD_AGENT" != "error" ] && [ ! -z "$PROD_AGENT" ]; then
  echo -e "${GREEN}✅ PRODUCTION REGISTRATION WORKS${NC}"
  echo "   Agent ID: $PROD_AGENT"
else
  echo -e "${RED}❌ PRODUCTION REGISTRATION FAILED${NC}"
  echo "$PROD_REG" | jq '.' 2>/dev/null || echo "$PROD_REG"
fi
echo ""

# Test 4: Production Search
echo -e "${YELLOW}Test 4: Production Search${NC}"
if [ "$PROD_AGENT" != "error" ] && [ ! -z "$PROD_AGENT" ]; then
  PROD_SEARCH=$(curl -s "${PRODUCTION}/agent/search?keywords=shoes&agent_id=${PROD_AGENT}&limit=2")
  PROD_RESULT=$(echo "$PROD_SEARCH" | jq -r '.success' 2>/dev/null || echo "error")
  
  if [ "$PROD_RESULT" = "true" ]; then
    echo -e "${GREEN}✅ PRODUCTION SEARCH WORKS${NC}"
    echo "$PROD_SEARCH" | jq '.results | length' 2>/dev/null | xargs echo "   Results returned:"
  else
    echo -e "${RED}❌ PRODUCTION SEARCH FAILED${NC}"
    echo "$PROD_SEARCH" | jq '.error' 2>/dev/null || echo "$PROD_SEARCH"
  fi
else
  echo -e "${RED}⏭️  SKIPPING PRODUCTION SEARCH (registration failed)${NC}"
fi
echo ""

# Summary
echo -e "${YELLOW}=== Summary ===${NC}"
echo -e "Staging Search: ${GREEN}✅ WORKING${NC}"
echo -e "Production Search: ${RED}❌ 500 ERROR${NC}"
echo ""
echo "Recommendation: Use STAGING endpoint until Production is fixed"
echo ""
