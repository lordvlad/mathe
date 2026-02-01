# Product Requirements Document: Preschool Math Game

## Problem & Goal

**Problems we're solving:**
- Kids get frustrated with one-size-fits-all math practice that doesn't adapt to their emotional state or skill level
- Teachers and parents need engaging tools that work without constant supervision
- There's a lack of math games that are truly adaptive AND emotionally supportive, making struggling feel safe

**Goal:**
Build a browser-based math game for ages 5-8 that builds confidence and makes math feel fun through adaptive difficulty, cute visual feedback, and encouraging interactions. The game should challenge on good days and comfort on bad days, always making kids feel supported while learning.

## Requirements

### Must-Have Features

**1. Problem Types (Ages 5-8 appropriate):**
- Addition and subtraction (within appropriate ranges for skill level)
- Counting exercises
- Next number in sequence
- Previous number in sequence
- Number comparisons (greater than, less than, equal to)
- Pattern recognition and completion

**2. Adaptive Difficulty System:**
- Real-time adjustment based on performance
- Lookbehind algorithm: Tracks last 10 problems to avoid dropping difficulty after one wrong answer
- Smooth difficulty progression that feels natural, not jarring
- Persists difficulty level in localStorage between sessions

**3. Visual Feedback & Encouragement:**
- Party popper celebrations (🎉) for excellent performance
- Cute emoji and animal reactions throughout
- Short, encouraging messages (not verbose)
- Bright pastel color scheme
- Smooth, cute transitions between problems

**4. Companion Animal System:**
- Child picks a companion animal at start
- Animal accompanies them through problems
- Animal shows reactions (happy, encouraging, celebrating)
- Companion choice persists between sessions

**5. Session Structure:**
- 10 problems per session (hardcoded for v1)
- Progression visual: Animal companion journeys toward a treat (ice cream, chocolate, candy - randomized per session)
- Visual progress indicator showing how far along the journey they are

**6. Offline-First Experience:**
- Works offline after initial load
- All state stored locally (localStorage)
- No backend or authentication required
- Lightweight assets for older tablets/Chromebooks

### Technical Requirements

**Tech Stack:**
- **Frontend Framework:** React
- **Runtime/Build Tool:** Bun
- **State Management:** React Context API or Zustand (agent's choice based on complexity)
- **Animation Library:** Framer Motion or React Spring (agent's choice for cute, smooth transitions)
- **Styling:** CSS modules or styled-components (bright pastel theme)
- **Storage:** localStorage for progress persistence
- **Offline Support:** Service Worker or Bun's built-in PWA capabilities

**Performance Constraints:**
- Must run smoothly on older tablets and Chromebooks
- Lightweight bundle size
- Fast load times even on slower devices
- No heavy assets or complex animations that cause lag

**Visual Assets:**
- Use available emoji for animals and celebrations (🐰🐻🦊🐶🐱🐼🐨🦁)
- Find free/open-source cute assets online in coherent style (agent to source)
- Icon libraries for UI elements (buttons, progress indicators)
- Consistent visual style across all assets

**Browser Compatibility:**
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Touch-friendly for tablets
- Responsive design (works on various screen sizes)

### Architecture & Design

**Key Design Principles:**
- **Emotionally Supportive:** Never punitive, always encouraging
- **Adaptive Without Being Obvious:** Difficulty changes feel natural, not algorithmic
- **Delightful Interactions:** Every tap/click should feel satisfying
- **Clear Visual Hierarchy:** Kids can easily understand what to do next
- **Minimal Text:** Use visuals and emojis over words when possible

**Adaptive Difficulty Algorithm:**
- Track rolling window of last 10 problems
- Calculate success rate and response time
- Adjust difficulty parameters (number ranges, problem complexity)
- Require consistent performance before increasing difficulty
- Drop difficulty gradually if struggling (not after single mistake)
- Store current difficulty level in localStorage

**Session Flow:**
1. Welcome screen → Pick companion animal (first time)
2. Show session goal (animal + random treat destination)
3. Present 10 problems with progress indicator
4. Adaptive feedback after each answer
5. Celebration screen at session end
6. Option to start new session

## Out of Scope

**Explicitly NOT included in v1:**
- ❌ User accounts, authentication, or login
- ❌ Backend server or database
- ❌ Multiplayer or social features
- ❌ Parent dashboard or detailed analytics
- ❌ Shapes, geometry, or spatial reasoning problems
- ❌ Sound effects or background music
- ❌ Time-telling problems
- ❌ Money/currency problems
- ❌ Word problems
- ❌ Mobile native apps (browser-based only)
- ❌ Accessibility features (screen readers, keyboard navigation)
- ❌ Multiple language support
- ❌ Printable worksheets or reports
- ❌ Manual difficulty settings (fully adaptive)

## Additional Context

**Target Age Group:**
Primary focus on ages 5-8 (kindergarten through 2nd grade), with math problems appropriate for this developmental stage.

**Visual Design:**
- **Color Palette:** Bright pastels (soft pinks, blues, yellows, greens, purples)
- **Typography:** Large, friendly, easy-to-read fonts
- **Spacing:** Generous whitespace, not cluttered
- **Animations:** Bouncy, playful, never startling

**Emotional Design:**
- Celebrations should feel earned but not exclusive (party poppers for truly excellent work)
- Gentle encouragement for mistakes ("Try again!" with a supportive animal reaction)
- No negative language, no "wrong" or "failed" messaging
- Progression visual keeps kids motivated toward the session goal

**Math Pedagogy:**
- Problems should build foundational number sense
- Variety prevents boredom (mix problem types within session)
- Adaptive difficulty ensures "just right" challenge level
- Quick feedback loop (immediate response after answer)

**Future Enhancements (Tracked Separately):**
- Progress tracking dashboard for parents/teachers
- Sound effects and background music
- Time-telling problems
- Money/currency problems
- Configurable session length

---

*Generated with Clavix Planning Mode*
*Generated: 2025-02-01T18:45:00Z*
