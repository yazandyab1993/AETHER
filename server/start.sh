#!/bin/bash

echo "Starting AI Content Generator Server..."

# Navigate to server directory
cd /workspace/server

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Start the server
echo "Starting server on port 5000..."
node server.js