import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { GAINS_TITLE, GAIN_TEXTS } from "../data/content"
import { ConfettiStrip } from "./illustrations/confetti"
import {
  BuntingSpot,
  CalendarSpot,
  LockSpot,
  ParentsSpot,
} from "./illustrations/spots"
import {
  EventDemo,
  FreeSlotsDemo,
  PrivacyDemo,
  ProposalDemo,
} from "./gain-demos"
import { Reveal } from "./reveal"
import { Section, SectionTitle } from "./section"

type GainRowProps = {
  spot: ReactNode
  title: string
  text: string
  demo: ReactNode
  /** Texte à droite, démonstration à gauche (sur grand écran). */
  reverse?: boolean
}

function GainRow({ spot, title, text, demo, reverse }: GainRowProps) {
  return (
    <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:gap-[72px]">
      <Reveal className={cn(reverse && "md:order-2")}>
        {spot}
        <h3 className="font-heading text-[28px] leading-[1.08] font-semibold tracking-[-0.03em] text-balance md:text-[32px]">
          {title}
        </h3>
        <p className="mt-4 max-w-[440px] text-pretty text-muted-foreground">
          {text}
        </p>
      </Reveal>
      <Reveal
        from={reverse ? "left" : "right"}
        delay={150}
        className="flex flex-col gap-4 rounded-lg bg-muted p-4 md:p-8"
      >
        {demo}
      </Reveal>
    </div>
  )
}

const SPOT = "lini-bob mb-5 block h-auto w-22 md:w-26"

export function Gains() {
  return (
    <Section labelledBy="titre-benefices">
      <Reveal>
        <ConfettiStrip className="mb-8 block h-auto w-[280px]" />
        <SectionTitle id="titre-benefices">{GAINS_TITLE}</SectionTitle>
      </Reveal>

      <div className="mt-12 flex flex-col gap-16 md:mt-[72px] md:gap-24">
        <GainRow
          spot={<CalendarSpot className={SPOT} />}
          title={GAIN_TEXTS.slots.title}
          text={GAIN_TEXTS.slots.text}
          demo={<FreeSlotsDemo />}
        />
        <GainRow
          reverse
          spot={<BuntingSpot className="lini-bob mb-5 block h-auto w-44" />}
          title={GAIN_TEXTS.events.title}
          text={GAIN_TEXTS.events.text}
          demo={<EventDemo />}
        />
        <GainRow
          spot={<ParentsSpot className={SPOT} />}
          title={GAIN_TEXTS.parents.title}
          text={GAIN_TEXTS.parents.text}
          demo={<ProposalDemo />}
        />
        <GainRow
          reverse
          spot={<LockSpot className={SPOT} />}
          title={GAIN_TEXTS.privacy.title}
          text={GAIN_TEXTS.privacy.text}
          demo={<PrivacyDemo />}
        />
      </div>
    </Section>
  )
}
