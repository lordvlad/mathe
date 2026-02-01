import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  animal: CompanionAnimal;
  treat: string;
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

export function ProgressBar({ current, total, animal, treat }: ProgressBarProps) {
  // Calculate percentage (0-100)
  const percentage = (current / total) * 100;
  
  // Calculate left position for animal (5% to 95% of container)
  const animalPosition = 5 + (percentage * 0.9);
  
  return (
    <div className={styles.container}>
      <div className={styles.journey}>
        <div className={styles.path} />
        
        <motion.div
          className={styles.animal}
          style={{ left: `${animalPosition}%` }}
          animate={{ left: `${animalPosition}%` }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        >
          {ANIMAL_EMOJI[animal]}
        </motion.div>
        
        <div className={styles.treat}>{treat}</div>
      </div>
      
      <div className={styles.progressText}>
        {current} of {total}
      </div>
    </div>
  );
}
