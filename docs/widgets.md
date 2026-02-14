# Widget Catalog

NexLab Dashboard includes a variety of widgets to monitor your homelab.

## Core Widgets

### 1. Date & Time
- **Variants**: Digital, Minimal, Analog.
- **Features**: 12/24h format, date display.

### 2. Weather
- **Features**: Current temperature, condition icon, location.
- **Config**: Requires location setup.

### 3. Applications
- **Variants**: Single App, Frequent Apps.
- **Features**: Quick launch shortcuts, status indicators.

## System Monitoring (New)

### 4. System Load Gauge
- **Type**: `cpu-gpu-gauge`
- **Display**: Radial gauge showing CPU (Outer) and GPU (Inner) utilization.
- **Best for**: Quick visual check of system load.

### 5. CPU Monitor
- **Type**: `cpu-temp-circle`
- **Display**: Circular progress for CPU load + Mini trend graph + Temperature.
- **Best for**: Detailed CPU tracking.

### 6. GPU Monitor
- **Type**: `gpu-temp-circle`
- **Display**: Circular progress for GPU load + Temperature.
- **Best for**: Monitoring GPU intensive tasks.

### 7. Network Activity
- **Type**: `network`
- **Display**: Real-time Upload and Download speeds (KB/s or MB/s).
- **Best for**: Monitoring bandwidth usage.

## Storage Monitoring (New)

### 8. Storage Bar
- **Type**: `storage-bar`
- **Display**: Linear progress bar showing Total vs Used space.
- **Best for**: Simple capacity monitoring.

### 9. Storage Pie Chart
- **Type**: `storage-pie`
- **Display**: Visual distribution of Used vs Free space interaction.
- **Best for**: Visualizing storage allocation.

## Docker

### 10. Docker Containers
- **Type**: `docker`
- **Display**: List of active containers (Name, Image, CPU%, Mem%, Status).
- **Features**: Live updates of container resource usage.
