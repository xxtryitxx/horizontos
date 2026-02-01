
import React, { useState, useEffect, useRef } from 'react';

interface WhackProps {
  onScoreUpdate: (score: number) => void;
}

const WhackAMole: React.FC<WhackProps> = ({ onScoreUpdate }) => {
  const [score, setScore] = useState(0);
  const [activeMole, setActiveMole] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  // Changed NodeJS.Timeout to any to avoid namespace errors in browser environment
  const timerRef = useRef<any>(null);
  const moleTimerRef = useRef<any>(null);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    spawnMole();
  };

  const spawnMole = () => {
    if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    const randomIdx = Math.floor(Math.random() * 9);
    setActiveMole(randomIdx);
    moleTimerRef.current = setTimeout(spawnMole, Math.max(400, 1000 - (score * 5)));
  };

  const whack = (idx: number) => {
    if (idx === activeMole) {
      setScore(s => {
          const next = s + 10;
          onScoreUpdate(next);
          return next;
      });
      setActiveMole(null);
    }
  };

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
      setActiveMole(null);
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (moleTimerRef.current) clearTimeout(moleTimerRef.current);
    };
  }, [isPlaying, timeLeft, score]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-8 mb-6 text-lg font-bold">
        <span className="text-orange-600">Punkte: {score}</span>
        <span className="text-slate-500">Zeit: {timeLeft}s</span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            onClick={() => whack(i)}
            disabled={!isPlaying}
            className="w-20 h-20 bg-amber-900/10 rounded-full border-4 border-amber-900/20 relative overflow-hidden flex items-center justify-center transition-colors hover:bg-amber-900/20"
          >
            <div 
              className={`text-4xl transition-transform duration-75 ${
                activeMole === i ? 'translate-y-0 scale-100' : 'translate-y-12 scale-50'
              }`}
            >
              🐹
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-amber-900/40 to-transparent pointer-events-none" />
          </button>
        ))}
      </div>
      {!isPlaying && (
        <button 
          onClick={startGame} 
          className="mt-8 px-8 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/20"
        >
          {timeLeft === 0 ? 'Nochmal spielen' : 'Spiel starten'}
        </button>
      )}
    </div>
  );
};

export default WhackAMole;
