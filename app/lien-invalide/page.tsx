import { LinkInvalid } from "@/components/link-invalid"

export const metadata = { title: "Lien invalide" }

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
      <LinkInvalid />
    </main>
  )
}
