# Book & Notes Vault

A calm, iOS-inspired reading tracker for keeping every book I read in one place. Built with vanilla HTML, CSS and JavaScript for the **Building Responsive UI** summative (Frontend Web Development, ALU).

**Theme:** Book & Notes Vault
**Live site (GitHub Pages):** https://fiinsikabore.github.io/REPO-NAME/
**Demo video (unlisted):** ADD-LINK-HERE

---

## Overview

The vault stores books with their title, author, page count, tag and the date I added them. It shows reading stats on a dashboard, lets me search my shelf with regular expressions, and keeps everything in the browser with `localStorage`, so nothing is lost on reload.

The visual direction comes from my own moodboard: soft white tiles on a light grey background, grey sentences with bold black keywords, pink and lime glows, a calendar / stamp / CD widget stack, and pixel-mosaic book covers generated from each book's tag colour.

## Features

- **Dashboard:** total books, total pages, top tag, last-7-days chart, and a "last added / top tag / now reading" widget stack
- **Pages goal (cap):** set a target; the remaining pages are announced politely, and an overage is announced assertively
- **Library:** book cards (grid on mobile and tablet, table on desktop) with sorting by date, title (A→Z / Z→A) and pages (↑ / ↓)
- **Live regex search:** safe compiler with `try/catch`, case-insensitive toggle, matches highlighted with `<mark>`
- **Add / edit form:** live validation with inline error messages and a live summary card
- **Inline edit and delete:** edit a book in place; delete asks for confirmation; `updatedAt` refreshes on every change
- **Units:** convert total pages to reading hours using a pages-per-hour setting
- **Data:** auto-save to `localStorage`, JSON export (download), JSON import with structure validation
- **Accessibility:** landmarks, skip link, visible focus, labelled inputs, ARIA live regions, keyboard-only flow
- **Responsive:** mobile-first with breakpoints at 360px, 768px and 1024px; floating tab bar on mobile, sidebar on desktop

## Getting started

```bash
git clone https://github.com/fiinsikabore/REPO-NAME.git
cd REPO-NAME
```

Open `index.html` with a local server (ES modules do not load from `file://`), for example the VS Code **Live Server** extension, or:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

To load sample data, go to **Settings → Import JSON** and choose `seed.json`.

## File structure

```
├── index.html
├── tests.html
├── seed.json
├── README.md
├── .gitignore
├── styles/
│   └── main.css
├── scripts/
│   ├── main.js         # entry point, wires everything together
│   ├── state.js        # in-memory list of books, add / update / delete
│   ├── storage.js      # localStorage load / save, JSON import / export
│   ├── validators.js   # all regex rules and error messages
│   ├── search.js       # safe regex compiler, filter, highlight
│   └── ui.js           # rendering, events, dashboard, forms
└── assets/
```

## Data model

```json
{
  "id": "book_004",
  "title": "Serpent & Dove",
  "author": "Shelby Mahurin",
  "pages": 528,
  "tag": "Fantasy",
  "dateAdded": "2026-10-06",
  "createdAt": "2026-10-06T11:20:00Z",
  "updatedAt": "2026-10-06T11:20:00Z"
}
```

## Regex catalog

| Rule | Pattern | Passes | Fails |
|---|---|---|---|
| Title / author: no leading or trailing spaces | `/^\S(?:.*\S)?$/` | `Serpent & Dove` | `" Serpent & Dove"` |
| No double spaces | `/ {2,}/` (must **not** match) | `The Way of Kings` | `The  Way of Kings` |
| Pages (number, up to 2 decimals) | `/^(0\|[1-9]\d*)(\.\d{1,2})?$/` | `528`, `52`, `1007` | `0528`, `52 8`, `12.345` |
| Date (YYYY-MM-DD) | `/^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$/` | `2024-02-29` | `2025-13-01`, `29/02/2024` |
| Tag (letters, spaces, hyphens) | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/` | `Dark Romance`, `Non-Fiction` | `Fantasy!`, `Sci--Fi` |
| **Advanced:** repeated word (back-reference) | `/\b(\w+)\s+\1\b/i` (must **not** match) | `Kingdom of the Wicked` | `Kingdom of the Wicked Wicked` |

**Search patterns to try**

| Pattern | Finds |
|---|---|
| `azra\|rivens` | books by Azra Reed or Sarah Rivens |
| `^the` | titles starting with "The" |
| `tome \d` | numbered volumes |
| `kingdom` | every "Kingdom" title |
| `(` | an invalid pattern: the app shows a message instead of crashing |

## Keyboard map

| Key | Action |
|---|---|
| `Tab` / `Shift + Tab` | Move between links, buttons, fields and book cards |
| `Enter` on the skip link | Jump straight to the main content |
| `Enter` / `Space` on a book card | Show its actions (Edit, Mark as read, Delete) |
| `Escape` | Close a book's actions or cancel an inline edit |
| `Enter` in the form | Save the book |

## Accessibility notes

- Semantic landmarks: `header`, `nav`, `main`, `section`, `footer`, with one `h1` per view
- Skip-to-content link is the first focusable element
- Every input has a `<label>`; errors are linked with `aria-describedby` and fields get `aria-invalid`
- Search results count and form messages use `role="status"`
- Pages goal: under the goal uses `aria-live="polite"`, over the goal uses a separate `aria-live="assertive"` region
- Visible focus ring on every interactive element
- Highlights use `<mark>`, so screen readers still read the full title
- Text colours checked against WCAG AA (4.5:1 for body text)
- Animations are turned off when the user prefers reduced motion

## Seed data

`seed.json` holds 12 real books chosen to test edge cases:

- **Edge dates:** a leap day (`2024-02-29`), the first and last day of a year, and recent dates so the last-7-days chart shows data
- **Small and large numbers:** 52 pages up to 1 007 pages
- **Tricky strings:** `&`, an accented author (`Mariama Bâ`), a French colon with spaces, hyphens in titles, and a hyphenated tag (`Non-Fiction`)

## Running the tests

Open `tests.html` in the browser (with the same local server). It imports `scripts/validators.js` and `scripts/search.js`, runs small assertions on every regex rule and on the safe compiler, and prints a green or red line for each check.

## Milestones

| Milestone | Status |
|---|---|
| M1: spec and wireframes | ✅ |
| M2: semantic HTML and base CSS | ⬜ |
| M3: forms and regex validation | ⬜ |
| M4: render, sort and regex search | ⬜ |
| M5: stats and cap | ⬜ |
| M6: persistence, import / export, settings | ⬜ |
| M7: polish and accessibility audit | ⬜ |

## Contact

Fiinsi Kabore
GitHub: [@fiinsikabore](https://github.com/fiinsikabore)
Email: ADD-YOUR-EMAIL