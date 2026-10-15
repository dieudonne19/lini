import { Lock, PencilLine, UsersRound } from "lucide-react"

import { VISIBILITY } from "../data/content"
import { Reveal } from "./reveal"
import { Section, SectionTitle } from "./section"

// Une icône par point, dans l'ordre de VISIBILITY.points.
const ICONS = [PencilLine, Lock, UsersRound]

/** Qui voit quoi : la réponse à « pourquoi dirais-je ce que je fais ? » (pas de surveillance, le privé reste privé). */
export function Visibility() {
  return (
    <Section id="vie-privee" labelledBy="titre-vie-privee" flushTop>
      <Reveal>
        <SectionTitle id="titre-vie-privee">{VISIBILITY.title}</SectionTitle>
        <p className="mt-5 max-w-[640px] text-lg text-pretty text-muted-foreground md:text-[22px] md:leading-[1.45]">
          {VISIBILITY.lead}
        </p>
      </Reveal>

      <Reveal
        as="ul"
        stagger
        className="mt-10 grid list-none gap-8 p-0 md:mt-14 md:grid-cols-3 md:gap-10"
      >
        {VISIBILITY.points.map((point, i) => {
          const Icon = ICONS[i]
          return (
            <li
              key={point.title}
              className="flex flex-col gap-3 border-t border-border pt-6"
            >
              <span
                aria-hidden="true"
                className="grid size-10 place-items-center rounded-full bg-accent"
              >
                <Icon className="size-5" />
              </span>
              <h3 className="font-heading text-[22px] leading-tight font-semibold tracking-[-0.02em]">
                {point.title}
              </h3>
              <p className="text-muted-foreground">{point.text}</p>
            </li>
          )
        })}
      </Reveal>
    </Section>
  )
}
