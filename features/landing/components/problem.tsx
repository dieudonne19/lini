import { PROBLEM } from "../data/content"
import { Section, SectionTitle } from "./section"

export function Problem() {
  return (
    <Section dark labelledBy="titre-probleme">
      <SectionTitle id="titre-probleme">{PROBLEM.title}</SectionTitle>
      <div className="mt-10 grid gap-8 md:mt-16 md:grid-cols-3 md:gap-12">
        {PROBLEM.points.map((point) => (
          <div
            key={point.title}
            className="flex flex-col gap-3 border-t border-background/20 pt-6"
          >
            <h3 className="font-heading text-[22px] leading-tight font-semibold tracking-[-0.02em]">
              {point.title}
            </h3>
            <p className="text-background/80">{point.text}</p>
          </div>
        ))}
      </div>
      <p className="mt-12 max-w-[760px] font-heading text-[26px] leading-tight font-semibold tracking-[-0.03em] text-balance md:mt-20 md:text-[32px]">
        {PROBLEM.pivot}
      </p>
    </Section>
  )
}
