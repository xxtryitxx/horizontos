import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen } from 'lucide-react';
import { createKnowledgeArticle, searchKnowledgeBase } from '../../services/featuresService';
import { KnowledgeArticle } from '../../types';

interface KnowledgeBaseUIProps {
  userId: string;
  articles: KnowledgeArticle[];
}

export function KnowledgeBaseUI({ userId, articles }: KnowledgeBaseUIProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('allgemein');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const results = articles.filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredArticles(results);
  }, [searchQuery, articles]);

  const handleCreateArticle = async () => {
    if (!title || !content) return;

    setLoading(true);
    try {
        // Stub implementation - adjust based on actual service signature
        // createKnowledgeArticle(title, content, category, tags, createdBy)
        const tags: string[] = [];
        await createKnowledgeArticle(title, content, category, tags, userId);
      console.log('Creating knowledge article:', { userId, title, category, content });
      setTitle('');
      setContent('');
      setCategory('allgemein');
      setShowCreate(false);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['allgemein', 'prozesse', 'sicherheit', 'training', 'häufige-fragen'];

  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Search and List */}
      <div className="col-span-2 space-y-4">
        {/* Search Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex gap-2">
          <Search className="w-5 h-5 text-brand-orange" />
          <input
            type="text"
            placeholder="Artikel durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none text-sm"
          />
        </div>

        {/* Article List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-700">📚 Wissensartikel ({filteredArticles.length})</h3>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-1 px-3 py-1 bg-brand-orange text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition"
            >
              <Plus className="w-4 h-4" />
              Neu
            </button>
          </div>

          {filteredArticles.length === 0 ? (
            <div className="p-4 text-center text-slate-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Keine Artikel gefunden</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => setSelectedArticle(article)}
                  className={`w-full p-3 rounded-lg border text-left transition ${
                    selectedArticle?.id === article.id
                      ? 'bg-brand-orange text-white border-brand-orange'
                      : 'bg-white border-slate-100 hover:border-brand-orange'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{article.title}</p>
                      <p className={`text-xs truncate ${
                        selectedArticle?.id === article.id ? 'opacity-75' : 'text-slate-500'
                      }`}>
                        {article.content.substring(0, 60)}...
                      </p>
                    </div>
                    <span className={`ml-2 px-2 py-1 text-xs font-bold rounded whitespace-nowrap ${
                      selectedArticle?.id === article.id
                        ? 'bg-white text-brand-orange'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {article.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Details / Create */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 h-fit sticky top-4">
        {showCreate ? (
          <>
            <h3 className="font-black text-brand-burgundy mb-4">➕ Neuer Artikel</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold mb-1">Titel</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titel"
                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Kategorie</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Inhalt</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Artikel-Inhalt..."
                  className="w-full px-2 py-1 border border-slate-200 rounded text-sm h-32 resize-none focus:outline-none focus:ring-2 focus:ring-brand-orange"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateArticle}
                  disabled={!title || !content || loading}
                  className="flex-1 bg-brand-orange text-white font-bold py-1 text-sm rounded hover:bg-orange-600 disabled:opacity-50 transition"
                >
                  {loading ? 'Speichern...' : 'Speichern'}
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 border border-slate-200 font-bold py-1 text-sm rounded hover:bg-slate-50 transition"
                >
                  Abbrechen
                </button>
              </div>
            </div>
          </>
        ) : selectedArticle ? (
          <>
            <h3 className="font-black text-brand-burgundy mb-2">{selectedArticle.title}</h3>
            <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded mb-4">
              {selectedArticle.category}
            </span>
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedArticle.content}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-xs text-slate-500">
                Erstellt: {new Date(selectedArticle.createdAt).toLocaleDateString('de-DE')}
              </p>
              <p className="text-xs text-slate-500">von {selectedArticle.authorName}</p>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Artikel auswählen zum Lesen</p>
          </div>
        )}
      </div>
    </div>
  );
}
