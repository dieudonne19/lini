import { FINAL } from "../data/content"
import { CtaBlock } from "./cta-block"
import { HugIllustration } from "./illustrations/hug-illustration"
import { Reveal } from "./reveal"
import { Section, SectionTitle } from "./section"

export function FinalCta() {
  return (
    <Section dark labelledBy="titre-fin">
      <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-14">
        <Reveal>
          <SectionTitle id="titre-fin">{FINAL.title}</SectionTitle>
          <CtaBlock onDark className="mt-9" />
        </Reveal>
        {/* Encadré clair : le trait marine des personnages disparaîtrait sur la bande sombre. */}
        <Reveal from="scale" delay={150} className="rounded-lg bg-muted p-4">
          <HugIllustration className="block h-auto w-full" />
        </Reveal>
      </div>
    </Section>
  )
}
