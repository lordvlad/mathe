import { useEffect, useState, type CSSProperties } from 'react';
import styles from './Confetti.module.css';

interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  color: string;
  rotation: number;
}

const COLORS = [
  '#FF6B6B', // red
  '#4ECDC4', // turquoise
  '#FFE66D', // yellow
  '#95E1D3', // mint
  '#F38181', // pink
  '#AA96DA', // purple
  '#FCBAD3', // light pink
  '#A8E6CF', // green
];

export function Confetti({ count = 50 }: { count?: number }) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    const newPieces: ConfettiPiece[] = [];
    for (let i = 0; i < count; i++) {
      newPieces.push({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 2,
        color: COLORS[Math.floor(Math.random() * COLORS.length)] || '#FF6B6B',
        rotation: Math.random() * 360,
      });
    }
    setPieces(newPieces);
  }, [count]);

  return (
    <div className={styles.confettiContainer}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={styles.confetti}
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
          } as CSSProperties}
        />
      ))}
    </div>
  );
}
