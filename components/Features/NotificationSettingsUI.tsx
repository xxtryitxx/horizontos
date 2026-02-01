import React, { useState, useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { createNotification } from '../../services/featuresService';
import { User } from '../../types';

interface NotificationSettingsUIProps {
  user: User;
  onUpdateSettings: (settings: any) => void;
}

export function NotificationSettingsUI({ user, onUpdateSettings }: NotificationSettingsUIProps) {
  const [settings, setSettings] = useState({
    pushNotifications: user.notificationsEnabled !== false,
    emailNotifications: true,
    shiftReminders: true,
    teamMessages: true,
    achievements: true,
    weeklyDigest: true,
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: keyof typeof settings) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    setSettings(newSettings);
    setSaved(false);
  };

  const handleSave = async () => {
    onUpdateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);

    if (settings.pushNotifications && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('HorizontOS', {
          body: 'Benachrichtigungen aktiviert! 🎉',
          icon: '/logo.svg',
        });
      }
    }
  };

  const notificationOptions = [
    { key: 'pushNotifications', label: '🔔 Push-Benachrichtigungen', desc: 'Browser-Benachrichtigungen' },
    { key: 'emailNotifications', label: '📧 E-Mail-Benachrichtigungen', desc: 'E-Mails für wichtige Ereignisse' },
    { key: 'shiftReminders', label: '⏰ Schicht-Erinnerungen', desc: '30 Min. vor Schichtbeginn' },
    { key: 'teamMessages', label: '💬 Team-Nachrichten', desc: 'Benachrichtigungen für neue Chat-Nachrichten' },
    { key: 'achievements', label: '🏆 Erfolgsbenachrichtigungen', desc: 'Wenn du Abzeichen freischaltest' },
    { key: 'weeklyDigest', label: '📰 Wöchentliche Zusammenfassung', desc: 'Samstag 09:00 Uhr' },
  ];

  return (
    <div className="space-y-4">
      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          Einstellungen gespeichert
        </div>
      )}

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">🔔 Benachrichtigungen</h3>
        <div className="space-y-3">
          {notificationOptions.map((option) => (
            <label
              key={option.key}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 cursor-pointer transition"
            >
              <input
                type="checkbox"
                checked={settings[option.key as keyof typeof settings]}
                onChange={() => handleToggle(option.key as keyof typeof settings)}
                className="mt-1 w-5 h-5 accent-brand-orange rounded cursor-pointer"
              />
              <div>
                <p className="font-bold">{option.label}</p>
                <p className="text-sm text-slate-600">{option.desc}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-brand-orange text-white font-bold py-2 rounded-lg hover:bg-orange-600 transition"
      >
        💾 Einstellungen speichern
      </button>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
        <p className="font-bold mb-1">ℹ️ Hinweis</p>
        <p>
          Push-Benachrichtigungen erfordern deine Genehmigung. Überprüfe die Browser-Berechtigungen, wenn du diese
          aktivieren möchtest.
        </p>
      </div>

      {/* Quick Test */}
      <button
        onClick={async () => {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Test-Benachrichtigung', {
              body: 'Deine Benachrichtigungen funktionieren! 👍',
              icon: '/logo.svg',
            });
          }
        }}
        className="w-full border border-brand-orange text-brand-orange font-bold py-2 rounded-lg hover:bg-slate-50 transition"
      >
        📬 Test-Benachrichtigung senden
      </button>
    </div>
  );
}
