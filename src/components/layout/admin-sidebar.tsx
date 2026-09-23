"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, GraduationCap, LayoutDashboard, Settings, FileText, BookOpen, CalendarCheck, FileBadge } from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Teachers", href: "/admin/teachers", icon: GraduationCap },
    { name: "Classes", href: "/admin/classes", icon: BookOpen },
    { name: "Subjects", href: "/admin/subjects", icon: FileText },
    { name: "Attendance", href: "/admin/attendance", icon: CalendarCheck },
    { name: "Grades", href: "/admin/grades", icon: FileBadge },
    { name: "Exams", href: "/admin/exams", icon: FileText },
    { name: "Announcements", href: "/admin/announcements", icon: FileText },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 border-r bg-card hidden md:flex flex-col h-full shrink-0 shadow-sm">
      <div className="h-20 flex items-center px-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
            <GraduationCap className="h-6 w-6" />
          </div>
          <span className="font-bold tracking-tight text-xl text-foreground">SmartSchool</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        <ul className="space-y-1.5 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin");
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon className={`h-[18px] w-[18px] ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                  {item.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 mt-auto">
        <div className="flex items-center gap-2 px-2 text-xs text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span>Online</span>
        </div>
        <div className="px-2 text-[10px] text-muted-foreground/60 mt-1">Real-time data</div>
      </div>
    </aside>
  );
}
