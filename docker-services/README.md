# Docker Services - Homelab Web

This directory contains Docker Compose configurations for running essential homelab services that support the Homelab Web application.

## 🏗️ Architecture

This setup uses a **modular architecture** with two deployment options:

1. **Individual Services** - Each service in its own folder with dedicated compose file
2. **All-in-One** - Single compose file for deploying core services together

All services communicate via a shared Docker network called `proxy_net`.

## 📦 Services Overview

### 🔀 Nginx Proxy Manager
- **Purpose**: Reverse proxy with SSL/TLS management
- **Admin UI**: `http://localhost:82`
- **Default Credentials**: 
  - Email: `admin@example.com`
  - Password: `changeme` (change on first login)
- **Ports**: 
  - `80` - HTTP
  - `443` - HTTPS
  - `82` - Admin UI

### 🛡️ Pi-hole
- **Purpose**: Network-wide ad blocking and DNS server
- **Web Interface**: Accessible via Nginx Proxy Manager on port `8081`
- **Ports**: `53` (TCP/UDP) - DNS
- **Timezone**: Asia/Kolkata
- **Requires**: `PIHOLE_API_PASSWORD` environment variable

### 🤖 Open WebUI
- **Purpose**: Web interface for AI/LLM interactions
- **Port**: `8080` (internal, exposed via proxy)
- **Data**: Stored in `/srv/docker-data/openwebui`

### 🐳 Portainer
- **Purpose**: Docker container management UI
- **Port**: `9443` (internal, exposed via proxy)
- **Access**: Manage all Docker containers from web interface

### 🎬 Plex Media Server
- **Purpose**: Media streaming server
- **Network Mode**: Host (for optimal performance and discovery)
- **Default Port**: `32400`
- **Timezone**: Asia/Kolkata
- **Media Location**: `/srv/docker-data/plex/media`

### 🍿 Jellyfin
- **Purpose**: Open-source media streaming server (alternative to Plex)
- **Port**: `8096`
- **Network**: Connected to `proxy_net`
- **Features**: 
  - Hardware transcoding support
  - Multiple media library types (Movies, TV Shows, Music)
  - Watchtower auto-update enabled

### 📂 Filebrowser
- **Purpose**: Web-based file manager
- **Port**: `8085` (mapped to internal `80`)
- **Network**: Connected to `proxy_net`
- **Features**: Browse, upload, download, and manage files across multiple drives

### 🖼️ Immich
- **Purpose**: Self-hosted photo and video management (Google Photos alternative)
- **Port**: `2283`
- **Network Mode**: `bridge` (default stack) - NOT on `proxy_net` by default
- **Access**: `http://<host-ip>:2283` or `http://localhost:2283`
- **Components**: Server, Machine Learning, Redis, PostgreSQL

### 🖥️ Cockpit
- **Purpose**: Web-based server administration interface
- **Port**: `4200` (Docker) or `9090` (host installation)
- **Network**: Connected to `proxy_net`
- **Note**: Running on host system is recommended for full functionality

### 🔄 Watchtower
- **Purpose**: Automated Docker container updates
- **Schedule**: Every Sunday at 3 AM (configurable)
- **Features**:
  - Automatic image updates
  - Cleanup of old images
  - Rolling restarts
  - Per-container control via labels

## 📺 Media Management (ARR Stack)

### 🔍 Prowlarr
- **Purpose**: Indexer manager for Sonarr/Radarr
- **Port**: `9696`
- **Network**: Connected to `proxy_net`

### 📥 qBittorrent
- **Purpose**: Torrent download client
- **Ports**: `8080` (WebUI), `6881` (TCP/UDP Data)
- **Network**: Connected to `proxy_net`

### 📺 Sonarr
- **Purpose**: TV show collection manager
- **Port**: `8989`
- **Depends On**: Prowlarr, qBittorrent
- **Network**: Connected to `proxy_net`

### 🎬 Radarr
- **Purpose**: Movie collection manager
- **Port**: `7878`
- **Depends On**: Prowlarr, qBittorrent
- **Network**: Connected to `proxy_net`

### 🔔 Jellyseerr
- **Purpose**: Media request manager (Netflix-style interface)
- **Port**: `5055`
- **Network**: Connected to `proxy_net`

## 🚀 Getting Started

### Prerequisites

- Docker Engine (20.10+)
- Docker Compose (v2.0+)
- Sufficient disk space for service data and media

### Network Setup (Required First Step)

Before starting any services, create the shared network:

```bash
docker network create proxy_net
```

Verify the network exists:
```bash
docker network ls | grep proxy_net
```

See [network/README.md](./network/README.md) for detailed networking documentation.

## 🎯 Deployment Options

