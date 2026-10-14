"use client"

import { useEffect } from "react"
import Lenis from "lenis"
import "lenis/dist/lenis.css"

/**
 * Défilement fluide de la landing, avec Lenis. Rien ne s'affiche : le composant branche Lenis sur la page tant
 * qu'elle est ouverte, et le retire quand le visiteur la quitte (l'application garde son défilement natif).
 * Lenis suit « réduire les animations » tout seul : le défilement redevient alors celui du navigateur.
 * Les liens d'ancre (#comment, #questions) défilent en douceur et s'arrêtent sous l'en-tête collant, grâce au
 * `scroll-margin-top` des sections (section.tsx) que Lenis lit.
 */
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true, anchors: true })
    return () => lenis.destroy()
  }, [])

  return null
}
