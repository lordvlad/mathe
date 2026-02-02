import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import { Button } from './Button';
import { Confetti } from './Confetti';
import styles from './SessionComplete.module.css';
import { animalAssets, treatAssets, backgroundAssets } from '@/assets';

interface SessionCompleteProps {
  correctCount: number;
  treat: string;
  animal: CompanionAnimal;
  onPlayAgain: () => void;
}

export function SessionComplete({
  correctCount,
  treat,
  animal,
  onPlayAgain,
}: SessionCompleteProps) {
  // Determine celebration level based on score
  const isPerfect = correctCount === 10;
  const isGreat = correctCount >= 8;
  
  return (
    <div 
      style={{ 
        backgroundImage: `url(${backgroundAssets.celebration})`,
        backgroundSize: 'cover',
        minHeight: '100vh',
        position: 'relative',
        width: '100%'
      }}
    >
      {/* Semi-transparent white overlay to improve readability */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 0
      }} />
      
      {/* Content wrapper */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Confetti count={isPerfect ? 100 : 60} />
      
      {/* Fireworks effect for perfect score */}
      {isPerfect && (
        <motion.div className={styles.fireworks}>
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.firework}
              initial={{ scale: 0, opacity: 1 }}
              animate={{
                scale: [0, 2, 3],
                opacity: [1, 1, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${20 + (i % 3) * 20}%`,
              }}
            >
              ✨
            </motion.div>
          ))}
        </motion.div>
      )}

      <motion.div
        className={styles.container}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 150, damping: 15 }}
      >
        {/* Celebrating animal eating the treat */}
        <motion.div
          className={styles.celebration}
          initial={{ y: 50, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
          }}
          transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
        >
          <motion.img 
            src={animalAssets[animal]} 
            alt="celebration" 
            className={styles.animalLarge}
            animate={{
              y: [0, -15, 0],
              rotate: [0, -5, 5, 0],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 0.5,
            }}
          />
          
          {/* Treat with sparkle effect */}
          <motion.div 
            className={styles.treatContainer}
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <motion.div
              className={styles.sparkleLeft}
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, 360],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              ✨
            </motion.div>
            <div className={styles.treatLarge}>
              {treatAssets[treat as keyof typeof treatAssets] ? (
                <img src={treatAssets[treat as keyof typeof treatAssets]} alt={treat} style={{ width: '80px', height: '80px', objectFit: 'contain' }} />
              ) : (
                <span>{treat}</span>
              )}
            </div>
            <motion.div
              className={styles.sparkleRight}
              animate={{
                scale: [1, 1.5, 1],
                rotate: [0, -360],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: 1,
              }}
            >
              ✨
            </motion.div>
          </motion.div>
        </motion.div>
      
        {/* Victory message */}
        <motion.h1
          className={styles.heading}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
        >
          {isPerfect ? '🎉 Perfekt! 🎉' : isGreat ? '🌟 Super! 🌟' : '✨ Geschafft! ✨'}
        </motion.h1>
      
        {/* Encouraging message */}
        <motion.div
          className={styles.encouragement}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {isPerfect && '🏆 Alles richtig! Du bist ein Mathe-Star! 🏆'}
          {isGreat && !isPerfect && '🎊 Toll gemacht! Fast perfekt! 🎊'}
          {!isGreat && '🎈 Gut gemacht! Weiter so! 🎈'}
        </motion.div>
      
        {/* Stats */}
        <motion.div
          className={styles.stats}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0 }}
        >
          Du hast <strong>{correctCount} von 10</strong> richtig!
        </motion.div>
      
        {/* Play again button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <Button onClick={onPlayAgain}>Nochmal spielen</Button>
        </motion.div>
      </motion.div>
      </div>
    </div>
  );
}
