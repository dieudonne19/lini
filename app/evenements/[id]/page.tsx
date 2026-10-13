import { notFound, redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { EventDetailView } from "@/components/event-detail-view"
import { getEvent } from "@/lib/events"

// One event. A proposal the member may not see is "not found", like an event that does not exist.
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

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-8">
      <EventDetailView
        event={event}
        viewer={{ id: member.id, role: member.role }}
      />
    </main>
  )
}
