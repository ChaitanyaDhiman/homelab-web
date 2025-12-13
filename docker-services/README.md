# Docker Services

This directory contains the Docker configuration for your homelab services.

## Quick Start

To start all services at once, run the helper script:

```bash
./start-services.sh
```

## Services

| Service | Config File | Description |
| :--- | :--- | :--- |
| **Nginx Proxy Manager** | `npm-setup.yml` | Reverse proxy and SSL management. Access Admin UI at `http://localhost:81`. |
| **Pi-hole** | `pi-hole-setup.yml` | Network-wide ad blocking and DNS. Access Admin UI at `http://localhost:8080/admin` (via NPM) or direct port. |
| **Plex** | `plex-setup.yml` | Media Server. Configuration includes your Claim Token from `.env`. |
| **Open WebUI** | `openWebUI/` | AI Chat Interface (Ollama). |

## Configuration

- **.env**: Contains secrets like `PLEX_CLAIM`. Docker Compose automatically reads this file.
- **Data Folders**: Service data is persisted in `data/`, `etc-pihole/`, etc. within this directory.
