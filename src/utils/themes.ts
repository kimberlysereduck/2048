import type { ColorScheme, TileStyle } from '../types/game';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/** Built-in color palettes shipped with the game. */
export const PRESET_THEMES: ColorScheme[] = [
  {
    id: 'material-you',
    name: 'Material You (Android 14)',
    description: 'Dynamic tonal palette inspired by Google Android Material 3 design system.',
    accent: '#6750A4',
    background: '#141218',
    surface: '#1D1B20',
    surfaceVariant: '#2B2930',
    textPrimary: '#E6E0E9',
    textSecondary: '#CAC4D0',
    gridBackground: '#211F26',
    emptyCell: '#2B2930',
    defaultTileStyle: { bg: '#381E72', text: '#EADDFF', glow: '0 0 16px rgba(103,80,164,0.6)' },
    tileStyles: {
      2: { bg: '#EADDFF', text: '#21005D' },
      4: { bg: '#D0BCFF', text: '#381E72' },
      8: { bg: '#B69DF8', text: '#14003B' },
      16: { bg: '#9A82DB', text: '#FFFFFF' },
      32: { bg: '#7F67BE', text: '#FFFFFF' },
      64: { bg: '#6750A4', text: '#FFFFFF', glow: '0 0 10px rgba(103,80,164,0.4)' },
      128: { bg: '#5B4198', text: '#FFFFFF', glow: '0 0 12px rgba(103,80,164,0.5)' },
      256: { bg: '#4F378B', text: '#FFFFFF', glow: '0 0 14px rgba(103,80,164,0.6)' },
      512: { bg: '#381E72', text: '#EADDFF', glow: '0 0 16px rgba(154,130,219,0.7)' },
      1024: { bg: '#E8DEF8', text: '#1D192B', glow: '0 0 20px rgba(232,222,248,0.8)' },
      2048: { bg: '#FFD7F4', text: '#3B0736', glow: '0 0 24px rgba(255,183,235,0.9)' },
      4096: { bg: '#FFB2B6', text: '#410006', glow: '0 0 28px rgba(255,178,182,1.0)' },
    },
  },
  {
    id: 'classic-2048',
    name: 'Classic Warm',
    description: 'The iconic 2048 colorway with smooth beige tiles, warm terracotta, and golden milestones.',
    accent: '#EDC22E',
    background: '#FAF8EF',
    surface: '#FFFFFF',
    surfaceVariant: '#F4EFE6',
    textPrimary: '#776E65',
    textSecondary: '#8F7A66',
    gridBackground: '#BBADA0',
    emptyCell: '#CDC1B4',
    defaultTileStyle: { bg: '#3C3A32', text: '#F9F6F2', glow: '0 0 14px rgba(60,58,50,0.6)' },
    tileStyles: {
      2: { bg: '#EEE4DA', text: '#776E65' },
      4: { bg: '#EDE0C8', text: '#776E65' },
      8: { bg: '#F2B179', text: '#F9F6F2' },
      16: { bg: '#F59563', text: '#F9F6F2' },
      32: { bg: '#F67C5F', text: '#F9F6F2' },
      64: { bg: '#F65E3B', text: '#F9F6F2' },
      128: { bg: '#EDCF72', text: '#F9F6F2', glow: '0 0 10px rgba(237,207,114,0.5)' },
      256: { bg: '#EDCC61', text: '#F9F6F2', glow: '0 0 12px rgba(237,204,97,0.6)' },
      512: { bg: '#EDC850', text: '#F9F6F2', glow: '0 0 14px rgba(237,200,80,0.7)' },
      1024: { bg: '#EDC53F', text: '#F9F6F2', glow: '0 0 18px rgba(237,197,63,0.8)' },
      2048: { bg: '#EDC22E', text: '#F9F6F2', glow: '0 0 24px rgba(237,194,46,0.95)' },
      4096: { bg: '#3C3A32', text: '#F9F6F2', glow: '0 0 28px rgba(255,215,0,0.8)' },
    },
  },
  {
    id: 'cyberpunk-neon',
    name: 'Cyberpunk Neon',
    description: 'Electrifying dark synthwave vibe with neon pink, cyan laser, and glowing violet milestones.',
    accent: '#00F3FF',
    background: '#090812',
    surface: '#131124',
    surfaceVariant: '#1D1936',
    textPrimary: '#FFFFFF',
    textSecondary: '#A7A3CD',
    gridBackground: '#17132B',
    emptyCell: '#231D42',
    defaultTileStyle: { bg: '#00F3FF', text: '#090812', glow: '0 0 16px rgba(0,243,255,0.7)' },
    tileStyles: {
      2: { bg: '#2A1F52', text: '#E2D9FF' },
      4: { bg: '#402B78', text: '#F3EFFF' },
      8: { bg: '#6B21A8', text: '#FFFFFF', glow: '0 0 8px rgba(168,85,247,0.4)' },
      16: { bg: '#9333EA', text: '#FFFFFF', glow: '0 0 10px rgba(147,51,234,0.5)' },
      32: { bg: '#C026D3', text: '#FFFFFF', glow: '0 0 12px rgba(192,38,211,0.6)' },
      64: { bg: '#DB2777', text: '#FFFFFF', glow: '0 0 14px rgba(219,39,119,0.7)' },
      128: { bg: '#E11D48', text: '#FFFFFF', glow: '0 0 16px rgba(225,29,72,0.8)' },
      256: { bg: '#FF007F', text: '#FFFFFF', glow: '0 0 18px rgba(255,0,127,0.85)' },
      512: { bg: '#F59E0B', text: '#090812', glow: '0 0 20px rgba(245,158,11,0.9)' },
      1024: { bg: '#10B981', text: '#090812', glow: '0 0 22px rgba(16,185,129,0.9)' },
      2048: { bg: '#00F3FF', text: '#090812', glow: '0 0 26px rgba(0,243,255,1.0)' },
      4096: { bg: '#F43F5E', text: '#FFFFFF', glow: '0 0 30px rgba(244,63,94,1.0)' },
    },
  },
  {
    id: 'nordic-frost',
    name: 'Nordic Frost',
    description: 'Clean Scandinavian aesthetic with cool icy blues, polar teal, and slate elegance.',
    accent: '#38BDF8',
    background: '#0F172A',
    surface: '#1E293B',
    surfaceVariant: '#334155',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    gridBackground: '#1E293B',
    emptyCell: '#334155',
    defaultTileStyle: { bg: '#38BDF8', text: '#0F172A', glow: '0 0 14px rgba(56,189,248,0.7)' },
    tileStyles: {
      2: { bg: '#475569', text: '#F1F5F9' },
      4: { bg: '#64748B', text: '#F8FAFC' },
      8: { bg: '#0284C7', text: '#FFFFFF' },
      16: { bg: '#0369A1', text: '#FFFFFF' },
      32: { bg: '#0E7490', text: '#FFFFFF' },
      64: { bg: '#0D9488', text: '#FFFFFF' },
      128: { bg: '#14B8A6', text: '#0F172A', glow: '0 0 10px rgba(20,184,166,0.5)' },
      256: { bg: '#06B6D4', text: '#0F172A', glow: '0 0 12px rgba(6,182,212,0.6)' },
      512: { bg: '#0EA5E9', text: '#FFFFFF', glow: '0 0 15px rgba(14,165,233,0.7)' },
      1024: { bg: '#38BDF8', text: '#0F172A', glow: '0 0 20px rgba(56,189,248,0.85)' },
      2048: { bg: '#7DD3FC', text: '#0C4A6E', glow: '0 0 26px rgba(125,211,252,1.0)' },
      4096: { bg: '#E0F2FE', text: '#0369A1', glow: '0 0 30px rgba(224,242,254,1.0)' },
    },
  },
  {
    id: 'forest-emerald',
    name: 'Emerald Forest',
    description: 'Calming botanical tones from soft sage and deep moss to luminous jade.',
    accent: '#10B981',
    background: '#0B1A12',
    surface: '#13281D',
    surfaceVariant: '#1D3B2C',
    textPrimary: '#ECFDF5',
    textSecondary: '#A7F3D0',
    gridBackground: '#13281D',
    emptyCell: '#1E3B2D',
    defaultTileStyle: { bg: '#10B981', text: '#064E3B', glow: '0 0 16px rgba(16,185,129,0.7)' },
    tileStyles: {
      2: { bg: '#2D4A3B', text: '#D1FAE5' },
      4: { bg: '#385F4C', text: '#ECFDF5' },
      8: { bg: '#047857', text: '#FFFFFF' },
      16: { bg: '#059669', text: '#FFFFFF' },
      32: { bg: '#10B981', text: '#064E3B' },
      64: { bg: '#34D399', text: '#064E3B', glow: '0 0 10px rgba(52,211,153,0.4)' },
      128: { bg: '#6EE7B7', text: '#064E3B', glow: '0 0 12px rgba(110,231,183,0.5)' },
      256: { bg: '#A7F3D0', text: '#064E3B', glow: '0 0 14px rgba(167,243,208,0.6)' },
      512: { bg: '#FDE68A', text: '#78350F', glow: '0 0 16px rgba(253,230,138,0.7)' },
      1024: { bg: '#FBBF24', text: '#78350F', glow: '0 0 20px rgba(251,191,36,0.85)' },
      2048: { bg: '#F59E0B', text: '#451A03', glow: '0 0 26px rgba(245,158,11,1.0)' },
      4096: { bg: '#FCD34D', text: '#78350F', glow: '0 0 30px rgba(252,211,77,1.0)' },
    },
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    description: 'Warm twilight hues transitioning through apricot, fiery coral, vermilion, and magenta.',
    accent: '#F97316',
    background: '#181014',
    surface: '#261720',
    surfaceVariant: '#392130',
    textPrimary: '#FFF1F2',
    textSecondary: '#FECDD3',
    gridBackground: '#261720',
    emptyCell: '#3B2332',
    defaultTileStyle: { bg: '#F97316', text: '#FFFFFF', glow: '0 0 16px rgba(249,115,22,0.7)' },
    tileStyles: {
      2: { bg: '#4A283C', text: '#FFE4E6' },
      4: { bg: '#63324E', text: '#FFF1F2' },
      8: { bg: '#C2410C', text: '#FFFFFF' },
      16: { bg: '#EA580C', text: '#FFFFFF' },
      32: { bg: '#F97316', text: '#FFFFFF', glow: '0 0 8px rgba(249,115,22,0.4)' },
      64: { bg: '#FB923C', text: '#431407', glow: '0 0 10px rgba(251,146,60,0.5)' },
      128: { bg: '#E11D48', text: '#FFFFFF', glow: '0 0 12px rgba(225,29,72,0.6)' },
      256: { bg: '#F43F5E', text: '#FFFFFF', glow: '0 0 15px rgba(244,63,94,0.7)' },
      512: { bg: '#BE185D', text: '#FFFFFF', glow: '0 0 18px rgba(190,24,93,0.8)' },
      1024: { bg: '#831843', text: '#FCE7F3', glow: '0 0 20px rgba(131,24,67,0.9)' },
      2048: { bg: '#FDE047', text: '#713F12', glow: '0 0 26px rgba(253,224,71,1.0)' },
      4096: { bg: '#FEF08A', text: '#713F12', glow: '0 0 30px rgba(254,240,138,1.0)' },
    },
  },
  {
    id: 'midnight-amoled',
    name: 'Midnight AMOLED',
    description: 'Pure pitch black for battery optimization with high-contrast electric neon accents.',
    accent: '#3B82F6',
    background: '#000000',
    surface: '#0A0A0A',
    surfaceVariant: '#141414',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    gridBackground: '#121212',
    emptyCell: '#1C1C1E',
    defaultTileStyle: { bg: '#3B82F6', text: '#FFFFFF', glow: '0 0 16px rgba(59,130,246,0.8)' },
    tileStyles: {
      2: { bg: '#27272A', text: '#E4E4E7' },
      4: { bg: '#3F3F46', text: '#F4F4F5' },
      8: { bg: '#1D4ED8', text: '#FFFFFF' },
      16: { bg: '#2563EB', text: '#FFFFFF' },
      32: { bg: '#3B82F6', text: '#FFFFFF', glow: '0 0 10px rgba(59,130,246,0.5)' },
      64: { bg: '#60A5FA', text: '#0F172A', glow: '0 0 12px rgba(96,165,250,0.6)' },
      128: { bg: '#93C5FD', text: '#0F172A', glow: '0 0 14px rgba(147,197,253,0.7)' },
      256: { bg: '#A855F7', text: '#FFFFFF', glow: '0 0 16px rgba(168,85,247,0.75)' },
      512: { bg: '#C084FC', text: '#2E1065', glow: '0 0 18px rgba(192,132,252,0.85)' },
      1024: { bg: '#EC4899', text: '#FFFFFF', glow: '0 0 22px rgba(236,72,153,0.9)' },
      2048: { bg: '#22C55E', text: '#052E16', glow: '0 0 28px rgba(34,197,94,1.0)' },
      4096: { bg: '#4ADE80', text: '#052E16', glow: '0 0 32px rgba(74,222,128,1.0)' },
    },
  },
];

