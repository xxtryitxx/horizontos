import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share, Lock } from 'lucide-react';

interface OnlineStatusProps {
  isOnline: boolean;
  lastSeen?: any;
}

export function OnlineStatus({ isOnline, lastSeen }: OnlineStatusProps) {
  const getLastSeenText = () => {
    if (!lastSeen) return 'Offline';
    if (isOnline) return 'Online';
    
    const now = new Date();
    const seen = lastSeen.toDate?.() || new Date(lastSeen);
    const diff = now.getTime() - seen.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Gerade eben';
    if (minutes < 60) return `vor ${minutes}m`;
    if (minutes < 1440) return `vor ${Math.floor(minutes / 60)}h`;
    return `vor ${Math.floor(minutes / 1440)}d`;
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
      <span className="text-xs text-gray-600">{getLastSeenText()}</span>
    </div>
  );
}
