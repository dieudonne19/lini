import { notFound, redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { EditEventPanel } from "@/components/edit-event-panel"
import { canEdit } from "@/lib/event-rules"
import { getEvent } from "@/lib/events"

// Parents only, on a confirmed event. Anyone else is sent back to the event (or gets "not found" if they may
// not see it).
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const member = await getSessionMember()
  if (!member) redirect("/")

  const { id } = await params
  const event = await getEvent(member, id)
  if (!event) notFound()
  if (!canEdit(member, event)) redirect(`/evenements/${id}`)

  const { title, place, description, startsAt, endsAt, allDay } = event
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 *:max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        Modifier l&apos;événement
      </h1>
      <EditEventPanel
        event={{ id, title, place, description, startsAt, endsAt, allDay }}
      />
    </main>
  )
}
