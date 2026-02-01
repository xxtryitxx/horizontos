import React, { useState } from 'react';
import { Calendar, Check, Link as LinkIcon } from 'lucide-react';

interface CalendarSyncSettingsUIProps {
  onUpdateSettings: (settings: any) => void;
}

export function CalendarSyncSettingsUI({ onUpdateSettings }: CalendarSyncSettingsUIProps) {
  const [settings, setSettings] = useState({
    googleCalendar: false,
    outlookCalendar: false,
    icalSync: false,
    syncShifts: true,
    syncEvents: true,
    autoReminders: true,
    reminderMinutes: 30,
  });
  const [saved, setSaved] = useState(false);

  const handleToggle = (key: string) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleGoogleConnect = () => {
    console.log('Google Calendar-Verbindung würde hier geöffnet');
    handleToggle('googleCalendar');
  };

  const handleOutlookConnect = () => {
    console.log('Outlook-Verbindung würde hier geöffnet');
    handleToggle('outlookCalendar');
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          Einstellungen gespeichert
        </div>
      )}

      {/* Connected Calendars */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">🔗 Kalender-Integration</h3>
        <div className="space-y-3">
          {/* Google Calendar */}
          <div className="p-4 border-2 rounded-lg border-slate-200 hover:border-slate-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔴</span>
                <div>
                  <p className="font-bold">Google Calendar</p>
                  <p className="text-xs text-slate-600">Synchronisiere mit Google Kalender</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded ${
                settings.googleCalendar ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {settings.googleCalendar ? '✓ Verbunden' : 'Nicht verbunden'}
              </span>
            </div>
            <button
              onClick={handleGoogleConnect}
              className={`w-full py-2 rounded font-bold text-sm transition ${
                settings.googleCalendar
                  ? 'border border-red-300 text-red-700 hover:bg-red-50'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {settings.googleCalendar ? '❌ Trennen' : '🔗 Verbinden'}
            </button>
          </div>

          {/* Outlook Calendar */}
          <div className="p-4 border-2 rounded-lg border-slate-200 hover:border-slate-300 transition">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔵</span>
                <div>
                  <p className="font-bold">Outlook Calendar</p>
                  <p className="text-xs text-slate-600">Synchronisiere mit Microsoft 365</p>
                </div>
              </div>
              <span className={`px-2 py-1 text-xs font-bold rounded ${
                settings.outlookCalendar ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
              }`}>
                {settings.outlookCalendar ? '✓ Verbunden' : 'Nicht verbunden'}
              </span>
            </div>
            <button
              onClick={handleOutlookConnect}
              className={`w-full py-2 rounded font-bold text-sm transition ${
                settings.outlookCalendar
                  ? 'border border-red-300 text-red-700 hover:bg-red-50'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {settings.outlookCalendar ? '❌ Trennen' : '🔗 Verbinden'}
            </button>
          </div>

          {/* iCal Feed */}
          <div className="p-4 border-2 rounded-lg border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-bold">iCal Feed</p>
                <p className="text-xs text-slate-600">Manuelles iCal-Format exportieren</p>
              </div>
            </div>
            <button className="w-full py-2 px-3 border border-brand-orange text-brand-orange rounded font-bold text-sm hover:bg-slate-50 transition">
              📥 iCal Feed generieren
            </button>
          </div>
        </div>
      </div>

      {/* Sync Options */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">⚙️ Synchronisierungsoptionen</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={settings.syncShifts}
              onChange={() => handleToggle('syncShifts')}
              className="w-5 h-5 accent-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-bold text-sm">Schichten synchronisieren</p>
              <p className="text-xs text-slate-600">Schichten in den Kalender übernehmen</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={settings.syncEvents}
              onChange={() => handleToggle('syncEvents')}
              className="w-5 h-5 accent-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-bold text-sm">Termine synchronisieren</p>
              <p className="text-xs text-slate-600">Team-Events in den Kalender übernehmen</p>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer transition">
            <input
              type="checkbox"
              checked={settings.autoReminders}
              onChange={() => handleToggle('autoReminders')}
              className="w-5 h-5 accent-brand-orange rounded"
            />
            <div className="flex-1">
              <p className="font-bold text-sm">Automatische Erinnerungen</p>
              <p className="text-xs text-slate-600">Erinnerungen für Schichten und Termine</p>
            </div>
          </label>

          {settings.autoReminders && (
            <div className="ml-8 p-3 bg-slate-50 rounded-lg">
              <label className="block text-sm font-bold mb-2">Erinnerung vor (Minuten)</label>
              <input
                type="number"
                value={settings.reminderMinutes}
                onChange={(e) => handleChange('reminderMinutes', parseInt(e.target.value))}
                min="5"
                max="120"
                step="5"
                className="w-full px-3 py-2 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-brand-orange"
              />
            </div>
          )}
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
        <p className="font-bold mb-1">ℹ️ Datenschutz</p>
        <p>Deine Schichten und Events werden verschlüsselt mit deinem Google/Outlook-Kalender synchronisiert. Wir speichern deine Zugangsdaten nicht.</p>
      </div>
    </div>
  );
}
