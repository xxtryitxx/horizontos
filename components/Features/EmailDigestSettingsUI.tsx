import React, { useState } from 'react';
import { Mail, Check } from 'lucide-react';

interface EmailDigestSettingsUIProps {
  email: string;
  onUpdateSettings: (settings: any) => void;
}

export function EmailDigestSettingsUI({ email, onUpdateSettings }: EmailDigestSettingsUIProps) {
  const [settings, setSettings] = useState({
    frequency: 'weekly',
    includeFeedback: true,
    includeTeamUpdates: true,
    includeAchievements: true,
    includeStats: true,
  });
  const [saved, setSaved] = useState(false);

  const handleChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    onUpdateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const frequencyOptions = [
    { value: 'daily', label: 'Täglich 🌅', desc: 'Jeden Morgen um 06:00 Uhr' },
    { value: 'weekly', label: 'Wöchentlich 📅', desc: 'Jeden Montag um 09:00 Uhr' },
    { value: 'biweekly', label: 'Alle zwei Wochen', desc: '1. und 15. des Monats' },
    { value: 'monthly', label: 'Monatlich 📊', desc: 'Am 1. des Monats' },
  ];

  return (
    <div className="space-y-6">
      {saved && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-bold flex items-center gap-2">
          <Check className="w-4 h-4" />
          Einstellungen gespeichert
        </div>
      )}

      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-2">📧 Email-Zusammenfassung</h3>
        <p className="text-sm text-slate-600 mb-4">Wird gesendet an: <span className="font-bold">{email}</span></p>

        <div className="space-y-3 mb-6">
          <label className="block">
            <p className="text-sm font-bold mb-2">Häufigkeit</p>
            <div className="space-y-2">
              {frequencyOptions.map((option) => (
                <label key={option.value} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-brand-orange cursor-pointer transition">
                  <input
                    type="radio"
                    name="frequency"
                    value={option.value}
                    checked={settings.frequency === option.value}
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    className="mt-1 w-4 h-4 accent-brand-orange"
                  />
                  <div>
                    <p className="font-bold text-sm">{option.label}</p>
                    <p className="text-xs text-slate-600">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </label>
        </div>

        <div className="space-y-3 pt-4 border-t border-slate-200">
          <p className="font-bold text-sm">Inhalt der Zusammenfassung</p>
          {[
            { key: 'includeStats', label: 'Deine Statistiken & Score', emoji: '📊' },
            { key: 'includeTeamUpdates', label: 'Team-Updates', emoji: '👥' },
            { key: 'includeAchievements', label: 'Neue Abzeichen', emoji: '🏆' },
            { key: 'includeFeedback', label: 'Feedback-Zusammenfassung', emoji: '💬' },
          ].map((option) => (
            <label key={option.key} className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer transition">
              <input
                type="checkbox"
                checked={settings[option.key as keyof typeof settings]}
                onChange={(e) => handleChange(option.key, e.target.checked)}
                className="w-4 h-4 accent-brand-orange rounded"
              />
              <span className="text-sm">{option.emoji} {option.label}</span>
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

      {/* Preview */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
        <p className="font-bold text-sm mb-2">👀 Vorschau</p>
        <div className="bg-white p-3 rounded text-xs space-y-1">
          <p className="font-bold">🟠 HorizontOS {settings.frequency === 'daily' ? 'Tägliche' : 'Wöchentliche'} Zusammenfassung</p>
          <p className="text-slate-600">Hallo Mitarbeiter! 👋</p>
          <p className="text-slate-600">Hier ist deine {settings.frequency === 'daily' ? 'tägliche' : 'wöchentliche'} Zusammenfassung:</p>
          {settings.includeStats && <p className="text-slate-600">📊 Dein Score: 450 Punkte</p>}
          {settings.includeTeamUpdates && <p className="text-slate-600">👥 3 neue Team-Nachrichten</p>}
          {settings.includeAchievements && <p className="text-slate-600">🏆 Du hast "Superstar" Abzeichen freigeschaltet!</p>}
          {settings.includeFeedback && <p className="text-slate-600">💬 Durchschnittliches Feedback: 4.5⭐</p>}
        </div>
      </div>
    </div>
  );
}
