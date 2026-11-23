import { STORAGE_KEYS, storageGet, storageSet } from "../../../services/storage"

export interface InviteCode {
  code: string
  createdBy: string
  createdAt: string
  used: boolean
  usedAt?: string
}

function load(): InviteCode[] {
  return storageGet<InviteCode[]>(STORAGE_KEYS.ADMIN_INVITES, [])
}

function save(codes: InviteCode[]) {
  storageSet(STORAGE_KEYS.ADMIN_INVITES, codes)
}

/**
 * Validates a code against an unused locally generated demo code.
 * Consumes the generated code on success (one-time use).
 */
export function validateAndConsumeInviteCode(input: string): boolean {
  const normalized = input.trim().toUpperCase()

  // Check generated codes
  const codes = load()
  const idx = codes.findIndex(
    (c) => !c.used && c.code.toUpperCase() === normalized,
  )
  if (idx === -1) return false

  // Mark as used
  codes[idx].used = true
  codes[idx].usedAt = new Date().toISOString()
  save(codes)
  return true
}

/** Generates a new one-time invite code and persists it. */
export function generateInviteCode(createdBy: string): InviteCode {
  const code = [
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 6),
    Math.random().toString(36).substring(2, 6),
  ]
    .join("-")
    .toUpperCase()

  const entry: InviteCode = {
    code,
    createdBy,
    createdAt: new Date().toISOString(),
    used: false,
  }

  const codes = load()
  codes.unshift(entry)
  save(codes)
  return entry
}

export function listInviteCodes(): InviteCode[] {
  return load()
}

export function revokeInviteCode(code: string) {
  const codes = load().filter((c) => c.code !== code)
  save(codes)
}
