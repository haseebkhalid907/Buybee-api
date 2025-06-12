#!/bin/bash
# Helper script to set up Vercel environment variables from local .env file
# Usage: ./setup-vercel-env.sh [project-name]

# Check for Vercel CLI
if ! command -v vercel &> /dev/null; then
  echo "Vercel CLI not found! Please install it first:"
  echo "npm install -g vercel"
  exit 1
fi

# Check for .env file
if [ ! -f ".env" ] && [ ! -f ".env.production" ]; then
  echo "❌ No .env or .env.production file found!"
  exit 1
fi

# Determine which env file to use
ENV_FILE=".env"
if [ -f ".env.production" ]; then
  ENV_FILE=".env.production"
  echo "Using .env.production file"
else
  echo "Using .env file"
fi

# Make sure project is linked
vercel link
if [ $? -ne 0 ]; then
  echo "❌ Failed to link project. Make sure you're logged in to Vercel"
  exit 1
fi

# Set the needed environment variables
echo "🔄 Setting environment variables from $ENV_FILE..."

# First, get a list of current env vars to avoid duplicates
CURRENT_ENV=$(vercel env ls)

# Loop through each variable in the .env file
while IFS= read -r line; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ ]] && continue
  [[ -z "$line" ]] && continue
  
  # Extract variable name and value
  VAR_NAME=$(echo "$line" | cut -d '=' -f1)
  VAR_VALUE=$(echo "$line" | cut -d '=' -f2-)
  
  # Check if it's a sensitive variable that should be set as secret
  SENSITIVE=false
  if [[ "$VAR_NAME" == *"SECRET"* ]] || [[ "$VAR_NAME" == *"PASSWORD"* ]] || [[ "$VAR_NAME" == *"KEY"* ]] || [[ "$VAR_NAME" == *"TOKEN"* ]]; then
    SENSITIVE=true
  fi
  
  # Only add if not already set
  if ! echo "$CURRENT_ENV" | grep -q "$VAR_NAME"; then
    if [ "$SENSITIVE" = true ]; then
      echo "Setting sensitive variable: $VAR_NAME (value hidden)"
      echo "$VAR_VALUE" | vercel env add "$VAR_NAME" production
    else
      echo "Setting variable: $VAR_NAME=$VAR_VALUE"
      vercel env add "$VAR_NAME" production <<< "$VAR_VALUE"
    fi
  else
    echo "⏭️  Variable $VAR_NAME already exists, skipping"
  fi
done < "$ENV_FILE"

echo "✅ Environment variables set successfully!"
echo "🔄 To deploy with these variables, run: ./scripts/deploy-vercel.sh production"
