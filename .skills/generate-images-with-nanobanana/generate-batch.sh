#!/bin/bash

# Batch image generation script using Nano Banana
# Usage: bash .skills/generate-images-with-nanobanana/generate-batch.sh <config-file>

CONFIG_FILE=${1:-image-config.txt}

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Creating example config file: $CONFIG_FILE"
    cat > "$CONFIG_FILE" << 'EOF'
# Image generation configuration
# Format: filename:prompt
# Lines starting with # are comments

# Example images:
logo:modern tech startup logo, minimalist, blue and white, vector style
background:subtle geometric pattern, seamless, light colors, professional
icon:app icon with rocket ship, colorful, rounded corners, modern style
character:cute friendly robot, happy expression, kawaii style, pastel colors

# Icons with sizes (use /icon command):
# app-icons:/icon "productivity app" --sizes="64,128,256,512" --type="app-icon"

# Patterns (use /pattern command):
# texture:/pattern "wood grain" --type="texture" --colors="mono"
EOF
    echo "Example config created. Edit $CONFIG_FILE and run again."
    exit 0
fi

echo "Starting batch image generation..."
echo "Reading from: $CONFIG_FILE"
echo ""

# Create output directory
mkdir -p generated-images

line_num=0
while IFS=: read -r filename prompt || [ -n "$filename" ]; do
    ((line_num++))
    
    # Skip empty lines and comments
    [[ -z "$filename" || "$filename" =~ ^[[:space:]]*# ]] && continue
    
    # Trim whitespace
    filename=$(echo "$filename" | xargs)
    prompt=$(echo "$prompt" | xargs)
    
    echo "[$line_num] Generating: $filename"
    echo "    Prompt: $prompt"
    
    # Check if prompt starts with /icon, /pattern, etc.
    if [[ "$prompt" =~ ^/ ]]; then
        # Use the command as-is
        gemini -y -p "$prompt"
    else
        # Regular generate command
        gemini -y -p "/generate \"$prompt\""
    fi
    
    # Find the latest generated file
    if [ -d "nanobanana-output" ]; then
        latest_file=$(ls -t nanobanana-output/*.png 2>/dev/null | head -1)
        if [ -n "$latest_file" ]; then
            mv "$latest_file" "generated-images/${filename}.png"
            echo "    ✓ Saved as: generated-images/${filename}.png"
        else
            echo "    ⚠ No image file found"
        fi
    fi
    
    echo ""
    sleep 1  # Small delay between requests
done < "$CONFIG_FILE"

echo "Batch generation complete!"
echo "Images saved to: generated-images/"
ls -lh generated-images/
