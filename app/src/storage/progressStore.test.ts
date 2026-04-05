import {
  createDefaultProgress,
  loadProgress,
  recordLevelResult,
  saveProgress,
  updateSettings,
} from './progressStore'

describe('progressStore', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('returns the default progress state when storage is empty', () => {
    expect(loadProgress()).toEqual(createDefaultProgress())
  })

  it('persists settings updates', () => {
    const updated = updateSettings(createDefaultProgress(), {
      seniorMode: true,
      highlightHints: false,
      soundEnabled: false,
    })

    saveProgress(updated)

    expect(loadProgress().settings).toEqual({
      seniorMode: true,
      highlightHints: false,
      soundEnabled: false,
    })
  })

  it('stores best result per level and unlocks the next level', () => {
    const progress = recordLevelResult(createDefaultProgress(), 1, {
      moves: 18,
      timeSec: 71,
      stars: 3,
      score: 1420,
      bestCombo: 4,
      doraMatches: 2,
    })

    saveProgress(progress)

    const loaded = loadProgress()
    expect(loaded.unlockedLevel).toBe(2)
    expect(loaded.bestResultsByLevel[1]).toEqual({
      moves: 18,
      timeSec: 71,
      stars: 3,
      score: 1420,
      bestCombo: 4,
      doraMatches: 2,
    })
  })
})
