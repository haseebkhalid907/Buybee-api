#!/bin/bash
# Script to deploy to Vercel with proper environment variables
# Usage: ./deploy-vercel.sh [production|preview]

# Check for required commands
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found! Please install it first:"
  echo "npm install -g vercel"
  exit 1
fi

# Determine deployment type
DEPLOY_ENV=${1:-"preview"}
if [ "$DEPLOY_ENV" == "production" ]; then
  DEPLOY_CMD="vercel --prod"
  echo "🚀 Deploying to PRODUCTION"
else
  DEPLOY_CMD="vercel"
  echo "🧪 Deploying to preview environment"
fi

# Check if .env file exists
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
  echo "⚠️  No .env or .env.production file found! Make sure your environment variables are set in Vercel."
fi

# Prepare MongoDB connection string for Vercel
if [ -f ".env" ]; then
  MONGODB_URL=$(grep MONGODB_URL .env | cut -d '=' -f2-)
  if [ -n "$MONGODB_URL" ]; then
    echo "✅ Found MongoDB URL in .env file"
    export MONGODB_URL
  else
    echo "⚠️  No MongoDB URL found in .env file"
  fi
fi

# Run diagnostics before deployment
echo "🔍 Running pre-deployment diagnostics..."
node src/scripts/vercel-diagnostics.js > ./vercel-pre-deploy-check.json
if [ $? -ne 0 ]; then
  echo "❌ Pre-deployment diagnostics failed! Check vercel-pre-deploy-check.json for details."
  echo "Continue anyway? (y/N)"
  read -r response
  if [[ "$response" != "y" && "$response" != "Y" ]]; then
    echo "Deployment aborted."
    exit 1
  fi
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
$DEPLOY_CMD

# Verify deployment
if [ $? -eq 0 ]; then
  echo "✅ Deployment completed successfully!"
  echo "📝 Remember to check the following:"
  echo "  1. Verify your MongoDB connection in the Vercel dashboard"
  echo "  2. Check that all environment variables are set"
  echo "  3. Test the /health endpoint to confirm the API is working"
  echo "  4. Check the /diagnostics endpoint for more detailed information"
else
  echo "❌ Deployment failed!"
fi
