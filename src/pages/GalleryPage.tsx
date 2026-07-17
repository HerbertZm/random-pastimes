import { useCallback, useEffect, useState } from 'react'
import type { LessonCard } from '../types/card'
import { loadLessons } from '../services/scryfall'
import { sampleRandom } from '../utils/random'
import './GalleryPage.css'

const HAND_SIZE = 6

function CardTile({ card }: { card: LessonCard }) {
  // Start with the highest-res PNG; swap to the JPG only if it fails to load.
  const [src, setSrc] = useState(card.imagePng || card.imageLarge)

  return (
    <a
      className="card-tile"
      href={card.scryfallUri}
      target="_blank"
      rel="noreferrer"
      title={`${card.name} — view on Scryfall`}
    >
      <img
        className="card-tile__img"
        src={src}
        alt={card.name}
        loading="lazy"
        onError={() => {
          if (card.imageLarge && src !== card.imageLarge) setSrc(card.imageLarge)
        }}
      />
    </a>
  )
}

export function GalleryPage() {
  const [pool, setPool] = useState<LessonCard[]>([])
  const [hand, setHand] = useState<LessonCard[]>([])
  const [loading, setLoading] = useState(true)

  const deal = useCallback((cards: LessonCard[]) => {
    setHand(sampleRandom(cards, HAND_SIZE))
  }, [])

  useEffect(() => {
    let cancelled = false
    loadLessons().then((cards) => {
      if (cancelled) return
      setPool(cards)
      deal(cards)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [deal])

  if (loading) return null

  return (
    <div className="gallery">
      <ul className="gallery__grid">
        {hand.map((card) => (
          <li key={card.id} className="gallery__cell">
            <CardTile card={card} />
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="gallery__shuffle"
        onClick={() => deal(pool)}
      >
        Draw another 6
      </button>
    </div>
  )
}
