const CACHE_NAME = "horizontos-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/src/main.tsx",
];

// Install event - cache files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("✅ Cache opened");
      return cache.addAll(urlsToCache).catch(() => {
        console.log("⚠️ Some assets could not be cached");
      });
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }

        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      }).catch(() => {
        return new Response("Offline - Resource not available");
      });
    })
  );
});

// Push notification event
self.addEventListener("push", (event) => {
  const options = {
    body: event.data?.text(),
    icon: "/logo.png",
    badge: "/badge.png",
    tag: "horizontos-notification",
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification("HorizontOS", options)
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
        for (let client of clientList) {
          if (client.url === "/" && "focus" in client) {
            try {
              return client.focus();
            } catch (e) {
              return null;
            }
          }
        }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
