
export interface SystemStats {
    cpu: number;
    memory: {
        total: number;
        used: number;
        free: number;
    };
    gpu: {
        name: string;
        utilization: number;
        memory: number;
        memoryTotal: number;
        temperature: number;
    };
    temperature: number;
    uptime: number;
    fanSpeed: string;
    network?: {
        rx_sec: number;
        tx_sec: number;
    };
}
