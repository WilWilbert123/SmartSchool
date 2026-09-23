import { SettingsView } from "@/components/settings/settings-view";

export default function AdminSettingsPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize school profile, themes, notification alerts, and account security.
        </p>
      </div>

      <SettingsView />
    </div>
  );
}
