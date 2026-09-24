"use client";

import { useState, useEffect } from "react";
import { Megaphone, X, CheckCircle2, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority?: string;
  created_at: string;
}

interface AnnouncementPopupProps {
  announcements: Announcement[];
}

export function AnnouncementPopup({ announcements }: AnnouncementPopupProps) {
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (announcements && announcements.length > 0) {
      const latest = announcements[0];
      const dismissedKey = `dismissed_announcement_${latest.id}`;
      const isDismissed = sessionStorage.getItem(dismissedKey);

      if (!isDismissed) {
        setActiveAnnouncement(latest);
        // Slight delay for smooth entrance effect after page load
        const timer = setTimeout(() => {
          setIsOpen(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, [announcements]);

  const handleDismiss = () => {
    if (activeAnnouncement) {
      sessionStorage.setItem(`dismissed_announcement_${activeAnnouncement.id}`, "true");
    }
    setIsOpen(false);
  };

  if (!isOpen || !activeAnnouncement) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-300 print:hidden">
      <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full relative shadow-2xl space-y-5 animate-in zoom-in-95 duration-300">
        {/* Close Icon */}
        <button
          onClick={handleDismiss}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors"
          aria-label="Close Announcement"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Top Header Badge */}
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-2xl bg-primary/10 text-primary font-bold">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                School Announcement
              </span>
              <span className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono border",
                activeAnnouncement.priority === 'HIGH' || activeAnnouncement.priority === 'URGENT'
                  ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
              )}>
                {activeAnnouncement.priority || "NOTICE"}
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono mt-0.5">
              <Calendar className="h-3 w-3" />
              {new Date(activeAnnouncement.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Title & Body */}
        <div className="space-y-2 pt-1 border-t">
          <h3 className="text-lg font-bold text-foreground leading-snug">
            {activeAnnouncement.title}
          </h3>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed max-h-48 overflow-y-auto pr-1 whitespace-pre-line">
            {activeAnnouncement.content}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleDismiss}
            className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-all flex items-center gap-2 shadow-xs"
          >
            <CheckCircle2 className="h-4 w-4" />
            I Understand / Got It
          </button>
        </div>
      </div>
    </div>
  );
}
