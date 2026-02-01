# Generate Images with Nano Banana

Generate high-quality images using Gemini CLI with the Nano Banana extension. This skill provides commands and workflows for text-to-image generation, image editing, restoration, and specialized image types.

## Prerequisites

- **Gemini CLI** installed with nano banana extension
- **API key** set: `export GEMINI_API_KEY="your-api-key-here"`
- Get free key from: https://makersuite.google.com/app/apikey

## Installation

```bash
# Install Gemini CLI extension
gemini extensions install https://github.com/gemini-cli-extensions/nanobanana

# Verify installation
gemini --list-extensions
```

## Basic Commands

### Text-to-Image Generation

Generate images from text descriptions:

```bash
# Single image
gemini -y -p "/generate \"your image description here\""

# Multiple variations
gemini -y -p "/generate \"your description\" --count=3"

# With specific style
gemini -y -p "/generate \"your description\" --styles=\"watercolor,oil-painting\""

# With variations
gemini -y -p "/generate \"your description\" --variations=\"lighting,mood\" --count=4"
```

### Image Editing

Edit existing images with natural language:

```bash
gemini -y -p "/edit input.png \"describe the changes you want\""

# Examples:
gemini -y -p "/edit photo.jpg \"add sunglasses to the person\""
gemini -y -p "/edit portrait.png \"change background to a beach scene\""
```

### Image Restoration

Restore and enhance old or damaged photos:

```bash
gemini -y -p "/restore old_photo.jpg \"remove scratches and improve clarity\""
gemini -y -p "/restore damaged.png \"enhance colors and fix tears\""
```

## Specialized Image Types

### App Icons

Generate app icons, favicons, and UI elements:

```bash
# Multiple sizes
gemini -y -p "/icon \"your icon description\" --sizes=\"64,128,256,512\" --type=\"app-icon\" --corners=\"rounded\""

# Favicon set
gemini -y -p "/icon \"your logo\" --type=\"favicon\" --sizes=\"16,32,64\""

# UI elements
gemini -y -p "/icon \"settings gear\" --type=\"ui-element\" --style=\"minimal\""
```

**Icon Options:**
- `--sizes="16,32,64,128,256,512,1024"` - Sizes in pixels
- `--type="app-icon|favicon|ui-element"` - Icon type
- `--style="flat|skeuomorphic|minimal|modern"` - Visual style
- `--format="png|jpeg"` - Output format
- `--background="transparent|white|black|color"` - Background
- `--corners="rounded|sharp"` - Corner style

### Patterns & Textures

Create seamless patterns and textures:

```bash
# Seamless pattern
gemini -y -p "/pattern \"geometric hexagons\" --type=\"seamless\" --density=\"sparse\""

# Texture
gemini -y -p "/pattern \"wood grain\" --type=\"texture\" --style=\"tech\""

# Wallpaper
gemini -y -p "/pattern \"floral design\" --type=\"wallpaper\" --colors=\"colorful\""
```

**Pattern Options:**
- `--size="128x128|256x256|512x512"` - Pattern tile size
- `--type="seamless|texture|wallpaper"` - Pattern type
- `--style="geometric|organic|abstract|floral|tech"` - Style
- `--density="sparse|medium|dense"` - Element density
- `--colors="mono|duotone|colorful"` - Color scheme
- `--repeat="tile|mirror"` - Tiling method

### Visual Stories

Generate sequential images for stories or processes:

```bash
# Story sequence
gemini -y -p "/story \"seed growing into tree\" --steps=4 --type=\"process\""

# Tutorial
gemini -y -p "/story \"how to make coffee\" --steps=6 --type=\"tutorial\""

# Timeline
gemini -y -p "/story \"evolution of design\" --steps=5 --type=\"timeline\""
```

**Story Options:**
- `--steps=N` - Number of sequential images (2-8)
- `--type="story|process|tutorial|timeline"` - Sequence type
- `--style="consistent|evolving"` - Visual consistency
- `--layout="separate|grid|comic"` - Output layout
- `--transition="smooth|dramatic|fade"` - Transition style

### Technical Diagrams

Generate flowcharts, architecture diagrams, and mockups:

```bash
# Flowchart
gemini -y -p "/diagram \"user login process\" --type=\"flowchart\" --style=\"professional\""

# Architecture
gemini -y -p "/diagram \"microservices setup\" --type=\"architecture\" --complexity=\"detailed\""

# Database schema
gemini -y -p "/diagram \"e-commerce database\" --type=\"database\""
```

**Diagram Options:**
- `--type="flowchart|architecture|network|database|wireframe|mindmap|sequence"` - Diagram type
- `--style="professional|clean|hand-drawn|technical"` - Visual style
- `--layout="horizontal|vertical|hierarchical|circular"` - Layout
- `--complexity="simple|detailed|comprehensive"` - Detail level
- `--colors="mono|accent|categorical"` - Color scheme
- `--annotations="minimal|detailed"` - Label level

