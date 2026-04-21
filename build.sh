#!/bin/bash
# Build script for grokclock
set -e
cd frontend
echo "Installing dependencies..."
npm install
echo "Building project..."
npm run build
echo "Done!"
