"""Train one word2vec model per period and export compact vectors for the notebook.

The 1800-1913 corpus is ~4x larger than 1674-1799, so it is randomly
down-sampled (by sentence) to the same number of tokens: the two models then
see the same amount of text, which makes comparing them fairer.

Outputs public/vectors_1674-1799.parquet and public/vectors_1800-1913.parquet:
one row per word (TOP_N most frequent), columns word, count, v0..v99, with
unit-length float32 vectors, so cosine similarity is just a dot product. The
notebook needs only numpy + polars for this, so it also runs in the browser.

Run from the project root:
  .venv/bin/python prep/train_word2vec.py                       (Old Bailey, the default)
  .venv/bin/python prep/train_word2vec.py royal-society 1665-1799 1800-1920 --epochs 10
"""

import argparse
import logging
import random
import time
from pathlib import Path

import numpy as np
import polars as pl
from gensim.models import Word2Vec

ROOT = Path(__file__).resolve().parent.parent
ap = argparse.ArgumentParser()
ap.add_argument("corpus", nargs="?", default="", help="sub-folder name, e.g. royal-society ('' = Old Bailey)")
ap.add_argument("early", nargs="?", default="1674-1799")
ap.add_argument("late", nargs="?", default="1800-1913")
ap.add_argument("--epochs", type=int, default=5)
ARGS = ap.parse_args()
BUILD = ROOT / "build" / ARGS.corpus if ARGS.corpus else ROOT / "build"
PUBLIC = ROOT / ARGS.corpus / "public" if ARGS.corpus else ROOT / "public"
PERIODS = [ARGS.early, ARGS.late]
TOP_N = 20_000
PARAMS = dict(vector_size=100, window=5, min_count=10, sg=1, negative=5, epochs=5, workers=8, seed=1674)
PARAMS["epochs"] = ARGS.epochs

logging.basicConfig(format="%(asctime)s %(message)s", level=logging.INFO)


def count_tokens(path: Path) -> int:
    with open(path) as fh:
        return sum(line.count(" ") + 1 for line in fh)


def downsample(src: Path, dst: Path, target_tokens: int) -> int:
    total = count_tokens(src)
    keep = target_tokens / total
    rng = random.Random(1674)
    n = 0
    with open(src) as fin, open(dst, "w") as fout:
        for line in fin:
            if rng.random() < keep:
                fout.write(line)
                n += line.count(" ") + 1
    return n


def export(model: Word2Vec, out: Path):
    words = model.wv.index_to_key[:TOP_N]  # sorted by frequency
    vecs = np.vstack([model.wv[w] for w in words]).astype(np.float32)
    vecs /= np.linalg.norm(vecs, axis=1, keepdims=True)
    df = pl.DataFrame({"word": words, "count": [model.wv.get_vecattr(w, "count") for w in words]})
    df = df.hstack(pl.DataFrame(vecs, schema=[f"v{i}" for i in range(vecs.shape[1])]))
    df.write_parquet(out, compression="zstd", compression_level=19)


def main():
    early = BUILD / f"corpus_{PERIODS[0]}.txt"
    late = BUILD / f"corpus_{PERIODS[1]}.txt"
    late_eq = BUILD / f"corpus_{PERIODS[1]}_equal.txt"
    target = count_tokens(early)
    got = downsample(late, late_eq, target)
    print(f"early corpus {target:,} tokens; late corpus down-sampled to {got:,} tokens", flush=True)
    late.unlink()

    for period, path in zip(PERIODS, [early, late_eq]):
        t = time.time()
        model = Word2Vec(corpus_file=str(path), **PARAMS)
        print(f"{period}: trained in {time.time() - t:.0f}s, vocab {len(model.wv):,}", flush=True)
        model.save(str(BUILD / f"w2v_{period}.model"))
        export(model, PUBLIC / f"vectors_{period}.parquet")
        for w in ["constable", "gin", "watch", "police", "experiment", "air", "cell", "atom", "electricity", "vrijheid", "arbeiders", "vrouw", "indië", "staat"]:
            if w in model.wv:
                print(f"  {w}: {[x for x, _ in model.wv.most_similar(w, topn=8)]}", flush=True)
        path.unlink()


if __name__ == "__main__":
    main()
