#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Installing backend dependencies..."
cd backend
pip install -r requirements.txt

echo "Setting up database tables..."
python init_db.py
cd ..

echo "Done!"
