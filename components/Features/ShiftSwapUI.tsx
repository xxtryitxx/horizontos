import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { createShiftSwapRequest, approveShiftSwap, onShiftSwapsUpdated } from '../../services/featuresService';
import { ShiftSwapRequest, User } from '../../types';

interface ShiftSwapUIProps {
  userId: string;
  userName: string;
  allUsers: User[];
}

export function ShiftSwapUI({ userId, userName, allUsers }: ShiftSwapUIProps) {
  const [swapRequests, setSwapRequests] = useState<ShiftSwapRequest[]>([]);
  const [requestingShift, setRequestingShift] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Connect real-time listener for requests targeting the current user
    const unsubscribe = onShiftSwapsUpdated(userId, setSwapRequests);
    return unsubscribe;
  }, []);

  const handleRequestSwap = async () => {
    if (!selectedUser || !requestingShift) return;

    setLoading(true);
    try {
      const target = allUsers.find(u => u.id === selectedUser);
      const targetName = target ? target.name : '';
      // Use full signature: requesterId, requesterName, targetUserId, targetUserName, originalShift, requestedShift
      await createShiftSwapRequest(userId, userName, selectedUser, targetName, requestingShift, requestingShift);
      console.log('Swap request sent');
      setRequestingShift('');
      setSelectedUser('');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveShiftSwap(requestId);
      console.log('Approved swap:', requestId);
    } catch (error) {
      console.error('Fehler beim Genehmigen:', error);
    }
  };

  const myRequests = swapRequests.filter(r => r.requesterId === userId);
  const requestsForMe = swapRequests.filter(r => r.recipientId === userId);

  return (
    <div className="space-y-6">
      {/* Create Request */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">🔄 Schicht tauschen</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-bold mb-2">Mit Mitarbeiter tauschen</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <option value="">-- Mitarbeiter wählen --</option>
              {allUsers.filter(u => u.id !== userId).map(user => (
                <option key={user.id} value={user.id}>{user.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Meine Schicht</label>
            <input
              type="text"
              value={requestingShift}
              onChange={(e) => setRequestingShift(e.target.value)}
              placeholder="z.B. Montag 08:00-16:00"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            />
          </div>
          <button
            onClick={handleRequestSwap}
            disabled={!selectedUser || !requestingShift || loading}
            className="w-full bg-brand-orange text-white font-bold py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {loading ? 'Wird versendet...' : 'Tausch anfragen'}
          </button>
        </div>
      </div>

      {/* My Requests */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">📤 Meine Anfragen ({myRequests.length})</h3>
        {myRequests.length === 0 ? (
          <p className="text-sm text-slate-500">Keine ausstehenden Anfragen</p>
        ) : (
          <div className="space-y-3">
            {myRequests.map(req => (
              <div key={req.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                        <p className="font-bold">Mit {req.recipientName || (allUsers.find(u => u.id === req.recipientId)?.name) || req.recipientId}</p>
                        <p className="text-sm text-slate-600">{req.shiftTime || req.requestedShift || req.originalShift}</p>
                  </div>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${
                    req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    req.status === 'approved' ? 'bg-green-100 text-green-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {req.status === 'pending' && <Clock className="w-3 h-3" />}
                    {req.status === 'approved' && <CheckCircle className="w-3 h-3" />}
                    {req.status === 'rejected' && <XCircle className="w-3 h-3" />}
                    {req.status === 'pending' ? 'Ausstehend' : req.status === 'approved' ? 'Genehmigt' : 'Abgelehnt'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Requests for Me */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">📥 Anfragen für mich ({requestsForMe.length})</h3>
        {requestsForMe.length === 0 ? (
          <p className="text-sm text-slate-500">Keine neuen Anfragen</p>
        ) : (
          <div className="space-y-3">
            {requestsForMe.map(req => (
              <div key={req.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{req.requesterName} möchte tauschen</p>
                    <p className="text-sm text-slate-600">{req.shiftTime}</p>
                  </div>
                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(req.id)}
                      className="px-3 py-1 bg-green-500 text-white font-bold text-xs rounded hover:bg-green-600 transition"
                    >
                      ✓ OK
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
