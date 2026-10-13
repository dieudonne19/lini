import { redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { NewEventPanel } from "@/components/new-event-panel"

// Any member: a parent creates an event, a child proposes one.
export default async function Page() {
  const member = await getSessionMember()
  if (!member) redirect("/")

  const canPublish = member.role === "parent"
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-8 px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        {canPublish ? "Nouvel événement" : "Proposer un événement"}
      </h1>
      <NewEventPanel canPublish={canPublish} />
    </main>
  )
}
