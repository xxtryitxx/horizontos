import React, { useState, useRef } from 'react';
import { Upload, X, Download, FileText } from 'lucide-react';
import { uploadFileShare } from '../../services/featuresService';
import { FileShare } from '../../types';

interface FileShareUIProps {
  userId: string;
  channelId: string;
  sharedFiles: FileShare[];
}

export function FileShareUI({ userId, channelId, sharedFiles }: FileShareUIProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Create a temporary object URL for the file and store metadata in Firestore
      const url = URL.createObjectURL(file);
      await uploadFileShare(file.name, file.size, file.type, url, userId, channelId);
      console.log('Uploaded file metadata saved');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload fehlgeschlagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('video')) return '🎬';
    if (mimeType.includes('audio')) return '🎵';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-brand-orange rounded-2xl p-6 hover:bg-slate-50 cursor-pointer transition">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          disabled={uploading}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex flex-col items-center gap-2 text-center"
        >
          <Upload className="w-8 h-8 text-brand-orange" />
          <p className="font-bold text-slate-700">
            {uploading ? 'Wird hochgeladen...' : 'Datei hier hochladen'}
          </p>
          <p className="text-xs text-slate-500">Max. 10MB</p>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* File List */}
      <div className="space-y-2">
        <h3 className="font-black text-slate-700">📎 Gemeinsam geteilte Dateien</h3>
        {sharedFiles.length === 0 ? (
          <p className="text-sm text-slate-500">Noch keine Dateien hochgeladen</p>
        ) : (
          <div className="space-y-2">
            {sharedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">{getFileIcon(file.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{file.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatFileSize(file.size)} • von {file.uploadedBy}
                    </p>
                  </div>
                </div>
                <a
                  href={file.url}
                  download={file.name}
                  className="p-2 hover:bg-white rounded-lg transition"
                >
                  <Download className="w-4 h-4 text-brand-orange" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
