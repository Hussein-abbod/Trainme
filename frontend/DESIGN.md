---
name: Professional Bridge
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#3e4949'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#6e7979'
  outline-variant: '#bdc9c8'
  surface-tint: '#006a6a'
  primary: '#006565'
  on-primary: '#ffffff'
  primary-container: '#008080'
  on-primary-container: '#e3fffe'
  inverse-primary: '#76d6d5'
  secondary: '#166969'
  on-secondary: '#ffffff'
  secondary-container: '#a3edec'
  on-secondary-container: '#1d6d6d'
  tertiary: '#515c5d'
  on-tertiary: '#ffffff'
  tertiary-container: '#697575'
  on-tertiary-container: '#f0fcfc'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#93f2f2'
  primary-fixed-dim: '#76d6d5'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f4f'
  secondary-fixed: '#a6efef'
  secondary-fixed-dim: '#8ad3d2'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#004f4f'
  tertiary-fixed: '#d9e5e5'
  tertiary-fixed-dim: '#bdc9c9'
  on-tertiary-fixed: '#131d1e'
  on-tertiary-fixed-variant: '#3e4949'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  h1:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.25'
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 80px
  container-max: 1200px
  gutter: 24px
---

## Brand & Style
The design system is engineered to facilitate a seamless transition between academia and the professional workforce. It balances a high-trust corporate aesthetic with the approachability required for early-career talent. The primary audience consists of ambitious university students and HR professionals within the Malaysian market.

The visual style is **Corporate / Modern**. It prioritizes extreme clarity, utilizing generous whitespace to reduce cognitive load during the job search process. The emotional response is one of reliability, efficiency, and clarity. The system avoids unnecessary ornamentation, ensuring that the content—internship roles and company profiles—remains the focal point. High scannability is achieved through a rigid adherence to a hierarchical grid and consistent typographic rhythm.

## Colors
The palette is built on a foundation of "Pristine White" surfaces to maximize readability and provide a clean, high-end feel. 

- **Primary Teal (#008080):** Used for primary actions, success states, and key student-pathway branding. It represents growth and professional vitality.
- **Deep Teal (#005f5f):** Reserved for hover states, headers, and company-specific interface elements to provide a subtle but clear distinction in user paths.
- **Surface Tints:** A very light tertiary teal is used for background sections to distinguish between different content blocks without introducing heavy borders.
- **Neutrals:** A range of cool greys is employed for secondary text and borders, ensuring the interface feels grounded and institutional.

## Typography
This design system utilizes **Inter** exclusively to leverage its exceptional legibility and systematic feel. The type scale is optimized for high-scannability, with a clear distinction between heading levels to guide the user's eye through internship descriptions and application forms.

- **Headlines:** Bold weights with slight negative letter-spacing to create a strong, "anchor" feel for section starts.
- **Body:** Standardized at 16px for optimal long-form reading on desktop and mobile.
- **Labels:** Medium weights are used for UI metadata, such as location tags or stipend amounts, ensuring they remain legible at smaller sizes.

## Layout & Spacing
The design system employs a **Fixed Grid** model for desktop, centered on a 12-column layout with a 1200px maximum container width. This ensures a consistent, high-end editorial feel across different screen sizes.

- **The 8px Rule:** All spatial increments are multiples of 8px, creating a predictable visual cadence.
- **Path Distinction:** The student path utilizes wider margins and more vertical breathing room to feel welcoming. The company path (dashboard-heavy) utilizes a more compact version of the grid to maximize information density.
- **Sectioning:** Use `xl` spacing to separate major value propositions on the landing page, while using `md` spacing for internal card components.

## Elevation & Depth
Depth is conveyed through **Tonal Layers** and **Low-Contrast Outlines** rather than heavy shadows. This maintains the "Clean" aesthetic while providing necessary hierarchy.

- **Level 0 (Background):** Pure White (#FFFFFF).
- **Level 1 (Cards/Surface):** White with a 1px border (#E5E7EB) or a very subtle soft shadow (0px 2px 4px rgba(0, 0, 0, 0.05)).
- **Level 2 (Interactive):** When a card is hovered, the border color shifts to the primary teal and the shadow deepens slightly to indicate interactivity.
- **Modals:** Use a Backdrop Blur (8px) with a semi-transparent overlay to maintain context while focusing user attention on the task at hand.

## Shapes
The shape language is defined as **Rounded**, striking a balance between the precision of a professional tool and the friendliness of a social platform.

- **Primary Components:** Buttons and Input fields use a 0.5rem (8px) corner radius.
- **Cards:** Layout containers for job listings use the `rounded-lg` (16px) setting to create a distinct "containerized" look for scannable content.
- **Iconography:** Icons should feature slightly rounded terminals to match the font and corner radius of the UI components.

## Components
Consistent component behavior is critical for the distinction between student and employer experiences.

- **Buttons:** 
    - *Primary:* High-contrast Teal (#008080) with white text.
    - *Secondary:* Ghost style with a Primary Teal border.
    - *Company Path:* Use Deep Teal (#005f5f) for primary actions to provide a subtle visual cue that the user is in "Management Mode."
- **Cards:** Job cards must feature a clear header (Position), a sub-header (Company Name), and a footer with "Chips" for metadata (Location, Duration, Stipend).
- **Chips:** Small, rounded-pill containers with light teal backgrounds and dark teal text.
- **Input Fields:** Clean, 1px grey borders that transition to a 2px Teal border on focus. Labels should always be visible above the field (never just placeholder text).
- **Progress Indicators:** A thin teal bar at the top of multi-step application forms to reduce abandonment by providing clear "light at the end of the tunnel" visual cues.