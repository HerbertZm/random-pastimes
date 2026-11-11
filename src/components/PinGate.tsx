import { useState, type FormEvent, type ReactNode } from 'react'
import './PinGate.css'

/**
 * SHA-256 hash of the admin PIN, set with `npm run set-pin -- <pin>`
 * (written to .env.local, which isn't committed).
 *
 * This is a client-side gate only: it keeps casual visitors out, but the
 * hash ships in the JS bundle, so it is not real security.
 */
const PIN_HASH = (import.meta.env.VITE_ADMIN_PIN_HASH ?? '').trim().toLowerCase()
const SESSION_KEY = 'random-pastimes:admin-unlocked'
const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30_000

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

export function PinGate({ children }: { children: (lock: () => void) => ReactNode }) {
  const [unlocked, setUnlocked] = useState(
    () => Boolean(PIN_HASH) && sessionStorage.getItem(SESSION_KEY) === PIN_HASH,
  )
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState(0)
  const [checking, setChecking] = useState(false)

  if (unlocked) {
    return children(() => {
      sessionStorage.removeItem(SESSION_KEY)
      setUnlocked(false)
      setPin('')
    })
  }

  if (!PIN_HASH) {
    return (
      <div className="pin-gate">
        <div className="pin-gate__panel">
          <h1 className="pin-gate__title">No PIN set</h1>
          <p className="pin-gate__hint">
            Run <code>npm run set-pin -- &lt;your pin&gt;</code> and restart the
            dev server.
          </p>
        </div>
      </div>
    )
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!pin || checking) return

    if (Date.now() < lockedUntil) {
      setError('Too many attempts. Try again in a moment.')
      return
    }

    setChecking(true)
    const hash = await sha256Hex(pin)
    setChecking(false)

    if (hash === PIN_HASH) {
      sessionStorage.setItem(SESSION_KEY, PIN_HASH)
      setUnlocked(true)
      return
    }

    const nextAttempts = attempts + 1
    setPin('')
    if (nextAttempts >= MAX_ATTEMPTS) {
      setAttempts(0)
      setLockedUntil(Date.now() + LOCKOUT_MS)
      setError('Too many attempts. Try again in 30 seconds.')
    } else {
      setAttempts(nextAttempts)
      setError('Wrong PIN.')
    }
  }

  return (
    <div className="pin-gate">
      <form className="pin-gate__panel" onSubmit={handleSubmit}>
        <h1 className="pin-gate__title">Enter PIN</h1>
        <input
          className="pin-gate__input"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          aria-label="PIN"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'pin-gate-error' : undefined}
          value={pin}
          onChange={(event) => {
            setPin(event.target.value.replace(/\D/g, ''))
            setError(null)
          }}
        />
        <p id="pin-gate-error" className="pin-gate__error" role="alert">
          {error}
        </p>
        <button
          type="submit"
          className="btn btn--primary pin-gate__submit"
          disabled={!pin || checking}
        >
          Unlock
        </button>
      </form>
    </div>
  )
}
