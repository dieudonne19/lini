import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { CTA_HREF, CTA_LABEL } from "../data/content"
import { Logo } from "./logo"

const NAV_LINK =
  "hidden text-base text-muted-foreground hover:text-foreground hover:underline md:inline"

export function Header() {
  return (
    <header className="mx-auto flex h-20 max-w-[1160px] items-center justify-between gap-4 px-4 md:px-6">
      <Link href="/" aria-label="Lini, accueil">
        <Logo className="h-9 w-auto" />
      </Link>
      <nav
        aria-label="Navigation principale"
        className="flex items-center gap-8"
      >
        <a className={NAV_LINK} href="#comment">
          Comment ça marche
        </a>
        <a className={NAV_LINK} href="#questions">
          Questions
        </a>
        {/* Caché sur mobile : le bouton principal du hero est déjà visible. cn() et non buttonVariants seul : seul cn
            fait gagner `hidden` sur le `inline-flex` de base du bouton. */}
        <Link
          href={CTA_HREF}
          className={cn(
            buttonVariants(),
            "hidden h-12 px-6 text-base font-semibold md:inline-flex"
          )}
        >
          {CTA_LABEL}
        </Link>
      </nav>
    </header>
  )
}
