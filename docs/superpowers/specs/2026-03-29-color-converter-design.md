# Color Converter - Comprehensive Design

**Date:** 2026-03-29  
**Status:** Approved for Implementation  
**Layout:** Two-Column Split (Workspace + Inspector)

## Overview

A comprehensive color tool for developers and designers that goes beyond simple conversion. Combines real-time color picking, harmony generation, accessibility checking, and multi-format code export in a two-column layout optimized for power users.

## Goals

- **Primary:** Convert colors between Hex, RGB, HSL, CMYK, HSB formats instantly
- **Secondary:** Generate harmonious color palettes, check accessibility, export code
- **Tertiary:** Pick colors from anywhere on screen, save color collections, build gradients

## User Stories

1. As a developer, I want to convert a hex color to RGB so I can use it in CSS
2. As a designer, I want to see complementary colors so I can build a cohesive palette
3. As a developer, I want to check if my text color has enough contrast so my app is accessible
4. As a developer, I want to export colors as CSS variables so I can copy-paste into my project
5. As a designer, I want to pick a color from an image so I can match my brand exactly

## Layout Architecture

```
┌─────────────────────────────────────────────────────┐
│  Tool Header (Title + Description)                 │
│  ────────────────────────────────────               │
├─────────────────────┬───────────────────────────────┤
│                     │                               │
│  LEFT COLUMN        │  RIGHT COLUMN (scrollable)   │
│  (Workspace)        │  (Inspector)                 │
│                     │                               │
│  ┌───────────────┐  │  ┌─────────────────────────┐ │
│  │ Eyedropper    │  │  │ Color Harmonies         │ │
│  │ + Picker      │  │  │ (Comp/Analog/Triadic)   │ │
│  ├───────────────┤  │  ├─────────────────────────┤ │
│  │ HSL Wheel +   │  │  │ Generated Palettes      │ │
│  │ Saturation    │  │  │ (Shades/Tints/Tones)    │ │
│  ├───────────────┤  │  ├─────────────────────────┤ │
│  │ Dual Preview  │  │  │ Accessibility (WCAG)    │ │
│  │ (light/dark)  │  │  │ + Colorblind Sim        │ │
│  ├───────────────┤  │  ├─────────────────────────┤ │
│  │ Input Fields  │  │  │ Gradient Builder        │ │
│  │ (Hex/RGB/HSL) │  │  ├─────────────────────────┤ │
│  ├───────────────┤  │  │ Code Export             │ │
│  │ Recent Colors │  │  │ (CSS/Swift/Android)     │ │
│  ├───────────────┤  │  └─────────────────────────┘ │
│  │ Collections   │  │                               │
│  └───────────────┘  │                               │
│                     │                               │
└─────────────────────┴───────────────────────────────┘
```

## Component Specifications

### Left Column: Workspace

#### 1. Eyedropper Tool

- **Button:** "Pick from Screen" with eyedropper icon
- **Icon:** Lucide `pipette` icon (angled dropper with bulb)
- **Behavior:**
  - Click activates native color picker mode
  - Cursor changes to crosshair with color preview
  - Works across all windows (Cmd+Tab to switch)
  - Click anywhere to pick color
  - Escape to cancel
- **Platform:** Requires Wails native API integration

#### 2. Color Picker

- **HSL Wheel:**
  - Conic gradient showing all hues
  - Click/drag to select hue
  - White selector dot with border
  - Size: 120px diameter
- **Saturation Box:**
  - Vertical gradient from full color to black
  - White horizontal line shows current brightness position
  - Click/drag to adjust value/brightness
  - Size: flexible width, same height as wheel

#### 3. Dual Color Previews with Editable Text Colors

