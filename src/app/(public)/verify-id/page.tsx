import { Suspense } from "react";
import VerifyIdClient from "./verify-id-client";

export const metadata = {
  title: "Verify Student & Staff ID | SmartSchool",
  description: "Official public ID card verification portal for SmartSchool students, faculty, and administrative staff.",
};

export default function VerifyIdPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground text-sm font-medium">Loading Verification Portal...</p>
        </div>
      </div>
    }>
      <VerifyIdClient />
    </Suspense>
  );
}
