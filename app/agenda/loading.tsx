import { AgendaSkeleton } from "@/components/agenda-skeleton"

export default function Loading() {
  return (
    <main className="mx-auto flex flex-1 w-full max-w-md flex-col gap-8 px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Mon agenda</h1>
      <AgendaSkeleton />
    </main>
  )
}
