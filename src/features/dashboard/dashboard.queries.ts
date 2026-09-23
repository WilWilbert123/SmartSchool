import { createClient } from "@/lib/supabase/server";

export async function getDashboardStats() {
  const supabase = await createClient();

  // We run these queries in parallel for performance
  const [
    studentsRes,
    teachersRes,
    classesRes,
    recentStudentsRes,
    recentClassesRes
  ] = await Promise.all([
    supabase.from("students").select("id", { count: "exact", head: true }),
    supabase.from("teachers").select("id", { count: "exact", head: true }),
    supabase.from("classes").select("id", { count: "exact", head: true }),
    
    // Fetch recent 5 students
    supabase
      .from("students")
      .select(`
        id,
        created_at,
        people (
          first_name,
          last_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5),

    // Fetch upcoming/recent classes
    supabase
      .from("classes")
      .select(`
        id,
        section_name,
        grade_level,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(3)
  ]);

  return {
    totalStudents: studentsRes.count || 0,
    totalTeachers: teachersRes.count || 0,
    totalClasses: classesRes.count || 0,
    recentStudents: recentStudentsRes.data || [],
    recentClasses: recentClassesRes.data || []
  };
}
