# Security Spec: 2048 Leaderboard Firestore Rules

## 1. Data Invariants
- Each document in `/leaderboard/{scoreId}` represents an immutable high score entry.
- `score` must be a positive integer between 0 and 10,000,000.
- `highestTile` must be a valid power of 2 between 2 and 131,072.
- `movesCount` must be an integer >= 0.
- `playerName` must be a non-empty string between 1 and 30 characters.
- `createdAt` must strictly equal `request.time`.
- Scores are append-only: updates and deletes are denied to preserve leaderboard integrity.
- Read is permitted so players across devices can view the global leaderboard.

## 2. The Dirty Dozen Payloads
1. Negative score: `{ score: -100, highestTile: 2048, movesCount: 50, playerName: "Alice", createdAt: request.time }` -> DENIED
2. Excessive score: `{ score: 999999999, highestTile: 2048, movesCount: 50, playerName: "Alice", createdAt: request.time }` -> DENIED
3. Non-power-of-two / invalid highest tile: `{ score: 2000, highestTile: 333, movesCount: 50, playerName: "Alice", createdAt: request.time }` -> DENIED
4. Empty player name: `{ score: 2000, highestTile: 2048, movesCount: 50, playerName: "", createdAt: request.time }` -> DENIED
5. Overflow player name: `{ score: 2000, highestTile: 2048, movesCount: 50, playerName: "A".repeat(100), createdAt: request.time }` -> DENIED
6. Spoofed client timestamp: `{ score: 2000, highestTile: 2048, movesCount: 50, playerName: "Alice", createdAt: timestamp.date(2020, 1, 1) }` -> DENIED
7. Missing required fields: `{ score: 2000 }` -> DENIED
8. Shadow / ghost fields: `{ score: 2000, highestTile: 2048, movesCount: 50, playerName: "Alice", createdAt: request.time, isAdmin: true }` -> DENIED
9. Invalid ID length/format: Write to `/leaderboard/invalid%%id##` -> DENIED
10. Attempt to mutate existing score (Update-Gap): `update /leaderboard/{id}` -> DENIED
11. Attempt to delete score: `delete /leaderboard/{id}` -> DENIED
12. Denial of wallet payload: 5MB string in devicePlatform -> DENIED
