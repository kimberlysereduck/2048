import { Direction, GameState, GameStatus, TileData, UndoStep, OfflinePendingScore } from '../types/game';
import { submitScoreToFirebase } from '../firebase';

let nextTileId = 1;

/**
 * Creates a unique identifier for a game tile.
 *
 * @returns A time- and random-based tile identifier.
 */
export function generateTileId(): string {
  return `t_${Date.now()}_${nextTileId++}_${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Creates a square grid with every cell empty.
 *
 * @param size - Number of rows and columns in the grid.
 * @returns A newly allocated grid of empty cells.
 */
export function createEmptyGrid(size: number = 4): (TileData | null)[][] {
  return Array.from({ length: size }, () => Array(size).fill(null));
}

/**
 * Lists the unoccupied coordinates in a square board.
 *
 * @param tiles - Tiles currently occupying the board.
 * @param size - Number of rows and columns in the board.
 * @returns Empty cell coordinates in row-major order.
 */
export function getAvailableCells(tiles: TileData[], size: number = 4): { row: number; col: number }[] {
  const occupied = new Set(tiles.map((t) => `${t.row},${t.col}`));
  const available: { row: number; col: number }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!occupied.has(`${r},${c}`)) {
        available.push({ row: r, col: c });
      }
    }
  }

  return available;
}

/**
 * Adds a randomly valued tile to an available board cell.
 *
 * @param tiles - Tiles currently occupying the board.
 * @param size - Number of rows and columns in the board.
 * @returns A new 2-or-4 tile, or `null` when no cells are available.
 */
export function spawnRandomTile(tiles: TileData[], size: number = 4): TileData | null {
  const available = getAvailableCells(tiles, size);
  if (available.length === 0) return null;

  const randomCell = available[Math.floor(Math.random() * available.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  return {
    id: generateTileId(),
    value,
    row: randomCell.row,
    col: randomCell.col,
    isNew: true,
  };
}

/**
 * Starts a new game with two randomly placed tiles.
 *
 * @param size - Number of rows and columns in the board.
 * @param previousBest - Best score to retain in the new game.
 * @returns Initial game state.
 */
export function initNewGame(size: number = 4, previousBest: number = 0): GameState {
  const tiles: TileData[] = [];
  const tile1 = spawnRandomTile(tiles, size);
  if (tile1) tiles.push(tile1);

  const tile2 = spawnRandomTile(tiles, size);
  if (tile2) tiles.push(tile2);

  return {
    tiles,
    score: 0,
    bestScore: previousBest,
    movesCount: 0,
    status: 'PLAYING',
    wonAcknowledged: false,
    size,
  };
}

/**
 * Checks whether an empty cell or an adjacent matching pair allows a move.
 *
 * @param tiles - Tiles currently occupying the board.
 * @param size - Number of rows and columns in the board.
 * @returns `true` when at least one move remains.
 */
export function checkHasMovesRemaining(tiles: TileData[], size: number = 4): boolean {
  if (tiles.length < size * size) return true;

  const grid = createEmptyGrid(size);
  tiles.forEach((t) => {
    grid[t.row][t.col] = t;
  });

  // Check horizontal and vertical adjacent duplicates
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const current = grid[r][c];
      if (!current) return true;

      // Check right neighbor
      if (c + 1 < size) {
        const right = grid[r][c + 1];
        if (right && right.value === current.value) return true;
      }
      // Check bottom neighbor
      if (r + 1 < size) {
        const bottom = grid[r + 1][c];
        if (bottom && bottom.value === current.value) return true;
      }
    }
  }

  return false;
}

/** Outcome of attempting to move the board in one direction. */
export interface MoveResult {
  nextState: GameState;
  moved: boolean;
  scoreGained: number;
  highestMergedValue: number;
}

/**
 * Slides and merges tiles in one direction, spawning a tile after a valid move.
 *
 * @param currentState - State to move.
 * @param direction - Direction in which to slide the tiles.
 * @returns The resulting state and details of the move.
 */
export function moveBoard(currentState: GameState, direction: Direction): MoveResult {
  const { tiles, size, score, bestScore, movesCount, wonAcknowledged } = currentState;
  if (currentState.status === 'GAME_OVER') {
    return { nextState: currentState, moved: false, scoreGained: 0, highestMergedValue: 0 };
  }

  // Build grid
  const grid: (TileData | null)[][] = createEmptyGrid(size);
  tiles.forEach((t) => {
    grid[t.row][t.col] = { ...t, isNew: false, isMerged: false };
  });

  let moved = false;
  let scoreGained = 0;
  let highestMergedValue = 0;
  const newTilesList: TileData[] = [];

  // Determine traversal ordering based on direction
  const isHorizontal = direction === 'LEFT' || direction === 'RIGHT';
  const isForward = direction === 'RIGHT' || direction === 'DOWN';

  for (let i = 0; i < size; i++) {
    // Extract line
    const line: (TileData | null)[] = [];
    for (let j = 0; j < size; j++) {
      const r = isHorizontal ? i : j;
      const c = isHorizontal ? j : i;
      line.push(grid[r][c]);
    }

    if (isForward) {
      line.reverse();
    }

    // Filter non-null
    const existing = line.filter((t): t is TileData => t !== null);
    const mergedLine: TileData[] = [];

    for (let j = 0; j < existing.length; j++) {
      const current = existing[j];
      const next = existing[j + 1];

      if (next && current.value === next.value) {
        const mergedVal = current.value * 2;
        scoreGained += mergedVal;
        if (mergedVal > highestMergedValue) {
          highestMergedValue = mergedVal;
        }

        // Add merged tile with new unique ID for clean animation trigger
        mergedLine.push({
          id: generateTileId(),
          value: mergedVal,
          row: 0,
          col: 0,
          isMerged: true,
        });

        moved = true; // Two tiles merged, so a move occurred
        j++; // Skip the next tile because it merged
      } else {
        mergedLine.push({
          ...current,
          isMerged: false,
          isNew: false,
        });
      }
    }

    // Place back into coordinates
    for (let k = 0; k < mergedLine.length; k++) {
      const tile = mergedLine[k];
      const actualIndex = isForward ? size - 1 - k : k;
      const targetRow = isHorizontal ? i : actualIndex;
      const targetCol = isHorizontal ? actualIndex : i;

      if (tile.row !== targetRow || tile.col !== targetCol) {
        moved = true;
      }

      tile.row = targetRow;
      tile.col = targetCol;
      newTilesList.push(tile);
    }
  }

  if (!moved) {
    return {
      nextState: currentState,
      moved: false,
      scoreGained: 0,
      highestMergedValue: 0,
    };
  }

  // Spawn new tile since move was successful
  const newTile = spawnRandomTile(newTilesList, size);
  if (newTile) {
    newTilesList.push(newTile);
  }

  const newScore = score + scoreGained;
  const newBest = Math.max(bestScore, newScore);
  const newMoves = movesCount + 1;

  // Check 2048 win condition
  let status: GameStatus = currentState.status;
  const has2048 = newTilesList.some((t) => t.value >= 2048);
  if (has2048 && !wonAcknowledged && status === 'PLAYING') {
    status = 'WON';
  }

  // Check game over
  if (status !== 'WON' && !checkHasMovesRemaining(newTilesList, size)) {
    status = 'GAME_OVER';
  }

  return {
    nextState: {
      tiles: newTilesList,
      score: newScore,
      bestScore: newBest,
      movesCount: newMoves,
      status,
      wonAcknowledged: status === 'WON' ? false : wonAcknowledged,
      size,
    },
    moved: true,
    scoreGained,
    highestMergedValue,
  };
}

// LocalStorage game state persistence for uninterrupted offline play
const GAME_STATE_STORAGE_KEY = '2048_active_gamestate_v1';
const BEST_SCORE_STORAGE_KEY = '2048_best_score_v1';
const OFFLINE_SCORES_KEY = '2048_offline_scores_v1';

/**
 * Persists the current game and its best score in browser storage.
 *
 * @param state - Game state to persist.
 */
export function saveGameStateToStorage(state: GameState): void {
  try {
    localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(BEST_SCORE_STORAGE_KEY, String(state.bestScore));
  } catch {}
}

/**
 * Restores a saved game state from browser storage.
 *
 * @returns The stored game state, or `null` when none can be loaded.
 */
export function loadGameStateFromStorage(): GameState | null {
  try {
    const raw = localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.tiles)) {
        return parsed;
      }
    }
  } catch {}
  return null;
}

/**
 * Reads the persisted best score.
 *
 * @returns The saved best score, or `0` when it is unavailable.
 */
export function loadBestScoreFromStorage(): number {
  try {
    const val = localStorage.getItem(BEST_SCORE_STORAGE_KEY);
    if (val) return parseInt(val, 10) || 0;
  } catch {}
  return 0;
}

// Offline Leaderboard Queue Management
/**
 * Adds a leaderboard entry to the local queue for later submission.
 *
 * @param score - Score record to queue.
 */
export function queueOfflineScore(score: Omit<OfflinePendingScore, 'id' | 'timestamp'>): void {
  try {
    const pending: OfflinePendingScore[] = getOfflineScores();
    pending.push({
      ...score,
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    });
    localStorage.setItem(OFFLINE_SCORES_KEY, JSON.stringify(pending));
  } catch {}
}

/**
 * Reads leaderboard entries waiting for network submission.
 *
 * @returns Queued offline scores.
 */
export function getOfflineScores(): OfflinePendingScore[] {
  try {
    const raw = localStorage.getItem(OFFLINE_SCORES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

/**
 * Submits queued scores and retains entries whose submission fails.
 *
 * @returns The number of successfully submitted scores.
 */
export async function syncOfflineScoresToFirebase(): Promise<number> {
  const pending = getOfflineScores();
  if (pending.length === 0) return 0;

  let syncedCount = 0;
  const remaining: OfflinePendingScore[] = [];

  for (const item of pending) {
    try {
      await submitScoreToFirebase({
        playerName: item.playerName,
        score: item.score,
        highestTile: item.highestTile,
        movesCount: item.movesCount,
        devicePlatform: item.devicePlatform,
        themeUsed: item.themeUsed,
      });
      syncedCount++;
    } catch (e) {
      console.warn('Could not sync offline score:', e);
      remaining.push(item);
    }
  }

  localStorage.setItem(OFFLINE_SCORES_KEY, JSON.stringify(remaining));
  return syncedCount;
}
