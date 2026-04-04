import type { LevelConfig, ProgressState } from '../types/game'
import heroImage from '../assets/hero.png'

interface HomeScreenProps {
  levels: LevelConfig[]
  progress: ProgressState
  onStartLevel: (levelId: number) => void
  onUpdateSettings: (patch: Partial<ProgressState['settings']>) => void
}

export function HomeScreen({
  levels,
  progress,
  onStartLevel,
  onUpdateSettings,
}: HomeScreenProps) {
  const completedCount = Object.keys(progress.bestResultsByLevel).length
  const totalStars = Object.values(progress.bestResultsByLevel).reduce(
    (sum, result) => sum + result.stars,
    0,
  )
  const nextLevel = Math.min(progress.unlockedLevel, levels.length)

  return (
    <main className="app-shell home-shell">
      <section className="hero-panel hero-panel--lobby">
        <div className="hero-copy-stack">
          <p className="eyebrow">Pocket Vita-style Mahjong</p>
          <h1>Jade Mahjong</h1>
          <p className="hero-copy">
            A polished mobile-first solitaire hall with floating ivory tiles, calmer pacing,
            and rewarding one-hand sessions across 20 handcrafted rounds.
          </p>
          <div className="hero-badges">
            <span className="hero-badge">20 handcrafted levels</span>
            <span className="hero-badge">Senior-friendly mode</span>
            <span className="hero-badge">Instant recoveries</span>
          </div>
          <div className="hero-actions">
            <button
              className="primary-action"
              onClick={() => onStartLevel(nextLevel)}
            >
              Start Journey
            </button>
            <div className="progress-pill">
              <span>Next gate</span>
              <strong>Level {nextLevel}</strong>
            </div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual__halo" />
          <div className="hero-visual__card">
            <img src={heroImage} alt="" className="hero-visual__image" />
          </div>
          <div className="hero-visual__chip hero-visual__chip--top">Jade Glow</div>
          <div className="hero-visual__chip hero-visual__chip--bottom">Soft Prestige</div>
        </div>
      </section>

      <section className="dashboard-row">
        <article className="stat-card stat-card--lobby">
          <span className="stat-label">Unlocked</span>
          <strong>{progress.unlockedLevel}</strong>
          <p className="stat-note">Open lantern gates</p>
        </article>
        <article className="stat-card stat-card--lobby">
          <span className="stat-label">Best seals</span>
          <strong>{totalStars}</strong>
          <p className="stat-note">Stars gathered</p>
        </article>
        <article className="stat-card stat-card--lobby">
          <span className="stat-label">Mode</span>
          <strong>{progress.settings.seniorMode ? 'Senior' : 'Classic'}</strong>
          <p className="stat-note">Reading comfort</p>
        </article>
      </section>

      <section className="settings-panel">
        <div className="panel-header panel-header--stack">
          <p className="panel-title">Comfort Settings</p>
          <p className="panel-copy">
            Keep the room calm and readable with a few high-impact mobile toggles.
          </p>
        </div>
        <label className="setting-row">
          <span className="setting-copy">
            <strong>Senior Mode</strong>
            <small>Enlarge tile faces and reading targets</small>
          </span>
          <input
            type="checkbox"
            checked={progress.settings.seniorMode}
            onChange={(event) => onUpdateSettings({ seniorMode: event.target.checked })}
          />
        </label>
        <label className="setting-row">
          <span className="setting-copy">
            <strong>Highlight hints</strong>
            <small>Keep suggested pairs softly illuminated</small>
          </span>
          <input
            type="checkbox"
            checked={progress.settings.highlightHints}
            onChange={(event) => onUpdateSettings({ highlightHints: event.target.checked })}
          />
        </label>
        <label className="setting-row">
          <span className="setting-copy">
            <strong>Sound cues</strong>
            <small>Reserve space for future tactile feedback</small>
          </span>
          <input
            type="checkbox"
            checked={progress.settings.soundEnabled}
            onChange={(event) => onUpdateSettings({ soundEnabled: event.target.checked })}
          />
        </label>
      </section>

      <section className="level-grid-panel">
        <div className="panel-header">
          <div>
            <p className="panel-title">Lantern Hall</p>
            <p className="panel-copy">Clear one chamber to light the next path forward.</p>
          </div>
          <div className="panel-pill">{completedCount} / {levels.length} cleared</div>
        </div>
        <div className="level-grid">
          {levels.map((level) => {
            const locked = level.id > progress.unlockedLevel
            const result = progress.bestResultsByLevel[level.id]
            const isNext = level.id === nextLevel && !locked

            return (
              <button
                key={level.id}
                data-level={String(level.id).padStart(2, '0')}
                className={`level-card ${locked ? 'locked' : ''} ${isNext ? 'next' : ''}`}
                disabled={locked}
                onClick={() => onStartLevel(level.id)}
              >
                <div className="level-card__topline">
                  <span className="level-index">Level {level.id}</span>
                  <span className={`difficulty-pill difficulty-pill--${level.difficulty}`}>
                    {level.difficulty}
                  </span>
                </div>
                <strong>{level.name}</strong>
                <span className="level-meta">{level.slots.length / 2} pairs in the chamber</span>
                <div className="level-card__footer">
                  <span className="level-score">
                    {result ? `Best ${result.stars}/3` : locked ? 'Locked' : isNext ? 'Next up' : 'Ready'}
                  </span>
                  {result ? <span className="level-stars">{'★'.repeat(result.stars)}</span> : null}
                </div>
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}
