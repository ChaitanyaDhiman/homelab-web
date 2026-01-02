import { DashboardGrid } from "@/components/DashboardGrid";
import { SystemStatus } from "@/components/SystemStatus";
import { HealthSummary } from "@/components/dashboard/HealthSummary";
import { UpdateStatus } from '@/components/dashboard/SystemUpdateStatus';

export default function Home() {
  return (
    <div className="flex flex-col min-h-full py-6">
      <header className="mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60 mb-2">
          Homelab OS
        </h1>
        <p className="text-gray-400">Welcome back, </p>
      </header>

      <SystemStatus />

      <UpdateStatus />

      <div className="mb-8">
        <HealthSummary />
      </div>

      <DashboardGrid />
    </div>
  );
}
