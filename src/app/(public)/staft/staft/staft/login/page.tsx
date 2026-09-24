import Link from "next/link";
import { GraduationCap, Lock, ShieldCheck } from "lucide-react";
import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
  title: "Faculty & Staff Sign In | SmartSchool",
  description: "Secure login portal for SmartSchool faculty and staff members.",
};

export default function StaffLoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-50 px-4 py-12 font-sans">
      <div className="relative z-10 w-full max-w-md space-y-6">
        {/* Header */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="p-2.5 rounded-2xl bg-white text-slate-950 font-bold shadow-lg">
              <GraduationCap className="h-6 w-6" />
            </div>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
            Faculty & Staff Portal Access
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Staff Sign In
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xs">
            Sign in with your official staff credentials to access class rosters, grading, and portal management.
          </p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <LoginForm />
          
          <div className="mt-6 pt-6 border-t border-slate-800/80 flex flex-col items-center gap-2 text-center text-xs text-slate-500">
            <p>
              Are you a student?{" "}
              <Link href="/student-login" className="text-white hover:underline font-semibold">
                Student Portal
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>© {new Date().getFullYear()} SmartSchool Platform. Authorized Staff Only.</p>
        </div>
      </div>
    </div>
  );
}
