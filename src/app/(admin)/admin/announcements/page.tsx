import { getAnnouncements } from "@/features/announcements/announcement.actions";
import { AnnouncementTable } from "@/components/announcements/announcement-table";
import { Megaphone } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AnnouncementsPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Megaphone className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Announcements & Bulletins</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage school-wide announcements for students, teachers, and parents.
            </p>
          </div>
        </div>
      </div>

      <AnnouncementTable initialAnnouncements={announcements || []} />
    </div>
  );
}
