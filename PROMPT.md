Build the Michigan Electronic Trading (MET) website in this repo from the designs in /design.

Read these first: CLAUDE.md, design/README.md, then every file in design/pages/.

## Build
- **Setup:** Next.js (App Router, TypeScript), fully static.
- **Routes:** `/` from 01-home, `/desks` from 02, `/sponsors` from 03, `/members` from 04, `/join` from 05.
- **Faithful port:** match each design page exactly, with the same sections, order, copy, colors, font sizes, spacing and borders. The inline styles in the design files are the spec. Keep `[bracketed]` placeholders as they are.
- **Header and Footer:** shared components, identical on every page. The current page's nav link is bold and underlined, and Join is always a button.
- **Fonts:** Red Hat Display, Text and Mono via `next/font/google`, used as described in CLAUDE.md.
- **Tokens:** brand colors are CSS variables in one global stylesheet.
- **Data:** repeated content goes in `src/data/*.ts`:
  - desk stages and desks
  - board and members
  - sponsors by tier
  - member placements
  - recruiting (`status`, steps, dates, form URLs)

  Mirror what the designs show and keep it simple. I'll wire real data myself.
- **Recruiting toggle:** `recruiting.status` switches Home's Join section and the Join page header between closed (01-home, 05-join) and open (06-home-join-section-open). The open Join page header uses a gold tag reading "Applications open" and an Apply button in place of Get Notified.
- **Sponsors:**
  - Sections render nothing when the sponsor list is empty.
  - Seed the data with the placeholder logos from design/assets/placeholder-logos so the layout is visible, and mark every entry `placeholder: true`.
- **Interactions to keep:**
  - desk filter (All / Research / Execution)
  - member filter (All / Trading / Engineering)
  - FAQ accordions
  - Home sponsor strip and the two-row placements strip on Members. One row scrolls each direction, they pause on hover, and they stop under `prefers-reduced-motion`.
  - pulsing gold dot on the open state
- **Home About illustration:** render the static chip illustration exactly as in 01-home (SVG plus the 0s and 1s, arrows and tickers). The animated version is a later prompt.
- **Assets:** copy the images you use from design/assets into public/.

## Constraints
- **Desktop only this pass.** Keep the wrapping the designs already have, but no phone-specific work; that's the next prompt.
- **Stay small:** no backend, API routes, database, auth, CMS, analytics, Tailwind, or UI or animation libraries.
- **Checks only:** you can run `npm install`, `npm run dev` and `npm run build` to check your work. Do not deploy, push, or create remote repos.
- **Finish clean:** the build must pass with no type errors.

## When you're done
List:
1. anything from the designs you couldn't match exactly, and
2. the files I should edit to change content.
