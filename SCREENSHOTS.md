# Gaya UI Preview & Samples

## 🎨 Visual Overview

This document provides detailed descriptions of the Gaya interface. The app features a bold **retro 90s aesthetic** with square corners, heavy borders, and a vibrant color palette.

---

## 🌈 Color Palette Reference

```
Charcoal Background    #1a1a2e  ■ Main background
Purple Header          #2d1b4e  ■ Header sections
Medium Purple Cards    #2a2247  ■ Content cards
Cobalt Blue           #2244d4  ■ Primary actions
Amber Gold            #fbbf24  ■ Highlights & accents
Bright Indigo         #b5c5ff  ■ Text & secondary elements
Off-white             #f8fafc  ■ Primary text
Muted Blue            #7a8aaa  ■ Inactive/secondary text
```

---

## 📱 Screen Layouts

### 1️⃣ Home Screen

**Visual Layout:**
```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃    CHER'S WARDROBE            ┃ ← Purple header (#2d1b4e)
┃    FALL FASHIONS              ┃    3px cobalt bottom border
┃    Browse pieces. Build looks. ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

┌─────────────────────────────────┐
│  Retro Closet Console           │ ← Cobalt hero card
│  Pick one action and continue.  │    3px white border
└─────────────────────────────────┘

MAIN ACTION CARDS (each with 2px cobalt border):

┌─────────────────────────────────┐
│ 👕  Add Clothes              →  │
│     Upload item photo           │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ ✨  Get Outfit Ideas         →  │
│     Get suggestions for any occ │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ 🪞  Try On                   →  │
│     Preview outfit on your photo│
└─────────────────────────────────┘

FOOTER LINKS (Amber text, centered):
  Check Colors  •  My Wardrobe
```

**Design Details:**
- Header background: #2d1b4e with kicker text in amber (#fbbf24)
- Brand text: Georgia font, 32px, weight 900
- Cards: #2a2247 background, 2px cobalt border, square corners
- Text colors: Primary #f8fafc, secondary #b5c5ff

**Interaction:**
- Tapping "Get Outfit Ideas" opens an **occasion picker modal** (no external navigation)
- Other cards navigate directly to their screens

---

### 2️⃣ Home Screen - Occasion Picker Modal

**Visual Layout:**
```
╔═══════════════════════════════════╗
║ ✕          Pick Occasion          ║ ← Modal header (purple)
╠═══════════════════════════════════╣
║                                   ║
║ CULTURAL CONTEXT                  ║ ← Section header (amber)
║ ┌────────┐ ┌────────┐ ┌────────┐ ║
║ │  Any   │ │ Asian  │ │Western │ ║ ← Chips (square borders)
║ └────────┘ └────────┘ └────────┘ ║
║                                   ║
║ OCCASION                          ║ ← Section header (amber)
║ ┌────────┬────────┬────────┐     ║
║ │ 🎉    │ 💼    │ 👗    │     ║ ← 3-column grid
║ │ Party  │ Work  │ Date   │     ║ ← Square corners, bold borders
║ └────────┴────────┴────────┘     ║
║ ┌────────┬────────┬────────┐     ║
║ │ 🎂    │ ⛪    │ 🏖️    │     ║
║ │Wedding │ Formal│ Casual │     ║
║ └────────┴────────┴────────┘     ║
║                                   ║
║ ┌──────────────────────────────┐  ║
║ │ Get Outfits                  │  ║ ← Primary button (cobalt)
║ │ (amber border when active)   │  ║
║ └──────────────────────────────┘  ║
║ ┌──────────────────────────────┐  ║
║ │ Cancel                       │  ║ ← Secondary button
║ └──────────────────────────────┘  ║
║                                   ║
╚═══════════════════════════════════╝
```

