"use client"

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react"

type RevealProps = {
  as?: ElementType
  /** D'où le bloc arrive : vers le haut (par défaut), de côté, ou en grossissant un peu. */
  from?: "up" | "left" | "right" | "scale"
  /** Attente avant de commencer, en millisecondes. */
  delay?: number
  /** Les enfants arrivent un à un au lieu du bloc entier (styles dans landing.css). */
  stagger?: boolean
  className?: string
  children: ReactNode
}

/**
 * Fait apparaître un bloc quand il entre à l'écran, avec la seule transition CSS de landing.css.
 * Sans JavaScript, avec « réduire les animations », ou pour un bloc déjà visible à l'ouverture de la page :
 * rien n'est caché, rien ne bouge. L'état caché n'est posé qu'ici, une fois le composant monté, sur le DOM
 * (pas dans le rendu : le serveur et le client produisent donc le même HTML).
 */
export function Reveal({
  as: Tag = "div",
  from = "up",
  delay = 0,
  stagger,
  className,
  children,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      element.getBoundingClientRect().top < window.innerHeight * 0.92
    )
      return

    element.dataset.reveal = "hidden"
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        element.dataset.reveal = "shown"
        observer.disconnect()
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={ref}
      className={className}
      data-reveal-from={from}
      data-reveal-stagger={stagger ? "" : undefined}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  )
}
