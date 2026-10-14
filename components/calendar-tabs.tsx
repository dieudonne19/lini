import Link from "next/link"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type CalendarTabsProps = {
  current: "week" | "month"
  weekHref: string
  monthHref: string
}

const triggerClass =
  "h-9 px-4 data-active:bg-primary data-active:font-semibold data-active:text-primary-foreground"

// Pure: switches between the week and the month. Each tab is a link (each view has its own address), so the
// selected tab simply follows the page that is shown.
function CalendarTabs({ current, weekHref, monthHref }: CalendarTabsProps) {
  return (
    <Tabs value={current}>
      <TabsList
        aria-label="Vue du calendrier"
        className="group-data-horizontal/tabs:h-11"
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
