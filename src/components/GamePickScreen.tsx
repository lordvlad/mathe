import { motion } from 'framer-motion';
import type { CompanionAnimal, GameId } from '@/types';
import styles from './GamePickScreen.module.css';
import { animalAssets } from '@/assets';

interface GamePickScreenProps {
  animal: CompanionAnimal;
  onPick: (game: GameId) => void;
}

const GAMES: { id: GameId; emoji: string; title: string; description: string }[] = [
  {
    id: 'quiz',
    emoji: '🧮',
    title: 'Mathe-Quiz',
    description: 'Löse 10 lustige Rechenaufgaben und hilf deinem Freund zu seiner Leckerei!',
  },
  {
    id: 'shooter',
    emoji: '🎯',
    title: 'Zahlen-Schütze',
    description: 'Schieße Zahlenkugeln! Zwei gleiche Zahlen verschmelzen zu ihrer Summe.',
  },
];

export function GamePickScreen({ animal, onPick }: GamePickScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <div className={styles.container}>
        <motion.img
          src={animalAssets[animal]}
          alt={animal}
          className={styles.animalImage}
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <h1 className={styles.heading}>Wähle ein Spiel!</h1>
        <div className={styles.grid}>
          {GAMES.map((game) => (
            <motion.button
              key={game.id}
              className={styles.card}
              onClick={() => onPick(game.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              aria-label={`Spiele ${game.title}`}
              data-testid={`game-pick-${game.id}`}
            >
              <span className={styles.cardEmoji}>{game.emoji}</span>
              <span className={styles.cardTitle}>{game.title}</span>
              <span className={styles.cardDescription}>{game.description}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
