import { Users, GraduationCap, Calendar, Users2, TrendingUp, CalendarDays, CheckCircle2, MessageSquare, FileText, Download, Upload, BookOpen } from "lucide-react";
import { getDashboardStats } from "@/features/dashboard/dashboard.queries";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/server";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const stats = await getDashboardStats();

  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, MMMM dd, yyyy");
  const formattedTime = format(currentDate, "hh:mm a");

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Welcome back, {user?.email}! Here is your real-time school overview.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium">{formattedDate}</p>
          <p className="text-2xl font-bold text-muted-foreground flex items-center justify-end gap-2">
            {formattedTime} <CalendarDays className="h-5 w-5 text-muted-foreground/50" />
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-6 bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-4">
            <div className="h-12 w-12 rounded-xl bg-blue-500 text-white flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Students</p>
              <h2 className="text-3xl font-bold mt-1">{stats.totalStudents}</h2>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-4">
            <div className="h-12 w-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Teachers</p>
              <h2 className="text-3xl font-bold mt-1">{stats.totalTeachers}</h2>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md">
          <div className="flex flex-col gap-4">
            <div className="h-12 w-12 rounded-xl bg-purple-500 text-white flex items-center justify-center">
              <Users2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Classes</p>
              <h2 className="text-3xl font-bold mt-1">{stats.totalClasses}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent Students */}
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Recently Enrolled Students
            </h3>
            <Link href="/admin/students" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          
          {stats.recentStudents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
              No students enrolled yet.
            </div>
          ) : (
            <div className="space-y-6">
              {stats.recentStudents.map((student: any) => (
                <div key={student.id} className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 bg-blue-500/10 text-blue-500">
                    <Users className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium leading-none mb-1 text-foreground">
                      {student.people?.first_name} {student.people?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">New Student Registration</p>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(student.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Created Classes */}
        <div className="bg-card rounded-2xl border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-purple-500" />
              Recently Added Classes
            </h3>
            <Link href="/admin/classes" className="text-sm text-primary hover:underline font-medium">View All</Link>
          </div>
          
          {stats.recentClasses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed rounded-xl">
              No classes created yet.
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentClasses.map((cls: any) => (
                <div key={cls.id} className="flex items-center gap-4 p-3 rounded-xl border border-transparent hover:border-border hover:bg-muted/50 transition-colors cursor-pointer">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-purple-500/10 text-purple-500">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-none mb-1 text-foreground">{cls.grade_level.replace('_', ' ')} - {cls.section_name}</p>
                    <p className="text-xs text-muted-foreground">Created {formatDistanceToNow(new Date(cls.created_at), { addSuffix: true })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-2xl border shadow-sm p-6">
        <h3 className="font-semibold text-lg mb-6">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/students" className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border hover:bg-muted/50 transition-colors text-center group">
            <div className="bg-emerald-500/10 text-emerald-500 p-3 rounded-xl group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Manage Students</span>
          </Link>
          
          <Link href="/admin/students/import" className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border hover:bg-muted/50 transition-colors text-center group">
            <div className="bg-purple-500/10 text-purple-500 p-3 rounded-xl group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Upload className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Bulk Import</span>
          </Link>
          
          <Link href="/admin/grades" className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border hover:bg-muted/50 transition-colors text-center group">
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-xl group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Verify Grades</span>
          </Link>
          
          <Link href="/admin/ids" className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl border hover:bg-muted/50 transition-colors text-center group">
            <div className="bg-orange-500/10 text-orange-500 p-3 rounded-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <FileText className="h-5 w-5" />
            </div>
            <span className="text-sm font-medium">Print IDs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
