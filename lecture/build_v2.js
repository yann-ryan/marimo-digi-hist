// Counting the past: quantitative text analysis lecture (v2, rebuilt 2026-11-14)
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
pres.title = "Counting the past: quantitative text analysis for historical research";
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
function divider(kicker, title, body, notes) {
  const s = pres.addSlide({ masterName: "Section Divider", sectionTitle: section });
  s.addText(kicker, { placeholder: "kicker" });
  s.addText(title, { placeholder: "title" });
  s.addText(body, { placeholder: "body" });
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
const xex = JSON.parse(fs.readFileSync(EXT + "xexam.json"));
const ch_en = JSON.parse(fs.readFileSync(EXT + "ngram/ch1_en-2019.json"))[0].timeseries;
const ch_de = JSON.parse(fs.readFileSync(EXT + "ngram/ch1_de-2019.json"))[0].timeseries;

// =====================================================================
sec("Opening");
{
  const s = pres.addSlide({ masterName: "Title Dark", sectionTitle: section });
  s.addText("Counting the past", { placeholder: "title" });
  s.addText("Quantitative text analysis for historical research", { placeholder: "body" });
  s.addText("Dr Yann Ryan · Digital History 2026–27", { placeholder: "byline" });
  s.addNotes("Lecture in the week before the hands-on lab. Theory and examples here; next week students try the methods themselves in a marimo notebook on the Old Bailey Proceedings.");
}
{
  const s = content("Today: five steps, then a lab", "Three methods, all built on counting words: frequency, association, embeddings. Grey steps set the scene; blue steps are the methods students will try in the lab.");
  const steps = [["Context", "Why count words?", C.accent6], ["Data", "What are we counting?", C.accent6], ["Frequency", "How often?", C.accent1], ["Association", "In what company?", C.accent1], ["Embeddings", "What does it mean?", C.accent1]];
  steps.forEach(([a, b, f], i) => {
    const x = M + i * 2.05;
    s.addShape(pres.shapes.CHEVRON, { x, y: 2.0, w: 2.0, h: 1.0, fill: { color: f }, line: { type: "none" }, objectName: "step " + a });
    txt(s, a, { x: x + 0.3, y: 2.0, w: 1.45, h: 1.0, align: "center", valign: "middle", fontSize: 15, bold: true, color: C.background1 });
    txt(s, b, { x, y: 3.15, w: 2.0, h: 0.5, align: "center", fontSize: 14, italic: true, color: MUTED });
  });
  chip(s, M + 5 * 2.05 + 0.15, 2.0, 1.9, 1.0, "Lab next week", C.accent2, C.background1, 15, true);
  box(s, M, 4.4, CW, 1.3, C.background2, "running example");
  txt(s, [
    { text: "Running example throughout: ", options: { bold: true, color: C.accent1 } },
    { text: "240 years of trials at the Old Bailey, London’s central criminal court. Every number in today’s Old Bailey slides comes from the same sample and models you will use in the lab." },
  ], { x: M + 0.3, y: 4.55, w: CW - 0.6, h: 1.0, fontSize: 17, valign: "middle" });
}

// =====================================================================
sec("1 Why count words?");
divider("Part 1", "Why count words?", "A short history of computers, historians and text", "From Busa's concordance to today's digitised archives.");
{
  const s = content("Seventy years of counting", "Busa: the Index Thomisticus, the first large-scale humanities computing project. Cliometrics: econometrics applied to historical data, e.g. Fogel and Engerman's Time on the Cross; lots of money and energy, controversial results. 1980s backlash: postmodernism, the archival and linguistic turn, Foucault, microhistories like The Cheese and the Worms and The Return of Martin Guerre. 1990s–2000s: digitisation and tools to analyse language. What is different now: the focus is on language itself.");
  const items = [
    ["image-4-1.jpeg", "1940s", "Roberto Busa", "Index Thomisticus: a concordance of every word in Aquinas, built with IBM"],
    ["image-4-2.jpeg", "1960s–70s", "Cliometrics", "Statistics applied to history: big claims, big controversies"],
    ["image-4-3.jpeg", "1980s", "The backlash", "Linguistic turn, discourse analysis, microhistory"],
    ["image-4-4.jpg", "1990s–2000s", "Digitisation", "Mass digitised sources and the computing power to read them"],
    ["image-4-5.png", "Now", "Language at scale", "Not just numbers about the past: the words of the past"],
  ];
  const cw = CW / 5;
  s.addShape(pres.shapes.LINE, { x: M, y: 3.95, w: CW, h: 0, line: { color: HEX.accent6, width: 1.25 }, objectName: "timeline" });
  items.forEach(([f, yr, name, desc], i) => {
    const x = M + i * cw;
    fit(s, MEDIA + f, x + 0.15, 1.4, cw - 0.3, 2.3, name);
    s.addShape(pres.shapes.OVAL, { x: x + cw / 2 - 0.09, y: 3.86, w: 0.18, h: 0.18, fill: { color: C.accent2 }, line: { type: "none" }, objectName: "dot " + yr });
    txt(s, yr, { x, y: 4.15, w: cw, h: 0.35, align: "center", fontSize: 15, bold: true, color: C.accent2 });
    txt(s, name, { x, y: 4.5, w: cw, h: 0.4, align: "center", fontSize: 16, bold: true, fontFace: THEME.headFontFace, color: C.text2 });
    txt(s, desc, { x: x + 0.1, y: 4.95, w: cw - 0.2, h: 1.1, align: "center", fontSize: 13, color: C.text1 });
  });
}
{
  const s = content("Words are a historian’s basic unit", "We already work with words all the time. Computational methods make some of these questions answerable at scale, especially the first two.");
  const items = [["Measure", "How often did a writer refer to ‘the people’?"], ["Name", "What did X call Y, and when did that change?"], ["Find", "Evidence: a name on a title page, a signature"], ["Interpret", "Concepts: conceptual history, history of ideas"]];
  items.forEach(([h, b], i) => {
    const x = M + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 2.3;
    box(s, x, y, 5.95, 2.0, C.background2, h);
    numBadge(s, x + 0.3, y + 0.3, i + 1, i < 2 ? C.accent1 : C.accent6);
    txt(s, h, { x: x + 1.0, y: y + 0.3, w: 4.6, h: 0.5, fontSize: 20, bold: true, fontFace: THEME.headFontFace, color: C.text2, valign: "middle" });
    txt(s, b, { x: x + 1.0, y: y + 0.95, w: 4.6, h: 0.9, fontSize: 16 });
  });
}
// slide 6: close vs distant, one concrete example (Garrow, cross-examination)
{
  const s = content("Reading at two scales", "Close reading: an Old Bailey coining trial of October 1784 (t17841020-91). William Garrow, the most famous defence barrister of the age, cross-examines the prosecution's key witness, a publican, and gets him to admit that the whole case was a trap set up with the Bow Street officers, perhaps to get his licence back. The defendants were acquitted. Until the 1730s prisoners accused of felony had no lawyer at all; here a barrister takes the prosecution's story apart. Distant reading: the share of trials in the sample whose printed text contains the word 'cross-examination' (any spelling). Nothing before the 1740s; almost half of all trials by the 1880s. Reading shows what a cross-examination could do; counting shows when it became routine. Keep this chart in mind: in Part 3 we find out what it is really counting.");
  box(s, M, 1.45, 5.9, 4.95, C.background2, "close reading card");
  txt(s, "Close reading: one trial", { x: M + 0.3, y: 1.62, w: 5.3, h: 0.4, fontSize: 18, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
  txt(s, "Old Bailey, October 1784 · coining, both defendants acquitted", { x: M + 0.3, y: 2.05, w: 5.3, h: 0.3, fontSize: 12, italic: true, color: MUTED });
  txt(s, [
    { text: "Mr. Garrow, Prisoner’s Council. ", options: { bold: true, italic: false, color: C.accent2 } },
    { text: "So, this was a trap contrived by you and the gentlemen of Bow-street? – It was. … Was not this trap to lead to your getting a licence? – No, my licence was not grumbled at, why should it. ", options: {} },
    { text: "Do not argue with me, but answer the question.", options: { bold: true, color: C.accent2 } },
  ], { x: M + 0.3, y: 2.5, w: 5.3, h: 2.6, fontSize: 17, fontFace: THEME.headFontFace, italic: true });
  txt(s, "A defence barrister turns the prosecution’s own witness. Fifty years earlier, felony defendants had no lawyer at all.", { x: M + 0.3, y: 4.75, w: 5.3, h: 1.0, fontSize: 15 });
  txt(s, "Distant reading: 12,482 trials", { x: 6.85, y: 1.62, w: 5.9, h: 0.4, fontSize: 18, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
  txt(s, "% of trials containing ‘cross-examination’, by decade", { x: 6.85, y: 2.05, w: 5.9, h: 0.3, fontSize: 12, italic: true, color: MUTED });
  const sub = xex.filter((d) => d.decade >= 1700);
  s.addChart(pres.charts.LINE, [{ name: "cross-examination", labels: sub.map((d) => d.decade + "s"), values: sub.map((d) => d.xexam) }], chartOpts({ x: 6.7, y: 2.35, w: 6.1, h: 3.4, chartColors: [HEX.accent2], lineSize: 2.5, lineDataSymbol: "circle", lineDataSymbolSize: 5, showLegend: false, valAxisMaxVal: 50, valAxisMinVal: 0, valAxisMajorUnit: 10, catAxisLabelFontSize: 10, catAxisLabelRotate: -45, catAxisLabelFrequency: 2 }));
  txt(s, "Reading shows what a cross-examination could do. Counting shows when it became routine.", { x: 6.85, y: 5.85, w: 5.9, h: 0.6, fontSize: 15, bold: true, color: C.text2 });
  caption(s, "Old Bailey Online, t17841020-91; sample of 12,482 trials (≤500 per decade).", 6.6);
}
// NEW slide 7: Delpher scan and its OCR
{
  const s = content("From archive to data: what OCR gives you", "Real example from Delpher: the Noordhollandsche courant of 3 May 1780, page 2, a list of appointments and deaths in the VOC's Asian settlements ('Batavische Nouvelles'). Top: the scan. Bottom: the OCR text Delpher serves for the same lines (hyphenated words joined). Errors in red. The long s (ſ) in 'ontslagen' (dismissed) is read as f; italic names and place-names suffer most. Searching Delpher for 'ontslagen' will not find this article. 2000s onward: large digitisation projects create an over-abundance of sources: OCR for print (Delpher), HTR for handwriting (the VOC and notarial archives, 3 million pages; Amsterdam City Archives). The question is always: what has the machine done to the text before we count it?");
  const steps = ["Page scan", "OCR / HTR", "Text", "Corpus + metadata"];
  steps.forEach((t, i) => {
    const x = M + i * 3.1;
    chip(s, x, 1.3, 2.55, 0.42, t, i === 1 ? C.accent1 : C.background2, i === 1 ? C.background1 : C.text2, 13, true);
    if (i < 3) arrowRight(s, x + 2.63, 1.36, 0.38, 0.3);
  });
  const r = fit(s, EXT + "delpher/crop.jpg", M, 1.95, CW, 2.0, "Scan of the Noordhollandsche courant, 3 May 1780, page 2 (detail)");
  s.addShape(pres.shapes.RECTANGLE, { x: r.x, y: r.y, w: r.w, h: r.h, fill: { type: "none" }, line: { color: HEX.accent6, width: 0.75 }, objectName: "scan frame" });
  const base = { fontSize: 14.5, color: HEX.dk1, fontFace: "Courier New" };
  const ocr = "Den 5 [[Octobcr]] op [[Ceyloa]] den Koopman Sluyskens, Administrateur te [[Jaiknapataaai]]. Stork, als [[dispenfier]] te Colombo [[ontflagen]]. Den Onder-Koopman van [[S.-nden]], in zyn plaatst, G.W.Trek, Secretaris van Politie te [[Gak]] [[ontflagen]]. Den Onder-Koopman H. L. [[Merthezc]], in zyn plaats. Den 7 dito. Anthony Hendrik [[Dormcux]], oud [[vifitatcur]] Generaal der [[Indiefche]] Negotie - Boeken, overleden. [[Don]] 8 dito den Oud-[[Luytcnant]] [[det]] [[Burgcry]] Klaas de Graaf, overleden.";
  box(s, M, 4.05, CW, 1.75, C.background2, "ocr text");
  txt(s, "What the computer reads", { x: M + 0.25, y: 4.12, w: 6, h: 0.3, fontSize: 12, bold: true, color: C.accent1 });
  s.addText(marked(ocr, base, { color: HEX.accent2, bold: true }), { isTextBox: true, x: M + 0.25, y: 4.42, w: CW - 0.5, h: 1.32, margin: 0, valign: "top", lineSpacingMultiple: 1.0 });
  const notes3 = [["Long s read as f", "the long s in ‘ontslagen’ becomes ‘ontflagen’: a search for ontslagen misses it"], ["Names and italics", "Gale → Gak, Jaffanapatnam → Jaiknapataaai"], ["Letter confusions", "e → c: October → Octobcr, Luytenant → Luytcnant"]];
  notes3.forEach(([h, b], i) => {
    const x = M + i * 4.1;
    txt(s, [{ text: h + "  ", options: { bold: true, color: C.accent2 } }, { text: b }], { x, y: 5.92, w: 3.9, h: 0.6, fontSize: 13 });
  });
  caption(s, "Noordhollandsche courant, 3 May 1780, p. 2 (‘Batavische Nouvelles’). Scan and OCR: Delpher, KB – National Library of the Netherlands.", 6.62);
}
{
  const s = content("Borrowed methods, historical questions", "Linguists design balanced corpora to study language; historians use whatever survives to study the past. Keep these tensions in mind with every method today.");
  txt(s, "Methods mostly come from computational and corpus linguistics", { x: M, y: 1.4, w: CW, h: 0.4, fontSize: 17 });
  ["frequency", "collocation", "keyness", "embeddings"].forEach((t, i) => chip(s, M + i * 2.35, 1.95, 2.15, 0.55, t, C.accent1, C.background1, 15, true));
  txt(s, "But there are tensions:", { x: M, y: 2.9, w: CW, h: 0.4, fontSize: 17, bold: true, color: C.text2 });
  [["Not just language", "Historians are never only interested in language itself"], ["Unbalanced corpora", "We work with what survived and was digitised, not designed samples"], ["Not always ‘science’", "Hypothesis testing does not fit every historical question"]].forEach(([h, b], i) =>
    card(s, M + i * 4.1, 3.45, 3.9, 2.4, h, b, { headColor: C.accent2 }));
}
{
  const s = content("A word gets more frequent. Why?", "Three explanations for any change in frequency. Only the first two are about the past; the third is about the source. Most of today's 'dangers' are the third. Keep this slide in mind for every chart that follows.");
  s.addChart(pres.charts.LINE, [{ name: "frequency", labels: ["", "", "", "", "", "", "", "", "", ""], values: [0.3, 0.35, 0.4, 0.5, 0.45, 0.6, 0.8, 1.1, 1.6, 2.0] }], chartOpts({ x: M, y: 1.5, w: 5.4, h: 4.2, chartColors: [HEX.accent1], lineSize: 3, lineDataSymbol: "none", showLegend: false, valAxisHidden: true, catAxisHidden: true, valGridLine: { style: "none" } }));
  txt(s, "Illustration", { x: M, y: 5.75, w: 5.4, h: 0.3, fontSize: 11, italic: true, color: MUTED, align: "center" });
  [["It is topical", "Something happened: the word is ‘trending’", C.accent1], ["Its meaning changed", "The word took on a new or wider sense", C.accent1], ["The corpus changed", "More of a certain kind of text, a new spelling, better OCR", C.accent2]].forEach(([h, b, c], i) =>
    card(s, 6.5, 1.5 + i * 1.5, 6.23, 1.3, h, b, { headColor: c }));
}
{
  const s = content("Questions of quantity", "Counts become interesting through comparison: over time, between groups, between places.");
  [["How often?", "How many trials record a cross-examination, decade by decade?"], ["Compared with whom?", "Which words are typical of trials of women, or of men?"], ["Where?", "Which words are associated with a particular place?"]].forEach(([h, b], i) =>
    card(s, M + i * 4.1, 1.6, 3.9, 2.6, h, b, { headSize: 20, bodySize: 16 }));
  box(s, M, 4.6, CW, 1.1, C.background2, "takeaway");
  txt(s, "Counts become meaningful through comparison: over time, between groups, between places.", { x: M + 0.3, y: 4.6, w: CW - 0.6, h: 1.1, fontSize: 18, bold: true, color: C.text2, valign: "middle" });
}

// =====================================================================
sec("2 What are we counting?");
divider("Part 2", "What are we counting?", "Curating a corpus, and the Old Bailey Proceedings", "Before any method: what is in the corpus and how it was made.");
{
  const s = content("Data always needs curating first", "Cleaning improves the signal. Lemmatisation (stole → steal), part-of-speech tagging, function words, spelling standardisation: each is optional and each is a choice.");
  [["Select", "a cohesive corpus"], ["Describe", "gather metadata"], ["Clean", "OCR correction, spelling standardisation"], ["Prepare", "split into words, lemmatise, parts of speech"]].forEach(([h, b], i) => {
    const x = M + i * 3.07;
    box(s, x, 1.6, 2.85, 2.7, C.background2, h);
    numBadge(s, x + 0.25, 1.8, i + 1);
    txt(s, h, { x: x + 0.25, y: 2.5, w: 2.4, h: 0.45, fontSize: 20, bold: true, fontFace: THEME.headFontFace, color: C.text2 });
    txt(s, b, { x: x + 0.25, y: 3.0, w: 2.4, h: 1.1, fontSize: 15 });
    if (i < 3) arrowRight(s, x + 2.88, 2.8, 0.17, 0.3);
  });
  txt(s, "Every choice here (what to include, how to clean, how to split) changes every count that follows.", { x: M, y: 4.8, w: CW, h: 0.6, fontSize: 18, bold: true, color: C.accent2 });
}
{
  const s = content("Our example: the Old Bailey Proceedings", "This is the corpus for next week's lab. In the lab we use a random sample of 12,482 trials (up to 500 per decade); the word embeddings are trained on the full text.");
  [["197,750", "trials"], ["~123 million", "words"], ["1674–1913", "240 years"]].forEach(([n, l], i) => {
    txt(s, n, { x: M + i * 4.1, y: 1.45, w: 3.9, h: 0.9, fontSize: 44, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
    txt(s, l, { x: M + i * 4.1, y: 2.35, w: 3.9, h: 0.4, fontSize: 15, color: MUTED });
  });
  [["What", "Printed accounts of trials at London’s central criminal court"], ["Who made it", "Digitised, transcribed and marked up by Old Bailey Online"], ["Extra", "Every trial tagged by hand: offence, verdict, punishment, defendant’s gender"]].forEach(([h, b], i) =>
    card(s, M + i * 4.1, 3.15, 3.9, 2.1, h, b));
  caption(s, "Data: Old Bailey Online (Hitchcock, Shoemaker, Emsley, Howard, McLaughlin et al.), via Hugging Face biglam/old_bailey_proceedings, CC BY-NC 4.0.", 5.6);
}
{
  const s = content("The corpus is a source too", "Ask: why would trials get longer? Every count is a count of the source, not directly of the past. The drop in the 1890s and 1900s is worth asking about too. Students make this chart in Part 1 of the lab.");
  const lab = ["1670s", "1680s", "1690s", "1700s", "1710s", "1720s", "1730s", "1740s", "1750s", "1760s", "1770s", "1780s", "1790s", "1800s", "1810s", "1820s", "1830s", "1840s", "1850s", "1860s", "1870s", "1880s", "1890s", "1900s", "1910s"];
  const val = [108, 94.5, 98, 90, 114, 84, 48, 157.5, 312, 346, 188, 364, 513.5, 451.5, 266.5, 284, 290.5, 253, 357.5, 395, 350.5, 382, 73.5, 99, 317.5];
  s.addChart(pres.charts.BAR, [{ name: "Median words per trial", labels: lab, values: val }], chartOpts({ x: M, y: 1.3, w: 8.4, h: 5.1, barDir: "col", chartColors: [HEX.accent1], showLegend: false, showTitle: true, title: "Median words per trial, by decade", titleFontSize: 14, titleColor: "333333", catAxisLabelRotate: -45, catAxisLabelFontSize: 10, barGapWidthPct: 40 }));
  box(s, 9.3, 1.6, 3.43, 3.2, C.background2, "takeaway");
  txt(s, "Trials did not get wordier. The Proceedings changed from short pamphlets to near-verbatim shorthand records.", { x: 9.5, y: 1.8, w: 3.03, h: 2.8, fontSize: 17, color: C.text2 });
}
{
  const s = content("Step one: what counts as a word?", "Tokenisation: the exact rule used in the lab. The red tokens are what is left of '40s.' and \"Prosecutor's\". Students edit this sentence in the lab and watch the tokens change.");
  box(s, M, 1.4, CW, 0.75, C.background2, "sentence");
  txt(s, "“The Prisoner stole a silver Watch, value 40s. from the Prosecutor's pocket.”", { x: M + 0.3, y: 1.4, w: CW - 0.6, h: 0.75, fontSize: 19, italic: true, fontFace: THEME.headFontFace, valign: "middle" });
  s.addShape(pres.shapes.DOWN_ARROW, { x: W / 2 - 0.2, y: 2.3, w: 0.4, h: 0.45, fill: { color: C.accent6 }, line: { type: "none" }, objectName: "down arrow" });
  const toks = ["the", "prisoner", "stole", "a", "silver", "watch", "value", "s", "from", "the", "prosecutor", "s", "pocket"];
  let x = M;
  toks.forEach((t) => {
    const w = 0.28 + t.length * 0.105;
    chip(s, x, 2.95, w, 0.48, t, t === "s" ? C.accent2 : C.accent1, C.background1, 13);
    x += w + 0.1;
  });
  [["Rule", "lower-case everything; keep runs of letters a–z"], ["Lost", "numbers (40), punctuation, the apostrophe in Prosecutor’s"], ["Kept apart", "murder and murther, shilling and shilings"]].forEach(([h, b], i) =>
    card(s, M + i * 4.1, 3.95, 3.9, 1.9, h, b));
}

// =====================================================================
sec("3 Frequency");
divider("Part 3", "How often? Frequency", "Counting, normalising, phrases, and going back to the text", "Method 1: term frequency.");
{
  const s = content("Choosing what to count", "Search terms: a single word, a group of words, word variants, word combinations. Then normalise, and think about high and low frequencies. The cross-examination example on the next slides is a set of variants: cross-examined, Cross Examination, cross examin'd. The madness group comes back in Part 5.");
  const items = [["A word", ["gin"]], ["Its variants", ["murder", "murther"]], ["A group of words", ["mad", "insane", "lunatic"]], ["A phrase (n-gram)", ["silver watch"]]];
  items.forEach(([h, chips], i) => {
    const x = M + i * 3.07;
    box(s, x, 1.5, 2.85, 2.9, C.background2, h);
    txt(s, h, { x: x + 0.2, y: 1.7, w: 2.45, h: 0.45, fontSize: 18, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
    chips.forEach((c, j) => chip(s, x + 0.2, 2.35 + j * 0.62, 2.45, 0.48, c, C.background1, C.text2, 15, true));
  });
  txt(s, "High-frequency words tell you about the genre; low-frequency words are often where the history is.", { x: M, y: 4.85, w: CW, h: 0.6, fontSize: 18, bold: true, color: C.accent2 });
}
{
  const s = content("Raw counts mislead: normalise", "Same search, two views. The raw count partly measures how much was printed and digitised. The relative frequency asks: of everything printed that year, how much mentions the word?");
  fit(s, MEDIA + "image-18-1.png", M, 1.45, 5.9, 3.7, "Delpher: raw number of articles mentioning liberaal");
  fit(s, MEDIA + "image-18-2.png", 6.83, 1.45, 5.9, 3.7, "Delpher: share of articles mentioning liberaal");
  txt(s, [{ text: "Raw count  ", options: { bold: true, color: C.accent1 } }, { text: "how many articles mention liberaal" }], { x: M, y: 5.3, w: 5.9, h: 0.4, fontSize: 15 });
  txt(s, [{ text: "Relative frequency  ", options: { bold: true, color: C.accent1 } }, { text: "as a share of all articles that year" }], { x: 6.83, y: 5.3, w: 5.9, h: 0.4, fontSize: 15 });
  caption(s, "Delpher newspaper search for ‘liberaal’. More newspapers were printed (and digitised) later, so raw counts rise anyway.", 5.95);
}
// frequency example: cross-examination
{
  const s = content("When did lawyers take over the trial?", "Normalised as a share of trials, because trial length changes so much (Part 2). Before the 1730s, a prisoner accused of felony had no lawyer: the trial was an 'altercation' between accuser and accused, with the judge as the prisoner's supposed protector. From the 1730s judges began to let defence counsel examine and cross-examine witnesses, though not address the jury. William Garrow made aggressive cross-examination famous at the Old Bailey in the 1780s and 1790s. The Prisoners' Counsel Act of 1836 let defence counsel speak to the jury. John Langbein calls this the 'lawyerization' of the criminal trial: the origin of the adversarial trial we know today (Langbein, The Origins of Adversary Criminal Trial, 2003; J. M. Beattie, 'Scales of Justice', Law and History Review 9 (1991)). The line looks like a clean measure of that story. Ask the three questions from Part 1 (topical? meaning? corpus?) before you believe it: next slides.");
  const sub = xex;
  s.addChart(pres.charts.LINE, [{ name: "cross-examination", labels: sub.map((d) => d.decade + "s"), values: sub.map((d) => d.xexam) }],
    chartOpts({ x: M - 0.1, y: 1.3, w: 8.5, h: 5.0, chartColors: [HEX.accent2], lineSize: 2.75, lineDataSymbol: "circle", lineDataSymbolSize: 6, showLegend: false, valAxisMinVal: 0, valAxisMaxVal: 50, valAxisMajorUnit: 10, showValAxisTitle: true, valAxisTitle: "% of trials containing ‘cross-examination’", valAxisTitleFontSize: 11, valAxisTitleColor: MUTED, catAxisLabelRotate: -45, catAxisLabelFontSize: 10 }));
  const ev = [["1730s", "Judges begin to allow defence counsel to question witnesses in felony trials, but not to address the jury"], ["1780s", "William Garrow makes aggressive cross-examination famous"], ["1836", "Prisoners’ Counsel Act: defence counsel may speak to the jury"]];
  ev.forEach(([y, t], i) => {
    txt(s, y, { x: 8.75, y: 1.45 + i * 1.3, w: 1.0, h: 0.4, fontSize: 17, bold: true, color: C.accent2, fontFace: THEME.headFontFace });
    txt(s, t, { x: 9.75, y: 1.45 + i * 1.3, w: 3.0, h: 1.2, fontSize: 14 });
  });
  box(s, 8.75, 5.4, 3.98, 0.95, C.background2, "takeaway");
  txt(s, "From nothing to almost half of all trials: the birth of the adversarial trial?", { x: 8.95, y: 5.4, w: 3.6, h: 0.95, fontSize: 14, bold: true, color: C.text2, valign: "middle" });
  caption(s, "Old Bailey sample, 500 trials per decade. Matches cross-examined, Cross Examination, cross examin’d and other spellings.", 6.55);
}
{
  const s = content("The most frequent words are rarely interesting", "Counts from the lab sample (6.8 million words). 'prisoner' and 'mr' tell us about the genre; q and th about how it was printed. Stopword lists are choices too: removing 'she' or 'her' would hide gender.");
  const opts = { x: M, y: 1.45, w: 3.6, colW: [2.2, 1.4], fontSize: 14, border: { type: "solid", color: "DDE3E8", pt: 0.75 }, rowH: 0.42, margin: [0.03, 0.12, 0.03, 0.12] };
  const hdr = (a, b) => [{ text: a, options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent1 } } }, { text: b, options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent1 }, align: "right" } }];
  const rows = (arr) => arr.map(([w, c]) => [{ text: w }, { text: c, options: { align: "right" } }]);
  s.addTable([hdr("All words", "count"), ...rows([["the", "422,467"], ["i", "288,268"], ["and", "211,011"], ["to", "167,188"], ["of", "165,138"], ["a", "154,235"], ["was", "141,462"], ["he", "122,460"]])], Object.assign({}, opts));
  s.addTable([hdr("Without stopwords", "count"), ...rows([["prisoner", "49,762"], ["mr", "36,415"], ["went", "29,152"], ["q", "26,042"], ["house", "24,685"], ["saw", "24,241"], ["came", "23,233"], ["th", "21,654"]])], Object.assign({}, opts, { x: 4.5 }));
  card(s, 8.6, 1.45, 4.13, 1.8, "Stopwords", "very common words (the, and, of…), often removed");
  card(s, 8.6, 3.5, 4.13, 1.8, "q and th?", "“Question” in the transcripts, and what is left of “29th”", { headColor: C.accent2 });
}
{
  const s = content("N-grams: words in sequence", "N-grams are often more revealing than single words because single words can have several meanings: 'watch' the timepiece versus 'the watch' and 'watch house', the night watch. Bigram counts from a random 1,000 trials containing 'watch' in the lab sample. Hold on to n-grams: in Part 5 we use them to predict the next word.");
  const words = ["stole", "a", "silver", "watch", "value"];
  words.forEach((w, i) => chip(s, M + i * 1.15, 1.5, 1.05, 0.5, w, C.accent1, C.background1, 14));
  ["stole a", "a silver", "silver watch", "watch value"].forEach((b, i) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: M + i * 1.15 + 0.05, y: 2.15 + i * 0.5, w: 2.2, h: 0.42, rectRadius: 0.06, fill: { color: C.background2 }, line: { color: HEX.accent1, width: 1 }, objectName: "bigram " + b });
    txt(s, b, { x: M + i * 1.15 + 0.05, y: 2.15 + i * 0.5, w: 2.2, h: 0.42, align: "center", valign: "middle", fontSize: 14, color: C.text2 });
  });
  txt(s, "A window slides along the text: every pair of neighbours is a bigram (2-gram), every three a trigram.", { x: M, y: 4.35, w: 5.6, h: 0.9, fontSize: 15 });
  txt(s, "‘liberal party’ vs ‘liberal views’ · ‘apple pie’ vs ‘apple computer’", { x: M, y: 5.3, w: 5.6, h: 0.5, fontSize: 14, italic: true, color: MUTED });
  s.addChart(pres.charts.BAR, [{ name: "Occurrences", labels: ["silver watch", "watch i", "watch value", "a watch", "watch and", "my watch", "watch house", "the watch"], values: [258, 265, 275, 486, 521, 558, 647, 1661] }],
    chartOpts({ x: 6.6, y: 1.3, w: 6.2, h: 5.0, barDir: "bar", chartColors: [HEX.accent1], showLegend: false, showTitle: true, title: "Commonest bigrams with ‘watch’ (Old Bailey)", titleFontSize: 14, titleColor: "333333", showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 11, dataLabelColor: "333333", valAxisHidden: true, valGridLine: { style: "none" }, catAxisLabelFontSize: 12, barGapWidthPct: 35 }));
}
{
  const s = content("Keyword in context: what is the word counting?", "A concordance (keyword in context, KWIC) is the oldest digital humanities tool: Busa's Index Thomisticus was a concordance. Read the lines: 'Cross examination' is mostly a heading inserted by the reporter or printer, and later a formula ('Cross-examined by MR. LEE'). So the chart counts how the Proceedings recorded cross-examination as much as how often it happened. Two checks. (1) William Garrow, the most famous cross-examiner of the century, appears in 58 trials in the sample (1780s–90s); only 4 of them contain the word: his questions are printed with no heading. That is why the line dips in the 1780s, his busiest decade. (2) The dip in the 1810s comes when the Proceedings were cut down (median trial length falls from 452 to 267 words; Part 2). Historians of the trial (Langbein, Beattie) make the same point about the Proceedings: they under-report what lawyers did. The trend is real; its exact shape belongs to the source.");
  const rows = [
    ["1749", "my first acquaintance with him was at the Bank.", "Cross examin’d", ". Q. Have not you within this four or five months made"],
    ["1756", "The girls said, you are the man.", "Cross examination", ". Q. What do you imagine the girl’s intention was"],
    ["1762", "Grant. I can’t tell as to his character?", "Cross Examination", ". Q. What do you mean by saying you can’t tell"],
    ["1782", "and the man never moved afterwards. On his", "Cross-Examination", ", deposed he had known the men before"],
    ["1833", "she had my keys to get whatever was wanted.", "Cross-examined", "by MR. LEE. Q. Did you miss them while she was"],
    ["1871", "only pushed her on one side, to get her off Mr. Chapman.", "Cross-examined", "by MR. MOODY. I live close by the Chapmans"],
  ];
  const tr = rows.map(([y, l, k, r]) => [
    { text: y, options: { color: MUTED, fontSize: 12 } },
    { text: "…" + l, options: { align: "right", fontSize: 13 } },
    { text: k, options: { bold: true, color: HEX.accent2, align: "center", fontSize: 13 } },
    { text: r + "…", options: { fontSize: 13 } },
  ]);
  s.addTable(tr, { x: M, y: 1.4, w: CW, colW: [0.65, 4.55, 1.85, 5.08], rowH: 0.47, valign: "middle", border: { type: "solid", color: "DDE3E8", pt: 0.75 }, fill: { color: HEX.lt1 }, margin: [0.03, 0.08, 0.03, 0.08] });
  box(s, M, 4.45, 5.95, 1.75, C.background2, "garrow");
  txt(s, "4 of 58", { x: M + 0.25, y: 4.6, w: 2.0, h: 0.75, fontSize: 36, bold: true, color: C.accent2, fontFace: THEME.headFontFace });
  txt(s, "trials with Mr. Garrow in them contain the word. His questions are printed with no heading, so the count misses the century’s most famous cross-examiner.", { x: M + 2.3, y: 4.6, w: 3.45, h: 1.5, fontSize: 13.5 });
  box(s, 6.78, 4.45, 5.95, 1.75, C.background2, "1810s");
  txt(s, "1810s dip", { x: 7.03, y: 4.6, w: 2.0, h: 0.75, fontSize: 30, bold: true, color: C.accent2, fontFace: THEME.headFontFace });
  txt(s, "The Proceedings were cut down: median trial length falls from 452 to 267 words. Less text, fewer headings.", { x: 9.08, y: 4.6, w: 3.45, h: 1.5, fontSize: 13.5 });
  txt(s, "The word is partly a printer’s heading: the count measures the record as well as the trial.", { x: M, y: 6.3, w: CW, h: 0.4, fontSize: 16, bold: true, color: C.text2 });
}
// NEW frequency in practice: Chagall
{
  const s = content("Frequency in practice: censorship as an absence", "Michel et al., 'Quantitative analysis of culture using millions of digitized books', Science 331 (2011), the paper that launched the Google Books Ngram Viewer. One of their examples: the Jewish painter Marc Chagall, labelled 'degenerate' by the Nazi regime. In German-language books his name rises through the 1920s, falls through the 1930s to almost nothing in 1940–42, and recovers after 1945. In English-language books it keeps rising. The comparison is what makes it meaningful: the English line is the control. Note that German mentions already fall from the late 1920s; and 'books' here means books Google scanned from a handful of libraries. Data re-downloaded from the Ngram Viewer (2019 corpora, 1-year smoothing).");
  const yrs = []; for (let y = 1910; y <= 1955; y++) yrs.push(String(y));
  s.addChart(pres.charts.LINE, [
    { name: "German books", labels: yrs, values: ch_de.map((v) => +(v * 1e9).toFixed(2)) },
    { name: "English books", labels: yrs, values: ch_en.map((v) => +(v * 1e9).toFixed(2)) },
  ], chartOpts({ x: M - 0.1, y: 1.3, w: 7.9, h: 5.0, chartColors: [HEX.accent2, HEX.accent6], lineSize: 2.5, lineDataSymbol: "none", showLegend: true, legendPos: "t", valAxisMinVal: 0, showValAxisTitle: true, valAxisTitle: "‘Marc Chagall’ per billion words", valAxisTitleFontSize: 11, valAxisTitleColor: MUTED, catAxisLabelFrequency: 5, catAxisLabelFontSize: 11 }));
  const rows = [["Question", "Can we see Nazi censorship in what was printed?"], ["Method", "Frequency of an artist’s name in German vs English books, per year"], ["Finding", "German mentions fall to almost nothing in 1933–45 and recover after the war; English ones do not fall"], ["Lesson", "Absence can be evidence, if you have something to compare it with"]];
  rows.forEach(([h, b], i) => {
    txt(s, h, { x: 8.3, y: 1.45 + i * 1.2, w: 4.43, h: 0.35, fontSize: 15, bold: true, color: i === 3 ? C.accent2 : C.accent1, fontFace: THEME.headFontFace });
    txt(s, b, { x: 8.3, y: 1.8 + i * 1.2, w: 4.43, h: 0.8, fontSize: 14 });
  });
  caption(s, "Michel et al., ‘Quantitative analysis of culture using millions of digitized books’, Science 331 (2011). Data: Google Books Ngram Viewer.", 6.55);
}
{
  const s = content("Exercise 1: search Delpher", "https://www.delpher.nl/nl/kranten. About 10 minutes.");
  ["Go to delpher.nl/nl/kranten", "Search for a word or an n-gram", "Look for trends over time", "Find articles that exemplify them", "Compare raw counts with proportions", "Add your term to Wooclap"].forEach((t, i) => {
    const x = M + (i % 3) * 4.1, y = 1.7 + Math.floor(i / 3) * 2.1;
    box(s, x, y, 3.9, 1.8, C.background2, "step " + (i + 1));
    numBadge(s, x + 0.25, y + 0.25, i + 1, i === 5 ? C.accent2 : C.accent1);
    txt(s, t, { x: x + 0.25, y: y + 0.9, w: 3.4, h: 0.8, fontSize: 17 });
  });
}

// =====================================================================
sec("4 Association");
divider("Part 4", "In what company? Association", "Collocations, and what makes a group of texts distinctive", "Method 2: association.");
{
  const s = content("Collocation: the company a word keeps", "How often does word X occur together with word Y, or with context Z? The strongest collocates of gin in the lab sample: quartern (a quarter pint), glass, drank, pint, beer. Window of 5 words either side.");
  txt(s, "Old Bailey, 1776 (t17760911-88)", { x: M, y: 1.4, w: 6, h: 0.3, fontSize: 11, italic: true, color: MUTED });
  const toks = ["i", "gave", "clarke", "sixpence", "to", "fetch", "a", "quartern", "of", "gin"];
  let x = M;
  toks.forEach((t, i) => {
    const w = 0.3 + t.length * 0.1;
    const inWin = i >= 4 && i <= 8;
    chip(s, x, 1.8, w, 0.5, t, t === "gin" ? C.accent2 : inWin ? C.accent1 : C.accent6, C.background1, 13);
    x += w + 0.08;
  });
  txt(s, "window: up to 5 words either side", { x: 3.6, y: 2.4, w: 4.0, h: 0.3, fontSize: 12, color: C.accent1, align: "center" });
  txt(s, "Count every word that falls inside the window around gin, across the whole corpus. Then ask which of them turn up far more often than chance.", { x: M, y: 3.1, w: 7.2, h: 1.2, fontSize: 17 });
  const data = [["quartern", "57"], ["glass", "70"], ["drank", "21"], ["drop", "18"], ["bottle", "17"], ["pint", "21"], ["water", "24"]];
  s.addTable([[{ text: "near gin", options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent1 } } }, { text: "times", options: { bold: true, color: HEX.lt1, fill: { color: HEX.accent1 }, align: "right" } }], ...data.map(([a, b]) => [{ text: a }, { text: b, options: { align: "right" } }])],
    { x: 8.6, y: 1.45, w: 4.13, colW: [2.6, 1.53], fontSize: 14, rowH: 0.42, border: { type: "solid", color: "DDE3E8", pt: 0.75 }, margin: [0.03, 0.12, 0.03, 0.12] });
}
{
  const s = content("Observed vs expected: the MI score", "Mutual information: 1 means twice as often as chance, 3 eight times. It rewards rare words, which is why we require a minimum count.");
  box(s, M, 1.4, CW, 1.0, C.background2, "formula");
  txt(s, [{ text: "MI = log₂( observed ÷ expected )", options: { fontSize: 22, bold: true, fontFace: THEME.headFontFace, breakLine: true } }, { text: "expected = how often the two words would meet by chance, given how common each is", options: { fontSize: 13, color: MUTED } }], { x: M + 0.3, y: 1.45, w: CW - 0.6, h: 0.9, valign: "middle" });
  [["quartern", "57", "0.1", "MI 9.3", "≈ 622× chance"], ["glass", "70", "1", "MI 6.1", "≈ 67× chance"], ["beer", "27", "0.9", "MI 5.0", "≈ 32× chance"]].forEach(([w, o, e, mi, x2], i) => {
    const y = 2.85 + i * 1.05;
    txt(s, w, { x: M, y, w: 2.2, h: 0.6, fontSize: 22, bold: true, fontFace: THEME.headFontFace, color: C.accent1, valign: "middle" });
    txt(s, [{ text: o, options: { fontSize: 24, bold: true } }, { text: "  seen", options: { fontSize: 12, color: MUTED } }], { x: 2.9, y, w: 1.9, h: 0.6, valign: "middle" });
    txt(s, [{ text: e, options: { fontSize: 24, color: MUTED } }, { text: "  expected", options: { fontSize: 12, color: MUTED } }], { x: 4.9, y, w: 2.1, h: 0.6, valign: "middle" });
    arrowRight(s, 7.2, y + 0.15, 0.45, 0.32);
    txt(s, [{ text: mi, options: { fontSize: 24, bold: true, color: C.accent2 } }, { text: "  " + x2, options: { fontSize: 13 } }], { x: 7.85, y, w: 4.5, h: 0.6, valign: "middle" });
  });
  caption(s, "Collocates of ‘gin’, Old Bailey sample. MI favours rare words, so set a minimum number of meetings.", 6.1);
}
// NEW association in practice: Regan liberty
{
  const s = content("Association in practice: liberty from, or liberty to?", "Isaiah Berlin, 'Two Concepts of Liberty' (1958): negative liberty is freedom from interference by others; positive liberty is freedom to act, to govern oneself. Quentin Skinner and others argue about which idea dominated early modern English political thought. John Regan (Concept Lab, Cambridge) turns this into a question about collocation: which preposition follows the word? Counts from his book, built on ECCO. Raw counts: liberty from 234 / 1,272 / 2,791 / 5,934; liberty to 3,143 / 19,913 / 68,788 / 154,122; freedom from 1,285 / 431 / 5,890 / 15,667; freedom to 511 / 189 / 5,639 / 12,597, for 1600–40, 1660–1700, 1700–40, 1760–1800. The chart shows 'from' as a share of from + to. The striking result: the two words behave differently. Freedom mostly comes from something; liberty mostly goes to something. Historians often treat them as one concept. But before concluding that liberty meant positive liberty: next slide.");
  card(s, M, 1.45, 4.2, 1.85, "Negative liberty", "freedom from interference: ‘freedom from slavery’", { headColor: C.accent1 });
  card(s, M, 3.5, 4.2, 1.85, "Positive liberty", "freedom to act, to govern oneself: ‘liberty to worship’", { headColor: C.accent2 });
  txt(s, "Isaiah Berlin, ‘Two Concepts of Liberty’ (1958). Which did early modern writers mean?", { x: M, y: 5.5, w: 4.2, h: 0.8, fontSize: 13, italic: true, color: MUTED });
  const per = ["1600–40", "1660–1700", "1700–40", "1760–1800"];
  const lib = [[234, 3143], [1272, 19913], [2791, 68788], [5934, 154122]].map(([f, t]) => +(100 * f / (f + t)).toFixed(1));
  const fre = [[1285, 511], [431, 189], [5890, 5639], [15667, 12597]].map(([f, t]) => +(100 * f / (f + t)).toFixed(1));
  s.addChart(pres.charts.BAR, [{ name: "freedom", labels: per, values: fre }, { name: "liberty", labels: per, values: lib }],
    chartOpts({ x: 5.1, y: 1.3, w: 7.7, h: 4.6, barDir: "col", chartColors: [HEX.accent1, HEX.accent2], showLegend: true, legendPos: "t", showValue: true, dataLabelPosition: "outEnd", dataLabelFontSize: 12, dataLabelColor: "333333", dataLabelFormatCode: "0\"%\"", valAxisMinVal: 0, valAxisMaxVal: 100, valAxisMajorUnit: 25, valAxisLabelFormatCode: "0\"%\"", showValAxisTitle: true, valAxisTitle: "‘from’ as % of ‘from’ + ‘to’", valAxisTitleFontSize: 11, valAxisTitleColor: MUTED, barGapWidthPct: 60 }));
  txt(s, "Freedom mostly comes from something; liberty mostly goes to something.", { x: 5.25, y: 5.95, w: 7.5, h: 0.45, fontSize: 16, bold: true, color: C.text2 });
  caption(s, "Phrase counts from John Regan, Semantic Change and Collective Knowledge in 18th-Century Britain (Bloomsbury, 2023), ECCO.", 6.55);
}
{
  const s = content("Go back to the text: what does ‘liberty to’ mean?", "The same check, in the Old Bailey: almost every 'liberty to' is permission (to go into the yard, to wear it, to depart, to go on shore), not political liberty. Even the only two 'liberty from' lines in the sample are permission: 'liberty from the master', 'liberty from the captain'. So a high 'to' share does not show that people favoured positive liberty: a lot of it is the everyday sense of being allowed. Regan makes the same kind of check. Collocation counts tell you where to read; they do not do the reading. 50 lines of 'liberty to' in the sample; 6 shown.");
  const rows = [
    ["1717", "the Prisoner came to the House desiring", "liberty to", "go into the Yard"],
    ["1766", "Q. Did you never give her", "liberty to", "wear it? No, never in my life"],
    ["1788", "Court to Cole. Was you at", "liberty to", "depart during that time?"],
    ["1796", "Till the 26th of November; when he had", "liberty to", "go on shore for a few hours"],
    ["1817", "at that price only; they are not at", "liberty to", "take a less price"],
    ["1807", "and after that he had", "liberty from", "the master to sleep in the yard"],
  ];
  s.addTable(rows.map(([y, l, k, r]) => [
    { text: y, options: { color: MUTED, fontSize: 13 } },
    { text: "…" + l, options: { align: "right", fontSize: 14 } },
    { text: k, options: { bold: true, color: HEX.accent2, align: "center", fontSize: 14 } },
    { text: r + "…", options: { fontSize: 14 } },
  ]), { x: M, y: 1.45, w: CW, colW: [0.75, 5.0, 1.5, 4.88], rowH: 0.55, valign: "middle", border: { type: "solid", color: "DDE3E8", pt: 0.75 }, margin: [0.03, 0.08, 0.03, 0.08] });
  box(s, M, 5.0, CW, 1.1, C.background2, "takeaway");
  txt(s, [{ text: "Mostly permission, not political liberty. ", options: { bold: true, color: C.accent2 } }, { text: "A preposition count is a pointer to where to read, not a measure of an idea." }], { x: M + 0.3, y: 5.0, w: CW - 0.6, h: 1.1, fontSize: 18, valign: "middle" });
  caption(s, "Concordance lines for ‘liberty to’ and ‘liberty from’, Old Bailey sample.", 6.3);
}
{
  const s = content("TF-IDF: what makes one document distinctive?", "Frequencies don't always tell us something useful: 'the' is almost always the most frequent word. TF-IDF multiplies term frequency by inverse document frequency, so words found in every document score zero. A 'document' can be whatever you want: all the speeches from a year, every trial for one offence. 'Royal offences' in the Old Bailey are mostly coining offences.");
  chip(s, M, 1.45, 1.9, 0.85, "TF", C.accent1, C.background1, 24, true);
  txt(s, "×", { x: M + 1.95, y: 1.45, w: 0.5, h: 0.85, fontSize: 26, color: MUTED, align: "center", valign: "middle" });
  chip(s, M + 2.5, 1.45, 1.9, 0.85, "IDF", C.accent1, C.background1, 24, true);
  txt(s, "=", { x: M + 4.45, y: 1.45, w: 0.5, h: 0.85, fontSize: 26, color: MUTED, align: "center", valign: "middle" });
  chip(s, M + 5.0, 1.45, 2.2, 0.85, "distinctive", C.accent2, C.background1, 22, true);
  txt(s, "frequent in this document", { x: M, y: 2.4, w: 2.2, h: 0.4, fontSize: 12, color: MUTED });
  txt(s, "rare in the other documents", { x: M + 2.5, y: 2.4, w: 2.4, h: 0.4, fontSize: 12, color: MUTED });
  txt(s, "Old Bailey, each offence as one ‘document’:", { x: M, y: 3.15, w: CW, h: 0.4, fontSize: 16, bold: true, color: C.text2 });
  [["Killing", "deceased, manslaughter, deceas, coroner"], ["Deception", "forging, forged, cheques, bonds"], ["Coining", "counterfeit, florin, coin, coins"], ["Breaking the peace", "grievous, revolver, stabbed, wound"]].forEach(([h, b], i) =>
    card(s, M + i * 3.07, 3.7, 2.85, 2.0, h, b));
}
{
  const s = content("Distinctive words: trials of women and of men", "Defendant's gender as tagged by Old Bailey Online: 3,006 trials of women, 8,919 of men. Women: clothing (stays, petticoats, quilted), 'spinster' as a legal description, pregnancy and the midwife (infanticide trials). Men: driving, horses, fraud, 'carnally' from rape trials. 'More common in trials of women' does not mean 'women said this'. Content note: real trials, including sexual violence and infanticide.");
  const lab = ["driving", "carnally", "fraudulently", "uniform", "bay", "bridle", "publicly", "overcoat", "midwife", "herself", "petticoats", "stays", "spinster", "quilted", "judith", "pregnancy"];
  const men = [-5.5, -4.82, -4.7, -4.68, -4.43, -4.39, -4.29, -4.26, 0, 0, 0, 0, 0, 0, 0, 0];
  const wom = [0, 0, 0, 0, 0, 0, 0, 0, 2.85, 2.86, 2.87, 2.9, 3.13, 3.48, 3.57, 4.11];
  s.addChart(pres.charts.BAR, [{ name: "More common in trials of men", labels: lab, values: men }, { name: "More common in trials of women", labels: lab, values: wom }],
    chartOpts({ x: M, y: 1.25, w: 8.6, h: 5.15, barDir: "bar", barGrouping: "stacked", chartColors: [HEX.accent1, HEX.accent2], showLegend: true, legendPos: "t", catAxisLabelFontSize: 12, catAxisLabelPos: "low", barGapWidthPct: 30, valAxisMinVal: -6, valAxisMaxVal: 5 }));
  box(s, 9.5, 1.6, 3.23, 3.6, C.background2, "explanation");
  txt(s, "Clothing, legal status and pregnancy for women; horses, driving and fraud for men. Distinctive of the trials, not of how women or men spoke.", { x: 9.7, y: 1.8, w: 2.83, h: 3.2, fontSize: 15 });
  caption(s, "log₂ ratio of the share of trials mentioning each word, trials of women vs trials of men (Old Bailey sample).", 6.55);
}
// NEW distinctiveness in practice: Klingenstein et al.
{
  const s = content("Distinctiveness in practice: violence in the Old Bailey", "Klingenstein, Hitchcock and DeDeo, 'The civilizing process in London's Old Bailey', PNAS 111 (2014): 9419–24. Same corpus as ours. They group the words of the trial testimony into synonym sets and measure, year by year, how different the language of trials for violent offences is from that of non-violent ones (Jensen-Shannon divergence: a distinctiveness score for two whole vocabularies). Blue: violent vs non-violent. Red: what you get from arbitrary groupings of offences (the null). Around 1780 the two kinds of trial sound alike; by 1900 they are sharply distinct. The authors read this as a slow change in attitudes to violence (Norbert Elias's 'civilizing process'), visible in how the court talked, not in any one law. Vertical lines: two administrative changes in the court. Discussion: is it violence that changed, or the court's paperwork?");
  const r = fit(s, EXT + "pnas/fig1_top.jpg", M, 1.35, 6.4, 4.95, "Jensen-Shannon divergence between violent and non-violent trials, 1760–1913 (Klingenstein et al. 2014, Fig. 1)", "left");
  const rows = [["Question", "Did the court come to treat violence as a distinct kind of crime?"], ["Method", "How different is the vocabulary of violent trials from that of non-violent ones, year by year?"], ["Finding", "Hard to tell apart around 1780; increasingly distinct through the 19th century (blue). Arbitrary groupings stay flat (red)"], ["Reading", "A slow ‘civilizing process’, visible in testimony rather than in law"]];
  rows.forEach(([h, b], i) => {
    txt(s, h, { x: 7.35, y: 1.4 + i * 1.22, w: 5.38, h: 0.35, fontSize: 15, bold: true, color: i === 3 ? C.accent2 : C.accent1, fontFace: THEME.headFontFace });
    txt(s, b, { x: 7.35, y: 1.75 + i * 1.22, w: 5.38, h: 0.85, fontSize: 14 });
  });
  caption(s, "S. Klingenstein, T. Hitchcock and S. DeDeo, ‘The civilizing process in London’s Old Bailey’, PNAS 111 (2014), Fig. 1 (category level).", 6.55);
}

