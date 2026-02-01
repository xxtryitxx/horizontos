import React, { useState, useEffect } from 'react';
import { CheckCircle, User } from 'lucide-react';
import { createShiftTradeRequest, volunteersForShiftTrade } from '../../services/featuresService';
import { ShiftTrade, User as UserType } from '../../types';

interface ShiftTradingUIProps {
  userId: string;
  userName: string;
  allUsers: UserType[];
  availableTrades: ShiftTrade[];
}

export function ShiftTradingUI({ userId, userName, allUsers, availableTrades }: ShiftTradingUIProps) {
  const [myTrades, setMyTrades] = useState<ShiftTrade[]>([]);
  const [offeringShift, setOfferingShift] = useState('');
  const [wantingShift, setWantingShift] = useState('');
  const [loading, setLoading] = useState(false);
  const [volunteers, setVolunteers] = useState<Map<string, string[]>>(new Map());

  useEffect(() => {
    const myTrades = availableTrades.filter(t => t.requesterId === userId);
    setMyTrades(myTrades);

    // Stub implementation - connect to actual service
    myTrades.forEach(async (trade) => {
      try {
        const vols = await volunteersForShiftTrade(trade.id, userId);
        // setVolunteers(prev => new Map([...prev, [trade.id, vols]]));
      } catch (error) {
        console.error('Fehler beim Abrufen von Freiwilligen:', error);
      }
    });
  }, [availableTrades, userId]);

  const handleCreateTrade = async () => {
    if (!offeringShift || !wantingShift) return;

    setLoading(true);
    try {
      // Stub implementation - adjust based on actual service signature
      // createShiftTradeRequest(requesterId, requesterName, shiftDate, description)
      await createShiftTradeRequest(userId, 'Anonymous', offeringShift, wantingShift);
      console.log('Creating trade:', { userId, offeringShift, wantingShift });
      setOfferingShift('');
      setWantingShift('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create Trade Request */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">🔁 Schicht handeln</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold mb-2">Ich biete diese Schicht an</label>
            <input
              type="text"
              value={offeringShift}
              onChange={(e) => setOfferingShift(e.target.value)}
              placeholder="z.B. Freitag 16:00-23:00"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Ich suche diese Schicht</label>
            <input
              type="text"
              value={wantingShift}
              onChange={(e) => setWantingShift(e.target.value)}
              placeholder="z.B. Samstag 08:00-16:00"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          <button
            onClick={handleCreateTrade}
            disabled={!offeringShift || !wantingShift || loading}
            className="w-full bg-brand-orange text-white font-bold py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {loading ? 'Wird erstellt...' : 'Handel posten'}
          </button>
        </div>
      </div>

      {/* Available Trades */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">📋 Verfügbare Tausche ({availableTrades.length})</h3>
        {availableTrades.length === 0 ? (
          <p className="text-sm text-slate-500">Keine Tausche verfügbar</p>
        ) : (
          <div className="space-y-3">
            {availableTrades.map((trade) => {
              const tradeVolunteers = volunteers.get(trade.id) || [];
              return (
                <div key={trade.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-brand-orange transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold">📤 {trade.offeringShift}</p>
                      <p className="text-sm text-slate-600">wird gesucht für: 📥 {trade.seekingShift}</p>
                      <p className="text-xs text-slate-500 mt-1">von {trade.requesterName}</p>
                    </div>
                    <span className="px-2 py-1 bg-brand-orange text-white text-xs font-bold rounded">
                      {tradeVolunteers.length} Freiwillige
                    </span>
                  </div>

                  {trade.requesterId !== userId && (
                    <button
                      onClick={() => {
                        // Volunteer for trade logic would go here
                      }}
                      className="w-full px-3 py-2 border border-brand-orange text-brand-orange font-bold rounded hover:bg-slate-100 transition text-sm"
                    >
                      ✓ Ich bin dabei
                    </button>
                  )}

                  {tradeVolunteers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs font-bold text-slate-600 mb-2">👥 Freiwillige:</p>
                      <div className="flex gap-1 flex-wrap">
                        {tradeVolunteers.map((vol, idx) => (
                          <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">
                            {vol}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
