#!/bin/bash

# Flightline DigitalOcean Deployment Script

echo "🚀 Starting Flightline deployment..."

# Variables
REMOTE_USER="root"  # Change if different
REMOTE_HOST="your-digitalocean-ip"  # Replace with your DO droplet IP
REMOTE_DIR="/var/www/flightline"
PM2_NAME="flightline-backend"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "📦 Building frontend..."
cd frontend
npm install
npm run build

echo "🔄 Syncing files to server..."
# Create directory on remote if it doesn't exist
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# Sync backend files
rsync -avz --exclude 'node_modules' --exclude 'logs' --exclude '.env' \
  ../backend/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/backend/

# Sync frontend build
rsync -avz ./build/ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/frontend/

echo "🔧 Installing dependencies and starting services on server..."
ssh $REMOTE_USER@$REMOTE_HOST << 'ENDSSH'
  cd /var/www/flightline/backend
  
  # Install dependencies
  npm install --production
  
  # Copy production env if it doesn't exist
  if [ ! -f .env ]; then
    cp .env.production .env
    echo "⚠️  Please update .env file with your production values!"
  fi
  
  # Create logs directory
  mkdir -p logs
  
  # Start with PM2
  pm2 stop flightline-backend || true
  pm2 start ecosystem.config.js
  pm2 save
  
  echo "✅ Backend deployed and running!"
ENDSSH

echo -e "${GREEN}✨ Deployment complete!${NC}"
echo "Don't forget to:"
echo "1. Update the .env file on the server with production values"
echo "2. Set up Nginx to serve the frontend and proxy the backend"
echo "3. Configure MongoDB on the server"