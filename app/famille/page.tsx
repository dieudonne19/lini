import { redirect } from "next/navigation"

import { getSessionParent } from "@/app/session"
import { AddMemberPanel } from "@/components/add-member-panel"
import { ManageMembers } from "@/components/manage-members"
import { listFamilyMembers } from "@/lib/members"

// Parents only: anyone else goes back to the home page.
export default async function Page() {
  const parent = await getSessionParent()
  if (!parent) redirect("/")

  const members = await listFamilyMembers(parent)
  return (
    <main className="mx-auto flex flex-1 w-full max-w-5xl flex-col gap-10 px-4 py-10 *:max-w-md">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Famille</h1>
        <ManageMembers members={members} currentMemberId={parent.id} />
      </section>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold tracking-tight">
          Ajouter un membre
        </h2>
        <AddMemberPanel />
      </section>
    </main>
  )
}
