import {
  createInitialGameState,
  hasAvailableMatch,
  isLevelCleared,
  isTileFree,
  markHintUsed,
  selectTile,
  shuffleFreeTiles,
  undoLastMove,
} from './gameEngine'
import type { LevelConfig, TileInstance } from '../types/game'

function createTile(
  id: string,
  kind: string,
  layer: number,
  x: number,
  y: number,
  removed = false,
): TileInstance {
  return {
    id,
    kind,
    layer,
    x,
    y,
    removed,
    selected: false,
  }
}

const baseLevel: LevelConfig = {
  id: 1,
  name: 'Starter',
  difficulty: 'easy',
  slots: [
    { layer: 0, x: 0, y: 0 },
    { layer: 0, x: 2, y: 0 },
    { layer: 0, x: 4, y: 0 },
    { layer: 0, x: 6, y: 0 },
  ],
  tilePairs: ['wan-1', 'tong-4'],
  parMoves: 2,
  parTimeSec: 45,
}

describe('gameEngine', () => {
  it('avoids clustering every opening pair into neighboring identical tiles on a flat row', () => {
    const spacedLevel: LevelConfig = {
      id: 99,
      name: 'Spacing Check',
      difficulty: 'easy',
      slots: [
        { layer: 0, x: 0, y: 0 },
        { layer: 0, x: 2, y: 0 },
        { layer: 0, x: 4, y: 0 },
        { layer: 0, x: 6, y: 0 },
      ],
      tilePairs: ['wan-1', 'tong-4'],
      parMoves: 2,
      parTimeSec: 45,
    }

    const state = createInitialGameState(spacedLevel)
    const neighboringPairCount = spacedLevel.tilePairs.filter((kind) => {
      const pair = state.tiles.filter((tile) => tile.kind === kind)
      return (
        pair.length === 2 &&
        pair[0].layer === pair[1].layer &&
        pair[0].y === pair[1].y &&
        Math.abs(pair[0].x - pair[1].x) === 2
      )
    }).length

    expect(neighboringPairCount).toBeLessThan(spacedLevel.tilePairs.length)
  })

  it('treats a tile as blocked when a tile overlaps above it', () => {
    const tiles = [
      createTile('left', 'wan-1', 0, -2, 0),
      createTile('center', 'tong-4', 0, 0, 0),
      createTile('top', 'red', 1, 0, 0),
    ]

    expect(isTileFree(tiles, 'center')).toBe(false)
    expect(isTileFree(tiles, 'left')).toBe(true)
  })

  it('matches equal free tiles and increases move count', () => {
    const state = createInitialGameState(baseLevel, () => 0)
    const [first, second] = state.tiles
      .filter((tile) => !tile.removed)
      .slice(0, 2)
      .map((tile) => tile.id)

    const onceSelected = selectTile(state, first, 1_000)
    const resolved = selectTile(onceSelected, second, 1_500)

    expect(resolved.moves).toBe(1)
    expect(resolved.tiles.find((tile) => tile.id === first)?.removed).toBe(true)
    expect(resolved.tiles.find((tile) => tile.id === second)?.removed).toBe(true)
    expect(resolved.score).toBe(250)
    expect(resolved.doraMatches).toBe(1)
    expect(resolved.lastScoreEvent?.isDoraMatch).toBe(true)
  })

  it('shuffles only currently free tiles and tracks shuffle usage', () => {
    const tiles = [
      createTile('a', 'wan-1', 0, 0, 0),
      createTile('b', 'tong-4', 0, 2, 0),
      createTile('c', 'tiao-7', 0, 4, 0),
      createTile('d', 'east', 0, 6, 0),
      createTile('e', 'red', 1, 6, 0),
    ]
    const state = {
      ...createInitialGameState(baseLevel),
      tiles,
      shufflesUsed: 0,
    }

    const shuffled = shuffleFreeTiles(state)

    expect(shuffled.shufflesUsed).toBe(1)
    expect(shuffled.tiles.find((tile) => tile.id === 'd')?.kind).toBe('east')
    expect(
      shuffled.tiles
        .filter((tile) => tile.id !== 'd')
        .map((tile) => tile.kind)
        .sort(),
    ).toEqual(
      ['red', 'tiao-7', 'tong-4', 'wan-1'],
    )
  })

  it('undoes the latest move snapshot', () => {
    const state = createInitialGameState(baseLevel, () => 0)
    const ids = state.tiles.slice(0, 2).map((tile) => tile.id)
    const resolved = selectTile(selectTile(state, ids[0], 1_000), ids[1], 1_500)
    const restored = undoLastMove(resolved)

    expect(restored.moves).toBe(0)
    expect(restored.tiles.every((tile) => tile.removed === false)).toBe(true)
    expect(restored.score).toBe(0)
    expect(restored.comboCount).toBe(0)
  })

  it('assigns one dora kind from the active board kinds at the start of a level', () => {
    const state = createInitialGameState(baseLevel, () => 0)
    const activeKinds = new Set(state.tiles.map((tile) => tile.kind))

    expect(activeKinds.has(state.doraKind)).toBe(true)
  })

  it('applies combo multipliers from the third clear onward and scales dora bonus with it', () => {
    const comboLevel: LevelConfig = {
      id: 77,
      name: 'Combo Check',
      difficulty: 'easy',
      slots: [
        { layer: 0, x: 0, y: 0 },
        { layer: 0, x: 2, y: 0 },
        { layer: 0, x: 4, y: 0 },
        { layer: 0, x: 6, y: 0 },
        { layer: 0, x: 8, y: 0 },
        { layer: 0, x: 10, y: 0 },
      ],
      tilePairs: ['wan-1', 'tong-4', 'wan-1'],
      parMoves: 3,
      parTimeSec: 60,
    }

    const state = createInitialGameState(comboLevel, () => 0)
    const firstPair = state.tiles.filter((tile) => tile.kind === 'wan-1').slice(0, 2).map((tile) => tile.id)
    const secondPair = state.tiles.filter((tile) => tile.kind === 'tong-4').map((tile) => tile.id)
    const lastPair = state.tiles.filter((tile) => tile.kind === 'wan-1').slice(2).map((tile) => tile.id)

    const afterFirst = selectTile(selectTile(state, firstPair[0], 1_000), firstPair[1], 1_400)
    const afterSecond = selectTile(selectTile(afterFirst, secondPair[0], 2_000), secondPair[1], 2_400)
    const afterThird = selectTile(selectTile(afterSecond, lastPair[0], 3_000), lastPair[1], 3_300)

    expect(afterThird.comboCount).toBe(3)
    expect(afterThird.bestCombo).toBe(3)
    expect(afterThird.lastScoreEvent?.comboMultiplier).toBe(1.2)
    expect(afterThird.lastScoreEvent?.totalAwarded).toBe(300)
    expect(afterThird.score).toBe(650)
  })

  it('reaches the five-combo cap multiplier and resets combo when the player uses hint', () => {
    const comboLevel: LevelConfig = {
      id: 88,
      name: 'Long Combo',
      difficulty: 'easy',
      slots: [
        { layer: 0, x: 0, y: 0 },
        { layer: 0, x: 2, y: 0 },
        { layer: 0, x: 4, y: 0 },
        { layer: 0, x: 6, y: 0 },
        { layer: 0, x: 8, y: 0 },
        { layer: 0, x: 10, y: 0 },
        { layer: 0, x: 12, y: 0 },
        { layer: 0, x: 14, y: 0 },
        { layer: 0, x: 16, y: 0 },
        { layer: 0, x: 18, y: 0 },
      ],
      tilePairs: ['wan-1', 'tong-4', 'wan-2', 'tong-5', 'wan-1'],
      parMoves: 5,
      parTimeSec: 90,
    }

    let state = createInitialGameState(comboLevel, () => 0)
    const pairKinds = ['wan-1', 'tong-4', 'wan-2', 'tong-5', 'wan-1']

    pairKinds.forEach((kind, index) => {
      const ids = state.tiles.filter((tile) => !tile.removed && tile.kind === kind).slice(0, 2).map((tile) => tile.id)
      state = selectTile(selectTile(state, ids[0], 1_000 + index * 500), ids[1], 1_200 + index * 500)
    })

    expect(state.comboCount).toBe(5)
    expect(state.bestCombo).toBe(5)
    expect(state.lastScoreEvent?.comboMultiplier).toBe(1.6)

    const hinted = markHintUsed(state)

    expect(hinted.comboCount).toBe(0)
    expect(hinted.lastClearAt).toBeNull()
  })

  it('detects stalled boards with no remaining match', () => {
    const tiles = [
      createTile('a', 'wan-1', 0, 0, 0),
      createTile('b', 'tong-4', 0, 2, 0),
      createTile('c', 'tiao-7', 0, 4, 0),
      createTile('d', 'east', 0, 6, 0),
    ]

    expect(hasAvailableMatch(tiles)).toBe(false)
    expect(isLevelCleared(tiles)).toBe(false)
  })

  it('detects cleared boards', () => {
    const tiles = [
      createTile('a', 'wan-1', 0, 0, 0, true),
      createTile('b', 'wan-1', 0, 2, 0, true),
    ]

    expect(isLevelCleared(tiles)).toBe(true)
  })
})
