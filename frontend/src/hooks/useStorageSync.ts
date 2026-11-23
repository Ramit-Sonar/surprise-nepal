import { useEffect, useReducer } from "react"
import { subscribeStorage } from "../services/storage"

/**
 * Re-renders consumers when an authoritative storage key changes in this tab
 * or another tab. Values are still read through their domain-specific getters.
 */
export function useStorageSync(keys: readonly string[]): void {
  const [, rerender] = useReducer((count) => count + 1, 0)
  const signature = keys.join("|")

  useEffect(() => subscribeStorage(keys, () => rerender()), [signature])
}
