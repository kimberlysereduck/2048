import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameState, TileData } from '../types/game';

vi.mock('../firebase', () => ({
  submitScoreToFirebase: vi.fn(),
}));

import { submitScoreToFirebase } from '../firebase';
import {
  checkHasMovesRemaining,
  createEmptyGrid,
  getAvailableCells,
  getOfflineScores,
  initNewGame,
  loadBestScoreFromStorage,
  loadGameStateFromStorage,
  moveBoard,
  queueOfflineScore,
  saveGameStateToStorage,
  spawnRandomTile,
  syncOfflineScoresToFirebase,
} from './gameLogic';

function installLocalStorage(): Map<string, string> {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, String(value)),
    removeItem: (key: string) => values.delete(key),
    clear: () => values.clear(),
  });
  return values;
}

function tile(id: string, value: number, row: number, col: number): TileData {
  return { id, value, row, col };
}

function state(tiles: TileData[], overrides: Partial<GameState> = {}): GameState {
  return {
    tiles,
    score: 0,
    bestScore: 0,
    movesCount: 0,
    status: 'PLAYING',
    wonAcknowledged: false,
    size: 4,
    ...overrides,
  };
}

describe('game board helpers', () => {
  it('creates independent rows in an empty grid', () => {
    const grid = createEmptyGrid(2);

    expect(grid).toHaveLength(2);
    expect(grid[0]).toEqual([null, null]);
    grid[0][0] = tile('one', 2, 0, 0);
    expect(grid[1][0]).toBeNull();
  });

  it('lists only unoccupied cells', () => {
    expect(getAvailableCells([tile('one', 2, 0, 1)], 2)).toEqual([
      { row: 0, col: 0 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ]);
  });

  it('spawns a 2 or 4 in an available cell and returns null when full', () => {
    const spawned = spawnRandomTile([tile('one', 2, 0, 0)], 2);
    expect([2, 4]).toContain(spawned?.value);
    expect(spawned?.isNew).toBe(true);
    expect(spawned).not.toMatchObject({ row: 0, col: 0 });
    expect(spawnRandomTile([
      tile('a', 2, 0, 0),
      tile('b', 2, 0, 1),
      tile('c', 2, 1, 0),
      tile('d', 2, 1, 1),
    ], 2)).toBeNull();
  });

  it('starts a game with two tiles and the previous best score', () => {
    const game = initNewGame(4, 128);

    expect(game.tiles).toHaveLength(2);
    expect(game.tiles.every((item) => item.value === 2 || item.value === 4)).toBe(true);
    expect(game).toMatchObject({
      score: 0,
      bestScore: 128,
      movesCount: 0,
      status: 'PLAYING',
      size: 4,
    });
  });

  it('detects open cells and matching neighbors as available moves', () => {
    expect(checkHasMovesRemaining([tile('one', 2, 0, 0)], 2)).toBe(true);
    expect(checkHasMovesRemaining([
      tile('a', 2, 0, 0),
      tile('b', 2, 0, 1),
      tile('c', 4, 1, 0),
      tile('d', 8, 1, 1),
    ], 2)).toBe(true);
  });

  it('detects a full board with no matching neighbors as game over', () => {
    expect(checkHasMovesRemaining([
      tile('a', 2, 0, 0),
      tile('b', 4, 0, 1),
      tile('c', 8, 1, 0),
      tile('d', 16, 1, 1),
    ], 2)).toBe(false);
  });
});

describe('moveBoard', () => {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
  });
  afterEach(() => vi.restoreAllMocks());

  it.each([
    ['LEFT', [tile('a', 2, 0, 1), tile('b', 2, 0, 2)], [0, 0]],
    ['RIGHT', [tile('a', 2, 0, 1), tile('b', 2, 0, 2)], [0, 3]],
    ['UP', [tile('a', 2, 1, 0), tile('b', 2, 2, 0)], [0, 0]],
    ['DOWN', [tile('a', 2, 1, 0), tile('b', 2, 2, 0)], [3, 0]],
  ] as const)('moves and merges toward %s', (direction, tiles, [row, col]) => {
    const result = moveBoard(state([...tiles]), direction);

    expect(result.moved).toBe(true);
    expect(result.scoreGained).toBe(4);
    expect(result.highestMergedValue).toBe(4);
    expect(result.nextState.tiles).toContainEqual(expect.objectContaining({
      value: 4,
      row,
      col,
      isMerged: true,
    }));
    expect(result.nextState.movesCount).toBe(1);
  });

  it('merges each tile at most once in a move', () => {
    const result = moveBoard(state([
      tile('a', 2, 0, 0),
      tile('b', 2, 0, 1),
      tile('c', 4, 0, 2),
    ]), 'LEFT');
    const row = result.nextState.tiles.filter((item) => item.row === 0);

    expect(row.filter((item) => item.value === 4)).toHaveLength(2);
    expect(result.scoreGained).toBe(4);
  });

  it('returns the unchanged state when a move has no effect', () => {
    const current = state([tile('a', 2, 0, 0)]);
    const result = moveBoard(current, 'LEFT');

    expect(result).toEqual({
      nextState: current,
      moved: false,
      scoreGained: 0,
      highestMergedValue: 0,
    });
  });

  it('updates score, best score, and move count after a merge', () => {
    const result = moveBoard(state([
      tile('a', 2, 0, 0),
      tile('b', 2, 0, 1),
    ], { score: 8, bestScore: 10, movesCount: 3 }), 'LEFT');

    expect(result.nextState).toMatchObject({ score: 12, bestScore: 12, movesCount: 4 });
  });

  it('marks a newly created 2048 tile as a win', () => {
    const result = moveBoard(state([
      tile('a', 1024, 0, 0),
      tile('b', 1024, 0, 1),
    ]), 'LEFT');

    expect(result.nextState.status).toBe('WON');
    expect(result.nextState.wonAcknowledged).toBe(false);
  });

  it('does not move a game that is already over', () => {
    const current = state([tile('a', 2, 0, 0)], { status: 'GAME_OVER' });

    expect(moveBoard(current, 'RIGHT').nextState).toBe(current);
  });
});

