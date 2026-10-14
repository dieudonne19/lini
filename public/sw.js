// Lini's service worker. It only shows push notifications and opens the right page when one is touched:
// it caches nothing, so the app always shows the family's current data.

self.addEventListener("install", () => self.skipWaiting())
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()))

self.addEventListener("push", (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    // Not JSON: show the generic notification below.
  }
  event.waitUntil(
    self.registration.showNotification(data.title || "Lini", {
      body: data.body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: { url: data.url || "/" },
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  // Only pages of Lini itself: whatever the payload says, the target is resolved against our own origin.
  const target = new URL(event.notification.data?.url || "/", self.location.origin)
  const url = target.origin === self.location.origin ? target.href : self.location.origin

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(async (windows) => {
        const open = windows.find((client) => "navigate" in client)
        if (open) {
          await open.navigate(url)
          return open.focus()
        }
        return self.clients.openWindow(url)
      })
  )
})
