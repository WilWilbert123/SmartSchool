"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Award, Megaphone, CreditCard, LogOut, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/utils/cn";

interface StudentNavProps {
  studentName: string;
}

export function StudentNav({ studentName }: StudentNavProps) {
  const pathname = usePathname();

  const links = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/grades", label: "Grades & Report Card", icon: Award },
    { href: "/student/announcements", label: "Announcements", icon: Megaphone },
    { href: "/student/id-card", label: "Digital Student ID", icon: CreditCard },
  ];

  return (
    <>
      {/* Top Navigation Header (hidden when exporting/printing PDF) */}
      <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur-md px-4 sm:px-8 py-3 flex items-center justify-between transition-colors print:hidden">
        <div className="flex items-center gap-3">
          <Link href="/student/dashboard" className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary text-primary-foreground font-bold shadow-md">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-base sm:text-lg font-extrabold tracking-tight block leading-none text-black dark:text-white">
                SmartSchool
              </span>
              <span className="text-[10px] uppercase font-bold text-black dark:text-white tracking-wider block opacity-90">
                Student Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 bg-muted/40 p-1 rounded-xl border">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all",
                  isActive
                    ? "bg-card text-black dark:text-white shadow-xs font-black border"
                    : "text-black dark:text-white opacity-80 hover:opacity-100 hover:bg-card/50"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", isActive ? "text-black dark:text-white" : "text-black dark:text-white")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Controls: Theme Toggle & Profile & Logout */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Dark / Light Mode Toggle */}
          <div className="border border-border/80 rounded-full p-0.5 bg-muted/30">
            <ThemeToggle />
          </div>

          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-black dark:text-white">{studentName}</span>
            <span className="text-[10px] text-black dark:text-white font-mono font-bold opacity-80">Enrolled Student</span>
          </div>

          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-black dark:text-white text-xs font-medium flex items-center gap-1 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4 text-black dark:text-white" />
            </button>
          </form>
        </div>
      </header>

      {/* Mobile App Navigation Bar (hidden when exporting/printing PDF) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t bg-card/95 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around shadow-2xl print:hidden">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-bold transition-all",
                isActive
                  ? "text-black dark:text-white font-black bg-primary/10 border border-primary/20"
                  : "text-black dark:text-white opacity-80 hover:opacity-100"
              )}
            >
              <Icon className="h-4 w-4 text-black dark:text-white" />
              <span>{link.label.split(" ")[0]}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
