#!/usr/bin/env bash
# Fix vue/require-default-prop warnings by adding default: undefined to optional props

set -e

# Files and their prop line numbers that need defaults
declare -A files_props=(
  ["libs/shared/ui/src/components/features/hero/Hero.vue"]="27 28 30"
  ["libs/shared/ui/src/components/layout/Header.vue"]="54 57"
  ["libs/shared/ui/src/components/ui/avatar/Avatar.vue"]="8"
  ["libs/shared/ui/src/components/ui/button/Button.vue"]="8 9 10 13"
  ["libs/shared/ui/src/components/ui/carousel/Carousel.vue"]="15"
  ["libs/shared/ui/src/components/ui/command/Command.vue"]="12"
  ["libs/shared/ui/src/components/ui/dropdown-menu/DropdownMenuContent.vue"]="13"
  ["libs/shared/ui/src/components/ui/heading/Heading.vue"]="6"
  ["libs/shared/ui/src/components/ui/logo/Logo.vue"]="5"
  ["libs/shared/ui/src/components/ui/select/Select.vue"]="20"
  ["libs/shared/ui/src/components/ui/select/SelectItem.vue"]="13"
  ["libs/shared/ui/src/components/ui/slider/Slider.vue"]="12"
  ["libs/shared/ui/src/components/ui/tooltip/TooltipContent.vue"]="17"
)

echo "Adding default: undefined to Vue props..."

for file in "${!files_props[@]}"; do
  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi
  
  # For each prop line, add ", default: undefined" if it doesn't have "default:" already
  for line_num in ${files_props[$file]}; do
    # Check if line already has "default:"
    if sed -n "${line_num}p" "$file" | grep -q "default:"; then
      echo "⏭  Line $line_num in $file already has default"
      continue
    fi
    
    # Add ", default: undefined" before the closing },
    sed -i "" "${line_num}s/,$/& default: undefined,/" "$file"
    echo "✓ Added default to line $line_num in $file"
  done
done

echo "✅ Done!"
