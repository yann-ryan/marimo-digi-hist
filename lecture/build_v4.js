// Counting the past: quantitative text analysis lecture (v4, 2026-11-15): one message per slide, detail in notes
const pptxgen = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const { applyTheme } = require("/Users/Yann/.claude/skills/synced/2d663f92-2579-45b3-995c-f97c414f1d7b_817c7bc7-7bd7-4911-a980-978d99d04dcc/pptx/scripts/apply_theme.js");

const L = __dirname;
const MEDIA = L + "/assets/media/";
const EXT = L + "/assets/";
const OUT = process.argv[2] || L + "/deck.pptx";

const THEME = {
  name: "Counting the past",
  headFontFace: "Cambria",
  bodyFontFace: "Calibri",
  colors: {
    dk1: "1A1A1A", lt1: "FFFFFF", dk2: "1D2B3A", lt2: "EEF1F4",
    accent1: "1F6F8B", accent2: "C8553D", accent3: "E0A458", accent4: "5B8C5A",
    accent5: "7A6C9E", accent6: "8A9BA8", hlink: "1F6F8B", folHlink: "7A6C9E",
  },
};
const HEX = THEME.colors;
const MUTED = "5E6B76";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";
pres.author = "Yann Ryan";
pres.title = "Counting the past: quantitative text analysis for historical research (v4)";
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
const C = pres.SchemeColor;
const W = 13.333, H = 7.5, M = 0.6, CW = W - 2 * M;

