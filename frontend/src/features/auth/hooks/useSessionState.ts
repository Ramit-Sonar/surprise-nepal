import { createContext, useContext } from "react"
import type { User } from "../types"

export interface SessionStateValue {
  user: User | null
  isMenuOpen: boolean
}

export const SessionStateContext = createContext<SessionStateValue | null>(null)

export function useSessionState() {
  const value = useContext(SessionStateContext)
  if (!value) throw new Error("useSessionState must be used within AppProvider")
  return value
}
