import type { Ability, AbsoluteCost } from '../types/ability'

const COST_PATTERN = /^([+−-]?)(\d+|X)$/i

/**
 * Normalizes a typed cost ("-3", "+2", "0", "-x") to the printed form
 * ("−3", "+2", "0", "−X"). Returns null if it isn't a valid loyalty cost.
 */
export function normalizeCost(input: string): string | null {
  const match = input.trim().match(COST_PATTERN)
  if (!match) return null

  const [, sign, rawValue] = match
  const value = rawValue.toUpperCase() === 'X' ? 'X' : String(Number(rawValue))

  if (value === '0') return '0'
  if (!sign) return null
  return `${sign === '+' ? '+' : '−'}${value}`
}

export function absoluteCostOf(cost: string): AbsoluteCost {
  const value = cost.replace(/^[+−-]/, '')
  return value.toUpperCase() === 'X' ? 'X' : Number(value)
}

/** X costs count as whatever number was picked. */
export function matchesNumber(ability: Ability, value: number): boolean {
  return ability.absoluteCost === 'X' || ability.absoluteCost === value
}

/** Every concrete number that at least one ability costs, ascending. */
export function availableNumbers(abilities: Ability[]): number[] {
  const numbers = new Set<number>()
  for (const ability of abilities) {
    if (ability.absoluteCost !== 'X') numbers.add(ability.absoluteCost)
  }
  return [...numbers].sort((a, b) => a - b)
}
