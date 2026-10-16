export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type GameStatus = 'PLAYING' | 'WON' | 'GAME_OVER';

export interface TileData {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

export interface TileStyle {
  bg: string;
  text: string;
  glow?: string;
  fontSize?: string;
}

export interface ColorScheme {
  id: string;
  name: string;
  description: string;
  accent: string;
  background: string;
  surface: string;
  surfaceVariant: string;
  textPrimary: string;
  textSecondary: string;
  gridBackground: string;
  emptyCell: string;
  tileStyles: Record<number, TileStyle>;
  defaultTileStyle: TileStyle;
  isCustom?: boolean;
}

export interface GameState {
  tiles: TileData[];
  score: number;
  bestScore: number;
  movesCount: number;
  status: GameStatus;
  wonAcknowledged: boolean;
  size: number;
}

export interface UndoStep {
  tiles: TileData[];
  score: number;
  movesCount: number;
}

export interface OfflinePendingScore {
  id: string;
  score: number;
  highestTile: number;
  movesCount: number;
  playerName: string;
  devicePlatform: string;
  themeUsed: string;
  timestamp: number;
}
