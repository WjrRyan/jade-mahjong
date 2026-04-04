import type { LevelConfig, SlotPosition } from '../types/game'

function rowSlots(layer: number, y: number, xs: number[]): SlotPosition[] {
  return xs.map((x) => ({ layer, x, y }))
}

function createLevel(
  id: number,
  name: string,
  difficulty: LevelConfig['difficulty'],
  slots: SlotPosition[],
  parMoves: number,
  parTimeSec: number,
  tilePairs: string[],
): LevelConfig {
  return {
    id,
    name,
    difficulty,
    slots,
    parMoves,
    parTimeSec,
    tilePairs,
  }
}

const easyKinds = ['wan-1', 'wan-2', 'wan-3', 'tong-4', 'tong-5', 'tong-6']
const mediumKinds = ['wan-1', 'wan-2', 'wan-3', 'tong-4', 'tong-5', 'tong-6', 'tiao-7', 'tiao-8']
const hardKinds = ['wan-1', 'wan-2', 'wan-3', 'tong-4', 'tong-5', 'tong-6', 'tiao-7', 'tiao-8', 'east', 'red']

export const levelConfigs: LevelConfig[] = [
  createLevel(1, 'Dawn Pairing', 'easy', rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), 3, 75, easyKinds),
  createLevel(2, 'Garden Walk', 'easy', [...rowSlots(0, 0, [0, 2, 4, 6]), ...rowSlots(0, 2, [0, 2, 4, 6])], 4, 90, easyKinds),
  createLevel(3, 'Quiet Bridge', 'easy', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(1, 0, [4, 6])], 4, 105, easyKinds),
  createLevel(4, 'Tea House', 'easy', [...rowSlots(0, 0, [0, 2, 4, 6]), ...rowSlots(0, 2, [2, 4, 6, 8]), ...rowSlots(1, 2, [4, 6])], 5, 115, easyKinds),
  createLevel(5, 'Bamboo Gate', 'easy', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [2, 4, 6, 8]), ...rowSlots(1, 0, [4, 6])], 6, 125, easyKinds),
  createLevel(6, 'River Lanterns', 'medium', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [0, 2, 4, 6, 8, 10])], 6, 130, mediumKinds),
  createLevel(7, 'Jade Lane', 'medium', [...rowSlots(0, 0, [0, 2, 4, 6]), ...rowSlots(0, 2, [0, 2, 4, 6]), ...rowSlots(0, 4, [0, 2, 4, 6])], 6, 145, mediumKinds),
  createLevel(8, 'Moon Steps', 'medium', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [2, 4, 6, 8]), ...rowSlots(1, 2, [4, 6]), ...rowSlots(1, 0, [4, 6])], 7, 160, mediumKinds),
  createLevel(9, 'Amber Court', 'medium', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [0, 2, 4, 6, 8, 10]), ...rowSlots(1, 0, [2, 4, 6, 8])], 8, 175, mediumKinds),
  createLevel(10, 'Willow Echo', 'medium', [...rowSlots(0, 0, [0, 2, 4, 6]), ...rowSlots(0, 2, [2, 4, 6, 8]), ...rowSlots(0, 4, [0, 2, 4, 6]), ...rowSlots(1, 2, [4, 6])], 8, 180, mediumKinds),
  createLevel(11, 'Golden Brook', 'medium', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [2, 4, 6, 8]), ...rowSlots(0, 4, [0, 2, 4, 6, 8, 10])], 8, 190, mediumKinds),
  createLevel(12, 'Silk Veranda', 'medium', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [0, 2, 4, 6, 8, 10]), ...rowSlots(1, 0, [4, 6]), ...rowSlots(1, 2, [4, 6])], 10, 200, mediumKinds),
  createLevel(13, 'Crane Spiral', 'hard', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 4, [0, 2, 4, 6, 8, 10]), ...rowSlots(1, 2, [4, 6])], 10, 210, hardKinds),
  createLevel(14, 'Tiled Courtyard', 'hard', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10, 12, 14]), ...rowSlots(0, 2, [2, 4, 6, 8, 10, 12]), ...rowSlots(1, 0, [6, 8])], 10, 220, hardKinds),
  createLevel(15, 'Pearl Harbor', 'hard', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [2, 4, 6, 8]), ...rowSlots(0, 4, [4, 6]), ...rowSlots(1, 0, [4, 6]), ...rowSlots(1, 2, [4, 6])], 9, 215, hardKinds),
  createLevel(16, 'Evening Blossom', 'hard', [...rowSlots(0, 0, [0, 2, 4, 6]), ...rowSlots(0, 2, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 4, [0, 2, 4, 6]), ...rowSlots(1, 2, [2, 4, 6, 8])], 10, 225, hardKinds),
  createLevel(17, 'Zen Cascade', 'hard', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 4, [2, 4, 6, 8]), ...rowSlots(1, 2, [4, 6]), ...rowSlots(2, 2, [4, 6])], 11, 235, hardKinds),
  createLevel(18, 'Lantern Summit', 'hard', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10, 12, 14]), ...rowSlots(0, 2, [0, 2, 4, 6, 8, 10, 12, 14]), ...rowSlots(1, 0, [4, 6, 8, 10])], 12, 245, hardKinds),
  createLevel(19, 'Imperial Path', 'hard', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10]), ...rowSlots(0, 2, [2, 4, 6, 8]), ...rowSlots(0, 4, [0, 2, 4, 6, 8, 10]), ...rowSlots(1, 0, [2, 4, 6, 8]), ...rowSlots(1, 4, [2, 4, 6, 8])], 12, 260, hardKinds),
  createLevel(20, 'Celestial Hall', 'hard', [...rowSlots(0, 0, [0, 2, 4, 6, 8, 10, 12, 14]), ...rowSlots(0, 2, [2, 4, 6, 8, 10, 12]), ...rowSlots(0, 4, [0, 2, 4, 6, 8, 10, 12, 14]), ...rowSlots(1, 2, [4, 6, 8, 10]), ...rowSlots(2, 2, [6, 8])], 13, 280, hardKinds),
]
