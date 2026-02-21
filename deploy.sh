#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "========================================"
echo " Deploying Event Extractor via Docker"
echo "========================================"

# Check if GEMINI_API_KEY is set
if [ -z "$GEMINI_API_KEY" ]; then
  echo "⚠️  Warning: GEMINI_API_KEY environment variable is not set."
  echo "The application requires this key to function."
  echo "You can set it by running: export GEMINI_API_KEY='your_api_key_here'"
  echo "Or create a .env file in the same directory."
  echo "Continuing build anyway..."
  echo ""
fi

# Build and start the container in detached mode
echo "Building and starting Docker containers..."
docker compose up -d --build

echo ""
echo "✅ Deployment complete!"
echo "🌐 Application is running at: http://localhost:8080"
echo "📄 To view logs, run: docker compose logs -f"
echo "========================================"
