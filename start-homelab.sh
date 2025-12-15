#!/bin/bash

docker network inspect proxy_net >/dev/null 2>&1 || \
docker network create proxy_net

# Define the list of service files
NETWORK=("docker-services/nginx-proxy-manager", "docker-services/pihole")

echo "Starting networking services.."
for network in "${NETWORK[@]}"; do
    if [ -d "$network" ]; then
        echo "Starting $network..."
        docker compose -f "$network/docker-compose.yml" up -d
    else
        echo "Error: $network directory not found"
        exit 1
    fi
done

SERVICES=("docker-services/plex", "docker-services/portainer", "docker-services/cockpit", "docker-services/open-webui")

echo "Starting core services.."
for service in "${SERVICES[@]}"; do
    if [ -d "$service" ]; then
        echo "Starting $service..."
        docker compose -f "$service/docker-compose.yml" up -d
    else
        echo "Error: $service directory not found"
        exit 1
    fi
done


echo "Starting Nextjs_dashboard.."
if [ -f "docker-compose.yml" ]; then
    echo "Starting nextjs-dashboard..."
    docker compose up -d --build
else
    echo "Error: docker-compose.yml not found"
    exit 1
fi

echo "All services started successfully"