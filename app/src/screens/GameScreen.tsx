import { useEffect, useRef, useState } from 'react'
import { TileFace } from '../components/TileFace'
import { getTileKindMeta } from '../data/tileKinds'
import { getBoardScale } from '../game/boardViewport'
import { getComboMultiplier, isTileFree } from '../game/gameEngine'
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
  const doraMeta = getTileKindMeta(state.doraKind)
  const activeMultiplier = getComboMultiplier(state.comboCount)
  const comboTier = state.comboCount >= 5 ? 'storm' : state.comboCount >= 3 ? 'heat' : 'calm'
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
      <section className="top-bar top-bar--game">
        <div className="top-bar__main">
          <div className="round-meta round-meta--game">
            <p className="eyebrow">Lantern Hall · Level {level.id}</p>
            <h2>{level.name}</h2>
            <p className="round-subtitle">
              Match every free pair and keep the board glowing.
            </p>
          </div>
          <div className="top-bar__side">
            <div className="status-stack status-stack--game">
              <strong>{formatTime(state.timeSec)}</strong>
              <span>{state.status === 'stalled' ? 'Recoverable board' : 'In play'}</span>
            </div>
            <button className="ghost-action ghost-action--compact" onClick={onHome}>
              Pause / Home
            </button>
          </div>
        </div>
      </section>

      <section className="score-strip score-strip--game">
        <article className="mini-stat">
          <span>Score</span>
          <strong>{state.score}</strong>
          <small>Live total</small>
        </article>
        <article className="mini-stat">
          <span>Combo</span>
          <strong>{state.comboCount}</strong>
          <small>Best {state.bestCombo}</small>
        </article>
        <article className="mini-stat">
          <span>Multiplier</span>
          <strong>x{activeMultiplier.toFixed(1)}</strong>
          <small>3+ starts scaling</small>
        </article>
        <article className="mini-stat">
          <span>Remaining</span>
          <strong>{state.tiles.filter((tile) => !tile.removed).length}</strong>
          <small>Tiles on board</small>
        </article>
      </section>

      <section className="dora-stage">
        <div className="dora-stage__spotlight">
          <div className="dora-stage__tile">
            <TileFace meta={doraMeta} />
          </div>
          <div className="dora-stage__copy">
            <p className="dora-stage__eyebrow">Lucky tile</p>
            <strong>{doraMeta.label}</strong>
            <span>+150 bonus and full combo multiplier</span>
          </div>
        </div>
        <div className="dora-stage__stats">
          <span className="dora-stage__chip">Dora clears {state.doraMatches}</span>
          <span className={`dora-stage__chip dora-stage__chip--${comboTier}`}>
            Combo x{activeMultiplier.toFixed(1)}
          </span>
        </div>
      </section>

      <section
        key={state.lastClearAt ?? 'idle'}
        className={[
          'score-burst',
          state.lastScoreEvent ? 'score-burst--live' : 'score-burst--idle',
          state.lastScoreEvent?.isDoraMatch ? 'score-burst--dora' : '',
          comboTier === 'heat' ? 'score-burst--heat' : '',
          comboTier === 'storm' ? 'score-burst--storm' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div className="score-burst__impact">
          <strong>{state.lastScoreEvent ? `+${state.lastScoreEvent.totalAwarded}` : 'Ready'}</strong>
          <span>
            {state.lastScoreEvent
              ? state.lastScoreEvent.isDoraMatch
                ? 'Lucky Tile Hit'
                : 'Clean Pair'
              : `Hit ${doraMeta.label} for a boosted clear`}
          </span>
        </div>
        <div className="score-burst__meta">
          {state.lastScoreEvent ? (
            <>
              {state.lastScoreEvent.isDoraMatch ? (
                <span className="score-burst__pill score-burst__pill--dora">DORA!</span>
              ) : null}
              {state.lastScoreEvent.comboCount >= 3 ? (
                <span className={`score-burst__pill score-burst__pill--${comboTier}`}>
                  {state.lastScoreEvent.comboCount} Combo
                </span>
              ) : null}
              <span className="score-burst__pill">
                x{state.lastScoreEvent.comboMultiplier.toFixed(1)} multiplier
              </span>
            </>
          ) : (
            <>
              <span className="score-burst__pill score-burst__pill--dora">Lucky Tile +150</span>
              <span className="score-burst__pill">3 Combo starts bonus scaling</span>
            </>
          )}
        </div>
      </section>

      {state.status === 'stalled' ? (
        <section className="recovery-banner" role="status">
          <div>
            <strong>The jade table is locked for now</strong>
            <p>Smart Recovery can regroup the remaining tiles and uncover a fresh pair.</p>
          </div>
          <button className="primary-action" onClick={onSmartShuffle}>
            Smart Shuffle
          </button>
        </section>
      ) : null}

      <section
        className={`board-shell ${hintIds.length ? 'board-shell--hint-live' : ''}`}
        ref={boardShellRef}
      >
        <div className="board-shell__header">
          <div>
            <p className="board-shell__eyebrow">Jade table</p>
            <strong>Free tiles glow brighter and rise forward</strong>
          </div>
          <div className="board-shell__badges">
            <span className="board-shell__badge board-shell__badge--dora">
              Dora · {doraMeta.label}
            </span>
            <span className="board-shell__badge">
              {settings.seniorMode ? 'Senior view' : 'Classic view'}
            </span>
          </div>
        </div>
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
                    tile.kind === state.doraKind ? 'dora' : '',
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
        <div className="board-shell__footer">
          <span>Need a nudge? Use Hint to queue your next tap.</span>
          <span>
            {hintIds.length
              ? 'Hint prepared'
              : `Hints ${state.hintsUsed} · Shuffles ${state.shufflesUsed} · Dora clears ${state.doraMatches}`}
          </span>
        </div>
      </section>

      <section className="tool-row tool-row--game">
        <button className="primary-action primary-action--tool" onClick={onHint}>
          Hint
        </button>
        <button className="ghost-action ghost-action--tool" onClick={onShuffle}>
          Shuffle
        </button>
        <button className="ghost-action ghost-action--tool" onClick={onUndo}>
          Undo
        </button>
        <button className="ghost-action ghost-action--tool" onClick={onRestart}>
          Restart
        </button>
      </section>
    </main>
  )
}
