import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Download, Trash2 } from 'lucide-react';
import { uploadVoiceMessage } from '../../services/featuresService';
import { VoiceMessage } from '../../types';

interface VoiceMessageUIProps {
  userId: string;
  channelId: string;
  voiceMessages: VoiceMessage[];
}

export function VoiceMessageUI({ userId, channelId, voiceMessages }: VoiceMessageUIProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [uploading, setUploading] = useState(false);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      audioChunks.current = [];

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data);
      };

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
        await handleUpload(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerInterval.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch (error) {
      console.error('Mikrofon-Fehler:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }
  };

  const handleUpload = async (audioBlob: Blob) => {
    setUploading(true);
    try {
      const file = new File([audioBlob], `voice-${Date.now()}.wav`, { type: 'audio/wav' });
        const url = URL.createObjectURL(file);
        const duration = 0; // duration not tracked in this simple implementation
        await uploadVoiceMessage(userId, undefined, channelId, duration, url);
      console.log('Uploading voice message:', file.name);
    } catch (error) {
      console.error('Upload-Fehler:', error);
    } finally {
      setUploading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Recording Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 bg-brand-orange text-white font-bold py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
          >
            <Mic className="w-5 h-5" />
            Sprachnachricht aufnehmen
          </button>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <p className="text-2xl font-black text-brand-orange">{formatTime(recordingTime)}</p>
              <p className="text-sm text-slate-500">🔴 Aufnahme läuft...</p>
            </div>
            <button
              onClick={stopRecording}
              className="w-full flex items-center justify-center gap-2 bg-red-500 text-white font-bold py-3 rounded-lg hover:bg-red-600 transition"
            >
              <Square className="w-5 h-5" />
              Beenden
            </button>
          </div>
        )}
      </div>

      {/* Voice Messages */}
      <div className="space-y-2">
        <h3 className="font-black text-slate-700">🎙️ Sprachnachrichten</h3>
        {voiceMessages.length === 0 ? (
          <p className="text-sm text-slate-500">Noch keine Sprachnachrichten</p>
        ) : (
          <div className="space-y-2">
            {voiceMessages.map((msg) => (
              <div
                key={msg.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{msg.senderName}</p>
                    <span className="text-xs text-slate-500">{msg.duration}s</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    {new Date(msg.timestamp).toLocaleTimeString('de-DE')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <audio controls className="w-24">
                    <source src={msg.url} type="audio/wav" />
                  </audio>
                  <a
                    href={msg.url}
                    download={`voice-${msg.id}.wav`}
                    className="p-2 hover:bg-white rounded-lg transition"
                  >
                    <Download className="w-4 h-4 text-brand-orange" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
