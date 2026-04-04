export type Difficulty = 'easy' | 'medium' | 'hard'

export type GameStatus = 'playing' | 'won' | 'stalled' | 'paused'

export interface SlotPosition {
  layer: number
  x: number
  y: number
}

export interface LevelConfig {
  id: number
  name: string
  difficulty: Difficulty
  slots: SlotPosition[]
  tilePairs: string[]
  parMoves: number
  parTimeSec: number
}

export interface TileInstance extends SlotPosition {
  id: string
  kind: string
  removed: boolean
  selected: boolean
}

export interface GameSnapshot {
  tiles: TileInstance[]
  selectedTileId: string | null
  moves: number
  hintsUsed: number
  shufflesUsed: number
  status: GameStatus
}

export interface GameState {
  levelId: number
  level: LevelConfig
  tiles: TileInstance[]
  selectedTileId: string | null
  moves: number
  timeSec: number
  hintsUsed: number
  shufflesUsed: number
  status: GameStatus
  history: GameSnapshot[]
  lastMatch: [string, string] | null
}

export interface GameSettings {
  seniorMode: boolean
  highlightHints: boolean
  soundEnabled: boolean
}

export interface LevelResult {
  moves: number
  timeSec: number
  stars: number
}

export interface ProgressState {
  unlockedLevel: number
  bestResultsByLevel: Record<number, LevelResult>
  settings: GameSettings
}
