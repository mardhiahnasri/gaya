# Gaya UI Design Guide

## 🎨 Design Philosophy

Gaya combines **retro 90s Cher closet aesthetic** with **modern usability**. The interface draws inspiration from vintage computer consoles with bold geometric shapes, heavy typography, and a vibrant color scheme.

---

## 🌈 Color System

### Primary Colors
```
Base Background:      #1a1a2e  (Charcoal Blue-Gray)
Header Background:    #2d1b4e  (Dark Purple)
Card Background:      #2a2247  (Medium Purple)
Primary Action:       #2244d4  (Cobalt Blue)
Text Accent:          #b5c5ff  (Bright Indigo)
Highlight:            #fbbf24  (Amber Gold)
Primary Text:         #f8fafc  (Off-white)
Secondary Text:       #b5c5ff  (Bright Indigo)
```

### Usage
- **Headers**: Purple (#2d1b4e) with 3px cobalt bottom border
- **Cards**: Medium purple (#2a2247) with 2px cobalt borders
- **Active buttons**: Cobalt (#2244d4) with amber (#fbbf24) border
- **Inactive buttons**: Transparent with cobalt border
- **Tab bar**: Cobalt top border (3px), amber text for active tab

---

## 🔤 Typography

### Font Weights
- **Headers/Titles**: 900 (very heavy)
- **Section Headers**: 900 with letter-spacing: 2
- **Body Text**: 600-700
- **Buttons**: 900
- **Card Titles**: 900

### Font Sizes
- **Page Title**: 32px (900 weight)
- **Screen Title**: 18-20px (900 weight)
- **Card Title**: 15px (900 weight)
- **Body Text**: 11-13px (600-700 weight)
- **Labels**: 10-12px (900 weight for section headers)

### Font Families
- **Brand text**: Georgia
- **UI text**: System font (default)

---

## 📐 Geometry & Spacing

### Border Radius
- **Everything**: 0 (hard square corners, no rounded edges)

### Border Widths
- **Headers**: 3px
- **Cards/Components**: 2px
- **Small elements**: 1-2px

### Padding & Margins
- **Screen padding**: 16px horizontal
- **Card padding**: 14-16px
- **Component gaps**: 8-12px
- **Section gaps**: 12-20px

### Component Sizing
- **Tab bar height**: 80px
- **Button height**: 44-52px
- **Card minimum height**: Flexible

---

## 🎯 Key UI Components

### Headers
- Purple background (#2d1b4e)
- 3px cobalt bottom border
- Padding: 14px horizontal, 16px vertical
- Title in white (900 weight)
- Back button in amber

### Cards
- Background: #2a2247
- Border: 2px cobalt (#2244d4)
- Padding: 14-16px
- Border radius: 0
- Margin bottom: 10-12px

### Buttons
**Primary (Action Buttons)**
- Background: #2244d4 (cobalt)
- Border: 2px amber (#fbbf24)
- Padding: 12-16px vertical, 16-20px horizontal
- Text: White (900 weight)
- Border radius: 0

**Secondary**
- Background: Transparent or #1a1a2e
- Border: 2px cobalt (#2244d4)
- Text: #b5c5ff (indigo)

**Disabled**
- Opacity: 0.5
- Border color: #2244d4

### Chips (Tags)
- Border radius: 0
- Border: 2px cobalt
- Padding: 8-12px horizontal, 6-8px vertical
- Background: #1a1a2e (inactive) or #2244d4 (active)
- Text: Small (11px)

### Tab Bar
- Height: 80px
- Background: #2a2247
- Top border: 3px cobalt
- Tab icons: 24px with 2px borders
- Tab labels: 900 weight, bold
- Inactive: #7a8aaa text, #1a1a2e background
- Active: #fbbf24 text, #2244d4 background

### Grid Layouts
- **Wardrobe**: 2-column grid, 10px gaps
- **Occasion picker**: 3-column grid in modals
- **Color swatches**: Row with flex, square 40x40px

---

## 📺 Screen Layouts

### Home Screen
```
┌─────────────────────────────────┐
│     CHER'S WARDROBE             │  Header (purple #2d1b4e)
│     FALL FASHIONS               │  3px cobalt border
│     Browse pieces. Build looks. │
├─────────────────────────────────┤
│  ╔───────────────────────────╗  │
│  ║ Retro Closet Console      ║  │  Hero Card (cobalt)
│  ║ Pick one action...        ║  │  3px white border
│  ╚───────────────────────────╝  │
├─────────────────────────────────┤
│ ┌──────────────────────────────┐ │
│ │ 👕 Add Clothes          →    │ │  Action Cards (2px border)
│ │ Upload item photo            │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ ✨ Get Outfit Ideas     →    │ │  (Opens occasion modal)
│ │ Get suggestions...           │ │
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ 🪞 Try On             →      │ │
│ │ Preview outfit on photo      │ │
│ └──────────────────────────────┘ │
├─────────────────────────────────┤
│  Check Colors • My Wardrobe     │  Footer links
└─────────────────────────────────┘
```

### Camera Screen (Add Clothing)
```
┌─────────────────────────────────┐
│ ‹ Back    Add Clothing          │  Header
├─────────────────────────────────┤
│                                 │
│     ┌──────────────────────┐   │
│     │  [Image Preview]     │   │  Image box (2px border)
│     │  or placeholder      │   │  Square corners
│     └──────────────────────┘   │
│                                 │
│ ┌─────────────┬─────────────┐  │
│ │ 📷 Camera   │ 🖼 Gallery  │  │  Action buttons
│ └─────────────┴─────────────┘  │
│                                 │
│ ┌───────────────────────────────┐ │
│ │ ✦ Analyse with Gemini AI     │ │  Analyze button
│ └───────────────────────────────┘ │  (Auto-saves after)
│                                 │
│ ✓ Black Blazer                  │
│ Classic black wool blazer       │  Analysis result
│                                 │  (shown after analysis)
│ [Color swatches]                │
│ Tags: Western, Formal, Wool     │
│ Suitable for: Work, Formal      │
└─────────────────────────────────┘
```

### Wardrobe Screen
```
┌─────────────────────────────────┐
│ ARCHIVE      + Add              │  Header with add button
│ Cher Closet                     │
├─────────────────────────────────┤
│ ┌────────────┬────────────┐    │
│ │ [Item 1]   │ [Item 2]   │    │  2-column grid
│ │ Blazer     │ T-Shirt    │    │  10px gaps
│ │ Black      │ White      │    │  Square borders
│ └────────────┴────────────┘    │
│ ┌────────────┬────────────┐    │
│ │ [Item 3]   │ [Item 4]   │    │
│ │ Jeans      │ Dress      │    │
│ │ Navy       │ Red        │    │
│ └────────────┴────────────┘    │
└─────────────────────────────────┘
```

### Occasion Picker Modal (Home)
```
┌─────────────────────────────────┐
│ ✕           Pick Occasion       │  Modal header
├─────────────────────────────────┤
│ CULTURAL CONTEXT                │  Section header (amber)
│ [Any] [Asian] [Western] [...]   │  Chip row (scrollable)
│                                 │
│ OCCASION                        │  Grid of occasions
│ ┌────────┬────────┬────────┐   │
│ │ 🎉     │ 💼     │ 👗     │   │  3-column grid
│ │ Party  │ Work   │ Date   │   │  Emoji + label
│ └────────┴────────┴────────┘   │  Square borders
│ ┌────────┬────────┬────────┐   │
│ │ 🎂     │ ⛪     │ 🏖️     │   │
│ │ Wedding│ Formal │ Casual │   │
│ └────────┴────────┴────────┘   │
│                                 │
│ ┌──────────────────────────────┐ │
│ │ Get Outfits                  │ │  Action button
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ Cancel                       │ │  Secondary button
│ └──────────────────────────────┘ │
└─────────────────────────────────┘
```

### Suggestion Screen (Outfit Ideas)
```
┌─────────────────────────────────┐
│ ‹ Back    Party                 │  Header
│                    [Formal]     │  Context badge
├─────────────────────────────────┤
│ 2 outfits suggested             │  Count
│                                 │
│ ┌──────────────────────────────┐ │
│ │ [1] Elegant Evening Look     │ │  Outfit card
│ │                              │ │  (2px border)
│ │ [■ ■ ■ ■ ■]                 │ │  Color palette
│ │ Items used                   │ │
│ │ • Black Blazer               │ │
│ │ • White T-Shirt              │ │
│ │ • Navy Jeans                 │ │
│ │                              │ │
│ │ Colour harmony               │ │
│ │ Complementary colors...      │ │
│ │                              │ │
│ │ Why it works                 │ │
│ │ Perfect for a night out...   │ │
│ │                              │ │
│ │ ┌────────────────────────┐   │ │  Tip box (cobalt)
│ │ │ 💡 Styling tip         │   │ │  (amber border)
│ │ │ Add statement jewelry...│   │ │
│ │ └────────────────────────┘   │ │
│ └──────────────────────────────┘ │
│                                 │
│ ... more outfits ...            │
└─────────────────────────────────┘
```

### Empty Wardrobe State
```
┌─────────────────────────────────┐
│ ‹ Back    Outfit Ideas          │
├─────────────────────────────────┤
│                                 │
│            👗                   │  Empty emoji
│                                 │
│   No items in wardrobe yet      │  Title
│                                 │
│   Add some clothes to get       │  Description
│   personalized suggestions...   │
│                                 │
│ ┌──────────────────────────────┐ │
│ │ + Add Clothing               │ │  Primary action
│ └──────────────────────────────┘ │
│ ┌──────────────────────────────┐ │
│ │ ✨ Try Sample Outfits        │ │  Secondary action
│ └──────────────────────────────┘ │  (Uses demo items)
│                                 │
└─────────────────────────────────┘
```

---

## 🎬 Animation Guidelines

- **Modal entrance**: Slide up from bottom
- **Transitions**: Quick (200-300ms)
- **Loading**: Spinner with amber color
- **Button feedback**: Brief opacity change on press

---

## 📱 Responsive Breakpoints

- **Mobile**: 0-768px (full viewport width - 32px padding)
- **Tablet**: 768-1024px (layouts expand with more spacing)
- **Desktop**: 1024px+ (max-width containers, centered)

---

## ♿ Accessibility

- High contrast text (off-white on dark backgrounds)
- Large touch targets (minimum 44x44px)
- Clear labels for all inputs
- Loading states for async operations
- Error messages that clearly state the issue

---

## 🎨 Design Tokens (CSS/Theme)

```javascript
const theme = {
  colors: {
    background: '#1a1a2e',
    headerBg: '#2d1b4e',
    cardBg: '#2a2247',
    primary: '#2244d4',
    accent: '#fbbf24',
    textPrimary: '#f8fafc',
    textSecondary: '#b5c5ff',
    textMuted: '#7a8aaa',
  },
  typography: {
    fontFamily: 'System Font, Georgia',
    fontWeights: {
      heavy: 900,
      bold: 700,
      semibold: 600,
    },
    sizes: {
      title: 32,
      screenTitle: 18,
      cardTitle: 15,
      body: 12,
      small: 11,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  borders: {
    header: '3px solid #2244d4',
    card: '2px solid #2244d4',
    small: '1px solid #2244d4',
  },
  borderRadius: 0, // Everything square
};
```

---

## 🚀 Component Examples

### Coming Soon
- Interactive component library
- Figma design file
- Storybook integration

---

**Last Updated**: July 2026
**Design Version**: 1.0 - Retro Bold
