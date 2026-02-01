# Implementation Plan

**Project**: preschool-math-game  
**Generated**: 2025-02-01T18:48:00Z

## Technical Context & Standards

*Detected Stack & Patterns*
- **Framework**: React 19 + Bun (dev server with HMR)
- **Language**: TypeScript (strict mode enabled)
- **Styling**: Plain CSS → Will add CSS Modules for component-scoped styles
- **State**: None yet → Will add Zustand for global game state
- **Animation**: None yet → Will add Framer Motion for transitions
- **Storage**: Will use localStorage API directly
- **Build**: Bun bundler with `bun build` command
- **Path Aliases**: `@/*` maps to `./src/*`
- **Conventions**: 
  - PascalCase for component files (`.tsx`)
  - camelCase for utility files (`.ts`)
  - Plain CSS with BEM-like naming
  - Strict TypeScript (no implicit any)

---

## Phase 1: Project Setup & Dependencies

- [x] **Install Required Dependencies**  
  Task ID: phase-1-setup-01  
  > **Implementation**: Run `bun add zustand framer-motion` in project root.  
  > **Details**: Install Zustand for state management and Framer Motion for animations. Verify installation by checking `package.json` dependencies section.

- [x] **Create Core Directory Structure**  
  Task ID: phase-1-setup-02  
  > **Implementation**: Create folders: `src/components/`, `src/store/`, `src/types/`, `src/utils/`, `src/lib/`, `src/styles/`, `src/assets/`.  
  > **Details**: Use `mkdir -p` to create nested structure. This follows React best practices for organizing a growing application.

- [x] **Define TypeScript Types**  
  Task ID: phase-1-setup-03  
  > **Implementation**: Create `src/types/index.ts`.  
  > **Details**: Define core types:
  > - `ProblemType`: union type ('addition' | 'subtraction' | 'counting' | 'next' | 'previous' | 'comparison' | 'pattern')
  > - `Difficulty`: interface with min/max ranges per problem type
  > - `Problem`: interface with type, question, answer, options (for multiple choice)
  > - `GameState`: interface with currentProblem, sessionProgress, difficulty, history
  > - `CompanionAnimal`: type for available animals ('rabbit' | 'bear' | 'fox' | 'dog' | 'cat' | 'panda' | 'koala' | 'lion')
  > - `SessionGoal`: interface with treat type and animal
  > - `PerformanceHistory`: interface for tracking last 10 problems

- [x] **Create Global CSS Variables for Bright Pastels**  
  Task ID: phase-1-setup-04  
  > **Implementation**: Create `src/styles/variables.css`.  
  > **Details**: Define CSS custom properties for bright pastel palette:
  > - `--pastel-pink`: #FFB3D9
  > - `--pastel-blue`: #B3E5FC
  > - `--pastel-yellow`: #FFF9C4
  > - `--pastel-green`: #C8E6C9
  > - `--pastel-purple`: #E1BEE7
  > - `--pastel-peach`: #FFCCBC
  > - Font size variables for ages 5-8 (large, readable)
  > - Border radius, spacing scale
  > Import in `src/index.css` at the top.

---

## Phase 2: State Management & Core Logic

- [x] **Create Zustand Store for Game State**  
  Task ID: phase-2-state-01  
  > **Implementation**: Create `src/store/gameStore.ts`.  
  > **Details**: Define Zustand store with:
  > - State: `selectedAnimal`, `currentSession`, `difficulty`, `performanceHistory` (last 10), `sessionProgress` (0-10)
  > - Actions: `selectAnimal()`, `startSession()`, `submitAnswer()`, `nextProblem()`, `resetSession()`
  > - Persist selectedAnimal and difficulty to localStorage using Zustand persist middleware
  > - Export `useGameStore` hook

- [x] **Create Adaptive Difficulty Engine**  
  Task ID: phase-2-state-02  
  > **Implementation**: Create `src/lib/difficultyEngine.ts`.  
  > **Details**: Export function `calculateDifficulty(history: PerformanceHistory): Difficulty`
  > - Analyze last 10 problems (success rate, average time)
  > - If success rate > 80% and fast responses: increase difficulty
  > - If success rate < 50%: decrease difficulty gradually
  > - Single wrong answer in 10 correct: maintain difficulty
  > - Return updated difficulty ranges for each problem type
  > - Document algorithm in JSDoc comments

