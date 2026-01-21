#!/bin/bash
# Quick performance test for optimized sync_filesystem()

echo "Testing optimized update-agent performance..."
echo ""

# Trigger refresh and measure time
echo "Triggering refresh..."
START_TIME=$(date +%s)

sudo touch /var/lib/docker/volumes/homelab-web_update-data/_data/trigger-refresh

# Wait for completion
sleep 2
echo "Waiting for agent to complete..."

# Poll for completion (check logs)
for i in {1..15}; do
    if docker logs update-agent 2>&1 | tail -1 | grep -q "Status updated"; then
        END_TIME=$(date +%s)
        DURATION=$((END_TIME - START_TIME))
        echo ""
        echo "✓ Refresh completed in ${DURATION} seconds"
        docker logs update-agent | tail -3
        exit 0
    fi
    sleep 1
done

echo "✗ Timeout waiting for agent"
exit 1
