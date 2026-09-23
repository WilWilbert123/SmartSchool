"use client";

import { useEffect, useState, useRef } from "react";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { SyncStatus } from "@/components/sync/sync-status";
import { GlobalSearch } from "@/components/layout/global-search";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function AdminHeader() {
  const [userEmail, setUserEmail] = useState<string>("Admin");
  const [userRole, setUserRole] = useState<string>("School Admin");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserEmail(data.user.email || "Admin");
        const role = data.user.user_metadata?.role || "ADMIN";
        setUserRole(role === "ADMIN" ? "School Admin" : role);
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin-login");
  };

  const displayName = userEmail.includes("@") ? userEmail.split("@")[0] : userEmail;

  return (
    <header className="h-20 border-b bg-background flex items-center px-8 justify-between sticky top-0 z-10 shadow-sm">
      <div className="flex items-center gap-4 flex-1">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-4">
        <SyncStatus />

        <button
          aria-label="Notifications"
          className="relative text-muted-foreground hover:text-foreground h-9 w-9 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
        >
          <Bell className="h-[1.2rem] w-[1.2rem]" />
          <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive border-2 border-background" />
        </button>

        <ThemeToggle />

        {/* User Profile Dropdown */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 pl-2 border-l ml-2 cursor-pointer focus:outline-none"
          >
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary overflow-hidden">
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0D8ABC&color=fff`}
                alt={displayName}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="hidden md:block text-sm text-left">
              <p className="font-semibold leading-none text-foreground capitalize">{displayName}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{userRole}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground hidden md:block" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 z-50 bg-card border rounded-2xl w-56 shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
              <div className="p-3 border-b mb-1">
                <p className="text-xs text-muted-foreground">Signed in as</p>
                <p className="text-sm font-bold text-foreground truncate">{userEmail}</p>
              </div>

              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push("/admin/settings");
                }}
                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-muted/50 flex items-center gap-2 text-foreground transition-colors"
              >
                <Settings className="h-4 w-4 text-muted-foreground" /> Settings
              </button>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 rounded-xl text-sm hover:bg-rose-500/10 text-rose-600 flex items-center gap-2 transition-colors font-medium"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
