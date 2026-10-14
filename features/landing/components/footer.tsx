import { CONTACT_LINKS, FOOTER_TEXT } from "../data/content"
import { Logo } from "./logo"
import { GithubIcon, LinkedinIcon, WhatsappIcon } from "./social-icons"

const ICONS = {
  GitHub: GithubIcon,
  LinkedIn: LinkedinIcon,
  WhatsApp: WhatsappIcon,
} as const

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground md:px-6">
      <Logo label="Lini" className="h-10 w-auto" />
      <p>{FOOTER_TEXT}</p>
      <ul aria-label="Contact" className="flex items-center gap-1">
        {CONTACT_LINKS.map(({ label, href }) => {
          const Icon = ICONS[label]
          return (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${label} (s'ouvre dans un nouvel onglet)`}
                className="inline-flex size-11 items-center justify-center rounded-lg transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <Icon className="size-5" />
              </a>
            </li>
          )
        })}
      </ul>
    </footer>
  )
}
