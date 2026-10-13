"use client"

import { usePathname } from "next/navigation"

import { AppNav } from "@/components/app-nav"

// Container: gives the pure navigation the current path.
export function AppNavContainer(props: {
  canManageFamily: boolean
  logoutAction: () => void
}) {
  return <AppNav currentPath={usePathname()} {...props} />
}
