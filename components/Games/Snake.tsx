
import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 15;
const INITIAL_SNAKE = [{ x: 7, y: 7 }, { x: 7, y: 8 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };

interface SnakeProps {
  onScoreUpdate: (score: number) => void;
}

const Snake: React.FC<SnakeProps> = ({ onScoreUpdate }) => {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  // Changed NodeJS.Timeout to any to avoid namespace errors in browser environment
  const gameLoopRef = useRef<any>(null);

  const generateFood = useCallback(() => {
    let newFood;
    while (!newFood || snake.some(segment => segment.x === newFood!.x && segment.y === newFood!.y)) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
    }
    setFood(newFood);
  }, [snake]);

  const moveSnake = useCallback(() => {
    if (gameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y
      };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        setGameOver(true);
        return prevSnake;
      }

      // Self collision
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Food collision
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => {
            const next = s + 10;
            onScoreUpdate(next);
            return next;
        });
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, generateFood, onScoreUpdate]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction.y === 0) setDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': if (direction.y === 0) setDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': if (direction.x === 0) setDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': if (direction.x === 0) setDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [direction]);

  useEffect(() => {
    gameLoopRef.current = setInterval(moveSnake, 150);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [moveSnake]);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    generateFood();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 text-xl font-bold text-orange-600">Punkte: {score}</div>
      <div 
        className="grid bg-slate-200 border-4 border-slate-300 rounded-lg overflow-hidden" 
        style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 20px)`, gridTemplateRows: `repeat(${GRID_SIZE}, 20px)` }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const x = i % GRID_SIZE;
          const y = Math.floor(i / GRID_SIZE);
          const isSnake = snake.some(s => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <div 
              key={i} 
              className={`w-5 h-5 border-[0.5px] border-slate-100 ${
                isSnake ? 'bg-orange-500 rounded-sm' : isFood ? 'bg-red-500 rounded-full scale-75' : 'bg-white'
              }`}
            />
          );
        })}
      </div>
      {gameOver && (
        <div className="mt-4 text-center">
          <p className="text-red-500 font-bold mb-2">Game Over!</p>
          <button onClick={resetGame} className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Nochmal spielen</button>
        </div>
      )}
      <div className="mt-6 flex gap-2 md:hidden">
         <button onClick={() => setDirection({ x: 0, y: -1 })} className="p-3 bg-slate-200 rounded">⬆️</button>
         <button onClick={() => setDirection({ x: 0, y: 1 })} className="p-3 bg-slate-200 rounded">⬇️</button>
         <button onClick={() => setDirection({ x: -1, y: 0 })} className="p-3 bg-slate-200 rounded">⬅️</button>
         <button onClick={() => setDirection({ x: 1, y: 0 })} className="p-3 bg-slate-200 rounded">➡️</button>
      </div>
    </div>
  );
};

export default Snake;
