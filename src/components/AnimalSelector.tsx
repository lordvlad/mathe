import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import styles from './AnimalSelector.module.css';

interface AnimalSelectorProps {
  onSelect: (animal: CompanionAnimal) => void;
}

const ANIMALS: { animal: CompanionAnimal; name: string; image: string }[] = [
  { animal: 'rabbit', name: 'Hase', image: '/assets/animals/rabbit.png' },
  { animal: 'bear', name: 'Bär', image: '/assets/animals/bear.png' },
  { animal: 'fox', name: 'Fuchs', image: '/assets/animals/fox.png' },
  { animal: 'dog', name: 'Hund', image: '/assets/animals/dog.png' },
  { animal: 'cat', name: 'Katze', image: '/assets/animals/cat.png' },
  { animal: 'panda', name: 'Panda', image: '/assets/animals/panda.png' },
  { animal: 'koala', name: 'Koala', image: '/assets/animals/koala.png' },
  { animal: 'lion', name: 'Löwe', image: '/assets/animals/lion.png' },
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
        {ANIMALS.map(({ animal, name, image }) => (
          <motion.button
            key={animal}
            className={styles.animalCard}
            variants={itemVariants}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(animal)}
            aria-label={`Wähle ${name}`}
          >
            <img src={image} alt={name} className={styles.animalImage} />
            <span className={styles.animalName}>{name}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
