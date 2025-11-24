#!/bin/bash

###############################################################################
# SalonHub API Routing Verification Script
# Purpose: Verify all axios imports are correct and no bypasses exist
# Date: 2025-11-23
###############################################################################

set -e

echo "🔍 SalonHub API Routing Verification"
echo "====================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${BLUE}Checking for API routing violations...${NC}"
echo ""

# Check 1: Direct axios imports (excluding axios.js itself)
echo -e "${YELLOW}[1/5] Checking for direct axios imports...${NC}"
DIRECT_AXIOS=$(grep -r "import axios from ['\"]axios['\"]" frontend/src --include="*.js" --include="*.jsx" | grep -v "api/axios.js" || true)

if [ -n "$DIRECT_AXIOS" ]; then
    echo -e "${RED}❌ FAIL: Found direct axios imports (should use api from axios.js)${NC}"
    echo "$DIRECT_AXIOS"
    echo ""
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: No direct axios imports found${NC}"
fi
echo ""

# Check 2: axios.create() calls (excluding axios.js)
echo -e "${YELLOW}[2/5] Checking for axios.create() calls...${NC}"
CREATE_CALLS=$(grep -r "axios\.create" frontend/src --include="*.js" --include="*.jsx" | grep -v "api/axios.js" || true)

if [ -n "$CREATE_CALLS" ]; then
    echo -e "${RED}❌ FAIL: Found axios.create() calls (creates duplicate instances)${NC}"
    echo "$CREATE_CALLS"
    echo ""
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: No axios.create() calls found${NC}"
fi
echo ""

# Check 3: Hardcoded URLs
echo -e "${YELLOW}[3/5] Checking for hardcoded localhost URLs...${NC}"
HARDCODED_URLS=$(grep -r "http://localhost:5000" frontend/src --include="*.js" --include="*.jsx" | grep -v "axios.js" | grep -v ".md" | grep -v "CLEANUP" || true)

if [ -n "$HARDCODED_URLS" ]; then
    echo -e "${RED}❌ FAIL: Found hardcoded localhost URLs${NC}"
    echo "$HARDCODED_URLS"
    echo ""
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: No hardcoded URLs found${NC}"
fi
echo ""

# Check 4: Check if api.js still exists (it should be deleted)
echo -e "${YELLOW}[4/5] Checking for duplicate api.js...${NC}"
if [ -f "frontend/src/api.js" ]; then
    echo -e "${RED}❌ FAIL: frontend/src/api.js still exists (should be deleted)${NC}"
    echo ""
    ((ERRORS++))
else
    echo -e "${GREEN}✓ PASS: No duplicate api.js found${NC}"
fi
echo ""

# Check 5: Check for routes missing /v1 prefix
echo -e "${YELLOW}[5/5] Checking for potential missing /v1 prefixes...${NC}"
# This checks for api calls that might be missing /v1
# Looking for: api.get('/feed') instead of api.get('/v1/feed')
# This is a warning, not an error, as some routes might be intentionally different

MISSING_V1=$(grep -r "api\.\(get\|post\|put\|delete\|patch\)(['\"]/" frontend/src --include="*.js" --include="*.jsx" | grep -v "/v1/" | grep -v "/api/" | grep -v "\.md" | grep -v "CLEANUP" || true)

if [ -n "$MISSING_V1" ]; then
    echo -e "${YELLOW}⚠️  WARNING: Found API calls that might be missing /v1 prefix${NC}"
    echo -e "${YELLOW}(Review these manually - some might be intentional)${NC}"
    echo "$MISSING_V1" | head -20
    echo ""
    ((WARNINGS++))
else
    echo -e "${GREEN}✓ PASS: All API calls appear to use /v1 prefix${NC}"
fi
echo ""

# Summary
echo "====================================="
echo -e "${BLUE}Verification Summary${NC}"
echo "====================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 EXCELLENT! All checks passed!${NC}"
    echo ""
    echo "Your API routing is clean and standardized."
    echo "All requests will go through the unified axios instance."
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found (review recommended)${NC}"
    echo ""
    echo "No critical errors, but some routes may need review."
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    fi
    echo ""
    echo "Please fix the errors listed above."
    echo "Refer to: API_ROUTING_CLEANUP_COMPLETE.md"
    exit 1
fi
