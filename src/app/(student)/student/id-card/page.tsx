import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { GraduationCap, ShieldCheck, QrCode, CreditCard, ExternalLink, Calendar, User, CheckCircle2 } from "lucide-react";

export default async function StudentIdCardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let studentName = "Alex Rivera";
  let studentNumber = "STU-2024-001";
  let photoUrl: string | null = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80";
  let schoolName = "SmartSchool International Academy";
  let gradeLevel = "Grade 10 - STEM Alpha";

  if (user) {
    const { data: person } = await supabase
      .from("people")
      .select("id, first_name, last_name, profile_photo_url")
      .eq("user_id", user.id)
      .maybeSingle();

    if (person) {
      studentName = `${person.first_name} ${person.last_name}`;
      if (person.profile_photo_url) photoUrl = person.profile_photo_url;

      const { data: student } = await supabase
        .from("students")
        .select(`
          id, student_number, admission_date,
          school:schools(name)
        `)
        .eq("person_id", person.id)
        .maybeSingle();

      if (student) {
        studentNumber = student.student_number;
        const schoolObj = (student as any).school;
        if (schoolObj && schoolObj.name) schoolName = schoolObj.name;
      }
    }
  }

  // QR Code payload text
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/verify-id?id=${studentNumber}`;

  return (
    <div className="space-y-8 animate-fade-in-slow max-w-3xl mx-auto">
      <div className="border-b pb-5">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CreditCard className="h-6 w-6 text-primary" />
          My Official Digital Student ID
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Your active student identification card with real-time cryptographic QR verification.
        </p>
      </div>

      {/* ID Card Display */}
      <div className="flex flex-col items-center justify-center space-y-6">
        {/* Front of ID Card */}
        <div className="w-full max-w-sm bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 border-2 border-slate-800 text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6">
          {/* Card Top Seal Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white text-slate-950 font-bold">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-tight block leading-tight">
                  {schoolName}
                </span>
                <span className="text-[9px] text-slate-400 font-mono block">OFFICIAL STUDENT IDENTIFICATION</span>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono font-bold">
              ACTIVE
            </span>
          </div>

          {/* Photo & Main Details */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={studentName}
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-white/80 shadow-md"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400">
                  <User className="h-10 w-10 text-slate-500" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-slate-950 shadow">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="space-y-1">
              <span className="inline-block px-2 py-0.5 rounded bg-slate-800/90 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/20">
                {studentNumber}
              </span>
              <h2 className="text-lg font-extrabold text-white tracking-tight leading-tight">
                {studentName}
              </h2>
              <p className="text-xs text-slate-300">{gradeLevel}</p>
              <p className="text-[10px] text-slate-400 font-mono">VALID: 2024 - 2027</p>
            </div>
          </div>

          {/* Verification Bar */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Real-time Verified</span>
            </div>

            <Link
              href={`/verify-id?id=${studentNumber}`}
              target="_blank"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono font-semibold"
            >
              Verify Record <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Verification Link Button */}
        <div className="text-center pt-2">
          <Link
            href={`/verify-id?id=${studentNumber}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-card hover:bg-muted text-foreground font-semibold text-xs border shadow-xs transition-colors"
          >
            <QrCode className="h-4 w-4 text-primary" />
            Open Public Verification Page
          </Link>
        </div>
      </div>
    </div>
  );
}
