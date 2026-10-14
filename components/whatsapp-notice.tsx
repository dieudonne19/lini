import { MessageCircle } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { whatsappLink } from "@/lib/whatsapp"

type Person = { id: string; name: string; phone: string }

// For the members who cannot get notifications (none turned on) and whose number a parent has entered: a button that
// opens WhatsApp with the message ready. The parent taps send. Parents only: the numbers are theirs to see.
export function WhatsappNotice({
  people,
  author,
  title,
  url,
}: {
  people: Person[]
  author: string
  title: string
  url: string
}) {
  const links = people.flatMap((person) => {
    const href = whatsappLink(
      person.phone,
      `Salut ${person.name}, ${author} a ajouté « ${title} » sur Lini : ${url}`
    )
    return href ? [{ ...person, href }] : []
  })
  if (!links.length) return null

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold">Prévenir par WhatsApp</h2>
      <p className="text-muted-foreground">
        Ces membres n&apos;ont pas activé les notifications.
      </p>
      <ul className="flex flex-col gap-2">
        {links.map(({ id, name, href }) => (
          <li key={id}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({
                variant: "outline",
                size: "lg",
                className: "h-11 justify-start",
              })}
            >
              <MessageCircle aria-hidden />
              Prévenir {name} par WhatsApp
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
