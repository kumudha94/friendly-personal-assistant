export const colors = {
  background: "#08090D",
  surface: "#111318",
  elevatedSurface: "#181B22",
  border: "#232631",

  textPrimary: "#F5F7FA",
  textSecondary: "#9AA0AA",
  textMuted: "#656B76",

  accent: "#4f46e5",
  accentSoft: "#1D1B3A",

  error: "#f87171",
  errorSoft: "#3A1F1F",
  success: "#4ade80",
  warning: "#fbbf24",

  water: "#38bdf8",
  cycle: "#f472b6",
} as const;

export const typography = {
  hero: { fontSize: 34, fontWeight: "700" as const },
  screenTitle: { fontSize: 28, fontWeight: "700" as const },
  sectionTitle: { fontSize: 21, fontWeight: "600" as const },
  body: { fontSize: 16, fontWeight: "400" as const },
  secondary: { fontSize: 13.5, fontWeight: "400" as const },
  caption: { fontSize: 12.5, fontWeight: "500" as const },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const radius = {
  control: 12,
  card: 18,
  surface: 24,
  sheet: 32,
};

// Extra bottom clearance scrollable/fixed screens need so their last content
// doesn't render underneath the globally-floating MiloBar pill.
export const MILO_BAR_CLEARANCE = 88;
