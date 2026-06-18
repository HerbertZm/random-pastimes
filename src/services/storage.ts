import type { CostMapping } from '../types/mapping'

export interface MappingsRepository {
  load(): Promise<CostMapping[]>
  save(mappings: CostMapping[]): Promise<void>
}

const STORAGE_KEY = 'random-pastimes:mappings'

export class LocalMappingsRepository implements MappingsRepository {
  async load(): Promise<CostMapping[]> {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    try {
      const parsed = JSON.parse(raw) as Partial<CostMapping>[]
      if (!Array.isArray(parsed)) return []

      return parsed.map((mapping, index) => ({
        id: mapping.id ?? crypto.randomUUID(),
        key: mapping.key?.trim() || String(index + 1),
        costLabel: mapping.costLabel ?? '',
        outcomes: Array.isArray(mapping.outcomes) ? mapping.outcomes : [],
      }))
    } catch {
      return []
    }
  }

  async save(mappings: CostMapping[]): Promise<void> {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mappings))
  }
}

// Swap this implementation when adding a remote API later.
export const mappingsRepository: MappingsRepository = new LocalMappingsRepository()
