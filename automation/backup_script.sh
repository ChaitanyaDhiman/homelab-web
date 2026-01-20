#!/bin/bash
# =============================================================================
# Homelab Backup Script
# =============================================================================
#
# Description:
#   Automated backup script for homelab Docker services and configuration files.
#   Creates timestamped backups with configurable retention policy.
#
# Features:
#   - Stops Docker containers before backup to prevent corruption
#   - Backs up configuration files, env files, and Docker data volumes
#   - Dumps PostgreSQL databases (Immich)
#   - Automatic cleanup of old backups based on retention policy
#   - Preserves full directory paths to avoid file conflicts
#
# Usage:
#   ./backup_script.sh
#
# =============================================================================
# CRON SETUP (Automated daily backups at 4 AM)
# =============================================================================
#
# 1. Make the script executable:
#    chmod +x /path/to/backup_script.sh
#
# 2. Open root crontab:
#    sudo crontab -e
#
# 3. Add this line at the bottom (runs daily at 4:00 AM):
#    0 4 * * * /path/to/backup_script.sh >> /var/log/backup.log 2>&1
#
# 4. Verify the cron job is added:
#    sudo crontab -l
#
# =============================================================================

# --- CONFIGURATION ---
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_ROOT="/mnt/backup/docker_backups"
CURRENT_BACKUP="$BACKUP_ROOT/$TIMESTAMP"
RETENTION_DAYS=7

# LIST OF DIRECTORIES TO BACKUP
# Add every folder where you have docker-compose.yml, .env files, or configs
# You can add as many lines as you want.
CONFIG_DIRS=(
  # Docker project configs
  "/home/user/homelab/.env.local"
  "/home/user/homelab/docker-services/.env"
  
  # System configs (examples)
  # "/etc/samba"
  # "/etc/fstab"
  # "/etc/hosts"
)

# MAIN DATA DIRECTORY (Large Data)
DATA_DIR="/srv/docker-data"

# ----------------------

# Create directory
mkdir -p "$CURRENT_BACKUP"

echo "Starting Backup at $TIMESTAMP"

# 1.STOP SERVICES
# Recommended to prevent database corruption during copy
echo "Stopping Docker containers..."
docker stop $(docker ps -q)

# 2.BACKUP CONFIGS & ENV FILES
# We use -R (Relative) to preserve the full path.
# Example: /home/user/docker -> /backup/.../home/user/docker
# This prevents 'project1/.env' from overwriting 'project2/.env'
echo "Backing up configuration directories..."
for entry in "${CONFIG_DIRS[@]}"; do
  if [ -e "$entry" ]; then
    rsync -avqR "$entry" "$CURRENT_BACKUP/configs" --exclude '.git' --exclude 'node_modules'
  else
    echo "⚠️ Warning: Directory not found: $entry"
  fi
done

# 3.BACKUP MAIN DATA VOLUME
echo "Backing up bulk data..."
# We don't use -R here because we usually just want the contents of this specific folder
rsync -avq "$DATA_DIR" "$CURRENT_BACKUP/data"

# 4.RESTART SERVICES
echo "Restarting Docker containers..."
docker start $(docker ps -a -q)

# 5.DATABASE DUMPS (Critical for Immich/Postgres)
# We do this AFTER restart because pg_dump needs the DB to be running
echo "Dumping Databases..."
mkdir -p "$CURRENT_BACKUP/db_dumps"

# Immich (Postgres)
if docker ps | grep -q immich_postgres; then
    docker exec -t immich_postgres pg_dumpall -c -U postgres > "$CURRENT_BACKUP/db_dumps/immich_dump.sql"
    echo "✅ Immich DB Dumped"
else
    echo "⚠️ Immich Postgres container not found/running"
fi

# 6.CLEANUP (Delete old backups)
echo "Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

echo "Backup Complete!"
