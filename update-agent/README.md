# Update Agent

A lightweight sidecar container that checks for system updates on the host and provides the results via a shared volume.

## How It Works

1. The `update-agent` container mounts specific apt directories from the host (read-only)
2. It periodically runs `apt-get upgrade --dry-run` to check for available updates
3. Results are written to `/data/update-status.json` in a shared Docker volume
4. The main dashboard container reads this JSON file to display update status

## Manual Refresh

The agent supports on-demand refresh via a trigger file mechanism:

1. Dashboard creates `/data/trigger-refresh` file
2. Agent detects the trigger (within 2 seconds)
3. Agent runs an immediate update check
4. Agent deletes the trigger file and writes fresh status

This is used by the dashboard's "Refresh Status" button.

## Security

This approach is more secure than mounting the entire host filesystem because:
- Only specific apt-related directories are mounted (read-only)
- The dashboard container only has access to a JSON status file
- No shell command execution in the main dashboard container for update checks

## Configuration

Environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `UPDATE_STATUS_FILE` | `/data/update-status.json` | Path to write status JSON |
| `TRIGGER_FILE` | `/data/trigger-refresh` | Path to watch for manual refresh triggers |
| `CHECK_INTERVAL_SECONDS` | `3600` | How often to check for updates (default: 1 hour) |

## Output Format

The agent writes a JSON file with this structure:

```json
{
  "upgrades": {
    "total": 5,
    "security": 2,
    "allPackages": ["pkg1", "pkg2", "..."],
    "securityPackages": ["pkg1", "..."]
  },
  "reboot": {
    "required": false,
    "packages": []
  },
  "lastUpdateCheck": "2026-01-21T00:00:00+00:00",
  "agentTimestamp": "2026-01-21T00:00:00+00:00"
}
```

