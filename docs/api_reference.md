# API Reference

## System API
`GET /api/system`

Returns real-time system metrics.

**Response:**
```json
{
  "cpu": 12.5,
  "memory": { "total": 32000000000, "used": 16000000000, "free": 16000000000 },
  "gpu": { "name": "NVIDIA", "utilization": 0, "temperature": 45 },
  "temperature": 55,
  "net": { 
    "rx_sec": 10240, // Bytes per second download
    "tx_sec": 2048   // Bytes per second upload
  }
}
```

## Health API
`GET /api/health`

Returns health status for all configured services.

**Response:**
```json
{
  "plex": { "status": "online", "responseTime": 124, "usedFallback": false },
  "jellyfin": { "status": "offline", "responseTime": 0, "usedFallback": false }
}
```

## Docker API
`GET /api/docker`

Returns list of active Docker containers with stats.

**Response:**
```json
[
  {
    "id": "a1b2c3d4",
    "name": "plex",
    "image": "plexinc/pms-docker",
    "status": "Up 2 days",
    "state": "running",
    "cpu": "5.2%",
    "memory": "1.2GB / 16GB"
  }
]
```

## Storage API
`GET /api/storage`

Returns configured storage drives.

**Response:**
```json
{
  "drives": [
    {
      "id": "main",
      "name": "Main",
      "total": 500000000000,
      "used": 250000000000,
      "percentage": 50
    }
  ]
}
```

## Updates API
`GET /api/updates`

Returns system update status.

**Response:**
```json
{
  "rebootRequired": false,
  "updatesAvailable": 5,
  "securityUpdates": 1,
  "updatePackages": ["pkg1"],
  "securityPackagesList": ["pkg1"]
}
```

`POST /api/updates/refresh`

Triggers an immediate update check via the sidecar agent.

**Response:**
```json
{ "message": "Refresh triggered" }
```

## Configuration APIs

### Apps Config
`GET /api/apps`
Returns current apps configuration.

`POST /api/apps`
Updates apps configuration. Payload should match `AppsConfig` structure.

### Widgets Config
`GET /api/widgets`
Returns current widget layout and configuration.

`POST /api/widgets`
Updates widget layout. Payload should match `WidgetConfig` structure.
