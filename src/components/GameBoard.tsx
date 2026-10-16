import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ColorScheme, Direction, GameState } from '../types/game';
import { TileView } from './TileView';
import { Trophy, RotateCcw, Play, Award } from 'lucide-react';

interface GameBoardProps {
  gameState: GameState;
  theme: ColorScheme;
  onMove: (direction: Direction) => void;
  onRestart: () => void;
  onKeepPlaying: () => void;
  onOpenSubmitModal: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  theme,
  onMove,
  onRestart,
  onKeepPlaying,
  onOpenSubmitModal,
}) => {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        time: Date.now(),
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    const minDistance = 28; // Minimum swipe distance in px
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.hypot(dx, dy) >= minDistance && dt < 800) {
      if (absX > absY) {
        onMove(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        onMove(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  const size = gameState.size;
  const emptyCells = Array.from({ length: size * size }, (_, i) => i);

  return (
    <div className="relative w-full aspect-square max-w-[390px] mx-auto p-2 sm:p-2.5">
      {/* Board Container */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="w-full h-full rounded-3xl p-2.5 relative select-none shadow-inner touch-none overflow-hidden"
        style={{
          backgroundColor: theme.gridBackground,
        }}
      >
        {/* Empty background cells */}
        <div
          className="w-full h-full grid gap-2.5"
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {emptyCells.map((index) => (
            <div
              key={`empty-${index}`}
              className="w-full h-full rounded-2xl transition-colors duration-200"
              style={{ backgroundColor: theme.emptyCell }}
            />
          ))}
        </div>

        {/* Dynamic Animated Tiles */}
        <div className="absolute inset-2.5 pointer-events-none">
          {gameState.tiles.map((tile) => {
            const style = theme.tileStyles[tile.value] || theme.defaultTileStyle;
            return (
              <TileView
                key={tile.id}
                tile={tile}
                style={style}
                gridSize={size}
              />
            );
          })}
        </div>

        {/* Game State Overlay: Win or Game Over */}
        <AnimatePresence>
          {gameState.status === 'WON' && !gameState.wonAcknowledged && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md bg-black/75"
            >
              <div className="w-16 h-16 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center mb-3 shadow-lg ring-2 ring-amber-400/50">
                <Trophy className="w-9 h-9 animate-bounce" />
              </div>
              <h2 className="text-3xl font-black text-amber-300 tracking-tight mb-1">
                2048 Reached!
              </h2>
              <p className="text-sm text-gray-200 mb-6 font-medium">
                Spectacular run! You made it to the coveted 2048 tile.
              </p>
              <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
                <button
                  onClick={onKeepPlaying}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950 shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Keep Going
                </button>
                <button
                  onClick={onOpenSubmitModal}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Post to Leaderboard
                </button>
              </div>
            </motion.div>
          )}

          {gameState.status === 'GAME_OVER' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 rounded-3xl z-30 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md bg-black/80"
            >
              <div className="w-14 h-14 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-3 ring-2 ring-rose-500/40">
                <RotateCcw className="w-7 h-7" />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                Game Over
              </h2>
              <p className="text-sm text-gray-300 mb-6">
                No more moves available. Final Score: <span className="font-bold text-amber-400">{gameState.score}</span>
              </p>
              <div className="flex flex-col gap-2.5 w-full max-w-[240px]">
                <button
                  onClick={onRestart}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={onOpenSubmitModal}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-white/20 text-white hover:bg-white/30 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Award className="w-4 h-4" />
                  Submit Score to Leaderboard
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