// =====================================================================
sec("5 Embeddings");
divider("Part 5", "What does it mean? Embeddings", "From counting neighbours to word vectors", "Method 3: semantics. One running example for the whole section: gin, beer, pot, watch, handkerchief. Every number comes from the Old Bailey sample or the lab's models.");
{
  const s = content("You shall know a word by the company it keeps", "J. R. Firth, 1957. Use reflects meaning: words that appear in the same contexts tend to have similar meanings (Wittgenstein: the meaning of a word is its use). Look at the lines: gin and beer are fetched, stood, and drunk by the glass, the drop, the pot and the pint. Nobody tells the computer that gin and beer are drinks. It can work it out from the company they keep. This is the idea behind everything in this section.");
  txt(s, "“", { x: M, y: 1.2, w: 0.8, h: 1.0, fontSize: 72, color: C.accent3, fontFace: THEME.headFontFace });
  txt(s, "Use reflects meaning: words that appear in the same contexts tend to have similar meanings.", { x: M + 0.8, y: 1.45, w: 11.3, h: 0.6, fontSize: 19, fontFace: THEME.headFontFace, italic: true, color: C.text2 });
  txt(s, "J. R. Firth, 1957", { x: M + 0.8, y: 2.05, w: 6, h: 0.35, fontSize: 13, color: MUTED });
  const gin = [["1776", "Clarke sixpence to fetch a quartern of", "gin"], ["1808", "me to give her a glass of", "gin"], ["1852", "out of him but a glass of", "gin"], ["1858", "asked me to stand a drop of", "gin"]];
  const beer = [["1784", "in and called for a pint of", "beer"], ["1839", "a sovereign to fetch a pot of", "beer"], ["1757", "you had better come and have some", "beer"], ["1864", "quiet I would get a drop of", "beer"]];
  const mk = (arr) => arr.map(([y, l, k]) => [{ text: y, options: { color: MUTED, fontSize: 12 } }, { text: "…" + l, options: { align: "right", fontSize: 14 } }, { text: k, options: { bold: true, color: HEX.accent2, fontSize: 14 } }]);
  const tOpts = (x) => ({ x, y: 2.75, w: 5.95, colW: [0.65, 4.4, 0.9], rowH: 0.5, valign: "middle", border: { type: "solid", color: "DDE3E8", pt: 0.75 }, margin: [0.03, 0.08, 0.03, 0.08] });
  s.addTable(mk(gin), tOpts(M));
  s.addTable(mk(beer), tOpts(6.78));
  box(s, M, 5.15, CW, 0.95, C.background2, "takeaway");
  txt(s, "Gin and beer share their company: fetch, stand, a glass, a drop, a pot, a pint. No one told the computer they are both drinks.", { x: M + 0.3, y: 5.15, w: CW - 0.6, h: 0.95, fontSize: 16, bold: true, color: C.text2, valign: "middle" });
  caption(s, "Random concordance lines for ‘gin’ and ‘beer’, Old Bailey sample.", 6.3);
}
// NEW n-gram bridge
{
  const s = content("Predicting the next word: an n-gram model", "An n-gram language model: count every trigram, then predict the next word from the two before it. 'A quartern of' (a quarter pint, a spirits measure) is followed by gin 44% of the time, then brandy and rum. 'A pint of' is followed by beer, ale, porter, wine and purl (hot beer with gin or wormwood). Two lessons. (1) Words that fill the same slot are similar: the model has sorted spirits from beers without being told. That is Firth's idea, done with counting. (2) Predicting the next word is exactly what ChatGPT is trained to do, with a neural network instead of a table and thousands of words of context instead of two. Word2vec, coming up, is also trained by prediction.");
  const q = [["gin", 44], ["brandy", 15], ["rum", 15], ["liquor", 3], ["whisky", 3]];
  const p = [["beer", 49], ["ale", 9], ["porter", 7], ["wine", 6], ["purl", 5]];
  const mkChart = (x, title, d, col) => {
    txt(s, title, { x, y: 1.4, w: 4.0, h: 0.45, fontSize: 20, bold: true, fontFace: THEME.headFontFace, color: C.text2 });
    s.addChart(pres.charts.BAR, [{ name: "next word", labels: d.map((r) => r[0]).reverse(), values: d.map((r) => r[1]).reverse() }],
      chartOpts({ x: x - 0.1, y: 1.9, w: 4.1, h: 3.3, barDir: "bar", chartColors: [col], showLegend: false, showValue: true, dataLabelPosition: "outEnd", dataLabelFormatCode: "0\"%\"", dataLabelFontSize: 12, dataLabelColor: "333333", valAxisHidden: true, valGridLine: { style: "none" }, valAxisMaxVal: 60, catAxisLabelFontSize: 14, barGapWidthPct: 35 }));
  };
  mkChart(M, "a quartern of ___", q, HEX.accent2);
  mkChart(4.9, "a pint of ___", p, HEX.accent1);
  txt(s, "Share of next words after each phrase (Old Bailey sample: 111 and 583 occurrences)", { x: M, y: 5.3, w: 8.2, h: 0.35, fontSize: 11, italic: true, color: MUTED });
  card(s, 9.2, 1.45, 3.53, 2.25, "Same slot, similar words", "Spirits fill one slot, beers the other. Counting has sorted them.", { bodySize: 14 });
  card(s, 9.2, 3.9, 3.53, 2.25, "Same task as ChatGPT", "Predict the next word. ChatGPT uses a neural network and thousands of words of context, not two.", { bodySize: 14, headColor: C.accent2 });
}
// NEW co-occurrence matrix with real counts
{
  const s = content("Count the company: a co-occurrence matrix", "Real counts from the lab sample: how often each word (rows) appears within 5 words of each context word (columns). Each row is that word's company profile, a list of four numbers: that list is a vector. Gin and beer have big numbers under drank and pint, and almost nothing under pocket and stole. Watch and handkerchief are the opposite: things in pockets that get stolen. Pot is the interesting one: a pewter pot is something you drink from, and also something constantly stolen from alehouses, so it has company on both sides. Beer's numbers are much bigger than gin's simply because beer is mentioned more often; we deal with that on the next slide.");
  const cols = ["drank", "pint", "pocket", "stole"];
  const M5 = [["gin", 21, 21, 1, 0], ["beer", 88, 307, 1, 1], ["pot", 28, 67, 19, 4], ["watch", 1, 1, 185, 36], ["handkerchief", 0, 0, 251, 4]];
  const shade = (v) => v >= 150 ? HEX.accent1 : v >= 15 ? "A9CCD8" : HEX.lt1;
  const head = [{ text: "", options: { fill: { color: HEX.lt1 } } }, ...cols.map((c) => ({ text: c, options: { bold: true, align: "center", color: HEX.dk2, fill: { color: HEX.lt2 } } }))];
  const body = M5.map(([w, ...v]) => [{ text: w, options: { bold: true, color: w === "pot" ? HEX.accent2 : HEX.dk2, fontFace: "Cambria" } }, ...v.map((n) => ({ text: String(n), options: { align: "center", fill: { color: shade(n) }, color: n >= 150 ? HEX.lt1 : HEX.dk1, bold: n >= 15 } }))]);
  s.addTable([head, ...body], { x: M, y: 1.5, w: 7.4, colW: [2.2, 1.3, 1.3, 1.3, 1.3], rowH: 0.66, fontSize: 17, valign: "middle", border: { type: "solid", color: "FFFFFF", pt: 2 }, margin: [0.03, 0.12, 0.03, 0.12] });
  txt(s, "co-occurrences within 5 words, Old Bailey sample", { x: M, y: 5.55, w: 7.4, h: 0.3, fontSize: 11, italic: true, color: MUTED });
  card(s, 8.4, 1.5, 4.33, 1.75, "Rows are vectors", "gin = [21, 21, 1, 0]\nwatch = [1, 1, 185, 36]", { bodySize: 15 });
  card(s, 8.4, 3.45, 4.33, 1.25, "Drink vs theft", "Gin and beer: drank, pint. Watch and handkerchief: pocket, stole.", { bodySize: 13 });
  card(s, 8.4, 4.9, 4.33, 1.25, "pot is in between", "Drunk from, and stolen from alehouses.", { bodySize: 13, headColor: C.accent2 });
}
// NEW arrows: rows as directions
{
  const s = content("Similarity is an angle", "Plot two of the columns: drank along the bottom, pocket up the side. Each word is an arrow from the origin to its pair of counts. Beer's arrow is four times longer than gin's, because beer is mentioned four times as often; but it points the same way. Similarity should not depend on how common a word is, so we measure the angle, not the distance: cosine similarity, 1 for the same direction, 0 for a right angle. Computed on all four columns of the matrix: gin–beer 0.87, gin–pot 0.90, pot–watch 0.26, gin–watch 0.04, watch–handkerchief 0.98.");
  const ox = 1.35, oy = 6.05, L = 4.4, MAX = 260; // inches per axis, data max
  const sc = L / MAX;
  s.addShape(pres.shapes.LINE, { x: ox, y: oy, w: L + 0.2, h: 0, line: { color: HEX.accent6, width: 1.25, endArrowType: "triangle" }, objectName: "x axis" });
  s.addShape(pres.shapes.LINE, { x: ox, y: oy - L - 0.2, w: 0, h: L + 0.2, line: { color: HEX.accent6, width: 1.25, beginArrowType: "triangle" }, objectName: "y axis" });
  txt(s, "drank →", { x: ox + L - 1.3, y: oy + 0.08, w: 1.5, h: 0.3, fontSize: 13, color: MUTED, align: "right" });
  txt(s, "pocket ↑", { x: ox - 0.75, y: oy - L - 0.55, w: 1.5, h: 0.3, fontSize: 13, color: MUTED });
  [100, 200].forEach((v) => {
    txt(s, String(v), { x: ox + v * sc - 0.3, y: oy + 0.36, w: 0.6, h: 0.25, fontSize: 10, color: MUTED, align: "center" });
    txt(s, String(v), { x: ox - 0.55, y: oy - v * sc - 0.12, w: 0.45, h: 0.25, fontSize: 10, color: MUTED, align: "right" });
  });
  const pts = [["beer", 88, 1, HEX.accent3, [0.08, -0.36]], ["gin", 21, 1, HEX.accent2, [0.02, 0.33]], ["pot", 28, 19, HEX.accent5, [0.06, -0.38]], ["watch", 1, 185, HEX.accent1, [0.1, -0.12]], ["handkerchief", 0, 251, HEX.accent1, [0.12, -0.05]]];
  pts.forEach(([w, x, y, col, off]) => {
    const dx = x * sc, dy = y * sc;
    s.addShape(pres.shapes.LINE, { x: ox, y: oy - dy, w: dx, h: dy, flipV: true, line: { color: col, width: w === "beer" ? 5 : 3, endArrowType: "triangle" }, objectName: "arrow " + w });
    txt(s, w, { x: ox + dx + off[0], y: oy - dy + off[1], w: 1.8, h: 0.3, fontSize: 14, bold: true, color: col });
  });
  // right panel: cosine values
  txt(s, "Cosine similarity (all four columns)", { x: 7.0, y: 1.45, w: 5.73, h: 0.4, fontSize: 16, bold: true, color: C.text2, fontFace: THEME.headFontFace });
  const cs = [["gin", "beer", "0.87"], ["gin", "pot", "0.90"], ["pot", "watch", "0.26"], ["gin", "watch", "0.04"], ["watch", "handkerchief", "0.98"]];
  cs.forEach(([a, b, v], i) => {
    const y = 2.0 + i * 0.62;
    txt(s, a + " – " + b, { x: 7.0, y, w: 3.4, h: 0.45, fontSize: 16, valign: "middle" });
    const val = parseFloat(v);
    s.addShape(pres.shapes.RECTANGLE, { x: 10.0, y: y + 0.1, w: 2.0 * val + 0.02, h: 0.25, fill: { color: val > 0.5 ? HEX.accent1 : HEX.accent6 }, line: { type: "none" }, objectName: "bar " + a + b });
    txt(s, v, { x: 12.1, y, w: 0.65, h: 0.45, fontSize: 16, bold: true, valign: "middle" });
  });
  box(s, 7.0, 5.25, 5.73, 1.0, C.background2, "takeaway");
  txt(s, "Gin and beer point the same way; beer’s arrow is just longer (more mentions). 1 = same direction · 0 = right angle.", { x: 7.2, y: 5.25, w: 5.33, h: 1.0, fontSize: 14, color: C.text2, valign: "middle" });
}
{
  const s = content("word2vec: learning the numbers by prediction", "Counting a full co-occurrence matrix is huge: 20,000 words × 20,000 columns, mostly zeros. word2vec learns a short list of numbers per word instead (100 in our models), by playing a prediction game, like the n-gram model. CBOW takes the surrounding context words and predicts the target; skip-gram takes the target and predicts the context. The guesses are only a training trick: what we keep are the numbers. Our Old Bailey models use skip-gram.");
  txt(s, "CBOW", { x: M, y: 1.4, w: 5, h: 0.4, fontSize: 19, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  txt(s, "context → guess the word in the middle", { x: M, y: 1.8, w: 5.5, h: 0.35, fontSize: 14 });
  txt(s, "Skip-gram", { x: 6.9, y: 1.4, w: 5, h: 0.4, fontSize: 19, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  txt(s, "word → guess its context", { x: 6.9, y: 1.8, w: 5.5, h: 0.35, fontSize: 14 });
  const ctx = ["stole", "a", "silver", "value", "from"];
  ctx.forEach((c, i) => {
    const y = 2.4 + i * 0.6;
    chip(s, M, y, 1.4, 0.42, c, C.accent6, C.background1, 13);
    s.addShape(pres.shapes.LINE, { x: M + 1.4, y: Math.min(y + 0.21, 3.81), w: 1.5, h: Math.abs(3.81 - (y + 0.21)), flipV: y + 0.21 > 3.81, line: { color: HEX.accent6, width: 1 }, objectName: "cbow line " + c });
    chip(s, 11.33, y, 1.4, 0.42, c + " ?", C.accent6, C.background1, 13);
    s.addShape(pres.shapes.LINE, { x: 9.33, y: Math.min(y + 0.21, 3.81), w: 2.0, h: Math.abs(3.81 - (y + 0.21)), flipV: y + 0.21 < 3.81, line: { color: HEX.accent6, width: 1, endArrowType: "triangle" }, objectName: "sg line " + c });
  });
  chip(s, M + 2.9, 3.6, 1.4, 0.42, "watch ?", C.accent2, C.background1, 13, true);
  chip(s, 7.93, 3.6, 1.4, 0.42, "watch", C.accent2, C.background1, 13, true);
  box(s, M, 5.6, CW, 0.75, C.background2, "takeaway");
  txt(s, "Instead of 4 hand-picked columns, 100 learned numbers per word. The guesses are a training trick; we keep the numbers.", { x: M + 0.3, y: 5.6, w: CW - 0.6, h: 0.75, fontSize: 15, bold: true, color: C.text2, valign: "middle" });
}
// NEW counted vs learned
{
  const s = content("Counted or learned: the same picture", "Left: cosine similarities from our four-column count matrix. Right: cosine similarities from the lab's word2vec model trained on the Proceedings 1674–1799 (100 learned numbers per word). The learned model is less extreme, because it has seen every context, not just four, but the pattern is the same: gin and beer together, watch and handkerchief together, pot in between. The model's nearest neighbours of gin: beer, rum, brandy, purl, shrub, quartern, aniseed, dram: an eighteenth-century drinks cabinet, learned from trial testimony alone.");
  const ws = ["gin", "beer", "pot", "watch", "handk."];
  const toy = [[1, 0.87, 0.9, 0.04, 0.03], [0.87, 1, 0.96, 0.01, 0.0], [0.9, 0.96, 1, 0.26, 0.25], [0.04, 0.01, 0.26, 1, 0.98], [0.03, 0.0, 0.25, 0.98, 1]];
  const mdl = [[1, 0.86, 0.62, 0.22, 0.15], [0.86, 1, 0.74, 0.28, 0.16], [0.62, 0.74, 1, 0.44, 0.43], [0.22, 0.28, 0.44, 1, 0.56], [0.15, 0.16, 0.43, 0.56, 1]];
  const shade = (v) => v >= 0.8 ? "1F6F8B" : v >= 0.6 ? "4F92AA" : v >= 0.4 ? "8DBACB" : v >= 0.2 ? "C9DFE7" : "F4F7F9";
  const grid = (data) => [[{ text: "" }, ...ws.map((w) => ({ text: w, options: { bold: true, align: "center", fontSize: 12, color: HEX.dk2 } }))],
    ...data.map((row, i) => [{ text: ws[i], options: { bold: true, fontSize: 12, color: HEX.dk2 } }, ...row.map((v) => ({ text: v.toFixed(2), options: { align: "center", fontSize: 13, fill: { color: shade(v) }, color: v >= 0.6 ? HEX.lt1 : HEX.dk1 } }))])];
  const tOpts = (x) => ({ x, y: 1.95, w: 5.6, colW: [1.1, 0.9, 0.9, 0.9, 0.9, 0.9], rowH: 0.55, valign: "middle", border: { type: "solid", color: "FFFFFF", pt: 2 }, margin: [0.02, 0.05, 0.02, 0.05] });
  txt(s, "Counted: 4 columns from the sample", { x: M, y: 1.4, w: 5.6, h: 0.4, fontSize: 17, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  s.addTable(grid(toy), tOpts(M));
  txt(s, "Learned: word2vec, 100 numbers, 1674–1799", { x: 7.1, y: 1.4, w: 5.6, h: 0.4, fontSize: 17, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  s.addTable(grid(mdl), tOpts(7.1));
  box(s, M, 5.45, CW, 0.85, C.background2, "takeaway");
  txt(s, [{ text: "Nearest to gin in the model: ", options: { bold: true, color: C.accent2 } }, { text: "beer, rum, brandy, purl, shrub, quartern, aniseed, dram." }], { x: M + 0.3, y: 5.45, w: CW - 0.6, h: 0.85, fontSize: 17, valign: "middle" });
  caption(s, "Cosine similarity. Left: co-occurrence counts (previous slides). Right: the lab’s skip-gram model, Old Bailey 1674–1799.", 6.45);
}
{
  const s = content("Analogies: arithmetic with words", "The classic example: vector(king) − vector(man) + vector(woman) is closest to vector(queen). Also try London − England + France. In the earlier model 'queen' is not the answer: fewer contexts, different usage (the King's peace). Analogies are fragile; the failures are informative.");
  txt(s, "king − man + woman ≈ ?", { x: M, y: 1.45, w: 6, h: 0.5, fontSize: 22, bold: true, fontFace: THEME.headFontFace, color: C.text2 });
  const P = { man: [1.2, 5.6], woman: [1.2, 2.6], king: [4.6, 5.6], queen: [4.6, 2.6] };
  s.addShape(pres.shapes.LINE, { x: P.man[0] + 0.6, y: P.woman[1] + 0.45, w: 0, h: P.man[1] - P.woman[1] - 0.45, line: { color: HEX.accent1, width: 2, beginArrowType: "triangle" }, objectName: "man to woman" });
  s.addShape(pres.shapes.LINE, { x: P.king[0] + 0.6, y: P.queen[1] + 0.45, w: 0, h: P.king[1] - P.queen[1] - 0.45, line: { color: HEX.accent2, width: 2, dashType: "dash", beginArrowType: "triangle" }, objectName: "king to queen" });
  Object.entries(P).forEach(([w, [x, y]]) => chip(s, x, y, 1.2, 0.45, w, w === "queen" ? C.accent2 : C.accent1, C.background1, 14, true));
  card(s, 7.1, 1.5, 5.63, 1.9, "1800–1913 model", "queen, carlisle, swinton", { bodySize: 17 });
  card(s, 7.1, 3.6, 5.63, 1.9, "1674–1799 model", "kings, peace, soveraign", { bodySize: 17, headColor: C.accent2 });
  caption(s, "Top answers from the Old Bailey models. The trick works in one period and fails in the other: why might that be?", 6.4);
}
// NEW semantic change: mad / insane / lunatic
{
  const s = content("Same word, different company: madness", "Nearest neighbours in the lab's two word2vec models (each trained on the full Proceedings for its period). 'Mad' stays an everyday word in both periods: drunken, crazy, raving; silly, spiteful. 'Insane' changes company: in the eighteenth century it sits with deranged, delirious, flighty (and some noise: negligent, discreet); after 1800 with sane, unsound, insanity, intellect, delusion: the vocabulary of medical evidence and the insanity defence. 'Lunatic' occurs only 16 times before 1800, too rarely for the model to learn anything (its 'neighbours' are noise); after 1800 (174 times) it sits with asylum, confinement, pauper, patient. Context: Criminal Lunatics Act 1800 (after Hadfield's attempt on George III); Daniel M'Naghten tried at the Old Bailey in 1843, giving the M'Naghten rules; the 1845 Lunacy and County Asylums Acts. The model shows madness becoming a medical and institutional category in the courtroom. Note how frequency and meaning change together.");
  const rows = [
    ["mad", "374 → 283", "drunken · crazy · raving · madman · silly", "silly · passionate · raving · shamming · spiteful", false],
    ["insane", "84 → 450", "deranged · negligent · delirious · flighty · discreet", "sane · unsound · insanity · intellect · delusion", false],
    ["lunatic", "16 → 174", "too rare to learn: neighbours are noise", "asylum · confinement · pauper · medically · patient", true],
  ];
  txt(s, "1674–1799", { x: 3.2, y: 1.4, w: 4.6, h: 0.4, fontSize: 17, bold: true, color: C.accent6, fontFace: THEME.headFontFace });
  txt(s, "1800–1913", { x: 8.1, y: 1.4, w: 4.6, h: 0.4, fontSize: 17, bold: true, color: C.accent1, fontFace: THEME.headFontFace });
  rows.forEach(([w, n, a, b, rare], i) => {
    const y = 1.9 + i * 1.3;
    txt(s, w, { x: M, y, w: 2.4, h: 0.5, fontSize: 22, bold: true, fontFace: THEME.headFontFace, color: i === 0 ? C.text2 : C.accent2 });
    txt(s, n + " uses", { x: M, y: y + 0.55, w: 2.4, h: 0.3, fontSize: 11, color: MUTED });
    box(s, 3.2, y, 4.65, 1.05, C.background2, w + " early");
    txt(s, a, { x: 3.4, y, w: 4.25, h: 1.05, fontSize: 15, valign: "middle", italic: rare, color: rare ? MUTED : C.text1 });
    box(s, 8.08, y, 4.65, 1.05, C.background2, w + " late");
    txt(s, b, { x: 8.28, y, w: 4.25, h: 1.05, fontSize: 15, valign: "middle" });
  });
  txt(s, [{ text: "1800 ", options: { bold: true, color: C.accent2 } }, { text: "Criminal Lunatics Act   " }, { text: "1843 ", options: { bold: true, color: C.accent2 } }, { text: "M’Naghten tried at the Old Bailey   " }, { text: "1845 ", options: { bold: true, color: C.accent2 } }, { text: "Lunacy Act and County Asylums Act" }], { x: M, y: 5.95, w: CW, h: 0.4, fontSize: 14 });
  caption(s, "Five nearest neighbours in the lab’s two word2vec models; ‘uses’ = occurrences in each training corpus.", 6.5);
}
{
  const s = content("Semantic change in research", "Training embeddings per period and comparing them shows semantic shift and drift. The Dutch newspaper example is the basis for Exercise 2.");
  fit(s, MEDIA + "image-40-1.png", M, 1.5, 6.1, 3.4, "Semantic change of gay, broadcast, awful");
  fit(s, MEDIA + "image-40-2.png", 6.95, 1.5, 5.78, 3.4, "Semantic shifts in Dutch newspapers");
  txt(s, "gay, broadcast, awful: a word’s neighbours across the 19th and 20th centuries", { x: M, y: 5.05, w: 6.1, h: 0.6, fontSize: 14 });
  txt(s, "Semantic shift of individual words in Dutch newspapers, with frequency", { x: 6.95, y: 5.05, w: 5.78, h: 0.6, fontSize: 14 });
  caption(s, "Left: Hamilton, Leskovec and Jurafsky, ‘Diachronic word embeddings reveal statistical laws of semantic change’ (2016).", 6.1);
}
{
  const s = content("What do the models actually learn?", "All examples come from the two models used in the lab. 'maroney' is Detective Stephen Maroney, a frequent police witness, so he becomes 'similar' to constable. In the early model 'police' sits with office, rotation, bow, runner, marlborough: the Bow Street and Marlborough Street police offices, not 'the police' as we mean it. What would you need to check before making a historical claim from a nearest-neighbour list?");
  [["Names", "maroney, fawell", "Police witnesses become ‘similar’ to constable"], ["Places and institutions", "bow, marlborough, rotation", "‘police’ before 1800 means the police offices"], ["Spelling", "murther, shilings, guines", "Variant spellings get their own vectors"], ["Transcription", "theprisoner, watchouse", "Words run together by printers or OCR"]].forEach(([h, ex, b], i) => {
    const x = M + i * 3.07;
    box(s, x, 1.5, 2.85, 3.3, C.background2, h);
    txt(s, h, { x: x + 0.2, y: 1.7, w: 2.45, h: 0.75, fontSize: 18, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
    txt(s, ex, { x: x + 0.2, y: 2.5, w: 2.45, h: 0.8, fontSize: 15, bold: true, color: C.accent2 });
    txt(s, b, { x: x + 0.2, y: 3.35, w: 2.45, h: 1.3, fontSize: 14 });
  });
  box(s, M, 5.15, CW, 1.0, C.background2, "takeaway");
  txt(s, "A model of the corpus, with its clerks, printers and digitisers, not a model of ‘meaning’ in general.", { x: M + 0.3, y: 5.15, w: CW - 0.6, h: 1.0, fontSize: 17, bold: true, color: C.text2, valign: "middle" });
}
{
  const s = content("Exercise 2: semantic shift", "http://macroscope.intelligence-media.com. Look for a change in how your concept was understood.");
  ["Go to macroscope.intelligence-media.com", "Translate your concept from Exercise 1 (or choose a new one)", "Compare frequency, semantic shift and the collocation network across periods", "Add your concept to Wooclap"].forEach((t, i) => {
    const x = M + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 2.3;
    box(s, x, y, 5.95, 2.0, C.background2, "step " + (i + 1));
    numBadge(s, x + 0.3, y + 0.3, i + 1, i === 3 ? C.accent2 : C.accent1);
    txt(s, t, { x: x + 1.0, y: y + 0.3, w: 4.7, h: 1.4, fontSize: 18 });
  });
}

// =====================================================================
sec("6 Handle with care");
divider("Part 6", "Handle with care", "What goes wrong, and how to build a corpus that answers your question", "Dangers and next steps.");
{
  const s = content("Know your sources: the ‘asteroid’ spike", "Take into account the specific historical circumstances of your sources. Newspapers use words for lots of different reasons.");
  fit(s, MEDIA + "image-44-1.png", M, 1.45, 6.6, 4.3, "Frequency of asteroid in American newspapers");
  fit(s, MEDIA + "image-44-2.png", 7.6, 1.45, 5.13, 4.3, "Wikipedia: Asteroid (horse)");
  txt(s, "A spike in ‘asteroid’ in 19th-century American newspapers…", { x: M, y: 5.9, w: 6.6, h: 0.5, fontSize: 16 });
  txt(s, "…is about a famous racehorse", { x: 7.6, y: 5.9, w: 5.13, h: 0.5, fontSize: 16, bold: true, color: C.accent2 });
}
{
  const s = content("Four more ways it goes wrong", "Hills et al., 'Historical analysis of national subjective wellbeing using millions of digitized books'. The Nature retraction: 'we should have labelled moralizing gods as absent or inferred absent rather than unknown... rather than converting NAs to zeros'. OCR: 'Cafes of Nouns' for 'Cases of Nouns'.");
  [["image-45-1.png", "Visualisations that hide more than they show", "word clouds of presidential speeches"], ["image-45-2.png", "Misreading the sources", "‘national wellbeing’ from millions of books (Hills et al.)"], ["image-45-3.png", "Plain mistakes", "missing data turned into zeros, then retracted"], ["image-45-4.png", "Digitisation errors", "OCR reads the long s in ‘case’ as ‘cafe’"]].forEach(([f, h, b], i) => {
    const x = M + i * 3.07;
    fit(s, MEDIA + f, x, 1.45, 2.85, 2.9, h);
    txt(s, h, { x, y: 4.5, w: 2.85, h: 0.75, fontSize: 16, bold: true, fontFace: THEME.headFontFace, color: C.accent1 });
    txt(s, b, { x, y: 5.3, w: 2.85, h: 0.9, fontSize: 14 });
  });
}
{
  const s = content("The past as a prediction machine?", "A discussion point: echoes of cliometrics. Compare with the questions on the 'Borrowed methods' slide.");
  fit(s, MEDIA + "image-46-1.jpeg", M, 1.45, 6.6, 3.9, "Cliodynamics");
  fit(s, MEDIA + "image-46-2.jpeg", 7.6, 1.45, 5.13, 3.9, "Peter Turchin");
  box(s, M, 5.55, CW, 0.85, C.background2, "question");
  txt(s, "Cliodynamics (Peter Turchin): can large historical datasets predict the future? What would we need to believe about the sources?", { x: M + 0.3, y: 5.55, w: CW - 0.6, h: 0.85, fontSize: 16, valign: "middle" });
}
{
  const s = content("Building a corpus: four questions", "Use these when planning your own project.");
  ["What is your research question?", "Which comparison do you want to make with texts?", "Do you have data from your whole period?", "What are the biases in your collection, and how can you address them?"].forEach((t, i) => {
    const x = M + (i % 2) * 6.15, y = 1.6 + Math.floor(i / 2) * 2.3;
    box(s, x, y, 5.95, 2.0, C.background2, "question " + (i + 1));
    numBadge(s, x + 0.3, y + 0.3, i + 1);
    txt(s, t, { x: x + 1.0, y: y + 0.3, w: 4.7, h: 1.4, fontSize: 19 });
  });
}
{
  const s = content("Tools to try", "Gale Scholar Lab; Voyant (https://voyant-tools.igm-bosch.de/ or voyant-tools.org); Programming Historian (https://programminghistorian.org/); Google Books Ngram Viewer (books.google.com/ngrams); LUCDH; marimo (https://marimo.io).");
  [["Gale Scholar Lab", "build and analyse corpora from Gale collections"], ["Voyant Tools", "quick counts and concordances in the browser"], ["Programming Historian", "free step-by-step tutorials"], ["Google Books Ngram Viewer", "word frequencies in millions of books"], ["LUCDH", "lab, courses, electives, minor in DH, workshops"], ["marimo", "the notebooks we use in next week’s lab"]].forEach(([h, b], i) =>
    card(s, M + (i % 3) * 4.1, 1.5 + Math.floor(i / 3) * 2.2, 3.9, 1.95, h, b, { bodySize: 15 }));
  caption(s, "voyant-tools.org · programminghistorian.org · books.google.com/ngrams · marimo.io", 6.1);
}
{
  const s = pres.addSlide({ masterName: "Section Divider", sectionTitle: section });
  s.addText("Next week", { placeholder: "kicker" });
  s.addText("Hands-on lab", { placeholder: "title" });
  s.addText("yann-ryan.github.io/marimo-digi-hist", { placeholder: "body" });
  txt(s, "Chrome on a laptop · no install, no account · click ‘run all’ once", { x: M, y: 5.0, w: 11, h: 0.5, fontSize: 16, color: C.accent3 });
  s.addNotes("Count words and phrases, chart cross-examination or any word you like, find collocations and distinctive words, and explore embeddings (gin, pot, insane...) in the Old Bailey Proceedings. Bring a laptop; think of one word to follow through 240 years. First load takes about 30 seconds.");
}

(async () => {
  await pres.writeFile({ fileName: OUT });
  await applyTheme(OUT, THEME);
  console.log("wrote", OUT);
})();
