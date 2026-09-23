import { GraduationCap } from "lucide-react";
import Link from "next/link";
import { LoginForm } from "@/components/forms/login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md bg-card border rounded-2xl shadow-sm p-8 flex flex-col items-center">
        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <GraduationCap className="h-6 w-6 text-primary" />
        </div>
        
        <h1 className="text-2xl font-bold tracking-tight mb-2">Welcome Back</h1>
        <p className="text-sm text-muted-foreground mb-8 text-center">
          Sign in to your SmartSchool administrator or teacher account.
        </p>

        <LoginForm />

        <div className="mt-6 text-center text-sm text-muted-foreground border-t pt-6 w-full">
          <p>Are you a student?</p>
          <Link href="/student-login" className="text-primary font-medium hover:underline mt-1 inline-block">
            Go to Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
