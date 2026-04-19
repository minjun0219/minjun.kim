export const THEME_STORAGE_KEY = "theme";

export const THEME_CYCLE = ["system", "light", "dark"] as const;

export type Theme = (typeof THEME_CYCLE)[number];
