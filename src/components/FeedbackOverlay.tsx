import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import styles from './FeedbackOverlay.module.css';
import { uiAssets } from '@/assets';

interface FeedbackOverlayProps {
  correct: boolean;
  shouldCelebrate: boolean;
  onContinue: () => void;
}

const ENCOURAGING_MESSAGES = {
  correct: ['Super!', 'Toll gemacht!', 'Prima!', 'Du schaffst das!', 'Perfekt!'],
  tryAgain: ['Versuch es nochmal!', 'Fast!', 'Weiter so!', 'Du kannst das!'],
};

export function FeedbackOverlay({ correct, shouldCelebrate, onContinue }: FeedbackOverlayProps) {
  useEffect(() => {
    const timer = setTimeout(onContinue, 2000);
    return () => clearTimeout(timer);
  }, [onContinue]);

  const message = correct
    ? ENCOURAGING_MESSAGES.correct[
        Math.floor(Math.random() * ENCOURAGING_MESSAGES.correct.length)
      ]
    : ENCOURAGING_MESSAGES.tryAgain[
        Math.floor(Math.random() * ENCOURAGING_MESSAGES.tryAgain.length)
      ];

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onContinue}
      >
        <motion.div
          className={styles.content}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          {correct && (
            <motion.div
              className={styles.checkmark}
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: 360 }}
              transition={{ delay: 0.2 }}
            >
              <img src={uiAssets.thumbsUp} alt="Correct" style={{ width: '80px', height: '80px' }} />
            </motion.div>
          )}
          
          <div className={styles.message}>{message}</div>
          
          {shouldCelebrate && (
            <div className={styles.confetti}>
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={i}
                  className={styles.confettiPiece}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: [0, (Math.random() - 0.5) * 300],
                    y: [0, -200 + Math.random() * 100],
                  }}
                  transition={{ duration: 1, delay: i * 0.05 }}
                />
              ))}
              <div className={styles.partyPopper}>
                <img src={uiAssets.confetti} alt="Party" style={{ width: '60px', height: '60px' }} />
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
