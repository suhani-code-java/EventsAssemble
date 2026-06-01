#!/bin/bash

echo "🐳 Starting Event Management App with Docker"
echo "==========================================="
echo ""
echo "Checking Docker..."

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo "✅ Docker is running"
echo ""
echo "Starting MongoDB and Next.js app..."
echo ""

# Ask user preference
echo "Choose mode:"
echo "1) Production (optimized, slower builds)"
echo "2) Development (hot reload, faster development)"
echo ""
read -p "Enter 1 or 2 (default: 1): " choice

choice=${choice:-1}

if [ "$choice" = "2" ]; then
    echo ""
    echo "🚀 Starting in DEVELOPMENT mode (hot reload enabled)"
    echo ""
    docker-compose -f docker-compose.dev.yml up
else
    echo ""
    echo "🚀 Starting in PRODUCTION mode"
    echo ""
    docker-compose up
fi

echo ""
echo "App will be available at: http://localhost:3000"
echo ""
