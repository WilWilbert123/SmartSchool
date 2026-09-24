import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { AdminHeader } from "@/components/layout/admin-header";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen print:h-auto print:block overflow-hidden print:overflow-visible bg-background">
      <div className="print:hidden">
        <AdminSidebar />
      </div>
      <div className="flex-1 flex flex-col min-w-0 print:block">
        <div className="print:hidden">
          <AdminHeader />
        </div>
        <main className="flex-1 overflow-y-auto print:overflow-visible p-6 print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
