import React from 'react';
import { motion } from 'motion/react';
import { TileData, TileStyle } from '../types/game';

interface TileViewProps {
  tile: TileData;
  style: TileStyle;
  gridSize: number;
}

export const TileView: React.FC<TileViewProps> = ({ tile, style, gridSize }) => {
  // Calculate relative percentage positioning for fluid grid alignment
  const cellPercent = 100 / gridSize;
  const gapPx = 10; // matches grid gap

  const getFontSize = (val: number): string => {
    if (val < 100) return 'text-2xl sm:text-3xl font-black';
    if (val < 1000) return 'text-xl sm:text-2xl font-black';
    if (val < 10000) return 'text-lg sm:text-xl font-extrabold tracking-tight';
    return 'text-sm sm:text-base font-extrabold tracking-tighter';
  };

  const targetTop = `calc(${tile.row * cellPercent}% + ${gapPx / 2}px)`;
  const targetLeft = `calc(${tile.col * cellPercent}% + ${gapPx / 2}px)`;

  return (
    <motion.div
      initial={
        tile.isNew
          ? { scale: 0, opacity: 0, top: targetTop, left: targetLeft }
          : false
      }
      animate={{
        top: targetTop,
        left: targetLeft,
        scale: tile.isMerged ? [1, 1.2, 1] : 1,
        opacity: 1,
      }}
      transition={{
        top: tile.isNew ? { duration: 0 } : { type: 'spring', damping: 24, stiffness: 260 },
        left: tile.isNew ? { duration: 0 } : { type: 'spring', damping: 24, stiffness: 260 },
        scale: tile.isNew
          ? { type: 'spring', damping: 16, stiffness: 300, duration: 0.2 }
          : tile.isMerged
          ? { duration: 0.2, ease: 'easeOut' }
          : { duration: 0.15 },
        opacity: { duration: 0.15 },
      }}
      className="absolute flex items-center justify-center rounded-2xl select-none z-10 font-sans shadow-md"
      style={{
        width: `calc(${cellPercent}% - ${gapPx}px)`,
        height: `calc(${cellPercent}% - ${gapPx}px)`,
        backgroundColor: style.bg,
        color: style.text,
        boxShadow: style.glow ? `${style.glow}, 0 4px 6px -1px rgba(0,0,0,0.15)` : '0 4px 6px -1px rgba(0,0,0,0.15)',
      }}
    >
      <span className={getFontSize(tile.value)}>{tile.value}</span>
    </motion.div>
  );
};
