import React, { useEffect, useState, useRef } from 'react';
import { Bell, X, Check } from 'lucide-react';
import { onNotificationsUpdated, markNotificationRead } from '../../services/featuresService';
import { Notification as NotifType, User } from '../../types';

interface Props {
  user: User;
}

export function NotificationsBell({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotifType[]>([]);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsub = onNotificationsUpdated(user.id, (items) => setNotifs(items));
    return () => unsub();
  }, [user]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener('click', onDocClick);
    return () => window.removeEventListener('click', onDocClick);
  }, []);

  const unread = notifs.filter(n => !n.read).length;

  const handleOpen = () => setOpen(s => !s);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
    } catch (err) {
      console.error('Could not mark read', err);
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleOpen} className="relative p-2 rounded-full hover:bg-slate-100">
        <Bell />
        {unread > 0 && <span className="absolute -top-0 -right-0 bg-red-500 text-white rounded-full text-[10px] px-1">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-slate-100 font-bold">Benachrichtigungen</div>
          <div className="max-h-60 overflow-y-auto">
            {notifs.length === 0 && <div className="p-4 text-sm text-slate-500">Keine Benachrichtigungen</div>}
            {notifs.map(n => (
              <div key={n.id} className={`p-3 flex items-start gap-3 border-b border-slate-100 ${n.read ? 'bg-white' : 'bg-amber-50'}`}>
                <div className="flex-1">
                  <div className="text-sm font-bold">{n.title}</div>
                  <div className="text-xs text-slate-600">{n.message}</div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {!n.read && (
                    <button onClick={() => handleMarkRead(n.id)} className="text-green-600 text-xs">Markieren</button>
                  )}
                  <div className="text-[10px] text-slate-400">{n.createdAt?.toDate ? n.createdAt.toDate().toLocaleString() : ''}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-2 text-center text-xs text-slate-500">Alle Benachrichtigungen synchronisiert</div>
        </div>
      )}
    </div>
  );
}
