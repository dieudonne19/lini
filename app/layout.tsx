import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque, Figtree } from "next/font/google"

import { logout } from "@/app/actions"
import { getSessionMember } from "@/app/session"
import { AppNavContainer } from "@/components/app-nav-container"
import { Logo } from "@/components/logo"
import { UserMenu } from "@/components/user-menu"
import "./globals.css"
import { cn } from "@/lib/utils"

// Titles echo the rounded lowercase logo; the body stays quiet and very legible.
const fontDisplay = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
})
const fontBody = Figtree({ subsets: ["latin"], variable: "--font-body" })

const TITLE = "Lini · l’agenda partagé de la maison"
const DESCRIPTION =
  "Lini réunit les activités de toute la famille dans un seul agenda : qui fait quoi, et quand tout le monde est libre pour organiser un événement."

// On Vercel the production domain is provided; elsewhere (local, CI) the address of the dev server.
const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: TITLE, template: "%s · Lini" },
  description: DESCRIPTION,
  applicationName: "Lini",
  openGraph: {
    type: "website",
    siteName: "Lini",
    locale: "fr_FR",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  // shortcut: a private family tool with no marketing yet, so it stays out of search engines. A meta tag and
  // not a robots.txt rule, so that link previews (which need to read the page) keep working. Remove it to open the
  // landing page to search engines.
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: "#f7f9fe",
  colorScheme: "light",
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
                <UserMenu
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
