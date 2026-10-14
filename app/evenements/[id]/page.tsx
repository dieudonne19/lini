import { headers } from "next/headers"
import { notFound, redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { EventDetailView } from "@/components/event-detail-view"
import { RetryNotification } from "@/components/retry-notification"
import { WhatsappNotice } from "@/components/whatsapp-notice"
import { hasEnded } from "@/lib/event-rules"
import { getEvent } from "@/lib/events"
import { listFamilyMembers } from "@/lib/members"
import { subscribedMemberIds } from "@/lib/push"

export const metadata = { title: "Événement" }

// One event. A proposal the member may not see is "not found", like an event that does not exist.
export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ notif?: string }>
}) {
  const member = await getSessionMember()
  if (!member) redirect("/")

  const { id } = await params
  const event = await getEvent(member, id)
  if (!event) notFound()

  // After a save that could not tell everyone: whoever may tell them again gets the button (the action checks too).
  const { notif } = await searchParams
  const canRetry =
    notif === "echec" &&
    (event.status === "confirmed"
      ? member.role === "parent"
      : event.createdById === member.id)

  // A parent can tell by WhatsApp the members who have no notifications and whose number is known.
  let whatsapp: { id: string; name: string; phone: string }[] = []
  if (
    member.role === "parent" &&
    event.status === "confirmed" &&
    !hasEnded(event, new Date())
  ) {
    const [members, subscribed] = await Promise.all([
      listFamilyMembers(member),
      subscribedMemberIds(member.familyId),
    ])
    whatsapp = members.flatMap(({ id: memberId, name, phone }) =>
      memberId !== member.id && phone && !subscribed.has(memberId)
        ? [{ id: memberId, name, phone }]
        : []
    )
  }
  const h = await headers()
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("x-forwarded-host") ?? h.get("host")}`

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 *:max-w-2xl">
      {canRetry && <RetryNotification eventId={id} />}
      <EventDetailView
        event={event}
        viewer={{ id: member.id, role: member.role }}
      />
      <WhatsappNotice
        people={whatsapp}
        author={member.name}
        title={event.title}
        url={`${origin}/evenements/${id}`}
      />
    </main>
  )
}
