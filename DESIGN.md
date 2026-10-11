---
name: Teacher Desk
description: A warm, tactile teaching workspace inspired by a wooden teacher’s desk.
colors:
  maroon: "#701b32"
  sidebar: "#421522"
  paper: "#fffaf0"
  brass: "#ad762c"
  edge: "#d7c6b2"
  subtle-ink: "#655249"
  desk-background: "#eee4d6"
  body-ink: "#30221f"
  button-ink: "#643225"
  button-label: "#fff6ee"
  focus: "#a26c1e"
  field-paper: "#fffdf5"
  field-edge: "#bfa98f"
  active-task: "#7a3343"
  add-ink: "#3c633a"
typography:
  display:
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "54px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-1.8px"
  headline:
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-.025em"
  title:
    fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-.025em"
  subtitle:
    fontFamily: "Poppins, Arial, sans-serif"
    fontSize: "13px"
    lineHeight: 1.5
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "12px"
    lineHeight: 1.5
rounded:
  field: "9px"
  control: "12px"
  compact-card: "14px"
  panel: "16px"
  website: "17px"
  dialog: "18px"
  launcher-mobile: "20px"
  launcher: "23px"
  pill: "30px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "36px"
components:
  button-primary:
    textColor: "{colors.button-label}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-secondary:
    textColor: "{colors.button-ink}"
    rounded: "{rounded.control}"
    padding: "9px 18px"
  filter:
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "10px 16px"
  field:
    backgroundColor: "{colors.field-paper}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
  website-card:
    rounded: "{rounded.website}"
    padding: "57px 12px 18px"
  launcher-card:
    rounded: "{rounded.launcher}"
    padding: "54px 16px 22px"
  task-panel:
    rounded: "{rounded.panel}"
    padding: "20px"
---

# Design System: Teacher Desk

## Overview

**Creative North Star: “The Teacher’s Desk.”** Warm paper, burgundy leather, ceramic tiles, and wooden details make the workspace feel familiar and tangible. The illustrated wooden desk logo is a binding identity asset; retain its recognizable silhouette in navigation, launcher, and loading contexts.

Skeuomorphism is the confirmed direction. Inset highlights, shaded edges, pressed controls, a clipboard clip, and ruled note paper carry meaning through familiar physical objects. Keep choices restrained and labels legible within this tactile world.

**Key Characteristics:**

- Maroon actions against cream and parchment surfaces.
- Helvetica titles, Poppins subtitles, and Inter controls and labels.
- Raised controls with explicit pressed and keyboard-focus states.
- Spacious interaction areas within compact teaching-tool panels.

This document records the cascade in `outputs/TeacherDesk/index.html`: base styles, responsive styles, then the final desk theme. Token values above are normative; extended CSS behaviors live in `.impeccable/design.json`.

## Colors

The palette combines warm burgundy, parchment neutrals, and restrained brass accents.

### Primary

- **Maroon** anchors identity and selected controls; the sidebar uses its deeper burgundy companion.
- Primary buttons use a light-to-dark burgundy gradient, with cream text. Preserve the gradient and highlighted top edge together.

### Secondary

- **Brass** supports the material language; gold distinguishes starred websites.
- The Add Website tile has a pale green surface and a deeper green icon, distinguishing creation from existing tools.

### Neutral

- **Paper** and warm cream gradients carry cards, forms, task panels, and dialogs.
- **Body ink** and **subtle ink** provide brown-toned reading contrast.
- **Edge** and related tan strokes establish boundaries without stark white or black framing.

**The Material Rule.** Color and shading work together: preserve the light upper edge and darker lower edge when adding a raised surface.

## Typography

Helvetica-family headings provide direct, compact titles. Poppins softens greetings, descriptions, and subtitles. Inter is the reading and interaction face. Inter and Poppins are bundled as local font files; Helvetica uses system fallbacks.

The display token describes the desktop hero. Its title steps down at the observed tablet and mobile breakpoints. Page titles use the headline role; section headings use the title role. Website titles use compact Helvetica (15px desktop, 14px mobile); launcher titles use 16px desktop. Labels vary by context rather than following a mathematical scale.

**The Three Roles Rule.** Keep title, subtitle, and control families separate. A control label uses Inter even when its surrounding introduction uses Poppins.

## Layout

The full desk uses a fixed left sidebar (232px), a hero, and a padded working area. The sidebar narrows to 205px at 1250px. Home’s website grid uses five columns on large screens and three between 701px and 1250px. The lower workspace becomes one column in that range. Notes use three, two, then one column as space decreases.

