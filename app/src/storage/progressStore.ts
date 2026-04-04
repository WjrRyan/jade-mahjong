import type { GameSettings, LevelResult, ProgressState } from '../types/game'

const STORAGE_KEY = 'vita-mahjong-progress'

const defaultSettings: GameSettings = {
  seniorMode: false,
  highlightHints: true,
  soundEnabled: true,
}

export function createDefaultProgress(): ProgressState {
  return {
    unlockedLevel: 1,
    bestResultsByLevel: {},
    settings: defaultSettings,
  }
}

export function loadProgress(): ProgressState {
  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) {
    return createDefaultProgress()
  }

  try {
    const parsed = JSON.parse(raw) as Partial<ProgressState>
    return {
      unlockedLevel: parsed.unlockedLevel ?? 1,
      bestResultsByLevel: parsed.bestResultsByLevel ?? {},
      settings: {
        ...defaultSettings,
        ...parsed.settings,
      },
    }
  } catch {
    return createDefaultProgress()
  }
}

export function saveProgress(progress: ProgressState): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function updateSettings(progress: ProgressState, settings: Partial<GameSettings>): ProgressState {
  return {
    ...progress,
    settings: {
      ...progress.settings,
      ...settings,
    },
  }
}

export function recordLevelResult(
  progress: ProgressState,
  levelId: number,
  result: LevelResult,
): ProgressState {
  const previous = progress.bestResultsByLevel[levelId]
  const shouldReplace =
    !previous ||
    result.stars > previous.stars ||
    (result.stars === previous.stars && result.timeSec < previous.timeSec)

  return {
    ...progress,
    unlockedLevel: Math.max(progress.unlockedLevel, Math.min(levelId + 1, 20)),
    bestResultsByLevel: shouldReplace
      ? {
          ...progress.bestResultsByLevel,
          [levelId]: result,
        }
      : progress.bestResultsByLevel,
  }
}