- [x] **Create Problem Generator**  
  Task ID: phase-2-state-03  
  > **Implementation**: Create `src/lib/problemGenerator.ts`.  
  > **Details**: Export function `generateProblem(type: ProblemType, difficulty: Difficulty): Problem`
  > - Addition: Generate two numbers within difficulty range, sum as answer
  > - Subtraction: Ensure positive results only
  > - Counting: Show array of emoji, ask "How many?"
  > - Next/Previous: Given number, find next/previous
  > - Comparison: Two numbers, select <, >, or =
  > - Pattern: Generate sequence (e.g., 2, 4, 6, ?) and ask for next
  > - Include 3-4 multiple choice options (1 correct, rest plausible distractors)
  > - Randomize option order

- [x] **Create Session Manager**  
  Task ID: phase-2-state-04  
  > **Implementation**: Create `src/lib/sessionManager.ts`.  
  > **Details**: Export functions:
  > - `createSession(): SessionGoal` - Randomly picks treat (ice cream, chocolate, candy) and generates 10-problem sequence with varied types
  > - `checkAnswer(userAnswer: number, correctAnswer: number): boolean`
  > - `updateProgress(correct: boolean, timeMs: number): void` - Updates history in store
  > - `shouldCelebrate(history: PerformanceHistory): boolean` - Returns true if last 3+ problems correct AND fast

---

## Phase 3: UI Components - Foundation

- [x] **Create Layout Component**  
  Task ID: phase-3-ui-01  
  > **Implementation**: Create `src/components/Layout.tsx` and `src/components/Layout.module.css`.  
  > **Details**: 
  > - Full-screen container with bright pastel gradient background
  > - Safe area for content (responsive padding)
  > - Props: `children: ReactNode`
  > - Use CSS Grid for centering
  > - Import variables from `variables.css`

- [x] **Create ProgressBar Component**  
  Task ID: phase-3-ui-02  
  > **Implementation**: Create `src/components/ProgressBar.tsx` and `ProgressBar.module.css`.  
  > **Details**:
  > - Visual progress indicator showing animal journey (0/10 to 10/10)
  > - Props: `current: number`, `total: number`, `animal: CompanionAnimal`, `treat: string`
  > - Render animal emoji moving along a path toward treat emoji
  > - Use Framer Motion for smooth position transitions
  > - Show numeric progress (e.g., "5 of 10")

- [x] **Create Button Component**  
  Task ID: phase-3-ui-03  
  > **Implementation**: Create `src/components/Button.tsx` and `Button.module.css`.  
  > **Details**:
  > - Large, touch-friendly button (min 60px height)
  > - Props: `children`, `onClick`, `variant` ('primary' | 'secondary'), `disabled`
  > - Use pastel colors with subtle hover effects
  > - Framer Motion: scale on tap (whileTap={{ scale: 0.95 }})
  > - Rounded corners, large font size

---

## Phase 4: UI Components - Game Screens

- [x] **Create AnimalSelector Component**  
  Task ID: phase-4-screens-01  
  > **Implementation**: Create `src/components/AnimalSelector.tsx` and `AnimalSelector.module.css`.  
  > **Details**:
  > - Grid of animal emoji buttons (🐰🐻🦊🐶🐱🐼🐨🦁)
  > - Props: `onSelect: (animal: CompanionAnimal) => void`
  > - Large clickable cards with emoji
  > - Framer Motion: stagger children entrance animation
  > - Heading: "Pick your companion!"
  > - Save selection to store and localStorage on click

- [x] **Create ProblemDisplay Component**  
  Task ID: phase-4-screens-02  
  > **Implementation**: Create `src/components/ProblemDisplay.tsx` and `ProblemDisplay.module.css`.  
  > **Details**:
  > - Display current problem question in large, friendly font
  > - Props: `problem: Problem`, `onAnswer: (answer: number) => void`
  > - Show 3-4 multiple choice buttons (use Button component)
  > - Animate problem appearance with Framer Motion (fade in + slight bounce)
  > - If problem type is 'counting', display emoji array visually
  > - Companion animal visible in corner with encouraging expression

- [x] **Create FeedbackOverlay Component**  
  Task ID: phase-4-screens-03  
  > **Implementation**: Create `src/components/FeedbackOverlay.tsx` and `FeedbackOverlay.module.css`.  
  > **Details**:
  > - Modal overlay for immediate feedback after answer
  > - Props: `correct: boolean`, `shouldCelebrate: boolean`, `onContinue: () => void`
  > - If correct: Show checkmark ✓, short encouraging message ("Nice!", "Great job!"), companion animal happy reaction
  > - If shouldCelebrate: Show party popper animation 🎉 using Framer Motion (scale + confetti-like elements)
  > - If incorrect: Show gentle message ("Try again!", "Almost!"), companion animal supportive reaction (not sad)
  > - Auto-dismiss after 2 seconds OR user can tap to continue
  > - Framer Motion: fade in/out, scale animation

