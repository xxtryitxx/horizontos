
import React, { useState, useEffect } from 'react';

const SYMBOLS = ['🍎', '🍌', '🍇', '🍓', '🍒', '🥝', '🥑', '🥥'];

interface MemoryProps {
  onScoreUpdate: (score: number) => void;
}

const Memory: React.FC<MemoryProps> = ({ onScoreUpdate }) => {
  const [cards, setCards] = useState<{ id: number, symbol: string, flipped: boolean, matched: boolean }[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);

  const initGame = () => {
    const deck = [...SYMBOLS, ...SYMBOLS]
      .sort(() => Math.random() - 0.5)
      .map((symbol, index) => ({ id: index, symbol, flipped: false, matched: false }));
    setCards(deck);
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleFlip = (id: number) => {
    if (flippedCards.length === 2 || cards[id].flipped || cards[id].matched) return;

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        setCards(prev => prev.map(c => (c.id === first || c.id === second) ? { ...c, matched: true } : c));
        setFlippedCards([]);
        setScore(s => {
            const next = s + 50;
            onScoreUpdate(next);
            return next;
        });
      } else {
        setTimeout(() => {
          setCards(prev => prev.map(c => (c.id === first || c.id === second) ? { ...c, flipped: false } : c));
          setFlippedCards([]);
        }, 800);
      }
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-8 mb-6 text-lg font-bold">
        <span className="text-orange-600">Punkte: {score}</span>
        <span className="text-slate-500">Züge: {moves}</span>
      </div>
      <div className="grid grid-cols-4 gap-3 max-w-xs">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => handleFlip(card.id)}
            className={`w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-all transform duration-300 ${
              card.flipped || card.matched ? 'bg-white border-2 border-orange-500 rotate-0' : 'bg-orange-500 rotate-180'
            }`}
          >
            {(card.flipped || card.matched) ? card.symbol : ''}
          </button>
        ))}
      </div>
      <button onClick={initGame} className="mt-8 px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Neu starten</button>
    </div>
  );
};

export default Memory;
