import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import styles from './AnimalSelector.module.css';

interface AnimalSelectorProps {
  onSelect: (animal: CompanionAnimal) => void;
}

const ANIMALS: { animal: CompanionAnimal; emoji: string }[] = [
  { animal: 'rabbit', emoji: '🐰' },
  { animal: 'bear', emoji: '🐻' },
  { animal: 'fox', emoji: '🦊' },
  { animal: 'dog', emoji: '🐶' },
  { animal: 'cat', emoji: '🐱' },
  { animal: 'panda', emoji: '🐼' },
  { animal: 'koala', emoji: '🐨' },
  { animal: 'lion', emoji: '🦁' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
};

export function AnimalSelector({ onSelect }: AnimalSelectorProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Wähle deinen Begleiter!</h1>
      
      <motion.div
        className={styles.grid}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {ANIMALS.map(({ animal, emoji }) => (
          <motion.button
            key={animal}
            className={styles.animalCard}
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(animal)}
          >
            {emoji}
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
