import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import { Button } from './Button';
import styles from './SessionComplete.module.css';

interface SessionCompleteProps {
  correctCount: number;
  treat: string;
  animal: CompanionAnimal;
  onPlayAgain: () => void;
}

const ANIMAL_EMOJI: Record<CompanionAnimal, string> = {
  rabbit: '🐰',
  bear: '🐻',
  fox: '🦊',
  dog: '🐶',
  cat: '🐱',
  panda: '🐼',
  koala: '🐨',
  lion: '🦁',
};

export function SessionComplete({
  correctCount,
  treat,
  animal,
  onPlayAgain,
}: SessionCompleteProps) {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <motion.div
        className={styles.celebration}
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <div className={styles.animalLarge}>{ANIMAL_EMOJI[animal]}</div>
        <div className={styles.treatLarge}>{treat}</div>
      </motion.div>
      
      <motion.h1
        className={styles.heading}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        You made it!
      </motion.h1>
      
      <motion.div
        className={styles.stats}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        You got <strong>{correctCount} out of 10</strong> right!
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <Button onClick={onPlayAgain}>Play Again</Button>
      </motion.div>
    </motion.div>
  );
}
