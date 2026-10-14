import { AgendaSkeleton } from "@/components/agenda-skeleton"

export default function Loading() {
  return (
    <main className="mx-auto flex flex-1 w-full max-w-5xl flex-col gap-8 px-4 py-10 *:max-w-md">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Mon agenda</h1>
      <AgendaSkeleton />
    </main>
  )
}
