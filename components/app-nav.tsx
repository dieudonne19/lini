import { CalendarDays, NotebookPen, PartyPopper, Users } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

type AppNavProps = {
  currentPath: string
  canManageFamily: boolean
  className?: string
}

const linkClass =
  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2 text-sm sm:px-3 transition-colors"

// Pure: the main links of a signed-in member. The current page is marked for screen readers and by a tint.
function AppNav({ currentPath, canManageFamily, className }: AppNavProps) {
  const links = [
    { href: "/", label: "Semaine", icon: CalendarDays },
    { href: "/agenda", label: "Mon agenda", icon: NotebookPen },
    { href: "/evenements", label: "Événements", icon: PartyPopper },
    ...(canManageFamily
      ? [{ href: "/famille", label: "Famille", icon: Users }]
      : []),
  ]
  const isCurrent = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href)

  return (
    <nav
      aria-label="Navigation principale"
      className={cn(
        "flex [scrollbar-width:none] items-center gap-0.5 overflow-x-auto sm:gap-1",
        className
      )}
    >
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isCurrent(href) ? "page" : undefined}
          className={cn(
            linkClass,
            isCurrent(href)
              ? "font-semibold"
              : "font-medium text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon aria-hidden className="hidden size-4 shrink-0 sm:block" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

export { AppNav }
