import Link from "next/link"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CalendarTabsProps = {
  current: "week" | "month"
  weekHref: string
  monthHref: string
}

// Underlined tabs: the active one is dark with a line over the rule under the whole row.
const triggerClass =
  "h-full flex-none rounded-none px-1 text-base font-semibold text-muted-foreground hover:text-foreground data-active:text-foreground group-data-horizontal/tabs:after:bottom-[-1px]"

// Pure: switches between the week and the month. Each tab is a link (each view has its own address), so the
// selected tab simply follows the page that is shown.
function CalendarTabs({ current, weekHref, monthHref }: CalendarTabsProps) {
  return (
    <Tabs value={current}>
      <TabsList
        variant="line"
        aria-label="Vue du calendrier"
        className="w-full justify-start gap-6 border-b p-0 group-data-horizontal/tabs:h-12"
      >
        <TabsTrigger
          value="week"
          nativeButton={false}
          render={<Link href={weekHref} />}
          className={triggerClass}
        >
          Semaine
        </TabsTrigger>
        <TabsTrigger
          value="month"
          nativeButton={false}
          render={<Link href={monthHref} />}
          className={triggerClass}
        >
          Mois
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}

export { CalendarTabs }
