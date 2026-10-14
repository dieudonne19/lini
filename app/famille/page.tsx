import { redirect } from "next/navigation"

import { getSessionParent } from "@/app/session"
import { AddMemberPanel } from "@/components/add-member-panel"
import { ManageMembers } from "@/components/manage-members"
import { RecoveryCodePanel } from "@/components/recovery-code-panel"
import { listFamilyMembers } from "@/lib/members"
import { hasRecoveryCode } from "@/lib/recovery"

export const metadata = { title: "Famille" }

// Parents only: anyone else goes back to the home page.
export default async function Page() {
  const parent = await getSessionParent()
  if (!parent) redirect("/")

  const [members, hasCode] = await Promise.all([
    listFamilyMembers(parent),
    hasRecoveryCode(parent.familyId),
  ])
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-10 px-4 py-10 *:max-w-md">
      <section className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Famille
          </h1>
          <AddMemberPanel />
        </div>
        <ManageMembers members={members} currentMemberId={parent.id} />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Code de secours</h2>
        <RecoveryCodePanel hasCode={hasCode} />
      </section>
    </main>
  )
}
