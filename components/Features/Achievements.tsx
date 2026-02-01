import React from 'react';
import { getBadgeIcon, getBadgeDescription } from '../../utils/achievements';

interface AchievementsProps {
  badges: string[];
  userScore: number;
}

export function AchievementsDisplay({ badges, userScore }: AchievementsProps) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <h3 className="font-black text-brand-burgundy mb-4">🏆 Abzeichen & Erfolge</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {badges.length > 0 ? (
          badges.map((badge) => (
            <div
              key={badge}
              className="bg-gradient-to-br from-yellow-50 to-orange-50 p-4 rounded-xl border border-yellow-200 text-center hover:scale-105 transition-transform"
            >
              <div className="text-3xl mb-2">{getBadgeIcon(badge)}</div>
              <p className="font-bold text-xs text-gray-800">{badge}</p>
              <p className="text-[10px] text-gray-600 mt-1">
                {getBadgeDescription(badge)}
              </p>
            </div>
          ))
        ) : (
          <p className="col-span-full text-center text-gray-500 text-sm">
            Keine Abzeichen freigeschaltet. Sammeln Sie {100 - userScore} Punkte um "Superstar" zu erreichen!
          </p>
        )}
      </div>

      <div className="mt-4 p-3 bg-slate-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <strong>Aktuelle Punkte:</strong> {userScore} / 500
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
          <div
            className="bg-brand-orange h-2 rounded-full transition-all"
            style={{ width: `${Math.min((userScore / 500) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
