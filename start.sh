#!/bin/bash

# Quick Setup Script for Event Management App

echo "🚀 Starting Event Management Application"
echo "=========================================="
echo ""

# Check if MongoDB is running on port 27017
echo "Checking MongoDB connection..."
if nc -z localhost 27017 2>/dev/null; then
    echo "✅ MongoDB is running on localhost:27017"
else
    echo "❌ MongoDB is NOT running!"
    echo ""
    echo "To start MongoDB, run one of these commands:"
    echo ""
    echo "Option 1: Using Homebrew (macOS)"
    echo "  brew services start mongodb-community"
    echo ""
    echo "Option 2: Using Docker"
    echo "  docker run -d -p 27017:27017 --name mongodb mongo:latest"
    echo ""
    echo "Option 3: Direct MongoDB binary (if installed)"
    echo "  mongod --dbpath /path/to/data"
    echo ""
    exit 1
fi

echo ""
echo "🏃 Starting development server..."
echo "The app will be available at http://localhost:3000"
echo ""

# Start the dev server
npm run dev
