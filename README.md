# Michigan Electronic Trading Website

Public site for Michigan Electronic Trading (MET), built with Next.js and TypeScript and hosted on Vercel.

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

To check a production build:

```bash
npm run build
```

## Project layout

- `src/app/`: pages (Home, Desks, Sponsors, Members, Join)
- `src/components/`: shared components, each with its own CSS Module
- `src/data/`: site content (desks, members, sponsors, placements, recruiting)
- `design/`: approved page designs and reference files; see `design/README.md`

## Editing content

Text and lists live in `src/data/*.ts`, so most updates don't need component changes. To open or close recruiting, set `recruiting.status` to `"open"` or `"closed"` in `src/data/recruiting.ts`.

## Deploying

Vercel deploys `main` to production and builds a preview for every other branch.
