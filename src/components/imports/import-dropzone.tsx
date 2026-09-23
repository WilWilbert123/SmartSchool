"use client";

import { useState, useRef } from "react";
import Papa from "papaparse";
import { UploadCloud, File, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { processStudentBulkImport } from "@/features/imports/import.actions";
import { useRouter } from "next/navigation";

export function ImportDropzone() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<{ success?: boolean; message?: string; errors?: { row: number, error: string }[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (selectedFile: File) => {
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
      alert("Please upload a valid CSV file.");
      return;
    }
    setFile(selectedFile);
    setResults(null);
  };

  const handleProcessFile = () => {
    if (!file) return;

    setIsProcessing(true);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const response = await processStudentBulkImport(results.data);
          
          if ('error' in response && response.error) {
             setResults({ success: false, message: response.error, errors: response.details || [] });
          } else if ('success' in response) {
             setResults({ success: true, message: response.message, errors: response.errors || [] });
             router.refresh();
          }
        } catch (err) {
          console.error(err);
          setResults({ success: false, message: "An unexpected error occurred during import.", errors: [] });
        } finally {
          setIsProcessing(false);
        }
      },
      error: (error) => {
        setResults({ success: false, message: `Failed to parse CSV: ${error.message}`, errors: [] });
        setIsProcessing(false);
      }
    });
  };

  return (
    <div className="space-y-6">
      {!file ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-colors ${
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50 hover:bg-muted/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".csv"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileSelected(e.target.files[0]);
              }
            }}
          />
          <div className="mx-auto h-16 w-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <UploadCloud className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-1">Upload CSV File</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <div className="text-xs text-muted-foreground flex items-center justify-center gap-2">
            <span>Supported format: .csv</span>
            <span>•</span>
            <span>Max size: 5MB</span>
          </div>
        </div>
      ) : (
        <div className="border rounded-2xl p-6 bg-card">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <File className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">{file.name}</h3>
                <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
            </div>
            <button
              onClick={() => {
                setFile(null);
                setResults(null);
              }}
              disabled={isProcessing}
              className="text-sm font-medium text-destructive hover:underline disabled:opacity-50"
            >
              Remove
            </button>
          </div>

          {results ? (
            <div className={`p-4 rounded-xl border ${results.success ? 'bg-green-500/10 border-green-500/20 text-green-700' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
              <div className="flex items-start gap-3">
                {results.success ? (
                  <CheckCircle2 className="h-5 w-5 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold">{results.message}</h4>
                  {results.errors && results.errors.length > 0 && (
                    <div className="mt-2 text-sm max-h-32 overflow-y-auto">
                      <p className="font-medium mb-1">Errors found in {results.errors.length} rows:</p>
                      <ul className="list-disc pl-4 space-y-1">
                        {results.errors.slice(0, 10).map((err, i) => (
                          <li key={i}>Row {err.row}: {err.error}</li>
                        ))}
                        {results.errors.length > 10 && (
                          <li>...and {results.errors.length - 10} more errors.</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleProcessFile}
              disabled={isProcessing}
              className="w-full inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Import Students"
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
