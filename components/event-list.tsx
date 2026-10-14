import Link from "next/link"

import { formatEventWhen } from "@/lib/format-date"
import type { EventSummary } from "@/lib/events"

type EventListProps = {
  title: string
  events: EventSummary[]
  emptyText?: string
  // A short line under each event: who proposed it, or what the viewer answered.
  note?: (event: EventSummary) => string | undefined
  renderActions?: (event: EventSummary) => React.ReactNode
}

// Pure: a titled list of events, each card a link to its page (the buttons inside stay above the link).
function EventList({
  title,
  events,
  emptyText,
  note,
  renderActions,
}: EventListProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">{title}</h2>
      {events.length === 0 ? (
        <p className="text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="group relative flex flex-col gap-3 rounded-lg bg-card p-4 shadow-sm ring-1 ring-foreground/5 transition-shadow hover:shadow-md"
            >
              <div>
                <Link
                  href={`/evenements/${event.id}`}
                  className="font-heading text-lg font-semibold break-words underline-offset-4 group-hover:underline after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring"
                >
                  {event.title}
                </Link>
                <p className="text-muted-foreground">
                  {formatEventWhen(event)}
                  {event.place ? ` · ${event.place}` : ""}
                </p>
                {note?.(event) && (
                  <p className="mt-1 text-sm font-medium">{note(event)}</p>
                )}
              </div>
              {renderActions && (
                <div className="relative">{renderActions(event)}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export { EventList }
