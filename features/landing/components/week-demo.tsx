import type { CSSProperties } from "react"
import { House } from "lucide-react"
import { MEMBER as M } from "../lib/palette"
import { MemberAvatar, Pastille } from "./pastille"

const DAYS = [
  "lun. 12",
  "mar. 13",
  "mer. 14",
  "jeu. 15",
  "ven. 16",
  "sam. 17",
  "dim. 18",
]
const TODAY_INDEX = 2

type Item = {
  /** Colonne de la grille : 2 = lundi … 8 = dimanche (la colonne 1 porte le nom du membre). */
  col: number
  title: string
  time?: string
  variant?: "member" | "event" | "busy"
}

type Row = {
  name: string
  letter?: string
  color?: string
  items: Item[]
}

const ROWS: Row[] = [
  {
    name: "Famille",
    items: [
      {
        col: 7,
        title: "Pique-nique en famille",
        time: "10:00 – 16:00",
        variant: "event",
      },
    ],
  },
  {
    name: "Fanja",
    letter: "F",
    color: M.green,
    items: [
      { col: 3, title: "Travail", time: "08:00 – 16:00" },
      { col: 6, title: "Marché", time: "Journée entière" },
    ],
  },
  {
    name: "Hery",
    letter: "H",
    color: M.orange,
    items: [
      { col: 2, title: "Travail", time: "06:30 – 14:30" },
      { col: 4, title: "Football", time: "18:30 – 20:00" },
    ],
  },
  {
    name: "Mialy",
    letter: "M",
    color: M.violet,
    items: [
      { col: 2, title: "Occupé", variant: "busy" },
      { col: 5, title: "Piano", time: "16:00 – 17:30" },
    ],
  },
]

const GRID =
  "grid grid-cols-[150px_repeat(7,minmax(0,1fr))] items-center gap-x-2 px-4"

/** Semaine d'exemple, version large. Le keyframe `pin` est défini dans landing.css. */
export function WeekDemo() {
  let order = 0
  return (
    <div
      role="img"
      aria-label="Exemple de semaine dans Lini : une ligne par membre de la famille, avec ses activités. Le samedi 17 est libre pour tous et accueille un pique-nique en famille. Une activité privée apparaît comme occupé."
      className="mt-16 hidden overflow-hidden rounded-lg bg-card shadow-sm ring-1 ring-foreground/5 md:block"
    >
      <div className={`${GRID} min-h-14 text-sm text-muted-foreground`}>
        <span />
        {DAYS.map((d, i) => (
          <span key={d} className="flex items-center gap-1">
            {d.split(" ")[0]}
            {i === TODAY_INDEX ? (
              <em className="inline-grid h-6 min-w-6 place-items-center rounded-full bg-primary px-1 font-semibold text-primary-foreground not-italic">
                {d.split(" ")[1]}
              </em>
            ) : (
              d.split(" ")[1]
            )}
          </span>
        ))}
      </div>

      {ROWS.map((row) => (
        <div
          key={row.name}
          className={`${GRID} min-h-19 border-t border-border py-3.5`}
        >
          <span className="flex items-center gap-3 text-base font-medium">
            {row.letter && row.color ? (
              <MemberAvatar letter={row.letter} color={row.color} />
            ) : (
              <span className="grid size-9 place-items-center rounded-full bg-accent">
                <House className="size-5" aria-hidden="true" />
              </span>
            )}
            {row.name}
          </span>
          {row.items.map((item) => {
            const delay = order++ * 70 + 250
            return (
              <Pastille
                key={`${row.name}-${item.col}`}
                variant={item.variant}
                color={row.color}
                title={item.title}
                time={item.time}
                className="motion-safe:animate-[pin_.5s_ease-out_both]"
                style={
                  {
                    gridColumn: item.col,
                    gridRow: 1,
                    animationDelay: `${delay}ms`,
                  } as CSSProperties
                }
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}

/** Journée d'exemple, version téléphone (remplace la semaine sous 768 px). */
export function DayDemo() {
  return (
    <div
      role="img"
      aria-label="Exemple de journée dans Lini : Fanja n'a rien de prévu, Hery joue au football à 18 h 30, Mialy est occupée."
      className="mt-12 flex flex-col gap-4 rounded-lg bg-card p-5 shadow-sm ring-1 ring-foreground/5 md:hidden"
    >
      <p className="font-heading text-base font-semibold">
        Aujourd&apos;hui, mercredi 14 octobre
      </p>
      <div className="flex items-start gap-3">
        <MemberAvatar letter="F" color={M.green} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-base font-medium">
          Fanja
          <span className="text-sm font-normal text-muted-foreground">
            Aucune activité
          </span>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <MemberAvatar letter="H" color={M.orange} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-base font-medium">
          Hery
          <Pastille color={M.orange} title="Football" time="18:30 – 20:00" />
        </div>
      </div>
      <div className="flex items-start gap-3">
        <MemberAvatar letter="M" color={M.violet} />
        <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-base font-medium">
          Mialy
          <Pastille variant="busy" title="Occupé" />
        </div>
      </div>
    </div>
  )
}
