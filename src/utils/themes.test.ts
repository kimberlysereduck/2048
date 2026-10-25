import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  deleteCustomTheme,
  getAllThemes,
  getSavedCustomThemes,
  getSelectedThemeId,
  parseCustomPaletteJson,
  saveCustomTheme,
  setSelectedThemeId,
} from './themes';
import { PRESET_THEMES } from './themes';

function installLocalStorage(): void {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, String(value)),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  });
}

describe('theme storage', () => {
  beforeEach(installLocalStorage);

  it('starts with preset themes and appends saved custom themes', () => {
    const customTheme = { ...PRESET_THEMES[0], id: 'custom_saved', isCustom: true };
    saveCustomTheme(customTheme);

    expect(getSavedCustomThemes()).toEqual([customTheme]);
    expect(getAllThemes()).toEqual([...PRESET_THEMES, customTheme]);
  });

  it('replaces a theme with the same id and deletes it by id', () => {
    const customTheme = { ...PRESET_THEMES[0], id: 'custom_saved', name: 'First' };
    saveCustomTheme(customTheme);
    saveCustomTheme({ ...customTheme, name: 'Updated' });

    expect(getSavedCustomThemes()).toHaveLength(1);
    expect(getSavedCustomThemes()[0].name).toBe('Updated');

    deleteCustomTheme(customTheme.id);
    expect(getSavedCustomThemes()).toEqual([]);
  });

  it('stores and retrieves the selected theme id', () => {
    setSelectedThemeId('classic-2048');

    expect(getSelectedThemeId()).toBe('classic-2048');
  });
});

describe('parseCustomPaletteJson', () => {
  it('imports custom values and falls back to preset tile styles', () => {
    const theme = parseCustomPaletteJson(JSON.stringify({
      name: '  My Palette  ',
      accent: '#123456',
      tileStyles: { 2: { bg: '#abcdef', text: '#ffffff' } },
    }));

    expect(theme).toMatchObject({
      name: 'My Palette',
      accent: '#123456',
      isCustom: true,
      tileStyles: {
        2: { bg: '#abcdef', text: '#ffffff' },
        4: PRESET_THEMES[0].tileStyles[4],
      },
    });
  });

  it('rejects malformed JSON and non-object values', () => {
    expect(() => parseCustomPaletteJson('{')).toThrow('Invalid JSON format');
    expect(() => parseCustomPaletteJson('null')).toThrow('Palette must be a JSON object');
    expect(() => parseCustomPaletteJson('[]')).toThrow('Palette must be a JSON object');
  });
});
