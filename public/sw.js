// AgriPredict Service Worker for Native Web Push Notifications
// Works on Android, Windows, macOS, iOS (PWA), Linux

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "AgriPredict Alert", body: event.data.text() };
    }
  }

  const title = data.title || "🌾 AgriPredict Alert";
  const options = {
    body: data.body || "Real-time Mandi price & weather advisory update.",
    icon: data.icon || "/favicon.ico",
    badge: data.badge || "/favicon.ico",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/market-prices",
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    tag: data.tag || "agripredict-alert",
    renotify: true,
    actions: [
      {
        action: "explore",
        title: "📊 View Details"
      },
      {
        action: "close",
        title: "✖ Close"
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if ("focus" in client) {
          if (client.url.includes(self.origin)) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }
      }
      // Otherwise open a new tab/window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
