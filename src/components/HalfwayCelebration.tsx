import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import styles from './HalfwayCelebration.module.css';
import { animalAssets, treatAssets } from '@/assets';

interface HalfwayCelebrationProps {
  animal: CompanionAnimal;
  treat: string;
  onContinue: () => void;
}

export function HalfwayCelebration({
  animal,
  treat,
  onContinue,
}: HalfwayCelebrationProps) {
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onContinue}
    >
      <motion.div
        className={styles.container}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
      >
        {/* Excited animal jumping */}
        <motion.div
          className={styles.animalContainer}
          animate={{
            y: [0, -30, 0, -20, 0],
            rotate: [0, -10, 10, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <img
            src={animalAssets[animal]}
            alt="Excited animal"
            className={styles.animal}
          />
        </motion.div>

        {/* Floating hearts */}
        <motion.div className={styles.hearts}>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.heart}
              initial={{ opacity: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 0],
                y: [0, -100],
                x: [(i % 2) * 40 - 20],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              ❤️
            </motion.div>
          ))}
        </motion.div>

        {/* Message */}
        <motion.div
          className={styles.message}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h1 className={styles.heading}>Halbzeit! 🎉</h1>
          <p className={styles.encouragement}>
            Super gemacht! Noch 5 Aufgaben bis zum Leckerbissen!
          </p>
        </motion.div>

        {/* Treat preview with sparkles */}
        <motion.div
          className={styles.treatPreview}
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <motion.div
            className={styles.sparkle}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            ✨
          </motion.div>
          <div className={styles.treat}>
            {treatAssets[treat as keyof typeof treatAssets] ? (
              <img src={treatAssets[treat as keyof typeof treatAssets]} alt={treat} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
            ) : (
              <span>{treat}</span>
            )}
          </div>
          <motion.div
            className={styles.sparkle}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.5,
            }}
          >
            ✨
          </motion.div>
        </motion.div>

        {/* Continue hint */}

      </motion.div>
    </motion.div>
  );
}
