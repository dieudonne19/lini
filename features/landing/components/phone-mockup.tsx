import { House } from "lucide-react"
import { MEMBER as M } from "../lib/palette"
import { ConfettiBackdrop } from "./illustrations/confetti"
import { Logo } from "./logo"
import { MemberAvatar, Pastille } from "./pastille"

const TABS = ["Semaine", "Mon agenda", "Événements", "Famille"]

/** Un écran de Lini dessiné dans un téléphone (image, non interactive). */
export function PhoneMockup() {
  return (
    <div
      role="img"
      aria-label="Écran de Lini sur téléphone : la journée du mercredi 14 octobre avec, pour chaque membre de la famille, ses activités, et un pique-nique en famille prévu samedi."
      className="relative h-[540px] w-[300px] max-w-full overflow-hidden rounded-[42px] border-8 border-foreground bg-background px-4 py-3.5 shadow-[0_12px_30px_rgb(31_37_64/0.18)]"
    >
      <div className="mx-auto mb-3.5 h-1.5 w-[72px] rounded-full bg-border" />
      <div className="flex items-center justify-between">
        <Logo className="h-6 w-auto" />
        <MemberAvatar
          letter="F"
          color={M.green}
          className="size-[30px] text-sm"
        />
      </div>
      <p className="mt-3.5 font-heading text-xl leading-tight font-semibold tracking-[-0.02em]">
        Aujourd&apos;hui
      </p>
      <p className="mt-0.5 text-sm text-muted-foreground">
        mercredi 14 octobre
      </p>

      <div className="mt-3 flex gap-1 rounded-lg bg-accent p-[3px] text-sm font-semibold">
        <span className="flex-1 rounded-lg bg-card py-2.5 text-center text-foreground shadow-sm">
          Semaine
        </span>
        <span className="flex-1 py-2.5 text-center text-muted-foreground">
          Mois
        </span>
      </div>

      <div className="mt-3 flex items-start gap-2.5">
        <MemberAvatar
          letter="F"
          color={M.green}
          className="size-[30px] text-sm"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
          Fanja
          <i className="text-xs font-normal text-muted-foreground not-italic">
            Aucune activité
          </i>
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2.5">
        <MemberAvatar
          letter="H"
          color={M.orange}
          className="size-[30px] text-sm"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
          Hery
          <Pastille color={M.orange} title="Football" time="18:30 – 20:00" />
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2.5">
        <MemberAvatar
          letter="M"
          color={M.violet}
          className="size-[30px] text-sm"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
          Mialy
          <Pastille variant="busy" title="Occupé" />
        </div>
      </div>
      <div className="mt-3 flex items-start gap-2.5">
        <span
          aria-hidden="true"
          className="grid size-[30px] shrink-0 place-items-center rounded-full bg-accent"
        >
          <House className="size-[18px]" />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
          Samedi 17
          <Pastille
            variant="event"
            title="Pique-nique en famille"
            time="10:00 – 16:00"
          />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 flex border-t border-border bg-card px-1 pt-2.5 pb-3">
        {TABS.map((tab, i) => (
          <span
            key={tab}
            className={`flex-1 text-center text-xs leading-tight ${
              i === 0
                ? "font-bold text-foreground"
                : "font-medium text-muted-foreground"
            }`}
          >
            {tab}
          </span>
        ))}
      </div>
    </div>
  )
}

/** Le téléphone posé sur un fond de confettis. */
export function PhoneStage() {
  return (
    <div className="relative flex items-center justify-center overflow-hidden rounded-lg bg-muted px-2 py-6 md:px-4 md:py-10">
      <ConfettiBackdrop />
      <div className="relative">
        <PhoneMockup />
      </div>
    </div>
  )
}
