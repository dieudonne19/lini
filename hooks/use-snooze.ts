import { useEffect, useState } from "react"

const DAY_MS = 24 * 60 * 60 * 1000

// "Plus tard": hides something on this device for a few days. It starts hidden until the browser's storage has been
// read, so a banner never flashes before being hidden. Without storage, "later" lasts until the page is reloaded.
export function useSnooze(key: string, days = 7) {
  const [snoozed, setSnoozed] = useState(true)

  useEffect(() => {
    let until = 0
    try {
      until = Number(localStorage.getItem(key))
    } catch {
      // Storage blocked.
    }
    // Decided here and not while rendering on the server: it depends on this device.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSnoozed(until > Date.now())
  }, [key])

  function snooze() {
    setSnoozed(true)
    try {
      localStorage.setItem(key, String(Date.now() + days * DAY_MS))
    } catch {
      // Storage blocked.
    }
  }

  return { snoozed, snooze }
}
