#!/usr/bin/env bash
# Check if ports are available before starting the services
# sudo ss -tulnp | grep -E ':80|:443|:53|:82|:8080|:8443|:9000|:32400|:4200'

set -e

echo "🔧 Ensuring proxy_net exists..."
docker network inspect proxy_net >/dev/null 2>&1 || docker network create proxy_net

# ----------------------------
# Networking services
# ----------------------------
NETWORK_SERVICES=(
  docker-services/nginx-proxy-manager
  docker-services/pihole
)

echo "🌐 Starting networking services..."
for dir in "${NETWORK_SERVICES[@]}"; do
  if [ -d "$dir" ]; then
    echo "➡️  Starting $dir"
    docker compose -f "$dir/docker-compose.yml" up -d
  else
    echo "❌ Directory not found: $dir"
    exit 1
  fi
done

# ----------------------------
# Core services
# ----------------------------
CORE_SERVICES=(
  docker-services/plex
  docker-services/portainer
  docker-services/cockpit
  docker-services/open-webui
)

echo "🧩 Starting core services..."
for dir in "${CORE_SERVICES[@]}"; do
  if [ -d "$dir" ]; then
    echo "➡️  Starting $dir"
    docker compose -f "$dir/docker-compose.yml" up -d
  else
    echo "❌ Directory not found: $dir"
    exit 1
  fi
done

# ----------------------------
# Next.js dashboard (root)
# ----------------------------
echo "🖥️  Starting Next.js dashboard..."
if [ -f docker-compose.yml ]; then
  docker compose up -d --build
else
  echo "❌ docker-compose.yml not found in root directory"
  exit 1
fi

echo "✅ All services started successfully"
