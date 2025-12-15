# Networking – Homelab Docker Setup

This folder contains **networking-related configuration and documentation** for my homelab server.

The primary goal of this setup is to provide:

- A **single shared Docker network** for internal service communication
- A **reverse-proxy–first architecture** using Nginx Proxy Manager
- Clean separation between **host networking** and **container networking**
- Stable service discovery using **container names instead of IPs**

---

## Overview

All Dockerized services that are exposed via the web are connected to a
custom bridge network called:


This allows:

- Nginx Proxy Manager to reach services by container name  
- No hardcoding of container IP addresses  
- Easy service addition/removal without breaking routing  

Services that require **host-level networking** (for performance or protocol
reasons) are explicitly excluded.

---

## The `proxy_net` Network

### Why `proxy_net` exists

Docker’s default `bridge` network is isolated per compose project.
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
  - Next.js dashboard

---

## Services Connected to `proxy_net`

These containers are attached to `proxy_net` either via
`docker-compose.yml` or via `docker network connect`.

| Service | Network Mode | Reason |
|------|------------|-------|
| Nginx Proxy Manager | bridge (`proxy_net`) | Central reverse proxy |
| Pi-hole (web UI) | bridge (`proxy_net`) | Web access via NPM |
| OpenWebUI | bridge (`proxy_net`) | Internal routing |
| Portainer | bridge (`proxy_net`) | Secure admin access |
| Next.js Dashboard | bridge (`proxy_net`) | Frontend aggregator |

---

## Services NOT on `proxy_net`

Some services intentionally bypass Docker networking.

| Service | Network Mode | Reason |
|------|------------|-------|
| Plex | host | DLNA, discovery, streaming performance |
| Cockpit | host | System-level management |
| Tailscale | host | Secure remote access |

These services are accessed via:
- Host IP
- Or proxied through Nginx Proxy Manager using host address

---

## DNS & Routing Model

- Pi-hole is used as the **local DNS server**
- Domains resolve to the **host IP**
- Nginx Proxy Manager handles routing internally

Example flow:


No client ever talks directly to a container IP.

---

## Important Rules (Do Not Break)

- Do NOT expose random container ports publicly
- Do NOT use container IPs in applications
- Do NOT mix host networking unless required
- All web traffic goes through **Nginx Proxy Manager**
- `proxy_net` must exist before starting services

---

## Recreating the Network

If the network is ever removed:

```bash
# Create the network
docker network create proxy_net

# Connect existing containers
docker network connect proxy_net nginx_proxy_manager
docker network connect proxy_net nextjs_dashboard
docker network connect proxy_net portainer
docker network connect proxy_net open-webui
docker network connect proxy_net pihole

# Inspect the network
docker network inspect proxy_net
