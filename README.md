# Mathe Spaß 🎯

Ein süßes, adaptives Mathespiel für Vorschul- und Grundschulkinder (5-8 Jahre). Hilf deinem Tier-Begleiter, seine Lieblingsleckerei zu erreichen, indem du lustige Matheaufgaben löst!

*A cute, adaptive math game for preschool and elementary students (ages 5-8) - in German.*

## Features

- **Adaptive Difficulty**: Automatically adjusts to challenge on good days and comfort on bad days
- **Companion Animals**: Choose from 8 cute animal friends (🐰🐻🦊🐶🐱🐼🐨🦁)
- **Varied Problem Types**: Addition, subtraction, counting, patterns, comparisons, and more
- **Encouraging Feedback**: Positive reinforcement with party poppers for excellent work
- **Bright Pastel Theme**: Kid-friendly design with smooth animations
- **Offline-First**: Works without internet after initial load
- **Progress Persistence**: Your animal and difficulty level are saved

## Tech Stack

- **React 19** - UI framework
- **Bun** - Fast JavaScript runtime and bundler
- **TypeScript** - Type safety
- **Zustand** - State management
- **Framer Motion** - Smooth animations
- **CSS Modules** - Component-scoped styling

## Development

Install dependencies:

```bash
bun install
```

Start development server with HMR:

```bash
bun dev
```

Build for production:

```bash
bun run build
```

## Game Mechanics

### Adaptive Difficulty Engine

The game uses a lookbehind algorithm that:
- Tracks the last 10 problems
- Increases difficulty when success rate > 80% AND responses are fast
- Decreases difficulty gradually when success rate < 50%
- Maintains difficulty if one wrong answer in 10 correct attempts

### Session Structure

- 10 problems per session
- Mixed problem types for variety
- Visual progress bar showing animal's journey to treat
- Celebration screen at session completion

## Problem Types

1. **Addition**: Simple sums within age-appropriate ranges
2. **Subtraction**: Ensuring positive results only
3. **Counting**: Visual emoji counting exercises
4. **Next/Previous**: Number sequence understanding
5. **Comparison**: Which number is bigger?
6. **Patterns**: Complete the sequence

## Project Structure

```
src/
├── components/     # React components
├── lib/           # Core logic (problem generator, difficulty engine)
├── store/         # Zustand state management
├── types/         # TypeScript type definitions
├── utils/         # Utility functions
└── styles/        # Global CSS and variables
```

## Future Enhancements

- Progress tracking dashboard for parents/teachers
- Sound effects and background music
- Time-telling problems
- Money/currency problems
- Configurable session lengths

## License

MIT

---

Built with ❤️ for kids who love math!
