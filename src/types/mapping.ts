export interface CostMapping {
  id: string
  key: string
  costLabel: string
  outcomes: string[]
}

export type CostMappingInput = Omit<CostMapping, 'id'>
