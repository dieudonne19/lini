"use client"

import { Bell, Download, ShieldCheck } from "lucide-react"

import { PromoBar } from "@/components/promo-bar"
import { useInstall } from "@/hooks/use-install"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { useSnooze } from "@/hooks/use-snooze"

// Container: one invitation at a time under the header. Safety first: a parent who is alone in the family is asked to
// add a second one. Then notifications; once they are on or put off for a while, the invitation to install the app.
export function WeekPromos({ soloParent }: { soloParent: boolean }) {
  const push = usePushNotifications()
  const install = useInstall()
  const notificationsLater = useSnooze("lini:notifications-later")
  const installLater = useSnooze("lini:install-later")
  const secondParentLater = useSnooze("lini:second-parent-later")

  if (soloParent && !secondParentLater.snoozed)
    return (
      <PromoBar
        tone="warning"
        icon={ShieldCheck}
        action={{ label: "Ajouter un parent", href: "/famille" }}
        onLater={secondParentLater.snooze}
      >
        Ajoute un deuxième parent : si tu perds ton lien, lui seul pourra t&apos;en
        redonner un.
      </PromoBar>
    )

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