describe('game and offline score storage', () => {
  beforeEach(() => {
    installLocalStorage();
    vi.mocked(submitScoreToFirebase).mockReset();
  });

  it('saves and restores game state and best score', () => {
    const game = state([tile('a', 8, 1, 2)], { bestScore: 16 });

    saveGameStateToStorage(game);

    expect(loadGameStateFromStorage()).toEqual(game);
    expect(loadBestScoreFromStorage()).toBe(16);
  });

  it('returns safe defaults for malformed saved data', () => {
    localStorage.setItem('2048_active_gamestate_v1', '{invalid');
    localStorage.setItem('2048_best_score_v1', 'not-a-score');

    expect(loadGameStateFromStorage()).toBeNull();
    expect(loadBestScoreFromStorage()).toBe(0);
  });

  it('queues offline scores and syncs them to Firebase', async () => {
    const score = {
      score: 128,
      highestTile: 32,
      movesCount: 20,
      playerName: 'Player',
      devicePlatform: 'Browser',
      themeUsed: 'Classic',
    };
    queueOfflineScore(score);
    vi.mocked(submitScoreToFirebase).mockResolvedValue('record-id');

    await expect(syncOfflineScoresToFirebase()).resolves.toBe(1);
    expect(submitScoreToFirebase).toHaveBeenCalledWith(score);
    expect(getOfflineScores()).toEqual([]);
  });

  it('keeps failed offline scores queued for a later retry', async () => {
    queueOfflineScore({
      score: 128,
      highestTile: 32,
      movesCount: 20,
      playerName: 'Player',
      devicePlatform: 'Browser',
      themeUsed: 'Classic',
    });
    vi.mocked(submitScoreToFirebase).mockRejectedValue(new Error('offline'));
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    await expect(syncOfflineScoresToFirebase()).resolves.toBe(0);
    expect(getOfflineScores()).toHaveLength(1);
    warn.mockRestore();
  });
});
