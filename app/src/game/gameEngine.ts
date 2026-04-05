import type { GameSnapshot, GameState, LevelConfig, ScoreEvent, SlotPosition, TileInstance } from '../types/game'

const PLAN_VARIANT_COUNT = 4
const PLAN_BRANCH_LIMIT = 12
const PLAN_LOOKAHEAD_DEPTH = 2
const BASE_PAIR_SCORE = 100
const DORA_BONUS_SCORE = 150
const COMBO_WINDOW_MS = 4_000
const levelPlanCache = new Map<string, [string, string][]>()

interface PlannedRemoval {
  plan: [string, string][]
  score: number
}

function positionKey(position: SlotPosition): string {
  return `${position.layer}:${position.x}:${position.y}`
}

function cloneTiles(tiles: TileInstance[]): TileInstance[] {
  return tiles.map((tile) => ({ ...tile }))
}

function cloneSnapshot(state: GameState): GameSnapshot {
  return {
    tiles: cloneTiles(state.tiles),
    selectedTileId: state.selectedTileId,
    moves: state.moves,
    hintsUsed: state.hintsUsed,
    shufflesUsed: state.shufflesUsed,
    status: state.status,
    score: state.score,
    comboCount: state.comboCount,
    bestCombo: state.bestCombo,
    doraKind: state.doraKind,
    doraMatches: state.doraMatches,
    lastClearAt: state.lastClearAt,
    lastScoreEvent: state.lastScoreEvent ? { ...state.lastScoreEvent } : null,
  }
}

function chooseDoraKind(tiles: TileInstance[], randomSource: () => number): string {
  const activeKinds = [...new Set(tiles.map((tile) => tile.kind))]
  const index = Math.floor(randomSource() * activeKinds.length)
  return activeKinds[index] ?? activeKinds[0]
}

export function getComboMultiplier(comboCount: number): number {
  if (comboCount >= 5) {
    return 1.6
  }
  if (comboCount >= 4) {
    return 1.4
  }
  if (comboCount >= 3) {
    return 1.2
  }
  return 1
}

function resetComboState(): Pick<GameState, 'comboCount' | 'lastClearAt' | 'lastScoreEvent'> {
  return {
    comboCount: 0,
    lastClearAt: null,
    lastScoreEvent: null,
  }
}

function hashValue(value: string): number {
  let hash = 0

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) >>> 0
  }

  return hash
}

function hasBlockingTop(tiles: TileInstance[], tile: TileInstance): boolean {
  return tiles.some(
    (candidate) =>
      !candidate.removed &&
      candidate.id !== tile.id &&
      candidate.layer > tile.layer &&
      candidate.x === tile.x &&
      candidate.y === tile.y,
  )
}

function sideBlocked(tiles: TileInstance[], tile: TileInstance, delta: -2 | 2): boolean {
  return tiles.some(
    (candidate) =>
      !candidate.removed &&
      candidate.id !== tile.id &&
      candidate.layer === tile.layer &&
      candidate.y === tile.y &&
      candidate.x === tile.x + delta,
  )
}

function getTile(tiles: TileInstance[], tileId: string): TileInstance | undefined {
  return tiles.find((tile) => tile.id === tileId)
}

function freeSlotKeys(slotsByKey: Map<string, SlotPosition>, occupiedKeys: Set<string>): string[] {
  const occupiedPositions = [...occupiedKeys].map((key) => slotsByKey.get(key)).filter((slot): slot is SlotPosition => Boolean(slot))

  return occupiedPositions
    .filter((slot) => {
      const blockedAbove = occupiedPositions.some(
        (candidate) => candidate.layer > slot.layer && candidate.x === slot.x && candidate.y === slot.y,
      )
      const blockedLeft = occupiedPositions.some(
        (candidate) => candidate.layer === slot.layer && candidate.y === slot.y && candidate.x === slot.x - 2,
      )
      const blockedRight = occupiedPositions.some(
        (candidate) => candidate.layer === slot.layer && candidate.y === slot.y && candidate.x === slot.x + 2,
      )

      return !blockedAbove && (!blockedLeft || !blockedRight)
    })
    .sort((left, right) => right.layer - left.layer || left.y - right.y || left.x - right.x)
    .map(positionKey)
}

