import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function PWAInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to install: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Don't show again for 7 days
    localStorage.setItem('pwaPromptDismissed', new Date().toISOString());
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white rounded-2xl shadow-lg border-2 border-brand-orange overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-orange to-orange-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📱</span>
            <div>
              <p className="font-black">HorizontOS App</p>
              <p className="text-xs opacity-90">Installiere die App</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-white hover:bg-opacity-20 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <p className="text-sm text-slate-700 mb-4">
            Installiere HorizontOS als App auf deinem Gerät für schnelleren Zugriff und Offline-Unterstützung.
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
            <div className="flex items-center gap-2">
              <span>⚡</span>
              <span>Schneller Zugriff</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📵</span>
              <span>Offline-Modus</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🔔</span>
              <span>Benachrichtigungen</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✨</span>
              <span>Native Erfahrung</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="flex-1 bg-brand-orange text-white font-bold py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Installieren
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 border border-slate-300 text-slate-700 font-bold py-2 rounded-lg hover:bg-slate-50 transition"
            >
              Später
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-4 py-2 text-xs text-slate-600 border-t border-slate-200">
          💡 Tipp: Du kannst dies später im Menü installieren
        </div>
      </div>
    </div>
  );
}