### Option 1: All-in-One Deployment

Deploy all services with a single command. The `docker-compose.allInOne.yml` includes:
- **Network**: Nginx Proxy Manager, Pi-hole
- **Media Streaming**: Plex, Jellyfin
- **Media Management**: Sonarr, Radarr, Prowlarr, qBittorrent, Jellyseerr
- **Photos**: Immich (server, ML, Redis, PostgreSQL)
- **AI**: Open WebUI
- **Storage**: Filebrowser
- **System**: Portainer, Watchtower

#### Without Environment Variables
```bash
# Start all services
docker compose -f docker-compose.allInOne.yml up -d

# View logs
docker compose -f docker-compose.allInOne.yml logs -f

# Stop all services
docker compose -f docker-compose.allInOne.yml down
```

#### With Environment Variables (.env file)
```bash
# Create .env file first
echo "PIHOLE_API_PASSWORD=your_secure_password" > .env

# Start all services with env vars
docker compose -f docker-compose.allInOne.yml --env-file .env up -d

# Or if .env is in the same directory (auto-detected)
docker compose -f docker-compose.allInOne.yml up -d
```

### Option 2: Individual Service Deployment

Deploy services individually for more granular control.

#### Start Individual Services

**Nginx Proxy Manager** (Start this first):
```bash
cd nginx-proxy-manager
docker compose up -d
```

**Pi-hole** (requires .env):
```bash
cd pihole
# Create .env with PIHOLE_API_PASSWORD
echo "PIHOLE_API_PASSWORD=your_secure_password" > .env
docker compose --env-file .env up -d
```

**Open WebUI**:
```bash
cd open-webui
docker compose up -d
```

**Portainer**:
```bash
cd portainer
docker compose up -d
```

**Plex**:
```bash
cd plex
docker compose up -d
```

**Jellyfin**:
```bash
cd jellyfish  # Note: folder name is jellyfish
docker compose up -d
```

**Filebrowser**:
```bash
cd filebrowser
docker compose up -d
```

**Immich** (requires .env with DB credentials):
```bash
cd immich
# Create .env with required variables
docker compose up -d
```

**Watchtower**:
```bash
cd watchtower
docker compose up -d
```

#### Start All Individual Services (Script)
```bash
# From docker-services directory
for service in nginx-proxy-manager pihole open-webui portainer plex jellyfish filebrowser watchtower; do
  echo "Starting $service..."
  cd $service && docker compose up -d && cd ..
done
```

## 📁 Directory Structure

```
docker-services/
├── README.md                           # This file
├── docker-compose.allInOne.yml         # All-in-one deployment (core services)
├── .env                                # Environment variables
├── network/                            # Network documentation
│   └── README.md                       # Networking guide
├── nginx-proxy-manager/                # Nginx Proxy Manager
│   └── docker-compose.yml
├── pihole/                             # Pi-hole
│   ├── docker-compose.yml
│   └── .env                            # PIHOLE_API_PASSWORD
├── open-webui/                         # Open WebUI
│   └── docker-compose.yml
├── portainer/                          # Portainer
│   └── docker-compose.yml
├── filebrowser/                        # Filebrowser
│   └── docker-compose.yml
├── immich/                             # Immich Photo Management
│   ├── docker-compose.yml
│   └── .env                            # Immich config
├── cockpit/                            # Cockpit Server Admin
│   └── docker-compose.yml
├── watchtower/                         # Watchtower Auto-Updates
│   └── docker-compose.yml
└── media/                              # Media Management Stack
    └── docker-compose.yml              # Prowlarr, Sonarr, Radarr, qBittorrent, Jellyseerr
```

## 🔧 Management Commands

### All-in-One Commands

```bash
# Start all services
docker compose -f docker-compose.allInOne.yml up -d

# Stop all services
docker compose -f docker-compose.allInOne.yml down

# Restart all services
docker compose -f docker-compose.allInOne.yml restart

# View logs (all services)
docker compose -f docker-compose.allInOne.yml logs -f

# View logs (specific service)
docker compose -f docker-compose.allInOne.yml logs -f pihole

# Update all services
docker compose -f docker-compose.allInOne.yml pull
docker compose -f docker-compose.allInOne.yml up -d

# Remove all services and volumes
docker compose -f docker-compose.allInOne.yml down -v
```

### Individual Service Commands

```bash
# Navigate to service directory first
cd <service-name>

# Start service
docker compose up -d

# Stop service
docker compose down

# View logs
docker compose logs -f

# Restart service
docker compose restart

# Update service
docker compose pull
docker compose up -d
```

### Watchtower Control

Control which containers Watchtower updates using labels:

