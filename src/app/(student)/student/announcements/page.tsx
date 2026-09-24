import { createClient } from "@/lib/supabase/server";
import { Megaphone, Calendar, Sparkles, Bell } from "lucide-react";

export default async function StudentAnnouncementsPage() {
  const supabase = await createClient();

  const { data: annData } = await supabase
    .from("announcements")
    .select("*")
    .eq("status", "PUBLISHED")
    .or("audience.eq.ALL,audience.eq.STUDENTS")
    .order("created_at", { ascending: false });

  let announcements = annData || [];

  // Fallback demo announcements if none posted in database
  if (announcements.length === 0) {
    announcements = [
      {
        id: "ann-1",
        title: "Upcoming 1st Semester Final Examinations Schedule",
        content: "Please be advised that the 1st Semester Final Examinations for A.Y. 2024-2025 will be held on October 15-18, 2024. All students are advised to clear their library accounts and secure examination permits prior to the exam dates.",
        priority: "HIGH",
        created_at: "2024-09-20T08:00:00Z"
      },
      {
        id: "ann-2",
        title: "Annual STEM & Robotics Innovation Fair 2024",
        content: "SmartSchool is proud to host the annual Innovation Fair! Submissions for project entries are now open for Grade 9 through Grade 12 students. Prizes include school scholarships and regional competition entries.",
        priority: "NORMAL",
        created_at: "2024-09-18T10:30:00Z"
      },
      {
        id: "ann-3",
        title: "Updated Digital ID Verification Protocol",
        content: "All registered students can now access their official Digital Student ID Card with cryptographic QR code verification directly inside the Student Portal. Physical cards and digital QR payloads are synchronized in real-time.",
        priority: "NORMAL",
        created_at: "2024-09-15T14:15:00Z"
      }
    ];
  }

  return (
    <div className="space-y-6 animate-fade-in-slow">
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Megaphone className="h-6 w-6 text-primary" />
          School Announcements & Student Bulletin
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Stay updated with official school notices, exam schedules, and campus events.
        </p>
      </div>

      <div className="space-y-4">
        {announcements.map((ann) => (
          <div key={ann.id} className="bg-card border rounded-2xl p-6 shadow-xs space-y-3 hover:border-primary/40 transition-colors">
            <div className="flex items-center justify-between gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                ann.priority === 'HIGH' || ann.priority === 'URGENT' 
                  ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' 
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                {ann.priority || "NOTICE"}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                <Calendar className="h-3.5 w-3.5" />
                {new Date(ann.created_at).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>

            <h2 className="text-lg font-bold text-foreground">{ann.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {ann.content}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
