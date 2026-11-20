# Lecture deck: "Counting the past" (v4, 2026-11-15)

`build.js` regenerates the lecture deck that goes with the marimo lab (pptxgenjs).
Output used in class: OneDrive Teaching/2026-2027/Digital History/
"Counting the past - quantitative text analysis lecture (v4).pptx" (v4: one message per slide, overview + method cards + tracker).
`build_v3.js` = the v3 deck (dense, electricity added). `build_v2.js` = the v2 deck (Old Bailey cross-examination thread), kept for reference.

Run: `NODE_PATH=<folder with pptxgenjs@3.12.0 in node_modules> node build.js out.pptx`
(the theme step uses the pptx skill's apply_theme.js; path is hard-coded at the top).

assets/
- media/          images reused from the v1 deck
- delpher/crop.jpg  Noordhollandsche courant, 3 May 1780, p. 2 (Delpher, ddd:010721469:mpeg21:p002); OCR text typed into build.js from the page ALTO
- ngram/          Google Books Ngram JSON, "Marc Chagall", en-2019 / de-2019, 1910-1955, smoothing 1
- pnas/fig1_top.jpg  Klingenstein, Hitchcock & DeDeo, PNAS 2014, Fig. 1 top panel (PMC4084475)
- xexam.json      % of sample trials containing "cross-exam*" (and "Mr. Garrow"), by decade

All other Old Bailey numbers (co-occurrence matrix, n-gram shares, cosines, neighbours,
KWIC lines) were computed from public/trials_sample.parquet and public/vectors_*.parquet
and are written into build.js as literals.
- rsc/            electricity example (v3): elec_bigrams.json (electric(al) + noun per million words, 25-year periods),
                  elec_groups.json (context-word groups within 5 words), and the scripts that made them
                  (load.py builds a full-corpus parquet from build/rsc_raw; then groups2.py / bigr.py)

## HTML deck (2026-11-15)
`html/` = animated HTML version of v4 (same content): `template.html` is the source (chart data injected at
`/*__DATA__*/` from the assets JSON), `index.html` = local offline copy (open in Chrome; ← → / click, N notes,
F full screen), `artifact.html` = the copy published at https://claude.ai/artifact/KXvPHvj8pbKdC7C7xzjNN7 (private).
Images in html/media. Fonts load from Google Fonts (falls back to Georgia/Arial offline).

## v6 (2026-11-16)
`build.js` = v6 (build_v5.js, build_v4.js kept). HTML: `html/index.html` is the offline version (local fonts in
`html/fonts/`, images in `html/media/`); open it in Chrome. Press P (or the Presenter button) for a presenter
window with notes, next slide and timer, kept in sync with the main window. `html/speaker-notes.html` lists
all notes by slide number (printable). `html/artifact.html` is the published copy (Google Fonts instead of local).
To copy the HTML deck elsewhere, copy the whole `html/` folder (index.html + fonts/ + media/).
