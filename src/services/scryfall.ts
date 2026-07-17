import type { LessonCard } from '../types/card'
import bundledLessons from '../data/lessons.json'

/**
 * The exact Scryfall search behind this app:
 * Strixhaven (STX) cards of type "Lesson", paper printings only.
 * https://scryfall.com/search?q=type%3Alesson+%28game%3Apaper%29+set%3Astx
 */
const SEARCH_URL =
  'https://api.scryfall.com/cards/search?order=name&q=' +
  encodeURIComponent('type:lesson (game:paper) set:stx')

const fallback = bundledLessons as LessonCard[]

interface ScryfallCard {
  id: string
  name: string
  type_line?: string
  set?: string
  collector_number?: string
  scryfall_uri?: string
  image_uris?: { png?: string; large?: string }
}

interface ScryfallSearchResponse {
  data?: ScryfallCard[]
}

function normalize(card: ScryfallCard): LessonCard {
  const image = card.image_uris ?? {}
  return {
    id: card.id,
    name: card.name,
    typeLine: card.type_line ?? '',
    set: (card.set ?? '').toUpperCase(),
    collectorNumber: card.collector_number ?? '',
    imagePng: image.png ?? '',
    imageLarge: image.large ?? '',
    scryfallUri: card.scryfall_uri ?? '',
  }
}

/**
 * Load the full Lesson set. Tries the live Scryfall API for freshness and
 * falls back to the data bundled at build time if the request fails.
 */
export async function loadLessons(): Promise<LessonCard[]> {
  try {
    const response = await fetch(SEARCH_URL, {
      headers: { Accept: 'application/json' },
    })
    if (!response.ok) throw new Error(`Scryfall responded ${response.status}`)

    const body = (await response.json()) as ScryfallSearchResponse
    const cards = (body.data ?? []).map(normalize).filter((c) => c.imagePng)
    if (cards.length === 0) throw new Error('Scryfall returned no cards')
    return cards
  } catch (error) {
    console.warn('Falling back to bundled Lesson data:', error)
    return fallback
  }
}