```yaml
# Disable updates for a container
labels:
  - "com.centurylinklabs.watchtower.enable=false"

# Enable updates (default)
labels:
  - "com.centurylinklabs.watchtower.enable=true"

# Custom stop timeout
labels:
  - "com.centurylinklabs.watchtower.stop-timeout=120s"
```

### Environment Variable Commands

```bash
# Run with specific .env file
docker compose --env-file /path/to/.env up -d

# Run without .env (uses defaults or fails if required)
docker compose up -d

# Validate compose file with env vars
docker compose --env-file .env config

# Show resolved configuration
docker compose config
```

## 🌐 Network Configuration

All services (except Plex and Immich) connect to the external `proxy_net` bridge network. This allows:

- Service discovery by container name
- Nginx Proxy Manager to route traffic internally
- No hardcoded IP addresses
- Easy service addition/removal

### Network Details

- **Name**: `proxy_net`
- **Driver**: `bridge`
- **Scope**: `local`
- **External**: `true` (must be created manually)

### Services on proxy_net

| Service | Container Name | Internal Port |
|---------|---------------|---------------|
| Nginx Proxy Manager | `nginx_proxy_manager` | 80, 443, 81 |
| Pi-hole | `pihole` | 8081 (web), 53 (DNS) |
| Open WebUI | `open-webui` | 8080 |
| Portainer | `portainer` | 9443 |
| Jellyfin | `jellyfin` | 8096 |
| Filebrowser | `filebrowser` | 80 |
| Cockpit | `cockpit` | 4200 |
| Prowlarr | `prowlarr` | 9696 |
| qBittorrent | `qbittorrent` | 8080 |
| Sonarr | `sonarr` | 8989 |
| Radarr | `radarr` | 7878 |
| Jellyseerr | `jellyseerr` | 5055 |

### Services NOT on proxy_net

| Service | Network Mode | Reason |
|---------|-------------|--------|
| Plex | `host` | DLNA discovery, streaming performance |
| Immich | `bridge` (isolated) | Default stack configuration |

### Recommended Proxy Host Setup

Configure these in Nginx Proxy Manager:

| Service | Domain Example | Forward Hostname | Forward Port | Scheme |
|---------|---------------|------------------|--------------|--------|
| Pi-hole | `pihole.yourdomain.com` | `pihole` | `8081` | `http` |
| Open WebUI | `ai.yourdomain.com` | `open-webui` | `8080` | `http` |
| Portainer | `docker.yourdomain.com` | `portainer` | `9443` | `https` |
| Jellyfin | `jellyfin.yourdomain.com` | `jellyfin` | `8096` | `http` |
| Filebrowser | `files.yourdomain.com` | `filebrowser` | `80` | `http` |
| Cockpit | `cockpit.yourdomain.com` | `cockpit` | `4200` | `https` |
| Plex | `plex.yourdomain.com` | `<host-ip>` | `32400` | `http` |
| Immich | `photos.yourdomain.com` | `<host-ip>` | `2283` | `http` |
| Prowlarr | `prowlarr.yourdomain.com` | `prowlarr` | `9696` | `http` |
| qBittorrent | `qbit.yourdomain.com` | `qbittorrent` | `8080` | `http` |
| Sonarr | `sonarr.yourdomain.com` | `sonarr` | `8989` | `http` |
| Radarr | `radarr.yourdomain.com` | `radarr` | `7878` | `http` |
| Jellyseerr | `request.yourdomain.com` | `jellyseerr` | `5055` | `http` |

## 🔐 Environment Variables

### Required Variables

**Pi-hole**:
- `PIHOLE_API_PASSWORD` - Admin password for Pi-hole web interface

**Immich** (in immich/.env):
- `UPLOAD_LOCATION` - Path for photo uploads
- `DB_PASSWORD` - PostgreSQL password
- `IMMICH_VERSION` - Version tag (default: `release`)

### Optional Variables

All services use default configurations if environment variables are not provided.

### Creating .env Files

**For All-in-One deployment**:
```bash
# In docker-services directory
cat > .env <<EOF
PIHOLE_API_PASSWORD=your_secure_password_here
EOF
```

**For Individual Services**:
```bash
# In pihole directory
cd pihole
cat > .env <<EOF
PIHOLE_API_PASSWORD=your_secure_password_here
EOF
```

## 🎬 First-Time Configuration

### 1. Create Network
```bash
docker network create proxy_net
```

### 2. Start Nginx Proxy Manager
```bash
cd nginx-proxy-manager
docker compose up -d
```

