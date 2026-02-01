/**
 * Admin Panel - Benutzerverwaltung für Admins
 * Funktionen: Sperren, Löschen, Rollen ändern, Statistiken
 */

import React, { useState, useMemo } from 'react';
import { 
  Trash2, Lock, Unlock, Shield, Search, AlertTriangle,
  Activity, Users, CheckCircle, XCircle, Edit3, Eye, EyeOff
} from 'lucide-react';

interface AdminPanelProps {
  allUsers: any[];
  currentUser: any;
  onDeleteUser: (userId: string) => Promise<void>;
  onLockUser: (userId: string, locked: boolean) => Promise<void>;
  onChangeRole: (userId: string, role: 'admin' | 'mitarbeiter') => Promise<void>;
}

export function AdminPanel({
  allUsers,
  currentUser,
  onDeleteUser,
  onLockUser,
  onChangeRole,
}: AdminPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'mitarbeiter'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'locked'>('all');

  // Filtere und suche Benutzer
  const filteredUsers = useMemo(() => {
    return allUsers.filter(u => {
      // Ausschluss des aktuellen Benutzers
      if (u.id === currentUser.id) return false;

      // Suchfilter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        u.name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower);

      // Rollenfilter
      const matchesRole = 
        filterRole === 'all' ||
        (filterRole === 'admin' && u.isAdmin) ||
        (filterRole === 'mitarbeiter' && !u.isAdmin);

      // Status-Filter
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && !u.locked) ||
        (filterStatus === 'locked' && u.locked);

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [allUsers, searchQuery, filterRole, filterStatus, currentUser.id]);

  // Statistiken berechnen
  const stats = useMemo(() => {
    return {
      total: allUsers.length - 1, // Ohne aktuellen User
      admins: allUsers.filter(u => u.isAdmin && u.id !== currentUser.id).length,
      active: allUsers.filter(u => !u.locked && u.id !== currentUser.id).length,
      locked: allUsers.filter(u => u.locked && u.id !== currentUser.id).length,
    };
  }, [allUsers, currentUser.id]);

  const handleDeleteUser = async (userId: string) => {
    if (processing) return;
    setProcessing(userId);
    try {
      await onDeleteUser(userId);
      setShowDeleteConfirm(null);
      setSelectedUser(null);
    } catch (error: any) {
      alert('Fehler beim Löschen: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleLockUser = async (userId: string, shouldLock: boolean) => {
    if (processing) return;
    setProcessing(userId);
    try {
      await onLockUser(userId, shouldLock);
    } catch (error: any) {
      alert('Fehler: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'mitarbeiter') => {
    if (processing) return;
    setProcessing(userId);
    try {
      await onChangeRole(userId, newRole);
    } catch (error: any) {
      alert('Fehler: ' + error.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <header>
        <h2 className="text-3xl font-black text-brand-burgundy tracking-tighter">
          🔐 Admin-Panel
        </h2>
        <p className="text-slate-500 font-medium italic">
          Verwalte Benutzer, Rollen und Sperren.
        </p>
      </header>

      {/* Statistiken */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold">GESAMT</p>
              <p className="text-3xl font-black text-brand-burgundy">{stats.total}</p>
            </div>
            <Users size={32} className="text-slate-200" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold">ADMINS</p>
              <p className="text-3xl font-black text-brand-orange">{stats.admins}</p>
            </div>
            <Shield size={32} className="text-slate-200" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold">AKTIV</p>
              <p className="text-3xl font-black text-green-600">{stats.active}</p>
            </div>
            <CheckCircle size={32} className="text-slate-200" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-sm font-bold">GESPERRT</p>
              <p className="text-3xl font-black text-red-600">{stats.locked}</p>
            </div>
            <Lock size={32} className="text-slate-200" />
          </div>
        </div>
      </div>

      {/* Suchbereich und Filter */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
        {/* Suche */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Suche nach Name oder Email..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-orange/20"
          />
        </div>

        {/* Filter */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterRole('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filterRole === 'all'
                  ? 'bg-brand-orange text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle Rollen
            </button>
            <button
              onClick={() => setFilterRole('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filterRole === 'admin'
                  ? 'bg-brand-orange text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Admins
            </button>
            <button
              onClick={() => setFilterRole('mitarbeiter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filterRole === 'mitarbeiter'
                  ? 'bg-brand-orange text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Mitarbeiter
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filterStatus === 'all'
                  ? 'bg-brand-orange text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filterStatus === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Aktiv
            </button>
            <button
              onClick={() => setFilterStatus('locked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                filterStatus === 'locked'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Gesperrt
            </button>
          </div>
        </div>
      </div>

      {/* Benutzer-Tabelle */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
              <th className="px-6 py-4">Benutzer</th>
              <th className="px-6 py-4">Rolle</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <p className="text-slate-500 font-medium">Keine Benutzer gefunden</p>
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  {/* Benutzer */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-10 h-10 rounded-xl object-cover"
                      />
                      <div>
                        <p className="font-bold text-sm">{u.name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Rolle */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        u.isAdmin
                          ? 'bg-brand-burgundy text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {u.isAdmin ? '👑 Admin' : '👤 Mitarbeiter'}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        u.locked
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {u.locked ? '🔒 Gesperrt' : '✅ Aktiv'}
                    </span>
                  </td>

                  {/* Aktionen */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Rollen-Button */}
                      <button
                        onClick={() =>
                          handleChangeRole(u.id, u.isAdmin ? 'mitarbeiter' : 'admin')
                        }
                        disabled={processing === u.id}
                        title={u.isAdmin ? 'Admin entfernen' : 'Admin machen'}
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-600 hover:text-brand-orange disabled:opacity-50"
                      >
                        {u.isAdmin ? <Shield size={16} /> : <Edit3 size={16} />}
                      </button>

                      {/* Sperr-Button */}
                      <button
                        onClick={() => handleLockUser(u.id, !u.locked)}
                        disabled={processing === u.id}
                        title={u.locked ? 'Entsperren' : 'Sperren'}
                        className={`p-2 rounded-lg transition-all disabled:opacity-50 ${
                          u.locked
                            ? 'hover:bg-green-100 text-red-600 hover:text-green-600'
                            : 'hover:bg-slate-100 text-slate-600 hover:text-red-600'
                        }`}
                      >
                        {u.locked ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>

                      {/* Löschen-Button */}
                      <button
                        onClick={() => setShowDeleteConfirm(u.id)}
                        disabled={processing === u.id}
                        title="Benutzer löschen"
                        className="p-2 hover:bg-red-100 rounded-lg transition-all text-slate-600 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>

                      {/* Details-Button */}
                      <button
                        onClick={() => setSelectedUser(u)}
                        title="Details anzeigen"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-all text-slate-600"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Löschen-Bestätigung Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle size={24} className="text-red-600" />
              <h3 className="text-xl font-black text-brand-burgundy">Benutzer löschen?</h3>
            </div>

            <p className="text-slate-600 mb-2 font-medium">
              Bist du sicher, dass du diesen Benutzer löschen möchtest?
            </p>
            <p className="text-slate-400 text-sm mb-6">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                disabled={processing === showDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold hover:bg-slate-200 transition-all disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => handleDeleteUser(showDeleteConfirm)}
                disabled={processing === showDeleteConfirm}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50"
              >
                {processing === showDeleteConfirm ? 'Wird gelöscht...' : 'Ja, löschen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedUser.avatar}
                alt={selectedUser.name}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <h3 className="text-xl font-black text-brand-burgundy">{selectedUser.name}</h3>
                <p className="text-slate-500 text-sm">{selectedUser.email}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Rolle
                </p>
                <p className="font-bold text-slate-700">
                  {selectedUser.isAdmin ? '👑 Administrator' : '👤 Mitarbeiter'}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Status
                </p>
                <p
                  className={`font-bold ${
                    selectedUser.locked ? 'text-red-600' : 'text-green-600'
                  }`}
                >
                  {selectedUser.locked ? '🔒 Gesperrt' : '✅ Aktiv'}
                </p>
              </div>

              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Punkte
                </p>
                <p className="font-bold text-slate-700">{selectedUser.score} Punkte</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full px-4 py-2.5 bg-brand-orange text-white rounded-lg font-bold hover:bg-brand-orange/90 transition-all"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
