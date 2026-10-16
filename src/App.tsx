import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Undo2,
  Trophy,
  Palette,
  Volume2,
  VolumeX,
  Vibrate,
  Code2,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Award,
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { ColorScheme, Direction, GameState, UndoStep } from './types/game';
import {
  initNewGame,
  moveBoard,
  saveGameStateToStorage,
  loadGameStateFromStorage,
  loadBestScoreFromStorage,
  getOfflineScores,
  syncOfflineScoresToFirebase
} from './utils/gameLogic';
import {
  getAllThemes,
  getSelectedThemeId,
  setSelectedThemeId,
  PRESET_THEMES
} from './utils/themes';
import { soundAndHaptics } from './utils/soundAndHaptics';
import { testFirestoreConnection } from './firebase';
import { AndroidFrame } from './components/AndroidFrame';
import { GameBoard } from './components/GameBoard';
import { LeaderboardModal } from './components/LeaderboardModal';
import { ThemeSelectorModal } from './components/ThemeSelectorModal';
import { ComposeCodeModal } from './components/ComposeCodeModal';

export default function App() {
  const [themes, setThemes] = useState<ColorScheme[]>(() => getAllThemes());
  const [currentTheme, setCurrentTheme] = useState<ColorScheme>(() => {
    const selectedId = getSelectedThemeId();
    const found = getAllThemes().find((t) => t.id === selectedId);
    return found || PRESET_THEMES[0];
  });

  const [gameState, setGameState] = useState<GameState>(() => {
    const saved = loadGameStateFromStorage();
    if (saved && saved.tiles && saved.tiles.length > 0) {
      return saved;
    }
    const previousBest = loadBestScoreFromStorage();
    return initNewGame(4, previousBest);
  });

  const [undoHistory, setUndoHistory] = useState<UndoStep[]>([]);
  const [scoreAdditions, setScoreAdditions] = useState<{ id: number; amount: number }[]>([]);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);
  const [showDpad, setShowDpad] = useState<boolean>(false);
  const [soundOn, setSoundOn] = useState<boolean>(() => soundAndHaptics.isSoundEnabled());
  const [hapticsOn, setHapticsOn] = useState<boolean>(() => soundAndHaptics.isHapticsEnabled());
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isComposeModalOpen, setIsComposeModalOpen] = useState<boolean>(false);

  const highestTile = Math.max(...gameState.tiles.map((t) => t.value), 2);

  // Save game state on changes
  useEffect(() => {
    saveGameStateToStorage(gameState);
  }, [gameState]);

  // Monitor network and test Firestore connection on mount
  useEffect(() => {
    testFirestoreConnection().then((connected) => {
      setIsOnline(connected && navigator.onLine);
    });

    const onOnline = () => {
      setIsOnline(true);
      syncOfflineScoresToFirebase();
    };
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Trigger win confetti once
  useEffect(() => {
    if (gameState.status === 'WON' && !gameState.wonAcknowledged) {
      soundAndHaptics.onWin();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6750A4', '#FFD7F4', '#F59E0B', '#38BDF8'],
        });
      } catch {}
    } else if (gameState.status === 'GAME_OVER') {
      soundAndHaptics.onGameOver();
    }
  }, [gameState.status, gameState.wonAcknowledged]);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameState.status === 'GAME_OVER') return;

      const currentSnapshot: UndoStep = {
        tiles: gameState.tiles.map((t) => ({ ...t })),
        score: gameState.score,
        movesCount: gameState.movesCount,
      };

      const result = moveBoard(gameState, direction);

      if (result.moved) {
        // Record undo state (retain max 5 steps)
        setUndoHistory((prev) => [currentSnapshot, ...prev.slice(0, 4)]);

        // Score animation popup
        if (result.scoreGained > 0) {
          const additionId = Date.now() + Math.random();
          setScoreAdditions((prev) => [...prev, { id: additionId, amount: result.scoreGained }]);
          setTimeout(() => {
            setScoreAdditions((prev) => prev.filter((item) => item.id !== additionId));
          }, 900);

          soundAndHaptics.onMerge(result.highestMergedValue);
        } else {
          soundAndHaptics.onSlide();
        }

        setGameState(result.nextState);
      }
    },
    [gameState]
  );

  const handleUndo = useCallback(() => {
    if (undoHistory.length === 0) return;
    soundAndHaptics.triggerHaptic(18);

    const [previous, ...rest] = undoHistory;
    setGameState((current) => ({
      ...current,
      tiles: previous.tiles,
      score: previous.score,
      movesCount: previous.movesCount,
      status: 'PLAYING',
    }));
    setUndoHistory(rest);
  }, [undoHistory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when modal or input active
      if (isLeaderboardOpen || isThemeModalOpen || isComposeModalOpen) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove('RIGHT');
          break;
        case 'z':
        case 'Z':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleUndo();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, handleUndo, isLeaderboardOpen, isThemeModalOpen, isComposeModalOpen]);

  const handleRestart = () => {
    soundAndHaptics.triggerHaptic(20);
    const newGame = initNewGame(gameState.size, gameState.bestScore);
    setGameState(newGame);
    setUndoHistory([]);
  };

  const handleKeepPlaying = () => {
    soundAndHaptics.triggerHaptic(25);
    setGameState((prev) => ({
      ...prev,
      status: 'PLAYING',
      wonAcknowledged: true,
    }));
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundAndHaptics.setSoundEnabled(next);
    if (next) soundAndHaptics.onSlide();
  };

  const toggleHaptics = () => {
    const next = !hapticsOn;
    setHapticsOn(next);
    soundAndHaptics.setHapticsEnabled(next);
    if (next) soundAndHaptics.triggerHaptic([30, 40]);
  };

  const handleSelectTheme = (theme: ColorScheme) => {
    setCurrentTheme(theme);
    setSelectedThemeId(theme.id);
  };

  return (
    <AndroidFrame
      isPhoneFrame={isPhoneFrame}
      setIsPhoneFrame={setIsPhoneFrame}
      accentColor={currentTheme.accent}
      themeBackground={currentTheme.background}
    >
      <div
        className="flex-1 flex flex-col justify-between p-4 sm:p-5 select-none transition-colors duration-300"
        style={{
          color: currentTheme.textPrimary,
        }}
      >
        {/* Top Header & Android Action Bar */}
        <div className="space-y-3.5">
          {/* Top Bar with Title and Mini Quick Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ring-1 ring-white/10"
                style={{
                  backgroundColor: currentTheme.accent,
                  color: '#FFFFFF',
                }}
              >
                2048
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight leading-none">
                  Compose 2048
                </span>
                <span className="text-[10px] text-gray-400 font-semibold mt-0.5 flex items-center gap-1">
                  Android M3 Edition
                  {isOnline ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" title="Online" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" title="Offline" />
                  )}
                </span>
              </div>
            </div>

            {/* Quick Action Badges */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleHaptics}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  hapticsOn ? 'bg-purple-600/30 text-purple-300 ring-1 ring-purple-400/40' : 'bg-white/5 text-gray-400'
                }`}
                title={hapticsOn ? 'Haptics: Enabled' : 'Haptics: Disabled'}
              >
                <Vibrate className="w-4 h-4" />
              </button>

              <button
                onClick={toggleSound}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  soundOn ? 'bg-purple-600/30 text-purple-300 ring-1 ring-purple-400/40' : 'bg-white/5 text-gray-400'
                }`}
                title={soundOn ? 'Sound: Enabled' : 'Sound: Muted'}
              >
                {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsComposeModalOpen(true)}
                className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30 flex items-center justify-center hover:bg-emerald-500/30 transition-all"
                title="View Jetpack Compose Kotlin Code"
              >
                <Code2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scores Header Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Current Score */}
            <div
              className="p-2.5 rounded-2xl relative overflow-hidden shadow-sm flex flex-col items-center justify-center"
              style={{ backgroundColor: currentTheme.surfaceVariant }}
            >
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                Score
              </span>
              <span className="text-xl sm:text-2xl font-black tracking-tight">
                {gameState.score.toLocaleString()}
              </span>

              {/* Floating +pts Animation */}
              {scoreAdditions.map((addition) => (
                <span
                  key={addition.id}
                  className="absolute text-sm font-extrabold text-amber-300 animate-out fade-out slide-out-to-top duration-700 pointer-events-none"
                  style={{ top: '8px', right: '16px' }}
                >
                  +{addition.amount}
                </span>
              ))}
            </div>

            {/* Best Score */}
            <div
              className="p-2.5 rounded-2xl shadow-sm flex flex-col items-center justify-center"
              style={{ backgroundColor: currentTheme.surfaceVariant }}
            >
              <div className="flex items-center gap-1 opacity-75 text-[10px] uppercase font-bold tracking-wider">
                <Flame className="w-3 h-3 text-amber-400" />
                <span>Best</span>
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-amber-400">
                {gameState.bestScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action Ribbon: Leaderboard, Themes, Undo, Restart */}
          <div className="flex items-center justify-between gap-1.5">
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              style={{ backgroundColor: currentTheme.surfaceVariant }}
            >
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>Leaderboard</span>
            </button>

            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="flex-1 py-2 px-2.5 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 active:scale-95 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              style={{ backgroundColor: currentTheme.surfaceVariant }}
            >
              <Palette className="w-3.5 h-3.5 text-purple-400" />
              <span>Palettes</span>
            </button>

            <button
              onClick={handleUndo}
              disabled={undoHistory.length === 0}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition-all flex items-center justify-center shadow-sm"
              style={{ backgroundColor: currentTheme.surfaceVariant }}
              title="Undo Move"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={handleRestart}
              className="py-2 px-3 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/15 active:scale-95 transition-all flex items-center justify-center shadow-sm"
              style={{ backgroundColor: currentTheme.surfaceVariant }}
              title="Restart Game"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Center: The Fluid 2048 Game Board */}
        <div className="my-auto py-2">
          <GameBoard
            gameState={gameState}
            theme={currentTheme}
            onMove={handleMove}
            onRestart={handleRestart}
            onKeepPlaying={handleKeepPlaying}
            onOpenSubmitModal={() => setIsLeaderboardOpen(true)}
          />
        </div>

        {/* Bottom Control Bar & Instructions */}
        <div className="space-y-2 mt-auto">
          {/* Subtle gesture / keyboard hint */}
          <div className="flex items-center justify-between text-[11px] opacity-60 px-1 font-medium">
            <span>Swipe or Arrow Keys to merge</span>
            <button
              onClick={() => setShowDpad(!showDpad)}
              className="hover:opacity-100 underline text-[10px]"
            >
              {showDpad ? 'Hide D-Pad' : 'Show D-Pad'}
            </button>
          </div>

          {/* Optional On-Screen D-Pad for Touch/Accessibility */}
          {showDpad && (
            <div className="flex flex-col items-center justify-center gap-1.5 py-1">
              <button
                onClick={() => handleMove('UP')}
                className="w-11 h-10 rounded-xl bg-white/10 active:bg-white/20 flex items-center justify-center shadow"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleMove('LEFT')}
                  className="w-11 h-10 rounded-xl bg-white/10 active:bg-white/20 flex items-center justify-center shadow"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-[10px] font-bold text-purple-300">
                  {gameState.movesCount}
                </div>
                <button
                  onClick={() => handleMove('RIGHT')}
                  className="w-11 h-10 rounded-xl bg-white/10 active:bg-white/20 flex items-center justify-center shadow"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => handleMove('DOWN')}
                className="w-11 h-10 rounded-xl bg-white/10 active:bg-white/20 flex items-center justify-center shadow"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Global Modals */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentScore={gameState.score}
        highestTile={highestTile}
        movesCount={gameState.movesCount}
        themeName={currentTheme.name}
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        currentThemeId={currentTheme.id}
        onSelectTheme={handleSelectTheme}
      />

      <ComposeCodeModal
        isOpen={isComposeModalOpen}
        onClose={() => setIsComposeModalOpen(false)}
      />
    </AndroidFrame>
  );
}
