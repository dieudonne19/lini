import type { Metadata } from "next"
import { Bricolage_Grotesque, Figtree } from "next/font/google"

import { logout } from "@/app/actions"
import { getSessionMember } from "@/app/session"
import { AppNavContainer } from "@/components/app-nav-container"
import { Logo } from "@/components/logo"
import { UserBadge } from "@/components/user-badge"
import "./globals.css"
import { cn } from "@/lib/utils"

// Titles echo the rounded lowercase logo; the body stays quiet and very legible.
const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
})
const fontBody = Figtree({ subsets: ["latin"], variable: "--font-body" })

export const metadata: Metadata = {
  title: "Lini",
  description: "Qui fait quoi, et quand êtes-vous tous libres ?",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const member = await getSessionMember()
  return (
    <html
      lang="fr"
      className={cn(
        "font-sans antialiased",
        fontDisplay.variable,
        fontBody.variable
      )}
    >
      <body className="flex min-h-svh flex-col">
        <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
          <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 px-4 py-1.5">
            <Logo />
            {member && (
              <>
                <AppNavContainer
                  canManageFamily={member.role === "parent"}
                  className="order-last w-full sm:order-none sm:w-auto"
                />
                <UserBadge
                  name={member.name}
                  color={member.color}
                  role={member.role}
                  logoutAction={logout}
                />
              </>
            )}
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
