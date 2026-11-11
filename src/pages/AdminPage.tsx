import { useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAbilities } from '../context/AbilitiesContext'
import type { Ability, AbilityInput } from '../types/ability'
import { absoluteCostOf, normalizeCost } from '../utils/cost'
import './AdminPage.css'

interface AbilityFormProps {
  initial?: Ability
  sources: string[]
  submitLabel: string
  onSubmit: (input: AbilityInput) => void
  onCancel?: () => void
}

function AbilityForm({
  initial,
  sources,
  submitLabel,
  onSubmit,
  onCancel,
}: AbilityFormProps) {
  const [source, setSource] = useState(initial?.source ?? '')
  const [cost, setCost] = useState(initial?.cost ?? '')
  const [oracleText, setOracleText] = useState(initial?.oracleText ?? '')

  const normalizedCost = normalizeCost(cost)
  const costError =
    cost.trim() && !normalizedCost
      ? 'Use +N, −N, 0 or −X (e.g. +1, -3, 0, -X)'
      : null

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmedSource = source.trim()
    const trimmedText = oracleText.trim()
    if (!trimmedSource || !normalizedCost || !trimmedText) return

    onSubmit({
      source: trimmedSource,
      cost: normalizedCost,
      absoluteCost: absoluteCostOf(normalizedCost),
      oracleText: trimmedText,
    })

    if (!onCancel) {
      setCost('')
      setOracleText('')
    }
  }

  return (
    <form className="ability-form" onSubmit={handleSubmit}>
      <label className="field">
        <span className="field__label">Source</span>
        <input
          className="field__input"
          value={source}
          onChange={(event) => setSource(event.target.value)}
          placeholder="e.g. Jace, the Mind Sculptor"
          list="ability-sources"
          required
        />
        <datalist id="ability-sources">
          {sources.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
      </label>

      <div className="ability-form__row">
        <label className="field">
          <span className="field__label">Cost</span>
          <input
            className="field__input field__input--short"
            value={cost}
            onChange={(event) => setCost(event.target.value)}
            placeholder="+1"
            aria-invalid={Boolean(costError)}
            required
          />
        </label>
        <div className="field">
          <span className="field__label">Absolute cost</span>
          <span className="field__readonly">
            {normalizedCost ? String(absoluteCostOf(normalizedCost)) : '—'}
          </span>
        </div>
      </div>
      {costError && <p className="field__error">{costError}</p>}

      <label className="field">
        <span className="field__label">Oracle text</span>
        <textarea
          className="field__textarea"
          value={oracleText}
          onChange={(event) => setOracleText(event.target.value)}
          rows={3}
          required
        />
      </label>

      <div className="ability-form__actions">
        <button
          type="submit"
          className="btn btn--primary"
          disabled={!normalizedCost}
        >
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

export function AdminPage({ onLock }: { onLock: () => void }) {
  const {
    abilities,
    loading,
    addAbility,
    updateAbility,
    deleteAbility,
    resetAbilities,
  } = useAbilities()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  const editing = abilities.find((ability) => ability.id === editingId)

  const sources = useMemo(
    () => [...new Set(abilities.map((ability) => ability.source))].sort(),
    [abilities],
  )

  const visible = useMemo(() => {
    const query = filter.trim().toLowerCase()
    if (!query) return abilities
    return abilities.filter((ability) =>
      [ability.source, ability.cost, ability.oracleText].some((value) =>
        value.toLowerCase().includes(query),
      ),
    )
  }, [abilities, filter])

  if (loading) {
    return <p className="page-status">Loading abilities…</p>
  }

  return (
    <div className="admin-page">
      <header className="admin-page__header">
        <h1>Admin</h1>
        <div className="admin-page__header-actions">
          <Link to="/" className="btn btn--small">
            View site
          </Link>
          <button type="button" className="btn btn--small" onClick={onLock}>
            Lock
          </button>
        </div>
      </header>

      <section className="admin-page__section">
        <h2>{editing ? 'Edit ability' : 'Add ability'}</h2>
        {editing ? (
          <AbilityForm
            key={editing.id}
            initial={editing}
            sources={sources}
            submitLabel="Save changes"
            onSubmit={(input) => {
              void updateAbility(editing.id, input)
              setEditingId(null)
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <AbilityForm
            sources={sources}
            submitLabel="Add ability"
            onSubmit={(input) => void addAbility(input)}
          />
        )}
      </section>

      <section className="admin-page__section">
        <div className="admin-page__list-header">
          <h2>Abilities ({abilities.length})</h2>
          <button
            type="button"
            className="btn btn--small"
            onClick={() => {
              if (
                window.confirm(
                  'Replace all abilities with the default Jace list? Your edits will be lost.',
                )
              ) {
                setEditingId(null)
                void resetAbilities()
              }
            }}
          >
            Reset to defaults
          </button>
        </div>

        <input
          className="field__input admin-page__filter"
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Filter by source, cost or text"
          aria-label="Filter abilities"
        />

        {visible.length === 0 ? (
          <p className="page-status">No abilities match.</p>
        ) : (
          <div className="ability-table__wrap">
            <table className="ability-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Cost</th>
                  <th title="Absolute cost">Abs.</th>
                  <th>Oracle text</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {visible.map((ability) => (
                  <tr
                    key={ability.id}
                    className={
                      ability.id === editingId
                        ? 'ability-table__row--editing'
                        : undefined
                    }
                  >
                    <td className="ability-table__source">{ability.source}</td>
                    <td className="ability-table__cost">{ability.cost}</td>
                    <td className="ability-table__cost">
                      {ability.absoluteCost}
                    </td>
                    <td>{ability.oracleText}</td>
                    <td className="ability-table__actions">
                      <button
                        type="button"
                        className="btn btn--small"
                        onClick={() => {
                          setEditingId(ability.id)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn btn--small btn--danger"
                        onClick={() => {
                          if (editingId === ability.id) setEditingId(null)
                          void deleteAbility(ability.id)
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
