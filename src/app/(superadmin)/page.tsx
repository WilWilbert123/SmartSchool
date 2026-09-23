import { Database, ShieldAlert, Server, Activity } from "lucide-react";

export default function SuperadminDashboardPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Overview</h1>
        <p className="text-muted-foreground mt-1 text-lg">
          Global infrastructure and tenant monitoring.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-muted-foreground">
            <Database className="h-5 w-5" />
            <h3 className="font-medium">Active Tenants</h3>
          </div>
          <div className="text-3xl font-bold">12</div>
          <p className="text-xs text-muted-foreground mt-2">+1 this month</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-muted-foreground">
            <Server className="h-5 w-5" />
            <h3 className="font-medium">Database Load</h3>
          </div>
          <div className="text-3xl font-bold text-green-600">Healthy</div>
          <p className="text-xs text-muted-foreground mt-2">12% CPU usage avg</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-muted-foreground">
            <ShieldAlert className="h-5 w-5" />
            <h3 className="font-medium">Security Alerts</h3>
          </div>
          <div className="text-3xl font-bold">0</div>
          <p className="text-xs text-muted-foreground mt-2">Last 24 hours</p>
        </div>

        <div className="bg-card border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-3 text-muted-foreground">
            <Activity className="h-5 w-5" />
            <h3 className="font-medium">Uptime</h3>
          </div>
          <div className="text-3xl font-bold">99.99%</div>
          <p className="text-xs text-muted-foreground mt-2">Last 30 days</p>
        </div>
      </div>
      
      <div className="mt-8 bg-card border rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center min-h-[300px] text-center">
         <ShieldAlert className="h-16 w-16 text-muted-foreground mb-4 opacity-20" />
         <h2 className="text-xl font-semibold">Superadmin Privileges Active</h2>
         <p className="text-muted-foreground max-w-md mt-2">
           You have unrestricted access to all global configurations. Please proceed with caution when making system-wide changes.
         </p>
      </div>
    </div>
  );
}
