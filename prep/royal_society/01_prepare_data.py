"""Prepare the Royal Society Corpus 6.0.4 Open (CC BY-NC-SA 4.0) for the marimo lab.

Input (downloaded from https://fedora.clarin-d.uni-saarland.de/rsc_v6/access.html):
  build/rsc_raw/Royal_Society_Corpus_open_v6.0.4_meta.tsv.zip
  build/rsc_raw/Royal_Society_Corpus_open_v6.0.4_texts_txt.zip

Output:
  royal-society/public/texts_sample.parquet   random texts per decade, up to ~TOKENS_PER_DECADE
                                              tokens each, with flat metadata + text
  build/royal-society/corpus_1665-1799.txt    one tokenised sentence per line, for word2vec
  build/royal-society/corpus_1800-1920.txt

Run from the project root:  .venv/bin/python prep/royal_society/01_prepare_data.py
"""

import csv
import html
import io
import random
import re
import zipfile
from pathlib import Path

import polars as pl

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "build" / "rsc_raw"
BUILD = ROOT / "build" / "royal-society"
PUBLIC = ROOT / "royal-society" / "public"
BUILD.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

TOKENS_PER_DECADE = 250_000
SPLIT_YEAR = 1800
SEED = 1665
DROP_TYPES = {"list", "errata", "corrigenda", "advertisement", "catalogue", "publication-announcement"}
WORD = re.compile(r"[a-z]+")

JOURNAL = {
    "transactions": "Philosophical Transactions",
    "rstl": "Philosophical Transactions",
    "rsta": "Philosophical Transactions",
    "rstb": "Philosophical Transactions",
    "proceedings": "Proceedings",
    "rspl": "Proceedings",
    "rspa": "Proceedings",
    "rspb": "Proceedings",
    "abs_printed": "Abstracts",
    "abs_communicated": "Abstracts",
}


def text_type(t):
    if t in ("abstract", "abs"):
        return "abstract"
    if t in ("fla", "article", "paper-read"):
        return "article"
    return "other"


def main():
    zm = zipfile.ZipFile(RAW / "Royal_Society_Corpus_open_v6.0.4_meta.tsv.zip")
    meta = list(
        csv.DictReader(io.StringIO(zm.read(zm.namelist()[0]).decode("utf-8", "replace")), delimiter="\t", quoting=csv.QUOTE_NONE)
    )
    meta = [m for m in meta if m["type"] not in DROP_TYPES]
    zt = zipfile.ZipFile(RAW / "Royal_Society_Corpus_open_v6.0.4_texts_txt.zip")
    path = {re.search(r"_text_(.+)\.txt$", n).group(1): n for n in zt.namelist() if n.endswith(".txt")}

    rows = []
    n_tok = {"early": 0, "late": 0}
    with open(BUILD / "corpus_1665-1799.txt", "w") as early, open(BUILD / "corpus_1800-1920.txt", "w") as late:
        for m in meta:
            raw = zt.read(path[m["id"]]).decode("utf-8", "replace")
            year = int(m["year"])
            fh, key = (early, "early") if year < SPLIT_YEAR else (late, "late")
            for line in raw.splitlines():  # the corpus has one sentence per line
                toks = WORD.findall(line.lower())
                if len(toks) >= 3:
                    fh.write(" ".join(toks) + "\n")
                    n_tok[key] += len(toks)
            topic = re.sub(r"\s+\d+$", "", m["primaryTopic"] or "unknown")
            rows.append(
                {
                    "text_id": m["id"],
                    "year": year,
                    "decade": year // 10 * 10,
                    "journal": JOURNAL.get(m["jrnl"], m["jrnl"]),
                    "text_type": text_type(m["type"]),
                    "topic": topic,
                    "topic_detail": m["primaryTopic"] or "unknown",
                    "title": html.unescape(m["title"]),
                    "author": html.unescape(m["author"]).replace("|", "; "),
                    "text": html.unescape(raw).replace(" ,", ",").replace(" .", ".").replace(" ;", ";").replace(" :", ":"),
                }
            )
    texts = pl.DataFrame(rows).with_columns(pl.col("text").str.count_matches(r"\S+").alias("n_words"))
    print(f"{texts.height:,} texts; word2vec tokens: {n_tok}")

    # sample: random texts per decade until the decade's token budget is reached
    rng = random.Random(SEED)
    keep = []
    for decade, group in texts.group_by("decade"):
        ids = list(zip(group["text_id"], group["n_words"]))
        rng.shuffle(ids)
        total = 0
        for tid, n in ids:
            if n < 20 or total + n > TOKENS_PER_DECADE * 1.1:
                continue
            keep.append(tid)
            total += n
            if total >= TOKENS_PER_DECADE:
                break
    sample = texts.filter(pl.col("text_id").is_in(keep)).sort("year", "text_id")
    sample.write_parquet(PUBLIC / "texts_sample.parquet", compression="zstd", compression_level=19)
    print(f"sample: {sample.height:,} texts, {sample['n_words'].sum():,} words")
    print(sample.group_by("decade").agg(pl.len(), pl.col("n_words").sum()).sort("decade"))
    for c in ["journal", "text_type", "topic"]:
        print(sample[c].value_counts().sort("count", descending=True))


if __name__ == "__main__":
    main()