function pairScore(
  left: SlotPosition,
  right: SlotPosition,
  leftKey: string,
  rightKey: string,
  variant: number,
): number {
  const horizontalDistance = Math.abs(left.x - right.x)
  const verticalDistance = Math.abs(left.y - right.y) * 4
  const layerDistance = Math.abs(left.layer - right.layer) * 6
  const sameRow = left.layer === right.layer && left.y === right.y
  const neighboringPair = sameRow && horizontalDistance === 2
  const tieBreaker = (hashValue(`${variant}:${leftKey}|${rightKey}`) % 1000) / 1000

  return (
    horizontalDistance +
    verticalDistance +
    layerDistance -
    (sameRow ? 2 : 0) -
    (neighboringPair ? 24 : 0) +
    tieBreaker
  )
}

function rankFreePairs(
  freeKeys: string[],
  slotsByKey: Map<string, SlotPosition>,
  variant: number,
): [string, string][] {
  const pairs: [string, string][] = []

  for (let index = 0; index < freeKeys.length; index += 1) {
    for (let sibling = index + 1; sibling < freeKeys.length; sibling += 1) {
      pairs.push([freeKeys[index], freeKeys[sibling]])
    }
  }

  return pairs.sort((leftPair, rightPair) => {
    const leftSlot = slotsByKey.get(leftPair[0])
    const leftSibling = slotsByKey.get(leftPair[1])
    const rightSlot = slotsByKey.get(rightPair[0])
    const rightSibling = slotsByKey.get(rightPair[1])

    if (!leftSlot || !leftSibling || !rightSlot || !rightSibling) {
      return 0
    }

    return (
      pairScore(rightSlot, rightSibling, rightPair[0], rightPair[1], variant) -
      pairScore(leftSlot, leftSibling, leftPair[0], leftPair[1], variant)
    )
  })
}

function buildRemovalPlan(level: LevelConfig, variant: number): [string, string][] {
  const cacheKey = `${level.id}:${variant}`
  const cached = levelPlanCache.get(cacheKey)
  if (cached) {
    return cached
  }

  const slotsByKey = new Map(level.slots.map((slot) => [positionKey(slot), slot]))
  const memo = new Map<string, PlannedRemoval | null>()

  function evaluateCandidates(
    occupiedKeys: Set<string>,
    rankedPairs: [string, string][],
    depth: number,
  ): PlannedRemoval | null {
    let best: PlannedRemoval | null = null

    for (const [leftKey, rightKey] of rankedPairs) {
      const nextOccupied = new Set(occupiedKeys)
      nextOccupied.delete(leftKey)
      nextOccupied.delete(rightKey)

      const rest = visit(nextOccupied, depth + 1)
      if (!rest) {
        continue
      }

      const left = slotsByKey.get(leftKey)
      const right = slotsByKey.get(rightKey)

      if (!left || !right) {
        continue
      }

      const candidate: PlannedRemoval = {
        plan: [[leftKey, rightKey], ...rest.plan],
        score: rest.score + pairScore(left, right, leftKey, rightKey, variant),
      }

      if (!best || candidate.score > best.score) {
        best = candidate
      }
    }

    return best
  }

  function findFirstPlan(
    occupiedKeys: Set<string>,
    rankedPairs: [string, string][],
    depth: number,
  ): PlannedRemoval | null {
    for (const [leftKey, rightKey] of rankedPairs) {
      const nextOccupied = new Set(occupiedKeys)
      nextOccupied.delete(leftKey)
      nextOccupied.delete(rightKey)

      const rest = visit(nextOccupied, depth + 1)
      if (rest) {
        return {
          plan: [[leftKey, rightKey], ...rest.plan],
          score: 0,
        }
      }
    }

    return null
  }

  function visit(occupiedKeys: Set<string>, depth: number): PlannedRemoval | null {
    if (occupiedKeys.size === 0) {
      return {
        plan: [],
        score: 0,
      }
    }

    const memoKey = `${depth}|${[...occupiedKeys].sort().join('|')}`
    const memoized = memo.get(memoKey)
    if (memoized !== undefined) {
      return memoized
    }

    const freeKeys = freeSlotKeys(slotsByKey, occupiedKeys)
    const rankedPairs = rankFreePairs(freeKeys, slotsByKey, variant)
    const shortlistedPairs = rankedPairs.slice(0, Math.min(PLAN_BRANCH_LIMIT, rankedPairs.length))
    const bestPlan =
      depth < PLAN_LOOKAHEAD_DEPTH
        ? evaluateCandidates(occupiedKeys, shortlistedPairs, depth) ??
          (shortlistedPairs.length === rankedPairs.length
            ? null
            : evaluateCandidates(occupiedKeys, rankedPairs, depth))
        : findFirstPlan(occupiedKeys, shortlistedPairs, depth) ??
          (shortlistedPairs.length === rankedPairs.length ? null : findFirstPlan(occupiedKeys, rankedPairs, depth))

    memo.set(memoKey, bestPlan)
    return bestPlan
  }

  const plannedRemoval = visit(new Set(level.slots.map(positionKey)), 0)
  if (!plannedRemoval) {
    throw new Error(`Level ${level.id} is not solvable with the current slot layout.`)
  }

  levelPlanCache.set(cacheKey, plannedRemoval.plan)
  return plannedRemoval.plan
}

