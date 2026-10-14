import { CalendarX, ChevronRight } from "lucide-react"
import Link from "next/link"

import { MemberAvatar } from "@/components/member-avatar"
import type { EventSummary } from "@/lib/events"
import { formatEventDay, formatEventMeta } from "@/lib/format-date"

type EventListProps = {
  title: string
  events: EventSummary[]
  emptyText?: string
  // A short line under each event: who proposed it, or what the viewer answered.
  note?: (event: EventSummary) => React.ReactNode
  renderActions?: (event: EventSummary) => React.ReactNode
}

// The date of the event, in the column on the left: "sam." over a big "17" over "oct.".
function DateBlock({ event }: { event: EventSummary }) {
  const { weekday, day, month } = formatEventDay(event)
  return (
    <div
      aria-hidden
      className="flex w-12 shrink-0 flex-col items-center leading-tight"
    >
      <span className="text-sm text-muted-foreground">{weekday}</span>
      <span className="font-heading text-3xl font-bold">{day}</span>
      <span className="text-sm text-muted-foreground">{month}</span>
    </div>
  )
}

// Pure: a titled list of events as plain rows between hairlines, each row a link to its page (the buttons inside stay
// above the link). A row reads: the date, the title, when and where, then who created it and the note.
function EventList({
  title,
  events,
  emptyText,
  note,
  renderActions,
}: EventListProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="border-b pb-3 text-2xl font-semibold">{title}</h2>
      {events.length === 0 ? (
        <p className="flex items-center gap-2 text-muted-foreground">
          <CalendarX aria-hidden className="size-5 shrink-0" />
          {emptyText}
        </p>
      ) : (
        <ul className="divide-y border-b">
          {events.map((event) => {
            const meta = formatEventMeta(event, event.place)
            const noteNode = note?.(event)
            return (
              <li
                key={event.id}
                className="group relative flex items-start gap-5 py-5 transition-colors hover:bg-muted/40"
              >
                <DateBlock event={event} />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link
                    href={`/evenements/${event.id}`}
                    className="font-heading text-xl font-semibold break-words after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                  >
                    {event.title}
                  </Link>
                  {meta && <p className="text-muted-foreground">{meta}</p>}
                  {noteNode && (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      {event.createdByName && event.createdByColor && (
                        <>
                          <MemberAvatar
                            name={event.createdByName}
                            color={event.createdByColor}
                            size="chip"
                          />
                          <span className="sr-only">
                            Créé par {event.createdByName}
                          </span>
                        </>
                      )}
                      {noteNode}
                    </div>
                  )}
                  {renderActions && (
                    <div className="relative mt-1">{renderActions(event)}</div>
                  )}
                </div>
                <ChevronRight
                  aria-hidden
                  className="size-5 shrink-0 self-center text-muted-foreground"
                />
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export { EventList }
