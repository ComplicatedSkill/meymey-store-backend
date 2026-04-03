#!/bin/bash
# Deploy script — builds multi-platform image and pushes to Docker Hub
# Run locally: bash deploy.sh

set -e

IMAGE="radyhak/shumeiistore:latest"

echo "==> Setting up multi-platform builder..."
docker buildx create --name multiplatform --use 2>/dev/null || docker buildx use multiplatform

echo "==> Building and pushing multi-platform image (linux/amd64 + linux/arm64)..."
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t $IMAGE \
  --push \
  .

echo ""
echo "✅ Image pushed: $IMAGE"
echo ""
echo "Go to Hostinger panel and redeploy the container."
