import Link from "next/link";
import { GraduationCap, Award, Megaphone, CreditCard, ChevronRight, BookOpen, Sparkles, Calendar, ShieldCheck, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AnnouncementPopup } from "@/components/student/announcement-popup";

export default async function StudentDashboardPage() {
  const supabase = await createClient();

  // Get logged in user
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch Student profile info
  let studentInfo: any = null;
  let enrollments: any[] = [];
  let announcements: any[] = [];
  let recentGrades: any[] = [];

  if (user) {
    const { data: person } = await supabase
      .from("people")
      .select("id, first_name, last_name, profile_photo_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (person) {
      const { data: student } = await supabase
        .from("students")
        .select(`
          id, 
          student_number, 
          admission_date, 
          current_status,
          school:schools(name)
        `)
        .eq("person_id", person.id)
        .maybeSingle();

      if (student) {
        studentInfo = {
          ...student,
          first_name: person.first_name,
          last_name: person.last_name,
          profile_photo_url: person.profile_photo_url,
          full_name: `${person.first_name} ${person.last_name}`
        };

        // Fetch enrollments
        const { data: enr } = await supabase
          .from("class_enrollments")
          .select(`
            id,
            classes(grade_level, section_name, academic_years(name))
          `)
          .eq("student_id", student.id);
        
        enrollments = enr || [];

        // Fetch recent grades
        if (enrollments.length > 0) {
          const { data: gr } = await supabase
            .from("grades")
            .select(`
              id, quarter_1, quarter_2, quarter_3, quarter_4, final_grade, remarks,
              class_subjects(subjects(name, code))
            `)
            .in("enrollment_id", enrollments.map(e => e.id))
            .limit(5);

          recentGrades = gr || [];
        }
      }
    }

    // Fetch Published Announcements for STUDENTS or ALL
    const { data: ann } = await supabase
      .from("announcements")
      .select("*")
      .eq("status", "PUBLISHED")
      .or("audience.eq.ALL,audience.eq.STUDENTS")
      .order("created_at", { ascending: false })
      .limit(3);

    announcements = ann || [];
  }

  // Fallback demo data if user is viewing or database is empty
  if (announcements.length === 0) {
    announcements = [
      {
        id: "pop-ann-1",
        title: "1st Semester Final Examination Schedule Released",
        content: "Please check your exam schedules on the student bulletin. Make sure all library clearances are completed prior to examination week.",
        priority: "HIGH",
        created_at: new Date().toISOString()
      }
    ];
  }

  const displayName = studentInfo?.full_name || "Alex Rivera";
  const studentNum = studentInfo?.student_number || "STU-2024-001";
  const currentClass = enrollments[0]?.classes 
    ? `${enrollments[0].classes.grade_level.replace('_', ' ')} - ${enrollments[0].classes.section_name}`
    : "Grade 10 - STEM Alpha";

  // Calculate sample GWA
  const numericGrades = recentGrades.map(g => Number(g.final_grade)).filter(g => !isNaN(g) && g > 0);
  const averageGWA = numericGrades.length > 0 
    ? (numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length).toFixed(1)
    : "92.5";

  return (
    <div className="space-y-8 animate-fade-in-slow">
      {/* Announcement Popup Modal */}
      <AnnouncementPopup announcements={announcements} />

      {/* Welcome Banner - Clean solid background with high contrast text */}
      <div className="bg-card border text-card-foreground rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary dark:text-white text-xs font-bold">
              <Sparkles className="h-3.5 w-3.5 text-primary dark:text-white" />
              SmartSchool Student Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-black dark:text-white">
              Welcome back, {displayName}!
            </h1>
            <p className="text-sm text-black dark:text-white font-medium flex items-center gap-2">
              <span className="text-black dark:text-white font-semibold">{currentClass}</span>
              <span>•</span>
              <span className="font-mono text-primary dark:text-white font-bold">{studentNum}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <Link
              href="/student/grades"
              className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary/90 transition-colors flex items-center gap-2 shadow-xs"
            >
              <Award className="h-4 w-4" />
              View Report Card
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Stats Row - Pure White Text in Dark Mode, Pure Black in Light Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-black dark:text-white font-bold uppercase tracking-wider block">Academic Standing</span>
            <span className="text-2xl font-extrabold tracking-tight text-primary dark:text-white mt-1 block">Good Standing</span>
            <span className="text-[11px] text-black dark:text-white font-medium">Enrolled for A.Y. 2024-2025</span>
          </div>
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary dark:text-white font-bold">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-black dark:text-white font-bold uppercase tracking-wider block">Current Average (GWA)</span>
            <span className="text-2xl font-extrabold tracking-tight text-emerald-600 dark:text-emerald-400 mt-1 block">{averageGWA}</span>
            <span className="text-[11px] text-black dark:text-white font-medium">Across all enrolled subjects</span>
          </div>
          <div className="h-12 w-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-black dark:text-white font-bold uppercase tracking-wider block">Digital Student ID</span>
            <span className="text-sm font-extrabold tracking-tight text-black dark:text-white mt-1 block flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Verified Active
            </span>
            <span className="text-[11px] text-black dark:text-white font-medium">QR Verification Enabled</span>
          </div>
          <Link
            href="/student/id-card"
            className="h-12 w-12 bg-muted hover:bg-muted/80 rounded-2xl flex items-center justify-center text-black dark:text-white transition-colors"
          >
            <CreditCard className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* Grid: Announcements & Quick Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Feed: Announcements */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-black dark:text-white">
              <Megaphone className="h-5 w-5 text-primary dark:text-white" />
              School Announcements & Bulletin
            </h2>
            <Link
              href="/student/announcements"
              className="text-xs font-bold text-primary dark:text-white hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-card border rounded-2xl p-6 text-center text-black dark:text-white text-sm space-y-2 shadow-xs">
              <p className="font-bold text-black dark:text-white">Welcome to the Student Bulletin</p>
              <p className="text-xs text-black dark:text-white">No active announcements posted for students today. Check back regularly for school updates.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-card border rounded-2xl p-6 shadow-xs space-y-2 hover:border-primary/40 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary dark:text-white text-[10px] font-bold uppercase tracking-wider border border-primary/20">
                      {ann.priority || "NOTICE"}
                    </span>
                    <span className="text-xs text-black dark:text-white font-bold flex items-center gap-1 font-mono">
                      <Calendar className="h-3 w-3" />
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-black dark:text-white">{ann.title}</h3>
                  <p className="text-xs sm:text-sm text-black dark:text-white line-clamp-3 leading-relaxed font-medium">
                    {ann.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar: Digital ID Card Widget & Quick Subject Preview */}
        <div className="space-y-6">
          {/* Digital ID Card Preview */}
          <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-sm flex items-center gap-2 text-black dark:text-white">
                <CreditCard className="h-4 w-4 text-primary dark:text-white" />
                Digital Student ID Card
              </h3>
              <Link href="/student/id-card" className="text-xs font-bold text-primary dark:text-white hover:underline">
                View Full ID
              </Link>
            </div>

            <div className="bg-muted/60 text-black dark:text-white rounded-xl p-4 space-y-3 relative overflow-hidden border">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary dark:text-white" />
                  <span className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">SmartSchool</span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono font-bold">
                  ACTIVE
                </span>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-black dark:text-white block uppercase font-bold">CARD HOLDER</span>
                <span className="text-sm font-bold text-black dark:text-white block">{displayName}</span>
                <span className="text-[11px] text-black dark:text-white font-mono font-bold block mt-0.5">ID: {studentNum}</span>
              </div>
            </div>
          </div>

          {/* Quick Grades List */}
          <div className="bg-card border rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="font-bold text-sm flex items-center gap-2 text-black dark:text-white">
                <BookOpen className="h-4 w-4 text-primary dark:text-white" />
                Recent Grades
              </h3>
              <Link href="/student/grades" className="text-xs font-bold text-primary dark:text-white hover:underline">
                All Subjects
              </Link>
            </div>

            <div className="space-y-2.5">
              {recentGrades.length === 0 ? (
                <div className="text-xs text-black dark:text-white font-medium text-center py-4">
                  Visit the Grades section to review posted subject marks.
                </div>
              ) : (
                recentGrades.map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-xs p-2 rounded-lg bg-muted/40">
                    <span className="font-bold text-black dark:text-white">{g.class_subjects?.subjects?.name || "Subject"}</span>
                    <span className="font-mono font-bold text-primary dark:text-white">{g.final_grade || "Pending"}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
