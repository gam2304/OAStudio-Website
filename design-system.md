You are building a high-end architecture and luxury design portfolio website with an ultra-minimalist, cinematic "Architectural Silence" visual identity (Atelier Monolith).

## Color Palette
- Primary: #F7F5F2 — Warm White; primary button fill, headings, key UI elements (feels like premium paper)
- Secondary: #B28C5A — Bronze; the "precious metal" accent, used with extreme restraint for hover/active states, focus borders, carousel progress lines and structural lines
- Background: #0A0A0A — Deep Black; the cinematic "void" canvas that lets architectural photography emerge
- Surface: #141310 — tonal layer for sections and containers (step up to #1C1C18 / #21201C for further layering); full-screen overlays and modals use solid #0A0A0A with no transparency
- Text Primary: #F7F5F2 — headings and body copy (#E6E2DC for long-form body if softer contrast is needed)
- Text Secondary: #D9D5CF — Stone Gray; captions, metadata, helper text, placeholders
- Border: #D9D5CF at 20% opacity — 1px outlines for container definition, dividers and input bottom-borders
- Success: #B28C5A — Bronze (no dedicated success hue; confirmations reuse the accent)
- Warning: #EABF89 — warm amber from the tertiary tone
- Error: #FFB4AB — soft red (use #93000A as the error container fill)

## Typography
- Font Family: Playfair Display (headlines) + Inter (body, labels, UI) — both from Google Fonts
- Headings: Playfair Display, regular weight (400), tracking tight (-0.02em on display sizes, -0.01em on mobile display)
- Body: Inter, light (300) for large body, regular (400) for standard body; line-height 1.6x or more is mandatory
- Labels: Inter 600, uppercase, 12px, letter-spacing 0.2em (blueprint precision)
- Size Scale: 12 / 13 / 16 / 18 / 32 / 48 / 84px
  - 12 label-caps · 13 caption · 16 body-md · 18 body-lg · 32 headline-md · 48 headline-lg · 84 display-xl
  - Mobile: display 48px, headline-lg 32px

## Spacing Scale
Use an 8px base unit. Common values: 8, 16, 24, 32, 48, 64, 80, 160px
- Gutters: 32px desktop / 16px mobile
- Outer margins: 80px desktop / 24px mobile
- Section gap: 160px — each section is a distinct "chapter"
- Layout: fixed 12-column grid on desktop with asymmetric compositions and deliberately empty columns; single-column photo-led feed on mobile

## Border Radius
- Small (inputs, chips): 0px
- Medium (cards, buttons): 0px
- Large (modals, containers): 0px
- Full (avatars, pills): 9999px — reserved only for the brand "O" circular motif (image masks or subtle watermark); never for buttons, chips or cards

## Shadows
- None. Shadows and blurs are prohibited.
- Depth comes from tonal layering (stacked solid planes: #0A0A0A → #141310 → #1C1C18 → #21201C) and hard 1px Stone Gray borders at 20% opacity.
- Hierarchy is created through size and color (Warm White vs. Stone Gray), not simulated Z-axis height.

## Component Patterns
Buttons: Rectangular, 0px radius. Primary is #F7F5F2 background with #0A0A0A text in label-caps (Inter 12px, 600, uppercase, 0.2em tracking). 16px vertical / 32px horizontal padding, 48px height. Hover shifts subtly to a Bronze (#B28C5A) border or text color with a slow, decelerated transition — no scale or shadow.

Inputs: No box — only a 1px Stone Gray bottom-border. Label sits above in label-caps. 48px height, 8px vertical padding, 0px horizontal padding so text aligns hard-edge with the grid. Focus changes the bottom-border to Bronze (#B28C5A).

Cards: Project cards with full-bleed imagery, 0px radius, no shadow, optional 1px Stone Gray border at 20% opacity. A sharp, solid overlay reveals metadata (label-caps + caption in Stone Gray) on hover; internal padding 24–32px.

Navigation: Minimalist top bar with a hamburger menu even on desktop, opening a full-screen solid #0A0A0A "monolith" menu.

Image Carousels: Thin Bronze lines as progress indicators; no visible arrow icons — use large hit-areas on the left/right screen edges.

## Rules
1. Never introduce colors outside this palette — Bronze is used sparingly, as a precious accent only
2. Always use the 8px spacing scale — no arbitrary values
3. Every element has 0px border radius; the only circle allowed is the brand "O" motif
4. Never use drop shadows, blurs or semi-transparent overlays — depth comes from tonal planes and hard borders
5. Align text hard-edge to the vertical axes of the imagery to build an invisible structural skeleton
6. Motion is fluid and decelerated, evoking calm and permanence
7. When in doubt, add more negative space — this aesthetic is silent, heavy and editorial
