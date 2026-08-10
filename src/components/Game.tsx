import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { generateProblem, getRandomProblemType } from '@/lib/problemGenerator';
import { createSession, checkAnswer } from '@/lib/sessionManager';
import { calculateDifficulty, shouldCelebrate } from '@/lib/difficultyEngine';
import { WelcomeScreen } from './WelcomeScreen';
import { GamePickScreen } from './GamePickScreen';
import { MathShooterGame } from './MathShooter/MathShooterGame';
import { ProblemDisplay } from './ProblemDisplay';
import { FeedbackOverlay } from './FeedbackOverlay';
import { HalfwayCelebration } from './HalfwayCelebration';
import { SessionComplete } from './SessionComplete';
import { backgroundAssets } from '@/assets';

export function Game() {
  const {
    selectedAnimal,
    selectedGame,
    currentSession,
    currentProblem,
    sessionProgress,
    difficulty,
    performanceHistory,
    isSessionActive,
    selectAnimal,
    selectGame,
    startSession,
    setCurrentProblem,
    submitAnswer,
    nextProblem,
    resetSession,
    updateDifficulty,
  } = useGameStore();

  const [showGamePick, setShowGamePick] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showHalfway, setShowHalfway] = useState(false);
  const [lastAnswerCorrect, setLastAnswerCorrect] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  // Generate first problem when session starts
  useEffect(() => {
    if (isSessionActive && !currentProblem && sessionProgress < 10) {
      const problemType = getRandomProblemType(difficulty);
      const problem = generateProblem(problemType, difficulty);
      setCurrentProblem(problem);
      setStartTime(Date.now());
    }
  }, [isSessionActive, currentProblem, sessionProgress, difficulty, setCurrentProblem]);

  // Handle animal selection
  const handleSelectAnimal = (animal: NonNullable<typeof selectedAnimal>) => {
    selectAnimal(animal);
  };

  // Start a new session
  const handleStartSession = () => {
    if (!selectedAnimal) return;
    
    const session = createSession(selectedAnimal);
    startSession(session);
    setCorrectCount(0);
  };

  // Handle answer submission
  const handleAnswer = (userAnswer: number) => {
    if (!currentProblem) return;

    const timeMs = Date.now() - startTime;
    const correct = checkAnswer(userAnswer, currentProblem.answer);
    
    // Update store
    submitAnswer(correct, timeMs, currentProblem.type);
    
    // Update local state
    setLastAnswerCorrect(correct);
    setShowFeedback(true);
    
    if (correct) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  // Continue after feedback
  const handleContinue = () => {
    setShowFeedback(false);
    
    // Check if we've reached halfway (5 problems completed)
    if (sessionProgress === 4) {
      // Next problem will be #5, show celebration
      setShowHalfway(true);
    }
    
    nextProblem();
    
    // Update difficulty after each problem
    const newDifficulty = calculateDifficulty(performanceHistory, difficulty);
    updateDifficulty(newDifficulty);
  };

  // Continue after halfway celebration
  const handleHalfwayContinue = () => {
    setShowHalfway(false);
  };

  // Play again after session complete
  const handlePlayAgain = () => {
    if (!selectedAnimal) return;

    // Reset counters and start a fresh session
    setCorrectCount(0);
    const session = createSession(selectedAnimal);

    // Reset session state and start new one
    resetSession();
    startSession(session);
  };

  // Leave the current game and return to the game picker
  const handleChangeGame = () => {
    resetSession();
    selectGame(null);
    setShowGamePick(true);
  };

  // Render different screens based on state

  // The marble shooter owns its whole screen once picked
  if (selectedGame === 'shooter' && selectedAnimal) {
    return <MathShooterGame animal={selectedAnimal} onExit={handleChangeGame} />;
  }

  // Check for session completion FIRST (before checking isSessionActive)
  if (sessionProgress >= 10 && selectedAnimal && currentSession) {
    return (
      <SessionComplete
        correctCount={correctCount}
        treat={currentSession.treat}
        animal={selectedAnimal}
        onPlayAgain={handlePlayAgain}
        onChangeGame={handleChangeGame}
      />
    );
  }

  // Show the animal picker, or the "ready" screen once an animal is chosen
  // but the player hasn't confirmed which game to play yet.
  if (!selectedAnimal || (!showGamePick && !isSessionActive)) {
    return (
      <WelcomeScreen
        selectedAnimal={selectedAnimal}
        onSelectAnimal={handleSelectAnimal}
        onStartSession={() => setShowGamePick(true)}
      />
    );
  }

  // Let the player pick which game to play
  if (!selectedGame && !isSessionActive && selectedAnimal) {
    return (
      <GamePickScreen
        animal={selectedAnimal}
        onPick={(game) => {
          selectGame(game);
          if (game === 'quiz') handleStartSession();
        }}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        padding: '1vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
        {currentProblem && currentSession && selectedAnimal && (
          <ProblemDisplay
            problem={currentProblem}
            animal={selectedAnimal}
            onAnswer={handleAnswer}
            currentProgress={sessionProgress}
            totalProblems={currentSession.totalProblems}
            treat={currentSession.treat}
          />
        )}

        {showFeedback && (
          <FeedbackOverlay
            correct={lastAnswerCorrect}
            shouldCelebrate={shouldCelebrate(performanceHistory)}
            onContinue={handleContinue}
          />
        )}

        {showHalfway && currentSession && selectedAnimal && (
          <HalfwayCelebration
            animal={selectedAnimal}
            treat={currentSession.treat}
            onContinue={handleHalfwayContinue}
          />
        )}
    </motion.div>
  );
}
