import { CalendarDays, NotebookPen, PartyPopper, Users } from "lucide-react"
import Link from "next/link"

import { cn } from "@/lib/utils"

type AppNavProps = {
  currentPath: string
  canManageFamily: boolean
  // "top": the links of the header, from tablet width up. "bottom": the bar fixed at the bottom of a phone screen.
  variant?: "top" | "bottom"
  className?: string
}

// Pure: the main links of a signed-in member. The current page is marked for screen readers and by its style.
// The two variants are the same links twice; the page shows one of them depending on the width (the other is hidden,
// so a screen reader only meets one).
function AppNav({
  currentPath,
  canManageFamily,
  variant = "top",
  className,
}: AppNavProps) {
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

  if (variant === "bottom")
    return (
      <nav
        aria-label="Navigation principale"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur",
          className
        )}
      >
        <ul
          className={cn(
            "mx-auto grid max-w-md",
            links.length === 4 ? "grid-cols-4" : "grid-cols-3"
          )}
        >
          {links.map(({ href, label, icon: Icon }) => {
            const current = isCurrent(href)
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    current
                      ? "font-semibold text-foreground"
                      : "font-medium text-muted-foreground"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-7 w-14 items-center justify-center rounded-full transition-colors",
                      current && "bg-accent"
                    )}
                  >
                    <Icon aria-hidden className="size-5" />
                  </span>
                  {label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    )

  return (
    <nav
      aria-label="Navigation principale"
      className={cn("flex items-center gap-1", className)}
    >
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={isCurrent(href) ? "page" : undefined}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-3 text-sm transition-colors",
            isCurrent(href)
              ? "font-semibold"
              : "font-medium text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon aria-hidden className="hidden size-4 shrink-0 lg:block" />
          {label}
        </Link>
      ))}
    </nav>
  )
}

export { AppNav }
