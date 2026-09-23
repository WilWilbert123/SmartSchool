import { Settings, ShieldAlert, Users, Database } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function SuperadminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify superadmin role via app metadata
  if (user.app_metadata?.role !== 'SUPERADMIN') {
    redirect("/admin"); // Fallback to normal admin if they try to access
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="h-16 border-b bg-primary text-primary-foreground flex items-center justify-between px-6 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5" />
          <span className="font-bold tracking-tight">SmartSchool Superadmin</span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <span className="opacity-90">{user.email}</span>
        </div>
      </header>
      
      <div className="flex flex-1">
        <aside className="w-64 border-r bg-muted/20 flex flex-col">
          <nav className="flex-1 space-y-1 p-4">
            <Link href="/superadmin" className="flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/10 text-primary font-medium">
              <Database className="h-4 w-4" />
              Overview
            </Link>
            <Link href="/superadmin/schools" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors">
              <Settings className="h-4 w-4" />
              Tenant Management
            </Link>
            <Link href="/superadmin/admins" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors">
              <Users className="h-4 w-4" />
              System Admins
            </Link>
          </nav>
        </aside>
        
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