- [x] **Create SessionComplete Component**  
  Task ID: phase-4-screens-04  
  > **Implementation**: Create `src/components/SessionComplete.tsx` and `SessionComplete.module.css`.  
  > **Details**:
  > - Celebration screen shown after 10 problems
  > - Props: `correctCount: number`, `treat: string`, `animal: CompanionAnimal`, `onPlayAgain: () => void`
  > - Show animal reaching treat with happy animation
  > - Display stats: "You got X out of 10 right!"
  > - Large "Play Again" button
  > - Framer Motion: entrance animation with stagger

- [x] **Create WelcomeScreen Component**  
  Task ID: phase-4-screens-05  
  > **Implementation**: Create `src/components/WelcomeScreen.tsx` and `WelcomeScreen.module.css`.  
  > **Details**:
  > - Initial screen if no animal selected
  > - If animal exists: Show "Welcome back [animal emoji]!" and "Start Session" button
  > - If no animal: Render AnimalSelector component
  > - Friendly heading: "Let's practice math!"
  > - Bright pastel background with playful CSS animation (optional subtle bounce)

---

## Phase 5: Main Game Flow Integration

- [x] **Create Game Router/Manager Component**  
  Task ID: phase-5-integration-01  
  > **Implementation**: Create `src/components/Game.tsx`.  
  > **Details**:
  > - Main game orchestrator component
  > - Subscribe to `useGameStore` for state
  > - Render appropriate screen based on state:
  >   - No animal selected: `<WelcomeScreen />`
  >   - Session not started: Show "Start Session" with animal display
  >   - Session active (0-9 problems): `<ProblemDisplay />` with `<ProgressBar />`
  >   - Session complete (10 problems): `<SessionComplete />`
  > - Handle session flow logic (start, submit answer, next problem, reset)
  > - Integrate difficultyEngine to adjust difficulty between problems

- [x] **Replace App.tsx with Game**  
  Task ID: phase-5-integration-02  
  > **Implementation**: Edit `src/App.tsx`.  
  > **Details**:
  > - Remove existing demo content (APITester, logos)
  > - Import and render `<Game />` component inside `<Layout />`
  > - Remove old CSS references, import `variables.css`

- [x] **Update Global Styles**  
  Task ID: phase-5-integration-03  
  > **Implementation**: Edit `src/index.css`.  
  > **Details**:
  > - Replace dark theme with bright pastel theme
  > - Set body background to soft gradient using pastel colors
  > - Remove Bun logo animation background
  > - Set base font to kid-friendly sans-serif (Comic Sans MS, Quicksand, or similar)
  > - Ensure text is highly readable (dark text on light pastels)
  > - Generous spacing throughout

---

## Phase 6: Animations & Polish

- [x] **Add Page Transition Animations**  
  Task ID: phase-6-polish-01  
  > **Implementation**: Create `src/components/PageTransition.tsx`.  
  > **Details**:
  > - Wrapper component using Framer Motion AnimatePresence
  > - Props: `children`, `key` (for transition trigger)
  > - Fade + slide up entrance, fade out exit
  > - Use in Game.tsx to wrap screen changes

- [x] **Add Micro-interactions**  
  Task ID: phase-6-polish-02  
  > **Implementation**: Enhance existing components with Framer Motion.  
  > **Details**:
  > - Button: Add subtle bounce on hover, scale on tap
  > - ProblemDisplay: Animate question text character-by-character (optional, may be distracting)
  > - ProgressBar: Smooth animal movement with spring animation
  > - FeedbackOverlay: Party popper confetti effect (create 5-10 small colored circles that animate outward)
  > - Companion animal: Add idle bounce animation (subtle continuous motion)

- [x] **Create Companion Animation Component**  
  Task ID: phase-6-polish-03  
  > **Implementation**: Create `src/components/CompanionAnimal.tsx`.  
  > **Details**:
  > - Display selected animal emoji with animations
  > - Props: `animal: CompanionAnimal`, `emotion` ('happy' | 'celebrating' | 'encouraging')
  > - Use Framer Motion variants for different emotions:
  >   - Happy: Gentle bounce
  >   - Celebrating: Jump with rotation
  >   - Encouraging: Nod animation (subtle vertical movement)
  > - Render large emoji (64px+) with animation

- [x] **Add Loading State**  
  Task ID: phase-6-polish-04  
  > **Implementation**: Create `src/components/LoadingSpinner.tsx`.  
  > **Details**:
  > - Simple animated spinner for any async operations
  > - Use Framer Motion for rotation animation
  > - Pastel colors matching theme
  > - Show during problem generation (if noticeable delay)

