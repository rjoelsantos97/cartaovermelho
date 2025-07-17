#!/bin/bash

# Build and push script for cloud deployment
echo "🚀 Building and pushing Cartão Vermelho cloud image..."

# Build the image
./build-cloud.sh

# Tag for Docker Hub
docker tag cartao-vermelho:cloud rjoelsantos97/cartao-vermelho:cloud

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push rjoelsantos97/cartao-vermelho:cloud

echo "✅ Image pushed successfully!"
echo "🔄 To update running container:"
echo "   docker pull rjoelsantos97/cartao-vermelho:cloud"
echo "   docker-compose -f docker-compose.cloud.yml up -d"