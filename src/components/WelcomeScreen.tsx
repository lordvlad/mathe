import { motion } from 'framer-motion';
import type { CompanionAnimal } from '@/types';
import { Button } from './Button';
import { AnimalSelector } from './AnimalSelector';
import styles from './WelcomeScreen.module.css';
import { animalAssets, backgroundAssets } from '@/assets';

interface WelcomeScreenProps {
  selectedAnimal: CompanionAnimal | null;
  onSelectAnimal: (animal: CompanionAnimal) => void;
  onStartSession: () => void;
}

const ANIMAL_NAMES: Record<CompanionAnimal, string> = {
  rabbit: 'Hase',
  bear: 'Bär',
  fox: 'Fuchs',
  dog: 'Hund',
  cat: 'Katze',
  panda: 'Panda',
  koala: 'Koala',
  lion: 'Löwe',
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
        style={{ 
          position: 'relative',
          minHeight: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        {/* Background image with opacity */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${backgroundAssets.welcome})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.4,
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
          <AnimalSelector onSelect={onSelectAnimal} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ 
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}
    >
      {/* Background image with opacity */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url(${backgroundAssets.welcome})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        opacity: 0.4,
        zIndex: 0
      }} />
      
      {/* Content wrapper */}
      <div className={styles.container} style={{ position: 'relative', zIndex: 1 }}>
        <motion.div
          className={styles.animalDisplay}
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <img src={animalAssets[selectedAnimal]} alt={selectedAnimal} className={styles.animalImage} />
        </motion.div>
        
        <h1 className={styles.greeting}>
          Willkommen zurück!
        </h1>
        
        <p className={styles.message}>Bereit für Mathe-Spaß mit deinem Freund, dem {ANIMAL_NAMES[selectedAnimal]}?</p>
        
        <Button onClick={onStartSession}>Los geht's</Button>
      </div>
    </motion.div>
  );
}
