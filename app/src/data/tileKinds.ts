export interface TileKindMeta {
  id: string
  label: string
  family: 'wan' | 'tong' | 'tiao' | 'honor'
  imageUrl: string
  artScale: number
}

export const tileKinds: TileKindMeta[] = [
  { id: 'wan-1', label: '一万', family: 'wan', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Man1.svg', artScale: 0.58 },
  { id: 'wan-2', label: '二万', family: 'wan', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Man2.svg', artScale: 0.58 },
  { id: 'wan-3', label: '三万', family: 'wan', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Man3.svg', artScale: 0.58 },
  { id: 'tong-4', label: '四筒', family: 'tong', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Pin4.svg', artScale: 0.66 },
  { id: 'tong-5', label: '五筒', family: 'tong', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Pin5.svg', artScale: 0.66 },
  { id: 'tong-6', label: '六筒', family: 'tong', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Pin6.svg', artScale: 0.66 },
  { id: 'tiao-7', label: '七条', family: 'tiao', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Sou7.svg', artScale: 0.62 },
  { id: 'tiao-8', label: '八条', family: 'tiao', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Sou8.svg', artScale: 0.62 },
  { id: 'east', label: '东风', family: 'honor', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Ton.svg', artScale: 0.54 },
  { id: 'red', label: '红中', family: 'honor', imageUrl: 'https://cdn.jsdelivr.net/gh/FluffyStuff/riichi-mahjong-tiles@master/Regular/Chun.svg', artScale: 0.54 },
]

const kindById = new Map(tileKinds.map((kind) => [kind.id, kind]))

export function getTileKindMeta(kindId: string): TileKindMeta {
  return (
    kindById.get(kindId) ?? {
      id: kindId,
      label: kindId,
      family: 'honor',
      imageUrl: '',
      artScale: 0.58,
    }
  )
}
