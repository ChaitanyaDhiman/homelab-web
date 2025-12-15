# Docker Services - Homelab Web

This directory contains Docker Compose configurations for running essential homelab services that support the Homelab Web application.

## 🏗️ Architecture

This setup uses a **modular architecture** with two deployment options:

1. **Individual Services** - Each service in its own folder with dedicated compose file
2. **All-in-One** - Single compose file for deploying all services together

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
- **Data**: Stored in `./openwebui`

### 🐳 Portainer
- **Purpose**: Docker container management UI
- **Port**: `9443` (internal, exposed via proxy)
- **Access**: Manage all Docker containers from web interface

### 🎬 Plex Media Server
- **Purpose**: Media streaming server
- **Network Mode**: Host (for optimal performance and discovery)
- **Default Port**: `32400`
- **Timezone**: Asia/Kolkata
- **Media Location**: `./media`

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

Deploy all services with a single command using the all-in-one compose file.

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

#### Start All Individual Services (Script)
```bash
# From docker-services directory
for service in nginx-proxy-manager pihole open-webui portainer plex; do
  echo "Starting $service..."
  cd $service && docker compose up -d && cd ..
done
```

## 📁 Directory Structure

```
docker-services/
├── README.md                           # This file
├── docker-compose.allInOne.yml        # All-in-one deployment
├── network/                           # Network documentation
│   └── README.md                      # Networking guide
├── nginx-proxy-manager/               # Nginx Proxy Manager
│   ├── docker-compose.yml
│   ├── npm/                           # Data volumes
│   │   ├── data/
│   │   └── letsencrypt/
├── pihole/                            # Pi-hole
│   ├── docker-compose.yml
│   ├── .env                           # Environment variables
│   └── pihole/                        # Data volumes
│       ├── etc-pihole/
│       └── etc-dnsmasq.d/
├── open-webui/                        # Open WebUI
│   ├── docker-compose.yml
│   └── openwebui/                     # Data volume
├── portainer/                         # Portainer
│   ├── docker-compose.yml
│   └── portainer/                     # Data volume
└── plex/                              # Plex Media Server
    ├── docker-compose.yml
    ├── plex/
    │   └── config/                    # Config volume
    └── media/                         # Media files
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

All services (except Plex) connect to the external `proxy_net` bridge network. This allows:

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

### Services NOT on proxy_net

| Service | Network Mode | Reason |
|---------|-------------|--------|
| Plex | `host` | DLNA discovery, streaming performance |

### Recommended Proxy Host Setup

Configure these in Nginx Proxy Manager:

| Service | Domain Example | Forward Hostname | Forward Port | Scheme |
|---------|---------------|------------------|--------------|--------|
| Pi-hole | `pihole.yourdomain.com` | `pihole` | `8081` | `http` |
| Open WebUI | `ai.yourdomain.com` | `open-webui` | `8080` | `http` |
| Portainer | `docker.yourdomain.com` | `portainer` | `9443` | `https` |
| Plex | `plex.yourdomain.com` | `<host-ip>` | `32400` | `http` |

## 🔐 Environment Variables

### Required Variables

**Pi-hole**:
- `PIHOLE_API_PASSWORD` - Admin password for Pi-hole web interface

### Optional Variables

All services use default configurations if environment variables are not provided.

### Creating .env Files

**For All-in-One deployment**:
```bash
# In docker-services directory
cat > .env << EOF
PIHOLE_API_PASSWORD=your_secure_password_here
EOF
```

**For Individual Services**:
```bash
# In pihole directory
cd pihole
cat > .env << EOF
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
# Option A: All at once
docker compose -f docker-compose.allInOne.yml up -d

# Option B: One by one
cd pihole && docker compose up -d && cd ..
cd open-webui && docker compose up -d && cd ..
cd portainer && docker compose up -d && cd ..
cd plex && docker compose up -d && cd ..
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
- ✅ Keep services updated regularly
- ✅ Use strong passwords in .env files
- ✅ Add .env to .gitignore (never commit secrets)
- ✅ Review Pi-hole logs for suspicious activity
- ✅ Limit Plex remote access if not needed
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
sudo chown -R $USER:$USER ./npm ./pihole ./openwebui ./portainer ./plex
```

### Plex Not Accessible

- Ensure host networking is working
- Check firewall rules for port 32400
- Verify Plex claim token (if used)
- Check Plex logs: `docker logs plex`

### DNS Issues with Pi-hole

- Ensure port 53 is not used by systemd-resolved
- Disable systemd-resolved if needed:
  ```bash
  sudo systemctl disable systemd-resolved
  sudo systemctl stop systemd-resolved
  ```
- Check Pi-hole logs: `docker compose logs pihole`

## 📚 Additional Resources

- [Network Documentation](./network/README.md)
- [Nginx Proxy Manager Documentation](https://nginxproxymanager.com/guide/)
- [Pi-hole Documentation](https://docs.pi-hole.net/)
- [Open WebUI Documentation](https://github.com/open-webui/open-webui)
- [Portainer Documentation](https://docs.portainer.io/)
- [Plex Documentation](https://support.plex.tv/)
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
5. **Regular backups** of volume data (especially Pi-hole and Plex configs)
6. **Monitor logs** regularly for issues: `docker compose logs -f`
7. **Update services** monthly: `docker compose pull && docker compose up -d`
8. **Use Portainer** for easy container management and monitoring

## 📝 Notes

- All data is persisted in local directories within each service folder
- Services automatically restart unless manually stopped
- Timezone is set to Asia/Kolkata (adjust in compose files if needed)
- Media files for Plex should be placed in `./plex/media` directory
- The all-in-one file creates the network; individual files expect it to exist
