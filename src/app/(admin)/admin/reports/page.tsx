import { ReportsView } from "@/components/reports/reports-view";

export const dynamic = "force-dynamic";

export default function AdminReportsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Generate, view, and export real-time system reports from your database.
          </p>
        </div>
      </div>

      <ReportsView />
    </div>
  );
}
