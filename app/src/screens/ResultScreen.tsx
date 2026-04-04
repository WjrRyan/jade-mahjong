import type { LevelConfig, LevelResult } from '../types/game'

interface ResultScreenProps {
  level: LevelConfig
  result: LevelResult
  hasNextLevel: boolean
  onNext: () => void
  onRetry: () => void
  onHome: () => void
}

export function ResultScreen({
  level,
  result,
  hasNextLevel,
  onNext,
  onRetry,
  onHome,
}: ResultScreenProps) {
  return (
    <main className="app-shell result-shell">
      <section className="result-panel result-panel--celebration">
        <div className="result-crown" aria-hidden="true">
          <div className="result-crown__halo" />
          <div className="result-crown__stars">{'★'.repeat(result.stars)}</div>
        </div>
        <div className="result-ribbon">
          {hasNextLevel ? 'Next gate unlocked' : 'Lantern hall complete'}
        </div>
        <p className="eyebrow">Level {level.id}</p>
        <h1>Round Complete</h1>
        <p className="hero-copy">
          You cleared <strong>{level.name}</strong> with a polished finish and lit the next gate.
        </p>
        <div className="hero-badges hero-badges--result">
          <span className="hero-badge">Calm finish</span>
          <span className="hero-badge">{result.stars} lantern stars</span>
          <span className="hero-badge">{result.moves} moves</span>
        </div>

        <div className="result-stats">
          <article className="stat-card">
            <span className="stat-label">Moves</span>
            <strong>{result.moves}</strong>
            <p className="stat-note">Par {level.parMoves}</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">Time</span>
            <strong>{result.timeSec}s</strong>
            <p className="stat-note">Par {level.parTimeSec}s</p>
          </article>
          <article className="stat-card">
            <span className="stat-label">Rating</span>
            <strong>{result.stars} / 3</strong>
            <p className="stat-note">Lantern stars</p>
          </article>
        </div>

        <div className="hero-actions result-actions">
          {hasNextLevel ? (
            <button className="primary-action" onClick={onNext}>
              Next Level
            </button>
          ) : null}
          <button className="ghost-action" onClick={onRetry}>
            Play Again
          </button>
          <button className="ghost-action" onClick={onHome}>
            Back to Hall
          </button>
        </div>
      </section>
    </main>
  )
}
