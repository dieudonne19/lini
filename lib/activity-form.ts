import { activitySchema } from "@/lib/schemas"

// What a person types in the activity form: a local date, local times, checkboxes.
export type ActivityFields = {
  title: string
  date: string // "2026-10-14"
  startTime: string // "18:00"
  endTime: string
  allDay: boolean
  isPrivate: boolean
  repeat: string
  repeatUntil: string // "2026-12-31" or ""
}

type FormDataLike = { get(name: string): FormDataEntryValue | null }

const text = (data: FormDataLike, name: string) => String(data.get(name) ?? "")

export function readActivityFields(data: FormDataLike): ActivityFields {
  return {
    title: text(data, "title"),
    date: text(data, "date"),
    startTime: text(data, "startTime"),
    endTime: text(data, "endTime"),
    allDay: data.get("allDay") === "on",
    isPrivate: data.get("isPrivate") === "on",
    repeat: text(data, "repeat") || "none",
    repeatUntil: text(data, "repeatUntil"),
  }
}

// Friendly messages for fields left empty, shown before anything is sent. The server validates again.
export function missingFieldErrors({
  title,
  date,
  startTime,
  endTime,
  allDay,
}: ActivityFields) {
  const errors: Partial<
    Record<"title" | "date" | "startTime" | "endTime", string[]>
  > = {}
  if (!title.trim()) errors.title = ["Écris un titre"]
  if (!date) errors.date = ["Choisis un jour"]
  if (!allDay && !startTime) errors.startTime = ["Choisis une heure de début"]
  if (!allDay && !endTime) errors.endTime = ["Choisis une heure de fin"]
  return errors
}

// An unparseable date is passed on as typed, so the server reports it instead of this code throwing.
const toInstant = (date: Date, typed: string) =>
  Number.isNaN(date.getTime()) ? typed : date.toISOString()

// Converts the typed local date and times into the UTC instants the server stores, as form data.
// Runs in the browser: "local" is the device timezone.
export function toActivityPayload(fields: ActivityFields) {
  const {
    title,
    date,
    startTime,
    endTime,
    allDay,
    isPrivate,
    repeat,
    repeatUntil,
  } = fields
  let startsAt: string
  let endsAt: string
  let until: string

  if (allDay) {
    // An all-day activity is a UTC date, never converted.
    startsAt = endsAt = `${date}T00:00:00.000Z`
    until = `${repeatUntil}T00:00:00.000Z`
  } else {
    const start = new Date(`${date}T${startTime}`)
    const end = new Date(`${date}T${endTime}`)
    // An end earlier than the start means the next day (22:00 to 01:00).
    if (end < start) end.setDate(end.getDate() + 1)
    startsAt = toInstant(start, `${date}T${startTime}`)
    endsAt = toInstant(end, `${date}T${endTime}`)
    // The repetition includes its last day: it ends at the end of that local day.
    until = toInstant(new Date(`${repeatUntil}T23:59:59.999`), repeatUntil)
  }

  const payload = new FormData()
  payload.set("title", title)
  payload.set("startsAt", startsAt)
  payload.set("endsAt", endsAt)
  payload.set("allDay", String(allDay))
  payload.set("isPrivate", String(isPrivate))
  payload.set("repeat", repeat)
  payload.set("repeatUntil", repeat !== "none" && repeatUntil ? until : "")
  return payload
}

// Server side: validates what toActivityPayload sent.
export function parseActivityPayload(data: FormDataLike) {
  return activitySchema.safeParse({
    title: text(data, "title"),
    startsAt: text(data, "startsAt"),
    endsAt: text(data, "endsAt"),
    allDay: text(data, "allDay") === "true",
    isPrivate: text(data, "isPrivate") === "true",
    repeat: text(data, "repeat"),
    repeatUntil: text(data, "repeatUntil") || null,
  })
}
