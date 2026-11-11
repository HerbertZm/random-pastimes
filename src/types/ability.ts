/** A loyalty cost's size with the sign dropped. 'X' matches any number. */
export type AbsoluteCost = number | 'X'

export interface Ability {
  id: string
  /** Name of the Jace the ability comes from. */
  source: string
  /** Cost as printed, e.g. "+1", "−3", "0", "−X". */
  cost: string
  /** Same as cost but ignoring + / −. */
  absoluteCost: AbsoluteCost
  oracleText: string
}

export type AbilityInput = Omit<Ability, 'id'>