**Design Details:**
- Modal background: Same dark base (#1a1a2e)
- Header: Purple (#2d1b4e), 3px cobalt bottom border
- Chips: 2px borders, square corners, inactive #1a1a2e background, active #2244d4 with amber border
- Grid: Flexible layout, scrolls if needed
- Buttons: Full width, 44px height, bold typography

---

### 3️⃣ Camera Screen (Add Clothing)

**Visual Layout:**
```
┌─────────────────────────────────┐
│ ‹ Back   Add Clothing           │ ← Header (purple, 3px border)
├─────────────────────────────────┤
│                                 │
│     ┌───────────────────────┐   │
│     │                       │   │ ← Image preview box
│     │  [Photo or Camera]    │   │    (2px cobalt border)
│     │  No image selected    │   │    300px height, square
│     │                       │   │
│     └───────────────────────┘   │
│                                 │
│ ┌────────────────┬────────────────┐
│ │ 📷 Camera      │ 🖼 Gallery    │ ← Action buttons
│ │ (50% width)    │ (50% width)   │    (Cobalt, amber border)
│ └────────────────┴────────────────┘
│                                 │
│ ┌──────────────────────────────┐ │
│ │ ✦ Analyse with AI     │ │ ← Analyze button
│ │ (shown only when image ready)│ │    (Disabled until image)
│ └──────────────────────────────┘ │
│                                 │
│ AFTER ANALYSIS:                 │
│                                 │
│ ✓ Black Blazer                  │ ← Result title (with checkmark)
│ Classic wool blazer...          │    Heavy typography
│                                 │
│ ┌──┬──┬──┐                     │ ← Color swatches (square)
│ │⬛│░░│░░│ Black Charcoal Shade│    (2px borders)
│ └──┴──┴──┘                     │
│                                 │
│ TAGS:                           │
│ ▢ Western  ▢ Formal  ▢ Wool    │ ← Tag chips (square)
│                                 │
│ SUITABLE FOR:                   │
│ ▢ Work  ▢ Formal Event          │ ← Occasion chips
│                                 │
│ (NO SAVE BUTTON - auto-saves!)  │
└─────────────────────────────────┘
```

**Design Details:**
- Header: Purple background, back button in amber
- Image box: 2px cobalt border, square corners, 300px height
- Buttons: Full width, 44px+, cobalt with amber borders
- After analysis, shows styled analysis cards with color swatches
- **Auto-save flow**: Shows success alert with options to continue or view wardrobe
- Typography: Heavy 900-weight headers, 600-700 body text

---

### 4️⃣ Wardrobe Screen

**Visual Layout:**
```
┌─────────────────────────────────┐
│ ARCHIVE              + Add      │ ← Header with add button
│ Cher Closet                     │    (Cobalt + amber border)
├─────────────────────────────────┤
│                                 │
│ ┌─────────────────┬─────────────┐
│ │                 │             │ ← 2-column grid
│ │ [Image Thumb]   │ [Image]     │    (10px gaps)
│ │ Black Blazer    │ White Tee   │
│ │ Wool, Formal    │ Cotton      │
│ │                 │             │
│ └─────────────────┴─────────────┘
│ ┌─────────────────┬─────────────┐
│ │                 │             │
│ │ [Image]         │ [Image]     │
│ │ Navy Jeans      │ Red Dress   │
│ │ Denim, Casual   │ Silk, Party │
│ │                 │             │
│ └─────────────────┴─────────────┘
│                                 │
└─────────────────────────────────┘

EMPTY STATE (if no items):
┌─────────────────────────────────┐
│ ARCHIVE              + Add      │
│ Cher Closet                     │
├─────────────────────────────────┤
│                                 │
│              👕                 │ ← Large emoji
│                                 │
│    Your closet is empty         │ ← Title text
│                                 │
│   Tap Add to capture your       │ ← Subtitle
│   first statement piece         │
│                                 │
└─────────────────────────────────┘
```

**Design Details:**
- Grid: 2 columns, 10px spacing, each item card has 2px cobalt border
- Card content: Item thumbnail (or placeholder), type, primary attributes
- Long-press to delete (shows confirmation)
- Add button: Cobalt background, amber border, fixed position top-right
- Empty state: Large emoji, centered text, friendly message

---

### 5️⃣ Occasion Screen

**Visual Layout:**
```
┌─────────────────────────────────┐
│ ‹ Back   Pick an Occasion       │ ← Header (purple)
├─────────────────────────────────┤
│                                 │
│ CULTURAL CONTEXT                │
│ ┌────────┐ ┌────────┐ ┌──────┐ │ ← Horizontal scroll
│ │  Any   │ │ Asian  │ │West.  │ │    (can add more)
│ └────────┘ └────────┘ └──────┘ │
│                                 │
│ OCCASION                        │
│ ┌────────┬────────┬────────┐   │ ← 3-column grid
│ │ 🎉    │ 💼    │ 👗    │   │ ← Emoji + label
│ │ Party  │ Work  │ Date   │   │ ← Square borders
│ └────────┴────────┴────────┘   │
│ ┌────────┬────────┬────────┐   │
│ │ 🎂    │ ⛪    │ 🏖️    │   │
│ │ Wedding│ Formal│ Casual │   │
│ └────────┴────────┴────────┘   │
│ [more rows...]                  │
│                                 │
│ BOTTOM FIXED:                   │
│ ┌──────────────────────────────┐ │
│ │ Get Suggestions (enabled     │ │ ← Submit button
│ │ when occasion selected)      │ │ ← Gray/disabled if none selected
│ └──────────────────────────────┘ │
└─────────────────────────────────┘
```

**Design Details:**
- Header: Purple background, cobalt border
- Cultural context: Horizontal scrollable chip row
- Occasion grid: 3 columns, square borders, selection state (cobalt bg)
- Button: Only enabled when occasion is selected

---

### 6️⃣ Suggestion Screen (Outfit Ideas)

**Visual Layout:**
```
┌─────────────────────────────────┐
│ ‹ Back   Party                  │ ← Occasion name
│                    [Formal]     │ ← Cultural context badge
├─────────────────────────────────┤
│                                 │
│ 2 outfits suggested             │ ← Count (amber text)
│                                 │
│ ┌──────────────────────────────┐ │
│ │ [1] Elegant Evening Look     │ │ ← Outfit index badge (cobalt)
│ │                              │ │    (2px border card)
│ │ Color palette:               │ │
│ │ [■ ■ ■ ■ ■]  (swatches)    │ │ ← Color swatches (square, 2px)
│ │                              │ │
│ │ ITEMS USED                   │ │ ← Section headers (amber)
│ │ • Black Blazer               │ │ ← Bullet list
│ │ • White T-Shirt              │ │
│ │ • Navy Jeans                 │ │
│ │                              │ │
│ │ COLOUR HARMONY               │ │
│ │ Complementary palette creates│ │ ← Body text (indigo)
│ │ visual interest and balance.  │ │
│ │                              │ │
│ │ WHY IT WORKS                 │ │
│ │ The structured blazer with   │ │
│ │ casual jeans strikes the     │ │
│ │ perfect balance.             │ │
│ │                              │ │
│ │ ┌────────────────────────┐   │ │ ← Tip box (cobalt)
│ │ │ 💡 STYLING TIP         │   │ │    (amber border)
│ │ │ Add statement jewelry   │   │ │
│ │ │ for extra flair         │   │ │
│ │ └────────────────────────┘   │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│ [more outfits...]               │
│                                 │
└─────────────────────────────────┘

EMPTY WARDROBE STATE:
┌─────────────────────────────────┐
│ ‹ Back   Outfit Ideas           │
├─────────────────────────────────┤
│                                 │
│              👗                 │ ← Large emoji
│                                 │
│    No items in wardrobe yet     │ ← Title
│                                 │
│    Add some clothes to get      │ ← Description
│    personalized suggestions,    │
│    or try demo outfits.         │
│                                 │
│ ┌──────────────────────────────┐ │
│ │ + Add Clothing               │ │ ← Primary action (cobalt)
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ ✨ Try Sample Outfits        │ │ ← Secondary action
│ └──────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Design Details:**
- Header: Occasion name, cultural context badge (cobalt + amber border)
- Outfit cards: 2px cobalt border, full width
- Color palette: Row of square swatches (each 32px, 2px borders)
- Section headers: Amber text, 10px size, uppercase, 1.5 letter-spacing
- Tip box: Cobalt background, amber border, 14px padding
- Empty state: Large emoji, centered text, two action buttons

---

### 7️⃣ Color Analysis Screen

**Visual Layout:**
```
┌─────────────────────────────────┐
│ ‹ Back   Colour Check           │ ← Header (purple)
├─────────────────────────────────┤
│                                 │
│ ┌────────┬────────┬────────┐   │
│ │ [Color]│ [Color]│ [Color]│   │ ← Palette preview
│ │ #C7A88C│ #8E7A69│ #D4A574│   │ ← Hex codes
│ │   X    │   X    │   X    │   │ ← Delete button (X)
│ └────────┴────────┴────────┘   │
│                                 │
│ INPUT ROW:                      │
│ ┌──────────────────┬──────────┐ │
│ │ #FF5733 (input)  │ + Add    │ │ ← Text input + add button
│ └──────────────────┴──────────┘ │
│                                 │
│ CULTURAL PRESETS                │ ← Scrollable horizontal
│ ┌────────┐ ┌────────┐ ┌──────┐ │
│ │▪▪▪    │ │▪▪▪    │ │▪▪▪   │ │ ← Color swatches
│ │Hari Raya│ │CNY    │ │Deepavali
│ └────────┘ └────────┘ └──────┘ │
│                                 │
│ ┌──────────────────────────────┐ │
│ │ ✦ CHECK COMPATIBILITY        │ │ ← Action button
│ │ (disabled if < 2 colors)     │ │
│ └──────────────────────────────┘ │
│                                 │
│ RESULT:                         │
│ ┌──────────────────────────────┐ │
│ │ TRIADIC         Score: 8/10 │ │ ← Harmony type + score
│ │                              │ │
│ │ Excellent combination with   │ │ ← Verdict
│ │ high contrast.               │ │
│ │                              │ │
│ │ CULTURAL NOTES               │ │ ← Analysis sections
│ │ Works across most contexts...│ │
│ │                              │ │
│ │ SUGGESTED ACCENTS            │ │
│ │ ┌──┐ ┌──┐ ┌──┐             │ │ ← Accent swatches
│ │ │⬛│ │🟠│ │🟤│             │ │
│ │ └──┘ └──┘ └──┘             │ │
│ │ #FFD700 #FF6B6B #8B4513    │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│                                 │
└─────────────────────────────────┘
```

**Design Details:**
- Color input with hex validation
- Preset buttons: Scrollable, show color preview
- Result card: Cobalt background, amber border
- Swatches: Square corners, 2px borders
- Score badge: Cobalt background, white text

---

### 8️⃣ Try-On Screen

**Visual Layout:**
```
┌─────────────────────────────────┐
│ ‹ Back   Try On                 │ ← Header (purple)
├─────────────────────────────────┤
│                                 │
│ STEP 1. YOUR PHOTO              │ ← Section headers (amber)
│ ┌──────────────────────────────┐ │
│ │                              │ │ ← Preview box (2px border)
│ │  [Body Photo Preview]        │ │    Square, 240px height
│ │  or placeholder              │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│                                 │
│ ┌────────────────┬────────────┐  │
│ │ 📷 Camera      │ 🖼 Gallery │ ← Action buttons
│ └────────────────┴────────────┘  │
│                                 │
│ STEP 2. PICK GARMENTS           │
│ ┌──────────────────────────────┐ │
│ │ ┌──────────────────────────┐ │ │ ← Scrollable list
│ │ │ ☐ Black Blazer          │ │ │    (or checkbox UI)
│ │ └──────────────────────────┘ │ │
│ │ ┌──────────────────────────┐ │ │
│ │ │ ☑ White T-Shirt         │ │ │
│ │ └──────────────────────────┘ │ │
│ │ ┌──────────────────────────┐ │ │
│ │ │ ☐ Navy Jeans            │ │ │
│ │ └──────────────────────────┘ │ │
│ └──────────────────────────────┘ │
│                                 │
│ STEP 3. STYLE CONTEXT           │
│ [Similar to Occasion Screen]    │
│ Chips for cultural context      │
│ Toggle buttons for fit profile  │
│                                 │
│ FIT NOTES:                      │
│ ┌──────────────────────────────┐ │
│ │ Make sure fit is snug...     │ │ ← Text input
│ └──────────────────────────────┘ │
│                                 │
│ ┌──────────────────────────────┐ │
│ │ 🔄 RENDER PREVIEW            │ │ ← Primary button
│ │ (disabled until items picked)│ │    (cobalt + amber)
│ └──────────────────────────────┘ │
│                                 │
│ PREVIEW RESULT:                 │
│ ┌──────────────────────────────┐ │
│ │                              │ │ ← Try-on result image
│ │  [Virtual Try-On Preview]    │ │    (2px border)
│ │                              │ │
│ └──────────────────────────────┘ │
│                                 │
│ WARNINGS (if any):              │
│ ⚠️  Image quality low...        │
│ ⚠️  No accessories detected...  │
│                                 │
└─────────────────────────────────┘
```

**Design Details:**
- Multi-step form layout
- Preview boxes: 2px borders, square corners, 240-300px height
- Chips and toggles: Same retro style
- Result image: Full width, 2px border
- Warnings: Amber text, small size

---

## 🎨 Typography Samples

### Font Hierarchy
```
Cher's Wardrobe           ← 32px, 900, Georgia (brand)
FALL FASHIONS             ← Secondary branding

Pick an Occasion          ← 18px, 900 (screen title)
Browse pieces.            ← 11px, 600 (subtitle)

CULTURAL CONTEXT          ← 11px, 900, uppercase (section)

Elegant Evening Look      ← 16px, 900 (card title)

Classic wool blazer...    ← 12px, 700 (body)
Complementary palette...

💡 STYLING TIP            ← 12px, 900, amber (callout)
Add statement jewelry     ← 11px, 600
```

---

## 🎯 Interactive States

### Button States
```
ENABLED:
┌────────────────────┐
│ Get Outfits        │ ← Cobalt bg, amber 2px border
└────────────────────┘  White text, 900 weight

HOVER/ACTIVE:
┌────────────────────┐
│ Get Outfits        │ ← Slight brightness increase
│ (visual feedback)  │   Brief opacity change
└────────────────────┘

DISABLED:
┌────────────────────┐
│ Get Outfits        │ ← Gray/muted, 50% opacity
│ (can't click)      │   Border color #2244d4
└────────────────────┘
```

### Chip Selection
```
INACTIVE:
┌──────────┐
│ Casual   │ ← Cobalt border, transparent bg
└──────────┘  Indigo text

ACTIVE:
┌──────────┐
│ Casual   │ ← Cobalt bg, amber border
└──────────┘  White text, 900 weight
```

---

## 📐 Spacing Guidelines

```
Screen padding:          16px (left/right)
Header padding:          14px (h), 16px (v)
Card padding:            14-16px
Component gaps:          8-12px
Section gaps:            12-20px
Grid gaps:               10px
Tab bar height:          80px
Button height:           44-52px minimum
```

---

## 🎬 Animations & Transitions

- **Modal entrance**: Slide up from bottom (300ms ease)
- **Screen transitions**: Fade in (200ms)
- **Button press**: Brief opacity change (150ms)
- **Loading**: Rotating spinner (amber color)
- **Success**: Checkmark or alert (quick pop-in animation)

---

## ♿ Accessibility Features

- ✅ High contrast text (off-white on dark)
- ✅ Large touch targets (44x44px minimum)
- ✅ Clear button labels
- ✅ Loading indicators
- ✅ Error messages with clear actions
- ✅ Semantic HTML structure
- ✅ Keyboard navigation support

---

## 📸 Sample User Flows

### Adding an Item
1. User taps "Add Clothes" card from home
2. Navigates to Camera Screen
3. Takes photo or uploads from gallery
4. Taps "Analyse with AI"
5. AI analyzes and displays results
6. **Auto-saves** to wardrobe
7. Success alert appears with options

### Getting Outfit Ideas
1. User taps "Get Outfit Ideas" from home
2. Occasion picker **modal** slides up
3. Selects cultural context and occasion
4. Taps "Get Outfits"
5. AI generates suggestions
6. If wardrobe empty, shows action buttons (Add clothing or Try samples)

### Trying On
1. User navigates to Try On screen
2. Uploads body photo
3. Selects garments from wardrobe
4. Sets fit preferences
5. Taps "Render Preview"
6. Virtual try-on preview displays
7. Can see fit notes and warnings

---

**Last Updated**: July 2026
**Design Version**: 1.0 - Retro Bold