## Advanced Generation Options

### Available Styles

Use with `--styles` parameter:
- `photorealistic` - Photographic quality
- `watercolor` - Watercolor painting
- `sketch` - Hand-drawn sketch
- `pixel-art` - Retro pixel art
- `anime` - Anime/manga style
- `vintage` - Vintage/retro aesthetic
- `modern` - Contemporary style
- `abstract` - Abstract art
- `minimalist` - Clean, minimal design
- `oil-painting` - Oil painting technique

### Available Variations

Use with `--variations` parameter:
- `lighting` - Different lighting (dramatic, soft)
- `angle` - Various angles (above, close-up)
- `color-palette` - Different colors (warm, cool)
- `composition` - Different layouts (centered, rule-of-thirds)
- `mood` - Emotional tones (cheerful, dramatic)
- `season` - Different seasons (spring, winter)
- `time-of-day` - Different times (sunrise, sunset)

### Generation Examples

```bash
# Style variations
gemini -y -p "/generate \"mountain landscape\" --styles=\"watercolor,photorealistic,minimalist\""

# Multiple variations
gemini -y -p "/generate \"coffee shop\" --variations=\"lighting,mood\" --count=4"

# Combined options
gemini -y -p "/generate \"robot character\" --styles=\"anime,minimalist\" --variations=\"color-palette\""
```

## File Management

### Output Location

Generated images are saved to `./nanobanana-output/` directory by default.

### File Search (for editing/restoration)

The extension searches for input images in:
1. Current working directory
2. `./images/`
3. `./input/`
4. `./nanobanana-output/`
5. `~/Downloads/`
6. `~/Desktop/`

### Filename Generation

Images are auto-named based on prompts:
- `"sunset over mountains"` → `sunset_over_mountains.png`
- Duplicates get counters: `sunset_over_mountains_1.png`

## Model Selection

Two models available:
- `gemini-2.5-flash-image` (default)
- `gemini-3-pro-image-preview` (Nano Banana Pro)

To use Pro model:
```bash
export NANOBANANA_MODEL=gemini-3-pro-image-preview
```

## Common Workflows

### Character/Mascot Generation

Generate consistent character designs:

```bash
# Define your character
gemini -y -p "/generate \"cute friendly [animal/character], happy expression, simple flat design, pastel [color] colors, white background, kawaii mascot style, centered, front facing, 512x512\""

# Generate variations
gemini -y -p "/generate \"same character, different emotion: excited\" --styles=\"consistent\""
gemini -y -p "/generate \"same character, different emotion: sleeping\" --styles=\"consistent\""
```

### Icon Set Creation

Create complete icon sets:

```bash
# App icon in all sizes
gemini -y -p "/icon \"[your app description]\" --sizes=\"64,128,256,512,1024\" --type=\"app-icon\" --corners=\"rounded\""

# UI icon set
for icon in "home" "settings" "profile" "search"; do
  gemini -y -p "/icon \"$icon icon\" --type=\"ui-element\" --style=\"minimal\" --sizes=\"24,32,48\""
done
```

### Brand Asset Package

Generate complete brand visuals:

```bash
# Logo variations
gemini -y -p "/generate \"[company] logo, modern professional\" --count=5"

# Brand pattern
gemini -y -p "/pattern \"[brand theme]\" --type=\"seamless\" --colors=\"duotone\""

# Icons
gemini -y -p "/icon \"[brand] app icon\" --sizes=\"64,128,256,512\""
```

### Batch Generation Script

Create a script for multiple images:

```bash
#!/bin/bash

IMAGES=(
  "landscape:peaceful mountain scene, sunset, photorealistic"
  "portrait:friendly person smiling, professional headshot"
  "abstract:colorful geometric shapes, modern art"
)

for item in "${IMAGES[@]}"; do
  name="${item%%:*}"
  prompt="${item#*:}"
  gemini -y -p "/generate \"$prompt\""
  # Move latest file
  mv nanobanana-output/$(ls -t nanobanana-output | head -1) "${name}.png"
done
```

## Tips & Best Practices

### Prompt Engineering

**Be Specific:**
```bash
# Vague
"a dog"

# Better
"golden retriever puppy, sitting, happy expression, studio photography, white background, 4K quality"
```

**Include Key Elements:**
- Subject/object
- Style (photorealistic, cartoon, etc.)
- Colors/palette
- Background
- Mood/emotion
- Composition (centered, close-up, etc.)
- Quality/detail level

### Image Quality

- Use `512x512` or `1024x1024` for high quality
- Specify "4K", "high detail", "sharp" for clarity
- Mention "professional" or "studio" for polished results

