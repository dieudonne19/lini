import type { ReactNode } from "react"
import { Check, CircleAlert, Lock } from "lucide-react"
import { cn } from "@/lib/utils"
import { MEMBER as M } from "../lib/palette"
import { MemberAvatar, Pastille } from "./pastille"

/**
 * Petites cartes de démonstration des gains. Ce sont des images : elles ne se manipulent pas
 * (d'où role="img" et aucun vrai bouton). Les couleurs succès / avertissement viennent des tokens de Lini.
 */

function Card({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg bg-card p-5 shadow-sm ring-1 ring-foreground/5",
        className
      )}
    >
      {children}
    </div>
  )
}

type ChipTone = "ok" | "warn" | "private" | "muted"

const CHIP_TONES: Record<ChipTone, string> = {
  ok: "bg-success text-success-foreground",
  warn: "bg-warning text-warning-foreground",
  private: "bg-secondary text-foreground",
  muted: "bg-muted text-muted-foreground",
}

function Chip({
  tone,
  icon,
  children,
  className,
}: {
  tone: ChipTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs leading-snug font-medium [&_svg]:size-3.5 [&_svg]:shrink-0",
        CHIP_TONES[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  )
}

/** Bloc 1 : plus d'oublis, plus de doubles réservations. */
export function FreeSlotsDemo() {
  return (
    <div
      role="img"
      aria-label="Exemple de créneaux libres : samedi 17 octobre de 14 h à 18 h, tout le monde est libre ; dimanche 18 octobre de 14 h à 17 h, Hery est pris."
    >
      <Card>
        <p className="font-heading text-lg font-semibold tracking-[-0.02em]">
          Créneaux libres
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <b className="block text-base font-semibold">Samedi 17 octobre</b>
            <span className="text-sm text-muted-foreground">14:00 – 18:00</span>
          </div>
          <Chip tone="ok" icon={<Check strokeWidth={2.5} aria-hidden="true" />}>
            Tout le monde est libre
          </Chip>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <b className="block text-base font-semibold">Dimanche 18 octobre</b>
            <span className="text-sm text-muted-foreground">14:00 – 17:00</span>
          </div>
          <Chip tone="warn" icon={<CircleAlert aria-hidden="true" />}>
            Hery est pris
          </Chip>
        </div>
      </Card>
    </div>
  )
}

/** Bloc 2 : des événements communs. */
export function EventDemo() {
  return (
    <div
      role="img"
      aria-label="Exemple d'événement : réunion de famille le jeudi 15 octobre de 19 h à 21 h. Mialy est déjà occupée ce jour-là. Fanja a répondu oui, Hery peut-être, Mialy n'a pas encore répondu."
    >
      <Card>
        <p className="font-heading text-lg font-semibold tracking-[-0.02em]">
          Réunion de famille
        </p>
        <p className="text-sm text-muted-foreground">
          Jeudi 15 octobre · 19:00 – 21:00
        </p>
        <Chip
          tone="warn"
          className="self-start"
          icon={<CircleAlert aria-hidden="true" />}
        >
          Mialy est déjà occupée ce jour-là
        </Chip>
        <div className="flex items-center justify-between gap-3 text-base">
          <span className="flex items-center gap-3 font-medium">
            <MemberAvatar letter="F" color={M.green} /> Fanja
          </span>
          <Chip tone="ok" icon={<Check strokeWidth={2.5} aria-hidden="true" />}>
            Oui
          </Chip>
        </div>
        <div className="flex items-center justify-between gap-3 text-base">
          <span className="flex items-center gap-3 font-medium">
            <MemberAvatar letter="H" color={M.orange} /> Hery
          </span>
          <Chip tone="muted">Peut-être</Chip>
        </div>
        <div className="flex items-center justify-between gap-3 text-base">
          <span className="flex items-center gap-3 font-medium">
            <MemberAvatar letter="M" color={M.violet} /> Mialy
          </span>
          <Chip tone="muted">Pas encore répondu</Chip>
        </div>
      </Card>
    </div>
  )
}

/** Faux bouton : l'image n'est pas interactive. */
function FakeButton({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex min-h-11 items-center justify-center rounded-lg bg-card px-5 text-base font-semibold text-foreground shadow-[inset_0_0_0_1px_var(--input)]">
      {children}
    </span>
  )
}

/** Bloc 3 : les parents gardent la main. */
export function ProposalDemo() {
  return (
    <div
      role="img"
      aria-label="Exemple de proposition d'un enfant : Mialy propose une sortie au cinéma le samedi 24 octobre. Un parent peut la valider ou la refuser."
    >
      <Card>
        <p className="text-sm text-muted-foreground">À valider par un parent</p>
        <p className="font-heading text-lg font-semibold tracking-[-0.02em]">
          Sortie au cinéma
        </p>
        <p className="text-sm text-muted-foreground">
          Proposée par Mialy · Samedi 24 octobre
        </p>
        <div className="flex flex-wrap gap-3">
          <FakeButton>Valider</FakeButton>
          <FakeButton>Refuser</FakeButton>
        </div>
      </Card>
    </div>
  )
}

/** Bloc 4 : le privé reste privé. */
export function PrivacyDemo() {
  return (
    <div
      role="img"
      aria-label="Une activité privée, « Moment pour moi » de 12 h 30 à 13 h 30, que seul son auteur voit en détail. Les autres membres voient seulement « Occupé » sur le même créneau."
      className="grid grid-cols-1 gap-4 sm:grid-cols-2"
    >
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">Ce que tu vois</p>
        <Pastille
          color={M.violet}
          title="Moment pour moi"
          time="12:30 – 13:30"
          className="p-3 text-sm [&_small]:text-sm"
        />
        <Chip
          tone="private"
          className="self-start"
          icon={<Lock aria-hidden="true" />}
        >
          Privée
        </Chip>
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-muted-foreground">
          Ce que voient les autres
        </p>
        <span className="flex flex-col gap-1 rounded-lg border-l-4 border-l-[#848796] bg-[#eceef3] p-3 text-sm font-medium">
          <span className="flex items-center gap-1.5">
            <Lock className="size-3.5" aria-hidden="true" />
            Occupé
          </span>
          <span className="font-normal text-muted-foreground">
            12:30 – 13:30
          </span>
        </span>
      </div>
    </div>
  )
}
