import { motion } from 'framer-motion';
import type { CompanionAnimal, AnimalEmotion } from '@/types';

interface CompanionAnimalProps {
  animal: CompanionAnimal;
  emotion: AnimalEmotion;
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

const getEmotionAnimation = (emotion: AnimalEmotion) => {
  switch (emotion) {
    case 'happy':
      return {
        y: [0, -8, 0],
        transition: {
          repeat: Infinity,
          duration: 2,
          ease: 'easeInOut' as const,
        },
      };
    case 'celebrating':
      return {
        rotate: [0, -10, 10, -10, 0],
        scale: [1, 1.2, 1],
        transition: {
          duration: 0.6,
          repeat: 2,
        },
      };
    case 'encouraging':
      return {
        y: [0, -4, 0, -4, 0],
        transition: {
          duration: 1,
          repeat: 1,
        },
      };
  }
};

export function CompanionAnimal({ animal, emotion }: CompanionAnimalProps) {
  return (
    <motion.div
      style={{ fontSize: '64px', display: 'inline-block' }}
      animate={getEmotionAnimation(emotion)}
    >
      {ANIMAL_EMOJI[animal]}
    </motion.div>
  );
}
