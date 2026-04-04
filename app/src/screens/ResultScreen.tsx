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
      <section className="result-panel">
        <p className="eyebrow">Level {level.id}</p>
        <h1>Round Complete</h1>
        <p className="hero-copy">
          You cleared <strong>{level.name}</strong> with a calm finish and unlocked the next step.
        </p>

        <div className="result-stats">
          <article className="stat-card">
            <span className="stat-label">Moves</span>
            <strong>{result.moves}</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Time</span>
            <strong>{result.timeSec}s</strong>
          </article>
          <article className="stat-card">
            <span className="stat-label">Rating</span>
            <strong>{result.stars} / 3</strong>
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
