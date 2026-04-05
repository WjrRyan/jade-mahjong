import { levelConfigs } from '../data/levels'
import {
  createInitialGameState,
  findAvailableMatch,
  selectTile,
  smartShuffle,
} from './gameEngine'
import { createDefaultProgress, recordLevelResult } from '../storage/progressStore'
import type { GameState, LevelConfig, LevelResult } from '../types/game'

function solveLevel(level: LevelConfig): { state: GameState; result: LevelResult } {
  let state = createInitialGameState(level)
  let safety = 0

  while (state.status !== 'won' && safety < 200) {
    const match = findAvailableMatch(state.tiles)
    if (!match) {
      state = smartShuffle(state)
    } else {
      state = selectTile(selectTile(state, match[0]), match[1])
    }
    safety += 1
  }

  if (state.status !== 'won') {
    throw new Error(`Expected level ${level.id} to be solvable within the safety limit.`)
  }

  return {
    state,
    result: {
      moves: state.moves,
      timeSec: state.timeSec,
      stars: 3,
      score: state.score,
      bestCombo: state.bestCombo,
      doraMatches: state.doraMatches,
    },
  }
}

describe('playthrough flow', () => {
  it('clears level 1 and unlocks level 2 in stored progress', () => {
    const progress = createDefaultProgress()
    const { state, result } = solveLevel(levelConfigs[0])
    const nextProgress = recordLevelResult(progress, levelConfigs[0].id, result)

    expect(state.status).toBe('won')
    expect(nextProgress.unlockedLevel).toBe(2)
    expect(nextProgress.bestResultsByLevel[1]).toEqual(result)
  })

  it('supports a continuous path through at least 20 levels', () => {
    let progress = createDefaultProgress()

    for (const level of levelConfigs) {
      const { result } = solveLevel(level)
      progress = recordLevelResult(progress, level.id, result)
    }

    expect(progress.unlockedLevel).toBe(20)
    expect(Object.keys(progress.bestResultsByLevel)).toHaveLength(20)
  })

  it('uses smart recovery to restore a stalled board into a playable state', () => {
    const level = levelConfigs[0]
    const stalledState: GameState = {
      levelId: level.id,
      level,
      tiles: [
        { id: 'free-a', kind: 'wan-1', layer: 1, x: 0, y: 0, removed: false, selected: false },
        { id: 'free-b', kind: 'tong-4', layer: 1, x: 4, y: 0, removed: false, selected: false },
        { id: 'deep-a', kind: 'wan-1', layer: 0, x: 0, y: 0, removed: false, selected: false },
        { id: 'deep-b', kind: 'tong-4', layer: 0, x: 4, y: 0, removed: false, selected: false },
      ],
      selectedTileId: null,
      moves: 0,
      timeSec: 0,
      hintsUsed: 0,
      shufflesUsed: 0,
      status: 'stalled',
      history: [],
      lastMatch: null,
      score: 0,
      comboCount: 0,
      bestCombo: 0,
      doraKind: 'wan-1',
      doraMatches: 0,
      lastClearAt: null,
      lastScoreEvent: null,
    }

    const recovered = smartShuffle(stalledState)
    const match = findAvailableMatch(recovered.tiles)

    expect(recovered.status).toBe('playing')
    expect(match).not.toBeNull()
  })
})
