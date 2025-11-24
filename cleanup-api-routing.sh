#!/bin/bash

###############################################################################
# SalonHub API Routing Cleanup Script
# Purpose: Fix all axios imports, remove duplicates, standardize API routing
# Date: 2025-11-23
###############################################################################

set -e  # Exit on error

echo "🧨 SalonHub API Routing Cleanup Script"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Backup directory
BACKUP_DIR="frontend_backup_$(date +%Y-%m-%d_%H-%M-%S)"

echo -e "${YELLOW}Step 1: Creating backup...${NC}"
mkdir -p "$BACKUP_DIR"
cp -r frontend/src "$BACKUP_DIR/"
echo -e "${GREEN}✓ Backup created: $BACKUP_DIR${NC}"
echo ""

echo -e "${YELLOW}Step 2: Analyzing current state...${NC}"
echo "Files with direct axios imports:"
grep -r "import axios from" frontend/src --include="*.js" --include="*.jsx" | cut -d: -f1 | sort -u
echo ""

echo -e "${YELLOW}Step 3: Deleting duplicate API client (api.js)...${NC}"
if [ -f "frontend/src/api.js" ]; then
    echo "Found: frontend/src/api.js"
    # First, find all files that import from it
    echo "Files importing from api.js:"
    grep -r "from.*['\"].*api['\"]" frontend/src --include="*.js" --include="*.jsx" | grep -v "api/axios" | grep -v "api/v1" | cut -d: -f1 | sort -u || echo "None found"

    # Remove the file
    rm frontend/src/api.js
    echo -e "${GREEN}✓ Deleted frontend/src/api.js${NC}"
else
    echo -e "${YELLOW}⚠ api.js not found (may already be deleted)${NC}"
fi
echo ""

echo -e "${YELLOW}Step 4: Files requiring refactoring:${NC}"
echo ""
echo "The following files need to be updated to use 'import api from axios.js':"
echo ""
cat << 'EOF'
1. frontend/src/api/analytics.js
2. frontend/src/api/searchApi.js
3. frontend/src/api/timeClient.js
4. frontend/src/components/FileUpload.jsx
5. frontend/src/components/reviews/ReviewList.jsx
6. frontend/src/pages/owner/BookingPublicProfile.jsx
7. frontend/src/pages/owner/StaffManagement.jsx
8. frontend/src/pages/PublicBooking.jsx
9. frontend/src/pages/PublicProfile.jsx
10. frontend/src/api/profileApi.js (fix /v1 prefix)
EOF

echo ""
echo -e "${GREEN}✓ Audit complete${NC}"
echo ""

echo "========================================"
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review the backup in: $BACKUP_DIR"
echo "2. Run the refactoring scripts for each file"
echo "3. Test all critical flows"
echo "4. Run: npm run build"
echo ""
echo "To rollback: cp -r $BACKUP_DIR/src/* frontend/src/"
echo "========================================"
