import { notFound, redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { EditActivityPanel } from "@/components/edit-activity-panel"
import { getOwnActivity } from "@/lib/activities"

// Only the owner can open an activity: someone else's is "not found".
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const member = await getSessionMember()
  if (!member) redirect("/")

  const { id } = await params
  const activity = await getOwnActivity(member.id, id)
  if (!activity) notFound()

  const { title, startsAt, endsAt, allDay, isPrivate, repeat, repeatUntil } =
    activity
  return (
    <main className="mx-auto flex flex-1 w-full max-w-md flex-col gap-8 px-4 py-12">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Modifier l&apos;activité
        </h1>
        {repeat !== "none" && (
          <p className="text-muted-foreground">
            Cette activité se répète : toute la série sera modifiée.
          </p>
        )}
      </div>
      <EditActivityPanel
        activity={{
          id,
          title,
          startsAt,
          endsAt,
          allDay,
          isPrivate,
          repeat,
          repeatUntil,
        }}
      />
    </main>
  )
}