// ---------- layouts ----------
pres.defineSlideMaster({
  title: "Title Dark",
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 2.3, w: 11.5, h: 1.3, fontSize: 54, align: "left", color: C.background1, valign: "bottom", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: M, y: 3.75, w: 11, h: 0.6, fontSize: 22, color: C.accent3, valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "byline", type: "body", x: M, y: 4.4, w: 11, h: 0.5, fontSize: 15, color: C.background2, valign: "top", margin: 0 }, text: "" } },
  ],
});
pres.defineSlideMaster({
  title: "Section Divider",
  background: { color: HEX.dk2 },
  objects: [
    { placeholder: { options: { name: "kicker", type: "body", x: M, y: 2.5, w: 11, h: 0.45, fontSize: 16, bold: true, color: C.accent3, margin: 0 }, text: "" } },
    { placeholder: { options: { name: "title", type: "title", x: M, y: 3.0, w: 11.5, h: 1.1, fontSize: 44, align: "left", color: C.background1, valign: "top", margin: 0 }, text: "" } },
    { placeholder: { options: { name: "body", type: "body", x: M, y: 4.25, w: 11, h: 0.6, fontSize: 18, color: C.background2, valign: "top", margin: 0 }, text: "" } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 9, color: HEX.accent6, align: "right" },
});
pres.defineSlideMaster({
  title: "Content",
  background: { color: HEX.lt1 },
  objects: [
    { placeholder: { options: { name: "title", type: "title", x: M, y: 0.32, w: CW, h: 0.8, fontSize: 30, align: "left", color: C.text2, valign: "middle", margin: 0 }, text: "" } },
    { text: { text: "Quantitative text analysis · Digital History", options: { x: M, y: 7.0, w: 6, h: 0.3, fontSize: 9, color: HEX.accent6, margin: 0 } } },
  ],
  slideNumber: { x: 12.2, y: 7.0, w: 0.6, h: 0.3, fontSize: 9, color: HEX.accent6, align: "right" },
});

// ---------- helpers ----------
let section = "";
function sec(title) { section = title; pres.addSection({ title }); }
function content(title, notes) {
  const s = pres.addSlide({ masterName: "Content", sectionTitle: section });
  s.addText(title, { placeholder: "title" });
  if (notes) s.addNotes(notes);
  return s;
}
const PARTS = ["Why count?", "Data", "Frequency", "Association", "Embeddings", "Pitfalls"];
function divider(n, title, body, notes) {
  const s = pres.addSlide({ masterName: "Section Divider", sectionTitle: section });
  s.addText("Part " + n, { placeholder: "kicker" });
  s.addText(title, { placeholder: "title" });
  s.addText(body, { placeholder: "body" });
  // "you are here" tracker
  const w = CW / PARTS.length;
  PARTS.forEach((p, i) => {
    const cur = i + 1 === n, done = i + 1 < n;
    s.addShape(pres.shapes.RECTANGLE, { x: M + i * w + 0.04, y: 5.9, w: w - 0.08, h: 0.06, fill: { color: cur ? HEX.accent3 : done ? "8A9BA8" : "3A4A5A" }, line: { type: "none" }, objectName: "tracker " + p });
    s.addText(p, { isTextBox: true, x: M + i * w, y: 6.02, w, h: 0.35, margin: 0, fontSize: 12, bold: cur, color: cur ? HEX.accent3 : done ? "B8C4CE" : "6F7F8E", align: "center" });
  });
  if (notes) s.addNotes(notes);
  return s;
}
function txt(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontSize: 15, color: C.text1, valign: "top" }, o)); }
function caption(s, text, y = 6.55) { txt(s, text, { x: M, y, w: CW, h: 0.35, fontSize: 10.5, italic: true, color: MUTED }); }
function box(s, x, y, w, h, fill = C.background2, name = "card") {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { type: "none" }, objectName: name });
}
function card(s, x, y, w, h, head, body, o = {}) {
  box(s, x, y, w, h, o.fill || C.background2, head + " card");
  txt(s, head, { x: x + 0.2, y: y + 0.18, w: w - 0.4, h: 0.4, fontSize: o.headSize || 17, bold: true, color: o.headColor || C.accent1, fontFace: THEME.headFontFace });
  txt(s, body, { x: x + 0.2, y: y + 0.62, w: w - 0.4, h: h - 0.75, fontSize: o.bodySize || 14, color: o.bodyColor || C.text1 });
}
function chip(s, x, y, w, h, text, fill, color = C.background1, size = 13, bold = false) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h, rectRadius: 0.06, fill: { color: fill }, line: { type: "none" }, objectName: "chip " + text });
  txt(s, text, { x, y, w, h, align: "center", valign: "middle", fontSize: size, color, bold });
}
function numBadge(s, x, y, n, fill = C.accent1) {
  s.addShape(pres.shapes.OVAL, { x, y, w: 0.5, h: 0.5, fill: { color: fill }, line: { type: "none" }, objectName: "badge " + n });
  txt(s, String(n), { x, y, w: 0.5, h: 0.5, align: "center", valign: "middle", fontSize: 16, bold: true, color: C.background1 });
}
function arrowRight(s, x, y, w = 0.35, h = 0.3, fill = C.accent6) {
  s.addShape(pres.shapes.RIGHT_ARROW, { x, y, w, h, fill: { color: fill }, line: { type: "none" }, objectName: "arrow" });
}
function img(s, file, x, y, w, h, alt, sizing = true) {
  const o = { path: file, x, y, w, h, altText: alt, objectName: alt };
  if (sizing) o.sizing = { type: "contain", w, h };
  s.addImage(o);
}
function imgSize(file) {
  // read pixel size via sips output cached by caller; fallback square
  const b = fs.readFileSync(file);
  if (b[0] === 0x89) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  // JPEG: scan for SOF
  let i = 2;
  while (i < b.length) {
    if (b[i] !== 0xff) { i++; continue; }
    const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return { w: 1, h: 1 };
}
// image fitted inside a box, centred; returns the drawn rect
function fit(s, file, x, y, w, h, alt, align = "center") {
  const d = imgSize(file), r = Math.min(w / d.w, h / d.h);
  const iw = d.w * r, ih = d.h * r;
  const ix = align === "left" ? x : x + (w - iw) / 2;
  s.addImage({ path: file, x: ix, y: y + (h - ih) / 2, w: iw, h: ih, altText: alt, objectName: alt });
  return { x: ix, y: y + (h - ih) / 2, w: iw, h: ih };
}
const AX = { catAxisLabelColor: MUTED, valAxisLabelColor: MUTED, catAxisLabelFontFace: "+mn-lt", valAxisLabelFontFace: "+mn-lt", catAxisLabelFontSize: 11, valAxisLabelFontSize: 11, valGridLine: { color: "DDE3E8", size: 0.5 }, catGridLine: { style: "none" }, catAxisLineShow: false, valAxisLineShow: false, legendFontFace: "+mn-lt", legendFontSize: 12, legendColor: "333333", dataLabelFontFace: "+mn-lt", titleFontFace: "+mn-lt" };
function chartOpts(extra) { return Object.assign({}, JSON.parse(JSON.stringify(AX)), extra); }
// highlighted run helper: text with [[err]] marks
function marked(str, base, mark) {
  const runs = [];
  str.split(/(\[\[.*?\]\])/).forEach((p) => {
    if (!p) return;
    if (p.startsWith("[[")) runs.push({ text: p.slice(2, -2), options: Object.assign({}, base, mark) });
    else runs.push({ text: p, options: Object.assign({}, base) });
  });
  return runs;
}

// ---------- data ----------
const ebg = JSON.parse(fs.readFileSync(EXT + "rsc/elec_bigrams.json")).filter((d) => !d.period.startsWith("1700"));
const egr = JSON.parse(fs.readFileSync(EXT + "rsc/elec_groups.json")).filter((d) => !d.period.startsWith("1700"));
const RSC_CAP = "Royal Society Corpus 6.0.4 Open, all 17,520 texts (1665–1920).";
const ch_en = JSON.parse(fs.readFileSync(EXT + "ngram/ch1_en-2019.json"))[0].timeseries;
const ch_de = JSON.parse(fs.readFileSync(EXT + "ngram/ch1_de-2019.json"))[0].timeseries;


// ---------- extra helpers (v4) ----------
// one short line under a visual: the slide's single message
function point(s, text, y = 6.0) { txt(s, text, { x: M, y, w: CW, h: 0.6, fontSize: 17, bold: true, color: C.text2 }); }
function src(s, text) { txt(s, text, { x: M, y: 6.62, w: CW, h: 0.3, fontSize: 10, italic: true, color: MUTED }); }
// big tile: label + one short phrase
function tile(s, x, y, w, h, label, phrase, o = {}) {
  box(s, x, y, w, h, o.fill || C.background2, label);
  txt(s, label, { x: x + 0.25, y: y + 0.22, w: w - 0.5, h: 0.45, fontSize: o.labelSize || 20, bold: true, fontFace: THEME.headFontFace, color: o.labelColor || C.accent1 });
  if (phrase) txt(s, phrase, { x: x + 0.25, y: y + 0.75, w: w - 0.5, h: h - 0.9, fontSize: o.size || 16, color: C.text1 });
}
// method card: four tiles + today's examples
function methodCard(title, notes, q, how, good, watch, today) {
  const s = content(title, notes);
  const items = [["The question", q, C.accent1], ["How it works", how, C.accent1], ["Good for", good, C.accent4], ["Watch out", watch, C.accent2]];
  items.forEach(([l, t, c], i) => tile(s, M + (i % 2) * 6.15, 1.4 + Math.floor(i / 2) * 1.95, 5.95, 1.75, l, t, { labelColor: c, size: 17, labelSize: 17 }));
  txt(s, "Today:", { x: M, y: 5.5, w: 1.0, h: 0.5, fontSize: 15, bold: true, color: MUTED, valign: "middle" });
  let x = M + 1.0;
  today.forEach((t) => { const w = 0.35 + t.length * 0.095; chip(s, x, 5.5, w, 0.5, t, C.accent1, C.background1, 13); x += w + 0.15; });
  return s;
}
function kwic(s, rows, y, colW, rowH = 0.52, fs = 14) {
  s.addTable(rows.map((r) => {
    const [yr, l, k, rr] = r;
    return [
      { text: yr, options: { color: MUTED, fontSize: 12 } },
      { text: "…" + l, options: { align: "right", fontSize: fs } },
      { text: k, options: { bold: true, color: HEX.accent2, align: "center", fontSize: fs } },
      { text: rr + "…", options: { fontSize: fs } },
    ];
  }), { x: M, y, w: CW, colW, rowH, valign: "middle", border: { type: "solid", color: "DDE3E8", pt: 0.75 }, fill: { color: HEX.lt1 }, margin: [0.03, 0.08, 0.03, 0.08] });
}

// =====================================================================
sec("Opening");
{
  const s = pres.addSlide({ masterName: "Title Dark", sectionTitle: section });
  s.addText("Counting the past", { placeholder: "title" });
  s.addText("Quantitative text analysis for historical research", { placeholder: "body" });
  s.addText("Dr Yann Ryan · Digital History 2026–27", { placeholder: "byline" });
  s.addNotes("Lecture in the week before the hands-on lab. Theory and examples here; next week students try the methods themselves in marimo notebooks on the Old Bailey Proceedings and the Royal Society's journals.");
}
{
  const s = content("Outline", "Roadmap. Part 1: why historians count words at all, what the field is called and what methods exist. Part 2: where the data comes from. Parts 3–5: the three methods we use in the lab, each opened with a 'method card' (question, how it works, good for, watch out). Part 6: what goes wrong. The tracker at the bottom of each section slide shows where we are. Two running examples: trials at the Old Bailey (1674–1913) and the Royal Society's journals (1665–1920).");
  const steps = [["Why count?", C.accent6], ["Data", C.accent6], ["Frequency", C.accent1], ["Association", C.accent1], ["Embeddings", C.accent1], ["Pitfalls", C.accent6]];
  steps.forEach(([a, f], i) => {
    const x = M + i * 1.78;
    s.addShape(pres.shapes.CHEVRON, { x, y: 2.2, w: 1.75, h: 0.95, fill: { color: f }, line: { type: "none" }, objectName: "step " + a });
    txt(s, a, { x: x + 0.32, y: 2.2, w: 1.15, h: 0.95, align: "center", valign: "middle", fontSize: 12.5, bold: true, color: C.background1 });
  });
  chip(s, M + 6 * 1.78 + 0.1, 2.2, 1.45, 0.95, "Lab next week", C.accent2, C.background1, 14, true);
  txt(s, "Blue: the three methods you will try in the lab", { x: M, y: 3.35, w: 10, h: 0.4, fontSize: 14, italic: true, color: MUTED });
  point(s, "Two running examples: Old Bailey trials and the Royal Society’s journals.", 4.6);
}

// =====================================================================
sec("1 Why count words?");
divider(1, "Why count words?", "What text analysis is for, what it is called, and what it can do", "The big picture before any method.");
{
  const s = content("Why do text analysis?", "Five reasons. Scale: the Old Bailey Proceedings are about 123 million words, roughly three years of reading at eight hours a day; the Royal Society's journals another 64 million. Change: some patterns exist only across many texts, e.g. when 'electric fire' disappears. Comparison: what is typical of one group, period or place, compared with another. Finding: search and concordance point you to the few texts worth reading closely. Checking: a historian's generalisation ('everyone wrote about X') can be tested against the whole record, and the test can be repeated by someone else.");
  const r = [["Scale", "more than anyone can read"], ["Change", "patterns no single text shows"], ["Comparison", "what is typical of a group"], ["Finding", "where to read closely"], ["Checking", "test a claim against the whole record"]];
  r.forEach(([l, p], i) => {
    const x = M + i * 2.45;
    box(s, x, 1.5, 2.3, 2.9, C.background2, l);
    numBadge(s, x + 0.25, 1.75, i + 1);
    txt(s, l, { x: x + 0.25, y: 2.45, w: 1.9, h: 0.5, fontSize: 21, bold: true, fontFace: THEME.headFontFace, color: C.text2 });
    txt(s, p, { x: x + 0.25, y: 3.05, w: 1.9, h: 1.2, fontSize: 16 });
  });
  point(s, "The Old Bailey Proceedings contain about 123 million words, roughly three years of full-time reading.", 5.0);
}
{
  const s = content("Close and distant reading", "Close reading: Benjamin Franklin's letter to Peter Collinson, dated Philadelphia 1 October 1752 and read at the Royal Society on 21 December 1752 (Philosophical Transactions 47). How to make a kite that draws 'the electric fire' from a thunder-cloud; it claims to demonstrate that lightning and electricity are the same. For Franklin electricity is a fire: matter you can draw off, store in a Leyden jar and use to light spirits. Distant reading: 'electric fire' and 'electric current' per million words in the Royal Society's journals, 25-year periods. 'Electric fire' peaks in Franklin's time and is gone by 1800; 'electric current' takes off after 1825 (Volta's pile 1800, Ørsted 1820, Faraday). The letter shows what electricity was to Franklin; the counts show how long that idea was in use. The lecture combines reading and counting in this way throughout.");
  box(s, M, 1.45, 5.7, 4.3, C.background2, "close reading card");
  txt(s, "Close: one letter (Franklin, 1752)", { x: M + 0.3, y: 1.65, w: 5.1, h: 0.4, fontSize: 17, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
  txt(s, [
    { text: "“…the pointed wire will draw the ", options: {} },
    { text: "electric fire", options: { bold: true, color: C.accent2 } },
    { text: " from them [the clouds]…”", options: {} },
  ], { x: M + 0.3, y: 2.4, w: 5.1, h: 2.6, fontSize: 24, fontFace: THEME.headFontFace, italic: true });
  txt(s, "Distant: 64 million words", { x: 6.75, y: 1.65, w: 6, h: 0.4, fontSize: 17, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
  const lab = ebg.map((d) => d.period.slice(0, 4) + "–" + d.period.slice(-2));
  s.addChart(pres.charts.LINE, [
    { name: "electric fire", labels: lab, values: ebg.map((d) => d.fire) },
    { name: "electric current", labels: lab, values: ebg.map((d) => d.current) },
  ], chartOpts({ x: 6.6, y: 2.05, w: 6.2, h: 3.7, chartColors: [HEX.accent2, HEX.accent1], lineSize: 2.75, lineDataSymbol: "circle", lineDataSymbolSize: 6, showLegend: true, legendPos: "t", valAxisMinVal: 0, catAxisLabelFontSize: 10 }));
  point(s, "The letter shows how Franklin understood electricity; the counts show when that understanding was common.");
  src(s, "Philosophical Transactions 47 (1751–52); per million words, " + RSC_CAP);
}
{
  const s = content("Computers and historians since the 1940s", "Busa: the Index Thomisticus, the first large-scale humanities computing project. Cliometrics: econometrics applied to history, e.g. Fogel and Engerman's Time on the Cross; big claims, big controversies. 1980s backlash: the linguistic and cultural turn, Foucault, microhistories like The Cheese and the Worms. 1990s–2000s: mass digitisation and tools to analyse language. What is different now is that historians count the words in their sources as well as numerical data.");
  const items = [["image-4-1.jpeg", "1940s", "Busa’s concordance"], ["image-4-2.jpeg", "1960s–70s", "Cliometrics"], ["image-4-3.jpeg", "1980s", "The backlash"], ["image-4-4.jpg", "1990s–2000s", "Digitisation"], ["image-4-5.png", "Now", "Language at scale"]];
  const cw = CW / 5;
  s.addShape(pres.shapes.LINE, { x: M, y: 4.15, w: CW, h: 0, line: { color: HEX.accent6, width: 1.25 }, objectName: "timeline" });
  items.forEach(([f, yr, name], i) => {
    const x = M + i * cw;
    fit(s, MEDIA + f, x + 0.15, 1.4, cw - 0.3, 2.5, name);
    s.addShape(pres.shapes.OVAL, { x: x + cw / 2 - 0.09, y: 4.06, w: 0.18, h: 0.18, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "dot " + yr });
    txt(s, yr, { x, y: 4.35, w: cw, h: 0.35, align: "center", fontSize: 15, bold: true, color: C.accent2 });
    txt(s, name, { x, y: 4.75, w: cw, h: 0.45, align: "center", fontSize: 17, bold: true, fontFace: THEME.headFontFace, color: C.text2 });
  });
  point(s, "Historians now count the words in their sources as well as numerical data.", 5.75);
}
{
  const s = content("Names for the field", "The same family of methods travels under different names, depending on the discipline. Corpus linguistics (from the 1960s): language studied in large, designed corpora; gave us collocation and keyness. Humanities computing, later digital humanities: from Busa onwards. Distant reading: Franco Moretti's term (2000) for studying literature through patterns across thousands of books rather than close reading of a few. Culturomics: Michel et al. (2011), Google Books and the Ngram Viewer. Cultural analytics: Lev Manovich and others, culture as data. NLP and text mining: the computer-science toolbox behind all of them. For historians: digital or computational history. Further reading: Moretti, Distant Reading (2013); Ted Underwood, Distant Horizons (2019); Jo Guldi, The Dangerous Art of Text Mining (2023).");
  const n = [["Corpus linguistics", "language at scale"], ["Digital humanities", "from Busa onwards"], ["Distant reading", "patterns across thousands of books"], ["Culturomics", "Google Books and n-grams"], ["Cultural analytics", "culture as data"], ["NLP and text mining", "the computer-science toolbox"]];
  n.forEach(([l, p], i) => tile(s, M + (i % 3) * 4.1, 1.45 + Math.floor(i / 3) * 2.05, 3.9, 1.8, l, p));
  src(s, "Reading: Moretti, Distant Reading (2013) · Underwood, Distant Horizons (2019) · Guldi, The Dangerous Art of Text Mining (2023)");
}
{
  const s = content("A map of methods", "An overview of what is available; we do four today. Search and concordance: find every occurrence and read it in context. Frequency and n-grams: how often, and when. Collocation and keyness: which words keep company, and what distinguishes one set of texts from another (MI, TF-IDF). Word embeddings: meaning from context, and how it shifts. Not today: topic models (LDA; what are these texts about?), named entities and places (who and where; geoparsing), text reuse (who copied whom; e.g. passim, used to trace news across newspapers), classification (sorting texts into categories you define, with supervised machine learning, including sentiment), and large language models (summarising, extracting, asking questions of a corpus; powerful but hard to check). All of them start from the same move: turning text into countable units.");
  const m = [["Search & concordance", "Where is it? Read it in context", true], ["Frequency & n-grams", "How often, and when?", true], ["Collocation & keyness", "In what company? What is typical?", true], ["Word embeddings", "What does it mean? How did it change?", true], ["Topic models", "What are these texts about?", false], ["Names & places", "Who and where?", false], ["Text reuse", "Who copied whom?", false], ["Classification", "Which category is this text?", false], ["Large language models", "Summarise, extract, ask", false]];
  m.forEach(([l, q, today], i) => {
    const x = M + (i % 3) * 4.1, y = 1.4 + Math.floor(i / 3) * 1.65;
    box(s, x, y, 3.9, 1.45, today ? C.background2 : C.background1, l);
    if (!today) s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 3.9, h: 1.45, rectRadius: 0.08, fill: { type: "none" }, line: { color: "D5DCE2", width: 1 }, objectName: l + " outline" });
    txt(s, l, { x: x + 0.22, y: y + 0.2, w: 2.6, h: 0.45, fontSize: 17, bold: true, fontFace: THEME.headFontFace, color: today ? C.accent1 : MUTED });
    txt(s, q, { x: x + 0.22, y: y + 0.72, w: 3.5, h: 0.6, fontSize: 14, color: today ? C.text1 : MUTED });
    if (today) chip(s, x + 2.95, y + 0.2, 0.75, 0.32, "today", C.accent2, C.background1, 11, true);
  });
  src(s, "Today and in the lab: the four marked methods. The rest are for further study.");
}
{
  const s = content("The research process", "The research loop, with today's electricity example under each step. Question: what was electricity to the people who studied it? Corpus: the Royal Society's journals, 1665–1920. Prepare: lower-case, split into words, treat 'electric' and 'electrical' as one. Count: which noun follows 'electric' in each period. Read: go back to Franklin, Cavendish, Faraday. Interpret: electricity changes from a substance to a measured quantity. The results usually lead to a revised question. Every method today belongs to the counting step; the other steps depend on historical knowledge.");
  const st = [["Question", "What was electricity?"], ["Corpus", "Royal Society journals"], ["Prepare", "electric = electrical"], ["Count", "the word after ‘electric’"], ["Read", "Franklin, Faraday…"], ["Interpret", "a substance becomes a quantity"]];
  st.forEach(([a, b], i) => {
    const x = M + i * 2.06;
    chip(s, x, 1.9, 1.75, 0.75, a, i === 3 ? C.accent2 : C.accent1, C.background1, 16, true);
    if (i < 5) arrowRight(s, x + 1.78, 2.12, 0.26, 0.3);
    txt(s, b, { x, y: 2.85, w: 1.8, h: 0.9, fontSize: 14, italic: true, color: MUTED, align: "center" });
  });
  s.addShape(pres.shapes.LINE, { x: M + 0.87, y: 4.1, w: 10.3, h: 0, line: { color: HEX.accent6, width: 1.5, dashType: "dash", beginArrowType: "triangle" }, objectName: "loop back" });
  txt(s, "The results usually lead to a revised question", { x: 4.2, y: 4.2, w: 5, h: 0.4, fontSize: 14, color: MUTED, align: "center" });
  point(s, "The methods in this lecture belong to the counting step; the other steps depend on historical knowledge.", 5.2);
}
{
  const s = content("What counting can and can’t do", "Text analysis is good at scale, comparison and pattern, and at pointing you to where to read. It cannot tell you why something changed, cannot read irony, tone or context, cannot see what was never written down, kept or digitised, and does not replace close reading. Keep this list in mind for Part 6.");
  const can = ["Count and compare at scale", "Find patterns and outliers", "Point you to texts to read", "Make claims checkable"];
  const cant = ["Explain why", "Read irony, tone, context", "See what was never kept or digitised", "Replace close reading"];
  txt(s, "Can", { x: M, y: 1.45, w: 5.9, h: 0.5, fontSize: 22, bold: true, fontFace: THEME.headFontFace, color: C.accent4 });
  txt(s, "Can’t", { x: 6.83, y: 1.45, w: 5.9, h: 0.5, fontSize: 22, bold: true, fontFace: THEME.headFontFace, color: C.accent2 });
  can.forEach((t, i) => chip(s, M, 2.1 + i * 0.85, 5.9, 0.65, t, C.background2, C.text1, 17));
  cant.forEach((t, i) => chip(s, 6.83, 2.1 + i * 0.85, 5.9, 0.65, t, C.background2, C.text1, 17));
}
{
  const s = content("Why a word becomes more frequent", "Three explanations for any change in frequency. Only the first two are about the past; the third is about the source. Most of Part 6 is about the third. Ask these three questions of every chart today.");
  s.addChart(pres.charts.LINE, [{ name: "frequency", labels: ["", "", "", "", "", "", "", "", "", ""], values: [0.3, 0.35, 0.4, 0.5, 0.45, 0.6, 0.8, 1.1, 1.6, 2.0] }], chartOpts({ x: M, y: 1.5, w: 5.2, h: 4.2, chartColors: [HEX.accent1], lineSize: 3, lineDataSymbol: "none", showLegend: false, valAxisHidden: true, catAxisHidden: true, valGridLine: { style: "none" } }));
  [["Something happened", C.accent1], ["Its meaning changed", C.accent1], ["The corpus changed", C.accent2]].forEach(([h, c], i) =>
    tile(s, 6.3, 1.55 + i * 1.45, 6.43, 1.2, h, "", { labelColor: c, labelSize: 22 }));
  point(s, "These three explanations apply to every chart in this lecture.");
}

// =====================================================================
sec("2 What are we counting?");
divider(2, "What are we counting?", "From archive to data, and our two corpora", "Before any method: what is in the corpus and how it was made.");
{
  const s = content("From scan to text", "Real example from Delpher: the Noordhollandsche courant, 3 May 1780, page 2, appointments and deaths in the VOC's Asian settlements. Top: the scan. Bottom: the OCR text Delpher serves for the same lines. Errors in red. The long s in 'ontslagen' (dismissed) is read as f, so a search for 'ontslagen' misses this article; italic names suffer most (Gale → Gak, Jaffanapatnam → Jaiknapataaai); e is read as c (October → Octobcr). OCR for print (Delpher), HTR for handwriting (VOC and notarial archives, Amsterdam City Archives): always ask what the machine did to the text before you count it.");
  const r = fit(s, EXT + "delpher/crop.jpg", M, 1.35, CW, 2.0, "Scan of the Noordhollandsche courant, 3 May 1780, page 2 (detail)");
  s.addShape(pres.shapes.RECTANGLE, { x: r.x, y: r.y, w: r.w, h: r.h, fill: { type: "none" }, line: { color: HEX.accent6, width: 0.75 }, objectName: "scan frame" });
  const base = { fontSize: 14.5, color: HEX.dk1, fontFace: "Courier New" };
  const ocr = "Den 5 [[Octobcr]] op [[Ceyloa]] den Koopman Sluyskens, Administrateur te [[Jaiknapataaai]]. Stork, als [[dispenfier]] te Colombo [[ontflagen]]. Den Onder-Koopman van [[S.-nden]], in zyn plaatst, G.W.Trek, Secretaris van Politie te [[Gak]] [[ontflagen]]. Den Onder-Koopman H. L. [[Merthezc]], in zyn plaats. Den 7 dito. Anthony Hendrik [[Dormcux]], oud [[vifitatcur]] Generaal der [[Indiefche]] Negotie - Boeken, overleden. [[Don]] 8 dito den Oud-[[Luytcnant]] [[det]] [[Burgcry]] Klaas de Graaf, overleden.";
  box(s, M, 3.5, CW, 1.75, C.background2, "ocr text");
  s.addText(marked(ocr, base, { color: HEX.accent2, bold: true }), { isTextBox: true, x: M + 0.25, y: 3.65, w: CW - 0.5, h: 1.5, margin: 0, valign: "top" });
  point(s, "OCR errors affect every count made from digitised text.", 5.55);
  src(s, "Noordhollandsche courant, 3 May 1780, p. 2. Scan and OCR: Delpher, KB – National Library of the Netherlands.");
}
{
  const s = content("Preparing a corpus", "Select a cohesive corpus; describe it with metadata; clean it (OCR correction, spelling standardisation); prepare it (split into words, lemmatise: stole → steal, tag parts of speech). Each step is optional and each is a choice that changes every count that follows.");
  ["Select", "Describe", "Clean", "Prepare"].forEach((h, i) => {
    const x = M + i * 3.07;
    chip(s, x, 2.0, 2.7, 1.1, h, C.accent1, C.background1, 22, true);
    if (i < 3) arrowRight(s, x + 2.74, 2.4, 0.3, 0.3);
  });
  ["the texts", "with metadata", "OCR, spelling", "split, lemmatise"].forEach((t, i) => txt(s, t, { x: M + i * 3.07, y: 3.3, w: 2.7, h: 0.5, fontSize: 16, italic: true, color: MUTED, align: "center" }));
  point(s, "Each step involves choices that affect the counts.", 4.6);
}
{
  const s = content("Corpus 1: the Old Bailey Proceedings", "Printed accounts of trials at London's central criminal court, 1674–1913, digitised and marked up by Old Bailey Online (Hitchcock, Shoemaker, Emsley, Howard, McLaughlin et al.). Every trial is tagged by hand with offence, verdict, punishment and defendant's gender. In the lab we use a random sample of 12,482 trials (up to 500 per decade); the word embeddings are trained on the full text. Data via Hugging Face biglam/old_bailey_proceedings, CC BY-NC 4.0.");
  [["197,750", "trials"], ["123 million", "words"], ["1674–1913", "240 years"]].forEach(([n, l], i) => {
    txt(s, n, { x: M + i * 4.1, y: 2.0, w: 3.9, h: 1.0, fontSize: 44, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
    txt(s, l, { x: M + i * 4.1, y: 3.0, w: 3.9, h: 0.4, fontSize: 17, color: MUTED });
  });
  point(s, "Printed accounts of trials at London’s central criminal court, each tagged with offence, verdict and punishment.", 4.4);
  src(s, "Old Bailey Online, via Hugging Face biglam/old_bailey_proceedings, CC BY-NC 4.0.");
}
{
  const s = content("Corpus 2: the Royal Society’s journals", "The Royal Society Corpus, built at Saarland University from the Philosophical Transactions and Proceedings of the Royal Society of London. Open version 6.0.4: 17,520 texts, 1665–1920: letters, papers, abstracts, with author, journal, year and topic. The corpus of the second lab notebook. A source with a history: the Transactions began as Henry Oldenburg's newsletter of letters and reports and became a professional scientific journal.");
  [["17,520", "texts"], ["64 million", "words"], ["1665–1920", "250 years"]].forEach(([n, l], i) => {
    txt(s, n, { x: M + i * 4.1, y: 2.0, w: 3.9, h: 1.0, fontSize: 44, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
    txt(s, l, { x: M + i * 4.1, y: 3.0, w: 3.9, h: 0.4, fontSize: 17, color: MUTED });
  });
  point(s, "Letters, papers and abstracts published by the Royal Society, 1665–1920.", 4.4);
  src(s, "Royal Society Corpus 6.0.4 Open (Fischer, Knappen, Menzel, Teich et al.), CC BY-NC-SA 4.0.");
}
{
  const s = content("Trial length in the Proceedings", "Median words per trial in the Old Bailey sample. The changes in trial length reflect changes in printing: the Proceedings changed from short pamphlets to near-verbatim shorthand records, and were cut down again in the 1890s–1900s. Every count is a count of the source, and only indirectly of the past. Students make this chart in Part 1 of the lab.");
  const lab = ["1670s", "1680s", "1690s", "1700s", "1710s", "1720s", "1730s", "1740s", "1750s", "1760s", "1770s", "1780s", "1790s", "1800s", "1810s", "1820s", "1830s", "1840s", "1850s", "1860s", "1870s", "1880s", "1890s", "1900s", "1910s"];
  const val = [108, 94.5, 98, 90, 114, 84, 48, 157.5, 312, 346, 188, 364, 513.5, 451.5, 266.5, 284, 290.5, 253, 357.5, 395, 350.5, 382, 73.5, 99, 317.5];
  s.addChart(pres.charts.BAR, [{ name: "Median words per trial", labels: lab, values: val }], chartOpts({ x: M, y: 1.3, w: CW, h: 4.6, barDir: "col", chartColors: [HEX.accent1], showLegend: false, catAxisLabelRotate: -45, catAxisLabelFontSize: 10, barGapWidthPct: 40, showValAxisTitle: true, valAxisTitle: "median words per trial", valAxisTitleFontSize: 11, valAxisTitleColor: MUTED }));
  point(s, "The changes in length reflect changes in how the Proceedings were printed.");
}
{
  const s = content("What counts as a word?", "Tokenisation: the exact rule used in the lab: lower-case everything and keep runs of letters a–z. Lost: numbers (40), punctuation, the apostrophe in Prosecutor's (the red tokens). Kept apart: murder and murther, shilling and shilings. Students edit this sentence in the lab and watch the tokens change.");
  box(s, M, 1.5, CW, 0.8, C.background2, "sentence");
  txt(s, "“The Prisoner stole a silver Watch, value 40s. from the Prosecutor's pocket.”", { x: M + 0.3, y: 1.5, w: CW - 0.6, h: 0.8, fontSize: 20, italic: true, fontFace: THEME.headFontFace, valign: "middle" });
  s.addShape(pres.shapes.DOWN_ARROW, { x: W / 2 - 0.2, y: 2.5, w: 0.4, h: 0.45, fill: { color: C.accent6 }, line: { type: "none" }, objectName: "down arrow" });
  const toks = ["the", "prisoner", "stole", "a", "silver", "watch", "value", "s", "from", "the", "prosecutor", "s", "pocket"];
  let x = M;
  toks.forEach((t) => { const w = 0.28 + t.length * 0.105; chip(s, x, 3.15, w, 0.5, t, t === "s" ? C.accent2 : C.accent1, C.background1, 13); x += w + 0.1; });
  point(s, "The rule for splitting text into words affects what is counted.", 4.4);
}

// =====================================================================
sec("3 Frequency");
divider(3, "How often? Frequency", "Method 1: counting words and phrases over time", "Method 1: term frequency.");
methodCard("Method 1: frequency", "The method card: the same four questions for each method. Frequency counts words or phrases and divides by the size of the corpus (per 10,000 or per million words), so that periods or groups of different size can be compared. Good for trends, events, the rise and fall of terms and concepts. Watch out: the corpus changes over time; spelling and OCR; words with several meanings.",
  "How often, and when?", "Count words or phrases; divide by corpus size", "Trends, events, rise and fall of terms", "Corpus changes, OCR, words with many meanings",
  ["Delpher", "electric fire → current", "Chagall"]);
{
  const s = content("Raw and normalised counts", "Same Delpher search for 'liberaal', two views. The raw count partly measures how much was printed and digitised: more newspapers later, so raw counts rise anyway. The relative frequency asks: of everything printed that year, how much mentions the word?");
  fit(s, MEDIA + "image-18-1.png", M, 1.45, 5.9, 3.9, "Delpher: raw number of articles mentioning liberaal");
  fit(s, MEDIA + "image-18-2.png", 6.83, 1.45, 5.9, 3.9, "Delpher: share of articles mentioning liberaal");
  txt(s, "Raw count", { x: M, y: 5.4, w: 5.9, h: 0.4, fontSize: 16, bold: true, color: C.accent1, align: "center" });
  txt(s, "Share of all articles", { x: 6.83, y: 5.4, w: 5.9, h: 0.4, fontSize: 16, bold: true, color: C.accent1, align: "center" });
  point(s, "Counts need to be divided by the total amount of text in each period.");
}
{
  const s = content("The most frequent words", "Counts from the Old Bailey lab sample (6.8 million words). Stopwords: very common words (the, and, of), often removed. 'prisoner' and 'mr' tell us about the genre; 'q' (Question in the transcripts) and 'th' (what is left of '29th') about how it was printed. Stopword lists are choices too: removing 'she' or 'her' would hide gender.");
  const opts = { y: 1.45, w: 4.0, colW: [2.5, 1.5], fontSize: 15, border: { type: "solid", color: "DDE3E8", pt: 0.75 }, rowH: 0.43, margin: [0.03, 0.12, 0.03, 0.12] };
  const hdr = (a, b) => [{ text: a, options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent1 } } }, { text: b, options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent1 }, align: "right" } }];
  const rows = (arr) => arr.map(([w, c]) => [{ text: w }, { text: c, options: { align: "right" } }]);
  s.addTable([hdr("All words", "count"), ...rows([["the", "422,467"], ["i", "288,268"], ["and", "211,011"], ["to", "167,188"], ["of", "165,138"], ["a", "154,235"], ["was", "141,462"], ["he", "122,460"]])], Object.assign({ x: 1.6 }, opts));
  s.addTable([hdr("Without stopwords", "count"), ...rows([["prisoner", "49,762"], ["mr", "36,415"], ["went", "29,152"], ["q", "26,042"], ["house", "24,685"], ["saw", "24,241"], ["came", "23,233"], ["th", "21,654"]])], Object.assign({ x: 7.3 }, opts));
  point(s, "The most frequent words mostly reflect the genre of the source.");
}
{
  const s = content("N-grams: words in sequence", "A window slides along the text: every pair of neighbours is a bigram (2-gram), every three a trigram. N-grams separate meanings: 'watch' the timepiece versus 'the watch' and 'watch house', the night watch. Bigram counts from 1,000 trials containing 'watch' in the Old Bailey sample. Next slide: an n-gram that tells a history.");
  ["stole", "a", "silver", "watch", "value"].forEach((w, i) => chip(s, M + i * 1.15, 1.6, 1.05, 0.5, w, C.accent1, C.background1, 14));
  ["stole a", "a silver", "silver watch", "watch value"].forEach((b, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + i * 1.15 + 0.05, y: 2.3 + i * 0.55, w: 2.2, h: 0.45, rectRadius: 0.06, fill: { color: C.background2 }, line: { color: HEX.accent1, width: 1 }, objectName: "bigram " + b });
    txt(s, b, { x: M + i * 1.15 + 0.05, y: 2.3 + i * 0.55, w: 2.2, h: 0.45, align: "center", valign: "middle", fontSize: 14, color: C.text2 });
  });
  s.addChart(pres.charts.BAR, [{ name: "Occurrences", labels: ["silver watch", "watch value", "a watch", "my watch", "watch house", "the watch"], values: [258, 275, 486, 558, 647, 1661] }],
    chartOpts({ x: 6.6, y: 1.3, w: 6.2, h: 4.5, barDir: "bar", chartColors: [HEX.accent1], showLegend: false, showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: "333333", valAxisHidden: true, valGridLine: { style: "none" }, catAxisLabelFontSize: 13, barGapWidthPct: 35 }));
  point(s, "‘The watch’ usually refers to the night watch; ‘a silver watch’ usually to stolen property.");
}
{
  const s = content("The noun after ‘electric’, 1725–1924", "Every 'electric' or 'electrical' in the Royal Society's journals, and the noun that follows (a bigram), per million words in each 25-year period. Read down the diagonal. 1725–49: a 'virtue' or 'effluvia' given off by rubbed glass (Stephen Gray, Desaguliers). 1750–99: a 'fluid', 'matter' or 'fire' (Franklin, Cavendish), increasingly a 'spark' and a 'shock' (the Leyden jar). The 'electric organ' of the torpedo fish appears in 1773 (Walsh, Hunter). After Volta's pile (1800) and electromagnetism (Ørsted 1820, Faraday) the 'electric current' dominates. Late in the century 'resistance' (measurement), 'light' (electric lighting), and finally 'field' and 'waves' (Maxwell, Hertz, wireless). Of the three questions, this one is mostly 'its meaning changed'.");
  const rows = ["virtue", "effluvia", "fire", "fluid", "spark", "shock", "organ", "current", "resistance", "light", "field", "waves"];
  const shade = (v) => v >= 50 ? HEX.accent1 : v >= 20 ? "4F92AA" : v >= 8 ? "A9CCD8" : v >= 1 ? "E3EEF2" : HEX.lt1;
  const head = [{ text: "electric …", options: { bold: true, color: HEX.dk2, italic: true } }, ...ebg.map((d) => ({ text: d.period.slice(0, 4) + "–" + d.period.slice(-2), options: { bold: true, align: "center", color: HEX.dk2, fontSize: 11 } }))];
  const body = rows.map((k) => [{ text: k, options: { bold: true, color: HEX.dk2, fontFace: "Cambria" } }, ...ebg.map((d) => { const v = d[k]; return { text: v >= 1 ? String(Math.round(v)) : "", options: { align: "center", fill: { color: shade(v) }, color: v >= 20 ? HEX.lt1 : HEX.dk1, bold: v >= 20 } }; })]);
  s.addTable([head, ...body], { x: 1.6, y: 1.3, w: 10.1, colW: [1.7, ...Array(8).fill(1.05)], rowH: 0.34, fontSize: 12, valign: "middle", border: { type: "solid", color: "FFFFFF", pt: 1.5 }, margin: [0.01, 0.06, 0.01, 0.06] });
  point(s, "The noun after ‘electric’ changes from virtue and fluid to current, and later to field and waves.");
  src(s, "‘electric’ or ‘electrical’ + noun, per million words. " + RSC_CAP);
}
{
  const s = content("Keyword in context", "A concordance (keyword in context, KWIC) is the oldest digital humanities tool: Busa's Index Thomisticus was a concordance. One line for each stage. Franklin 1752: fire drawn from clouds. Cavendish 1771: an elastic fluid. Hunter 1773: the electric organ of the torpedo, an anatomical object. Faraday 1832: a current you can reverse. Fleming 1902: electric waves and Marconi's 'space telegraphy'. Other stages: Desaguliers' 'electrical Virtue' (1739), Ellicott's 'electric Effluvia' (1748), Siemens' 'electric light' (1879).");
  kwic(s, [
    ["1752", "the pointed wire will draw the", "electric fire", "from them"],
    ["1771", "it is likely that the", "electric fluid", "is endued with this property"],
    ["1773", "the columns which compose the", "electric organ", "[of the torpedo]"],
    ["1832", "On reversing the order of rotation, the", "electrical current", "was reversed"],
    ["1902", "a Magnetic Detector for", "Electric Waves", "… a Receiver for Space Telegraphy"],
  ], 1.5, [0.75, 4.6, 2.0, 4.78], 0.62, 15);
  point(s, "Reading the lines shows what each phrase referred to.", 5.2);
  src(s, "Franklin 1752 · Cavendish 1771 · Hunter 1773 · Faraday 1832 · Fleming 1902. Royal Society Corpus.");
}
{
  const s = content("Frequency in practice: Chagall in German and English books", "Michel et al., 'Quantitative analysis of culture using millions of digitized books', Science 331 (2011), the paper behind the Google Books Ngram Viewer. The Jewish painter Marc Chagall, labelled 'degenerate' by the Nazi regime: in German-language books his name falls through the 1930s to almost nothing in 1940–42 and recovers after 1945; in English-language books it keeps rising. The English line serves as a comparison. Note the German fall starts in the late 1920s; and 'books' means books Google scanned from a handful of libraries. Data re-downloaded from the Ngram Viewer (2019 corpora, 1-year smoothing).");
  const yrs = []; for (let y = 1910; y <= 1955; y++) yrs.push(String(y));
  s.addChart(pres.charts.LINE, [
    { name: "German books", labels: yrs, values: ch_de.map((v) => +(v * 1e9).toFixed(2)) },
    { name: "English books", labels: yrs, values: ch_en.map((v) => +(v * 1e9).toFixed(2)) },
  ], chartOpts({ x: M - 0.1, y: 1.3, w: CW + 0.2, h: 4.6, chartColors: [HEX.accent2, HEX.accent6], lineSize: 2.75, lineDataSymbol: "none", showLegend: true, legendPos: "t", valAxisMinVal: 0, showValAxisTitle: true, valAxisTitle: "‘Marc Chagall’ per billion words", valAxisTitleFontSize: 11, valAxisTitleColor: MUTED, catAxisLabelFrequency: 5, catAxisLabelFontSize: 11 }));
  point(s, "Mentions of Chagall in German books fell almost to zero in 1933–45; mentions in English books continued.");
  src(s, "Michel et al., Science 331 (2011). Data: Google Books Ngram Viewer.");
}
{
  const s = content("Exercise 1: search Delpher", "https://www.delpher.nl/nl/kranten. About 10 minutes. Search for a word or n-gram, look for trends over time, find articles that exemplify them, compare raw counts with proportions, add your term to Wooclap.");
  ["Search a word or n-gram", "Find a trend over time", "Read articles behind it", "Raw counts vs proportions"].forEach((t, i) => {
    const x = M + (i % 2) * 6.15, y = 1.55 + Math.floor(i / 2) * 1.9;
    box(s, x, y, 5.95, 1.6, C.background2, "step " + (i + 1));
    numBadge(s, x + 0.3, y + 0.55, i + 1);
    txt(s, t, { x: x + 1.05, y, w: 4.7, h: 1.6, fontSize: 20, valign: "middle" });
  });
  point(s, "delpher.nl/nl/kranten · then add your term to Wooclap", 5.6);
}

// =====================================================================
sec("4 Association");
divider(4, "In what company? Association", "Method 2: collocation and distinctive words", "Method 2: association.");
methodCard("Method 2: association", "Association looks at the words around a word (collocation) or compares one set of texts with another (keyness, distinctive words, TF-IDF). Good for how a concept is framed, and what distinguishes groups, periods or authors. Watch out: scores like MI favour rare words; the result depends on what you compare with; being near a word is not the same as meaning it.",
  "In what company? What is typical?", "Count words near a word; compare one set of texts with another", "How a concept is framed; what distinguishes groups", "Rare-word bias; choice of comparison",
  ["gin", "electricity’s company", "liberty from / to", "violence"]);
{
  const s = content("Collocation", "How often does word X occur near word Y? Count every word inside a window (here up to 5 words either side of 'gin'), across the whole corpus; then ask which turn up far more often than chance (next slide). Example sentence from an Old Bailey trial of 1776 (t17760911-88). The strongest collocates of gin in the sample: quartern (a quarter pint), glass, drank, pint, beer.");
  const toks = ["i", "gave", "clarke", "sixpence", "to", "fetch", "a", "quartern", "of", "gin"];
  let x = M;
  toks.forEach((t, i) => { const w = 0.35 + t.length * 0.11; chip(s, x, 1.9, w, 0.55, t, t === "gin" ? C.accent2 : i >= 4 ? C.accent1 : C.accent6, C.background1, 15); x += w + 0.1; });
  txt(s, "window: 5 words either side", { x: 4.3, y: 2.55, w: 4.5, h: 0.35, fontSize: 13, color: C.accent1, align: "center" });
  const data = [["glass", "70"], ["quartern", "57"], ["water", "24"], ["drank", "21"], ["pint", "21"]];
  s.addTable([[{ text: "near gin", options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent1 } } }, { text: "times", options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent1 }, align: "right" } }], ...data.map(([a, b]) => [{ text: a }, { text: b, options: { align: "right" } }])],
    { x: 9.3, y: 3.05, w: 3.43, colW: [2.2, 1.23], fontSize: 15, rowH: 0.45, border: { type: "solid", color: "DDE3E8", pt: 0.75 }, margin: [0.03, 0.12, 0.03, 0.12] });
  txt(s, "The words most often near ‘gin’ relate to measures and drinking.", { x: M, y: 3.6, w: 8.2, h: 1.0, fontSize: 19, bold: true, color: C.text2 });
}
{
  const s = content("Observed vs expected: the MI score", "Mutual information: log2 of observed over expected, where expected is how often the two words would meet by chance given how common each is. 1 means twice as often as chance, 3 eight times. MI rewards rare words, so set a minimum number of meetings.");
  box(s, M, 1.45, CW, 0.9, C.background2, "formula");
  txt(s, "MI = log₂( observed ÷ expected )", { x: M + 0.3, y: 1.45, w: CW - 0.6, h: 0.9, fontSize: 24, bold: true, fontFace: THEME.headFontFace, valign: "middle" });
  [["quartern", "57", "0.1", "MI 9.3"], ["glass", "70", "1", "MI 6.1"], ["beer", "27", "0.9", "MI 5.0"]].forEach(([w, o, e, mi], i) => {
    const y = 2.75 + i * 0.95;
    txt(s, w, { x: M, y, w: 2.4, h: 0.6, fontSize: 22, bold: true, fontFace: THEME.headFontFace, color: C.accent1, valign: "middle" });
    txt(s, [{ text: o, options: { fontSize: 24, bold: true } }, { text: "  seen", options: { fontSize: 13, color: MUTED } }], { x: 3.2, y, w: 2.2, h: 0.6, valign: "middle" });
    txt(s, [{ text: e, options: { fontSize: 24, color: MUTED } }, { text: "  expected", options: { fontSize: 13, color: MUTED } }], { x: 5.5, y, w: 2.4, h: 0.6, valign: "middle" });
    arrowRight(s, 8.1, y + 0.15, 0.45, 0.32);
    txt(s, mi, { x: 8.8, y, w: 3, h: 0.6, fontSize: 24, bold: true, color: C.accent2, valign: "middle" });
  });
  point(s, "‘Quartern’ appears near ‘gin’ about 600 times more often than expected by chance.", 5.8);
}
{
  const s = content("Words near ‘electricity’, 1725–1924", "Collocation over time: every word within 5 words of 'electric', 'electrical' or 'electricity', sorted into hand-made groups, as a share of all occurrences in each 25-year period. Rubbing & attraction: rubbed, friction, attract, repel, effluvia, virtue, amber, wax. Fluid & fire: fluid, fire, aether. Living bodies: animal, torpedo, gymnotus, eel, fish, nerve, muscle, frog, patient, paralytic, cure, disease, shock. Machines & technology: machine, battery, dynamo, telegraph, lamp, lighting, cable, engine, motor, tramways. Current & measurement: current, resistance, conductivity, volt, ohm, potential, units. Living bodies are a real strand (medical cures by electricity in the 1750s–70s; the torpedo and the electric eel in the 1770s; Galvani's frogs in the 1790s), at most 8 in 100, fading after 1900. Machines stay below 7 in 100 in these journals. Measurement words rise to about 20 in 100 from the 1820s. The groups are my choice: a different list would give a different picture. Discuss.");
  const lab = egr.map((d) => d.period.slice(0, 4) + "–" + d.period.slice(-2));
  const ser = [["rubbing & attraction", HEX.accent6], ["fluid & fire", HEX.accent3], ["living bodies", HEX.accent2], ["machines & technology", HEX.accent5], ["current & measurement", HEX.accent1]];
  s.addChart(pres.charts.LINE, ser.map(([k]) => ({ name: k, labels: lab, values: egr.map((d) => d[k]) })),
    chartOpts({ x: M - 0.1, y: 1.3, w: CW + 0.2, h: 4.6, chartColors: ser.map((x) => x[1]), lineSize: 2.75, lineDataSymbol: "circle", lineDataSymbolSize: 5, showLegend: true, legendPos: "t", legendFontSize: 12, valAxisMinVal: 0, valAxisMaxVal: 25, valAxisMajorUnit: 5, showValAxisTitle: true, valAxisTitle: "words per 100 uses of electric*", valAxisTitleFontSize: 11, valAxisTitleColor: MUTED, catAxisLabelFontSize: 11 }));
  point(s, "After 1825, words about measurement are the largest group; words about bodies and machines stay below 10 per 100.");
  src(s, "Words within 5 of electric / electrical / electricity, grouped by hand. " + RSC_CAP);
}
{
  const s = content("Association in practice: ‘liberty from’ and ‘liberty to’", "Isaiah Berlin, 'Two Concepts of Liberty' (1958): negative liberty is freedom from interference; positive liberty is freedom to act, to govern oneself. Which did early modern writers mean? John Regan turns this into a collocation question: which preposition follows the word? Counts from Regan, Semantic Change and Collective Knowledge in 18th-Century Britain (Bloomsbury 2023), built on ECCO (the earliest periods presumably EEBO; check). Raw counts: liberty from 234 / 1,272 / 2,791 / 5,934; liberty to 3,143 / 19,913 / 68,788 / 154,122; freedom from 1,285 / 431 / 5,890 / 15,667; freedom to 511 / 189 / 5,639 / 12,597. The chart shows 'from' as a share of from + to. The two words are used differently: 'freedom' is more often followed by 'from', 'liberty' by 'to'. The next slide qualifies this.");
  const per = ["1600–40", "1660–1700", "1700–40", "1760–1800"];
  const lib = [[234, 3143], [1272, 19913], [2791, 68788], [5934, 154122]].map(([f, t]) => +(100 * f / (f + t)).toFixed(1));
  const fre = [[1285, 511], [431, 189], [5890, 5639], [15667, 12597]].map(([f, t]) => +(100 * f / (f + t)).toFixed(1));
  chip(s, M, 1.5, 3.9, 0.7, "Negative: freedom from", C.accent1, C.background1, 16, true);
  chip(s, M, 2.4, 3.9, 0.7, "Positive: freedom to", C.accent2, C.background1, 16, true);
  txt(s, "Isaiah Berlin, 1958", { x: M, y: 3.25, w: 3.9, h: 0.4, fontSize: 13, italic: true, color: MUTED });
  s.addChart(pres.charts.BAR, [{ name: "freedom", labels: per, values: fre }, { name: "liberty", labels: per, values: lib }],
    chartOpts({ x: 4.8, y: 1.3, w: 8.0, h: 4.6, barDir: "col", chartColors: [HEX.accent1, HEX.accent2], showLegend: true, legendPos: "t", showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: "333333", dataLabelFormatCode: "0\"%\"", valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 25, valAxisLabelFormatCode: "0\"%\"", showValAxisTitle: true, valAxisTitle: "‘from’ as % of ‘from’ + ‘to’", valAxisTitleFontSize: 11, valAxisTitleColor: MUTED, barGapWidthPct: 60 }));
  point(s, "‘Freedom’ is more often followed by ‘from’; ‘liberty’ more often by ‘to’.");
  src(s, "Phrase counts: John Regan, Semantic Change and Collective Knowledge in 18th-Century Britain (2023), ECCO.");
}
{
  const s = content("‘Liberty to’ in the Old Bailey", "The same check in the Old Bailey: almost every 'liberty to' refers to permission (to go into the yard, to depart, to go on shore). Even 'liberty from' is permission: 'liberty from the master to sleep in the yard' (1807). So a high 'to' share does not show that people favoured positive liberty. Regan makes the same kind of check. Collocation counts show where to read. 50 lines of 'liberty to' in the sample; 4 shown.");
  kwic(s, [
    ["1717", "the Prisoner came to the House desiring", "liberty to", "go into the Yard"],
    ["1788", "Court to Cole. Was you at", "liberty to", "depart during that time?"],
    ["1796", "when he had", "liberty to", "go on shore for a few hours"],
    ["1807", "after that he had", "liberty from", "the master to sleep in the yard"],
  ], 1.5, [0.75, 5.0, 1.6, 4.78], 0.65, 16);
  point(s, "In these examples, ‘liberty to’ usually means permission.", 4.6);
  src(s, "Concordance lines for ‘liberty to’ and ‘liberty from’, Old Bailey sample.");
}
{
  const s = content("TF-IDF: what makes one document distinctive?", "Term frequency times inverse document frequency: words frequent in this document but rare in the others score high; words found everywhere score zero. A 'document' can be whatever you want: one trial, all the trials for one offence, all the speeches of a year. Here each Old Bailey offence category is one document. 'Royal offences' in the Old Bailey are mostly coining.");
  chip(s, M, 1.5, 1.9, 0.85, "TF", C.accent1, C.background1, 24, true);
  txt(s, "×", { x: M + 1.95, y: 1.5, w: 0.5, h: 0.85, fontSize: 26, color: MUTED, align: "center", valign: "middle" });
  chip(s, M + 2.5, 1.5, 1.9, 0.85, "IDF", C.accent1, C.background1, 24, true);
  txt(s, "=", { x: M + 4.45, y: 1.5, w: 0.5, h: 0.85, fontSize: 26, color: MUTED, align: "center", valign: "middle" });
  chip(s, M + 5.0, 1.5, 2.2, 0.85, "distinctive", C.accent2, C.background1, 22, true);
  [["Killing", "manslaughter, coroner"], ["Deception", "forged, cheques"], ["Coining", "counterfeit, florin"], ["Breaking the peace", "revolver, stabbed"]].forEach(([h, b], i) =>
    tile(s, M + i * 3.07, 3.0, 2.85, 1.7, h, b, { labelSize: 18 }));
  point(s, "TF-IDF gives high scores to words that are frequent in one document and rare in the others.", 5.2);
}
{
  const s = content("Distinctive words: trials of women and of men", "Defendant's gender as tagged by Old Bailey Online: 3,006 trials of women, 8,919 of men. log2 ratio of the share of trials mentioning each word. Women: clothing (stays, petticoats, quilted), 'spinster' as a legal description, pregnancy and the midwife (infanticide trials). Men: driving, horses, fraud, 'carnally' from rape trials. 'More common in trials of women' does not mean 'women said this'. Content note: real trials, including sexual violence and infanticide.");
  const lab = ["driving", "carnally", "fraudulently", "uniform", "bay", "bridle", "midwife", "petticoats", "stays", "spinster", "quilted", "pregnancy"];
  const men = [-5.5, -4.82, -4.7, -4.68, -4.43, -4.39, 0, 0, 0, 0, 0, 0];
  const wom = [0, 0, 0, 0, 0, 0, 2.85, 2.87, 2.9, 3.13, 3.48, 4.11];
  s.addChart(pres.charts.BAR, [{ name: "trials of men", labels: lab, values: men }, { name: "trials of women", labels: lab, values: wom }],
    chartOpts({ x: M, y: 1.25, w: CW, h: 4.7, barDir: "bar", barGrouping: "stacked", chartColors: [HEX.accent1, HEX.accent2], showLegend: true, legendPos: "t", catAxisLabelFontSize: 13, catAxisLabelPos: "low", barGapWidthPct: 30, valAxisMinVal: -6, valAxisMaxVal: 5 }));
  point(s, "These words come from the whole trial record, including witnesses’ testimony and clerks’ descriptions.");
}
{
  const s = content("Distinctiveness in practice: violence in the Old Bailey", "Klingenstein, Hitchcock and DeDeo, 'The civilizing process in London's Old Bailey', PNAS 111 (2014): 9419–24. Same corpus as ours. They measure, year by year, how different the vocabulary of trials for violent offences is from that of non-violent ones (Jensen-Shannon divergence: a distinctiveness score for two whole vocabularies). Blue: violent vs non-violent. Red: arbitrary groupings of offences (the baseline). Around 1780 the two kinds of trial sound alike; by 1900 they are sharply distinct. The authors read this as a slow change in attitudes to violence (Norbert Elias's 'civilizing process'), which they find in the language of the trials. Discussion question: does this reflect a change in violence or in the court's record-keeping?");
  fit(s, EXT + "pnas/fig1_top.jpg", M, 1.3, 7.0, 4.65, "Jensen-Shannon divergence between violent and non-violent trials, 1760–1913 (Klingenstein et al. 2014, Fig. 1)", "left");
  tile(s, 7.9, 1.5, 4.83, 1.7, "1780", "violent and non-violent trials use similar vocabulary", { labelColor: C.accent6 });
  tile(s, 7.9, 3.45, 4.83, 1.7, "1900", "the vocabularies are clearly different", { labelColor: C.accent1 });
  point(s, "The vocabularies of violent and non-violent trials became more distinct during the nineteenth century.");
  src(s, "Klingenstein, Hitchcock and DeDeo, ‘The civilizing process in London’s Old Bailey’, PNAS 111 (2014), Fig. 1.");
}

