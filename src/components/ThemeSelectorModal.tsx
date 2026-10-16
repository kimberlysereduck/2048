import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette,
  X,
  Check,
  Upload,
  Plus,
  Trash2,
  Copy,
  Sliders,
  CheckCheck,
  AlertCircle
} from 'lucide-react';
import { ColorScheme } from '../types/game';
import {
  PRESET_THEMES,
  getAllThemes,
  saveCustomTheme,
  deleteCustomTheme,
  parseCustomPaletteJson
} from '../utils/themes';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThemeId: string;
  onSelectTheme: (theme: ColorScheme) => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  onClose,
  currentThemeId,
  onSelectTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'import' | 'studio'>('presets');
  const [jsonInput, setJsonInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedTemplate, setCopiedTemplate] = useState<boolean>(false);
  const [themesList, setThemesList] = useState<ColorScheme[]>(() => getAllThemes());

  // Quick Studio draft state
  const [studioName, setStudioName] = useState<string>('My Custom Theme');
  const [studioBg, setStudioBg] = useState<string>('#121212');
  const [studioGrid, setStudioGrid] = useState<string>('#1e1e1e');
  const [studioAccent, setStudioAccent] = useState<string>('#6366f1');

  const refreshThemes = () => {
    setThemesList(getAllThemes());
  };

  const handleSelect = (theme: ColorScheme) => {
    onSelectTheme(theme);
  };

  const handleDelete = (themeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteCustomTheme(themeId);
    refreshThemes();
    if (currentThemeId === themeId) {
      onSelectTheme(PRESET_THEMES[0]);
    }
  };

  const handleImportJson = () => {
    setErrorMessage(null);
    try {
      if (!jsonInput.trim()) {
        setErrorMessage('Please paste custom JSON theme configuration.');
        return;
      }
      const importedTheme = parseCustomPaletteJson(jsonInput);
      saveCustomTheme(importedTheme);
      refreshThemes();
      onSelectTheme(importedTheme);
      setActiveTab('presets');
      setJsonInput('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid theme format.');
    }
  };

  const handleCreateStudioTheme = () => {
    const id = `custom_${Date.now()}`;
    const newTheme: ColorScheme = {
      id,
      name: studioName.trim() || 'Custom Studio Theme',
      description: 'Crafted in Palette Studio.',
      accent: studioAccent,
      background: studioBg,
      surface: studioBg,
      surfaceVariant: studioGrid,
      textPrimary: '#FFFFFF',
      textSecondary: '#A1A1AA',
      gridBackground: studioGrid,
      emptyCell: '#2d2d2d',
      defaultTileStyle: { bg: studioAccent, text: '#FFFFFF', glow: `0 0 16px ${studioAccent}` },
      tileStyles: {
        2: { bg: '#333333', text: '#E5E5E5' },
        4: { bg: '#404040', text: '#F5F5F5' },
        8: { bg: '#4f46e5', text: '#FFFFFF' },
        16: { bg: '#6366f1', text: '#FFFFFF' },
        32: { bg: '#8b5cf6', text: '#FFFFFF' },
        64: { bg: '#a855f7', text: '#FFFFFF' },
        128: { bg: '#d946ef', text: '#FFFFFF' },
        256: { bg: '#ec4899', text: '#FFFFFF' },
        512: { bg: '#f43f5e', text: '#FFFFFF' },
        1024: { bg: '#e11d48', text: '#FFFFFF', glow: '0 0 16px rgba(225,29,72,0.8)' },
        2048: { bg: studioAccent, text: '#FFFFFF', glow: `0 0 24px ${studioAccent}` },
        4096: { bg: '#fbbf24', text: '#18181b', glow: '0 0 28px rgba(251,191,36,0.9)' },
      },
      isCustom: true,
    };

    saveCustomTheme(newTheme);
    refreshThemes();
    onSelectTheme(newTheme);
    setActiveTab('presets');
  };

  const sampleJsonTemplate = JSON.stringify(
    {
      name: 'Cyber Lavender',
      description: 'Lush pastel violet aesthetic with high contrast tiles.',
      accent: '#a855f7',
      background: '#161022',
      surface: '#201633',
      surfaceVariant: '#2d1f47',
      textPrimary: '#FAF5FF',
      textSecondary: '#D8B4FE',
      gridBackground: '#201633',
      emptyCell: '#2e1f4a',
      tileStyles: {
        2: { bg: '#3b285f', text: '#FAF5FF' },
        4: { bg: '#533785', text: '#FAF5FF' },
        8: { bg: '#7c3aed', text: '#FFFFFF' },
        16: { bg: '#8b5cf6', text: '#FFFFFF' },
        32: { bg: '#a855f7', text: '#FFFFFF' },
        64: { bg: '#c084fc', text: '#1e1136' },
        128: { bg: '#d946ef', text: '#FFFFFF' },
        256: { bg: '#f43f5e', text: '#FFFFFF' },
        512: { bg: '#fb7185', text: '#4c0519' },
        1024: { bg: '#38bdf8', text: '#082f49' },
        2048: { bg: '#fbbf24', text: '#451a03', glow: '0 0 20px rgba(251,191,36,0.9)' }
      }
    },
    null,
    2
  );

  const copyTemplate = () => {
    navigator.clipboard.writeText(sampleJsonTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 backdrop-blur-md bg-black/60">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md max-h-[90vh] bg-[#1d1b20] text-[#e6e0e9] rounded-[32px] border border-white/10 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">Color Themes</h3>
              <p className="text-[11px] text-gray-400">Pre-generated & custom color schemes</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-4 pt-3 flex gap-1.5 border-b border-white/5">
          <button
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'presets'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Color Schemes
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'import'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Import JSON
          </button>
          <button
            onClick={() => setActiveTab('studio')}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeTab === 'studio'
                ? 'bg-purple-600 text-white shadow'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Quick Studio
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
          {activeTab === 'presets' && (
            <div className="space-y-3">
              {themesList.map((theme) => {
                const isSelected = theme.id === currentThemeId;
                const sampleValues = [2, 8, 64, 2048];

                return (
                  <div
                    key={theme.id}
                    onClick={() => handleSelect(theme)}
                    className={`p-3.5 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'border-purple-400 bg-purple-500/10 shadow-md ring-1 ring-purple-400/40'
                        : 'border-white/5 bg-[#2b2930] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{theme.name}</span>
                        {theme.isCustom && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300">
                            Custom
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {theme.isCustom && (
                          <button
                            onClick={(e) => handleDelete(theme.id, e)}
                            className="text-rose-400 hover:text-rose-300 p-1 hover:bg-rose-500/20 rounded-md transition-colors"
                            title="Delete custom theme"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {isSelected && (
                          <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-white">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-[11px] text-gray-400 mb-2.5 line-clamp-1">{theme.description}</p>

                    {/* Mini Tiles Preview */}
                    <div
                      className="p-1.5 rounded-xl flex items-center gap-2"
                      style={{ backgroundColor: theme.gridBackground }}
                    >
                      {sampleValues.map((val) => {
                        const style = theme.tileStyles[val] || theme.defaultTileStyle;
                        return (
                          <div
                            key={val}
                            className="flex-1 py-1.5 rounded-lg flex items-center justify-center font-black text-[11px] shadow-sm select-none"
                            style={{
                              backgroundColor: style.bg,
                              color: style.text,
                              boxShadow: style.glow,
                            }}
                          >
                            {val}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-[#2b2930] border border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-300">Palette JSON Specification</span>
                  <button
                    onClick={copyTemplate}
                    className="flex items-center gap-1 text-[11px] text-gray-300 hover:text-white"
                  >
                    {copiedTemplate ? (
                      <>
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Template</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">
                  Paste your custom 2048 palette schema below to import your own colors instantly.
                </p>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  placeholder="Paste JSON palette here..."
                  rows={8}
                  className="w-full p-2.5 text-[11px] font-mono rounded-xl bg-black/50 border border-white/10 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-purple-400 resize-none"
                />
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <button
                onClick={handleImportJson}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Import & Apply Palette
              </button>
            </div>
          )}

          {activeTab === 'studio' && (
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-[#2b2930] border border-white/5 space-y-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Theme Name
                  </label>
                  <input
                    type="text"
                    value={studioName}
                    onChange={(e) => setStudioName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-black/40 border border-white/10 text-white focus:outline-none focus:border-purple-400"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 block mb-1">
                      Background
                    </label>
                    <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-xl border border-white/10">
                      <input
                        type="color"
                        value={studioBg}
                        onChange={(e) => setStudioBg(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-[10px] font-mono text-gray-300">{studioBg}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 block mb-1">
                      Grid Tint
                    </label>
                    <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-xl border border-white/10">
                      <input
                        type="color"
                        value={studioGrid}
                        onChange={(e) => setStudioGrid(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-[10px] font-mono text-gray-300">{studioGrid}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 block mb-1">
                      2048 Accent
                    </label>
                    <div className="flex items-center gap-2 bg-black/30 p-1.5 rounded-xl border border-white/10">
                      <input
                        type="color"
                        value={studioAccent}
                        onChange={(e) => setStudioAccent(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                      />
                      <span className="text-[10px] font-mono text-gray-300">{studioAccent}</span>
                    </div>
                  </div>
                </div>

                {/* Live Preview */}
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 block mb-1">
                    Live Tile Preview
                  </span>
                  <div
                    className="p-2 rounded-xl flex items-center gap-2"
                    style={{ backgroundColor: studioGrid }}
                  >
                    {[2, 16, 128, 2048].map((v) => (
                      <div
                        key={v}
                        className="flex-1 py-2 rounded-lg flex items-center justify-center font-black text-xs shadow-sm"
                        style={{
                          backgroundColor: v === 2048 ? studioAccent : v === 128 ? '#d946ef' : v === 16 ? '#6366f1' : '#333333',
                          color: '#FFFFFF',
                          boxShadow: v === 2048 ? `0 0 14px ${studioAccent}` : undefined,
                        }}
                      >
                        {v}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={handleCreateStudioTheme}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 font-bold text-xs text-white shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Save & Use Custom Palette
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#16141a] flex items-center justify-between text-[11px] text-gray-400">
          <span>Active: {themesList.find((t) => t.id === currentThemeId)?.name || 'Theme'}</span>
          <button
            onClick={onClose}
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
