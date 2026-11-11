import defaultAbilities from '../data/jaceAbilities.json'
import type { Ability } from '../types/ability'
import { absoluteCostOf } from '../utils/cost'

export interface AbilitiesRepository {
  load(): Promise<Ability[]>
  save(abilities: Ability[]): Promise<void>
  reset(): Promise<Ability[]>
}

const STORAGE_KEY = 'random-pastimes:abilities'

export function getDefaultAbilities(): Ability[] {
  return (defaultAbilities as Ability[]).map((ability) => ({ ...ability }))
}

export class LocalAbilitiesRepository implements AbilitiesRepository {
  async load(): Promise<Ability[]> {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return getDefaultAbilities()

    try {
      const parsed = JSON.parse(raw) as Partial<Ability>[]
      if (!Array.isArray(parsed)) return getDefaultAbilities()

      return parsed
        .filter((item) => item.cost && item.oracleText)
        .map((item) => ({
          id: item.id ?? crypto.randomUUID(),
          source: item.source ?? '',
          cost: item.cost!,
          absoluteCost: absoluteCostOf(item.cost!),
          oracleText: item.oracleText!,
        }))
    } catch {
      return getDefaultAbilities()
    }
  }

  async save(abilities: Ability[]): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(abilities))
  }

  async reset(): Promise<Ability[]> {
    localStorage.removeItem(STORAGE_KEY)
    return getDefaultAbilities()
  }
}

// Swap this implementation when adding a remote API later.
export const abilitiesRepository: AbilitiesRepository =
  new LocalAbilitiesRepository()
