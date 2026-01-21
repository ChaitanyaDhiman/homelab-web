#!/bin/bash
# =============================================================================
# Test Script: Verify Update Agent Sees Changes Without Container Restart
# =============================================================================
#
# This script tests that the update-agent can detect changes in /var/lib/apt
# immediately after 'apt update' runs on the host, WITHOUT requiring a
# container restart.
#
# Requirements:
# - update-agent container must be running
# - You need sudo access on the host
# =============================================================================

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Testing Update Agent Real-Time Sync (No Restart Needed)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Step 1: Check current status
echo -e "${YELLOW}[STEP 1]${NC} Checking current update status..."
CURRENT_UPDATES=$(docker exec update-agent cat /data/update-status.json | jq -r '.upgrades.total')
echo -e "         Current updates available: ${BLUE}${CURRENT_UPDATES}${NC}"
echo ""

# Step 2: Run apt update to refresh package lists
echo -e "${YELLOW}[STEP 2]${NC} Running 'sudo apt update' on host to refresh package cache..."
echo -e "         ${BLUE}Note:${NC} This may show new updates available if any packages have been released."
sudo apt update -qq
echo -e "         ${GREEN}✓${NC} apt update completed"
echo ""

# Step 3: Check what apt sees on the host
echo -e "${YELLOW}[STEP 3]${NC} Checking what updates are available on the HOST..."
HOST_UPDATES=$(apt list --upgradable 2>/dev/null | grep -v "Listing" | wc -l)
echo -e "         Host sees ${BLUE}${HOST_UPDATES}${NC} updates available"
echo ""

# Step 4: Trigger manual refresh WITHOUT restarting container
echo -e "${YELLOW}[STEP 4]${NC} Triggering manual refresh (WITHOUT container restart)..."
echo -e "         Creating trigger file..."
sudo touch /var/lib/docker/volumes/homelab-web_update-data/_data/trigger-refresh
echo -e "         ${GREEN}✓${NC} Trigger created"
echo ""

# Step 5: Wait for agent to process trigger
echo -e "${YELLOW}[STEP 5]${NC} Waiting for agent to detect trigger and complete check..."
echo -e "         ${BLUE}Note:${NC} Optimized sync (~6s measured) + 2s buffer = 8s total"
sleep 8
echo -e "         ${GREEN}✓${NC} Wait complete"
echo ""

# Step 6: Check new status
echo -e "${YELLOW}[STEP 6]${NC} Reading updated status from agent..."
NEW_STATUS=$(docker exec update-agent cat /data/update-status.json)
NEW_UPDATES=$(echo "$NEW_STATUS" | jq -r '.upgrades.total')
AGENT_TIMESTAMP=$(echo "$NEW_STATUS" | jq -r '.agentTimestamp')
echo -e "         Agent now sees ${BLUE}${NEW_UPDATES}${NC} updates available"
echo -e "         Last check timestamp: ${BLUE}${AGENT_TIMESTAMP}${NC}"
echo ""

# Step 7: Verify sync worked
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  TEST RESULTS${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Host updates:        ${BLUE}${HOST_UPDATES}${NC}"
echo -e "  Agent updates:       ${BLUE}${NEW_UPDATES}${NC}"
echo -e "  Container restarted: ${RED}NO${NC} (this is the test!)"
echo ""

if [ "$HOST_UPDATES" -eq "$NEW_UPDATES" ]; then
    echo -e "${GREEN}✓ SUCCESS!${NC} Agent synced with host without container restart!"
    echo -e "  The sync_filesystem() fix is working correctly."
    exit 0
else
    echo -e "${RED}✗ FAILURE!${NC} Agent did not sync properly."
    echo -e "  Expected ${HOST_UPDATES} updates, but agent saw ${NEW_UPDATES}."
    echo -e "  The sync_filesystem() fix may need debugging."
    exit 1
fi