const CUSTOM_THEMES_KEY = '2048_custom_themes_v1';
const SELECTED_THEME_KEY = '2048_selected_theme_id';

/**
 * Loads user-created palettes from browser storage.
 *
 * @returns Stored custom palettes, or an empty array when storage is unavailable.
 */
export function getSavedCustomThemes(): ColorScheme[] {
  try {
    const raw = localStorage.getItem(CUSTOM_THEMES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Saves a custom palette, replacing any saved palette with the same id.
 *
 * @param theme - Palette to persist.
 */
export function saveCustomTheme(theme: ColorScheme): void {
  const existing = getSavedCustomThemes();
  const index = existing.findIndex((t) => t.id === theme.id);
  if (index >= 0) {
    existing[index] = { ...theme, isCustom: true };
  } else {
    existing.push({ ...theme, isCustom: true });
  }
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(existing));
}

/**
 * Removes a custom palette from browser storage.
 *
 * @param themeId - Identifier of the palette to remove.
 */
export function deleteCustomTheme(themeId: string): void {
  const existing = getSavedCustomThemes().filter((t) => t.id !== themeId);
  localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(existing));
}

/**
 * Reads the id of the currently selected palette.
 *
 * @returns The selected palette id, defaulting to the built-in Material You theme.
 */
export function getSelectedThemeId(): string {
  try {
    const id = localStorage.getItem(SELECTED_THEME_KEY);
    if (id) return id;
  } catch {}
  return PRESET_THEMES[0].id; // Default to Material You
}

/**
 * Persists the id of the currently selected palette.
 *
 * @param id - Palette identifier.
 */
export function setSelectedThemeId(id: string): void {
  try {
    localStorage.setItem(SELECTED_THEME_KEY, id);
  } catch {}
}

/**
 * Combines the built-in palettes with any saved custom palettes.
 *
 * @returns All palettes available to the user.
 */
export function getAllThemes(): ColorScheme[] {
  const custom = getSavedCustomThemes();
  return [...PRESET_THEMES, ...custom];
}

/**
 * Parses a JSON palette definition and fills in missing values from the default palette.
 *
 * @param rawJson - JSON text describing the custom palette.
 * @returns A normalized custom color scheme.
 * @throws An error when the input is invalid JSON or is not a JSON object.
 */
export function parseCustomPaletteJson(rawJson: string): ColorScheme {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Invalid JSON format. Please ensure valid syntax.');
  }

  if (!isRecord(parsed)) {
    throw new Error('Palette must be a JSON object.');
  }

  const getString = (value: unknown, fallback: string): string =>
    typeof value === 'string' ? value : fallback;
  const name = getString(parsed.name, 'Imported Palette').trim().slice(0, 30);
  const id = `custom_${Date.now()}`;
  const accent = getString(parsed.accent, '#6750A4');
  const background = getString(parsed.background, '#141218');
  const surface = getString(parsed.surface, '#1D1B20');
  const surfaceVariant = getString(parsed.surfaceVariant, '#2B2930');
  const textPrimary = getString(parsed.textPrimary, '#FFFFFF');
  const textSecondary = getString(parsed.textSecondary, '#A1A1AA');
  const gridBackground = getString(parsed.gridBackground, '#211F26');
  const emptyCell = getString(parsed.emptyCell, '#2B2930');

  const tileStyles: Record<number, TileStyle> = {};
  const values = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096];

  values.forEach((val) => {
    const tileStyle = isRecord(parsed.tileStyles) ? parsed.tileStyles[val] : undefined;
    if (isRecord(tileStyle)) {
      tileStyles[val] = {
        bg: getString(tileStyle.bg, '#381E72'),
        text: getString(tileStyle.text, '#FFFFFF'),
        glow: typeof tileStyle.glow === 'string' ? tileStyle.glow : undefined,
      };
    } else {
      tileStyles[val] = PRESET_THEMES[0].tileStyles[val];
    }
  });

  const importedDefaultStyle = isRecord(parsed.defaultTileStyle) ? parsed.defaultTileStyle : {};
  return {
    id,
    name,
    description: getString(parsed.description, 'Imported custom color palette.'),
    accent,
    background,
    surface,
    surfaceVariant,
    textPrimary,
    textSecondary,
    gridBackground,
    emptyCell,
    tileStyles,
    defaultTileStyle: {
      bg: getString(importedDefaultStyle.bg, PRESET_THEMES[0].defaultTileStyle.bg),
      text: getString(importedDefaultStyle.text, PRESET_THEMES[0].defaultTileStyle.text),
      glow: typeof importedDefaultStyle.glow === 'string' ? importedDefaultStyle.glow : undefined,
      fontSize: typeof importedDefaultStyle.fontSize === 'string' ? importedDefaultStyle.fontSize : undefined,
    },
    isCustom: true,
  };
}
