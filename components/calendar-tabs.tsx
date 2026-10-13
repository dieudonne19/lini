import Link from "next/link"

type CalendarTabsProps = {
  current: "week" | "month"
  weekHref: string
  monthHref: string
}

const tabClass = (active: boolean) =>
  `inline-flex h-11 items-center rounded-lg px-4 text-sm font-medium ${active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`

// Pure: switches between the week and the month. They are links (each view has its own address).
function CalendarTabs({ current, weekHref, monthHref }: CalendarTabsProps) {
  return (
    <nav
      aria-label="Vue du calendrier"
      className="flex w-fit gap-1 rounded-xl border border-border p-1"
    >
      <Link
        href={weekHref}
        aria-current={current === "week" ? "page" : undefined}
        className={tabClass(current === "week")}
      >
        Semaine
      </Link>
      <Link
        href={monthHref}
        aria-current={current === "month" ? "page" : undefined}
        className={tabClass(current === "month")}
      >
        Mois
      </Link>
    </nav>
  )
}

export { CalendarTabs }
