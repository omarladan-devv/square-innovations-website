# Square Innovations International — Website

Static marketing website for Square Innovations International. Plain HTML, CSS
and JavaScript — no build step, no framework, no dependencies to install.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `solutions.html` | Solutions |
| `industries.html` | Industries |
| `about.html` | About |
| `contact.html` | Contact |

Shared assets: `site.css` (all styling and design tokens), `app.js` (menu,
scroll reveals, architecture/process/industry selectors, enquiry form),
`logo.png` (logo mark, transparent background).

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploy

Upload the folder to any static host — Netlify, Vercel, Cloudflare Pages,
GitHub Pages, or ordinary shared hosting via cPanel/FTP. Nothing to build;
`index.html` is the entry point.

For GitHub Pages: push this folder to a repository, then enable Pages in
**Settings → Pages** with the branch root as the source.

## Design system

All colours, fonts and spacing live in the `:root` block at the top of
`site.css`.

- Typefaces: Sora (headings), IBM Plex Sans (body), IBM Plex Mono (labels),
  loaded from Google Fonts.
- Background: `--bg` dark navy `#0a1322`.
- Brand gradient: `--grad`, `#4d8dff → #22c9ea → #6ee7a8`. Blue and cyan carry
  the brand; green is reserved for live status, data flow and success.
- Motion: sections fade and rise into view via `IntersectionObserver` in
  `app.js`. Everything respects `prefers-reduced-motion`.

## Interactive pieces

- **Architecture panel** (home hero) — four layers; hover or click a layer and
  the note below explains it. Data packets animate down the connections.
- **From problem to platform** (home, solutions, about) — four-stage process;
  each stage swaps the detail panel.
- **Industry selector** (home, industries) — select a sector to see what gets
  built for it.

Content for all three lives in `build.py`-generated markup as `data-` attributes
on the buttons, so copy can be edited directly in the HTML.

## Enquiry form

The contact form validates input and assembles the enquiry for the visitor to
copy and email. It does not send mail on its own. To make it submit directly,
point the form at a form service (Formspree, Web3Forms) or your own endpoint —
see the `#enq` submit handler in `app.js`.

## Before launch

- Add the real LinkedIn and X URLs — the footer currently lists them as plain
  text, not links.
- Add `social-preview.png` (1200×630) to this folder, and set your domain in
  the `og:image` tags at the top of each page (currently a relative path).
- Confirm the "within two business days" response promise on the contact page.
- Add phone numbers to the contact page if they should be public.
- Add a `Work` / case-studies page once there are projects you can name.
