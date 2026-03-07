---
paths:
  - 'src/ui/**/*'
---

# UI Module Rules

## Approach

- **Vanilla DOM**: No frameworks. Create elements via `document.createElement()`.
- **Inline CSS**: Styles injected via `<style>` elements created in JS. No external CSS files.
- **Functions, not classes**: Export render functions like `renderMainMenu(container, ...)`.

## Theme Palette

- Background: `#07070a` (body), `#0a0a10` (navbar), `#0e0e14` (panels), `#12121a` (cards)
- Border: `#1a1a24`, `#1e1e2a`, `#2a2a3a`
- Text: `#c8c8d0` (body), `#e0e0e8` (headings), `#888` (secondary), `#666` (muted)
- Accent: `#5588ff` (blue), `rgba(85, 136, 255, 0.08)` (blue bg)
- Interactive: hover borders `#3a3a55`, hover text `#ddd`

## Module Boundaries

- **Auth imports**: Only `auth-store.ts` and `auth-service.ts`. Never `supabase-client.ts` directly.
- **Navigation**: Use `navigateTo()` from `src/navigation.ts`.
- **DB access**: Import CRUD functions from `src/db/`. Never construct Supabase queries in UI code.
- **Simulation imports**: Only `src/simulations/types.ts` and `src/simulations/registry.ts`. Never import specific simulation internals.
