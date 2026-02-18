#!/bin/bash

# --- 1. HARDWARE CONFIGURATION ---
BACKUP_UUID="25e7b6ca-7ced-4466-8db2-c04d1becff13"
MOUNT_POINT="/mnt/backup"
# Dynamically find the device path (e.g., /dev/sdf) from UUID
DEVICE_PATH=$(findfs UUID=$BACKUP_UUID)

# --- 2. BACKUP CONFIGURATION ---
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
# Note: We use the dynamic mount point here
BACKUP_ROOT="$MOUNT_POINT/docker_backups"
CURRENT_BACKUP="$BACKUP_ROOT/$TIMESTAMP"
RETENTION_DAYS=7

# List of Config Files & Directories
CONFIG_DIRS=(
  "/home/chaitanyadhiman/Documents/homelab-web/homelab-web/.env.local"
  "/home/chaitanyadhiman/Documents/homelab-web/homelab-web/docker-services/.env"
  "/home/chaitanyadhiman/Documents/homelab-web/homelab-web/docker-services/filebrowser/filebrowser.db"
  "/etc/update-motd.d/99-updates"
  "/home/chaitanyadhiman/backup_script.sh"
  "/etc/samba"
  "/etc/fstab"
  "/etc/systemd/logind.conf"
  "/var/spool/cron/crontabs"
  "/etc/hosts"
  "/etc/cockpit"
  "/etc/logrotate.d/home_backup"
)

# Main Data Directory
DATA_DIR="/srv/docker-data"

# --------------------------------------------
# --- START SCRIPT ---
# --------------------------------------------

echo "[$(date)] 🚀 Starting Smart Backup Job..."

# 1. MOUNT THE DRIVE
mkdir -p $MOUNT_POINT
mount $DEVICE_PATH $MOUNT_POINT

# Check if mount was successful
if mountpoint -q $MOUNT_POINT; then
    echo "✅ Drive mounted successfully at $MOUNT_POINT."

    # Create destination folder
    mkdir -p "$CURRENT_BACKUP"

    # 2. STOP DOCKER SERVICES
    # (Prevents database corruption during file copy)
    echo "🛑 Stopping Docker containers..."
    # Only run stop if there are running containers
    if [ -n "$(docker ps -q)" ]; then
        docker stop $(docker ps -q)
    else
        echo "No running containers found."
    fi

    # 3. BACKUP CONFIG FILES
    echo "📂 Backing up configuration files..."
    mkdir -p "$CURRENT_BACKUP/configs"
    for entry in "${CONFIG_DIRS[@]}"; do
      if [ -e "$entry" ]; then
        # rsync -R preserves relative path structure
        rsync -avqR "$entry" "$CURRENT_BACKUP/configs" --exclude '.git' --exclude 'node_modules'
      else
        echo "⚠️ Warning: Config not found: $entry"
      fi
    done

    # 4. BACKUP MAIN DATA
    echo "📦 Backing up bulk data ($DATA_DIR)..."
    rsync -avq "$DATA_DIR" "$CURRENT_BACKUP/data"

    # 5. RESTART DOCKER
    echo "▶️ Restarting Docker containers..."
    # Only start if there are containers to start
    if [ -n "$(docker ps -a -q)" ]; then
        docker start $(docker ps -a -q)
    fi
    
    # Wait a few seconds for DBs to initialize before dumping
    echo "⏳ Waiting 15s for databases to initialize..."
    sleep 15

    # 6. DATABASE DUMPS (Hot Backup)
    echo "🗄️ Dumping Databases..."
    mkdir -p "$CURRENT_BACKUP/db_dumps"

    # Immich Postgres Dump
    if docker ps | grep -q immich_postgres; then
        docker exec -t immich_postgres pg_dumpall -c -U postgres > "$CURRENT_BACKUP/db_dumps/immich_dump.sql"
        echo "✅ Immich DB Dumped"
    else
        echo "⚠️ Immich Postgres container not running - skipped dump."
    fi

    # 7. CLEANUP OLD BACKUPS
    echo "🧹 Removing backups older than $RETENTION_DAYS days..."
    find "$BACKUP_ROOT" -mindepth 1 -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} +

    echo "✅ Backup Operations Complete."

    # 8. UNMOUNT & SPINDOWN
    echo "💤 Unmounting and spinning down drive..."
    umount $MOUNT_POINT
    
    # Send standby command to the disk
    PARENT_DISK=$(lsblk -no pkname $DEVICE_PATH)
    
    udisksctl power-off -b /dev/$PARENT_DISK
    
    echo "[$(date)] 🏁 Job Finished Successfully."

else
    echo "❌ CRITICAL ERROR: Could not mount backup drive (UUID: $BACKUP_UUID). Aborting."
    exit 1
fi