At 700px and below, the sidebar becomes an off-canvas drawer; a sticky header and fixed bottom navigation provide access. Website cards become horizontal rows. The four mobile tabs are Home, Websites, Notes, and Settings; Categories remains in the five-item drawer. Keep safe-area spacing and room above fixed controls and notices.

Shortcut mode removes the navigation shell and presents a centered launcher (maximum width 1140px), four columns on desktop and two on mobile. The Add Website tile and persistent mode switch remain available. Home and launcher display starred websites first.

The 950px breakpoint also adjusts hero typography and search placement. At 1650px, workspace horizontal padding expands to 40px. Later desk-theme declarations override earlier large-screen hero/card sizing; follow the full cascade, not an isolated media rule.

## Elevation & Depth

Depth is structural: controls rise above their paper background, inputs sit slightly recessed, and dialogs cast the broadest shadow. The sidebar uses an inset seam and dashed stitching. Notes have a bent-corner silhouette; tasks use a metallic clipboard clip.

Reusable raised and pressed shadows, card elevation, dialog elevation, focus rings, and exact transitions are catalogued in the sidecar. Website hover strengthens its shadow without translating the card. Pressing a standard control moves it down by one pixel and replaces its raised shadow with an inset shadow.

**The Physical State Rule.** Hover indicates availability; a pressed inset indicates action. Honor reduced-motion settings and retain state contrast when transitions are disabled.

## Shapes

Controls and fields have gently rounded corners; larger tiles have broader curves. Pills and the mode switch use capsule shapes. Notes use asymmetric corners (6px 6px 20px 6px). The launcher uses the broadest tile corners, reducing them slightly on mobile. Retain fine tan borders around cream surfaces.

## Components

### Buttons

Primary actions are burgundy with cream labels; secondary actions are cream with brown labels. Both use raised shadows and a pressed inset state. Keyboard focus uses a brass outline with visible separation. Disabled buttons reduce opacity and use the waiting cursor.

The confirmed interaction requirement is a minimum 44px hit target. Global buttons and the final card-control, Quick Access, and task-filter overrides establish this minimum across desktop and mobile.

### Chips

Category filters are cream capsules. The active filter adopts the primary gradient and cream text. Task filters are smaller rounded rectangles with a dark burgundy selected fill.

### Cards / Containers

Website cards are cream ceramic tiles with inset highlights, a colored application icon, title, description, and upper-right actions. Gold-filled stars communicate pinning. Launcher cards remove descriptions and category badges to emphasize recognition. The Add Website tile uses the same dimensional language in green.

### Inputs / Fields

Fields have warm paper backgrounds, tan borders, and a subtle inset shadow. Form fields are at least 48px high with 16px input text. Their focus rule uses a two-pixel mauve outline; general visible focus uses the brass outline. Preserve both observed contexts rather than flattening every focus state to one rule.

### Navigation

The five panels are Home, My Websites, Categories, Notes, and Settings. Sidebar entries are raised burgundy panels with an illuminated selected gradient, cream labels, and icons. Preserve active-page semantics. The mobile bottom bar uses a cream base and burgundy selected control.

### Tasks, Notes, and Feedback

Tasks sit on a clipboard-like paper panel. Large checkboxes show completion and completed titles receive a strike-through. Task mutations refresh the task panel locally. Notes use warm colored paper, ruled content, and a pinned state.

Operation notices use the desk logo, a specific action label, and a progress element on a raised parchment surface. Keep them clear of the mode switch and bottom navigation. Toasts use burgundy and polite live-status semantics. These are visual and interaction conventions; the document makes no claim of verified live authentication or cloud connectivity.

### Mode Switch

The persistent dock pairs a readable mode label and hint with a physical sliding switch. Its knob shifts horizontally when checked, while the track becomes burgundy. Keep the return to Full desk reachable in shortcut mode.

## Do's and Don'ts

### Do:

- **Do** preserve the illustrated wooden desk logo and the confirmed three-family type hierarchy.
- **Do** retain tactile highlights, paper surfaces, and pressed states across new components.
- **Do** provide 44px interaction targets and visible keyboard focus.
- **Do** retain the Add Website tile, mode switch, and operation-specific feedback.
- **Do** use the final stylesheet cascade as the implementation reference.

### Don't:

- **Don't** replace the confirmed skeuomorphic identity with flat generic cards.
- **Don't** restore Favorites, Recently Opened, or Resources as navigation panels.
- **Don't** rebuild the entire workspace for a local task change.
- **Don't** treat a missing cloud configuration as authenticated or synchronized success.

