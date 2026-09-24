import Link from "next/link";
import { GraduationCap, Shield, Users, UserCheck } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight">SmartSchool</span>
        </div>
        <nav className="flex gap-4 items-center">
          <Link href="/verify-id" className="text-sm font-medium hover:underline">
            Verify ID
          </Link>
          <Link href="/student-login" className={cn(buttonVariants({ variant: "default" }))}>
            Student Portal
          </Link>
        </nav>
      </header>
      
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-background to-muted/20">
        <div className="max-w-3xl space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Production-Grade School Information Platform
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Secure, scalable, and offline-capable platform for managing students, grades, digital IDs, and administrative workflows.
          </p>
          
          {/* Public Portal Access Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Link
              href="/student-login"
              className={cn(buttonVariants({ size: "lg", variant: "default" }), "w-full sm:w-auto font-bold flex items-center gap-2")}
            >
              <UserCheck className="h-4 w-4" />
              Student & Parent Portal
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto">
          <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card border text-card-foreground shadow-sm">
            <Shield className="h-10 w-10 text-primary mb-2" />
            <h3 className="font-semibold text-lg">Secure & Private</h3>
            <p className="text-sm text-muted-foreground text-center">
              Role-based access control and strict data isolation ensures student privacy at all times.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card border text-card-foreground shadow-sm">
            <Users className="h-10 w-10 text-primary mb-2" />
            <h3 className="font-semibold text-lg">Unified Portals</h3>
            <p className="text-sm text-muted-foreground text-center">
              Dedicated interfaces for students, teachers, and staff.
            </p>
          </div>
          <div className="flex flex-col items-center space-y-2 p-6 rounded-lg bg-card border text-card-foreground shadow-sm">
            <svg
              className="h-10 w-10 text-primary mb-2"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
            </svg>
            <h3 className="font-semibold text-lg">Offline First</h3>
            <p className="text-sm text-muted-foreground text-center">
              Keep working even when the internet drops. Syncs automatically when reconnected.
            </p>
          </div>
        </div>
      </main>

      <footer className="py-6 text-center text-sm text-muted-foreground border-t">
        © {new Date().getFullYear()} SmartSchool Platform. All rights reserved.
      </footer>
    </div>
  );
}
