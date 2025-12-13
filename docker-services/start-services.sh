#!/bin/bash

# Define the list of service files
SERVICES=("npm-setup.yml" "pi-hole-setup.yml" "plex-setup.yml")

echo "Starting core services..."
for service in "${SERVICES[@]}"; do
    if [ -f "$service" ]; then
        echo "Starting $service..."
        docker compose -f "$service" up -d
    else
        echo "Warning: $service not found!"
    fi
done

# Start Open WebUI (in subdirectory)
if [ -d "openWebUI" ]; then
    echo "Starting Open WebUI..."
    cd openWebUI || exit
    # Check if docker-compose.yml exists, or use ollama one if preferred (defaulting to standard)
    if [ -f "docker-compose.yml" ]; then
         docker compose up -d
    else
         echo "Warning: openWebUI/docker-compose.yml not found!"
    fi
    cd ..
else
    echo "Warning: openWebUI directory not found!"
fi

echo "All services started."
