#!/bin/bash

# Build script for cloud deployment
# This script builds the Docker image with cloud environment variables

echo "🚀 Building Cartão Vermelho for cloud deployment..."

# Load environment variables from .env.cloud
set -a
source .env.cloud
set +a

# Build the Docker image with build arguments for x86 architecture
docker build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL}" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  --build-arg SUPABASE_SERVICE_KEY="${SUPABASE_SERVICE_KEY}" \
  --build-arg OPENROUTER_API_KEY="${OPENROUTER_API_KEY}" \
  --build-arg NEXT_PUBLIC_SITE_URL="${NEXT_PUBLIC_SITE_URL}" \
  --build-arg ADMIN_EMAIL="${ADMIN_EMAIL}" \
  --build-arg ADMIN_PASSWORD="${ADMIN_PASSWORD}" \
  --build-arg DEBUG="${DEBUG}" \
  -t cartao-vermelho:cloud \
  -f Dockerfile \
  .

echo "✅ Build completed! Image tagged as cartao-vermelho:cloud"
echo "🐳 To run: docker run -p 3000:3000 cartao-vermelho:cloud"