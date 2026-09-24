import { createClient } from "@/lib/supabase/server";
import { StudentNav } from "./student-nav";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let studentName = "Student";

  if (user) {
    const { data: person } = await supabase
      .from("people")
      .select("first_name, last_name")
      .eq("user_id", user.id)
      .maybeSingle();

    if (person) {
      studentName = `${person.first_name} ${person.last_name}`;
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <StudentNav studentName={studentName} />

      {/* Main Container with slow smooth fade-in animation and mobile bottom padding */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 pb-20 md:pb-8 animate-fade-in-slow">
        {children}
      </main>
    </div>
  );
}
