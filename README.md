# Old Bailey text-analysis lab (marimo)

A 1h45 taster lab for absolute beginners in digital history: word counting,
comparing groups and word embeddings (word2vec), using the *Proceedings of the
Old Bailey, 1674–1913*. Theory goes in the lecture the week before; the notebook
is mostly pre-written and driven by sliders, text boxes and dropdowns.

```
lab.py                         the marimo notebook (students open this)
public/trials_sample.parquet   12,482 trials (≤500 random per decade), metadata + text (8.8 MB)
public/vectors_1674-1799.parquet   word2vec, top 20k words, 100-d unit vectors
public/vectors_1800-1913.parquet   (same, second period)
prep/01_prepare_data.py        builds the sample + word2vec corpora from Hugging Face
prep/02_train_word2vec.py      trains both models (~5 min on 8 cores) and exports vectors
build/                         scratch: trained gensim models, logs (not needed for teaching)
```

## The notebook

| Time | Section | Students do |
|---|---|---|
| 0–8 | Intro + warm-up | open the link, run all; drag the 39-shilling slider to see reactivity |
| 8–20 | 1 · Meet the data | browse/sort/filter the table; read random trials; median words per trial by decade (source criticism) |
| 20–45 | 2 · Counting | tokenisation; top words ± stopwords; words **and phrases** per 10k words by decade; **n-grams** containing a word; keyword-in-context |
| 45–65 | 3 · Association and distinctive words | **collocations** with MI score (window, period, minimum count); distinctive words by gender / offence / verdict / punishment; **TF-IDF** by decade or offence (optional) |
| 65–92 | 4 · Embeddings | **cosine similarity of two words**; neighbours in 1674–1799 vs 1800–1913; analogies; 2-D map |
| 92–105 | Wrap-up | one word, three questions, short plenary |

The lab mirrors the lecture's three methods: frequency (counts, normalisation,
n-grams), association (collocations, distinctiveness/TF-IDF) and embeddings.
N-grams and collocations re-read the text on demand, so for speed in the browser
they use at most a random 1,000 of the trials containing the word (the output
says so) and refuse words occurring more than 30,000 times (e.g. *the*, *prisoner*).

Only numpy, polars and altair are needed at run time (no gensim), so the
notebook runs on molab, locally, and in the browser (WebAssembly).

## Running it

**Locally:** `uvx marimo edit --sandbox lab.py` (or `.venv/bin/marimo edit lab.py`).
App view without code: `marimo run lab.py`.

**For the class (molab, recommended):**
1. Push this folder (with `public/`) to a public GitHub repo.
2. Share `https://molab.marimo.io/github/<owner>/<repo>/blob/main/lab.py`.
   Students open it and fork it into their own workspace.
3. **Test beforehand with a non-staff account:** does forking need a login? Do the
   `public/` files load? How long does the first run take?

**GitHub Pages (main route, no student accounts):** `docs/` holds the in-browser
site. Push the repo, then in the repo's settings choose Pages → deploy from branch
`main`, folder `/docs`. Students open `https://<owner>.github.io/<repo>/` in Chrome
and click ▶ "run all" (bottom right) once. **Re-export after every change to `lab.py`:**
```
.venv/bin/marimo export html-wasm lab.py -o docs --mode edit && touch docs/.nojekyll
```
(`docs/CLAUDE.md` is part of marimo's export, the prompt for its built-in AI
assistant. It does no harm.)

**Static site, general notes:**
```
marimo export html-wasm lab.py -o site --mode edit
cd site && python -m http.server   # test; then put site/ on GitHub Pages
```
The `public/` folder is copied by the directory export (not by `--single-file`).
Tested 2026-11-09 in Chrome: loads, and everything runs without errors in about 30 s.
**In the edit-mode export, cells do not run on page load. Students have to click
the ▶ "run all" button (bottom right) once.** The `--mode run` export (app view,
no code) runs automatically.
The browser version is limited to ~2 GB of memory. Counting keeps one row per
(trial, word), about 2M rows. Edits are lost on reload (the browser asks first).

## Rebuilding the data

```
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python marimo==0.25.1 gensim==4.4.0 polars==1.44.2 altair==6.2.2
.venv/bin/python prep/01_prepare_data.py   # streams ~0.3 GB of needed columns from HF
.venv/bin/python prep/02_train_word2vec.py # skip-gram, 100-d, window 5, min_count 10, 5 epochs
```
The 1800–1913 corpus is randomly down-sampled by sentence to the size of the
1674–1799 one (~25M tokens each), so the two models see the same amount of text.
gensim 4.4 prints harmless `Exception ignored in: ...our_dot_float` lines during
training (one per worker per epoch); the resulting neighbours are fine.

## Data and licence

*The Proceedings of the Old Bailey, 1674–1913*, Old Bailey Online (Hitchcock,
Shoemaker, Emsley, Howard, McLaughlin et al.), via the Hugging Face dataset
[`biglam/old_bailey_proceedings`](https://huggingface.co/datasets/biglam/old_bailey_proceedings),
CC BY-NC 4.0. Non-commercial teaching use with attribution, which the notebook
footer gives.

## Teaching notes

- Content: real trials, including sexual violence and infanticide. The notebook has a short
  content note, and Part 3's gender comparison surfaces words like *carnally*,
  *bastard* and *pregnancy*.
- Examples that work well (checked): `constable`/`police` neighbours (beadle,
  headborough, watchman → policeman, sergeant, inspector, the post-1829 Met);
  `servant` (footman, apprentice → housemaid, charwoman: the feminisation of
  service); `watchman, constable, policeman` over time; `guinea, sovereign`;
  `man : woman :: king : ?` gives *queen* in 1800–1913 but not 1674–1799.
- Neighbour lists include names of frequent witnesses and officers (e.g. *maroney*),
  which is a good prompt for discussing what the models actually learn.
