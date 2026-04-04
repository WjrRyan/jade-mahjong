import type { LevelConfig, ProgressState } from '../types/game'

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

  return (
    <main className="app-shell home-shell">
      <section className="hero-panel">
        <p className="eyebrow">Senior-friendly calm puzzle</p>
        <h1>Jade Mahjong</h1>
        <p className="hero-copy">
          A warm mobile-first solitaire flow inspired by Vita Mahjong: larger tiles,
          calmer pacing, and quick restarts for a comfortable 20-level run.
        </p>
        <div className="hero-actions">
          <button
            className="primary-action"
            onClick={() => onStartLevel(Math.min(progress.unlockedLevel, levels.length))}
          >
            Start Journey
          </button>
          <div className="progress-pill">
            <strong>{completedCount}</strong> / {levels.length} cleared
          </div>
        </div>
      </section>

      <section className="dashboard-row">
        <article className="stat-card">
          <span className="stat-label">Unlocked</span>
          <strong>{progress.unlockedLevel}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Best seals</span>
          <strong>{totalStars}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Mode</span>
          <strong>{progress.settings.seniorMode ? 'Senior' : 'Classic'}</strong>
        </article>
      </section>

      <section className="settings-panel">
        <div>
          <p className="panel-title">Comfort Settings</p>
          <p className="panel-copy">Keep the setup focused on the highest-value mobile options.</p>
        </div>
        <label className="setting-row">
          <span>Senior Mode</span>
          <input
            type="checkbox"
            checked={progress.settings.seniorMode}
            onChange={(event) => onUpdateSettings({ seniorMode: event.target.checked })}
          />
        </label>
        <label className="setting-row">
          <span>Highlight hints</span>
          <input
            type="checkbox"
            checked={progress.settings.highlightHints}
            onChange={(event) => onUpdateSettings({ highlightHints: event.target.checked })}
          />
        </label>
        <label className="setting-row">
          <span>Sound cues</span>
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
            <p className="panel-title">20 Level Hall</p>
            <p className="panel-copy">Finish one round to unlock the next chamber.</p>
          </div>
        </div>
        <div className="level-grid">
          {levels.map((level) => {
            const locked = level.id > progress.unlockedLevel
            const result = progress.bestResultsByLevel[level.id]

            return (
              <button
                key={level.id}
                className={`level-card ${locked ? 'locked' : ''}`}
                disabled={locked}
                onClick={() => onStartLevel(level.id)}
              >
                <span className="level-index">Level {level.id}</span>
                <strong>{level.name}</strong>
                <span className="level-meta">
                  {level.difficulty} · {level.slots.length / 2} pairs
                </span>
                <span className="level-score">
                  {result ? `Best ${result.stars}/3` : locked ? 'Locked' : 'Ready'}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </main>
  )
}
