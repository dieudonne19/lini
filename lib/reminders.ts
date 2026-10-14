import { db } from "@/lib/db"
import { notifyReminder } from "@/lib/notifications"

const HOUR = 60 * 60 * 1000

// The reminder of the day before, run once a day (see vercel.json). Each run takes the confirmed events that start
// between 12 and 36 hours from now: a window of 24 hours, like the interval between runs, so every event falls in
// exactly one run, one to a day and a half before it starts.
// shortcut: the day is not the family's own (the server does not know their time zone), so "the day before" is
// approximate; and an event created less than 12 hours ahead gets no reminder, it was announced when created.
export async function sendDueReminders(now = new Date()) {
  const events = await db.familyEvent.findMany({
    where: {
      status: "confirmed",
      reminderSentAt: null,
      startsAt: {
        gte: new Date(now.getTime() + 12 * HOUR),
        lt: new Date(now.getTime() + 36 * HOUR),
      },
    },
    select: { id: true, familyId: true, title: true },
  })

  let reminded = 0
  let failed = 0
  for (const event of events) {
    // Claiming the event first keeps two overlapping runs from sending the same reminder twice.
    const { count } = await db.familyEvent.updateMany({
      where: { id: event.id, reminderSentAt: null },
      data: { reminderSentAt: now },
    })
    if (!count) continue
    failed += await notifyReminder(event.familyId, event)
    reminded++
  }
  return { reminded, failed }
}
