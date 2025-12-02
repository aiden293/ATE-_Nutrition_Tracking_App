#!/bin/bash
# Backend Switcher Script
# Easily switch between Node.js and Python backends

BACKEND_TYPE="${1:-node}"

case $BACKEND_TYPE in
  node|nodejs|js)
    echo "🟢 Switching to Node.js backend..."
    echo "Starting Node.js server on port 5000..."
    cd backend/nodejs
    node server.js
    ;;
  
  python|py)
    echo "🐍 Switching to Python backend..."
    echo "Starting Python server on port 5001..."
    
    # Check if virtual environment exists
    if [ ! -d "backend/venv" ]; then
      echo "Creating Python virtual environment..."
      cd backend
      python3 -m venv venv
      source venv/bin/activate
      pip install -r requirements.txt
    else
      cd backend
      source venv/bin/activate
    fi
    
    python server.py
    ;;
  
  *)
    echo "Usage: ./start-backend.sh [node|python]"
    echo ""
    echo "Examples:"
    echo "  ./start-backend.sh node    # Start Node.js backend (port 5000)"
    echo "  ./start-backend.sh python  # Start Python backend (port 5001)"
    exit 1
    ;;
esac
