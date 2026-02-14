#!/bin/sh
set -e

# Initialize configuration files from defaults
node /app/scripts/init-config.js

# Execute the main command (CMD)
exec "$@"
