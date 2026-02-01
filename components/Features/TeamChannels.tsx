import React, { useState, useEffect } from 'react';
import { Send, Plus, Users } from 'lucide-react';
import { onTeamChannelsUpdated, onChannelMessagesUpdated, sendChannelMessage } from '../../services/featuresService';
import { TeamChannel, ChannelMessage } from '../../types';

interface TeamChannelsProps {
  userId: string;
  userName: string;
}

export function TeamChannels({ userId, userName }: TeamChannelsProps) {
  const [channels, setChannels] = useState<TeamChannel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<TeamChannel | null>(null);
  const [messages, setMessages] = useState<ChannelMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  useEffect(() => {
    const unsubscribe = onTeamChannelsUpdated(userId, setChannels);
    return () => unsubscribe();
  }, [userId]);

  useEffect(() => {
    if (!selectedChannel) return;
    
    const unsubscribe = onChannelMessagesUpdated(selectedChannel.id, setMessages);
    return () => unsubscribe();
  }, [selectedChannel]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChannel) return;
    
    try {
      await sendChannelMessage(selectedChannel.id, userId, messageText);
      setMessageText('');
    } catch (error) {
      console.error("Fehler beim Senden:", error);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex h-[600px]">
        {/* Channel List */}
        <div className="w-64 border-r border-slate-100 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm">💬 Kanäle</h3>
            <button
              onClick={() => setShowNewChannel(!showNewChannel)}
              className="p-1 hover:bg-slate-100 rounded transition"
            >
              <Plus size={16} />
            </button>
          </div>

          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => setSelectedChannel(channel)}
              className={`w-full text-left px-3 py-2 rounded-lg mb-2 transition ${
                selectedChannel?.id === channel.id
                  ? 'bg-brand-orange text-white'
                  : 'hover:bg-slate-100'
              }`}
            >
              <p className="font-bold text-sm">#{channel.name}</p>
              <p className="text-[10px] opacity-70">{channel.members.length} Mitglieder</p>
            </button>
          ))}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-500">Noch keine Nachrichten</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.senderId === userId ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.senderId === userId
                            ? 'bg-brand-orange text-white'
                            : 'bg-slate-100 text-gray-900'
                        }`}
                      >
                        <p className="font-bold text-xs mb-1">
                          {msg.senderId === userId ? 'Sie' : msg.senderId}
                        </p>
                        <p className="text-sm">{msg.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nachricht schreiben..."
                  className="flex-1 bg-slate-100 border-none rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-brand-orange/20"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-brand-orange text-white p-2 rounded-lg hover:scale-105 transition"
                >
                  <Send size={20} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-gray-500">Wählen Sie einen Kanal aus</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
