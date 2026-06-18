import { useState } from 'react'
import { useMappings } from '../context/MappingsContext'
import { pickRandom } from '../utils/random'
import './UserPage.css'

export function UserPage() {
  const { mappings, loading } = useMappings()
  const [outcomes, setOutcomes] = useState<Record<string, string>>({})

  function handleCostClick(mappingId: string) {
    const mapping = mappings.find((item) => item.id === mappingId)
    if (!mapping) return

    const outcome = pickRandom(mapping.outcomes)
    if (!outcome) return

    setOutcomes((current) => ({ ...current, [mappingId]: outcome }))
  }

  if (loading) {
    return <p className="page-status">Loading…</p>
  }

  if (mappings.length === 0) {
    return (
      <div className="user-page user-page--empty">
        <p className="page-status">
          No mappings yet. Head to Admin to create cost buttons and outcomes.
        </p>
      </div>
    )
  }

  return (
    <div className="user-page">
      <div className="user-page__hero" aria-hidden="true">
        <span className="user-page__hero-placeholder">sample image here</span>
      </div>

      <ul className="user-page__rows">
        {mappings.map((mapping) => (
          <li key={mapping.id} className="user-page__row">
            <button
              type="button"
              className="cost-btn"
              title={mapping.costLabel}
              aria-label={`${mapping.key}: ${mapping.costLabel}`}
              onClick={() => handleCostClick(mapping.id)}
            >
              {mapping.key}
            </button>
            <output className="user-page__outcome" aria-live="polite">
              {outcomes[mapping.id] ?? ''}
            </output>
          </li>
        ))}
      </ul>
    </div>
  )
}
