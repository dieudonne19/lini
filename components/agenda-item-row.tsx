import { ChevronRight, Lock, Repeat, Sun } from "lucide-react"
import Link from "next/link"
import { useId, type CSSProperties } from "react"

import type { AgendaItem } from "@/lib/agenda"
import { formatRepeat, formatTime, formatTimeRange } from "@/lib/format-date"
import { cn } from "@/lib/utils"

type AgendaItemRowProps = {
  item: AgendaItem
  // The signed-in member's color: the left border and the tint of the time block.
  color: string
  className?: string
}

// Pure: one occurrence, as a card that is a single link to the activity ("Modifier" edits the whole series when
// it repeats). The time block is the same chip as the week view (4 px border + tint of the member's color); the
// screen reader gets the time, the repetition and the status through a description. The owner sees the title
// even when the activity is private.
function AgendaItemRow({ item, color, className }: AgendaItemRowProps) {
  const { activity, allDay, startsAt, endsAt } = item
  const descriptionId = useId()
  const repeat = formatRepeat(activity)

  return (
    <li style={{ "--member": color } as CSSProperties}>
      <Link
        href={`/agenda/${activity.id}`}
        aria-label={`Modifier ${activity.title}`}
        aria-describedby={descriptionId}
        className={cn(
          "group flex min-h-16 items-stretch overflow-hidden rounded-lg bg-card text-card-foreground",
          "shadow-sm ring-1 ring-foreground/5 transition-shadow hover:shadow-md",
          "active:bg-accent/40 active:shadow-sm",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          "motion-reduce:transition-none",
          className
        )}
      >
        <span
          aria-hidden="true"
          className="flex w-24 shrink-0 flex-col justify-center gap-1 border-l-4 border-l-(color:--member) bg-[color-mix(in_oklab,var(--member)_16%,white)] px-3 py-3 text-foreground"
        >
          {allDay ? (
            <>
              <Sun className="size-4" />
              <span className="text-sm leading-tight font-semibold">
                Journée entière
              </span>
            </>
          ) : (
            <span className="flex flex-col leading-tight tabular-nums">
              <span className="font-heading text-base font-semibold">
                {formatTime(startsAt)}
              </span>
              <span className="text-sm text-muted-foreground">
                {formatTime(endsAt)}
              </span>
            </span>
          )}
        </span>

        <span className="flex min-w-0 flex-1 flex-col justify-center gap-2 py-3 pr-2 pl-4">
          <span className="font-heading text-lg leading-snug font-semibold text-pretty wrap-anywhere text-foreground">
            {activity.title}
          </span>
          {(activity.isPrivate || repeat) && (
            <span aria-hidden="true" className="flex flex-wrap gap-1.5">
              {activity.isPrivate && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs leading-snug font-medium text-foreground">
                  <Lock className="size-3.5" />
                  Privée
                </span>
              )}
              {repeat && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs leading-snug font-medium text-muted-foreground">
                  <Repeat className="size-3.5 shrink-0" />
                  {repeat}
                </span>
              )}
            </span>
          )}
        </span>

        <ChevronRight
          aria-hidden="true"
          className="my-auto mr-3 size-5 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground motion-reduce:transition-none"
        />
      </Link>

      <span id={descriptionId} hidden>
        {formatTimeRange(item)}
        {repeat ? `. ${repeat}` : ""}
        {activity.isPrivate ? ". Privée" : ""}
      </span>
    </li>
  )
}

export { AgendaItemRow }
