import { startTransition, useEffect, useState } from 'react'
import { levelConfigs as defaultLevels } from './data/levels'
import {
  createInitialGameState,
  revealHint,
  restartLevel,
  selectTile,
  shuffleFreeTiles,
  smartShuffle,
  tickTimer,
  undoLastMove,
} from './game/gameEngine'
import { GameScreen } from './screens/GameScreen'
import { HomeScreen } from './screens/HomeScreen'
import { ResultScreen } from './screens/ResultScreen'
import {
  createDefaultProgress,
  loadProgress,
  recordLevelResult,
  saveProgress,
  updateSettings,
} from './storage/progressStore'
import type { GameState, LevelConfig, LevelResult, ProgressState } from './types/game'

interface ProgressApi {
  load: () => ProgressState
  save: (progress: ProgressState) => void
}

interface AppProps {
  levelConfigs?: LevelConfig[]
  progressApi?: ProgressApi
  createState?: (level: LevelConfig) => GameState
  enableTimer?: boolean
}

function calculateStars(level: LevelConfig, state: GameState): LevelResult {
  let stars = 1
  if (state.moves <= level.parMoves) {
    stars += 1
  }
  if (state.timeSec <= level.parTimeSec) {
    stars += 1
  }

  return {
    moves: state.moves,
    timeSec: state.timeSec,
    stars,
  }
}

function createProgressApi(): ProgressApi {
  return {
    load: loadProgress,
    save: saveProgress,
  }
}

function App({
  levelConfigs = defaultLevels,
  progressApi = createProgressApi(),
  createState = createInitialGameState,
  enableTimer = true,
}: AppProps) {
  const [view, setView] = useState<'home' | 'game' | 'result'>('home')
  const [progress, setProgress] = useState<ProgressState>(() => {
    const loaded = progressApi.load()
    return loaded ?? createDefaultProgress()
  })
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [result, setResult] = useState<{ level: LevelConfig; score: LevelResult } | null>(null)
  const [hintIds, setHintIds] = useState<string[]>([])

  const activeLevel = gameState?.level ?? result?.level ?? null

  const commitGameState = (nextState: GameState) => {
    setGameState(nextState)

    if (nextState.status === 'won') {
      const score = calculateStars(nextState.level, nextState)
      const nextProgress = recordLevelResult(progress, nextState.level.id, score)
      setProgress(nextProgress)
      progressApi.save(nextProgress)
      setResult({ level: nextState.level, score })

      startTransition(() => {
        setView('result')
      })
    }
  }

  const startLevel = (levelId: number) => {
    const nextLevel = levelConfigs.find((level) => level.id === levelId)
    if (!nextLevel) {
      return
    }

    startTransition(() => {
      setGameState(createState(nextLevel))
      setResult(null)
      setHintIds([])
      setView('game')
    })
  }

  useEffect(() => {
    if (view !== 'game' || !enableTimer) {
      return
    }

    const timer = window.setInterval(() => {
      setGameState((current) => (current ? tickTimer(current) : current))
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [enableTimer, view])

  const patchSettings = (patch: Partial<ProgressState['settings']>) => {
    const next = updateSettings(progress, patch)
    setProgress(next)
    progressApi.save(next)
  }

  if (view === 'home') {
    return (
      <HomeScreen
        levels={levelConfigs}
        progress={progress}
        onStartLevel={startLevel}
        onUpdateSettings={patchSettings}
      />
    )
  }

  if (view === 'result' && result) {
    return (
      <ResultScreen
        level={result.level}
        result={result.score}
        hasNextLevel={result.level.id < levelConfigs.length}
        onNext={() => startLevel(Math.min(result.level.id + 1, levelConfigs.length))}
        onRetry={() => startLevel(result.level.id)}
        onHome={() => setView('home')}
      />
    )
  }

  if (!gameState || !activeLevel) {
    return null
  }

  return (
    <GameScreen
      level={activeLevel}
      state={gameState}
      settings={progress.settings}
      hintIds={hintIds}
      onSelectTile={(tileId) => {
        if (!gameState) {
          return
        }
        setHintIds([])
        commitGameState(selectTile(gameState, tileId))
      }}
      onHint={() => {
        const hint = revealHint(gameState)
        if (!hint) {
          return
        }
        setHintIds(hint.hintIds)
        setGameState(hint.nextState)
      }}
      onShuffle={() => {
        setHintIds([])
        commitGameState(shuffleFreeTiles(gameState))
      }}
      onSmartShuffle={() => {
        setHintIds([])
        commitGameState(smartShuffle(gameState))
      }}
      onUndo={() => {
        setHintIds([])
        commitGameState(undoLastMove(gameState))
      }}
      onRestart={() => {
        setHintIds([])
        commitGameState(restartLevel(activeLevel))
      }}
      onHome={() => {
        startTransition(() => {
          setView('home')
        })
      }}
    />
  )
}

export default App
