// Cultural color palette inspired by flow2.md
export const Colors = {
  primaryOchre: "#d4a574",
  deepEarth: "#8b4513",
  riverBlue: "#4a90a4",
  sunsetRed: "#cc6b49",
  warmWhite: "#fef7f0",
  softGrey: "#f5f5f0",
  textDark: "#2d2d2a",
  textMedium: "#5d5d5a",
  successGreen: "#4a7c59",
  warningAmber: "#e6b800",
  errorClay: "#b85450",
};

export type Theme = {
  background: string;
  card: string;
  text: string;
  textSecondary: string;
  tint: string;
  border: string;
  danger: string;
  success: string;
};

export const LightTheme: Theme = {
  background: Colors.warmWhite,
  card: Colors.softGrey,
  text: Colors.textDark,
  textSecondary: Colors.textMedium,
  tint: Colors.primaryOchre,
  border: "#e8e3db",
  danger: Colors.sunsetRed,
  success: Colors.successGreen,
};
