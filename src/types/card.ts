export interface LessonCard {
  id: string
  name: string
  typeLine: string
  set: string
  collectorNumber: string
  /** Highest-resolution image Scryfall offers (745x1040 PNG). */
  imagePng: string
  /** JPG fallback if the PNG fails to load. */
  imageLarge: string
  scryfallUri: string
}
