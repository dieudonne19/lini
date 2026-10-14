import { RecoverAccess } from "@/components/recover-access"

export const metadata = { title: "Retrouver mon accès" }

// For a parent who lost their link. A signed-in visitor is not redirected: the page refreshes right after a recovery
// and must keep the new link and the new code on screen.
export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <RecoverAccess />
    </main>
  )
}
