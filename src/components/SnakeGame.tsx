
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RotateCcw, Play, Pause } from 'lucide-react';

interface Position {
  x: number;
  y: number;
}

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const BOARD_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_FOOD = { x: 5, y: 5 };
const GAME_SPEED = 150;

const SnakeGame = () => {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('snakeHighScore');
    return saved ? parseInt(saved) : 0;
  });

  const generateFood = useCallback((currentSnake: Position[]) => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * BOARD_SIZE),
        y: Math.floor(Math.random() * BOARD_SIZE),
      };
    } while (currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood(INITIAL_SNAKE));
    setDirection('RIGHT');
    setGameOver(false);
    setScore(0);
    setIsPlaying(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || !isPlaying) return;

    setSnake(currentSnake => {
      const newSnake = [...currentSnake];
      const head = { ...newSnake[0] };

      switch (direction) {
        case 'UP':
          head.y -= 1;
          break;
        case 'DOWN':
          head.y += 1;
          break;
        case 'LEFT':
          head.x -= 1;
          break;
        case 'RIGHT':
          head.x += 1;
          break;
      }

      // Check wall collision
      if (head.x < 0 || head.x >= BOARD_SIZE || head.y < 0 || head.y >= BOARD_SIZE) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      // Check self collision
      if (newSnake.some(segment => segment.x === head.x && segment.y === head.y)) {
        setGameOver(true);
        setIsPlaying(false);
        return currentSnake;
      }

      newSnake.unshift(head);

      // Check food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(prev => {
          const newScore = prev + 10;
          if (newScore > highScore) {
            setHighScore(newScore);
            localStorage.setItem('snakeHighScore', newScore.toString());
          }
          return newScore;
        });
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPlaying, generateFood, highScore]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  // Touch controls
  const [touchStart, setTouchStart] = useState<Position | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart || !isPlaying) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (Math.max(absDeltaX, absDeltaY) > 30) {
      if (absDeltaX > absDeltaY) {
        // Horizontal swipe
        if (deltaX > 0 && direction !== 'LEFT') {
          setDirection('RIGHT');
        } else if (deltaX < 0 && direction !== 'RIGHT') {
          setDirection('LEFT');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && direction !== 'UP') {
          setDirection('DOWN');
        } else if (deltaY < 0 && direction !== 'DOWN') {
          setDirection('UP');
        }
      }
    }
    setTouchStart(null);
  };

  const startGame = () => {
    if (gameOver) {
      resetGame();
    }
    setIsPlaying(true);
  };

  const pauseGame = () => {
    setIsPlaying(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <div className="mb-6 text-center">
        <h1 className="text-4xl font-bold text-green-400 mb-2">SNAKE</h1>
        <div className="flex justify-center gap-8 text-white">
          <div>Score: <span className="text-green-400 font-bold">{score}</span></div>
          <div>High: <span className="text-yellow-400 font-bold">{highScore}</span></div>
        </div>
      </div>

      <Card className="bg-gray-800 border-gray-700 p-4 mb-6">
        <div 
          className="grid gap-0 bg-black border-2 border-green-400 rounded-lg overflow-hidden touch-none"
          style={{ 
            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
            width: '320px',
            height: '320px'
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {Array.from({ length: BOARD_SIZE * BOARD_SIZE }).map((_, index) => {
            const x = index % BOARD_SIZE;
            const y = Math.floor(index / BOARD_SIZE);
            const isSnake = snake.some(segment => segment.x === x && segment.y === y);
            const isSnakeHead = snake[0]?.x === x && snake[0]?.y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={index}
                className={`
                  aspect-square border-gray-800 
                  ${isSnakeHead ? 'bg-green-300 border border-green-500' : ''}
                  ${isSnake && !isSnakeHead ? 'bg-green-500' : ''}
                  ${isFood ? 'bg-red-500 rounded-full' : ''}
                  ${!isSnake && !isFood ? 'bg-gray-900' : ''}
                `}
                style={{ 
                  borderWidth: '0.5px',
                  transition: 'all 0.1s ease-in-out'
                }}
              />
            );
          })}
        </div>
      </Card>

      <div className="flex gap-4 mb-6">
        {!isPlaying ? (
          <Button 
            onClick={startGame}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            {gameOver ? 'Play Again' : 'Start Game'}
          </Button>
        ) : (
          <Button 
            onClick={pauseGame}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 text-lg"
          >
            <Pause className="mr-2 h-5 w-5" />
            Pause
          </Button>
        )}
        
        <Button 
          onClick={resetGame}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-800 px-6 py-3 text-lg"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Reset
        </Button>
      </div>

      {gameOver && (
        <div className="text-center text-red-400 mb-4">
          <div className="text-2xl font-bold">Game Over!</div>
          <div className="text-sm">Final Score: {score}</div>
        </div>
      )}

      <div className="text-center text-gray-400 text-sm max-w-xs">
        <p className="mb-2">🎮 Swipe to control the snake</p>
        <p>🍎 Collect food to grow and score points</p>
      </div>
    </div>
  );
};

export default SnakeGame;
