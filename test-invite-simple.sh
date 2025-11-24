#!/bin/bash

# Simple Invite System Test
# This tests if the backend invite endpoints are working

echo "🧪 Testing SalonHub Invite System Backend..."
echo ""

# Test 1: Check if invite endpoint exists
echo "📡 Test 1: Checking if /api/invite endpoint is accessible..."
curl -i -X POST http://localhost:5000/api/invite \
  -H "Content-Type: application/json" \
  -d '{"recipientEmail":"test@example.com"}' 2>&1 | head -1

echo ""
echo ""

# Test 2: Check if stats endpoint exists
echo "📊 Test 2: Checking if /api/invite/stats endpoint is accessible..."
curl -i http://localhost:5000/api/invite/stats 2>&1 | head -1

echo ""
echo ""

echo "✅ If you see '401 Unauthorized' - GOOD! The endpoints exist."
echo "❌ If you see '404 Not Found' - Backend not running or routes not registered."
echo ""
echo "Next: Visit your profile page to see the invite button!"
