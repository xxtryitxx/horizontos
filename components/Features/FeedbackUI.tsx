import React, { useState, useEffect } from 'react';
import { Star, MessageSquare } from 'lucide-react';
import { submitFeedback } from '../../services/featuresService';
import { Feedback } from '../../types';

interface FeedbackUIProps {
  userId: string;
  feedbackList: Feedback[];
}

export function FeedbackUI({ userId, feedbackList }: FeedbackUIProps) {
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('app');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [myFeedback, setMyFeedback] = useState<Feedback[]>([]);

  useEffect(() => {
    const my = feedbackList.filter(f => f.userId === userId);
    setMyFeedback(my.sort((a, b) => b.timestamp - a.timestamp));
  }, [feedbackList, userId]);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setLoading(true);
    try {
      await submitFeedback(userId, rating, category, message);
      setMessage('');
      setRating(5);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'text-green-500';
    if (rating >= 3) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Feedback Form */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">⭐ Dein Feedback</h3>

        {submitted && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm font-bold">
            ✓ Danke für dein Feedback!
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Bewertung</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="transition transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Kategorie</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange"
            >
              <option value="app">App allgemein</option>
              <option value="features">Features</option>
              <option value="bugs">Bugs/Fehler</option>
              <option value="performance">Performance</option>
              <option value="design">Design/UI</option>
              <option value="other">Sonstiges</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">Nachricht</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Dein Feedback hier eingeben..."
              className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-orange h-24 resize-none"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!message.trim() || loading}
            className="w-full bg-brand-orange text-white font-bold py-2 rounded-lg hover:bg-orange-600 disabled:opacity-50 transition"
          >
            {loading ? 'Wird versendet...' : 'Feedback senden'}
          </button>
        </div>
      </div>

      {/* Feedback History */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
        <h3 className="font-black text-brand-burgundy mb-4">📝 Mein Feedback ({myFeedback.length})</h3>
        {myFeedback.length === 0 ? (
          <p className="text-sm text-slate-500">Du hast noch kein Feedback eingereicht</p>
        ) : (
          <div className="space-y-3">
            {myFeedback.map((fb) => (
              <div key={fb.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < fb.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-200 rounded">
                      {fb.category}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(fb.timestamp).toLocaleDateString('de-DE')}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{fb.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Feedback Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          title="Ø Bewertung"
          value={
            feedbackList.length > 0
              ? ((feedbackList.reduce((sum, f) => sum + f.rating, 0) / feedbackList.length).toFixed(1)).toString()
              : 'N/A'
          }
        />
        <StatCard title="Gesamt Feedback" value={feedbackList.length.toString()} />
        <StatCard
          title="Top Kategorie"
          value={
            feedbackList.length > 0
              ? (feedbackList
                  .reduce((a, b) =>
                    feedbackList.filter(f => f.category === a.category).length >
                    feedbackList.filter(f => f.category === b.category).length
                      ? a
                      : b
                  )
                  .category as string)
              : 'N/A'
          }
        />
      </div>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 text-center">
      <p className="text-xs font-bold text-slate-400 uppercase mb-1">{title}</p>
      <p className="text-2xl font-black text-brand-burgundy">{value}</p>
    </div>
  );
}
