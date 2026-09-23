export interface AccentColor {
  id: string;
  name: string;
  category: string;
  previewBg: string;
  primaryValue: string; // OKLCH color string
}

export const ACCENT_COLOR_CATEGORIES = [
  "Sleek & Modern",
  "Vibrant & Energetic",
  "Warm & Warm-Neutral",
  "Earthy & Muted",
];

export const ACCENT_COLORS: AccentColor[] = [
  // Sleek & Modern
  {
    id: "electric_indigo",
    name: "Electric Indigo",
    category: "Sleek & Modern",
    previewBg: "bg-indigo-600",
    primaryValue: "oklch(0.5 0.25 280)",
  },
  {
    id: "teal_mint",
    name: "Teal Mint",
    category: "Sleek & Modern",
    previewBg: "bg-teal-500",
    primaryValue: "oklch(0.6 0.18 175)",
  },
  {
    id: "nordic_blue",
    name: "Nordic Blue",
    category: "Sleek & Modern",
    previewBg: "bg-sky-600",
    primaryValue: "oklch(0.55 0.18 230)",
  },
  {
    id: "obsidian_slate",
    name: "Obsidian Slate",
    category: "Sleek & Modern",
    previewBg: "bg-slate-800",
    primaryValue: "oklch(0.35 0.05 260)",
  },

  // Vibrant & Energetic
  {
    id: "crimson_red",
    name: "Crimson Red",
    category: "Vibrant & Energetic",
    previewBg: "bg-red-600",
    primaryValue: "oklch(0.55 0.25 25)",
  },
  {
    id: "neon_lime",
    name: "Neon Lime",
    category: "Vibrant & Energetic",
    previewBg: "bg-lime-500",
    primaryValue: "oklch(0.7 0.25 130)",
  },
  {
    id: "coral_reef",
    name: "Coral Reef",
    category: "Vibrant & Energetic",
    previewBg: "bg-orange-500",
    primaryValue: "oklch(0.65 0.22 35)",
  },
  {
    id: "electric_magenta",
    name: "Electric Magenta",
    category: "Vibrant & Energetic",
    previewBg: "bg-fuchsia-600",
    primaryValue: "oklch(0.55 0.28 330)",
  },

  // Warm & Warm-Neutral
  {
    id: "warm_terracotta",
    name: "Warm Terracotta",
    category: "Warm & Warm-Neutral",
    previewBg: "bg-amber-700",
    primaryValue: "oklch(0.55 0.18 45)",
  },
  {
    id: "burnt_copper",
    name: "Burnt Copper",
    category: "Warm & Warm-Neutral",
    previewBg: "bg-orange-800",
    primaryValue: "oklch(0.5 0.2 55)",
  },
  {
    id: "desert_sand",
    name: "Desert Sand",
    category: "Warm & Warm-Neutral",
    previewBg: "bg-amber-600",
    primaryValue: "oklch(0.65 0.12 75)",
  },

  // Earthy & Muted
  {
    id: "sage_green",
    name: "Sage Green",
    category: "Earthy & Muted",
    previewBg: "bg-emerald-700",
    primaryValue: "oklch(0.6 0.12 140)",
  },
  {
    id: "olive_drab",
    name: "Olive Drab",
    category: "Earthy & Muted",
    previewBg: "bg-lime-800",
    primaryValue: "oklch(0.5 0.14 110)",
  },
  {
    id: "smokey_quartz",
    name: "Smokey Quartz",
    category: "Earthy & Muted",
    previewBg: "bg-stone-600",
    primaryValue: "oklch(0.45 0.08 60)",
  },
];

export function applyAccentColor(colorId: string) {
  if (typeof window === "undefined") return;

  const color = ACCENT_COLORS.find((c) => c.id === colorId) || ACCENT_COLORS[0];
  const root = document.documentElement;

  root.style.setProperty("--primary", color.primaryValue);
  root.style.setProperty("--sidebar-primary", color.primaryValue);
  root.style.setProperty("--sidebar-accent-foreground", color.primaryValue);
  root.style.setProperty("--ring", color.primaryValue);

  localStorage.setItem("smartschool_accent_color", color.id);
}
