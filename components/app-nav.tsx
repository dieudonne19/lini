import Link from "next/link"

import { cn } from "@/lib/utils"

type AppNavProps = {
  currentPath: string
  canManageFamily: boolean
  className?: string
}

const linkClass =
  "inline-flex min-h-11 shrink-0 items-center rounded-lg px-2 text-sm sm:px-3 transition-colors hover:bg-muted"

// Pure: the main links of a signed-in member. The current page is marked for screen readers and by a tint.
function AppNav({ currentPath, canManageFamily, className }: AppNavProps) {
  const links = [
    { href: "/", label: "Semaine" },
    { href: "/agenda", label: "Mon agenda" },
    { href: "/evenements", label: "Événements" },
    ...(canManageFamily ? [{ href: "/famille", label: "Famille" }] : []),
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
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isCurrent(href) ? "page" : undefined}
          className={cn(
            linkClass,
            isCurrent(href)
              ? "bg-accent font-semibold"
              : "font-medium text-muted-foreground hover:text-foreground"
          )}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}

export { AppNav }
