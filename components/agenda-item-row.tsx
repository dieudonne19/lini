import { ChevronRight, Lock, Repeat } from "lucide-react"
import Link from "next/link"

import type { AgendaItem } from "@/lib/agenda"
import { formatRepeat, formatTime } from "@/lib/format-date"

const tagClass =
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium [&_svg]:size-3.5"

// Pure: one occurrence, as a card. The whole card opens the activity ("Modifier" edits the whole series when
// it repeats). The owner sees the title even when the activity is private.
function AgendaItemRow({ item }: { item: AgendaItem }) {
  const { activity } = item
  const repeat = formatRepeat(activity)
  return (
    <li className="group relative flex items-center gap-4 rounded-lg bg-card p-3 shadow-sm ring-1 ring-foreground/5 transition-shadow hover:shadow-md">
      <div className="flex w-20 shrink-0 flex-col items-center justify-center self-stretch rounded-lg bg-accent px-2 py-2 text-center tabular-nums">
        {item.allDay ? (
          <span className="text-sm leading-tight font-semibold">
            Toute la journée
          </span>
        ) : (
          <>
            <span className="font-heading text-xl leading-none font-semibold">
              {formatTime(item.startsAt)}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              {formatTime(item.endsAt)}
            </span>
          </>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          href={`/agenda/${activity.id}`}
          aria-label={`Modifier ${activity.title}`}
          className="font-heading text-lg leading-snug font-semibold break-words after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
        >
          {activity.title}
        </Link>
        {(activity.isPrivate || repeat) && (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {activity.isPrivate && (
              <li className={`${tagClass} bg-secondary`}>
                <Lock aria-hidden />
                Privée
              </li>
            )}
            {repeat && (
              <li className={`${tagClass} bg-muted text-muted-foreground`}>
                <Repeat aria-hidden />
                {repeat}
              </li>
            )}
          </ul>
        )}
      </div>
      <ChevronRight
        aria-hidden
        className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
      />
    </li>
  )
}

export { AgendaItemRow }
