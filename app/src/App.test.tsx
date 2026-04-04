import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { createDefaultProgress } from './storage/progressStore'
import type { GameState, LevelConfig, ProgressState } from './types/game'

class ResizeObserverMock {
  observe(): void {}

  disconnect(): void {}

  unobserve(): void {}
}

function createHintLevel(): LevelConfig {
  return {
    id: 1,
    name: 'Hint Lane',
    difficulty: 'easy',
    slots: [
      { layer: 0, x: 0, y: 0 },
      { layer: 0, x: 4, y: 0 },
    ],
    tilePairs: ['wan-1'],
    parMoves: 1,
    parTimeSec: 20,
  }
}

function createHintState(level: LevelConfig): GameState {
  return {
    levelId: level.id,
    level,
    tiles: [
      { id: 'hint-a', kind: 'wan-1', layer: 0, x: 0, y: 0, removed: false, selected: false },
      { id: 'hint-b', kind: 'wan-1', layer: 0, x: 4, y: 0, removed: false, selected: false },
    ],
    selectedTileId: null,
    moves: 0,
    timeSec: 0,
    hintsUsed: 0,
    shufflesUsed: 0,
    status: 'playing',
    history: [],
    lastMatch: null,
  }
}

function createProgress(highlightHints: boolean): ProgressState {
  return {
    ...createDefaultProgress(),
    settings: {
      seniorMode: false,
      highlightHints,
      soundEnabled: true,
    },
  }
}

describe('App hint flow', () => {
  beforeEach(() => {
    vi.stubGlobal('ResizeObserver', ResizeObserverMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('turns hint into an actionable first selection even when hint highlighting is off', async () => {
    const user = userEvent.setup()
    const level = createHintLevel()
    const save = vi.fn()

    render(
      <App
        levelConfigs={[level]}
        progressApi={{
          load: () => createProgress(false),
          save,
        }}
        createState={() => createHintState(level)}
        enableTimer={false}
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Start Journey' }))
    await user.click(screen.getByRole('button', { name: 'Hint' }))
    await user.click(screen.getByTestId('tile-hint-b'))

    expect(screen.getByText('Round Complete')).toBeInTheDocument()
    expect(save).toHaveBeenCalledTimes(1)
  })
})