function createTilesForLevel(level: LevelConfig, randomSource: () => number): TileInstance[] {
  const slotsByKey = new Map(level.slots.map((slot) => [positionKey(slot), slot]))
  const variant = level.tilePairs.length > 1 ? Math.floor(randomSource() * PLAN_VARIANT_COUNT) : 0
  const plan = buildRemovalPlan(level, variant)

  return plan.flatMap(([leftKey, rightKey], pairIndex) => {
    const kind = level.tilePairs[pairIndex % level.tilePairs.length]
    const left = slotsByKey.get(leftKey)
    const right = slotsByKey.get(rightKey)

    if (!left || !right) {
      throw new Error(`Level ${level.id} references an unknown slot while building tiles.`)
    }

    return [
      {
        id: `${level.id}-${leftKey}`,
        kind,
        layer: left.layer,
        x: left.x,
        y: left.y,
        removed: false,
        selected: false,
      },
      {
        id: `${level.id}-${rightKey}`,
        kind,
        layer: right.layer,
        x: right.x,
        y: right.y,
        removed: false,
        selected: false,
      },
    ]
  })
}

function withStatus(state: GameState): GameState {
  if (isLevelCleared(state.tiles)) {
    return { ...state, status: 'won' }
  }

  return {
    ...state,
    status: hasAvailableMatch(state.tiles) ? 'playing' : 'stalled',
  }
}

export function isTileFree(tiles: TileInstance[], tileId: string): boolean {
  const tile = getTile(tiles, tileId)
  if (!tile || tile.removed) {
    return false
  }

  const blockedAbove = hasBlockingTop(tiles, tile)
  const blockedLeft = sideBlocked(tiles, tile, -2)
  const blockedRight = sideBlocked(tiles, tile, 2)

  return !blockedAbove && (!blockedLeft || !blockedRight)
}

export function hasAvailableMatch(tiles: TileInstance[]): boolean {
  const freeTiles = tiles.filter((tile) => !tile.removed && isTileFree(tiles, tile.id))
  for (let index = 0; index < freeTiles.length; index += 1) {
    for (let sibling = index + 1; sibling < freeTiles.length; sibling += 1) {
      if (freeTiles[index].kind === freeTiles[sibling].kind) {
        return true
      }
    }
  }

  return false
}

export function isLevelCleared(tiles: TileInstance[]): boolean {
  return tiles.every((tile) => tile.removed)
}

export function createInitialGameState(level: LevelConfig, randomSource: () => number = Math.random): GameState {
  const tiles = createTilesForLevel(level, randomSource)
  const state: GameState = {
    levelId: level.id,
    level,
    tiles,
    selectedTileId: null,
    moves: 0,
    timeSec: 0,
    hintsUsed: 0,
    shufflesUsed: 0,
    status: 'playing',
    history: [],
    lastMatch: null,
    score: 0,
    comboCount: 0,
    bestCombo: 0,
    doraKind: chooseDoraKind(tiles, randomSource),
    doraMatches: 0,
    lastClearAt: null,
    lastScoreEvent: null,
  }

  return withStatus(state)
}

