"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

import { Button } from "@/components/ui/button"

// Chrome and Edge fire this before offering the install; the event is kept to open the prompt from our button.
type InstallEvent = Event & { prompt: () => Promise<unknown> }

const DISMISSED_KEY = "lini:install-dismissed"

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

// Offers to put Lini on the home screen: a button where the browser allows it, the steps on Apple devices,
// nothing once installed, once dismissed, or on a browser that cannot install.
function InstallPrompt() {
  const [event, setEvent] = useState<InstallEvent | null>(null)
  const [apple, setApple] = useState(false)
  const [hidden, setHidden] = useState(true)

  useEffect(() => {
    let dismissed = false
    try {
      dismissed = localStorage.getItem(DISMISSED_KEY) === "1"
    } catch {
      // Storage blocked: the card simply comes back next time.
    }
    // The card depends on the browser, so it is decided here and not while rendering on the server.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHidden(dismissed || isInstalled())
    setApple(isApple())

    const onPrompt = (e: Event) => {
      e.preventDefault()
      setEvent(e as InstallEvent)
    }
    const onInstalled = () => setHidden(true)
    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  function dismiss() {
    setHidden(true)
    try {
      localStorage.setItem(DISMISSED_KEY, "1")
    } catch {
      // See above.
    }
  }

  if (hidden || (!event && !apple)) return null

  return (
    <section
      aria-labelledby="install-title"
      className="mb-6 flex items-start gap-3 rounded-lg border border-border bg-muted p-4"
    >
      <div className="flex-1">
        <h2 id="install-title" className="text-sm font-semibold">
          Installe Lini sur ton écran d&apos;accueil
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {event
            ? "Tu l'ouvres comme une application, en plein écran."
            : "Touche Partager, puis « Sur l'écran d'accueil »."}
        </p>
        {event && (
          <Button
            type="button"
            size="sm"
            className="mt-3"
            onClick={() => event.prompt()}
          >
            <Download aria-hidden />
            Installer Lini
          </Button>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Masquer"
        onClick={dismiss}
      >
        <X aria-hidden />
      </Button>
    </section>
  )
}

export { InstallPrompt }
