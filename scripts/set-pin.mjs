// Usage: npm run set-pin -- <pin>
// Stores the SHA-256 hash of the admin PIN in .env.local (not committed).
// Restart the dev server (or rebuild) after changing it.
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

const pin = process.argv[2]
if (!pin || !/^\d{4,12}$/.test(pin)) {
  console.error('Usage: npm run set-pin -- <pin>   (4–12 digits)')
  process.exit(1)
}

const hash = createHash('sha256').update(pin).digest('hex')
const file = new URL('../.env.local', import.meta.url)
const line = `VITE_ADMIN_PIN_HASH=${hash}`

const existing = existsSync(file) ? readFileSync(file, 'utf8') : ''
const next = /^VITE_ADMIN_PIN_HASH=.*$/m.test(existing)
  ? existing.replace(/^VITE_ADMIN_PIN_HASH=.*$/m, line)
  : `${existing}${existing && !existing.endsWith('\n') ? '\n' : ''}${line}\n`

writeFileSync(file, next)
console.log('Admin PIN updated in .env.local. Restart the dev server to use it.')
