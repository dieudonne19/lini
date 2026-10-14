import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { getSessionMember } from "@/app/session"
import { NewEventPanel } from "@/components/new-event-panel"

// The title follows the heading of the page: a parent creates an event, a child proposes one.
export async function generateMetadata(): Promise<Metadata> {
  const member = await getSessionMember()
  return {
    title:
      member?.role === "parent" ? "Nouvel événement" : "Proposer un événement",
  }
}

// Any member: a parent creates an event, a child proposes one.
export default async function Page() {
  const member = await getSessionMember()
  if (!member) redirect("/")

  const canPublish = member.role === "parent"
  return (
    <main className="mx-auto flex w-full max-w-120 flex-1 flex-col gap-8 px-4 py-10">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        {canPublish ? "Nouvel événement" : "Proposer un événement"}
      </h1>
      <NewEventPanel canPublish={canPublish} />
    </main>
  )
}