---

## Phase 7: LocalStorage Persistence

- [x] **Implement Game State Persistence**  
  Task ID: phase-7-storage-01  
  > **Implementation**: Enhance `src/store/gameStore.ts`.  
  > **Details**:
  > - Use Zustand's `persist` middleware
  > - Persist to localStorage with key `'math-game-state'`
  > - Store: `selectedAnimal`, `difficulty` levels, `performanceHistory`
  > - Don't persist: Current session state (start fresh each time)
  > - Handle localStorage errors gracefully (catch and log)

- [x] **Create Storage Utilities**  
  Task ID: phase-7-storage-02  
  > **Implementation**: Create `src/utils/storage.ts`.  
  > **Details**:
  > - Export functions: `getStoredAnimal()`, `saveAnimal()`, `getDifficulty()`, `saveDifficulty()`
  > - Wrapper around localStorage with error handling
  > - Type-safe with TypeScript generics
  > - Fallback to in-memory if localStorage unavailable

---

## Phase 8: Testing & Refinement

- [x] **Manual Testing - Happy Path**  
  Task ID: phase-8-testing-01  
  > **Implementation**: Test full game flow manually.  
  > **Details**:
  > - Test animal selection persists across refresh
  > - Complete full 10-problem session
  > - Verify difficulty adapts correctly (check console logs)
  > - Test all problem types appear
  > - Verify party poppers appear for excellent work
  > - Check gentle feedback for wrong answers
  > - Test on Chrome, Firefox, Safari

- [x] **Manual Testing - Edge Cases**  
  Task ID: phase-8-testing-02  
  > **Implementation**: Test edge cases and error handling.  
  > **Details**:
  > - Clear localStorage and verify game still works
  > - Test rapid clicking on answer buttons (debounce if needed)
  > - Test on mobile viewport (responsive design)
  > - Test with slow connection (offline after first load)
  > - Verify no console errors

- [x] **Accessibility Quick Check**  
  Task ID: phase-8-testing-03  
  > **Implementation**: Basic accessibility review (not full WCAG compliance).  
  > **Details**:
  > - Ensure all interactive elements are keyboard accessible (though PRD says no full accessibility)
  > - Check color contrast for readability (dark text on pastels)
  > - Add alt text to animal/treat emoji (via aria-label)
  > - Test with browser zoom at 150%

- [x] **Performance Optimization**  
  Task ID: phase-8-testing-04  
  > **Implementation**: Optimize for older tablets/Chromebooks.  
  > **Details**:
  > - Run Bun build and check bundle size
  > - Lazy load heavy animations if bundle > 500KB
  > - Reduce motion for `prefers-reduced-motion`
  > - Test on throttled CPU in Chrome DevTools
  > - Ensure animations run at 60fps on low-end devices

---

## Phase 9: Build & Deployment Prep

- [x] **Configure Build for Production**  
  Task ID: phase-9-build-01  
  > **Implementation**: Verify `package.json` build script.  
  > **Details**:
  > - Ensure `bun build` command outputs to `dist/`
  > - Verify minification enabled
  > - Check sourcemaps are generated
  > - Test production build locally: `bun build && bun src/index.ts`

- [x] **Create Offline Support (PWA)**  
  Task ID: phase-9-build-02  
  > **Implementation**: Create service worker or use Bun PWA capabilities.  
  > **Details**:
  > - Create `src/service-worker.ts` (or use Bun plugin)
  > - Cache app shell and assets for offline use
  > - Register service worker in `src/index.ts`
  > - Test offline functionality (disconnect network, verify app loads)

- [x] **Add README with Setup Instructions**  
  Task ID: phase-9-build-03  
  > **Implementation**: Edit `README.md`.  
  > **Details**:
  > - Project description: "A cute math game for preschool and elementary students (ages 5-8)"
  > - Features list: adaptive difficulty, companion animals, bright pastels
  > - Setup: `bun install`, `bun dev`
  > - Build: `bun run build`
  > - Tech stack: React 19, Bun, TypeScript, Zustand, Framer Motion
  > - Note: Local state only, no backend required

- [x] **Final Polish Pass**  
  Task ID: phase-9-build-04  
  > **Implementation**: Review entire app for polish.  
  > **Details**:
  > - Check all text is short and encouraging
  > - Verify emoji are large and visible
  > - Ensure smooth transitions between all screens
  > - Check no jank or layout shifts
  > - Verify bright pastel colors are consistent
  > - Test "comforting on bad day" scenario (answer incorrectly multiple times, verify difficulty drops and messages stay positive)

---

*Generated by Clavix /clavix-plan*
