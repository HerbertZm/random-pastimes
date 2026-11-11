interface ImportMetaEnv {
  /** SHA-256 hex of the admin PIN. Set with `npm run set-pin -- <pin>`. */
  readonly VITE_ADMIN_PIN_HASH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
