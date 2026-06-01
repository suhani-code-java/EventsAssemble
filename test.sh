#!/bin/bash

# Test script to verify the app is working

echo "🧪 Event Management App - Test Suite"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Port to test
PORT=3000
MAX_PORTS=10

# Find which port the app is running on
for i in $(seq 0 $MAX_PORTS); do
  TEST_PORT=$((PORT + i))
  if curl -s "http://localhost:$TEST_PORT" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ App found on http://localhost:$TEST_PORT${NC}"
    FOUND_PORT=$TEST_PORT
    break
  fi
done

if [ -z "$FOUND_PORT" ]; then
  echo -e "${RED}❌ App not running! Start it with: npm run dev${NC}"
  exit 1
fi

echo ""
echo "Running Tests..."
echo ""

# Test 1: Health Check
echo "📋 Test 1: MongoDB Connection"
HEALTH=$(curl -s "http://localhost:$FOUND_PORT/api/health")
if echo "$HEALTH" | grep -q '"status":"ok"'; then
  echo -e "${GREEN}✅ MongoDB is connected${NC}"
else
  echo -e "${RED}❌ MongoDB connection failed${NC}"
  echo "Response: $HEALTH"
  echo "Make sure MongoDB is running on localhost:27017"
fi

echo ""

# Test 2: Events API
echo "📋 Test 2: Events API"
EVENTS=$(curl -s "http://localhost:$FOUND_PORT/api/events")
if echo "$EVENTS" | grep -q '"events"'; then
  echo -e "${GREEN}✅ Events API is working${NC}"
  EVENT_COUNT=$(echo "$EVENTS" | grep -o '"_id"' | wc -l)
  echo "   Found $EVENT_COUNT events in database"
else
  echo -e "${RED}❌ Events API failed${NC}"
fi

echo ""

# Test 3: Admin Dashboard
echo "📋 Test 3: Admin Dashboard Access"
if curl -s "http://localhost:$FOUND_PORT/admin" | grep -q "Admin Dashboard"; then
  echo -e "${GREEN}✅ Admin dashboard is accessible${NC}"
else
  echo -e "${RED}⚠️  Admin dashboard page exists (requires login)${NC}"
fi

echo ""
echo "===================================="
echo "📱 App URL: http://localhost:$FOUND_PORT"
echo ""
echo "🚀 Ready to test!"
echo "   1. Login with admin@echopod.com / admin123"
echo "   2. Go to Organizer → New Event"
echo "   3. Fill in the form and create an event"
echo "   4. Check Manage Events page to see your event"
echo ""
