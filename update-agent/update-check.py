#!/usr/bin/env python3
"""
Update Agent - Checks for system updates and writes results to JSON.
Runs as a sidecar container with minimal, targeted volume mounts.
Supports manual refresh triggers via a trigger file.
"""

import json
import os
import re
import subprocess
import time
from datetime import datetime, timezone
from pathlib import Path

# Configuration
OUTPUT_FILE = os.environ.get('UPDATE_STATUS_FILE', '/data/update-status.json')
TRIGGER_FILE = os.environ.get('TRIGGER_FILE', '/data/trigger-refresh')
CHECK_INTERVAL = int(os.environ.get('CHECK_INTERVAL_SECONDS', 3600))  # Default: 1 hour
TRIGGER_CHECK_INTERVAL = 2  # Check for trigger file every 2 seconds
REBOOT_REQUIRED_FILE = '/host/var/run/reboot-required'
REBOOT_REQUIRED_PKGS_FILE = '/host/var/run/reboot-required.pkgs'


def run_command(cmd: str) -> tuple[int, str, str]:
    """Run a shell command and return exit code, stdout, stderr."""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            timeout=120
        )
        return result.returncode, result.stdout.strip(), result.stderr.strip()
    except subprocess.TimeoutExpired:
        return 1, '', 'Command timed out'
    except Exception as e:
        return 1, '', str(e)


def get_upgrade_info() -> dict:
    """Check for available package upgrades."""
    # Use apt-get with custom directories pointing to mounted host paths
    apt_options = (
        '-o Dir::State=/host/var/lib/apt '
        '-o Dir::State::status=/host/var/lib/dpkg/status '
        '-o Dir::Etc=/host/etc/apt '
        '-o Dir::Cache=/host/var/cache/apt'
    )
    
    cmd = f'apt-get {apt_options} upgrade --dry-run 2>/dev/null | grep "^Inst"'
    exit_code, stdout, _ = run_command(cmd)
    
    if exit_code != 0 or not stdout:
        return {
            'total': 0,
            'security': 0,
            'allPackages': [],
            'securityPackages': []
        }
    
    all_packages = []
    security_packages = []
    
    for line in stdout.split('\n'):
        if not line:
            continue
        match = re.match(r'^Inst\s+(\S+)', line)
        if match:
            package_name = match.group(1)
            all_packages.append(package_name)
            
            if 'security' in line.lower():
                security_packages.append(package_name)
    
    return {
        'total': len(all_packages),
        'security': len(security_packages),
        'allPackages': all_packages,
        'securityPackages': security_packages
    }


def check_reboot_required() -> dict:
    """Check if a system reboot is required."""
    reboot_file = Path(REBOOT_REQUIRED_FILE)
    pkgs_file = Path(REBOOT_REQUIRED_PKGS_FILE)
    
    if not reboot_file.exists():
        return {'required': False, 'packages': []}
    
    packages = []
    if pkgs_file.exists():
        try:
            packages = [p.strip() for p in pkgs_file.read_text().split('\n') if p.strip()]
        except Exception:
            pass
    
    return {'required': True, 'packages': packages}


def get_last_update_time() -> str | None:
    """Get the timestamp of the last apt update."""
    paths = [
        '/host/var/lib/apt/periodic/update-success-stamp',
        '/host/var/cache/apt/pkgcache.bin',
        '/host/var/lib/apt/lists'
    ]
    
    for path in paths:
        p = Path(path)
        if p.exists():
            try:
                mtime = p.stat().st_mtime
                return datetime.fromtimestamp(mtime, tz=timezone.utc).isoformat()
            except Exception:
                continue
    
    return None


def write_status(status: dict) -> None:
    """Write status to JSON file atomically."""
    output_path = Path(OUTPUT_FILE)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    # Write to temp file first, then rename (atomic operation)
    temp_file = output_path.with_suffix('.tmp')
    with open(temp_file, 'w') as f:
        json.dump(status, f, indent=2)
    temp_file.rename(output_path)
    
    print(f"[{datetime.now().isoformat()}] Status updated: {status['upgrades']['total']} updates available")


def check_trigger() -> bool:
    """Check if a manual refresh was triggered and consume the trigger."""
    trigger_path = Path(TRIGGER_FILE)
    if trigger_path.exists():
        try:
            trigger_path.unlink()  # Delete the trigger file
            print(f"[{datetime.now().isoformat()}] Manual refresh triggered")
            return True
        except Exception as e:
            print(f"[{datetime.now().isoformat()}] Error consuming trigger: {e}")
    return False


def check_updates() -> None:
    """Perform a full update check and write results."""
    print(f"[{datetime.now().isoformat()}] Checking for updates...")
    
    upgrade_info = get_upgrade_info()
    reboot_status = check_reboot_required()
    last_update = get_last_update_time()
    
    status = {
        'upgrades': upgrade_info,
        'reboot': reboot_status,
        'lastUpdateCheck': last_update,
        'agentTimestamp': datetime.now(timezone.utc).isoformat()
    }
    
    write_status(status)


def main():
    """Main loop - check updates periodically and watch for manual triggers."""
    print(f"Update Agent started. Checking every {CHECK_INTERVAL} seconds.")
    print(f"Output file: {OUTPUT_FILE}")
    print(f"Trigger file: {TRIGGER_FILE}")
    
    # Initial check on startup
    check_updates()
    
    # Track time since last periodic check
    last_check_time = time.time()
    
    # Main loop - check for triggers frequently, run periodic checks on schedule
    while True:
        time.sleep(TRIGGER_CHECK_INTERVAL)
        
        try:
            # Check for manual trigger
            if check_trigger():
                check_updates()
                last_check_time = time.time()  # Reset periodic timer
                continue
            
            # Check if it's time for periodic update
            elapsed = time.time() - last_check_time
            if elapsed >= CHECK_INTERVAL:
                check_updates()
                last_check_time = time.time()
                
        except Exception as e:
            print(f"[{datetime.now().isoformat()}] Error during update check: {e}")


if __name__ == '__main__':
    main()
