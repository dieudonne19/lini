import type { AgendaActivity, AgendaItem } from "@/lib/agenda"

const DAY_MS = 24 * 60 * 60 * 1000

// Formatters are built per call: they capture the device timezone when created.
const formatDate = (options: Intl.DateTimeFormatOptions, date: Date) =>
  new Intl.DateTimeFormat("fr-FR", options).format(date)

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1)

// "Aujourd'hui, mercredi 14 octobre", "Demain, jeudi 15 octobre", then "Vendredi 16 octobre".
export function formatDayHeading(day: Date, today: Date) {
  const text = formatDate(
    { weekday: "long", day: "numeric", month: "long" },
    day
  )
  const offset = Math.round(
    (day.getTime() -
      new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      ).getTime()) /
      DAY_MS
  )
  if (offset === 0) return `Aujourd'hui, ${text}`
  if (offset === 1) return `Demain, ${text}`
  return capitalize(text)
}

// "18:00" in the device timezone.
export function formatTime(date: Date) {
  return formatDate({ hour: "2-digit", minute: "2-digit" }, date)
}

// "18:00 – 19:00" in the device timezone, or "Journée entière".
export function formatTimeRange({
  startsAt,
  endsAt,
  allDay,
}: Pick<AgendaItem, "startsAt" | "endsAt" | "allDay">) {
  if (allDay) return "Journée entière"
  return `${formatTime(startsAt)} – ${formatTime(endsAt)}`
}

// "Chaque semaine jusqu'au 31 décembre", or null for a one-off activity.
export function formatRepeat({
  repeat,
  repeatUntil,
  allDay,
}: Pick<AgendaActivity, "repeat" | "repeatUntil" | "allDay">) {
  if (repeat === "none") return null
  const every = repeat === "daily" ? "Chaque jour" : "Chaque semaine"
  if (!repeatUntil) return every
  // An all-day end is a UTC date, shown as is; a timed end is an instant, shown in the device timezone.
  const until = formatDate(
    { day: "numeric", month: "long", ...(allDay && { timeZone: "UTC" }) },
    repeatUntil
  )
  return `${every} jusqu'au ${until}`
}

// "lun. 12": a column header of the week.
export function formatShortDay(day: Date) {
  return formatDate({ weekday: "short", day: "numeric" }, day)
}

// "12 – 18 octobre 2026", "28 sept. – 4 oct. 2026" or across years, for the week starting at `start`.
export function formatWeekRange(start: Date) {
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).formatRange(start, end)
}

// "octobre 2026".
export function formatMonth(month: Date) {
  return formatDate({ month: "long", year: "numeric" }, month)
}

// "lun.": a column header of the month.
export function formatWeekday(day: Date) {
  return formatDate({ weekday: "short" }, day)
}

// "samedi 17 octobre".
export function formatFullDay(day: Date) {
  return formatDate({ weekday: "long", day: "numeric", month: "long" }, day)
}

// When a family event takes place: "Samedi 17 – dimanche 18 octobre" (all-day, UTC dates shown as is)
// or "Mercredi 14 octobre, 19:00 – 21:00" (device timezone).
export function formatEventWhen(
  event: Pick<AgendaItem, "startsAt" | "endsAt" | "allDay">
) {
  const options = { weekday: "long", day: "numeric", month: "long" } as const
  if (event.allDay) {
    const utc = (d: Date) =>
      new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
    const [start, end] = [utc(event.startsAt), utc(event.endsAt)]
    return capitalize(
      start.getTime() === end.getTime()
        ? formatDate(options, start)
        : new Intl.DateTimeFormat("fr-FR", options).formatRange(start, end)
    )
  }
  return `${capitalize(formatDate(options, event.startsAt))}, ${formatTimeRange(event)}`
}
