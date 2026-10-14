"use client"

import { usePathname } from "next/navigation"

// The landing page (visitors on /) has its own header and footer: the app's header stays out of its way.
// A client component only for the pathname; the header itself is still rendered on the server.
export function HideOnLanding({
  when,
  children,
}: {
  when: boolean
  children: React.ReactNode
}) {
  const pathname = usePathname()
  return when && pathname === "/" ? null : <>{children}</>
}
