# MET website

Public site for Michigan Electronic Trading (MET), a University of Michigan student organization. It's a static marketing site hosted on Vercel.

## Stack
- Next.js with the App Router and TypeScript.
- Plain CSS: one global stylesheet for tokens, plus CSS Modules per component.
- No Tailwind, UI kits or animation libraries.
- Fonts come from `next/font/google`:
  - **Red Hat Display:** headings, the club name, card titles.
  - **Red Hat Text:** body text and buttons.
  - **Red Hat Mono:** labels, section headers and tickers.

## Source of truth
- `design/pages/*.dc.html` holds the approved designs. Match them exactly, and read `design/README.md` for how the files work.
- Don't rewrite copy or "improve" the design without being asked.

## Tokens
| Token | Value | Used for |
|---|---|---|
| Navy | `#0B1B33` | Header, footer, page header bands |
| Gold | `#D9A21B` | Logo pins |
| Text gold | `#B8860B` / `#C08F12` | Gold text and small accents |
| Cream | `#F4EFE4` | Section background |
| Off-white | `#FAF8F3` | Section background |
| Light grey | `#ECEBE7` | Section background |
| Ink | `#111111` | Text, borders, buttons |

Sections alternate cream and off-white, starting with cream, in the order they appear on the page (hidden sections are skipped). Light grey is no longer used for sections.

## Rules
- **Content lives in `src/data/*.ts`.** That covers desks, members, board, sponsors, placements and recruiting. Components read from it and never hard-code lists.
- **Recruiting state** is one value, `recruiting.status`, set to `"open"` or `"closed"`. It controls Home's Join section and the Join page header.
- **Sponsors.**
  - Sponsor sections and the Home sponsor strip render nothing when the sponsor list is empty.
  - Placeholder logos are marked `placeholder: true` in data and must never reach production.
- **Forms are external links** (Register Interest, Apply). The site never collects data itself.
- **Motion:**
  - Scrolling logo strips pause on hover.
  - All animation stops under `prefers-reduced-motion`.
- **Naming:** never use "UMich", "UM", "U-M" or "University of Michigan" at the start of names or URLs, per UMich's student org naming policy.

## Out of scope unless asked
- Backend, API routes, database, auth, CMS, analytics and newsletter signup.
- Deploying, pushing, or creating remote repos.
