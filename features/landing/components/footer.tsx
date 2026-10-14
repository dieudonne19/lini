import { FOOTER_TEXT } from "../data/content"
import { Logo } from "./logo"

export function Footer() {
  return (
    <footer className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-4 px-4 py-10 text-sm text-muted-foreground md:px-6">
      <Logo label="Lini" className="h-7 w-auto" />
      <p>{FOOTER_TEXT}</p>
    </footer>
  )
}
