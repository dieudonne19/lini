import { ChevronRight, Lock, Repeat, Sun } from "lucide-react"
import Link from "next/link"
import { useId } from "react"

import type { AgendaItem } from "@/lib/agenda"
import {
  formatEventDay,
  formatEventWhen,
  formatRepeat,
  formatTime,
} from "@/lib/format-date"

type AgendaItemRowProps = {
  item: AgendaItem
  // False for the second activity of a day onwards: the date is written once, on the first row of the day.
  showDate: boolean
}

// Pure: one occurrence, as a row that is a single link to the activity ("Modifier" edits the whole series when it
// repeats). Three columns split by thin lines: the date, the time, then the title with what is special about it. The
// screen reader gets the day, the time, the repetition and the status through a description. The owner sees the title
// even when the activity is private.
function AgendaItemRow({ item, showDate }: AgendaItemRowProps) {
  const { activity, allDay, startsAt, endsAt } = item
  const descriptionId = useId()
  const repeat = formatRepeat(activity)
  const { weekday, day, month } = formatEventDay(item)

  return (
    <li>
      <Link
        href={`/agenda/${activity.id}`}
        aria-label={`Modifier ${activity.title}`}
        aria-describedby={descriptionId}
        className="group flex min-h-24 items-stretch transition-colors outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none"
      >
        <span
          aria-hidden="true"
          className="flex w-16 shrink-0 flex-col items-center justify-center border-r leading-tight sm:w-20"
        >
          {showDate && (
            <>
              <span className="text-sm text-muted-foreground">{weekday}</span>
              <span className="font-heading text-3xl font-bold">{day}</span>
              <span className="text-sm text-muted-foreground">{month}</span>
            </>
          )}
        </span>

        <span
          aria-hidden="true"
          className="my-4 flex w-24 shrink-0 flex-col justify-center border-r px-3 sm:w-32 sm:px-4"
        >
          {allDay ? (
            <span className="flex items-center gap-2 leading-tight">
              <Sun className="size-4 shrink-0" />
              <span>Journée entière</span>
            </span>
          ) : (
            <span className="flex flex-col leading-tight tabular-nums">
              <span className="font-semibold">{formatTime(startsAt)}</span>
              <span className="text-muted-foreground">
                {formatTime(endsAt)}
              </span>
            </span>
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-col justify-center gap-1 px-4 py-4">
          <span className="font-heading text-xl leading-snug font-medium text-pretty wrap-anywhere">
            {activity.title}
          </span>
          {activity.isPrivate && (
            <span
              aria-hidden="true"
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <Lock className="size-4 shrink-0" />
              Privée
            </span>
          )}
          {repeat && (
            <span
              aria-hidden="true"
              className="flex items-center gap-1.5 text-muted-foreground"
            >
              <Repeat className="size-4 shrink-0" />
              {repeat}
            </span>
          )}
        </span>

        <ChevronRight
          aria-hidden="true"
          className="my-auto mr-1 size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground motion-reduce:transition-none"
        />
      </Link>

      <span id={descriptionId} hidden>
        {formatEventWhen({ startsAt, endsAt, allDay })}
        {repeat ? `. ${repeat}` : ""}
        {activity.isPrivate ? ". Privée" : ""}
      </span>
    </li>
  )
}

export { AgendaItemRow }
