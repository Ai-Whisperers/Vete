#!/bin/bash
# === VETE DEPLOY SCRIPT ===
# Usage: ./deploy.sh [build|pull|restart]
set -e

ACTION=${1:-pull}
STACK_FILE="/root/stacks/vete-deploy.yml"
IMAGE="ghcr.io/ai-whisperers/vete:latest"

case $ACTION in
  build)
    echo "Building Docker image locally..."
    cd /root/vete
    docker build -t $IMAGE .
    echo "Pushing to GHCR..."
    docker push $IMAGE
    echo "Updating service..."
    docker service update --image $IMAGE vete_web --force
    ;;
  pull)
    echo "Pulling latest image from GHCR..."
    docker pull $IMAGE
    echo "Updating service..."
    docker service update --image $IMAGE vete_web --force
    ;;
  restart)
    echo "Restarting service (no image change)..."
    docker service update --force vete_web
    ;;
  update)
    echo "Pulling latest code..."
    cd /root/vete
    git pull origin main
    echo "Building and deploying..."
    docker build -t $IMAGE .
    docker push $IMAGE
    docker service update --image $IMAGE vete_web --force
    ;;
  status)
    echo "=== Service ==="
    docker service ls | grep vete
    echo "=== Tasks ==="
    docker service ps vete_web
    echo "=== Logs (last 20) ==="
    docker service logs vete_web --tail 20 2>&1 | tail -20
    echo "=== Health ==="
    curl -sk https://paragu-ai.com/api/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Health check failed"
    ;;
  logs)
    docker service logs vete_web -f
    ;;
  *)
    echo "Usage: ./deploy.sh [build|pull|restart|update|status|logs]"
    echo "  build   - Build image locally, push to GHCR, deploy"
    echo "  pull    - Pull latest from GHCR and deploy"
    echo "  restart - Restart without image change"
    echo "  update  - Git pull + build + push + deploy"
    echo "  status  - Show service status and health"
    echo "  logs    - Tail service logs"
    ;;
esac
