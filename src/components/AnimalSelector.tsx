import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import styles from './AnimalSelector.module.css';
import { animalAssets } from '@/assets';

interface AnimalSelectorProps {
  onSelect: (animal: CompanionAnimal) => void;
}

const ANIMALS: { animal: CompanionAnimal; name: string }[] = [
  { animal: 'rabbit', name: 'Hase' },
  { animal: 'bear', name: 'Bär' },
  { animal: 'fox', name: 'Fuchs' },
  { animal: 'dog', name: 'Hund' },
  { animal: 'cat', name: 'Katze' },
  { animal: 'panda', name: 'Panda' },
  { animal: 'koala', name: 'Koala' },
  { animal: 'lion', name: 'Löwe' },
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
        {ANIMALS.map(({ animal, name }) => (
          <motion.button
            key={animal}
            className={styles.animalCard}
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(animal)}
            aria-label={`Wähle ${name}`}
          >
            <img src={animalAssets[animal]} alt={name} className={styles.animalImage} />
            <span className={styles.animalName}>{name}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