- **Purpose:** Show background color with customizable text colors for instant contrast assessment
- **Layout:** Side by side, 50% width each
- **Left Preview (Dark Mode Context):**
  - Background: Main selected color
  - Default text: White (#FFFFFF)
  - Text input field below to change text color
  - Shows "Aa" sample text
- **Right Preview (Light Mode Context):**
  - Background: Main selected color
  - Default text: Black (#000000)
  - Text input field below to change text color
  - Shows "Aa" sample text
- **Why customizable text:** Users can test their specific brand text colors against the background
- **Text Color Inputs:**
  - Small hex input fields below each preview
  - Click to edit, accepts hex codes
  - Real-time update of contrast ratio display
  - Recent text colors dropdown (last 5 used)
- **Contrast Display:** Shows "X.XX:1" ratio below each preview
- **Size:** Previews 60px height, inputs below

#### 4. Input Fields

- **Formats Supported:** Hex, RGB, HSL, CMYK, HSB
- **Layout:** 2-column grid
- **Hex:** Full width with "#" prefix indicator
- **Styling:**
  - Monospace font (IBM Plex Mono)
  - Dark background (#27272a)
  - Subtle border
  - Real-time sync - changing one updates all others
- **Validation:** Show red border if invalid format

#### 5. Recent Colors

- **Grid:** 5 columns × 2 rows = 10 colors max
- **Size:** 32px × 32px swatches
- **Behavior:** Click to load color, "Clear All" button
- **Storage:** localStorage persistence
- **Label:** "Recent Colors" with clear button top-right

#### 6. Saved Collections

- **Purpose:** Save and organize named color palettes
- **Display:** List view with preview swatches
- **Each Collection:**
  - Name (e.g., "Brand Colors", "Dashboard Theme")
  - 4-color preview strip
  - Click to load entire collection
- **Actions:** "+ New" button to create collection

### Right Column: Inspector

#### 1. Color Harmonies

- **Types:** Complementary, Analogous, Triadic, Split-Complementary, Tetradic
- **UI:** Tab buttons for harmony type selection
- **Display:** 4 color tiles showing the harmony colors
- **Tile Content:**
  - Color preview (40px height)
  - Hex code below (9px font, centered)
- **Behavior:** Click any harmony color to select it as the main color

#### 2. Generated Palettes

- **Tabs:** Shades, Tints, Tones, Semantic
- **Shades:** Mix with black (10 levels: 50-900)
- **Tints:** Mix with white (10 levels: 50-900)
- **Tones:** Mix with gray (desaturated versions)
- **Semantic:** Auto-generate Primary, Secondary, Accent, Muted, Destructive
- **Display:** Horizontal gradient bar with labels below (50, 100, 200... 900)
- **Size:** 36px height bar, full width

#### 3. Accessibility (WCAG) with Custom Text Colors

- **Purpose:** Check if selected text color meets contrast requirements against the background
- **Text Colors:** Uses the customizable text colors from the Dual Previews section (not just white/black)
- **Checks:**
  - Text Color 1 on Main Background (e.g., white text on blue)
  - Text Color 2 on Main Background (e.g., black text on blue)
- **Each Check Shows:**
  - Mini preview (50×36px box with "Aa" text using the actual selected text color)
  - Label showing which text color is being tested
  - Contrast ratio (e.g., "4.56:1")
  - Pass badge: AAA ✓ (green) or AA Large ✓ (yellow)
- **Badges:**
  - Green (#22c55e): Passes AAA
  - Yellow (#eab308): Passes AA only
  - Red (#ef4444): Fails AA
- **Real-time:** Updates instantly when text color changes
  - Red (#ef4444): Fails AA
- **Colorblind Simulation:**
  - Dropdown: Normal, Protanopia, Deuteranopia, Tritanopia
  - Shows how colorblind users perceive the color

#### 4. Gradient Builder

- **Gradient Types:** Linear, Radial, Conic
- **UI:**
  - Type toggle buttons
  - Gradient preview bar (50px height)
  - Color stops (draggable dots)
  - Add/remove stop buttons
- **Default:** 2-stop linear gradient using current color + complementary
- **Export:** CSS code with vendor prefixes

#### 5. Code Export

- **Languages:** CSS, Tailwind, Swift, Android, React, JSON
- **UI:** Language toggle buttons + copyable code block
- **CSS Export Example:**
  ```css
  --color-primary: #3b82f6;
  --color-primary-rgb: 59, 130, 246;
  --color-primary-hsl: 217, 91%, 60%;
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  ```
- **Block Style:**
  - Dark background (#0c0c0c)
  - Syntax highlighting (keys gray, values colored)
  - Monospace font
  - Horizontal scroll if needed

## Color Format Support

| Format  | Input | Output | Example          |
| ------- | ----- | ------ | ---------------- |
| Hex     | ✓     | ✓      | #3B82F6          |
| RGB     | ✓     | ✓      | 59, 130, 246     |
| HSL     | ✓     | ✓      | 217°, 91%, 60%   |
| CMYK    | ✓     | ✓      | 76%, 47%, 0%, 4% |
| HSB/HSV | ✓     | ✓      | 217°, 76%, 96%   |

## Real-Time Features

- **Sync:** All input fields update instantly when any value changes
- **Preview:** Color wheel and saturation box update immediately
- **Harmonies:** Recalculate when base color changes
- **Palettes:** Regenerate instantly
- **Accessibility:** Contrast ratios update in real-time
- **Code:** Export block updates automatically

## Hex Code Interactions (Global Pattern)

All hex code displays throughout the tool follow this interaction pattern:

- **Click to Copy:** Clicking any hex code copies it to clipboard
- **Hover Effect:** On hover, hex code gets:
  - Background highlight (slightly lighter, e.g., rgba(255,255,255,0.05))
  - Cursor changes to `pointer`
  - Optional: subtle scale transform (1.02)
- **Tooltip:** Shows "Click to copy" on hover
- **Success Feedback:** Brief visual confirmation when copied (e.g., checkmark icon appears, text color changes to green momentarily)
- **Applies To:**
  - Main color input fields
  - Harmony color tiles
  - Generated palette labels
  - Recent color tooltips
  - Collection preview swatches
  - Code export values

## Accessibility Requirements

- **Keyboard Navigation:** All controls accessible via keyboard
- **Screen Reader:** Color values announced with context
- **Colorblind Friendly:** Icons + labels, not just color
- **Contrast:** Tool itself meets WCAG AA standards

## Data Persistence

- **Recent Colors:** localStorage (max 10)
- **Collections:** localStorage (unlimited)
- **Format:** JSON array of objects

## Technical Implementation Notes

### Color Conversions

- Use established color conversion algorithms
- Handle edge cases (grayscale, pure colors)
- Precision: Round to whole numbers for display

### Eyedropper Integration

- Requires Wails `Window.GetColorAt(x, y)` or similar native API
- May need platform-specific implementation (macOS color picker, Windows magnifier, Linux xcolor)
- Graceful fallback if native API unavailable

### Performance

- Debounce input updates (150ms)
- Use useMemo for expensive calculations (harmonies, palettes)
- Lazy load colorblind simulation

## Default State

- **Initial Color:** #3B82F6 (bright blue)
- **Active Tab:** Analogous harmonies
- **Active Palette:** Tints
- **Code Language:** CSS
- **Recent Colors:** Empty or show sample colors
- **Collections:** Empty (user creates)

## Success Metrics

- User can convert between any 2 formats in < 2 seconds
- User can check contrast ratio in < 3 seconds
- User can export code in < 2 clicks
- Color picker feels responsive (< 100ms lag)

## Out of Scope (for now)

- Image color extraction (upload image, pick from it)
- Palette import from Coolors/Adobe
- Share palettes via URL
- AI color recommendations
- Print color matching (CMYK profiles)

## Files to Modify

- `/frontend/src/pages/ColorConverter/index.jsx` - Main implementation
- `/frontend/src/services/colorService.js` - Color conversion utilities (new)
- May need backend Wails integration for eyedropper

## Design Decisions

1. **Why two-column?** Power users want to see everything at once without clicking through tabs
2. **Why dual previews?** Instant contrast assessment without mental math
3. **Why saturation box instead of sliders?** More intuitive visual control
4. **Why 10 recent colors?** Balance between usefulness and space
5. **Why show both AAA and AA?** Different projects have different requirements