export function selectTile(state: GameState, tileId: string, currentTimeMs: number = Date.now()): GameState {
  if (state.status === 'won') {
    return state
  }

  const tile = getTile(state.tiles, tileId)
  if (!tile || tile.removed || !isTileFree(state.tiles, tileId)) {
    return state
  }

  if (state.selectedTileId === tileId) {
    return {
      ...state,
      selectedTileId: null,
      tiles: state.tiles.map((candidate) =>
        candidate.id === tileId ? { ...candidate, selected: false } : candidate,
      ),
      lastMatch: null,
    }
  }

  if (!state.selectedTileId) {
    return {
      ...state,
      selectedTileId: tileId,
      tiles: state.tiles.map((candidate) => ({
        ...candidate,
        selected: candidate.id === tileId,
      })),
      lastMatch: null,
    }
  }

  const selectedTile = getTile(state.tiles, state.selectedTileId)
  if (!selectedTile || selectedTile.removed) {
    return state
  }

  if (selectedTile.kind !== tile.kind || !isTileFree(state.tiles, selectedTile.id)) {
    return {
      ...state,
      ...resetComboState(),
      selectedTileId: tileId,
      tiles: state.tiles.map((candidate) => ({
        ...candidate,
        selected: candidate.id === tileId,
      })),
      lastMatch: null,
    }
  }

  const snapshot = cloneSnapshot(state)
  const isDoraMatch = selectedTile.kind === state.doraKind
  const doraBonus = isDoraMatch ? DORA_BONUS_SCORE : 0
  const comboCount =
    state.lastClearAt !== null && currentTimeMs - state.lastClearAt <= COMBO_WINDOW_MS
      ? state.comboCount + 1
      : 1
  const comboMultiplier = getComboMultiplier(comboCount)
  const pairScore = BASE_PAIR_SCORE
  const totalAwarded = Math.round((pairScore + doraBonus) * comboMultiplier)
  const lastScoreEvent: ScoreEvent = {
    pairScore,
    doraBonus,
    totalAwarded,
    comboCount,
    comboMultiplier,
    brokeCombo: state.comboCount > 0 && comboCount === 1,
    isDoraMatch,
  }

  const nextState: GameState = {
    ...state,
    selectedTileId: null,
    moves: state.moves + 1,
    score: state.score + totalAwarded,
    comboCount,
    bestCombo: Math.max(state.bestCombo, comboCount),
    doraMatches: state.doraMatches + (isDoraMatch ? 1 : 0),
    lastClearAt: currentTimeMs,
    lastScoreEvent,
    tiles: state.tiles.map((candidate) => {
      if (candidate.id === selectedTile.id || candidate.id === tile.id) {
        return {
          ...candidate,
          removed: true,
          selected: false,
        }
      }

      return {
        ...candidate,
        selected: false,
      }
    }),
    history: [...state.history, snapshot],
    lastMatch: [selectedTile.id, tile.id],
  }

  return withStatus(nextState)
}

export function shuffleFreeTiles(state: GameState): GameState {
  const freeTiles = state.tiles.filter((tile) => !tile.removed && isTileFree(state.tiles, tile.id))
  if (freeTiles.length < 2) {
    return state
  }

  const rotatedKinds = freeTiles.map((tile) => tile.kind)
  rotatedKinds.unshift(rotatedKinds.pop() ?? rotatedKinds[0])
  const kindById = new Map(freeTiles.map((tile, index) => [tile.id, rotatedKinds[index]]))
  const snapshot = cloneSnapshot(state)

  const nextState: GameState = {
    ...state,
    ...resetComboState(),
    shufflesUsed: state.shufflesUsed + 1,
    selectedTileId: null,
    tiles: state.tiles.map((tile) => ({
      ...tile,
      kind: kindById.get(tile.id) ?? tile.kind,
      selected: false,
    })),
    history: [...state.history, snapshot],
    lastMatch: null,
  }

  return withStatus(nextState)
}

