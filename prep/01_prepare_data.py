"""Prepare the Old Bailey data for the marimo lab.

Streams the six trial shards of biglam/old_bailey_proceedings (CC BY-NC 4.0)
from Hugging Face, reading only the columns we need, and produces:

  public/trials_sample.parquet   stratified sample (<= N_PER_DECADE trials per
                                 decade) with flat metadata + text, for counting
  build/corpus_1674-1799.txt     one tokenised sentence per line, for word2vec
  build/corpus_1800-1913.txt     (deleted by 02_train_word2vec.py when done)

Run from the project root:  .venv/bin/python prep/01_prepare_data.py
"""

import re
from pathlib import Path

import polars as pl

BASE = "https://huggingface.co/datasets/biglam/old_bailey_proceedings/resolve/main/trials"
SHARDS = [f"{BASE}/train-{i:05d}-of-00006.parquet" for i in range(6)]
COLS = ["trial_id", "date", "text", "persons", "offences", "verdicts", "punishments"]
N_PER_DECADE = 500
SPLIT_YEAR = 1800
SEED = 1674

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
BUILD = ROOT / "build"
PUBLIC.mkdir(exist_ok=True)
BUILD.mkdir(exist_ok=True)

# The same tokeniser the students see in the notebook: lowercase runs of letters.
WORD = re.compile(r"[a-z]+")
SENT = re.compile(r"[.?!;:]+\s")


def flatten(df: pl.DataFrame) -> pl.DataFrame:
    defendant_genders = pl.col("persons").list.eval(
        pl.element().filter(pl.element().struct.field("type") == "defendant").struct.field("gender")
    ).list.unique()
    return df.select(
        "trial_id",
        pl.col("date").str.slice(0, 4).cast(pl.Int32).alias("year"),
        pl.col("offences").list.first().struct.field("category").fill_null("unknown").alias("offence"),
        pl.col("offences").list.first().struct.field("subcategory").alias("offence_detail"),
        pl.col("verdicts").list.first().struct.field("category").alias("verdict"),
        pl.col("punishments").list.first().struct.field("category").fill_null("none").alias("punishment"),
        pl.when(defendant_genders.list.len() == 1)
        .then(defendant_genders.list.first())
        .otherwise(pl.lit("mixed/unknown"))
        .fill_null("mixed/unknown")
        .replace("indeterminate", "mixed/unknown")
        .alias("defendant_gender"),
        pl.col("text").str.strip_chars(),
    ).with_columns(
        (pl.col("year") // 10 * 10).alias("decade"),
        pl.col("text").str.count_matches(r"\S+").alias("n_words"),
    )


def write_sentences(texts, fh) -> int:
    n = 0
    for text in texts:
        for sent in SENT.split(text.lower()):
            toks = WORD.findall(sent)
            if len(toks) >= 3:
                # very long "sentences" (lists, run-ons) are chunked for word2vec
                for i in range(0, len(toks), 1000):
                    fh.write(" ".join(toks[i : i + 1000]) + "\n")
                n += len(toks)
    return n


def main():
    parts = []
    tokens = {"early": 0, "late": 0}
    with open(BUILD / "corpus_1674-1799.txt", "w") as early, open(BUILD / "corpus_1800-1913.txt", "w") as late:
        for url in SHARDS:
            print("reading", url.rsplit("/", 1)[-1], flush=True)
            df = flatten(pl.scan_parquet(url).select(COLS).collect())
            df = df.filter(pl.col("text").str.len_chars() > 0)
            tokens["early"] += write_sentences(df.filter(pl.col("year") < SPLIT_YEAR)["text"], early)
            tokens["late"] += write_sentences(df.filter(pl.col("year") >= SPLIT_YEAR)["text"], late)
            parts.append(df)
    trials = pl.concat(parts).unique("trial_id", keep="first")
    print(f"{trials.height:,} trials; word2vec tokens: {tokens}")

    sample = (
        trials.filter(pl.col("n_words") >= 20)
        .sample(fraction=1.0, shuffle=True, seed=SEED)
        .group_by("decade", maintain_order=True)
        .head(N_PER_DECADE)
        .sort("trial_id")
    )
    sample.write_parquet(PUBLIC / "trials_sample.parquet", compression="zstd", compression_level=19)
    print(f"sample: {sample.height:,} trials, {sample['n_words'].sum():,} words")
    print(sample.group_by("decade").len().sort("decade"))
    print(sample["offence"].value_counts().sort("count", descending=True))
    print(sample["defendant_gender"].value_counts())


if __name__ == "__main__":
    main()
