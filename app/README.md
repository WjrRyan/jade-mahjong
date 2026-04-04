# Jade Mahjong

Mobile-first Mahjong Solitaire Web App built for the AI direction take-home test.

## Included in this project

- Home screen with 20 levels, progress display, and settings
- Game screen with matching, hint, shuffle, undo, restart, and pause/home
- Result screen with score summary and next-level continuation
- 20 playable levels with deterministic solvability
- `Senior Mode` for larger and clearer tiles
- `Smart Recovery` for stalled boards
- Local persistence with `localStorage`

## Stack

- React 19
- TypeScript
- Vite
- Vitest

## Scripts

```bash
npm install
npm run dev
npm test
npm run lint
npm run build
```

## Structure

```text
src/
  data/        tile definitions and level configs
  game/        rule engine and flow tests
  screens/     home, game, and result views
  storage/     local progress persistence
  types/       shared domain types
```

## Notes

- The game is inspired by Vita Mahjong's flow, not by reusing original art assets.
- Tile faces are represented with custom marks and styling to keep the build lightweight.
- The delivery write-up is in `docs/submission-summary.md`.
- The 2026-04-04 maintenance notes are in:
  - `docs/2026-04-04-core-work.md`
  - `docs/2026-04-04-decision-log.md`
  - `docs/2026-04-04-validation-log.md`
