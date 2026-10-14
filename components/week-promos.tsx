"use client"

import { Bell, Download } from "lucide-react"

import { PromoBar } from "@/components/promo-bar"
import { useInstall } from "@/hooks/use-install"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useSnooze } from "@/hooks/use-snooze"

// Container: one invitation at a time under the header. Notifications first; once they are on or put off for a
// while, the invitation to install the app.
export function WeekPromos() {
  const push = usePushNotifications()
  const install = useInstall()
  const notificationsLater = useSnooze("lini:notifications-later")
  const installLater = useSnooze("lini:install-later")

  if (push.status === "off" && !notificationsLater.snoozed)
    return (
      <PromoBar
        icon={Bell}
        action={{
          label: "Activer les notifications",
          onClick: push.enable,
          pending: push.pending,
        }}
        onLater={notificationsLater.snooze}
        message={push.message}
      >
        Sois prévenu des événements de ta famille, avec un rappel avant chacun.
      </PromoBar>
    )

  if (install.offer && !installLater.snoozed)
    return (
      <PromoBar
        icon={Download}
        action={
          install.offer === "button"
            ? { label: "Installer Lini", onClick: install.install }
            : undefined
        }
        onLater={installLater.snooze}
      >
        {install.offer === "button"
          ? "Installe Lini sur ton écran d'accueil pour l'ouvrir comme une application."
          : "Pour installer Lini, touche Partager, puis « Sur l'écran d'accueil »."}
      </PromoBar>
    )

  return null
}
