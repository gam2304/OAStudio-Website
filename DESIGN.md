---
name: Atelier Monolith
colors:
  surface: '#141310'
  surface-dim: '#141310'
  surface-bright: '#3a3935'
  surface-container-lowest: '#0f0e0b'
  surface-container-low: '#1c1c18'
  surface-container: '#21201c'
  surface-container-high: '#2b2a26'
  surface-container-highest: '#363531'
  on-surface: '#e6e2dc'
  on-surface-variant: '#c4c7c7'
  inverse-surface: '#e6e2dc'
  inverse-on-surface: '#32302c'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c9c6c5'
  primary: '#c9c6c5'
  on-primary: '#313030'
  primary-container: '#0a0a0a'
  on-primary-container: '#7b7979'
  inverse-primary: '#5f5e5e'
  secondary: '#c8c6c4'
  on-secondary: '#30312f'
  secondary-container: '#494947'
  on-secondary-container: '#b9b8b6'
  tertiary: '#eabf89'
  on-tertiary: '#452b02'
  tertiary-container: '#120800'
  on-tertiary-container: '#967343'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c9c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e4e2df'
  secondary-fixed-dim: '#c8c6c4'
  on-secondary-fixed: '#1b1c1a'
  on-secondary-fixed-variant: '#474745'
  tertiary-fixed: '#ffddb4'
  tertiary-fixed-dim: '#eabf89'
  on-tertiary-fixed: '#291800'
  on-tertiary-fixed-variant: '#5e4116'
  background: '#141310'
  on-background: '#e6e2dc'
  surface-variant: '#363531'
typography:
  display-xl:
    fontFamily: Playfair Display
    fontSize: 84px
    fontWeight: '400'
    lineHeight: 90px
    letterSpacing: -0.02em
  display-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 52px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '400'
    lineHeight: 56px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 38px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '400'
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '300'
    lineHeight: 32px
    letterSpacing: 0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 28px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.2em
  caption:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
spacing:
  unit: 8px
  gutter: 32px
  margin-desktop: 80px
  margin-mobile: 24px
  section-gap: 160px
---

## Brand & Style

The design system is rooted in the philosophy of "Architectural Silence." It is an ultra-minimalist, cinematic framework designed for high-end architecture and luxury design. The aesthetic mirrors a premium editorial publication—prioritizing immense negative space, razor-sharp alignment, and high-contrast visuals.

The target audience consists of ultra-high-net-worth individuals, developers, and design aficionados who value precision over decoration. The UI must feel immersive and heavy, like a physical monograph, using the provided logo's geometric tension as a structural anchor. The movement between states should be fluid and decelerated, evoking a sense of calm and permanence.

## Colors

The palette is monochromatic and grounded in materiality. **Deep Black (#0A0A0A)** serves as the primary canvas, creating a cinematic "void" that allows architectural photography to emerge. **Warm White (#F7F5F2)** provides a high-contrast surface for typography, feeling more like premium paper than a digital screen.

**Bronze (#B28C5A)** is used with extreme restraint as a "precious metal" accent for micro-interactions, active states, and structural lines. **Stone Gray (#D9D5CF)** functions as a subtle tertiary tone for borders, metadata, and secondary backgrounds, mimicking the raw textures of concrete and limestone.

## Typography

Typography is the primary decorative element of this design system. It utilizes a strict contrast between a sophisticated editorial serif and a utilitarian, technical sans-serif.

- **Headlines:** Set in Playfair Display. Large-scale headings should use negative letter-spacing to feel tight and controlled.
- **Body Text:** Set in Inter. High line-heights (1.6x+) are mandatory to ensure a breezy, luxurious reading experience.
- **Functional Labels:** Always in Inter, uppercase, with generous letter-spacing to evoke the precision of architectural blueprints.

## Layout & Spacing

The layout follows a **Fixed 12-Column Grid** on desktop, with an emphasis on asymmetrical compositions. Large "empty" columns are used to create breathing room, pushing content to the edges or centering it in a narrow stack to mimic gallery wall placements.

- **Desktop:** 80px outer margins, 32px gutters. Sections are separated by a massive 160px vertical gap to signify distinct "chapters."
- **Mobile:** 24px margins, 16px gutters. The layout collapses into a single-column "feed" where photography takes precedence.
- **Alignment:** Strictly use hard-edge alignment. Text should often align with the vertical axes of the imagery above it to create an invisible structural skeleton.

## Elevation & Depth

This design system rejects traditional shadows and blurs in favor of **Tonal Layering** and **Hard Borders.** Depth is established through the stacking of solid planes.

- **Surfaces:** Use 1px Stone Gray (#D9D5CF) outlines at 20% opacity for container definition. Never use drop shadows.
- **Overlays:** Full-screen transitions and modals should use a solid #0A0A0A fill with no transparency to maintain a sense of monumental mass.
- **Depth:** Content sits on the same plane. Hierarchy is created via size and color (Warm White vs. Stone Gray) rather than simulated Z-axis height.

## Shapes

In alignment with the provided logo and the precision of architecture, the design system utilizes **Sharp (0px)** corners exclusively.

There are no rounded buttons, cards, or inputs. Every element is defined by its 90-degree angles, creating a sense of structural integrity and permanence. The only exception is the "O" from the brand identity, which should be used as a recurring circular motif for mask-grouping images or as a subtle watermark background element.

## Components

### Buttons
Primary buttons are rectangular with a #F7F5F2 background and #0A0A0A text. Hover states trigger a subtle shift to a Bronze (#B28C5A) border or text color. Use the `label-caps` typography style for button labels.

### Inputs
Text fields are simple 1px Stone Gray bottom-borders. The label sits above in `label-caps`. Focus states change the border color to Bronze.

### Cards
Project cards feature full-bleed imagery with a sharp overlay that reveals metadata on hover. All cards must adhere to the 0px border-radius rule.

### Navigation
The navigation is a minimalist top bar. Use a "hamburger" menu even on desktop to preserve the cinematic aesthetic, revealing a full-screen "monolith" menu when activated.

### Image Carousels
Use thin Bronze lines for progress indicators. Controls should be minimal, utilizing large hit-areas on the left/right edges of the screen rather than visible button icons.