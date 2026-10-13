import { getSessionMember } from "@/app/session"
import { logout } from "@/app/actions"
import { FirstRun } from "@/components/first-run"
import { Home } from "@/components/home"
import { LinkRequired } from "@/components/link-required"
import { hasFamily } from "@/lib/families"

// Reads data and picks what to show; the screens themselves are presentational.
export default async function Page() {
  const member = await getSessionMember()
  const canCreate = !member && !(await hasFamily())

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center px-4 py-12">
      <FirstRun canCreate={canCreate}>
        {member ? (
          <Home
            name={member.name}
            canManageFamily={member.role === "parent"}
            logoutAction={logout}
          />
        ) : (
          <LinkRequired />
        )}
      </FirstRun>
    </main>
  )
}
