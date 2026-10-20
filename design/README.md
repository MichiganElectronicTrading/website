# MET website: design reference

These files are the approved designs for the Michigan Electronic Trading site. Build the site to match them. Don't ship anything from this folder as-is.

## Pages

| File | Route | Notes |
|---|---|---|
| `pages/01-home.dc.html` | `/` | Join section shows the **closed** state |
| `pages/02-desks.dc.html` | `/desks` | |
| `pages/03-sponsors.dc.html` | `/sponsors` | |
| `pages/04-members.dc.html` | `/members` | |
| `pages/05-join.dc.html` | `/join` | Header shows the **closed** state |
| `pages/06-home-join-section-open.dc.html` | none | The Home Join section in its **open** state, for when applications are live |

## How to read a `.dc.html` file

Each file is one page mockup from a design tool:

- **Markup** is everything inside `<x-dc>`. The inline `style="…"` attributes are the exact spec for sizes, colors, spacing and borders.
- **Page-level CSS** (classes like `.lbl`, `.sec`, `.btn`, `.dark`, `.track`) is in `<helmet><style>`.
- **`{{name}}`** is a value computed in the `<script>` at the bottom of the file, inside `renderVals()`.
- **`<sc-for list="{{items}}" as="x">…</sc-for>`** repeats its children once per item in that list. `{{x.field}}` reads from the current item.
- Ignore these, which belong to the design tool only: `support.js`, `data-props`, `$preview` and `hint-placeholder-count`.
- Links already point at the real routes.

## Content rules

- Text in `[square brackets]` is a placeholder. Keep it as-is; real content comes later.
- `assets/placeholder-logos/` holds **made-up firms**. They exist only so the sponsor and placement layouts can be seen. They must never ship to production.
- The headshot and hero photo in `assets/` are real and can be used.
- `assets/met-mark-white.svg` and `met-mark-navy.svg` are the MET logo mark: a white or navy M with gold pins.

## Reference

`reference/met-live-chip.html` is the working animated version of the chip illustration in Home's About section. It's not part of the first build pass.
