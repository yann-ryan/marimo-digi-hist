"""Prepare the Dutch parliamentary proceedings (PoliticalMashup, 1814-2012, CC0) for the marimo lab.

Input (from DANS, doi:10.17026/dans-xk5-dw3s, read in place, never unzipped):
  build/sgd_raw/sgd-nosem_versie_nov_2012.zip   one XML file per sitting, folders per decade

Output:
  dutch-parliament/public/speeches_sample.parquet   random speeches per decade, ~WORDS_PER_DECADE
                                                    words each, with date, chamber, speaker, role, party
  build/dutch-parliament/corpus_1814-1917.txt       ~TARGET_TOKENS random speeches each, one per line,
  build/dutch-parliament/corpus_1918-2012.txt       tokenised, for word2vec

Run from the project root:  .venv/bin/python prep/dutch_parliament/01_prepare_data.py
"""

import random
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from multiprocessing import Pool
from pathlib import Path

import polars as pl

ROOT = Path(__file__).resolve().parents[2]
ZIP = ROOT / "build" / "sgd_raw" / "sgd-nosem_versie_nov_2012.zip"
BUILD = ROOT / "build" / "dutch-parliament"
PUBLIC = ROOT / "dutch-parliament" / "public"
BUILD.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

SPLIT_YEAR = 1918
TARGET_TOKENS = 25_000_000  # per period, for word2vec
WORDS_PER_DECADE = 250_000  # for the notebook sample
BYTES_PER_WORD = 9.5  # measured on a sample of sittings
SEED = 1814
PM = "{http://www.politicalmashup.nl}"
DC = "{http://purl.org/dc/elements/1.1/}"
WORD = re.compile(r"[a-zà-öø-ÿ]+")  # Dutch: keep accented letters (één, ministeriëel)
HOUSE = {"commons": "Tweede Kamer", "senate": "Eerste Kamer"}
ROLE = {"mp": "member", "government": "minister", "chair": "chair"}


def work(args):
    decade, names, p_early, p_late, q_sample = args
    rng = random.Random(f"{SEED}-{decade}")
    z = zipfile.ZipFile(ZIP)
    rows, n_tok = [], 0
    with open(BUILD / f"tmp_{decade}_early.txt", "w") as out_e, open(BUILD / f"tmp_{decade}_late.txt", "w") as out_l:
        for name in names:
            try:
                root = ET.fromstring(z.read(name))
            except ET.ParseError:
                continue
            date = root.findtext(f".//{DC}date") or ""
            if not re.match(r"\d{4}-\d\d-\d\d", date):
                continue
            house_el = root.find(f".//{PM}house")
            house = HOUSE.get(house_el.get(f"{PM}house") if house_el is not None else "", "other")
            is_early = int(date[:4]) < SPLIT_YEAR
            out, p_keep = (out_e, p_early) if is_early else (out_l, p_late)
            for topic in root.iter(f"{PM}topic"):
                title = topic.get(f"{PM}title") or ""
                for sp in topic.iter(f"{PM}speech"):
                    text = " ".join(" ".join(p.itertext()) for p in sp.iter(f"{PM}p")).strip()
                    text = re.sub(r"\s+", " ", text)
                    toks = WORD.findall(text.lower())
                    if len(toks) < 20:
                        continue
                    if rng.random() < p_keep:
                        out.write(" ".join(toks) + "\n")
                        n_tok += len(toks)
                    if rng.random() < q_sample:
                        party = (sp.get(f"{PM}party-ref") or "").removeprefix("nl.p.") or "unknown"
                        rows.append(
                            {
                                "speech_id": sp.get(f"{PM}id"),
                                "date": date,
                                "year": int(date[:4]),
                                "decade": int(date[:4]) // 10 * 10,
                                "chamber": house,
                                "speaker": sp.get(f"{PM}speaker") or "unknown",
                                "role": ROLE.get(sp.get(f"{PM}role"), "other"),
                                "party": party,
                                "debate": title.strip(" :") or "",
                                "text": text,
                                "n_words": len(text.split()),
                            }
                        )
    return decade, rows, n_tok


def main():
    z = zipfile.ZipFile(ZIP)
    files = defaultdict(list)
    size = defaultdict(int)
    for i in z.infolist():
        if i.filename.endswith(".xml"):
            d = int(i.filename.split("/")[0])
            files[d].append(i.filename)
            size[d] += i.file_size
    est_words = {d: size[d] / BYTES_PER_WORD for d in files}
    early = sum(w for d, w in est_words.items() if d < 1910) + est_words[1910] * 0.8
    late = sum(est_words.values()) - early
    p_early, p_late = min(1.0, TARGET_TOKENS * 1.15 / early), min(1.0, TARGET_TOKENS * 1.15 / late)
    print(f"estimated words: early {early / 1e6:.0f}M, late {late / 1e6:.0f}M; keep {p_early:.3f} / {p_late:.3f}")
    jobs = []
    for d in sorted(files):
        q = min(1.0, 3 * WORDS_PER_DECADE / est_words[d])
        jobs.append((d, files[d], p_early, p_late, q))
        print(d, len(files[d]), f"~{est_words[d] / 1e6:.0f}M words", f"sample {q:.4f}", flush=True)

    with Pool(7) as pool:
        results = pool.map(work, jobs)

    with open(BUILD / "corpus_1814-1917.txt", "w") as e, open(BUILD / "corpus_1918-2012.txt", "w") as l:
        for d, _, _ in sorted(results, key=lambda r: r[0]):
            for part, fh in (("early", e), ("late", l)):
                tmp = BUILD / f"tmp_{d}_{part}.txt"
                with open(tmp) as t:
                    for line in t:
                        fh.write(line)
                tmp.unlink()
    print("tokens per decade kept for word2vec:", {d: n for d, _, n in sorted(results, key=lambda r: r[0])})

    rng = random.Random(SEED)
    keep = []
    for d, rows, _ in sorted(results, key=lambda r: r[0]):
        rng.shuffle(rows)
        total = 0
        for r in rows:
            if total + r["n_words"] > WORDS_PER_DECADE * 1.1:
                continue
            keep.append(r)
            total += r["n_words"]
            if total >= WORDS_PER_DECADE:
                break
    sample = pl.DataFrame(keep).sort("date", "speech_id")
    sample.write_parquet(PUBLIC / "speeches_sample.parquet", compression="zstd", compression_level=19)
    print(f"sample: {sample.height:,} speeches, {sample['n_words'].sum():,} words")
    print(sample.group_by("decade").agg(pl.len(), pl.col("n_words").sum()).sort("decade"))
    for c in ["chamber", "role", "party"]:
        print(sample[c].value_counts().sort("count", descending=True).head(15))


if __name__ == "__main__":
    main()
