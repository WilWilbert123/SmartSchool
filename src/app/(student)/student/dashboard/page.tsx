import { GraduationCap } from "lucide-react";

export default function StudentDashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Portal</h1>
          <p className="text-sm text-muted-foreground">Welcome to your dashboard.</p>
        </div>
      </div>
      <div className="bg-card border rounded-2xl p-8 shadow-sm flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-muted-foreground">Student dashboard features are currently under construction.</p>
      </div>
    </div>
  );
}
