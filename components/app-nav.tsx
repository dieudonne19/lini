import Link from "next/link"

import { Button } from "@/components/ui/button"

type AppNavProps = {
  currentPath: string
  canManageFamily: boolean
  logoutAction: () => void
}

const linkClass =
  "inline-flex min-h-11 items-center rounded-md px-3 text-sm underline-offset-4 hover:underline"

// Pure: the main links of a signed-in member. The current page is marked for screen readers and in bold.
function AppNav({ currentPath, canManageFamily, logoutAction }: AppNavProps) {
  const links = [
    { href: "/", label: "Semaine" },
    { href: "/agenda", label: "Mon agenda" },
    ...(canManageFamily ? [{ href: "/famille", label: "Famille" }] : []),
  ]
  const isCurrent = (href: string) =>
    href === "/" ? currentPath === "/" : currentPath.startsWith(href)

  return (
    <nav
      aria-label="Navigation principale"
      className="flex flex-wrap items-center gap-x-1"
    >
      {links.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          aria-current={isCurrent(href) ? "page" : undefined}
          className={`${linkClass} ${isCurrent(href) ? "font-bold" : "font-medium text-muted-foreground"}`}
        >
          {label}
        </Link>
      ))}
      <form action={logoutAction}>
        <Button
          type="submit"
          variant="ghost"
          className="h-11 font-medium text-muted-foreground"
        >
          Se déconnecter
        </Button>
      </form>
    </nav>
  )
}

export { AppNav }
