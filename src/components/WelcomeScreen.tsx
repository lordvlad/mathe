import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import { Button } from './Button';
import { AnimalSelector } from './AnimalSelector';
import styles from './WelcomeScreen.module.css';

interface WelcomeScreenProps {
  selectedAnimal: CompanionAnimal | null;
  onSelectAnimal: (animal: CompanionAnimal) => void;
  onStartSession: () => void;
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

export function WelcomeScreen({
  selectedAnimal,
  onSelectAnimal,
  onStartSession,
}: WelcomeScreenProps) {
  if (!selectedAnimal) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h1 className={styles.title}>Lass uns Mathe üben!</h1>
        <AnimalSelector onSelect={onSelectAnimal} />
      </motion.div>
    );
  }

  return (
    <motion.div
      className={styles.container}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.div
        className={styles.animalDisplay}
        animate={{ y: [0, -10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
      >
        {ANIMAL_EMOJI[selectedAnimal]}
      </motion.div>
      
      <h1 className={styles.greeting}>
        Willkommen zurück {ANIMAL_EMOJI[selectedAnimal]}!
      </h1>
      
      <p className={styles.message}>Bereit für Mathe-Spaß?</p>
      
      <Button onClick={onStartSession}>Los geht's</Button>
    </motion.div>
  );
}