### 3. Configure Nginx Proxy Manager
1. Access `http://localhost:82`
2. Login: `admin@example.com` / `changeme`
3. Change password immediately
4. Add SSL certificates (Let's Encrypt or self-signed)

### 4. Start Other Services
```bash
# Option A: All at once (core services)
docker compose -f docker-compose.allInOne.yml up -d

# Option B: One by one
cd pihole && docker compose up -d && cd ..
cd open-webui && docker compose up -d && cd ..
cd portainer && docker compose up -d && cd ..
cd plex && docker compose up -d && cd ..
cd jellyfish && docker compose up -d && cd ..
cd filebrowser && docker compose up -d && cd ..
cd watchtower && docker compose up -d && cd ..
```

### 5. Configure Proxy Hosts
In Nginx Proxy Manager, add proxy hosts for each service (see table above).

### 6. Configure Pi-hole DNS
1. Access Pi-hole via proxy host
2. Set as network DNS server
3. Configure custom DNS records for local domains

## 🔒 Security Considerations

- ✅ Change all default passwords immediately
- ✅ Use SSL/TLS certificates (Let's Encrypt via NPM)
- ✅ Restrict admin interface access (use authentication)
- ✅ Keep services updated regularly (Watchtower handles this)
- ✅ Use strong passwords in .env files
- ✅ Add .env to .gitignore (never commit secrets)
- ✅ Review Pi-hole logs for suspicious activity
- ✅ Limit Plex/Jellyfin remote access if not needed
- ✅ Use Portainer RBAC for multi-user environments

## 🐛 Troubleshooting

### Network Issues

**Error: network proxy_net not found**
```bash
docker network create proxy_net
```

**Check network connectivity**
```bash
docker network inspect proxy_net
```

### Service Won't Start

```bash
# Check logs
docker compose logs <service-name>

# Check if ports are in use
sudo netstat -tulpn | grep -E ':(80|443|53|82)'

# Recreate service
docker compose down
docker compose up -d --force-recreate
```

### Environment Variable Issues

```bash
# Verify .env file exists
ls -la .env

# Check if variables are loaded
docker compose config

# Test with explicit env file
docker compose --env-file .env config
```

### Permission Issues

```bash
# Fix ownership of data directories
sudo chown -R $USER:$USER /srv/docker-data
```

### Plex Not Accessible

- Ensure host networking is working
- Check firewall rules for port 32400
- Verify Plex claim token (if used)
- Check Plex logs: `docker logs plex`

### Jellyfin Not Accessible

- Check if port 8096 is not in use
- Verify volumes are correctly mounted
- Check logs: `docker logs jellyfin`

### DNS Issues with Pi-hole

- Ensure port 53 is not used by systemd-resolved
- Disable systemd-resolved if needed:
  ```bash
  sudo systemctl disable systemd-resolved
  sudo systemctl stop systemd-resolved
  ```
- Check Pi-hole logs: `docker compose logs pihole`

### Watchtower Not Updating Containers

- Check Watchtower logs: `docker logs watchtower`
- Verify container labels are set correctly
- Check schedule configuration

## 📚 Additional Resources

- [Network Documentation](./network/README.md)
- [Nginx Proxy Manager Documentation](https://nginxproxymanager.com/guide/)
- [Pi-hole Documentation](https://docs.pi-hole.net/)
- [Open WebUI Documentation](https://github.com/open-webui/open-webui)
- [Portainer Documentation](https://docs.portainer.io/)
- [Plex Documentation](https://support.plex.tv/)
- [Jellyfin Documentation](https://jellyfin.org/docs/)
- [Immich Documentation](https://immich.app/docs/overview/introduction)
- [Watchtower Documentation](https://containrrr.dev/watchtower/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

## 🤝 Integration with Homelab Web

These services provide the infrastructure for the Homelab Web application:

- **System Monitoring**: The main app monitors these Docker containers
- **Service Status**: Real-time status of all services in the dashboard
- **Quick Access**: Direct links to service UIs from the main application
- **Unified Interface**: Single pane of glass for all homelab services

## 💡 Tips & Best Practices

1. **Always create proxy_net first** before starting any services
2. **Use the all-in-one file** for quick deployments and testing
3. **Use individual services** for production and granular control
4. **Keep .env files secure** and never commit them to git
5. **Regular backups** of volume data (especially Pi-hole, Plex, Jellyfin, Immich configs)
6. **Monitor logs** regularly for issues: `docker compose logs -f`
7. **Use Watchtower** for automated updates with container-level control
8. **Use Portainer** for easy container management and monitoring

## 📝 Notes

- All data is persisted in `/srv/docker-data` or local directories
- Services automatically restart unless manually stopped
- Timezone is set to Asia/Kolkata (adjust in compose files if needed)
- Media files for Plex/Jellyfin should be placed in configured directories
- The all-in-one file creates the network; individual files expect it to exist
