import Link from "next/link"

import { MemberAvatar } from "@/components/member-avatar"
import { weekHref } from "@/lib/calendar-links"
import { toIsoDate } from "@/lib/calendar-dates"
import { formatFullDay } from "@/lib/format-date"
import type { MonthDay } from "@/lib/month"

const MAX_DOTS = 4

type MonthDayCellProps = {
  day: MonthDay
  today: Date
}

// What a screen reader hears for the day: the dots and the colors are decorative.
function describe({ date, busyMembers, events }: MonthDay) {
  const parts = [formatFullDay(date)]
  parts.push(
    busyMembers.length
      ? `Occupés : ${busyMembers.map((member) => member.name).join(", ")}`
      : "Aucune activité"
  )
  if (events.length) {
    parts.push(`Événements : ${events.map((event) => event.title).join(", ")}`)
  }
  return parts.join(". ")
}

// Pure: one day of the month. It is a link to the week holding the day. The members who are busy are
// dots with their initial (the fact only: whether the activity is private is not shown), family events are
// in relief.
function MonthDayCell({ day, today }: MonthDayCellProps) {
  const isToday = toIsoDate(day.date) === toIsoDate(today)
  const dots = day.busyMembers.slice(0, MAX_DOTS)
  const hidden = day.busyMembers.length - dots.length
  return (
    <Link
      href={weekHref(day.date)}
      aria-label={describe(day)}
      aria-current={isToday ? "date" : undefined}
      className="flex min-h-20 flex-col gap-1 p-1 hover:bg-muted/60 focus-visible:z-10 sm:p-1.5"
    >
      <span
        className={`inline-flex size-6 items-center justify-center rounded-full text-sm ${isToday ? "bg-primary font-bold text-primary-foreground" : day.inMonth ? "font-medium" : "text-muted-foreground"}`}
      >
        {day.date.getDate()}
      </span>
      {day.events.map((event) => (
        <span
          key={event.id}
          aria-hidden
          className="block truncate rounded bg-primary px-1 text-xs font-medium text-primary-foreground"
        >
          {event.title}
        </span>
      ))}
      <span aria-hidden className="flex flex-wrap items-center gap-0.5">
        {dots.map((member) => (
          <MemberAvatar
            key={member.id}
            name={member.name}
            color={member.color}
            size="sm"
          />
        ))}
        {hidden > 0 && (
          <span className="text-xs text-muted-foreground">+{hidden}</span>
        )}
      </span>
    </Link>
  )
}

export { MonthDayCell }