// =====================================================================
sec("5 Embeddings");
divider(5, "What does it mean? Embeddings", "Method 3: from counting neighbours to word vectors", "Method 3: semantics. One running example for the whole section: gin, beer, pot, watch, handkerchief. Every number comes from the Old Bailey sample or the lab's models.");
methodCard("Method 3: word embeddings", "Embeddings turn each word into a list of numbers learned from the contexts it appears in, so that words used in similar contexts get similar numbers. Good for finding similar words, exploring a vocabulary, and tracing how meaning shifts between periods. Watch out: needs a lot of text; learns the quirks of the corpus (names, spellings, OCR); unstable for rare words.",
  "What does it mean? How did it change?", "Turn each word into numbers learned from its contexts", "Similar words; how meaning shifts", "Needs lots of text; learns the corpus’s quirks",
  ["gin, beer, pot", "madness", "electricity"]);
{
  const s = content("You shall know a word by the company it keeps", "J. R. Firth, 1957. Use reflects meaning: words that appear in the same contexts tend to have similar meanings (Wittgenstein: the meaning of a word is its use). Gin and beer are fetched, stood and drunk by the glass, the drop, the pot and the pint. The computer is not told that they are drinks; it groups them because they appear in similar contexts.");
  txt(s, "“You shall know a word by the company it keeps.”  J. R. Firth, 1957", { x: M, y: 1.4, w: CW, h: 0.6, fontSize: 20, fontFace: THEME.headFontFace, italic: true, color: C.text2 });
  const mk = (arr) => arr.map(([l, k]) => [{ text: "…" + l, options: { align: "right", fontSize: 16 } }, { text: k, options: { bold: true, color: HEX.accent2, fontSize: 16 } }]);
  const tOpts = (x) => ({ x, y: 2.35, w: 5.95, colW: [4.95, 1.0], rowH: 0.6, valign: "middle", border: { type: "solid", color: "DDE3E8", pt: 0.75 }, margin: [0.03, 0.1, 0.03, 0.1] });
  s.addTable(mk([["sixpence to fetch a quartern of", "gin"], ["me to give her a glass of", "gin"], ["asked me to stand a drop of", "gin"]]), tOpts(M));
  s.addTable(mk([["a sovereign to fetch a pot of", "beer"], ["in and called for a pint of", "beer"], ["quiet I would get a drop of", "beer"]]), tOpts(6.78));
  point(s, "Gin and beer appear in similar contexts, so a model can group them without being told they are drinks.", 4.7);
  src(s, "Concordance lines for ‘gin’ (1776, 1808, 1858) and ‘beer’ (1839, 1784, 1864), Old Bailey sample.");
}
{
  const s = content("Predicting the next word: an n-gram model", "An n-gram language model: count every trigram, then predict the next word from the two before it. 'A quartern of' (a spirits measure) is followed by gin 44% of the time, then brandy and rum; 'a pint of' by beer, ale, porter, wine and purl. Two points. Words that follow the same phrase tend to be similar: the counts separate spirits from beers (Firth's idea, applied by counting). Predicting the next word is also the task that large language models such as ChatGPT are trained on, using a neural network and much longer contexts. Word2vec, coming up, is also trained by prediction. Old Bailey sample: 111 and 583 occurrences.");
  const q = [["gin", 44], ["brandy", 15], ["rum", 15], ["whisky", 3]];
  const p = [["beer", 49], ["ale", 9], ["porter", 7], ["wine", 6]];
  const mkChart = (x, title, d, col) => {
    txt(s, title, { x, y: 1.45, w: 5.9, h: 0.5, fontSize: 22, bold: true, fontFace: THEME.headFontFace, color: C.text2 });
    s.addChart(pres.charts.BAR, [{ name: "next word", labels: d.map((r) => r[0]).reverse(), values: d.map((r) => r[1]).reverse() }],
      chartOpts({ x: x - 0.1, y: 2.0, w: 5.9, h: 3.2, barDir: "bar", chartColors: [col], showLegend: false, showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0\"%\"", dataLabelFontSize: 13, dataLabelColor: "333333", valAxisHidden: true, valGridLine: { style: "none" }, valAxisMaxVal: 60, catAxisLabelFontSize: 15, barGapWidthPct: 35 }));
  };
  mkChart(M, "a quartern of ___", q, HEX.accent2);
  mkChart(6.83, "a pint of ___", p, HEX.accent1);
  point(s, "Words that follow the same phrases tend to be similar. Large language models are also trained to predict the next word.", 5.5);
}
{
  const s = content("A co-occurrence matrix", "Real counts from the Old Bailey sample: how often each word (rows) appears within 5 words of each context word (columns). Each row is that word's company profile, a list of four numbers: a vector. Gin and beer: drank and pint. Watch and handkerchief: pocket and stole. Pot is in between: a pewter pot is drunk from, and constantly stolen from alehouses. Beer's numbers are bigger than gin's simply because beer is mentioned more often; the next slide deals with that.");
  const cols = ["drank", "pint", "pocket", "stole"];
  const M5 = [["gin", 21, 21, 1, 0], ["beer", 88, 307, 1, 1], ["pot", 28, 67, 19, 4], ["watch", 1, 1, 185, 36], ["handkerchief", 0, 0, 251, 4]];
  const shade = (v) => v >= 150 ? HEX.accent1 : v >= 15 ? "A9CCD8" : HEX.lt1;
  const head = [{ text: "" }, ...cols.map((c) => ({ text: c, options: { bold: true, align: "center", color: HEX.dk2, fill: { color: HEX.lt2 } } }))];
  const body = M5.map(([w, ...v]) => [{ text: w, options: { bold: true, color: w === "pot" ? HEX.accent2 : HEX.dk2, fontFace: "Cambria" } }, ...v.map((n) => ({ text: String(n), options: { align: "center", fill: { color: shade(n) }, color: n >= 150 ? HEX.lt1 : HEX.dk1, bold: n >= 15 } }))]);
  s.addTable([head, ...body], { x: 2.4, y: 1.4, w: 8.5, colW: [2.5, 1.5, 1.5, 1.5, 1.5], rowH: 0.62, fontSize: 18, valign: "middle", border: { type: "solid", color: "FFFFFF", pt: 2 }, margin: [0.03, 0.12, 0.03, 0.12] });
  point(s, "Each row lists how often a word appears near each context word. This list of numbers is a vector.", 5.4);
}
{
  const s = content("Cosine similarity", "Plot two of the columns: drank along the bottom, pocket up the side. Each word is an arrow to its pair of counts. Beer's arrow is four times longer than gin's, because beer is mentioned four times as often, but it points the same way. Similarity should not depend on how common a word is, so we measure the angle: cosine similarity, 1 for the same direction, 0 for a right angle. On all four columns: gin–beer 0.87, gin–pot 0.90, pot–watch 0.26, gin–watch 0.04, watch–handkerchief 0.98.");
  const ox = 1.35, oy = 6.05, Lx = 4.4, MAX = 260, sc = Lx / MAX;
  s.addShape(pres.shapes.LINE, { x: ox, y: oy, w: Lx + 0.2, h: 0, line: { color: HEX.accent6, width: 1.25, endArrowType: "triangle" }, objectName: "x axis" });
  s.addShape(pres.shapes.LINE, { x: ox, y: oy - Lx - 0.2, w: 0, h: Lx + 0.2, line: { color: HEX.accent6, width: 1.25, beginArrowType: "triangle" }, objectName: "y axis" });
  txt(s, "drank →", { x: ox + Lx - 1.3, y: oy + 0.08, w: 1.5, h: 0.3, fontSize: 13, color: MUTED, align: "right" });
  txt(s, "pocket ↑", { x: ox - 0.75, y: oy - Lx - 0.55, w: 1.5, h: 0.3, fontSize: 13, color: MUTED });
  const pts = [["beer", 88, 1, HEX.accent3, [0.08, -0.36]], ["gin", 21, 1, HEX.accent2, [0.02, 0.1]], ["pot", 28, 19, HEX.accent5, [0.06, -0.38]], ["watch", 1, 185, HEX.accent1, [0.1, -0.12]], ["handkerchief", 0, 251, HEX.accent1, [0.12, -0.05]]];
  pts.forEach(([w, x, y, col, off]) => {
    const dx = x * sc, dy = y * sc;
    s.addShape(pres.shapes.LINE, { x: ox, y: oy - dy, w: dx, h: dy, flipV: true, line: { color: col, width: w === "beer" ? 5 : 3, endArrowType: "triangle" }, objectName: "arrow " + w });
    txt(s, w, { x: ox + dx + off[0], y: oy - dy + off[1], w: 1.8, h: 0.3, fontSize: 15, bold: true, color: col });
  });
  [["gin – beer", "0.87"], ["gin – watch", "0.04"], ["watch – handkerchief", "0.98"]].forEach(([a, v], i) => {
    const y = 1.9 + i * 0.9, val = parseFloat(v);
    txt(s, a, { x: 7.0, y, w: 3.0, h: 0.5, fontSize: 18, valign: "middle" });
    s.addShape(pres.shapes.RECTANGLE, { x: 10.0, y: y + 0.12, w: 2.0 * val + 0.02, h: 0.28, fill: { color: val > 0.5 ? HEX.accent1 : HEX.accent6 }, line: { type: "none" }, objectName: "bar " + a });
    txt(s, v, { x: 12.1, y, w: 0.65, h: 0.5, fontSize: 18, bold: true, valign: "middle" });
  });
  txt(s, "Cosine similarity measures the angle between two vectors, so it does not depend on word frequency.", { x: 7.0, y: 4.9, w: 5.73, h: 0.8, fontSize: 19, bold: true, color: C.text2 });
}
{
  const s = content("word2vec", "Counting a full co-occurrence matrix is huge: 20,000 words × 20,000 columns, mostly zeros. word2vec learns a short list of numbers per word instead (100 in our models) by playing a prediction game, like the n-gram model. CBOW takes the surrounding words and guesses the middle one; skip-gram takes the word and guesses its neighbours. The guesses are only a training trick: what we keep are the numbers. Our models use skip-gram.");
  txt(s, "CBOW: context → word", { x: M, y: 1.4, w: 5.5, h: 0.4, fontSize: 18, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  txt(s, "Skip-gram: word → context", { x: 6.9, y: 1.4, w: 5.8, h: 0.4, fontSize: 18, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  const ctx = ["stole", "a", "silver", "value", "from"];
  ctx.forEach((c, i) => {
    const y = 2.1 + i * 0.6;
    chip(s, M, y, 1.4, 0.42, c, C.accent6, C.background1, 13);
    s.addShape(pres.shapes.LINE, { x: M + 1.4, y: Math.min(y + 0.21, 3.51), w: 1.5, h: Math.abs(3.51 - (y + 0.21)), flipV: y + 0.21 > 3.51, line: { color: HEX.accent6, width: 1 }, objectName: "cbow line " + c });
    chip(s, 11.33, y, 1.4, 0.42, c + " ?", C.accent6, C.background1, 13);
    s.addShape(pres.shapes.LINE, { x: 9.33, y: Math.min(y + 0.21, 3.51), w: 2.0, h: Math.abs(3.51 - (y + 0.21)), flipV: y + 0.21 < 3.51, line: { color: HEX.accent6, width: 1, endArrowType: "triangle" }, objectName: "sg line " + c });
  });
  chip(s, M + 2.9, 3.3, 1.4, 0.42, "watch ?", C.accent2, C.background1, 13, true);
  chip(s, 7.93, 3.3, 1.4, 0.42, "watch", C.accent2, C.background1, 13, true);
  point(s, "word2vec represents each word with 100 numbers learned by prediction.", 5.4);
}
{
  const s = content("Counted and learned similarities", "Left: cosine similarities from the four-column count matrix. Right: from the lab's word2vec model trained on the Proceedings 1674–1799 (100 learned numbers per word). The learned values are less extreme because the model uses every context word, but the pattern is the same. Its nearest neighbours of gin: beer, rum, brandy, purl, shrub, quartern, aniseed, dram, all drinks, learned from the trial texts.");
  const ws = ["gin", "beer", "pot", "watch", "handk."];
  const toy = [[1, 0.87, 0.9, 0.04, 0.03], [0.87, 1, 0.96, 0.01, 0.0], [0.9, 0.96, 1, 0.26, 0.25], [0.04, 0.01, 0.26, 1, 0.98], [0.03, 0.0, 0.25, 0.98, 1]];
  const mdl = [[1, 0.86, 0.62, 0.22, 0.15], [0.86, 1, 0.74, 0.28, 0.16], [0.62, 0.74, 1, 0.44, 0.43], [0.22, 0.28, 0.44, 1, 0.56], [0.15, 0.16, 0.43, 0.56, 1]];
  const shade = (v) => v >= 0.8 ? "1F6F8B" : v >= 0.6 ? "4F92AA" : v >= 0.4 ? "8DBACB" : v >= 0.2 ? "C9DFE7" : "F4F7F9";
  const grid = (data) => [[{ text: "" }, ...ws.map((w) => ({ text: w, options: { bold: true, align: "center", fontSize: 12, color: HEX.dk2 } }))],
    ...data.map((row, i) => [{ text: ws[i], options: { bold: true, fontSize: 12, color: HEX.dk2 } }, ...row.map((v) => ({ text: v.toFixed(2), options: { align: "center", fontSize: 13, fill: { color: shade(v) }, color: v >= 0.6 ? HEX.lt1 : HEX.dk1 } }))])];
  const tOpts = (x) => ({ x, y: 1.95, w: 5.6, colW: [1.1, 0.9, 0.9, 0.9, 0.9, 0.9], rowH: 0.55, valign: "middle", border: { type: "solid", color: "FFFFFF", pt: 2 }, margin: [0.02, 0.05, 0.02, 0.05] });
  txt(s, "Counted: 4 columns", { x: M, y: 1.4, w: 5.6, h: 0.4, fontSize: 18, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  s.addTable(grid(toy), tOpts(M));
  txt(s, "Learned: word2vec, 1674–1799", { x: 7.1, y: 1.4, w: 5.6, h: 0.4, fontSize: 18, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  s.addTable(grid(mdl), tOpts(7.1));
  point(s, "The model’s nearest neighbours of ‘gin’ are beer, rum, brandy, purl, shrub, quartern, aniseed and dram.", 5.55);
}
{
  const s = content("Analogies", "The classic example: king − man + woman ≈ queen. Top answers in the Old Bailey models: 1800–1913: queen, carlisle, swinton; 1674–1799: kings, peace, soveraign. In the earlier model 'queen' is not the answer: fewer contexts, different usage (the King's peace). Analogies are unreliable, and the failures can be informative. Ask the room why it fails in one period.");
  txt(s, "king − man + woman ≈ ?", { x: M, y: 1.5, w: 6, h: 0.6, fontSize: 26, bold: true, fontFace: THEME.headFontFace, color: C.text2 });
  tile(s, M, 2.6, 5.95, 1.6, "1800–1913 model", "queen ✓", { size: 22 });
  tile(s, 6.78, 2.6, 5.95, 1.6, "1674–1799 model", "kings, peace … ✗", { size: 22, labelColor: C.accent2 });
  point(s, "The analogy works in the 1800–1913 model and fails in the 1674–1799 model.", 4.8);
}
{
  const s = content("Neighbours of ‘mad’, ‘insane’ and ‘lunatic’", "Nearest neighbours in the lab's two Old Bailey word2vec models. 'Mad' stays an everyday word in both periods. 'Insane' changes company: before 1800 deranged, delirious, flighty (and some noise: negligent, discreet); after 1800 sane, unsound, insanity, intellect, delusion: the vocabulary of medical evidence and the insanity defence. 'Lunatic' occurs only 16 times before 1800, too rarely for the model to learn anything; after 1800 (174 times) it sits with asylum, confinement, pauper, patient. Context: Criminal Lunatics Act 1800 (after Hadfield's attempt on George III); Daniel M'Naghten tried at the Old Bailey in 1843 (the M'Naghten rules); 1845 Lunacy and County Asylums Acts.");
  const rows = [["mad", "drunken · crazy · raving · silly", "silly · raving · spiteful · passionate", false], ["insane", "deranged · delirious · flighty", "sane · unsound · insanity · delusion", false], ["lunatic", "too rare to learn", "asylum · confinement · pauper · patient", true]];
  txt(s, "1674–1799", { x: 3.0, y: 1.4, w: 4.7, h: 0.4, fontSize: 18, bold: true, color: C.accent6, fontFace: THEME.headFontFace });
  txt(s, "1800–1913", { x: 8.0, y: 1.4, w: 4.7, h: 0.4, fontSize: 18, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  rows.forEach(([w, a, b, rare], i) => {
    const y = 1.95 + i * 1.15;
    txt(s, w, { x: M, y, w: 2.3, h: 0.95, fontSize: 24, bold: true, fontFace: THEME.headFontFace, color: i === 0 ? C.text2 : C.accent2, valign: "middle" });
    box(s, 3.0, y, 4.75, 0.95, C.background2, w + " early");
    txt(s, a, { x: 3.2, y, w: 4.35, h: 0.95, fontSize: 16, valign: "middle", italic: rare, color: rare ? MUTED : C.text1 });
    box(s, 7.98, y, 4.75, 0.95, C.background2, w + " late");
    txt(s, b, { x: 8.18, y, w: 4.35, h: 0.95, fontSize: 16, valign: "middle" });
  });
  point(s, "After 1800, ‘insane’ and ‘lunatic’ appear with medical and institutional words; ‘mad’ keeps its everyday neighbours.", 5.6);
}
{
  const s = content("Neighbours of ‘electricity’", "Nearest neighbours of 'electricity' in the two word2vec models trained on the Royal Society Corpus (the second lab notebook), split at 1800. Before 1800 it sits among its own specialist vocabulary: electrified, insulated, excited, electrics and non-electrics (the period's names for conductors and insulators) and the electrometer. After 1800 its neighbours include voltaic, magneto, magnetism and heat, and it is discussed together with other physical forces (Ørsted, Faraday; W. R. Grove's 'correlation of physical forces', 1846). The bigram table, the collocation chart and the model show the same change.");
  const early = ["electrified", "insulated", "excited", "electrics", "nonelectric", "conductor"];
  const late = ["voltaic", "magneto", "magnetism", "heat", "charge", "conductor"];
  const hi = new Set(["voltaic", "magneto", "magnetism", "heat"]);
  const col = (x, title, arr) => {
    txt(s, title, { x, y: 1.45, w: 5.9, h: 0.45, fontSize: 20, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
    arr.forEach((w, i) => chip(s, x + (i % 2) * 2.95, 2.1 + Math.floor(i / 2) * 0.75, 2.75, 0.58, w, hi.has(w) ? C.accent2 : C.background2, hi.has(w) ? C.background1 : C.text2, 16, hi.has(w)));
  };
  col(M, "1665–1799", early);
  col(6.83, "1800–1920", late);
  point(s, "After 1800, ‘electricity’ appears near words for magnetism and heat.", 4.7);
  src(s, "Nearest neighbours of ‘electricity’ in the Royal Society lab’s two word2vec models.");
}
{
  const s = content("Semantic change in research", "Training embeddings per period and comparing them shows semantic shift. Left: Hamilton, Leskovec and Jurafsky, 'Diachronic word embeddings reveal statistical laws of semantic change' (2016): gay, broadcast, awful. Right: semantic shift of individual words in Dutch newspapers, with frequency: the basis for Exercise 2.");
  fit(s, MEDIA + "image-40-1.png", M, 1.5, 6.1, 3.9, "Semantic change of gay, broadcast, awful");
  fit(s, MEDIA + "image-40-2.png", 6.95, 1.5, 5.78, 3.9, "Semantic shifts in Dutch newspapers");
  point(s, "Hamilton et al. trace the changing neighbours of ‘gay’, ‘broadcast’ and ‘awful’.", 5.7);
  src(s, "Left: Hamilton, Leskovec and Jurafsky (2016). Right: Dutch newspapers, with frequency.");
}
{
  const s = content("What the models learn", "All examples from the lab's models. Names: 'maroney' is Detective Stephen Maroney, a frequent police witness, so he becomes 'similar' to constable. Places and institutions: in the early model 'police' sits with bow, marlborough, rotation: the Bow Street and Marlborough Street police offices. Spelling: murther, shilings, guines get their own vectors. Transcription: theprisoner, watchouse: words run together by printers or OCR. The models reflect the corpus, including the work of its clerks, printers and digitisers.");
  [["Names", "maroney, fawell"], ["Institutions", "bow, marlborough"], ["Spelling", "murther, shilings"], ["Transcription", "theprisoner"]].forEach(([h, ex], i) =>
    tile(s, M + i * 3.07, 1.6, 2.85, 2.0, h, ex, { size: 17 }));
  point(s, "The models reflect the particular features of the corpus they were trained on.", 4.3);
}
{
  const s = content("Exercise 2: semantic shift", "http://macroscope.intelligence-media.com. Translate your concept from Exercise 1 (or choose a new one); compare frequency, semantic shift and the collocation network across periods; add your concept to Wooclap.");
  ["Open macroscope.intelligence-media.com", "Choose your concept from Exercise 1", "Compare its neighbours across periods"].forEach((t, i) => {
    const y = 1.55 + i * 1.25;
    box(s, M, y, CW, 1.05, C.background2, "step " + (i + 1));
    numBadge(s, M + 0.3, y + 0.27, i + 1);
    txt(s, t, { x: M + 1.1, y, w: 10.5, h: 1.05, fontSize: 20, valign: "middle" });
  });
  point(s, "Then add your concept to Wooclap.", 5.6);
}
{
  const s = content("Summary of the three methods", "Recap before the pitfalls. All three methods count words in context and compare: over time, between groups, between periods. Frequency asks how often; association asks in what company; embeddings ask what a word means, from all its contexts at once. Each has its typical trap. And all three end the same way: go back and read.");
  const hdr = ["", "Frequency", "Association", "Embeddings"].map((t, i) => ({ text: t, options: { bold: true, color: i ? HEX.lt1 : HEX.dk2, fill: { color: i ? HEX.accent1 : HEX.lt1 }, align: "center", fontSize: 16 } }));
  const rows = [["Asks", "How often?", "In what company?", "What does it mean?"], ["Example", "electric fire → current", "liberty to = permission", "‘insane’ gains medical neighbours"], ["Trap", "the corpus changes", "rare words, the comparison", "reflects the corpus"]];
  s.addTable([hdr, ...rows.map((r) => r.map((t, i) => ({ text: t, options: { bold: i === 0, color: i === 0 ? HEX.dk2 : HEX.dk1, fontSize: i === 0 ? 15 : 16, align: i === 0 ? "left" : "center", fill: { color: i === 0 ? HEX.lt2 : HEX.lt1 } } })))],
    { x: M, y: 1.5, w: CW, colW: [1.9, 3.41, 3.41, 3.41], rowH: 0.75, valign: "middle", border: { type: "solid", color: "DDE3E8", pt: 0.75 }, margin: [0.05, 0.15, 0.05, 0.15] });
  point(s, "All three methods count words in context and compare the counts; the results then need to be checked against the texts.", 4.9);
}

// =====================================================================
sec("6 Pitfalls");
divider(6, "Pitfalls", "What goes wrong, and how to build a corpus that answers your question", "Dangers and next steps. This part returns to the third question from Part 1: did the corpus change?");
{
  const s = content("The ‘asteroid’ example", "A spike in 'asteroid' in 19th-century American newspapers is about a famous racehorse. Take into account the specific historical circumstances of your sources: newspapers use words for many different reasons.");
  fit(s, MEDIA + "image-44-1.png", M, 1.45, 6.6, 4.3, "Frequency of asteroid in American newspapers");
  fit(s, MEDIA + "image-44-2.png", 7.6, 1.45, 5.13, 4.3, "Wikipedia: Asteroid (horse)");
  point(s, "The rise in ‘asteroid’ comes from reports about a racehorse of that name.");
}
{
  const s = content("Other common problems", "Visualisations that hide more than they show: word clouds of presidential speeches. Misreading the sources: 'national wellbeing' from millions of books (Hills et al., 'Historical analysis of national subjective wellbeing using millions of digitized books'). Plain mistakes: the Nature retraction ('we should have labelled moralizing gods as absent or inferred absent rather than unknown... rather than converting NAs to zeros'). Digitisation errors: 'Cafes of Nouns' for 'Cases of Nouns'.");
  [["image-45-1.png", "Misleading visuals"], ["image-45-2.png", "Misread sources"], ["image-45-3.png", "Plain mistakes"], ["image-45-4.png", "Digitisation errors"]].forEach(([f, h], i) => {
    const x = M + i * 3.07;
    fit(s, MEDIA + f, x, 1.45, 2.85, 3.2, h);
    txt(s, h, { x, y: 4.85, w: 2.85, h: 0.5, fontSize: 18, bold: true, fontFace: THEME.headFontFace, color: C.accent1, align: "center" });
  });
}
{
  const s = content("Cliodynamics", "Cliodynamics (Peter Turchin): can large historical datasets predict the future? What would we need to believe about the sources? A discussion point: echoes of cliometrics (Part 1).");
  fit(s, MEDIA + "image-46-1.jpeg", M, 1.45, 6.6, 4.1, "Cliodynamics");
  fit(s, MEDIA + "image-46-2.jpeg", 7.6, 1.45, 5.13, 4.1, "Peter Turchin");
  point(s, "What would we need to believe about the sources?");
}
{
  const s = content("Building a corpus: four questions", "Use these when planning your own project: what is your research question; which comparison do you want to make; do you have data from your whole period; what are the biases in your collection and how can you address them?");
  ["What is your question?", "What will you compare?", "Does the data cover your period?", "What are its biases?"].forEach((t, i) => {
    const x = M + (i % 2) * 6.15, y = 1.55 + Math.floor(i / 2) * 2.0;
    box(s, x, y, 5.95, 1.7, C.background2, "question " + (i + 1));
    numBadge(s, x + 0.3, y + 0.6, i + 1);
    txt(s, t, { x: x + 1.05, y, w: 4.7, h: 1.7, fontSize: 21, valign: "middle" });
  });
}
{
  const s = content("Tools to try", "Gale Scholar Lab (build and analyse corpora from Gale collections); Voyant Tools (quick counts and concordances, voyant-tools.org); Programming Historian (free tutorials, programminghistorian.org); Google Books Ngram Viewer (books.google.com/ngrams); LUCDH (lab, courses, electives, minor in DH, workshops); marimo (the notebooks for next week's lab, marimo.io).");
  ["Voyant Tools", "Google Books Ngram Viewer", "Gale Scholar Lab", "Programming Historian", "LUCDH", "marimo"].forEach((h, i) =>
    tile(s, M + (i % 3) * 4.1, 1.5 + Math.floor(i / 3) * 1.7, 3.9, 1.45, h, ""));
  src(s, "voyant-tools.org · books.google.com/ngrams · programminghistorian.org · marimo.io");
}
{
  const s = pres.addSlide({ masterName: "Section Divider", sectionTitle: section });
  s.addText("Next week", { placeholder: "kicker" });
  s.addText("Hands-on lab", { placeholder: "title" });
  s.addText("yann-ryan.github.io/marimo-digi-hist", { placeholder: "body" });
  txt(s, "Chrome on a laptop · no install, no account · click ‘run all’ once", { x: M, y: 5.0, w: 11, h: 0.5, fontSize: 16, color: C.accent3 });
  s.addNotes("Two notebooks: the Old Bailey and the Royal Society's journals. Count words and phrases, find collocations and distinctive words, and explore embeddings (gin, insane, electricity...). Bring a laptop; think of one word to follow through 250 years. First load takes about 30 seconds.");
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
