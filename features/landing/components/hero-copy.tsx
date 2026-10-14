"use client"

import { useEffect, useRef } from "react"
import { gsap } from "gsap"
import { SplitText } from "gsap/SplitText"

gsap.registerPlugin(SplitText)

/**
 * Les textes du héros arrivent avec GSAP SplitText : le titre monte ligne par ligne derrière un masque, le texte
 * d'accroche apparaît ligne par ligne, puis le bouton. Tout est en place en 1,1 s, une seule fois.
 * Les éléments à animer portent data-hero-title, data-hero-lead, data-hero-cta (hero.tsx).
 *
 * Le contenu reste lisible dans tous les cas : sans « réduire les animations » le texte n'est caché par le CSS
 * (landing.css) que le temps que ce code le révèle (au plus 3 s, puis il s'affiche seul), sans JavaScript la
 * règle <noscript> ci-dessous le montre, et avec « réduire les animations » rien n'est caché ni animé.
 * SplitText garde le texte d'origine pour les lecteurs d'écran, et découpe de nouveau les lignes si la fenêtre change.
 * Le découpage attend les polices : sinon les lignes seraient comptées avec une autre fonte.
 */
export function HeroCopy({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scope = root.current
    if (!scope || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return

    let cancelled = false
    const context = gsap.context(() => {}, scope)

    document.fonts.ready.then(() => {
      if (cancelled) return
      context.add(() => {
        const title = scope.querySelector<HTMLElement>("[data-hero-title]")
        const lead = scope.querySelector<HTMLElement>("[data-hero-lead]")
        const cta = scope.querySelector<HTMLElement>("[data-hero-cta]")

        if (title)
          SplitText.create(title, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit(split) {
              gsap.set(title, { visibility: "visible" })
              return gsap.from(split.lines, {
                yPercent: 110,
                duration: 0.7,
                stagger: 0.08,
                ease: "power3.out",
              })
            },
          })

        if (lead)
          SplitText.create(lead, {
            type: "lines",
            autoSplit: true,
            onSplit(split) {
              gsap.set(lead, { visibility: "visible" })
              return gsap.from(split.lines, {
                opacity: 0,
                y: 16,
                duration: 0.6,
                stagger: 0.05,
                delay: 0.25,
                ease: "power2.out",
              })
            },
          })

        if (cta) {
          gsap.set(cta, { visibility: "visible" })
          gsap.from(cta, {
            opacity: 0,
            y: 12,
            duration: 0.5,
            delay: 0.6,
            ease: "power2.out",
          })
        }
      })
    })

    return () => {
      cancelled = true
      context.revert()
    }
  }, [])

  return (
    <div ref={root} className={className}>
      <noscript>
        <style>
          {
            "[data-hero-title],[data-hero-lead],[data-hero-cta]{visibility:visible!important}"
          }
        </style>
      </noscript>
      {children}
    </div>
  )
}
