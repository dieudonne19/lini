import { FINAL } from "../data/content"
import { CtaBlock } from "./cta-block"
import { HugIllustration } from "./illustrations/hug-illustration"
import { Section, SectionTitle } from "./section"

export function FinalCta() {
  return (
    <Section dark labelledBy="titre-fin">
      <div className="grid items-center gap-7 md:grid-cols-[minmax(0,1fr)_minmax(0,440px)] md:gap-14">
        <div>
          <SectionTitle id="titre-fin">{FINAL.title}</SectionTitle>
          <CtaBlock onDark className="mt-9" />
        </div>
        {/* Encadré clair : le trait marine des personnages disparaîtrait sur la bande sombre. */}
        <div className="rounded-lg bg-muted p-4">
          <HugIllustration className="block h-auto w-full" />
        </div>
      </div>
    </Section>
  )
}
