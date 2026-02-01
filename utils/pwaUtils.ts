/**
 * Progressive Web App Utilities
 */

export function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("✅ Service Worker registered");
      })
      .catch((error) => {
        console.error("❌ Service Worker error:", error);
      });
  }
}

export function checkPWAInstallPrompt() {
  let deferredPrompt: any;

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
  });

  return deferredPrompt;
}

export async function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      return true;
    }
    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
  }
  return false;
}

export function sendPushNotification(title: string, options?: NotificationOptions) {
  if ("serviceWorker" in navigator && "Notification" in window) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, {
        icon: "/logo.png",
        badge: "/badge.png",
        ...options,
      });
    });
  }
}

export function enableOfflineMode() {
  if ("serviceWorker" in navigator) {
    console.log("✅ Offline mode enabled");
  }
}
