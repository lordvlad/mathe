import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import { Button } from './Button';
import { Confetti } from './Confetti';
import styles from './SessionComplete.module.css';

interface SessionCompleteProps {
  correctCount: number;
  treat: string;
  animal: CompanionAnimal;
  onPlayAgain: () => void;
}

const ANIMAL_IMAGES: Record<CompanionAnimal, string> = {
  rabbit: '/assets/animals/rabbit.png',
  bear: '/assets/animals/bear.png',
  fox: '/assets/animals/fox.png',
  dog: '/assets/animals/dog.png',
  cat: '/assets/animals/cat.png',
  panda: '/assets/animals/panda.png',
  koala: '/assets/animals/koala.png',
  lion: '/assets/animals/lion.png',
};

export function SessionComplete({
  correctCount,
  treat,
  animal,
  onPlayAgain,
}: SessionCompleteProps) {
  return (
    <>
      <Confetti count={60} />
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
          <img 
            src={ANIMAL_IMAGES[animal]} 
            alt="celebration" 
            className={styles.animalLarge}
          />
          <div className={styles.treatLarge}>{treat}</div>
        </motion.div>
      
      <motion.h1
        className={styles.heading}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        Geschafft!
      </motion.h1>
      
      <motion.div
        className={styles.stats}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        Du hast <strong>{correctCount} von 10</strong> richtig!
      </motion.div>
      
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 2.0 }}
      >
        <Button onClick={onPlayAgain}>Nochmal spielen</Button>
      </motion.div>
    </motion.div>
    </>
  );
}
