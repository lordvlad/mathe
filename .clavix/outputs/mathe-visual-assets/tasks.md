# Implementation Plan: Math Game Visual Asset Generation

**Project**: mathe-visual-assets  
**Generated**: 2026-02-01T12:00:00Z

## Technical Context & Standards

**Detected Stack & Patterns:**
- **Framework**: React 19 + Bun runtime
- **Styling**: CSS Modules (component-scoped)
- **State**: Zustand (stores in /src/store)
- **Animations**: Framer Motion
- **Current Assets**: Emoji-based (🐰🐻🦊🐶🐱🐼🐨🦁)
- **File Structure**: `/src/assets/` directory exists but empty
- **Conventions**: TypeScript strict mode, CSS Modules for styling

**Asset Generation Tool:**
- **Tool**: Gemini CLI with nano banana extension
- **Model**: gemini-2.5-flash-image (default)
- **Commands**: `/generate`, `/icon`, `/pattern` available
- **Output**: `./nanobanana-output/` directory

**Asset Requirements:**
- **Style**: Playful hand-drawn aesthetic for 5-8 year olds
- **Format**: Mixed (SVG for icons/UI, PNG for detailed illustrations)
- **Animals**: 8 companions (rabbit, bear, fox, dog, cat, panda, koala, lion)
- **Treats**: Various emoji treats (🍦, 🍫, 🍬, etc.)

---

## Phase 1: Asset Directory Structure Setup

- [x] **Create organized asset directory structure** (ref: File Organization)
  Task ID: phase-1-setup-01
  > **Implementation**: Create directories in `src/assets/`
  > **Details**: 
  > - `src/assets/animals/` - Animal character illustrations
  > - `src/assets/backgrounds/` - Scene backgrounds
  > - `src/assets/treats/` - Treat illustrations
  > - `src/assets/ui/` - UI elements and icons
  > - `src/assets/patterns/` - Background patterns
  > - `src/assets/celebrations/` - Party/celebration graphics

---

## Phase 2: Animal Character Asset Generation

- [ ] **Generate rabbit character set** (ref: Animal Companions)
  Task ID: phase-2-animals-01
  > **Implementation**: Use Gemini CLI `/generate` command with variations
  > **Details**:
  > ```bash
  > gemini
  > /generate "cute playful hand-drawn rabbit character for kids math game, friendly expression, simple rounded shapes, bright colors, full body, front view" --styles="hand-drawn" --count=3 --preview
  > ```
  > - Generate 3 variations to choose best one
  > - Save to `nanobanana-output/` then move selected to `src/assets/animals/rabbit.png`

- [ ] **Generate bear character set** (ref: Animal Companions)
  Task ID: phase-2-animals-02
  > **Implementation**: Use Gemini CLI `/generate` command
  > **Details**:
  > ```bash
  > gemini
  > /generate "cute playful hand-drawn bear character for kids math game, friendly expression, simple rounded shapes, bright colors, full body, front view" --styles="hand-drawn" --count=3 --preview
  > ```

- [ ] **Generate fox character set** (ref: Animal Companions)
  Task ID: phase-2-animals-03
  > **Implementation**: Use Gemini CLI `/generate` command
  > **Details**: Same pattern as above, substitute "fox" for animal type

- [ ] **Generate dog character set** (ref: Animal Companions)
  Task ID: phase-2-animals-04
  > **Implementation**: Use Gemini CLI `/generate` command
  > **Details**: Same pattern, "dog" character

- [ ] **Generate cat character set** (ref: Animal Companions)
  Task ID: phase-2-animals-05
  > **Implementation**: Use Gemini CLI `/generate` command
  > **Details**: Same pattern, "cat" character

- [ ] **Generate panda character set** (ref: Animal Companions)
  Task ID: phase-2-animals-06
  > **Implementation**: Use Gemini CLI `/generate` command
  > **Details**: Same pattern, "panda" character

- [ ] **Generate koala character set** (ref: Animal Companions)
  Task ID: phase-2-animals-07
  > **Implementation**: Use Gemini CLI `/generate` command
  > **Details**: Same pattern, "koala" character

- [ ] **Generate lion character set** (ref: Animal Companions)
  Task ID: phase-2-animals-08
  > **Implementation**: Use Gemini CLI `/generate` command
  > **Details**: Same pattern, "lion" character

---

## Phase 3: Treat & Food Asset Generation

- [ ] **Generate ice cream cone illustration** (ref: Session Goals)
  Task ID: phase-3-treats-01
  > **Implementation**: Use Gemini CLI `/generate` for treat assets
  > **Details**:
  > ```bash
  > gemini
  > /generate "playful hand-drawn ice cream cone, colorful, simple shapes, suitable for kids game, transparent background" --count=2 --preview
  > ```
  > - Save to `src/assets/treats/ice-cream.png`

- [ ] **Generate chocolate bar illustration** (ref: Session Goals)
  Task ID: phase-3-treats-02
  > **Implementation**: Generate chocolate treat
  > **Details**: Similar to ice cream, substitute "chocolate bar" in prompt

