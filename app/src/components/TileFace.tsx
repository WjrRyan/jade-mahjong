import type { TileKindMeta } from '../data/tileKinds'

interface TileFaceProps {
  meta: TileKindMeta
}

export function TileFace({ meta }: TileFaceProps) {
  if (!meta.imageUrl) {
    return <div className="tile-face tile-face--fallback" aria-hidden="true" />
  }

  return (
    <div className="tile-face" aria-hidden="true">
      <div className={`tile-plate tile-plate--${meta.family}`}>
        <div className="tile-art-wrap" style={{ ['--tile-art-scale' as string]: String(meta.artScale) }}>
          <img className="tile-art" src={meta.imageUrl} alt="" loading="lazy" decoding="async" />
        </div>
      </div>
    </div>
  )
}
