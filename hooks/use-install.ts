import { useEffect, useState } from "react"

// Chrome and Edge fire this before offering the install; the event is kept to open the prompt from our own button.
type InstallEvent = Event & { prompt: () => Promise<unknown> }

function isInstalled() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// Safari on iPhone and iPad has no install button: the person has to use Share, then "Add to Home Screen".
// iPadOS announces itself as a Mac, hence the touch check.
function isApple() {
  return (
    /iPhone|iPad|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
  )
}

// How Lini can be put on the home screen from here: "button" (the browser opens its own install prompt), "steps"
// (Apple: the person follows the steps), or null (already installed, or this browser cannot install).
export function useInstall() {
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [apple, setApple] = useState(false)
  // Starts as installed: the offer appears only once the browser has said it can be installed.
  const [installed, setInstalled] = useState(true)

  useEffect(() => {
    // The offer depends on the browser, so it is decided here and not while rendering on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalled(isInstalled())
    setApple(isApple())

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
    }
    const onInstalled = () => setInstalled(true)
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const offer = installed ? null : event ? "button" : apple ? "steps" : null
  return { offer, install: () => event?.prompt() } as const
}
