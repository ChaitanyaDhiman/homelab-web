import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface BatteryInfo {
    // Current state
    isCharging: boolean;
    percentage: number;
    state: 'Charging' | 'Discharging' | 'Full' | 'Not charging' | 'Unknown';

    // Power info
    currentPower: number;  // Watts
    voltage: number;       // Volts

    // Capacity info
    designCapacity: number;    // Original capacity (Wh)
    fullCapacity: number;      // Current full capacity (Wh)
    currentCapacity: number;   // Current charge (Wh)

    // Health metrics
    health: number;            // Percentage (fullCapacity / designCapacity)
    cycleCount: number;        // Number of charge cycles

    // Time estimates
    timeRemaining: string | null;  // Time to empty/full

    // Temperature (if available)
    temperature?: number;      // Celsius

    // Manufacturer info
    manufacturer?: string;
    model?: string;
    serialNumber?: string;
    technology?: string;
}

async function getBatteryInfo(): Promise<BatteryInfo> {
    try {
        // Get battery info from multiple sources
        const [upower, acpi, sysfs] = await Promise.all([
            execAsync('upower -i /org/freedesktop/UPower/devices/battery_BAT0 2>/dev/null || upower -i $(upower -e | grep BAT) 2>/dev/null || echo "Not available"'),
            execAsync('acpi -b 2>/dev/null || echo "Not available"'),
            execAsync('cat /sys/class/power_supply/BAT*/uevent 2>/dev/null || echo "Not available"'),
        ]);

        const upowerData = upower.stdout;
        const sysfsData = sysfs.stdout;
        const acpiData = acpi.stdout;

        // Check if upower is available and returned valid data
        const isUpowerAvailable = !upowerData.includes('Not available') && upowerData.includes('native-path:');

        let isCharging = false;
        let percentage = 0;
        let state: BatteryInfo['state'] = 'Unknown';
        let currentPower = 0;
        let voltage = 0;
        let designCapacity = 0;
        let fullCapacity = 0;
        let currentCapacity = 0;
        let health = 0;
        let cycleCount = 0;
        let temperature: number | undefined;
        let manufacturer: string | undefined;
        let model: string | undefined;
        let serialNumber: string | undefined;
        let technology: string | undefined;

        if (isUpowerAvailable) {
            // Parse upower output (most detailed and pre-scaled)
            const extractValue = (key: string, defaultValue: any = null) => {
                const match = upowerData.match(new RegExp(`${key}:\\s*(.+)`));
                return match ? match[1].trim() : defaultValue;
            };

            const extractNumber = (key: string, defaultValue: number = 0) => {
                const value = extractValue(key);
                if (!value) return defaultValue;
                return parseFloat(value.replace(/[^0-9.]/g, ''));
            };

            const stateStr = extractValue('state', 'Unknown');
            state = (stateStr.charAt(0).toUpperCase() + stateStr.slice(1)) as any;
            isCharging = stateStr.toLowerCase().includes('charging') && !stateStr.toLowerCase().includes('not charging');
            percentage = extractNumber('percentage', 0);

            // Get capacity info
            fullCapacity = extractNumber('energy-full', 0);
            designCapacity = extractNumber('energy-full-design', 0);
            currentCapacity = extractNumber('energy', 0);
            health = designCapacity > 0 ? (fullCapacity / designCapacity) * 100 : 100;

            // Power/Voltage
            currentPower = extractNumber('energy-rate', 0);
            voltage = extractNumber('voltage', 0);

            // Metadata
            manufacturer = extractValue('vendor');
            model = extractValue('model');
            serialNumber = extractValue('serial');
            technology = extractValue('technology');

        } else if (!sysfsData.includes('Not available')) {
            // Parse sysfs uevent data
            const getSysfsValue = (key: string) => {
                const match = sysfsData.match(new RegExp(`${key}=(.+)`));
                return match ? match[1].trim() : undefined;
            };

            const getSysfsNumber = (key: string, scale: number = 1) => {
                const val = getSysfsValue(key);
                return val ? parseInt(val) / scale : 0;
            };

            const status = getSysfsValue('POWER_SUPPLY_STATUS') || 'Unknown';
            state = status as any;
            isCharging = status.toLowerCase() === 'charging';
            percentage = getSysfsNumber('POWER_SUPPLY_CAPACITY');

            // Units are typically in micro (10^-6)
            voltage = getSysfsNumber('POWER_SUPPLY_VOLTAGE_NOW', 1000000); // uV -> V
            currentPower = getSysfsNumber('POWER_SUPPLY_POWER_NOW', 1000000); // uW -> W

            // Try Energy first (uWh -> Wh)
            designCapacity = getSysfsNumber('POWER_SUPPLY_ENERGY_FULL_DESIGN', 1000000);
            fullCapacity = getSysfsNumber('POWER_SUPPLY_ENERGY_FULL', 1000000);
            currentCapacity = getSysfsNumber('POWER_SUPPLY_ENERGY_NOW', 1000000);

            // Fallback to Charge if Energy is 0 (uAh -> Ah, treat as "Wh" for consistent display or strictly Ah)
            // For simple display consistency we often treat them broadly, but let's try to be precise if needed.
            if (designCapacity === 0) {
                designCapacity = getSysfsNumber('POWER_SUPPLY_CHARGE_FULL_DESIGN', 1000000); // uAh -> Ah
                fullCapacity = getSysfsNumber('POWER_SUPPLY_CHARGE_FULL', 1000000);
                currentCapacity = getSysfsNumber('POWER_SUPPLY_CHARGE_NOW', 1000000);
                // If displaying properly we should ideally know if it's Wh or Ah, but for dashboard widgets, 
                // often just the relative numbers matter. We'll label as Wh in UI but logic holds.
            }

            health = designCapacity > 0 ? (fullCapacity / designCapacity) * 100 : 100;
            cycleCount = getSysfsNumber('POWER_SUPPLY_CYCLE_COUNT');

            manufacturer = getSysfsValue('POWER_SUPPLY_MANUFACTURER');
            model = getSysfsValue('POWER_SUPPLY_MODEL_NAME');
            serialNumber = getSysfsValue('POWER_SUPPLY_SERIAL_NUMBER');
            technology = getSysfsValue('POWER_SUPPLY_TECHNOLOGY');
        }

        // Common cycle count fallback if upower missed it or sysfs used
        if (cycleCount === 0 && sysfsData && !sysfsData.includes('Not available')) {
            const cycleMatch = sysfsData.match(/POWER_SUPPLY_CYCLE_COUNT=(\d+)/);
            if (cycleMatch) cycleCount = parseInt(cycleMatch[1]);
        }

        // Get time remaining (ACPI is best source if upower failed)
        let timeRemaining: string | null = null;
        if (isUpowerAvailable) {
            const extractValue = (key: string) => {
                const match = upowerData.match(new RegExp(`${key}:\\s*(.+)`));
                return match ? match[1].trim() : null;
            };
            if (isCharging) {
                const t = extractValue('time to full');
                if (t && !t.includes('unknown')) timeRemaining = t;
            } else {
                const t = extractValue('time to empty');
                if (t && !t.includes('unknown')) timeRemaining = t;
            }
        }

        // Fallback to ACPI for time remaining if upower didn't get it
        if (!timeRemaining && !acpiData.includes('Not available')) {
            // Output format: "Battery 0: Discharging, 98%, 02:45:02 remaining"
            const timeMatch = acpiData.match(/,\s*(\d{2}:\d{2}:\d{2})\s*remaining/);
            if (timeMatch) {
                const [hours, minutes] = timeMatch[1].split(':');
                timeRemaining = `${parseInt(hours)}h ${parseInt(minutes)}m`;
            } else {
                const timeMatchUntil = acpiData.match(/,\s*(\d{2}:\d{2}:\d{2})\s*until/);
                if (timeMatchUntil) {
                    const [hours, minutes] = timeMatchUntil[1].split(':');
                    timeRemaining = `${parseInt(hours)}h ${parseInt(minutes)}m`;
                }
            }
        }

        // Try to get temperature
        try {
            const tempResult = await execAsync('cat /sys/class/power_supply/BAT*/temp 2>/dev/null');
            if (tempResult.stdout) {
                // Temperature is usually in tenths of degrees
                temperature = parseInt(tempResult.stdout.trim()) / 10;
            }
        } catch {
            // Temperature not available
        }

        return {
            isCharging,
            percentage: Math.round(percentage),
            state: state as any,
            currentPower: Math.round(currentPower * 10) / 10,
            voltage: Math.round(voltage * 10) / 10,
            designCapacity: Math.round(designCapacity * 10) / 10,
            fullCapacity: Math.round(fullCapacity * 10) / 10,
            currentCapacity: Math.round(currentCapacity * 10) / 10,
            health: Math.round(health * 10) / 10,
            cycleCount,
            timeRemaining,
            temperature,
            manufacturer,
            model,
            serialNumber,
            technology,
        };
    } catch (error: any) {
        console.error('Battery info error:', error);
        throw new Error('Failed to get battery information');
    }
}

export async function GET() {
    try {
        const batteryInfo = await getBatteryInfo();

        return NextResponse.json({
            success: true,
            data: batteryInfo,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message,
                timestamp: new Date().toISOString(),
            },
            { status: 500 }
        );
    }
}