# Generate Images with Nano Banana Skill

Universal skill for generating high-quality images using Gemini CLI with the Nano Banana extension. Supports text-to-image, image editing, restoration, icons, patterns, diagrams, and more.

## Quick Start

### 1. Set up API key (one time)
```bash
export GEMINI_API_KEY="your-api-key-here"
# Get free key: https://makersuite.google.com/app/apikey
```

### 2. Generate an image
```bash
gemini -y -p "/generate \"your image description here\""
```

### 3. Use helper script
```bash
bash .skills/generate-images-with-nanobanana/generate-batch.sh
```

## What This Skill Provides

### Image Types
- **Text-to-Image** - Generate any image from text
- **Icons** - App icons, favicons, UI elements (multiple sizes)
- **Patterns** - Seamless patterns and textures
- **Characters** - Consistent character/mascot designs
- **Diagrams** - Flowcharts, architecture, wireframes
- **Stories** - Sequential image sets
- **Editing** - Modify existing images
- **Restoration** - Restore old/damaged photos

### Commands
- `/generate` - Basic text-to-image
- `/icon` - Generate icons with sizes
- `/pattern` - Create seamless patterns
- `/story` - Sequential images
- `/diagram` - Technical diagrams
- `/edit` - Edit existing images
- `/restore` - Restore photos

## Files

- `SKILL.md` - Complete documentation with all commands and examples
- `generate-batch.sh` - Helper script for batch generation
- `README.md` - This file

## Common Use Cases

### Generate App Icons
```bash
gemini -y -p "/icon \"your app description\" --sizes=\"64,128,256,512\" --type=\"app-icon\""
```

### Create Character/Mascot
```bash
gemini -y -p "/generate \"cute friendly [character], happy expression, simple flat design, pastel colors, white background, kawaii style, 512x512\""
```

### Make Background Pattern
```bash
gemini -y -p "/pattern \"subtle geometric design\" --type=\"seamless\" --density=\"sparse\""
```

### Generate Logo
```bash
gemini -y -p "/generate \"modern [company] logo, minimalist, professional, vector style\""
```

## Output

Generated images appear in `./nanobanana-output/` directory.

Files are auto-named based on prompts, e.g.:
- `"sunset mountains"` → `sunset_mountains.png`

## Tips

- Each image takes 20-60 seconds
- Use `-y` flag for auto-approval
- Be specific in prompts for best results
- Specify size, style, colors for consistency
- See `SKILL.md` for comprehensive guide

## Usage with AI Agents

AI agents can invoke this skill to generate images for any project:

```
Generate app icons for my project
Create a logo for my brand
Make a background pattern for my website
Generate character sprites for my game
```

The skill provides all necessary commands and workflows.

## Resources

- Full documentation: `SKILL.md`
- [Nano Banana GitHub](https://github.com/gemini-cli-extensions/nanobanana)
- [API Key Setup](https://makersuite.google.com/app/apikey)
