# Networking – Homelab Docker Setup

This folder contains **networking-related configuration and documentation** for the homelab server.

The primary goal of this setup is to provide:

- A **single shared Docker network** for internal service communication
- A **reverse-proxy–first architecture** using Nginx Proxy Manager
- Clean separation between **host networking** and **container networking**
- Stable service discovery using **container names instead of IPs**

---

## Overview

All Dockerized services that are exposed via the web are connected to a
custom bridge network called `proxy_net`.

This allows:

- Nginx Proxy Manager to reach services by container name  
- No hardcoding of container IP addresses  
- Easy service addition/removal without breaking routing  

Services that require **host-level networking** (for performance or protocol
reasons) are explicitly excluded.

---

## The `proxy_net` Network

### Why `proxy_net` exists

Docker's default `bridge` network is isolated per compose project.
That makes reverse proxying unreliable across multiple services.

`proxy_net` solves this by acting as a **shared network backbone**.

### Network properties

- Driver: `bridge`
- Scope: local
- IPv4 only
- Manually created or declared as external
- Used by:
  - Nginx Proxy Manager
  - Pi-hole (web UI)
  - OpenWebUI
  - Portainer
  - Jellyfin
  - Filebrowser
  - Cockpit
  - Next.js dashboard

---

## Services Connected to `proxy_net`

These containers are attached to `proxy_net` either via
`docker-compose.yml` or via `docker network connect`.

| Service | Network Mode | Internal Port | Reason |
|---------|--------------|---------------|--------|
| Nginx Proxy Manager | bridge (`proxy_net`) | 80, 443, 81 | Central reverse proxy |
| Pi-hole (web UI) | bridge (`proxy_net`) | 8081 (web), 53 (DNS) | Web access via NPM |
| OpenWebUI | bridge (`proxy_net`) | 8080 | Internal routing |
| Portainer | bridge (`proxy_net`) | 9443 | Secure admin access |
| Jellyfin | bridge (`proxy_net`) | 8096 | Media streaming |
| Filebrowser | bridge (`proxy_net`) | 80 | File management |
| Cockpit | bridge (`proxy_net`) | 4200 | Server administration |
| Next.js Dashboard | bridge (`proxy_net`) | 3000 | Frontend aggregator |

---

## Services NOT on `proxy_net`

Some services intentionally bypass Docker networking.

| Service | Network Mode | Reason |
|---------|--------------|--------|
| Plex | host | DLNA discovery, streaming performance |
| Cockpit (host install) | N/A | System-level management, runs on host |
| Tailscale | host | Secure remote access |
| Immich | bridge (isolated) | Default stack network, uses own compose network |

These services are accessed via:
- Host IP directly
- Or proxied through Nginx Proxy Manager using host address

---

## DNS & Routing Model

- Pi-hole is used as the **local DNS server**
- Domains resolve to the **host IP**
- Nginx Proxy Manager handles routing internally

Example flow:

```
Client → DNS (Pi-hole) → Host IP → NPM → Container (via proxy_net)
```

No client ever talks directly to a container IP.

---

## Important Rules (Do Not Break)

- Do NOT expose random container ports publicly
- Do NOT use container IPs in applications
- Do NOT mix host networking unless required
- All web traffic goes through **Nginx Proxy Manager**
- `proxy_net` must exist before starting services

---

## Creating the Network

If the network doesn't exist:

```bash
# Create the network
docker network create proxy_net

# Verify it was created
docker network ls | grep proxy_net
```

## Connecting Existing Containers

If containers need to be connected manually:

```bash
# Connect existing containers to proxy_net
docker network connect proxy_net nginx_proxy_manager
docker network connect proxy_net nextjs_dashboard
docker network connect proxy_net portainer
docker network connect proxy_net open-webui
docker network connect proxy_net pihole
docker network connect proxy_net jellyfin
docker network connect proxy_net filebrowser

# Inspect the network to verify connections
docker network inspect proxy_net
```

## Disconnecting Containers

To remove a container from the network:

```bash
docker network disconnect proxy_net <container_name>
```

---

## Troubleshooting

### Network not found error
```bash
docker network create proxy_net
```

### Container can't reach another container
1. Check both are on `proxy_net`: `docker network inspect proxy_net`
2. Use container name, not IP: `http://portainer:9443`
3. Ensure the service is running: `docker ps`

### DNS resolution failing
1. Check Pi-hole is running: `docker ps | grep pihole`
2. Verify DNS is set to Pi-hole IP on the host
3. Test resolution: `nslookup service.yourdomain.com`

### Nginx Proxy Manager can't reach service
1. Verify service is on `proxy_net`
2. Use correct container name as "Forward Hostname"
3. Check service logs for errors

---

## Network Diagram

```
                                    ┌─────────────────┐
                                    │   Internet      │
                                    └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Router/Modem   │
                                    └────────┬────────┘
                                             │
                    ┌────────────────────────┼────────────────────────┐
                    │                   Host Machine                   │
                    │                                                  │
                    │  ┌─────────────────────────────────────────┐    │
                    │  │              proxy_net                   │    │
                    │  │                                         │    │
                    │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐ │    │
                    │  │  │   NPM   │  │ Pi-hole │  │Portainer│ │    │
                    │  │  │ :80/443 │  │  :8081  │  │  :9443  │ │    │
                    │  │  └─────────┘  └─────────┘  └─────────┘ │    │
                    │  │                                         │    │
                    │  │  ┌─────────┐  ┌─────────┐  ┌─────────┐ │    │
                    │  │  │OpenWebUI│  │Jellyfin │  │Filebrswr│ │    │
                    │  │  │  :8080  │  │  :8096  │  │   :80   │ │    │
                    │  │  └─────────┘  └─────────┘  └─────────┘ │    │
                    │  │                                         │    │
                    │  │  ┌─────────┐  ┌─────────┐               │    │
                    │  │  │ Cockpit │  │Dashboard│               │    │
                    │  │  │  :4200  │  │  :3000  │               │    │
                    │  │  └─────────┘  └─────────┘               │    │
                    │  │                                         │    │
                    │  └─────────────────────────────────────────┘    │
                    │                                                  │
                    │  ┌──────────────────────────────────────────┐   │
                    │  │           Host Network Mode               │   │
                    │  │                                          │   │
                    │  │  ┌─────────┐  ┌─────────┐                │   │
                    │  │  │  Plex   │  │Tailscale│                │   │
                    │  │  │ :32400  │  │         │                │   │
                    │  │  └─────────┘  └─────────┘                │   │
                    │  │                                          │   │
                    │  └──────────────────────────────────────────┘   │
                    │                                                  │
                    │  ┌──────────────────────────────────────────┐   │
                    │  │           Isolated Networks               │   │
                    │  │                                          │   │
                    │  │  ┌─────────────────────────────────┐     │   │
                    │  │  │        immich_default            │     │   │
                    │  │  │  ┌───────┐ ┌─────┐ ┌──────────┐ │     │   │
                    │  │  │  │Immich │ │Redis│ │PostgreSQL│ │     │   │
                    │  │  │  │ :2283 │ │     │ │          │ │     │   │
                    │  │  │  └───────┘ └─────┘ └──────────┘ │     │   │
                    │  │  └─────────────────────────────────┘     │   │
                    │  │                                          │   │
                    │  └──────────────────────────────────────────┘   │
                    │                                                  │
                    └──────────────────────────────────────────────────┘
```

---

## Related Documentation

- [Docker Services README](../README.md)
- [Docker Networking Documentation](https://docs.docker.com/network/)
- [Nginx Proxy Manager Guide](https://nginxproxymanager.com/guide/)
