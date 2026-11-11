import { useEffect, useMemo, useRef, useState } from 'react'
import { useAbilities } from '../context/AbilitiesContext'
import type { Ability } from '../types/ability'
import { availableNumbers, matchesNumber } from '../utils/cost'
import { pickRandom } from '../utils/random'
import './PlayPage.css'

/** Replace public/play-image.png to change the picture on this page. */
const PLAY_IMAGE_SRC = `${import.meta.env.BASE_URL}play-image.png`

interface Roll {
  ability: Ability
  value: number
}

function PlayImage() {
  const [failed, setFailed] = useState(false)

  return (
    <div className="play-page__image">
      {failed ? (
        <span className="play-page__image-placeholder">
          Add your image at <code>public/play-image.png</code>
        </span>
      ) : (
        <img src={PLAY_IMAGE_SRC} alt="" onError={() => setFailed(true)} />
      )}
    </div>
  )
}

function AbilityDialog({
  roll,
  canReroll,
  onReroll,
  onClose,
}: {
  roll: Roll
  canReroll: boolean
  onReroll: () => void
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  const { ability, value } = roll

  return (
    <dialog
      ref={dialogRef}
      className="ability-dialog"
      aria-labelledby="ability-dialog-source"
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop (outside the panel) closes the dialog.
        if (event.target === event.currentTarget) dialogRef.current?.close()
      }}
    >
      <div className="ability-dialog__panel">
        <button
          type="button"
          className="ability-dialog__close"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
        >
          ×
        </button>

        <div className="ability-dialog__cost">
          <span className="ability-dialog__badge">{ability.cost}</span>
          {ability.absoluteCost === 'X' && (
            <span className="ability-dialog__x">X = {value}</span>
          )}
        </div>

        <p className="ability-dialog__text">{ability.oracleText}</p>

        <p id="ability-dialog-source" className="ability-dialog__source">
          — {ability.source}
        </p>

        <footer className="ability-dialog__hint">
          <p>
            If this ability requires a target and there are no legal targets
            available, re-roll until that's not true.
          </p>
          <button
            type="button"
            className="btn"
            onClick={onReroll}
            disabled={!canReroll}
            title={canReroll ? undefined : 'No other abilities for this number'}
          >
            Re-roll
          </button>
        </footer>
      </div>
    </dialog>
  )
}

export function PlayPage() {
  const { abilities, loading } = useAbilities()
  const [selected, setSelected] = useState<number | null>(null)
  const [roll, setRoll] = useState<Roll | null>(null)

  const numbers = useMemo(() => availableNumbers(abilities), [abilities])

  function poolFor(value: number) {
    return abilities.filter((ability) => matchesNumber(ability, value))
  }

  function generate(value: number, excludeId?: string) {
    const pool = poolFor(value)
    const candidates =
      excludeId && pool.length > 1
        ? pool.filter((ability) => ability.id !== excludeId)
        : pool
    const ability = pickRandom(candidates)
    if (ability) setRoll({ ability, value })
  }

  if (loading) {
    return <p className="page-status">Loading…</p>
  }

  return (
    <div className="play-page">
      <PlayImage />

      {numbers.length === 0 ? (
        <p className="page-status">
          No abilities yet. Head to Admin to add some.
        </p>
      ) : (
        <div className="play-page__controls">
          <div
            className="number-picker"
            role="radiogroup"
            aria-label="Loyalty cost"
          >
            {numbers.map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected === value}
                className={`number-picker__option${
                  selected === value ? ' number-picker__option--selected' : ''
                }`}
                onClick={() => setSelected(value)}
              >
                {value}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="btn btn--primary play-page__generate"
            disabled={selected === null}
            onClick={() => selected !== null && generate(selected)}
          >
            {selected === null ? 'Pick a number' : 'Generate'}
          </button>
        </div>
      )}

      {roll && (
        <AbilityDialog
          roll={roll}
          canReroll={poolFor(roll.value).length > 1}
          onReroll={() => generate(roll.value, roll.ability.id)}
          onClose={() => setRoll(null)}
        />
      )}
    </div>
  )
}
