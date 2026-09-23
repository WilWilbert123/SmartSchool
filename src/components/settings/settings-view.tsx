"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor, CheckCircle, ShieldCheck, Bell, Building, Palette, Lock, AlertCircle, Loader2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSchoolSettings, updateSchoolSettings } from "@/features/settings/settings.actions";
import { ACCENT_COLORS, ACCENT_COLOR_CATEGORIES, applyAccentColor } from "@/lib/theme/accent-colors";

export function SettingsView() {
  const { setTheme, theme } = useTheme();
  const [activeTab, setActiveTab] = useState<"general" | "appearance" | "notifications" | "security">("appearance");

  // Toast / Status Message
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSavingGeneral, setIsSavingGeneral] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // General Settings State
  const [schoolName, setSchoolName] = useState("SmartSchool International Academy");
  const [schoolCode, setSchoolCode] = useState("SCH-2026-001");
  const [contactEmail, setContactEmail] = useState("admin@smartschool.edu");
  const [contactPhone, setContactPhone] = useState("+1 (555) 019-2831");
  const [address, setAddress] = useState("123 Education Blvd, Academic District");

  // Appearance State
  const [accentColor, setAccentColor] = useState("blue");

  // Notification Toggles State
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [announcementAlerts, setAnnouncementAlerts] = useState(true);
  const [attendanceAlerts, setAttendanceAlerts] = useState(true);
  const [gradeAlerts, setGradeAlerts] = useState(false);

  // Security Form State
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Fetch live school settings from Supabase on mount
  useEffect(() => {
    async function loadDbSettings() {
      setIsLoadingSettings(true);
      const data = await getSchoolSettings();
      if (data) {
        if (data.name) setSchoolName(data.name);
        if (data.code) setSchoolCode(data.code);
        if (data.email) setContactEmail(data.email);
        if (data.phone) setContactPhone(data.phone);
        if (data.address) setAddress(data.address);
      }
      setIsLoadingSettings(false);
    }
    loadDbSettings();

    const savedAccent = localStorage.getItem("smartschool_accent_color");
    if (savedAccent) {
      setAccentColor(savedAccent);
      applyAccentColor(savedAccent);
    }

    const savedNotifs = localStorage.getItem("smartschool_notif_settings");
    if (savedNotifs) {
      try {
        const parsed = JSON.parse(savedNotifs);
        setEmailAlerts(parsed.emailAlerts ?? true);
        setAnnouncementAlerts(parsed.announcementAlerts ?? true);
        setAttendanceAlerts(parsed.attendanceAlerts ?? true);
        setGradeAlerts(parsed.gradeAlerts ?? false);
      } catch (e) {}
    }
  }, []);

  const handleSelectAccent = (colorId: string) => {
    setAccentColor(colorId);
    applyAccentColor(colorId);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingGeneral(true);

    const res = await updateSchoolSettings({
      name: schoolName,
      code: schoolCode,
      email: contactEmail,
      phone: contactPhone,
      address,
    });

    setIsSavingGeneral(false);

    if (res.success) {
      showToast("General settings saved directly to database!");
    } else {
      alert("Failed to save to database: " + res.error);
    }
  };

  const handleSaveAppearance = () => {
    applyAccentColor(accentColor);
    showToast("Appearance theme & accent color saved!");
  };

  const handleSaveNotifications = () => {
    localStorage.setItem(
      "smartschool_notif_settings",
      JSON.stringify({ emailAlerts, announcementAlerts, attendanceAlerts, gradeAlerts })
    );
    showToast("Notification preferences updated!");
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordLoading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPasswordLoading(false);

    if (error) {
      setPasswordError(error.message);
    } else {
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully!");
    }
  };

  const showToast = (message: string) => {
    setSaveSuccess(message);
    setTimeout(() => {
      setSaveSuccess(null);
    }, 3500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Toast Banner */}
      {saveSuccess && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{saveSuccess}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("general")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "general"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building className="h-4 w-4" /> General
        </button>
        <button
          onClick={() => setActiveTab("appearance")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "appearance"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Palette className="h-4 w-4" /> Appearance
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "notifications"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="h-4 w-4" /> Notifications
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            activeTab === "security"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Lock className="h-4 w-4" /> Security
        </button>
      </div>

      {/* GENERAL TAB */}
      {activeTab === "general" && (
        <form onSubmit={handleSaveGeneral} className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-foreground">General School Information</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Manage your institution's profile and default contact details synced to Supabase database.
              </p>
            </div>
            {isLoadingSettings && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" /> Loading DB...
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                School Name
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                School Code / Registration ID
              </label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value)}
                className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Official Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Physical Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="submit"
              disabled={isSavingGeneral}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-50"
            >
              {isSavingGeneral ? "Saving to DB..." : "Save General Settings"}
            </button>
          </div>
        </form>
      )}

      {/* APPEARANCE TAB */}
      {activeTab === "appearance" && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-8">
          <div>
            <h2 className="text-lg font-semibold mb-1 text-foreground">Theme Preference</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Select your interface color theme mode.
            </p>
            <div className="grid grid-cols-3 gap-4 max-w-md">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${
                  theme === "light"
                    ? "border-primary ring-1 ring-primary bg-primary/5 text-primary"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <Sun className="h-6 w-6" />
                <span className="text-sm font-medium">Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${
                  theme === "dark"
                    ? "border-primary ring-1 ring-primary bg-primary/5 text-primary"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <Moon className="h-6 w-6" />
                <span className="text-sm font-medium">Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`flex flex-col items-center justify-center p-4 border rounded-xl gap-2 transition-all ${
                  theme === "system"
                    ? "border-primary ring-1 ring-primary bg-primary/5 text-primary"
                    : "hover:bg-muted/50 text-foreground"
                }`}
              >
                <Monitor className="h-6 w-6" />
                <span className="text-sm font-medium">System</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t space-y-4">
            <div>
              <h2 className="text-lg font-semibold mb-1 text-foreground">Accent Color Palette</h2>
              <p className="text-xs text-muted-foreground mb-4">
                Choose your primary highlight color scheme. Click any color circle to apply live.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3.5">
              {ACCENT_COLORS.map((col) => {
                const isSelected = accentColor === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    title={col.name}
                    onClick={() => handleSelectAccent(col.id)}
                    className={`h-11 w-11 rounded-full ${col.previewBg} flex items-center justify-center text-white transition-all shadow-sm ${
                      isSelected
                        ? "ring-4 ring-offset-2 ring-primary scale-110"
                        : "opacity-80 hover:opacity-100 hover:scale-105"
                    }`}
                  >
                    {isSelected && <Check className="h-5 w-5 stroke-[3]" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={handleSaveAppearance}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
            >
              Save Appearance
            </button>
          </div>
        </div>
      )}

      {/* NOTIFICATIONS TAB */}
      {activeTab === "notifications" && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Notification Preferences</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Control which system alerts and updates you receive.
            </p>
          </div>

          <div className="space-y-4 divide-y">
            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Email Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive email digests for key school updates and weekly reports.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-muted-foreground text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-foreground">High-Priority Announcements</p>
                <p className="text-xs text-muted-foreground">
                  Immediate pop-up notifications for urgent school announcements.
                </p>
              </div>
              <input
                type="checkbox"
                checked={announcementAlerts}
                onChange={(e) => setAnnouncementAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-muted-foreground text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Attendance Exception Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when student attendance falls below target thresholds.
                </p>
              </div>
              <input
                type="checkbox"
                checked={attendanceAlerts}
                onChange={(e) => setAttendanceAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-muted-foreground text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Grade Update Summaries</p>
                <p className="text-xs text-muted-foreground">
                  Receive notifications whenever quarterly grades are submitted.
                </p>
              </div>
              <input
                type="checkbox"
                checked={gradeAlerts}
                onChange={(e) => setGradeAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-muted-foreground text-primary focus:ring-primary accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t">
            <button
              type="button"
              onClick={handleSaveNotifications}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors"
            >
              Save Notification Preferences
            </button>
          </div>
        </div>
      )}

      {/* SECURITY TAB */}
      {activeTab === "security" && (
        <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Account Security</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update your account password and security settings.
            </p>
          </div>

          {passwordError && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-xl p-4 flex items-center gap-3 text-sm font-medium">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordUpdate} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1">
                Confirm New Password *
              </label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-background border h-10 rounded-xl px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="inline-flex items-center justify-center rounded-xl text-sm font-medium h-10 px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors disabled:opacity-50"
            >
              {passwordLoading ? "Updating..." : "Update Password"}
            </button>
          </form>

          <div className="pt-6 border-t space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> Session Security Status
            </div>
            <p className="text-xs text-muted-foreground">
              Your session is encrypted with SSL/TLS and authenticated via Supabase Row-Level Security.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
