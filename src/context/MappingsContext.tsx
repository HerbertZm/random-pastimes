import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { mappingsRepository } from '../services/storage'
import type { CostMapping, CostMappingInput } from '../types/mapping'

interface MappingsContextValue {
  mappings: CostMapping[]
  loading: boolean
  addMapping: (input: CostMappingInput) => Promise<void>
  updateMapping: (id: string, input: CostMappingInput) => Promise<void>
  deleteMapping: (id: string) => Promise<void>
}

const MappingsContext = createContext<MappingsContextValue | null>(null)

export function MappingsProvider({ children }: { children: ReactNode }) {
  const [mappings, setMappings] = useState<CostMapping[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    mappingsRepository.load().then((data) => {
      if (!cancelled) {
        setMappings(data)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback(async (next: CostMapping[]) => {
    setMappings(next)
    await mappingsRepository.save(next)
  }, [])

  const addMapping = useCallback(
    async (input: CostMappingInput) => {
      const next: CostMapping = {
        id: crypto.randomUUID(),
        ...input,
      }
      await persist([...mappings, next])
    },
    [mappings, persist],
  )

  const updateMapping = useCallback(
    async (id: string, input: CostMappingInput) => {
      await persist(
        mappings.map((mapping) =>
          mapping.id === id ? { id, ...input } : mapping,
        ),
      )
    },
    [mappings, persist],
  )

  const deleteMapping = useCallback(
    async (id: string) => {
      await persist(mappings.filter((mapping) => mapping.id !== id))
    },
    [mappings, persist],
  )

  const value = useMemo(
    () => ({
      mappings,
      loading,
      addMapping,
      updateMapping,
      deleteMapping,
    }),
    [mappings, loading, addMapping, updateMapping, deleteMapping],
  )

  return (
    <MappingsContext.Provider value={value}>
      {children}
    </MappingsContext.Provider>
  )
}

export function useMappings() {
  const context = useContext(MappingsContext)
  if (!context) {
    throw new Error('useMappings must be used within MappingsProvider')
  }
  return context
}
