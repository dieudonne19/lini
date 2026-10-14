import { HERO } from "../data/content"
import { CtaBlock } from "./cta-block"
import { FamilyPhoto } from "./illustrations/family-photo"
import { HeroIllustration } from "./illustrations/hero-illustration"
import { DayDemo, WeekDemo } from "./week-demo"

export function Hero() {
  return (
    <section
      aria-labelledby="titre-hero"
      className="mx-auto max-w-[1160px] px-4 pt-6 pb-18 md:px-6 md:pt-14 md:pb-28"
    >
      <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,500px)] md:gap-12">
        <div>
          <FamilyPhoto className="h-auto w-36 md:w-44" />
          <h1
            id="titre-hero"
            className="-mt-1 font-heading text-[clamp(2.5rem,5vw,4rem)] leading-[1.08] font-semibold tracking-[-0.04em] text-balance"
          >
            {HERO.title}
          </h1>
          <p className="mt-6 max-w-[640px] text-lg text-pretty text-muted-foreground md:text-[22px] md:leading-[1.45]">
            {HERO.lead}
          </p>
          <CtaBlock className="mt-9" />
        </div>
        <HeroIllustration className="block h-auto w-full" />
      </div>

      <WeekDemo />
      <DayDemo />
    </section>
  )
}
