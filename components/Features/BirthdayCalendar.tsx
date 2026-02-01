import React, { useState, useEffect } from 'react';
import { getUsersBirthdayToday } from '../../services/featuresService';
import { User } from '../../types';

export function BirthdayCalendar() {
  const [birthdayUsers, setBirthdayUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBirthdays = async () => {
      try {
        const users = await getUsersBirthdayToday();
        setBirthdayUsers(users);
      } catch (error) {
        console.error("Fehler beim Laden der Geburtstage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBirthdays();
    // Täglich aktualisieren
    const interval = setInterval(fetchBirthdays, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Lädt...</div>;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="font-black text-brand-burgundy mb-4">🎂 Geburtstage heute</h3>
      
      {birthdayUsers.length > 0 ? (
        <div className="space-y-3">
          {birthdayUsers.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <span className="font-bold text-sm">{user.name}</span>
              </div>
              <span className="text-lg">🎉</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 text-sm py-4">
          Heute hat niemand Geburtstag
        </p>
      )}
    </div>
  );
}
