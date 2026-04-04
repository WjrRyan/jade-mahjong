# Jade Mahjong Delivery Summary

## Project Overview

This submission implements a mobile-first Mahjong Solitaire Web App inspired by the core flow of Vita Mahjong.

Delivered scope:

- Home screen
- Game screen
- Result screen
- 20 playable levels
- Local progress persistence

The product direction favors a calm, readable, senior-friendly experience over heavy feature scope.

## Technical Choices

- Framework: React + TypeScript + Vite
- State model: single-screen app flow managed in React state
- Persistence: `localStorage`
- Validation: Vitest tests, ESLint, and production build

I chose a Web App delivery because it is the fastest path to a real phone-playable artifact within the 24-hour constraint while still supporting genuine mobile interaction.

## Game Implementation

### Main flow

- Home: start game, choose unlocked levels, adjust settings
- Game: match free identical tiles, use tools, recover from stalls
- Result: review performance, replay, or continue to the next level

### Level design

- 20 level configurations are defined in code
- Difficulty scales from easy to hard
- Layouts combine row-based blocking and layered stacking
- The engine computes a solvable removal plan for each board so every level has a valid path

### Key gameplay rules

- A tile is free if there is no overlapping tile above it and at least one horizontal side is open
- Matching two free tiles with the same kind removes them
- `Hint` highlights one available pair
- `Shuffle` rotates free-tile kinds only
- `Undo` restores the previous move snapshot
- `Smart Recovery` deterministically reshapes remaining active tiles so a stalled board becomes playable again

## AI Tool Usage

AI tools were used as part of the delivery workflow rather than being embedded as an in-game feature.

Main AI-assisted steps:

- turning the PDF prompt into an executable implementation plan
- comparing project direction against the referenced Google Play product
- structuring the codebase into screens, engine, level data, and storage layers
- accelerating repetitive implementation and refactoring work
- generating and refining tests and delivery documentation

## Problems Encountered and Solutions

### 1. Solvable board generation

Problem:
If tile kinds are assigned naively, some boards can become impossible even if the layout looks reasonable.

Solution:
The engine computes a valid removal order from the occupied slot graph first, then assigns pair kinds onto that order. This guarantees each level has a solution path.

### 2. Stalled-board recovery

Problem:
A basic free-tile shuffle is not enough to rescue every stalled board.

Solution:
I separated normal shuffle from `Smart Recovery`. Normal shuffle preserves the lightweight tool behavior, while Smart Recovery deliberately redistributes active tile kinds to surface a new free pair.

### 3. Mobile readability

Problem:
Small tiles and dense UI quickly reduce usability on phones.

Solution:
I kept the UI narrow, touch-first, and high-contrast, and added `Senior Mode` to enlarge tiles and labels without changing the underlying rules.

## Verification

Commands run:

```bash
npm test
npm run lint
npm run build
```

Verified outcomes:

- unit coverage for tile freedom, matching, shuffle, undo, clear detection, and storage
- flow coverage for clearing levels, unlocking progression, and Smart Recovery
- successful lint run
- successful production build

## What I Would Improve Next

- richer tile art and audio feedback
- true PWA installability and icon packaging
- deeper animation polish for match/remove transitions
- optional analytics hooks for level completion and stall frequency
