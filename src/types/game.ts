/** A direction in which the player can slide the board. */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/** Current lifecycle state of a game. */
export type GameStatus = 'PLAYING' | 'WON' | 'GAME_OVER';

/** A numbered tile and its current position on the board. */
export interface TileData {
  id: string;
  value: number;
  row: number;
  col: number;
  isNew?: boolean;
  isMerged?: boolean;
}

/** Colors and optional effects used to render a tile. */
export interface TileStyle {
  bg: string;
  text: string;
  glow?: string;
  fontSize?: string;
}

/** Complete color palette for the game interface and tiles. */
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

/** All persistent and transient state required to render a game. */
export interface GameState {
  tiles: TileData[];
  score: number;
  bestScore: number;
  movesCount: number;
  status: GameStatus;
  wonAcknowledged: boolean;
  size: number;
}

/** The board and score snapshot used to restore one undo step. */
export interface UndoStep {
  tiles: TileData[];
  score: number;
  movesCount: number;
}

/** Leaderboard submission saved locally until connectivity is available. */
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
