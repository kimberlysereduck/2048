# 2048 Android - Compose Edition

A browser-based 2048 puzzle game with an Android-inspired interface. It includes
keyboard and touch controls, undo, saved games and themes, sound and haptics,
custom palettes, and an optional Firebase leaderboard with offline score
queuing.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Getting started

```sh
npm install
npm run dev
```

Vite serves the app at <http://localhost:3000>. To create and serve a production
build, run:

```sh
npm run build
npm run preview
```

## Firebase

The Firebase app configuration is read from
[`firebase-applet-config.json`](./firebase-applet-config.json), and its API key
is supplied through `VITE_FIREBASE_API_KEY`. Copy `.env.example` to `.env.local`
and set the key before starting or building the app. Local `.env` files are
ignored by Git. Set the same variable in your deployment environment.

The app uses Cloud Firestore for its leaderboard; game play and saved games
work locally without a connection. Configure a Firebase project and its
Firestore security rules before enabling leaderboard submissions. The checked-in
[`firestore.rules`](./firestore.rules) file describes the rules used by this
app.

## Controls

- Move with the arrow keys or **WASD**.
- Swipe on the board to move on touch devices.
- Use **Ctrl+Z** or **Cmd+Z** to undo.
- Use the in-game controls to restart, switch themes, toggle sound and haptics,
  and view the leaderboard.

## Quality checks

```sh
npm test
npm run lint
npm run build
```
