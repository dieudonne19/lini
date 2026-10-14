import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQ, FAQ_TITLE } from "../data/content"
import { Reveal } from "./reveal"
import { Section, SectionTitle } from "./section"

export function Faq() {
  return (
    <Section id="questions" labelledBy="titre-faq" flushTop>
      <div className="grid items-start gap-7 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-[72px]">
        <Reveal>
          <SectionTitle id="titre-faq">{FAQ_TITLE}</SectionTitle>
        </Reveal>
        <Reveal stagger>
          <Accordion className="w-full rounded-none border-0 border-b border-border">
            {FAQ.map((item, i) => (
              <AccordionItem
                key={item.q}
                value={`question-${i}`}
                className="data-open:bg-transparent"
              >
                <AccordionTrigger className="min-h-16 py-4 font-heading text-xl leading-tight font-semibold tracking-[-0.02em] hover:no-underline md:text-[22px]">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="max-w-[640px] pr-10 pb-6 text-base text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </Section>
  )
}
