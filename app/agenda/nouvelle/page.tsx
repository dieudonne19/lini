import { redirect } from "next/navigation"

import { getSessionMember } from "@/app/session"
import { NewActivityPanel } from "@/components/new-activity-panel"

export default async function Page() {
  if (!(await getSessionMember())) redirect("/")

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col gap-8 px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">
        Ajouter une activité
      </h1>
      <NewActivityPanel />
    </main>
  )
}
