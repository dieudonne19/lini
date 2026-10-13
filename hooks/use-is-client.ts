import { useSyncExternalStore } from "react"

const subscribe = () => () => {}

// False while rendering on the server and during hydration, true afterwards.
// Used to show device-timezone content only once the browser can compute it.
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  )
}
