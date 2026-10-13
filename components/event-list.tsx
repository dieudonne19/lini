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

// Pure: a titled list of events, each one a link to its page.
function EventList({
  title,
  events,
  emptyText,
  note,
  renderActions,
}: EventListProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      {events.length === 0 ? (
        <p className="text-muted-foreground">{emptyText}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="flex flex-col gap-2 rounded-xl border border-border p-3"
            >
              <div>
                <Link
                  href={`/evenements/${event.id}`}
                  className="font-medium break-words underline-offset-4 hover:underline"
                >
                  {event.title}
                </Link>
                <p className="text-sm text-muted-foreground">
                  {formatEventWhen(event)}
                  {event.place ? ` · ${event.place}` : ""}
                </p>
                {note?.(event) && <p className="text-sm">{note(event)}</p>}
              </div>
              {renderActions?.(event)}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export { EventList }
