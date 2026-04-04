# 2026-04-04 Validation Log

## Verification Commands

From `app/`:

```bash
npx vitest run --maxWorkers=1 src/App.test.tsx src/game/boardViewport.test.ts src/game/gameEngine.test.ts src/game/playthrough.test.ts src/storage/progressStore.test.ts
npm run lint
npm run build
```

## Validation Focus

### Regression coverage added

- `src/game/gameEngine.test.ts`
  - verifies opening layouts do not cluster every identical pair into neighboring positions on a simple row layout
- `src/App.test.tsx`
  - verifies `Hint` remains actionable even when `highlightHints` is turned off

### Existing behavior rechecked

- board viewport calculations
- smart shuffle recovery path
- full playthrough across the 20-level set
- progress persistence
- production build output

## Results

- all targeted and full-suite tests passed with a single-worker Vitest run
- lint passed
- production build passed

## Environment Note

The default `npm test` path in this environment can hit Vitest fork-worker startup timeouts even when the tests themselves are green.

To avoid false negatives during release verification, the full suite was rerun with:

```bash
npx vitest run --maxWorkers=1 ...
```

## Remaining Risks

- board opening variety is improved heuristically rather than maximized globally
- hint behavior is functionally fixed, but there is still room to make the feedback more visually explicit