export function smartShuffle(state: GameState): GameState {
  const activeTiles = state.tiles.filter((tile) => !tile.removed)
  const freeTiles = activeTiles.filter((tile) => isTileFree(state.tiles, tile.id))
  if (activeTiles.length < 2 || freeTiles.length < 2) {
    return state
  }

  const kindCounts = new Map<string, number>()
  activeTiles.forEach((tile) => {
    kindCounts.set(tile.kind, (kindCounts.get(tile.kind) ?? 0) + 1)
  })

  const pairKind =
    [...kindCounts.entries()].find((entry) => entry[1] >= 2)?.[0] ??
    activeTiles[0]?.kind

  if (!pairKind) {
    return state
  }

  const remainingKinds = activeTiles.map((tile) => tile.kind)
  let pairQuota = 2
  const redistributedKinds = remainingKinds.filter((kind) => {
    if (kind === pairKind && pairQuota > 0) {
      pairQuota -= 1
      return false
    }

    return true
  })

  const promotedFreeIds = freeTiles.slice(0, 2).map((tile) => tile.id)
  const nextKinds = new Map<string, string>()
  promotedFreeIds.forEach((tileId) => {
    nextKinds.set(tileId, pairKind)
  })

  activeTiles.forEach((tile) => {
    if (!nextKinds.has(tile.id)) {
      const nextKind = redistributedKinds.shift()
      if (nextKind) {
        nextKinds.set(tile.id, nextKind)
      }
    }
  })

  const snapshot = cloneSnapshot(state)
  const nextState: GameState = {
    ...state,
    ...resetComboState(),
    shufflesUsed: state.shufflesUsed + 1,
    selectedTileId: null,
    tiles: state.tiles.map((tile) => ({
      ...tile,
      kind: nextKinds.get(tile.id) ?? tile.kind,
      selected: false,
    })),
    history: [...state.history, snapshot],
    lastMatch: null,
  }

  return withStatus(nextState)
}

export function undoLastMove(state: GameState): GameState {
  const previous = state.history.at(-1)
  if (!previous) {
    return state
  }

  return {
    ...state,
    tiles: cloneTiles(previous.tiles),
    selectedTileId: previous.selectedTileId,
    moves: previous.moves,
    hintsUsed: previous.hintsUsed,
    shufflesUsed: previous.shufflesUsed,
    status: previous.status,
    score: previous.score,
    comboCount: previous.comboCount,
    bestCombo: previous.bestCombo,
    doraKind: previous.doraKind,
    doraMatches: previous.doraMatches,
    lastClearAt: previous.lastClearAt,
    lastScoreEvent: previous.lastScoreEvent ? { ...previous.lastScoreEvent } : null,
    history: state.history.slice(0, -1),
    lastMatch: null,
  }
}

export function findAvailableMatch(tiles: TileInstance[]): [string, string] | null {
  const freeTiles = tiles.filter((tile) => !tile.removed && isTileFree(tiles, tile.id))
  for (let index = 0; index < freeTiles.length; index += 1) {
    for (let sibling = index + 1; sibling < freeTiles.length; sibling += 1) {
      if (freeTiles[index].kind === freeTiles[sibling].kind) {
        return [freeTiles[index].id, freeTiles[sibling].id]
      }
    }
  }

  return null
}

export function revealHint(state: GameState): { nextState: GameState; hintIds: string[] } | null {
  const match = findAvailableMatch(state.tiles)
  if (!match) {
    return null
  }

  const [firstId, secondId] = match
  const leadId =
    state.selectedTileId && match.includes(state.selectedTileId)
      ? state.selectedTileId
      : firstId
  const partnerId = leadId === firstId ? secondId : firstId
  const preparedState = state.selectedTileId === leadId ? state : selectTile(state, leadId)

  return {
    nextState: markHintUsed(preparedState),
    hintIds: [partnerId],
  }
}

export function markHintUsed(state: GameState): GameState {
  return {
    ...state,
    ...resetComboState(),
    hintsUsed: state.hintsUsed + 1,
  }
}

export function restartLevel(level: LevelConfig): GameState {
  return createInitialGameState(level)
}

export function tickTimer(state: GameState, currentTimeMs: number = Date.now()): GameState {
  if (state.status !== 'playing') {
    return state
  }

  const comboState =
    state.comboCount > 0 && state.lastClearAt !== null && currentTimeMs - state.lastClearAt > COMBO_WINDOW_MS
      ? resetComboState()
      : {
          comboCount: state.comboCount,
          lastClearAt: state.lastClearAt,
          lastScoreEvent: state.lastScoreEvent,
        }

  return {
    ...state,
    ...comboState,
    timeSec: state.timeSec + 1,
  }
}
