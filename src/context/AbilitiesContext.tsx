import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { abilitiesRepository } from '../services/storage'
import type { Ability, AbilityInput } from '../types/ability'

interface AbilitiesContextValue {
  abilities: Ability[]
  loading: boolean
  addAbility: (input: AbilityInput) => Promise<void>
  updateAbility: (id: string, input: AbilityInput) => Promise<void>
  deleteAbility: (id: string) => Promise<void>
  resetAbilities: () => Promise<void>
}

const AbilitiesContext = createContext<AbilitiesContextValue | null>(null)

export function AbilitiesProvider({ children }: { children: ReactNode }) {
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    abilitiesRepository.load().then((data) => {
      if (!cancelled) {
        setAbilities(data)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const persist = useCallback(async (next: Ability[]) => {
    setAbilities(next)
    await abilitiesRepository.save(next)
  }, [])

  const addAbility = useCallback(
    async (input: AbilityInput) => {
      await persist([...abilities, { id: crypto.randomUUID(), ...input }])
    },
    [abilities, persist],
  )

  const updateAbility = useCallback(
    async (id: string, input: AbilityInput) => {
      await persist(
        abilities.map((ability) =>
          ability.id === id ? { id, ...input } : ability,
        ),
      )
    },
    [abilities, persist],
  )

  const deleteAbility = useCallback(
    async (id: string) => {
      await persist(abilities.filter((ability) => ability.id !== id))
    },
    [abilities, persist],
  )

  const resetAbilities = useCallback(async () => {
    setAbilities(await abilitiesRepository.reset())
  }, [])

  const value = useMemo(
    () => ({
      abilities,
      loading,
      addAbility,
      updateAbility,
      deleteAbility,
      resetAbilities,
    }),
    [abilities, loading, addAbility, updateAbility, deleteAbility, resetAbilities],
  )

  return (
    <AbilitiesContext.Provider value={value}>
      {children}
    </AbilitiesContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAbilities() {
  const context = useContext(AbilitiesContext)
  if (!context) {
    throw new Error('useAbilities must be used within AbilitiesProvider')
  }
  return context
}
