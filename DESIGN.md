# Gaya UI Design Guide

Gaya's interface is calm and editorial: a warm cream canvas, a forest-sage accent, a serif display face for headings and generous rounded shapes. The web app and the mobile app share the same tokens.

Source of truth:

- Web: CSS variables at the top of [web/src/styles.css](web/src/styles.css)
- Mobile: [mobile/src/theme.ts](mobile/src/theme.ts)

## Colour

| Token | Value | Use |
|---|---|---|
| `bg` | `#f6f3ea` | Page background (cream) |
| `surface` | `#fffdf8` | Cards, inputs, sidebar / tab bar |
| `border` | `#e6e1d2` | Default borders |
| `borderStrong` | `#cfc8b4` | Hover borders, dashed drop zones |
| `text` | `#25291f` | Primary text |
| `muted` | `#6f7566` | Secondary text, labels |
| `accent` | `#4f6b4a` | Primary buttons, active states, links |
| `accentStrong` | `#3b5238` | Text on soft accent, hover of primary |
| `accentSoft` | `#e5ecdc` | Active nav item, selected chips, notices |
| `danger` / `dangerSoft` | `#a8432f` / `#f8e8e3` | Errors, failing scores |
| `pass` / `passSoft` | `#3d7a3a` / `#e3eed9` | Good scores and checks |
| `warn` / `warnSoft` | `#b07a14` / `#f6ecd0` | Middling scores and checks |

Score tone: 8 or more is `pass`, 5 to 7 is `warn`, below 5 is `fail`.

## Typography

- **Display** (page titles, card titles, brand, scores): Iowan Old Style / Palatino / Georgia on web, Georgia (iOS) or `serif` (Android) on mobile. Weight 700.
- **UI text**: Inter or the system font.
- Section labels are 11-12px, uppercase, weight 600, letter-spaced.

## Shape and depth

- Cards: 16px radius, 1px `border`, soft shadow.
- Buttons, chips, search fields, segmented controls: fully rounded (pill).
- Inputs and selects: 12px radius.
- Primary buttons carry a faint accent-coloured shadow. Wardrobe cards lift on hover (web).

## Layout

- **Web**: sticky 248px sidebar (icon, label and a short hint per page). Below 820px it becomes a fixed bottom tab bar. Content is capped at 1160px.
- **Mobile**: bottom tabs with the same five line icons (Wardrobe, Studio, Try on, Profile, Colours).
- Pages: Wardrobe, Outfit studio, Try on, Profile, Colour check.

## Components

- **Wardrobe card**: 4:5 photo, colour swatches overlaid bottom-left, remove button (web: on hover), then title, meta and category / size controls.
- **Filter chips**: category chips with counts above the wardrobe grid.
- **Pick tile (studio)**: selected pieces get an accent outline and a ✓ badge.
- **Segmented control**: pill track with a raised active segment (Try on mode switch).
- **Score pill**: tinted by tone; the large variant uses the display face.
- **Notices**: tinted background with a matching 1px border (info uses the accent, error uses danger).

## Accessibility

- Visible `:focus-visible` outline on web.
- Icon-only buttons carry `aria-label`s.
- Animations respect `prefers-reduced-motion`.
