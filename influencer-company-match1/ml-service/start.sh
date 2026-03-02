#!/bin/bash
echo "Starting IC Match ML Service..."
cd "$(dirname "$0")"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
echo "Checking dependencies..."
pip install -q -r requirements.txt

# Start the service
echo ""
echo "ML Service starting on http://localhost:8000"
echo "Press Ctrl+C to stop"
echo ""
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
