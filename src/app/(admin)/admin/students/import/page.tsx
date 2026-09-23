import { ChevronLeft, Download, Info } from "lucide-react";
import Link from "next/link";
import { ImportDropzone } from "@/components/imports/import-dropzone";

export default function ImportStudentsPage() {
  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      <div>
        <Link href="/admin/students" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Students
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Import Students</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Bulk upload student records via CSV.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Real app would trigger a download of the exact schema expected */}
            <a href="/student_import_template.csv" download className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-4 border border-input bg-background hover:bg-accent text-foreground transition-colors shadow-sm">
              <Download className="mr-2 h-4 w-4 text-primary" />
              Download Template
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <ImportDropzone />
        </div>
        
        <div className="space-y-6">
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-primary" />
              Instructions
            </h3>
            <div className="text-sm text-muted-foreground space-y-3">
              <p>1. Download the CSV template from the top right.</p>
              <p>2. Fill in the student data exactly matching the column headers.</p>
              <p>3. Do not modify the header row.</p>
              <p>4. Upload the file here.</p>
              <p>5. The system will validate the data before importing.</p>
            </div>
            
            <div className="mt-6 border-t pt-4">
              <h4 className="font-medium text-sm mb-2">Required Columns:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 pl-4 list-disc marker:text-muted-foreground/50">
                <li>first_name</li>
                <li>last_name</li>
                <li>student_number</li>
                <li>admission_date (YYYY-MM-DD)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
