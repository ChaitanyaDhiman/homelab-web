# NexLab Setup Guide

## First Time Installation

### 1. Prerequisites
- Docker Engine installed
- Docker Compose installed (usually included with Docker Desktop/Engine)
- Git (optional, for cloning)

### 2. Prepare the Environment
Create the necessary specific configuration directory on your host machine. This is where your optional custom settings will live.

```bash
# Create the directory
sudo mkdir -p /srv/docker-data/nexlab/config

# Set permissions (adjust user:group as needed, e.g., to your current user)
sudo chown -R $USER:$USER /srv/docker-data/nexlab
```

### 3. Environment Variables
Copy the example environment file to `.env.local` and customize it if needed (mostly unnecessary for default setup).

```bash
cp .env.example .env.local
```

### 4. Build and Run
Start the application using Docker Compose.

```bash
docker compose up -d --build
```

### 5. Verify Installation
Access the dashboard at `http://localhost:3000`.

Failed to load? Check container logs:
```bash
docker logs nexlab
```

## How Configuration Works
- **Defaults**: The application starts with a safe `default.json` configuration built into the image.
- **Customization**: If you want to customize apps, storage, or widgets, you can edits these settings in the UI. 
- **Persistence**: When you save changes in the UI, new configuration files (`apps.json`, `storage.json`, etc.) are created in `/srv/docker-data/nexlab/config/`. These take precedence over the defaults.

## Updating NexLab
To update to the latest version:

```bash
# Pull latest changes (if using git)
git pull

# Rebuild containers
docker compose up -d --build
```
