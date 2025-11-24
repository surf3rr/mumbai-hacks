#!/bin/bash

# Script to run both frontend and backend for NeuroLens development

echo "Starting NeuroLens development servers..."

# Function to start backend
start_backend() {
    echo "Starting Python backend on port 5000..."
    cd /workspace/backend
    python app.py
}

# Function to start frontend
start_frontend() {
    echo "Starting React frontend on port 5173..."
    cd /workspace
    pnpm dev
}

# Check if we have pnpm installed
if ! command -v pnpm &> /dev/null; then
    echo "pnpm could not be found. Please install pnpm first."
    exit 1
fi

# Check if we have Python installed
if ! command -v python &> /dev/null; then
    echo "Python could not be found. Please install Python first."
    exit 1
fi

# Start backend in background
echo "Starting backend server..."
start_backend &
BACKEND_PID=$!

# Give backend a moment to start
sleep 3

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo "Backend started successfully (PID: $BACKEND_PID)"
else
    echo "Failed to start backend"
    exit 1
fi

# Start frontend in foreground
echo "Starting frontend server..."
start_frontend

# Cleanup function
cleanup() {
    echo "Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    exit 0
}

# Set up signal trapping to handle Ctrl+C
trap cleanup INT TERM

# Wait for processes to finish
wait