### Consistency Across Images

For matching visual style:
- Use identical style keywords
- Reference specific art movements
- Maintain color palette descriptions
- Use `--styles="consistent"` flag

### Performance

- Each image takes 20-60 seconds
- Use `-y` (yolo mode) to skip confirmations
- Generate in parallel for multiple images
- Consider batch scripts for large sets

## Troubleshooting

### Authentication Issues

**"No valid API key found"**
```bash
# Set API key
export GEMINI_API_KEY="your-key"

# Verify
echo $GEMINI_API_KEY

# Make permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export GEMINI_API_KEY="your-key"' >> ~/.bashrc
```

### Generation Issues

**"Command times out"**
- Normal for image generation (takes time)
- Use longer timeout: increase wait time
- Be patient, AI is working!

**"Can't find generated image"**
- Check `./nanobanana-output/` directory
- Look at terminal output for exact path
- Check current working directory

**"Image quality is poor"**
- Add "high quality", "4K", "detailed" to prompt
- Increase size specification
- Use more descriptive prompts
- Try Pro model: `export NANOBANANA_MODEL=gemini-3-pro-image-preview`

**"Style not matching"**
- Be more specific with style keywords
- Use `--styles` parameter
- Reference specific artists/movements (if allowed)
- Use consistent terminology across prompts

### File Management

**"Output directory cluttered"**
```bash
# Organize by type
mkdir -p output/{icons,patterns,characters,diagrams}

# Move files after generation
mv nanobanana-output/*.png output/icons/
```

**"Need to rename files"**
```bash
# Batch rename
cd nanobanana-output
count=1
for file in *.png; do
  mv "$file" "image_$count.png"
  ((count++))
done
```

## Integration Patterns

### Web Applications

```html
<!-- Use generated images -->
<img src="/assets/generated/character.png" alt="Character">
<div style="background-image: url('/assets/generated/pattern.png')">
  Content here
</div>
```

### React/Vue/Angular

```javascript
// Import generated assets
import logo from './assets/generated/logo.png'
import pattern from './assets/generated/background.png'

// Use in components
<img src={logo} alt="Logo" />
<div style={{ backgroundImage: `url(${pattern})` }}>
  Content
</div>
```

### Mobile Apps

```javascript
// React Native
import { Image } from 'react-native'

<Image source={require('./assets/generated/icon.png')} />
```

### Image Optimization

After generation, optimize for web:

```bash
# Using ImageMagick
convert input.png -quality 85 -strip output.png

# Batch optimize
for img in *.png; do
  convert "$img" -quality 85 -strip "optimized/$img"
done
```

## Command Reference

| Command | Purpose | Example |
|---------|---------|---------|
| `/generate` | Text-to-image | `"/generate \"description\""` |
| `/edit` | Edit images | `"/edit file.png \"changes\""` |
| `/restore` | Restore photos | `"/restore old.jpg \"fix\""` |
| `/icon` | Generate icons | `"/icon \"desc\" --sizes=\"64,128\""` |
| `/pattern` | Create patterns | `"/pattern \"design\" --type=\"seamless\""` |
| `/story` | Sequential images | `"/story \"process\" --steps=4"` |
| `/diagram` | Technical diagrams | `"/diagram \"flow\" --type=\"flowchart\""` |
| `/nanobanana` | Natural language | `"/nanobanana create a logo"` |

## Quick Examples

```bash
# Logo
gemini -y -p "/generate \"modern tech startup logo, minimalist, blue and white, vector style\""

# Product photo
gemini -y -p "/generate \"coffee mug on wooden table, morning light, product photography, high quality\""

# UI mockup
gemini -y -p "/diagram \"mobile app login screen\" --type=\"wireframe\" --style=\"clean\""

# Background
gemini -y -p "/pattern \"subtle dots and lines\" --type=\"seamless\" --colors=\"mono\" --density=\"sparse\""

# Character sheet
gemini -y -p "/generate \"cartoon fox character, 3 expressions: happy, sad, excited, character sheet style\""

# Icon set
gemini -y -p "/icon \"weather icons set\" --type=\"ui-element\" --style=\"minimal\""
```

## Resources

- [Nano Banana GitHub](https://github.com/gemini-cli-extensions/nanobanana)
- [Gemini CLI Documentation](https://github.com/google-gemini/gemini-cli)
- [Google AI Studio](https://makersuite.google.com/app/apikey) - Get API key
- [Gemini API Docs](https://ai.google.dev/docs)

## Notes

- Images generated are for use according to Gemini's terms of service
- Always review generated content before use
- Consider licensing and usage rights for your specific use case
- Pro model may have different capabilities and limits
- Generation times and quality may vary
