import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import styles from './ProgressBar.module.css';
import { animalAssets, treatAssets } from '@/assets';

interface ProgressBarProps {
  current: number;
  total: number;
  animal: CompanionAnimal;
  treat: string;
}

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
          <img src={animalAssets[animal]} alt={animal} className={styles.animalImage} />
        </motion.div>
        
        <div className={styles.treat}>
          {treatAssets[treat as keyof typeof treatAssets] ? (
            <img src={treatAssets[treat as keyof typeof treatAssets]} alt={treat} className={styles.treatImage} />
          ) : (
            <span>{treat}</span>
          )}
        </div>
      </div>
      
      <div className={styles.progressText}>
        {current} von {total}
      </div>
    </div>
  );
}
