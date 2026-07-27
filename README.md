# Wine Pantry

A personal archive of a home wine hobby: wines tried, charcuterie boards, main course pairings, and wine bars visited.

Plain HTML/CSS/JS, no build step. Not hosted yet.

## Structure

- `index.html`, `boards.html`, `cookbook.html`, `winebars.html`, `references.html`, `about.html` — one page per section
- `css/style.css` — shared styles
- `js/main.js` — shared nav + data-rendering helpers
- `data/*.json` — one JSON file per section; each page reads its file and renders cards
- `source-material/` — photos/notes with raw info to be transcribed into `data/*.json` (not for direct publishing, just working source)

## Viewing locally

Because pages fetch their `data/*.json` via `fetch()`, opening the HTML files directly (`file://`) may be blocked by the browser's CORS policy. Serve the folder instead, e.g.:

```
python3 -m http.server
```

then visit `http://localhost:8000`.

## Adding content

Add a new object to the relevant `data/*.json` file (and a photo under `source-material/<section>/` if relevant) — no other changes needed, the page picks it up automatically.

## About page and social card

`about.html` and the `og:image`/`twitter:image` meta tags reference `images/about.jpg` and `images/social-card.jpg`, which aren't included yet — add those photos under `images/` once you have them.
