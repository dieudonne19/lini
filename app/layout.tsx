import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import { logout } from "@/app/actions"
import { getSessionMember } from "@/app/session"
import { AppNavContainer } from "@/components/app-nav-container"
import { Logo } from "@/components/logo"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

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
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <header className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 pt-6">
            <Logo />
            {member && (
              <AppNavContainer
                canManageFamily={member.role === "parent"}
                logoutAction={logout}
              />
            )}
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
