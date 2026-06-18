import { useState, type FormEvent } from 'react'
import { useMappings } from '../context/MappingsContext'
import type { CostMapping } from '../types/mapping'
import './AdminPage.css'

function outcomesFromText(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function outcomesToText(outcomes: string[]): string {
  return outcomes.join('\n')
}

interface MappingFormProps {
  initialKey?: string
  initialCostLabel?: string
  initialOutcomesText?: string
  submitLabel: string
  onSubmit: (key: string, costLabel: string, outcomes: string[]) => void
  onCancel?: () => void
}

function MappingForm({
  initialKey = '',
  initialCostLabel = '',
  initialOutcomesText = '',
  submitLabel,
  onSubmit,
  onCancel,
}: MappingFormProps) {
  const [key, setKey] = useState(initialKey)
  const [costLabel, setCostLabel] = useState(initialCostLabel)
  const [outcomesText, setOutcomesText] = useState(initialOutcomesText)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedKey = key.trim()
    const trimmedLabel = costLabel.trim()
    const outcomes = outcomesFromText(outcomesText)
    if (!trimmedKey || !trimmedLabel || outcomes.length === 0) return
    onSubmit(trimmedKey, trimmedLabel, outcomes)
    if (!onCancel) {
      setCostLabel('')
      setOutcomesText('')
    }
  }

  return (
    <form className="mapping-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Button key</span>
        <input
          className="field__input field__input--short"
          value={key}
          onChange={(event) => setKey(event.target.value)}
          placeholder="e.g. 1"
          required
        />
      </label>

      <label className="field">
        <span className="field__label">Cost button label</span>
        <input
          className="field__input"
          value={costLabel}
          onChange={(event) => setCostLabel(event.target.value)}
          placeholder="e.g. Roll for lunch"
          required
        />
      </label>

      <label className="field">
        <span className="field__label">Outcomes (one per line)</span>
        <textarea
          className="field__textarea"
          value={outcomesText}
          onChange={(event) => setOutcomesText(event.target.value)}
          placeholder={'Pizza\nSushi\nTacos'}
          rows={6}
          required
        />
      </label>

      <div className="mapping-form__actions">
        <button type="submit" className="btn btn--primary">
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

function MappingCard({
  mapping,
  onEdit,
  onDelete,
}: {
  mapping: CostMapping
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <article className="mapping-card">
      <div className="mapping-card__header">
        <h3 className="mapping-card__title">
          <span className="mapping-card__key">{mapping.key}</span>
          {mapping.costLabel}
        </h3>
        <div className="mapping-card__actions">
          <button type="button" className="btn btn--small" onClick={onEdit}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn--small btn--danger"
            onClick={onDelete}
          >
            Delete
          </button>
        </div>
      </div>
      <ul className="mapping-card__outcomes">
        {mapping.outcomes.map((outcome) => (
          <li key={outcome}>{outcome}</li>
        ))}
      </ul>
    </article>
  )
}

export function AdminPage() {
  const { mappings, loading, addMapping, updateMapping, deleteMapping } =
    useMappings()
  const [editingId, setEditingId] = useState<string | null>(null)

  const editingMapping = mappings.find((mapping) => mapping.id === editingId)

  if (loading) {
    return <p className="page-status">Loading mappings…</p>
  }

  return (
    <div className="admin-page">
      <section className="admin-page__section">
        <h2>{editingMapping ? 'Edit mapping' : 'Create mapping'}</h2>
        <p className="admin-page__hint">
          Each mapping pairs a cost button with a list of possible outcomes.
        </p>

        {editingMapping ? (
          <MappingForm
            key={editingMapping.id}
            initialKey={editingMapping.key}
            initialCostLabel={editingMapping.costLabel}
            initialOutcomesText={outcomesToText(editingMapping.outcomes)}
            submitLabel="Save changes"
            onSubmit={(key, costLabel, outcomes) => {
              void updateMapping(editingMapping.id, { key, costLabel, outcomes })
              setEditingId(null)
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <MappingForm
            key={mappings.length}
            initialKey={String(mappings.length + 1)}
            submitLabel="Add mapping"
            onSubmit={(key, costLabel, outcomes) => {
              void addMapping({ key, costLabel, outcomes })
            }}
          />
        )}
      </section>

      <section className="admin-page__section">
        <h2>Existing mappings ({mappings.length})</h2>
        {mappings.length === 0 ? (
          <p className="page-status">No mappings yet. Create one above.</p>
        ) : (
          <div className="mapping-list">
            {mappings.map((mapping) => (
              <MappingCard
                key={mapping.id}
                mapping={mapping}
                onEdit={() => setEditingId(mapping.id)}
                onDelete={() => {
                  if (editingId === mapping.id) setEditingId(null)
                  void deleteMapping(mapping.id)
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
