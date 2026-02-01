import { useEffect, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { generateProblem, getRandomProblemType } from '@/lib/problemGenerator';
import { createSession, checkAnswer } from '@/lib/sessionManager';
import { calculateDifficulty, shouldCelebrate } from '@/lib/difficultyEngine';
import { WelcomeScreen } from './WelcomeScreen';
import { ProgressBar } from './ProgressBar';
import { ProblemDisplay } from './ProblemDisplay';
import { FeedbackOverlay } from './FeedbackOverlay';
import { SessionComplete } from './SessionComplete';

export function Game() {
  const {
    selectedAnimal,
    currentSession,
    currentProblem,
    sessionProgress,
    difficulty,
    performanceHistory,
    isSessionActive,
    selectAnimal,
    startSession,
    setCurrentProblem,
    submitAnswer,
    nextProblem,
    resetSession,
    updateDifficulty,
  } = useGameStore();

  const [showFeedback, setShowFeedback] = useState(false);
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
    nextProblem();
    
    // Update difficulty after each problem
    const newDifficulty = calculateDifficulty(performanceHistory, difficulty);
    updateDifficulty(newDifficulty);
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

  // Render different screens based on state
  
  // Check for session completion FIRST (before checking isSessionActive)
  if (sessionProgress >= 10 && selectedAnimal && currentSession) {
    return (
      <SessionComplete
        correctCount={correctCount}
        treat={currentSession.treat}
        animal={selectedAnimal}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Show welcome screen if no animal selected or session not active
  if (!selectedAnimal || !isSessionActive) {
    return (
      <WelcomeScreen
        selectedAnimal={selectedAnimal}
        onSelectAnimal={handleSelectAnimal}
        onStartSession={handleStartSession}
      />
    );
  }

  return (
    <>
      {currentSession && (
        <ProgressBar
          current={sessionProgress}
          total={currentSession.totalProblems}
          animal={selectedAnimal}
          treat={currentSession.treat}
        />
      )}
      
      {currentProblem && (
        <ProblemDisplay
          problem={currentProblem}
          animal={selectedAnimal}
          onAnswer={handleAnswer}
        />
      )}
      
      {showFeedback && (
        <FeedbackOverlay
          correct={lastAnswerCorrect}
          shouldCelebrate={shouldCelebrate(performanceHistory)}
          onContinue={handleContinue}
        />
      )}
    </>
  );
}
