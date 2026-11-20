"""Build the HTML deck from template.html.

Writes artifact.html (published copy, Google Fonts), index.html (offline copy, fonts/ folder)
and speaker-notes.html (all notes by slide number). Run: python3 make.py
"""
import re, html
from pathlib import Path

H = Path(__file__).resolve().parent
data = (H.parent / "assets" / "html_data.json").read_text()
t = (H / "template.html").read_text()
b = t.replace("/*__DATA__*/", data)
(H / "artifact.html").write_text(b)

gl = re.search(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com[^>]+>', b).group(0)
local = b.replace(gl, '<link rel="stylesheet" href="fonts/fonts.css">')
local = local.replace('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n', "")
(H / "index.html").write_text('<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' + local + "\n</html>\n")

secs = re.findall(r'<section class="slide[^"]*" data-part="(\d)" data-notes="([^"]*)">(.*?)</section>', t, re.S)
parts = ["Opening", "Part 1 · Why count words?", "Part 2 · What are we counting?", "Part 3 · Frequency", "Part 4 · Association", "Part 5 · Embeddings", "Part 6 · Pitfalls"]
rows, last = [], None
for n, (part, notes, body) in enumerate(secs, 1):
    m = re.search(r"<h[12][^>]*>(.*?)</h[12]>", body, re.S)
    title = re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", m.group(1))).strip() if m else ""
    if part != last and int(part) > 0:
        rows.append(f"<h2>{parts[int(part)]}</h2>")
    last = part
    rows.append(f"<article><h3><span>{n}</span> {title}</h3><p>{notes}</p></article>")
page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Counting the Past: speaker notes</title>
<link rel="stylesheet" href="fonts/fonts.css">
<style>
:root {{ --ink:#17222D; --muted:#6E7A84; --rule:#D6DCDF; --accent:#1c5cab; color-scheme: light; }}
body {{ background:#fff; color:var(--ink); font: 16px/1.55 "IBM Plex Sans", Arial, sans-serif; margin:0; padding: 32px max(16px, 6vw); }}
h1 {{ font-family:"Libre Caslon Display", Georgia, serif; font-weight:400; font-size:40px; margin:0 0 4px; }}
.sub {{ color:var(--muted); margin:0 0 28px; }}
h2 {{ font-family:"Libre Caslon Text", Georgia, serif; font-size:22px; color:var(--accent); border-bottom:2px solid var(--ink); padding-bottom:6px; margin:36px 0 8px; }}
article {{ border-bottom:1px solid var(--rule); padding:12px 0; break-inside: avoid; max-width: 860px; }}
h3 {{ font-family:"Libre Caslon Text", Georgia, serif; font-size:19px; margin:0 0 4px; }}
h3 span {{ font: 500 14px "IBM Plex Mono", monospace; color:var(--muted); display:inline-block; min-width:2.2em; }}
p {{ margin:0; }}
@media print {{ body {{ padding: 0; font-size: 11pt; }} h2 {{ break-after: avoid; }} }}
</style></head><body>
<h1>Counting the past</h1><p class="sub">Speaker notes · {len(secs)} slides · slide numbers match the HTML deck</p>
{"".join(rows)}
</body></html>'''
(H / "speaker-notes.html").write_text(page)
print(f"{len(secs)} slides: artifact.html, index.html, speaker-notes.html")
