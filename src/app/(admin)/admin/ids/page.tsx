import { Plus, Settings, CreditCard, Search, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { getIDTemplates } from "@/features/ids/id.actions";
import { IDCardPreview } from "@/components/ids/id-card-preview";

export default async function AdminIDsPage() {
  const { data: templates } = await getIDTemplates();

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ID Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage student ID templates and issuance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/ids/editor" className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Templates Section */}
        <div className="md:col-span-1 space-y-4">
          <h2 className="font-semibold text-lg flex items-center">
            <Settings className="mr-2 h-5 w-5 text-muted-foreground" />
            ID Templates
          </h2>
          
          <div className="space-y-4">
            {templates?.map((template) => (
              <div key={template.id} className="bg-card border rounded-2xl shadow-sm p-5 hover:border-primary/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-medium group-hover:text-primary transition-colors">{template.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{template.width_mm}x{template.height_mm}mm</p>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${template.is_active ? 'bg-green-500/10 text-green-600' : 'bg-muted text-muted-foreground'}`}>
                    {template.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="bg-muted/30 rounded-xl p-4 flex items-center justify-center border border-dashed mb-4">
                  {/* Miniature preview */}
                  <div className="scale-50 origin-top">
                    <IDCardPreview template={template} />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <Link href={`/admin/ids/editor?id=${template.id}`} className="text-xs font-medium text-muted-foreground hover:text-foreground">
                    Edit Template
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Issuance Section */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="font-semibold text-lg flex items-center">
            <CreditCard className="mr-2 h-5 w-5 text-muted-foreground" />
            Recent ID Issuance
          </h2>
          
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search students..."
                  className="flex h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary transition-all"
                />
              </div>
              <button className="text-sm font-medium text-primary hover:underline">
                Batch Print
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground bg-muted/40 uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Student</th>
                    <th className="px-6 py-4 font-medium">ID Number</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Issued Date</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {[1, 2, 3].map((i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium">Student Name {i}</td>
                      <td className="px-6 py-4 font-mono text-xs">2024-00{i}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">Oct 12, 2024</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
