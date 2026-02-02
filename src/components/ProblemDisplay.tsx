import { motion } from 'framer-motion';
import type { Problem, CompanionAnimal } from '@/types';
import { Button } from './Button';
import styles from './ProblemDisplay.module.css';
import { animalAssets } from '@/assets';

interface ProblemDisplayProps {
  problem: Problem;
  animal: CompanionAnimal;
  onAnswer: (answer: number) => void;
}

export function ProblemDisplay({ problem, animal, onAnswer }: ProblemDisplayProps) {
  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <motion.div
        className={styles.companion}
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        <img src={animalAssets[animal]} alt={animal} className={styles.companionImage} />
      </motion.div>
      
      <div className={styles.question}>{problem.question}</div>
      
      {problem.displayItems && (
        <div className={styles.countingItems}>
          {problem.displayItems.map((item, index) => (
            <motion.span
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              {item}
            </motion.span>
          ))}
        </div>
      )}
      
      <div className={styles.options}>
        {problem.options.map((option) => (
          <Button key={option} onClick={() => onAnswer(option)}>
            {option}
          </Button>
        ))}
      </div>
    </motion.div>
  );
}
