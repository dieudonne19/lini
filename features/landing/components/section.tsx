import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type SectionProps = {
  id?: string
  /** id du titre de la section, pour que les lecteurs d'écran la nomment. */
  labelledBy: string
  /** Bande sombre (fond marine). */
  dark?: boolean
  /** Réduit l'espace du haut (sections qui suivent une section claire). */
  flushTop?: boolean
  children: ReactNode
}

export function Section({
  id,
  labelledBy,
  dark,
  flushTop,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        "scroll-mt-20 py-18 md:scroll-mt-24 md:py-28",
        flushTop && "pt-0 md:pt-0",
        dark && "bg-foreground text-background"
      )}
    >
      <div className="mx-auto max-w-[1160px] px-4 md:px-6">{children}</div>
    </section>
  )
}

export function SectionTitle({
  id,
  children,
}: {
  id: string
  children: ReactNode
}) {
  return (
    <h2
      id={id}
      className="max-w-[760px] font-heading text-[34px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance md:text-5xl"
    >
      {children}
    </h2>
  )
}
