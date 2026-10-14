import { STEPS, STEPS_NOTE, STEPS_TITLE } from "../data/content"
import { PhoneStage } from "./phone-mockup"
import { Reveal } from "./reveal"
import { Section, SectionTitle } from "./section"

export function Steps() {
  return (
    <Section id="comment" labelledBy="titre-etapes" flushTop>
      <Reveal>
        <SectionTitle id="titre-etapes">{STEPS_TITLE}</SectionTitle>
      </Reveal>

      <Reveal
        as="ol"
        stagger
        className="mt-10 grid list-none gap-8 p-0 md:mt-14 md:grid-cols-3 md:gap-10"
      >
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex flex-col gap-3">
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-full bg-accent font-heading text-lg font-semibold"
            >
              {i + 1}
            </span>
            <h3 className="font-heading text-[22px] leading-tight font-semibold tracking-[-0.02em]">
              {step.title}
            </h3>
            <p className="text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </Reveal>

      <div className="mt-14 grid items-center gap-7 md:grid-cols-2 md:gap-14">
        <Reveal>
          <p className="max-w-[460px] text-pretty text-muted-foreground">
            {STEPS_NOTE}
          </p>
        </Reveal>
        <Reveal from="scale" delay={120}>
          <PhoneStage />
        </Reveal>
      </div>
    </Section>
  )
}
