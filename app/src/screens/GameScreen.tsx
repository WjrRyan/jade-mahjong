import { useEffect, useRef, useState } from 'react'
import { TileFace } from '../components/TileFace'
import { getTileKindMeta } from '../data/tileKinds'
import { getBoardScale } from '../game/boardViewport'
import { isTileFree } from '../game/gameEngine'
import type { GameState, LevelConfig, ProgressState } from '../types/game'

interface GameScreenProps {
  level: LevelConfig
  state: GameState
  settings: ProgressState['settings']
  hintIds: string[]
  onSelectTile: (tileId: string) => void
  onHint: () => void
  onShuffle: () => void
  onSmartShuffle: () => void
  onUndo: () => void
  onRestart: () => void
  onHome: () => void
}

function formatTime(timeSec: number): string {
  const minutes = Math.floor(timeSec / 60)
  const seconds = timeSec % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function boardMetrics(level: LevelConfig): { width: number; height: number } {
  const maxX = Math.max(...level.slots.map((slot) => slot.x))
  const maxY = Math.max(...level.slots.map((slot) => slot.y))
  return {
    width: maxX * 36 + 180,
    height: maxY * 50 + 228,
  }
}

export function GameScreen({
  level,
  state,
  settings,
  hintIds,
  onSelectTile,
  onHint,
  onShuffle,
  onSmartShuffle,
  onUndo,
  onRestart,
  onHome,
}: GameScreenProps) {
  const metrics = boardMetrics(level)
  const hinted = new Set(settings.highlightHints ? hintIds : [])
  const boardShellRef = useRef<HTMLElement | null>(null)
  const [boardScale, setBoardScale] = useState(1)

  useEffect(() => {
    const element = boardShellRef.current
    if (!element) {
      return
    }

    const updateScale = () => {
      setBoardScale(getBoardScale(metrics.width, element.clientWidth))
    }

    updateScale()

    const resizeObserver = new ResizeObserver(() => {
      updateScale()
    })

    resizeObserver.observe(element)
    window.addEventListener('resize', updateScale)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [metrics.width])

  return (
    <main className={`app-shell game-shell ${settings.seniorMode ? 'senior-mode' : ''}`}>
      <section className="top-bar">
        <button className="ghost-action" onClick={onHome}>
          Pause / Home
        </button>
        <div className="round-meta">
          <p className="eyebrow">Level {level.id}</p>
          <h2>{level.name}</h2>
        </div>
        <div className="status-stack">
          <strong>{formatTime(state.timeSec)}</strong>
          <span>{state.status === 'stalled' ? 'Recoverable' : 'In play'}</span>
        </div>
      </section>

      <section className="score-strip">
        <article className="mini-stat">
          <span>Moves</span>
          <strong>{state.moves}</strong>
        </article>
        <article className="mini-stat">
          <span>Remaining</span>
          <strong>{state.tiles.filter((tile) => !tile.removed).length}</strong>
        </article>
        <article className="mini-stat">
          <span>Hints</span>
          <strong>{state.hintsUsed}</strong>
        </article>
        <article className="mini-stat">
          <span>Shuffles</span>
          <strong>{state.shufflesUsed}</strong>
        </article>
      </section>

      {state.status === 'stalled' ? (
        <section className="recovery-banner" role="status">
          <div>
            <strong>No matching free pair right now</strong>
            <p>Smart Recovery can regroup the remaining tiles and surface a fresh match.</p>
          </div>
          <button className="primary-action" onClick={onSmartShuffle}>
            Smart Shuffle
          </button>
        </section>
      ) : null}

      <section className="board-shell" ref={boardShellRef}>
        <div
          className="board-stage"
          style={{
            height: Math.ceil(metrics.height * boardScale),
          }}
        >
          <div
            className="board-surface"
            style={{
              ...metrics,
              transform: `scale(${boardScale})`,
            }}
          >
          {state.tiles
            .filter((tile) => !tile.removed)
            .map((tile) => {
              const meta = getTileKindMeta(tile.kind)
              const free = isTileFree(state.tiles, tile.id)
              const style = {
                left: tile.x * 36 + tile.layer * 10,
                top: tile.y * 50 - tile.layer * 10,
                zIndex: tile.layer * 100 + (free ? 50 : 0) + (tile.selected ? 20 : 0),
              }

              return (
                <button
                  key={tile.id}
                  type="button"
                  className={[
                    'tile-card',
                    free ? 'free' : 'blocked',
                    tile.selected ? 'selected' : '',
                    hinted.has(tile.id) ? 'hinted' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={`Tile ${meta.label}`}
                  aria-disabled={!free}
                  data-testid={`tile-${tile.id}`}
                  style={style}
                  onClick={() => onSelectTile(tile.id)}
                >
                  <TileFace meta={meta} />
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="tool-row">
        <button className="ghost-action" onClick={onHint}>
          Hint
        </button>
        <button className="ghost-action" onClick={onShuffle}>
          Shuffle
        </button>
        <button className="ghost-action" onClick={onUndo}>
          Undo
        </button>
        <button className="ghost-action" onClick={onRestart}>
          Restart
        </button>
      </section>
    </main>
  )
}
