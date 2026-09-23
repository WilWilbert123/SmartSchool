"use client";

import { useState } from "react";
import { Search, Plus, Trash2, Megaphone, AlertTriangle, Bell, Eye, Layers } from "lucide-react";
import { Announcement } from "@/features/announcements/announcement.types";
import { createAnnouncement, deleteAnnouncement, updateAnnouncementStatus } from "@/features/announcements/announcement.actions";
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog";

interface AnnouncementTableProps {
  initialAnnouncements: Announcement[];
}

export function AnnouncementTable({ initialAnnouncements }: AnnouncementTableProps) {
  const [items, setItems] = useState<Announcement[]>(initialAnnouncements);
  const [searchTerm, setSearchTerm] = useState("");
  const [audienceFilter, setAudienceFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [audience, setAudience] = useState<Announcement["audience"]>("ALL");
  const [priority, setPriority] = useState<Announcement["priority"]>("NORMAL");
  const [status, setStatus] = useState<Announcement["status"]>("PUBLISHED");

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAudience = audienceFilter === "ALL" || item.audience === audienceFilter;
    const matchesPriority = priorityFilter === "ALL" || item.priority === priorityFilter;

    return matchesSearch && matchesAudience && matchesPriority;
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    const res = await createAnnouncement({
      title,
      content,
      audience,
      priority,
      status,
    });

    setIsSubmitting(false);

    if (res.success) {
      setIsAddModalOpen(false);
      setTitle("");
      setContent("");
      setAudience("ALL");
      setPriority("NORMAL");
      setStatus("PUBLISHED");
      window.location.reload();
    } else {
      alert("Failed to create announcement: " + res.error);
    }
  };

  const handleStatusChange = async (id: string, newStatus: Announcement["status"]) => {
    const res = await updateAnnouncementStatus(id, newStatus);
    if (res.success) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
    } else {
      alert("Failed to update status: " + res.error);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const res = await deleteAnnouncement(deletingId);
    if (res.success) {
      setItems((prev) => prev.filter((item) => item.id !== deletingId));
    } else {
      alert("Failed to delete announcement: " + res.error);
    }
    setDeletingId(null);
  };

  const getPriorityBadge = (priority: Announcement["priority"]) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500/10 text-rose-600 border-rose-500/20";
      case "HIGH":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "NORMAL":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "LOW":
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
      default:
        return "bg-gray-500/10 text-gray-600";
    }
  };

  const getAudienceBadge = (audience: Announcement["audience"]) => {
    switch (audience) {
      case "STUDENTS":
        return "bg-emerald-500/10 text-emerald-600";
      case "TEACHERS":
        return "bg-purple-500/10 text-purple-600";
      case "PARENTS":
        return "bg-indigo-500/10 text-indigo-600";
      default:
        return "bg-slate-500/10 text-slate-600";
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search announcements..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-background border h-10 rounded-xl pl-10 pr-4 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>

          <select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            className="bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="ALL">All Audiences</option>
            <option value="STUDENTS">Students Only</option>
            <option value="TEACHERS">Teachers Only</option>
            <option value="PARENTS">Parents Only</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="NORMAL">Normal</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" /> Post Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredItems.length === 0 ? (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground">
            <Megaphone className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium text-foreground">No announcements found</p>
            <p className="text-xs text-muted-foreground mt-1">
              Click "Post Announcement" to publish a new school bulletin.
            </p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-card border rounded-2xl p-5 shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getPriorityBadge(
                      item.priority
                    )}`}
                  >
                    {item.priority}
                  </span>
                  <span
                    className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getAudienceBadge(
                      item.audience
                    )}`}
                  >
                    Target: {item.audience}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.status}
                    onChange={(e) =>
                      handleStatusChange(item.id, e.target.value as Announcement["status"])
                    }
                    className="text-xs font-semibold px-2 py-1 rounded-lg border bg-background"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>

                  <button
                    onClick={() => setDeletingId(item.id)}
                    className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg transition-colors"
                    title="Delete Announcement"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line mt-1">
                  {item.content}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-bold text-foreground">Post New Announcement</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. End of Semester Parent-Teacher Conference"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">
                  Content / Details *
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write the full announcement message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-background border rounded-xl p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Audience
                  </label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value as Announcement["audience"])}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="ALL">Everyone</option>
                    <option value="STUDENTS">Students</option>
                    <option value="TEACHERS">Teachers</option>
                    <option value="PARENTS">Parents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Announcement["priority"])}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="LOW">Low</option>
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Announcement["status"])}
                    className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Publish Announcement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement? This action cannot be undone."
      />
    </div>
  );
}
