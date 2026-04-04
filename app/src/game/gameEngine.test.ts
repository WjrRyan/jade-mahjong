import {
  createInitialGameState,
  hasAvailableMatch,
  isLevelCleared,
  isTileFree,
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
    const state = createInitialGameState(baseLevel)
    const [first, second] = state.tiles
      .filter((tile) => !tile.removed)
      .slice(0, 2)
      .map((tile) => tile.id)

    const onceSelected = selectTile(state, first)
    const resolved = selectTile(onceSelected, second)

    expect(resolved.moves).toBe(1)
    expect(resolved.tiles.find((tile) => tile.id === first)?.removed).toBe(true)
    expect(resolved.tiles.find((tile) => tile.id === second)?.removed).toBe(true)
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
    const state = createInitialGameState(baseLevel)
    const ids = state.tiles.slice(0, 2).map((tile) => tile.id)
    const resolved = selectTile(selectTile(state, ids[0]), ids[1])
    const restored = undoLastMove(resolved)

    expect(restored.moves).toBe(0)
    expect(restored.tiles.every((tile) => tile.removed === false)).toBe(true)
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