- [ ] **Generate candy/lollipop illustration** (ref: Session Goals)
  Task ID: phase-3-treats-03
  > **Implementation**: Generate candy treat
  > **Details**: "colorful lollipop or candy" in prompt

- [ ] **Generate cookie illustration** (ref: Session Goals)
  Task ID: phase-3-treats-04
  > **Implementation**: Generate cookie treat
  > **Details**: "chocolate chip cookie" in prompt

- [ ] **Generate cupcake illustration** (ref: Session Goals)
  Task ID: phase-3-treats-05
  > **Implementation**: Generate cupcake treat
  > **Details**: "colorful cupcake with frosting" in prompt

---

## Phase 4: UI Elements & Icons Generation

- [ ] **Generate celebration/party graphics** (ref: Feedback System)
  Task ID: phase-4-ui-01
  > **Implementation**: Use `/icon` command for UI elements
  > **Details**:
  > ```bash
  > gemini
  > /icon "party popper celebration confetti sparkles" --type="ui-element" --sizes="64,128" --background="transparent" --style="playful"
  > ```
  > - For correct answer celebrations
  > - Save to `src/assets/ui/celebration.png`

- [ ] **Generate encouraging/motivation graphics** (ref: Feedback System)
  Task ID: phase-4-ui-02
  > **Implementation**: Generate motivational icon
  > **Details**: "thumbs up encouraging star" UI element, similar sizes

- [ ] **Generate progress bar track elements** (ref: Progress Visualization)
  Task ID: phase-4-ui-03
  > **Implementation**: Generate progress path/track
  > **Details**:
  > ```bash
  > gemini
  > /pattern "playful winding path or dotted trail for progress tracking" --type="seamless" --style="hand-drawn" --size="256x64" --colors="colorful"
  > ```

- [ ] **Generate button graphics** (ref: UI Components)
  Task ID: phase-4-ui-04
  > **Implementation**: Generate button background elements
  > **Details**: "playful rounded button shape hand-drawn style" --sizes="128,256"

---

## Phase 5: Background & Scene Generation

- [ ] **Generate welcome screen background** (ref: WelcomeScreen Component)
  Task ID: phase-5-backgrounds-01
  > **Implementation**: Use `/pattern` for background
  > **Details**:
  > ```bash
  > gemini
  > /pattern "subtle playful math-themed background with numbers stars shapes" --type="wallpaper" --style="hand-drawn" --density="sparse" --colors="pastel"
  > ```
  > - Save to `src/assets/backgrounds/welcome-bg.png`

- [ ] **Generate game screen background** (ref: Game Component)
  Task ID: phase-5-backgrounds-02
  > **Implementation**: Generate gameplay background
  > **Details**: "soft clouds or nature scene hand-drawn style" suitable for children

- [ ] **Generate completion celebration background** (ref: SessionComplete Component)
  Task ID: phase-5-backgrounds-03
  > **Implementation**: Generate victory screen background
  > **Details**: "celebratory background with confetti and stars" bright and cheerful

---

## Phase 6: Animal Emotion Variations (Optional Enhancement)

- [ ] **Generate "happy" emotion variations for each animal** (ref: AnimalEmotion Type)
  Task ID: phase-6-emotions-01
  > **Implementation**: Create emotional state variants
  > **Details**: For each animal, generate:
  > - Happy expression (default)
  > - Celebrating expression (jumping, arms up)
  > - Encouraging expression (supportive pose)
  > - Save as `{animal}-happy.png`, `{animal}-celebrating.png`, `{animal}-encouraging.png`

---

## Phase 7: Asset Organization & File Management

- [ ] **Review and curate generated assets** (ref: Asset Quality)
  Task ID: phase-7-organize-01
  > **Implementation**: Manual review of all generated images
  > **Details**:
  > - Check each asset meets quality standards
  > - Ensure consistent art style across all assets
  > - Verify transparent backgrounds where needed
  > - Select best variations from multiple generations

- [ ] **Move selected assets to src/assets/** (ref: File Structure)
  Task ID: phase-7-organize-02
  > **Implementation**: Organize files from `nanobanana-output/` to proper directories
  > **Details**:
  > ```bash
  > # Move files to organized structure
  > cp nanobanana-output/rabbit*.png src/assets/animals/rabbit.png
  > # Repeat for all assets in their respective folders
  > ```

- [ ] **Create asset index/manifest** (ref: Asset Management)
  Task ID: phase-7-organize-03
  > **Implementation**: Create `src/assets/index.ts` TypeScript file
  > **Details**:
  > ```typescript
  > // Asset imports and exports for easy consumption
  > export const animalAssets = {
  >   rabbit: require('./animals/rabbit.png'),
  >   bear: require('./animals/bear.png'),
  >   // ... etc
  > };
  > ```

---

*Generated by Clavix /clavix-plan*
