#!/bin/bash

# Run script for cloud deployment
# This script pulls and runs the cloud image from Docker Hub

echo "🌍 Starting Cartão Vermelho cloud deployment..."

# Pull the latest image
echo "📥 Pulling latest cloud image..."
docker pull rjoelsantos97/cartao-vermelho:cloud

# Stop and remove existing containers
echo "🛑 Stopping existing containers..."
docker-compose -f docker-compose.cloud.yml down

# Start the application
echo "🚀 Starting cloud deployment..."
docker-compose -f docker-compose.cloud.yml up -d

# Show status
echo "📊 Deployment status:"
docker-compose -f docker-compose.cloud.yml ps

echo ""
echo "✅ Cloud deployment started!"
echo "🌐 Application available at: http://localhost:3000"
echo "🔧 Admin dashboard: http://localhost:3000/admin/login"
echo ""
echo "📝 To view logs: docker-compose -f docker-compose.cloud.yml logs -f"
echo "🛑 To stop: docker-compose -f docker-compose.cloud.yml down"