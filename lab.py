# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "marimo",
#     "polars>=1.30,<2",
#     "altair>=5.4,<7",
#     "numpy>=1.26",
# ]
# ///

import marimo

__generated_with = "0.25.1"
app = marimo.App(width="medium", app_title="Old Bailey text analysis lab")


@app.cell(hide_code=True)
def _():
    import marimo as mo

    return (mo,)


@app.cell(hide_code=True)
def _():
    import html
    import io
    import random
    import re

    import altair as alt
    import numpy as np
    import polars as pl

    return alt, html, io, np, pl, random, re


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    # Reading 240 years of crime with a computer

    **A taster in computational text analysis, using the Proceedings of the Old Bailey (1674–1913)**

    The *Proceedings* are the printed accounts of trials at London's central criminal court. They
    hold close to 200,000 trials and about 120 million words. Nobody can read all of that, but a
    computer can count it. In this lab you will:

    1. **Meet the data**: what a "trial" looks like as data
    2. **Count words**: the simplest text analysis, and still one of the most useful
    3. **Compare groups**: which words are typical of trials of women, or of violent crimes?
    4. **Explore word embeddings**: let the computer learn which words "mean" similar things

    ⚠️ *Content note: these are real criminal trials, including violence, sexual assault and
    infanticide, recorded in the language of their time.*

    You will not need to write much code. Most of the time you change a value (a slider, a box,
    a dropdown) and watch the results update.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(
        r"""
    **How this notebook works.** A marimo notebook is made of *cells*. Some contain text (like
    this one), some contain Python code, and code cells show their result *above* the code.
    marimo is **reactive**: when you change something, every cell that depends on it re-runs
    automatically. You never have to remember which cells to re-run.

    Cells marked **✏️ Your turn** are the ones you are meant to edit. Click into the code, change
    it, and press `Ctrl/Cmd + Enter` (or the ▶ button) to run it. If you break something, press
    `Ctrl/Cmd + Z` to undo.
    """
    ).callout(kind="info")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### Warm-up: reactivity

    Drag the slider. The cell below it uses the slider's value, so it updates automatically.
    """)
    return


@app.cell
def _(mo):
    shillings = mo.ui.slider(start=1, stop=60, value=39, label="Value of the stolen goods (shillings)")
    shillings
    return (shillings,)


@app.cell
def _(mo, shillings):
    _pounds, _s = divmod(shillings.value, 20)
    _note = (
        "Above 40 shillings (£2), stealing from a dwelling house was a capital offence "
        "for much of the 18th century. Juries often valued goods at 39s to avoid a death sentence."
        if shillings.value >= 40
        else "Below the 40-shilling threshold."
    )
    mo.md(f"**{shillings.value}s** is £{_pounds} {_s}s. {_note}")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ---
    ## Part 1 · Meet the data

    We use a **sample of 12,482 trials**: up to 500 chosen at random from each decade between the
    1670s and the 1910s. Each row is one trial, with information the Old Bailey Online project
    added by hand (offence, verdict, punishment, the defendant's gender) and the text of the trial.
    """)
    return


@app.cell(hide_code=True)
def _(io, mo, pl):
    def read_data(name):
        """Read a parquet file from the public/ folder, locally, on molab or in the browser."""
        location = str(mo.notebook_location() / "public" / name)
        if location.startswith(("http://", "https://")):
            # in the browser (WebAssembly) version, files are fetched over the web
            import urllib.request

            import pyarrow.parquet as pq

            with urllib.request.urlopen(location) as response:
                return pl.from_arrow(pq.read_table(io.BytesIO(response.read())))
        return pl.read_parquet(location)

    return (read_data,)


@app.cell
def _(read_data):
    trials = read_data("trials_sample.parquet")
    trials
    return (trials,)


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    The table above is interactive: sort by clicking a column name, or use the search and filter
    buttons. Try to find the longest trial, or a trial ending in a death sentence.

    ### Read a trial

    Before counting anything, **read some of the source**. Pick a decade and an offence.
    """)
    return


@app.cell(hide_code=True)
def _(mo, trials):
    pick_decade = mo.ui.slider(start=1670, stop=1910, step=10, value=1750, label="Decade", show_value=True)
    pick_offence = mo.ui.dropdown(
        options=["any"] + sorted(trials["offence"].unique().to_list()), value="any", label="Offence"
    )
    another = mo.ui.button(value=0, on_click=lambda n: n + 1, label="🎲 Another trial")
    mo.hstack([pick_decade, pick_offence, another], justify="start", gap=2)
    return another, pick_decade, pick_offence


@app.cell(hide_code=True)
def _(another, html, mo, pick_decade, pick_offence, pl, random, trials):
    _rows = trials.filter(pl.col("decade") == pick_decade.value)
    if pick_offence.value != "any":
        _rows = _rows.filter(pl.col("offence") == pick_offence.value)
    if _rows.height == 0:
        _out = mo.md("No trials for this combination in our sample. Try another.").callout(kind="warn")
    else:
        _t = _rows.row(random.Random(another.value).randrange(_rows.height), named=True)
        _out = mo.vstack(
            [
                mo.md(
                    f"**{_t['trial_id']}** · {_t['year']} · offence: *{_t['offence_detail'] or _t['offence']}* · "
                    f"defendant: {_t['defendant_gender']} · verdict: {_t['verdict']} · punishment: {_t['punishment']} · "
                    f"{_t['n_words']:,} words"
                ),
                mo.Html(
                    "<div style='max-height:320px;overflow:auto;white-space:pre-wrap;"
                    "padding:0.75em;border:1px solid var(--slate-6, #ccc);border-radius:6px'>"
                    f"{html.escape(_t['text'])}</div>"
                ),
            ]
        )
    _out
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### The source changes over time

    A first count: how many words does a trial take up, decade by decade?
    """)
    return


@app.cell
def _(alt, pl, trials):
    words_per_trial = trials.group_by("decade").agg(pl.col("n_words").median().alias("median_words")).sort("decade")

    alt.Chart(words_per_trial).mark_bar().encode(
        x=alt.X("decade:O", title="Decade"),
        y=alt.Y("median_words:Q", title="Median words per trial"),
        tooltip=["decade", "median_words"],
    ).properties(height=250)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **Discuss with your neighbour:** why would trials get *longer*? Crime did not become more
    wordy. The *Proceedings* changed: from short, sensational pamphlets to near-verbatim records
    taken down in shorthand. **Every count we make later is a count of the source, not directly
    of the past.** Keep this in mind.
    """).callout(kind="warn")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ---
    ## Part 2 · Counting words

    To count words, the computer first has to decide what a "word" is. Our rule is very simple:
    **lower-case everything, and treat every run of letters a–z as a word.** This is called
    *tokenisation*.
    """)
    return


@app.cell
def _(re):
    # ✏️ Your turn: change the sentence and run the cell (Ctrl/Cmd + Enter).
    # What happens to numbers, hyphens, apostrophes, "£"?
    my_sentence = "The Prisoner stole a silver Watch, value 40s. from the Prosecutor's pocket."

    my_tokens = re.findall(r"[a-z]+", my_sentence.lower())
    my_tokens
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    Now we apply the same rule to all ~6.8 million words in our sample. First we count each
    word **in each trial** (one row per trial and word), then add those up to get a total for
    each word across the whole sample. (This can take a few seconds.)
    """)
    return


@app.cell
def _(pl, trials):
    trial_word_counts = (
        trials.lazy()
        .select("trial_id", pl.col("text").str.to_lowercase().str.extract_all(r"[a-z]+").alias("word"))
        .explode("word")
        .drop_nulls("word")
        .group_by("trial_id", "word")
        .agg(pl.len().alias("count"))
        .collect()
    )

    word_counts = trial_word_counts.group_by("word").agg(pl.col("count").sum()).sort("count", descending=True)
    word_counts
    return trial_word_counts, word_counts


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    The most frequent words are not very interesting: *the*, *and*, *i*, *of*... These are
    called **stopwords**, and analyses often remove them. Use the switch to remove a standard
    list, and add your own words to remove (separated by commas).
    """)
    return


@app.cell(hide_code=True)
def _():
    STOPWORDS = set(
        """a about above after again against all am an and any are as at be because been before being
        below between both but by can could did do does doing down during each few for from further had
        has have having he her here hers herself him himself his how i if in into is it its itself just
        me more most my myself no nor not now of off on once only or other our ours ourselves out over
        own same she should so some such than that the their theirs them themselves then there these
        they this those through to too under until up upon us very was we were what when where which
        while who whom why will with would you your yours yourself yourselves said says say one two
        three s d""".split()
    )
    return (STOPWORDS,)


@app.cell(hide_code=True)
def _(mo):
    remove_stop = mo.ui.switch(value=False, label="Remove stopwords")
    extra_stop = mo.ui.text(value="", label="Also remove:", placeholder="prisoner, prosecutor", full_width=True)
    top_n = mo.ui.slider(start=10, stop=50, step=5, value=25, label="How many words", show_value=True)
    mo.hstack([remove_stop, top_n, extra_stop], justify="start", gap=2, widths=[1, 2, 3])
    return extra_stop, remove_stop, top_n


@app.cell
def _(STOPWORDS, alt, extra_stop, pl, remove_stop, top_n, word_counts):
    _remove = {w.strip().lower() for w in extra_stop.value.split(",") if w.strip()}
    if remove_stop.value:
        _remove |= STOPWORDS
    top_words = word_counts.filter(~pl.col("word").is_in(list(_remove))).head(top_n.value)

    alt.Chart(top_words).mark_bar().encode(
        x=alt.X("count:Q", title="Occurrences in the sample"),
        y=alt.Y("word:N", sort="-x", title=None),
        tooltip=["word", "count"],
    ).properties(height=alt.Step(16))
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **Question:** with the stopwords removed, what do the top words tell you about *what kind of
    document* this is, and about the crimes that came before the court?

    ### Words over time

    Raw counts are misleading when the amount of text changes (remember the chart in Part 1).
    So we count **occurrences per 10,000 words** in each decade. Type one or more words or
    phrases (like `silver watch`), separated by commas.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    trend_words = mo.ui.text(value="watchman, constable, policeman", label="Words or phrases:", full_width=True)
    trend_words
    return (trend_words,)


@app.cell
def _(pl, trial_word_counts, trials):
    decade_word_counts = (
        trial_word_counts.join(trials.select("trial_id", "decade"), on="trial_id")
        .group_by("decade", "word")
        .agg(pl.col("count").sum())
    )
    decade_totals = decade_word_counts.group_by("decade").agg(pl.col("count").sum().alias("total"))
    return decade_totals, decade_word_counts


@app.cell
def _(alt, decade_totals, decade_word_counts, pl, re, trend_words, trials):
    _terms = [" ".join(re.findall(r"[a-z]+", t.lower())) for t in trend_words.value.split(",")]
    _words = [t for t in _terms if t and " " not in t]
    _phrases = [t for t in _terms if " " in t]

    # single words: look them up in the counts we already made
    _parts = [
        decade_totals.join(pl.DataFrame({"word": _words}, schema={"word": pl.String}), how="cross")
        .join(decade_word_counts, on=["decade", "word"], how="left")
        .select("decade", "total", "word", pl.col("count").cast(pl.Int64))
    ]
    # phrases (n-grams): search for them in the text, with punctuation turned into spaces
    if _phrases:
        _clean = trials.select("decade", pl.col("text").str.to_lowercase().str.replace_all(r"[^a-z]+", " ").alias("t"))
        for _p in _phrases:
            _parts.append(
                _clean.group_by("decade")
                .agg(pl.col("t").str.count_matches(rf"\b{_p}\b").sum().cast(pl.Int64).alias("count"))
                .join(decade_totals, on="decade")
                .select("decade", "total", pl.lit(_p).alias("word"), "count")
            )

    trend = (
        pl.concat(_parts)
        .with_columns(pl.col("count").fill_null(0))
        .with_columns((pl.col("count") / pl.col("total") * 10_000).round(2).alias("per_10k_words"))
        .sort("decade")
    )

    alt.Chart(trend).mark_line(point=True).encode(
        x=alt.X("decade:O", title="Decade"),
        y=alt.Y("per_10k_words:Q", title="Occurrences per 10,000 words"),
        color=alt.Color("word:N", title="Word"),
        tooltip=["word", "decade", "count", "per_10k_words"],
    ).properties(height=300)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ✏️ **Your turn.** Try some of these, or your own ideas: `guinea, sovereign`; `handkerchief, watch`; `gin, beer`;
    `wig, umbrella, bicycle`; `sword, pistol, revolver`;
    `hanged, transported`; `watch house, public house`. Does a rise or fall reflect a change in
    society, in the language, or in how the court recorded things?

    ### Phrases: n-grams

    Single words lose their context: *watch* can be a timepiece or the night watch. An
    **n-gram** is a sequence of *n* words in a row: *silver watch* is a 2-gram (bigram), *the
    watch house* a 3-gram (trigram). Type a word to see the most common phrases that contain it.
    Then try an interesting phrase in the *Words over time* chart above.
    """)
    return


@app.cell(hide_code=True)
def _(mo, pl, trial_word_counts, trials, word_counts):
    TOO_COMMON = 30_000

    def stop_if_too_common(word):
        """Very common words (the, and, prisoner...) make slow and uninteresting results."""
        n = word_counts.filter(pl.col("word") == word)["count"].sum()
        mo.stop(
            n > TOO_COMMON,
            mo.md(
                f"*{word}* occurs {n:,} times: too common to be interesting here (and slow in the browser). "
                "Try a less frequent word."
            ).callout(kind="warn"),
        )

    MAX_TRIALS = 1_000

    def tokens_of_trials_with(word, years=None):
        """All the words, in order, of the trials that contain `word` (optionally only between two years).

        To keep things quick in the browser, at most MAX_TRIALS trials (a random selection) are used.
        Returns the words and a short note saying how many trials were used.
        """
        ids = trial_word_counts.filter(pl.col("word") == word).select("trial_id")
        if years:
            ids = ids.join(trials.filter(pl.col("year").is_between(*years)).select("trial_id"), on="trial_id", how="semi")
        note = f"Based on all {ids.height:,} trials that contain *{word}*."
        if ids.height > MAX_TRIALS:
            note = f"Based on a random {MAX_TRIALS:,} of the {ids.height:,} trials that contain *{word}*."
            ids = ids.sample(MAX_TRIALS, seed=1674)
        tokens = (
            trials.select("trial_id", "text")
            .join(ids, on="trial_id", how="semi")
            .select("trial_id", pl.col("text").str.to_lowercase().str.extract_all(r"[a-z]+").alias("word"))
            .explode("word")
            .drop_nulls("word")
            .with_row_index("position")
            .with_columns(pl.col("position").cast(pl.Int64))
        )
        return tokens, note
    return stop_if_too_common, tokens_of_trials_with


@app.cell(hide_code=True)
def _(mo):
    ngram_word = mo.ui.text(value="watch", label="Phrases containing:")
    ngram_n = mo.ui.radio(
        options={"2 words (bigrams)": 2, "3 words (trigrams)": 3}, value="2 words (bigrams)", inline=True
    )
    mo.hstack([ngram_word, ngram_n], justify="start", gap=2)
    return ngram_n, ngram_word


@app.cell
def _(alt, mo, ngram_n, ngram_word, pl, stop_if_too_common, tokens_of_trials_with):
    _word = ngram_word.value.strip().lower()
    _n = ngram_n.value
    stop_if_too_common(_word)
    _tokens, _note = tokens_of_trials_with(_word)

    # line each word up with the n-1 words that follow it, keeping only phrases within one trial
    _grams = _tokens.select(
        [pl.col("word").shift(-k).alias(f"w{k}") for k in range(_n)]
        + [(pl.col("trial_id").shift(-(_n - 1)) == pl.col("trial_id")).alias("same_trial")]
    ).filter(pl.col("same_trial"))
    ngram_counts = (
        _grams.filter(pl.any_horizontal([pl.col(f"w{k}") == _word for k in range(_n)]))
        .select(pl.concat_str([pl.col(f"w{k}") for k in range(_n)], separator=" ").alias("ngram"))
        .group_by("ngram")
        .agg(pl.len().alias("count"))
        .sort("count", descending=True)
        .head(20)
    )

    (
        mo.md(f"*{_word}* does not occur in the sample.").callout(kind="warn")
        if ngram_counts.height == 0
        else mo.vstack(
            [
                mo.md(_note),
                alt.Chart(ngram_counts)
                .mark_bar()
                .encode(
                    x=alt.X("count:Q", title="Occurrences"),
                    y=alt.Y("ngram:N", sort="-x", title=None),
                    tooltip=["ngram", "count"],
                )
                .properties(height=alt.Step(16)),
            ]
        )
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ✏️ **Your turn.** Try `silver`, `public`, `house` (as trigrams), `knife`, `police`. Which
    phrases are formulas of the court (*dwelling house*, *value*) and which tell you about
    everyday life?

    ### Keyword in context

    A count tells you *how often*, not *how*. Always go back to the text. This shows every
    occurrence of a word or phrase with the words around it, a *concordance*.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    kwic_word = mo.ui.text(value="watchman", label="Word:")
    kwic_n = mo.ui.slider(start=10, stop=100, step=10, value=20, label="Examples", show_value=True)
    mo.hstack([kwic_word, kwic_n], justify="start", gap=2)
    return kwic_n, kwic_word


@app.cell(hide_code=True)
def _(kwic_n, kwic_word, mo, pl, random, re, trials):
    def concordance(word, n, width=60):
        pattern = re.compile(rf"\b{re.escape(word)}\b", re.IGNORECASE)
        hits = []
        for trial_id, year, text in trials.select("trial_id", "year", "text").iter_rows():
            for m in pattern.finditer(text):
                hits.append(
                    {
                        "year": year,
                        "left": text[max(0, m.start() - width) : m.start()].replace("\n", " "),
                        "word": m.group(0),
                        "right": text[m.end() : m.end() + width].replace("\n", " "),
                        "trial": trial_id,
                    }
                )
        total = len(hits)
        hits = sorted(random.Random(0).sample(hits, min(n, total)), key=lambda h: h["year"])
        return total, pl.DataFrame(hits, schema=["year", "left", "word", "right", "trial"])

    _w = kwic_word.value.strip()
    if not _w:
        _out = mo.md("Type a word above.")
    else:
        _total, _kwic = concordance(_w, kwic_n.value)
        _out = mo.vstack(
            [
                mo.md(f"**{_total:,}** occurrences of *{_w}*; showing {_kwic.height} at random, sorted by year."),
                mo.ui.table(_kwic, selection=None, page_size=kwic_n.value, show_column_summaries=False),
            ]
        )
    _out
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ---
    ## Part 3 · Association and distinctive words

    ### Collocations: the company a word keeps

    Which words appear **near** a word more often than you would expect by chance? For every
    occurrence of the word, we look at the words within a *window* on either side, and count them.
    Then we compare that with how often each word would turn up there **by chance**, given how
    common it is overall. The **MI score** (mutual information) is that comparison on a log scale:
    1 means twice as often as chance, 2 four times, 3 eight times.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    coll_word = mo.ui.text(value="gin", label="Word:")
    coll_period = mo.ui.radio(
        options={"All": "all", "1674–1799": "early", "1800–1913": "late"}, value="All", inline=True, label="Period:"
    )
    coll_window = mo.ui.slider(start=1, stop=10, value=5, label="Window (words either side)", show_value=True)
    coll_min = mo.ui.slider(start=2, stop=50, value=10, label="Minimum times together", show_value=True)
    coll_sort = mo.ui.radio(
        options={"strength (MI)": "MI", "how often together": "together"},
        value="strength (MI)",
        inline=True,
        label="Sort by:",
    )
    coll_stop = mo.ui.switch(value=True, label="Remove stopwords")
    mo.vstack(
        [
            mo.hstack([coll_word, coll_period], justify="start", gap=2),
            mo.hstack([coll_window, coll_min], justify="start", gap=2),
            mo.hstack([coll_sort, coll_stop], justify="start", gap=2),
        ]
    )
    return coll_min, coll_period, coll_sort, coll_stop, coll_window, coll_word


@app.cell
def _(STOPWORDS, coll_min, coll_period, coll_sort, coll_stop, coll_window, coll_word, mo, pl, stop_if_too_common, tokens_of_trials_with, trial_word_counts, trials):
    _word = coll_word.value.strip().lower()
    stop_if_too_common(_word)
    _years = {"all": None, "early": (1674, 1799), "late": (1800, 1913)}[coll_period.value]
    _w = coll_window.value
    _tokens, _note = tokens_of_trials_with(_word, _years)

    # every occurrence of the word, paired with each position in the window around it
    _hits = _tokens.filter(pl.col("word") == _word).select("trial_id", "position")
    _offsets = pl.DataFrame({"offset": [k for k in range(-_w, _w + 1) if k != 0]})
    _nearby = (
        _hits.join(_offsets, how="cross")
        .select("trial_id", (pl.col("position") + pl.col("offset")).alias("position"))
        .join(_tokens, on=["trial_id", "position"])  # same trial only
    )
    _together = _nearby.group_by("word").agg(pl.len().alias("together"))

    # how common each word is overall, in the same period
    _counts = trial_word_counts
    if _years:
        _counts = _counts.join(trials.filter(pl.col("year").is_between(*_years)).select("trial_id"), on="trial_id", how="semi")
    _freq = _counts.group_by("word").agg(pl.col("count").sum().alias("frequency"))
    _total = _freq["frequency"].sum()

    collocations = (
        _together.join(_freq, on="word")
        .filter((pl.col("together") >= coll_min.value) & (pl.col("word") != _word))
        .with_columns((_hits.height * pl.col("frequency") * 2 * _w / _total).alias("expected"))
        .with_columns(
            (pl.col("together") / pl.col("expected")).log(2).round(2).alias("MI"),
            pl.col("expected").round(1),
        )
    )
    if coll_stop.value:
        collocations = collocations.filter(~pl.col("word").is_in(list(STOPWORDS)))
    collocations = collocations.sort(coll_sort.value, descending=True).head(25)

    (
        mo.md(f"*{_word}* does not occur in this period of the sample.").callout(kind="warn")
        if _hits.height == 0
        else mo.vstack(
            [
                mo.md(f"{_note} The word occurs **{_hits.height:,}** times in them. Its collocates:"),
                mo.ui.table(
                    collocations.select("word", "together", "expected", "MI"),
                    selection=None,
                    page_size=25,
                    show_column_summaries=False,
                ),
            ]
        )
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ✏️ **Your turn.** Try `watch`, `knife`, `drunk`, `police`. Then compare `woman` in the two
    periods. Switch the sort order: words that are *often* nearby are usually just common words;
    the MI score finds the *specific* company. Lower the minimum to 2 and see why MI needs it:
    rare words get huge scores from one or two chance meetings.

    ### Comparing groups of trials

    The trials come with categories added by historians. We can ask: **which words are much more
    common in one group of trials than in another?** For every word we work out the **share of trials
    that mention it** in group A and in group B, and compare the two. The bars show how many times
    more often (on a log scale) trials in one group mention the word. Only words mentioned in at
    least 30 trials are included. Hover over a bar for the percentages.

    (Why trials, not word counts? A single very long trial that repeats a name 500 times would
    otherwise dominate the list.)
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    compare_by = mo.ui.dropdown(
        options={
            "Defendant's gender": "defendant_gender",
            "Offence": "offence",
            "Verdict": "verdict",
            "Punishment": "punishment",
        },
        value="Defendant's gender",
        label="Compare trials by",
    )
    compare_by
    return (compare_by,)


@app.cell(hide_code=True)
def _(compare_by, mo, trials):
    _values = (
        trials[compare_by.value].drop_nulls().value_counts().sort("count", descending=True)[compare_by.value].to_list()
    )
    group_a = mo.ui.dropdown(options=_values, value=_values[1], label="Group A")
    group_b = mo.ui.dropdown(options=_values, value=_values[0], label="Group B")
    mo.hstack([group_a, group_b], justify="start", gap=2)
    return group_a, group_b


@app.cell
def _(alt, compare_by, group_a, group_b, pl, trial_word_counts, trials):
    def trials_mentioning(group):
        n_trials = trials.filter(pl.col(compare_by.value) == group).height
        in_group = trials.filter(pl.col(compare_by.value) == group).select("trial_id")
        # each row of trial_word_counts is one trial mentioning one word
        counts = trial_word_counts.join(in_group, on="trial_id", how="semi").group_by("word").agg(pl.len().alias("n"))
        return counts, n_trials

    _a, _trials_a = trials_mentioning(group_a.value)
    _b, _trials_b = trials_mentioning(group_b.value)

    comparison = (
        _a.join(_b, on="word", how="full", coalesce=True, suffix="_b")
        .fill_null(0)
        .filter((pl.col("n") + pl.col("n_b")) >= 30)
        .with_columns(
            (pl.col("n") / _trials_a * 100).round(1).alias("pct_A"),
            (pl.col("n_b") / _trials_b * 100).round(1).alias("pct_B"),
            ((pl.col("n") + 1) / _trials_a / ((pl.col("n_b") + 1) / _trials_b)).log(2).round(2).alias("log2_ratio"),
        )
        .sort("log2_ratio")
    )
    _shown = pl.concat([comparison.head(15), comparison.tail(15)]).with_columns(
        pl.when(pl.col("log2_ratio") > 0)
        .then(pl.lit(f"more in {group_a.value}"))
        .otherwise(pl.lit(f"more in {group_b.value}"))
        .alias("group")
    )

    alt.Chart(_shown).mark_bar().encode(
        x=alt.X("log2_ratio:Q", title="← more in B · log2(share of A trials / share of B trials) · more in A →"),
        y=alt.Y("word:N", sort="x", title=None),
        color=alt.Color("group:N", title=None, legend=alt.Legend(orient="bottom")),
        tooltip=[
            "word",
            alt.Tooltip("pct_A", title=f"% of {group_a.value} trials"),
            alt.Tooltip("pct_B", title=f"% of {group_b.value} trials"),
            "log2_ratio",
        ],
    ).properties(height=alt.Step(14))
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **Questions:** Compare female and male defendants. Which words are *about the crime* and
    which are *about the people*? Then compare `guilty` with `notGuilty`, or `death` with
    `transport`. Use the concordance above to check a surprising word in context.

    ⚠️ "More common in trials of women" does not mean "women said this". Who speaks in a trial
    (victims, witnesses, lawyers, the court) and what the clerks wrote down all shape these
    results.
    """).callout(kind="neutral")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### TF-IDF: what is distinctive about one group? *(optional, if you have time)*

    TF-IDF compares one group with **all the others at once**. Treat every decade (or every
    offence) as one big "document". A word scores high if it is **frequent in this document**
    (*term frequency*) but **found in few of the other documents** (*inverse document frequency*).
    Words found in every document, like *the*, score zero. We only keep words that occur in at
    least five trials of the group, so that a single trial's names do not take over.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    tfidf_by = mo.ui.dropdown(options={"Decade": "decade", "Offence": "offence"}, value="Offence", label="One document per")
    tfidf_by
    return (tfidf_by,)


@app.cell
def _(pl, tfidf_by, trial_word_counts, trials):
    _doc = tfidf_by.value
    tfidf = (
        trial_word_counts.join(trials.filter(pl.col("offence") != "unknown").select("trial_id", _doc), on="trial_id")
        .group_by(_doc, "word")
        .agg(pl.col("count").sum(), pl.len().alias("n_trials"))
    )
    _n_docs = tfidf[_doc].n_unique()
    tfidf = tfidf.with_columns(
        (pl.col("count") / pl.col("count").sum().over(_doc) * 1000).alias("tf_per_1000_words"),
        pl.len().over("word").alias("documents_with_word"),
    ).with_columns(
        (pl.col("tf_per_1000_words") * (_n_docs / pl.col("documents_with_word")).log()).round(3).alias("tf_idf")
    )
    return (tfidf,)


@app.cell(hide_code=True)
def _(mo, tfidf, tfidf_by):
    _values = sorted(tfidf[tfidf_by.value].unique().to_list())
    tfidf_doc = mo.ui.dropdown(options={str(v): v for v in _values}, value=str(_values[0]), label="Show")
    tfidf_doc
    return (tfidf_doc,)


@app.cell
def _(alt, pl, tfidf, tfidf_by, tfidf_doc):
    _top = (
        tfidf.filter((pl.col(tfidf_by.value) == tfidf_doc.value) & (pl.col("n_trials") >= 5))
        .sort("tf_idf", descending=True)
        .head(20)
    )
    alt.Chart(_top).mark_bar().encode(
        x=alt.X("tf_idf:Q", title="TF-IDF"),
        y=alt.Y("word:N", sort="-x", title=None),
        tooltip=["word", "count", "n_trials", "documents_with_word", "tf_idf"],
    ).properties(height=alt.Step(16), title=f"Most distinctive words: {tfidf_doc.selected_key}")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ---
    ## Part 4 · Word embeddings (word2vec)

    Counting treats every word as separate: *watch* and *clock* are as unrelated as *watch* and
    *gin*. **Word embeddings** instead give each word a list of numbers (here, 100 numbers),
    learned from the contexts it appears in. Words used in similar contexts end up with similar
    numbers. (See last week's lecture for how word2vec does this.)

    We trained **two separate models** in advance on the full *Proceedings* (not just our
    sample), one on **1674–1799** and one on **1800–1913**, each on about 25 million words. That
    lets us ask how a word's company changed between the two periods.
    """)
    return


@app.cell
def _(np, pl, read_data):
    def load_model(period):
        df = read_data(f"vectors_{period}.parquet")
        words = df["word"].to_list()
        vectors = df.select(pl.col(r"^v\d+$")).to_numpy().astype(np.float32)
        return {"words": words, "vectors": vectors, "index": {w: i for i, w in enumerate(words)}}

    models = {period: load_model(period) for period in ["1674-1799", "1800-1913"]}
    return (models,)


@app.cell
def _(models):
    # This is what the computer "knows" about a word: 100 numbers. On their own they mean
    # nothing. Only comparisons between words are meaningful.
    _m = models["1800-1913"]
    _m["vectors"][_m["index"]["prisoner"]].round(2)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### How similar are two words?

    To compare two words, the model compares their lists of numbers. **Cosine similarity**
    measures whether the two lists "point in the same direction": 1 means identical, 0 means
    unrelated. Try `gin` and `beer`, `gin` and `watch`, `coach` and `cab`.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    sim_a = mo.ui.text(value="gin", label="Word 1:")
    sim_b = mo.ui.text(value="beer", label="Word 2:")
    mo.hstack([sim_a, sim_b], justify="start", gap=2)
    return sim_a, sim_b


@app.cell
def _(mo, models, sim_a, sim_b):
    def similarity(a, b, period):
        m = models[period]
        if a not in m["index"] or b not in m["index"]:
            return "not in model"
        return f"{float(m['vectors'][m['index'][a]] @ m['vectors'][m['index'][b]]):.2f}"

    _a, _b = sim_a.value.strip().lower(), sim_b.value.strip().lower()
    mo.md(
        f"Similarity of *{_a}* and *{_b}*: **{similarity(_a, _b, '1674-1799')}** in 1674–1799, "
        f"**{similarity(_a, _b, '1800-1913')}** in 1800–1913"
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### Nearest neighbours

    Which words have the most similar numbers to a given word? (Similarity runs from 1,
    identical, down through 0, unrelated.) Each model knows only the 20,000 most frequent words
    of its period.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    nn_word = mo.ui.text(value="constable", label="Word:")
    nn_word
    return (nn_word,)


@app.cell
def _(models, np, pl):
    def neighbours(word, period, n=12):
        m = models[period]
        if word not in m["index"]:
            return None
        similarity = m["vectors"] @ m["vectors"][m["index"][word]]
        best = np.argsort(-similarity)[1 : n + 1]
        return pl.DataFrame({"neighbour": [m["words"][i] for i in best], "similarity": similarity[best].astype(float).round(2)})

    return (neighbours,)


@app.cell(hide_code=True)
def _(mo, neighbours, nn_word):
    def _panel(period):
        _w = nn_word.value.strip().lower()
        _df = neighbours(_w, period)
        if _df is None:
            return mo.vstack([mo.md(f"**{period}**"), mo.md(f"*{_w}* is not in this model.").callout(kind="warn")])
        return mo.vstack(
            [mo.md(f"**{period}**"), mo.ui.table(_df, selection=None, page_size=12, show_column_summaries=False)]
        )

    mo.hstack([_panel("1674-1799"), _panel("1800-1913")], widths="equal", gap=2)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ✏️ **Your turn.** Try: `police`, `officer`, `station`, `coach`, `bank`, `note`,
    `servant`, `wife`, `watch`, `gin`. Where do the neighbours
    change between periods? Is that a change in **meaning**, in **what was stolen and by whom**,
    or in **how the trials were written**? Check with the concordance in Part 2.

    ### Analogies

    A famous party trick: *A is to B as C is to ?* The model computes B − A + C and looks for
    the nearest word. It often fails, and the failures are as revealing as the successes.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    an_a = mo.ui.text(value="man", label="")
    an_b = mo.ui.text(value="woman", label="")
    an_c = mo.ui.text(value="king", label="")
    an_period = mo.ui.radio(options=["1674-1799", "1800-1913"], value="1800-1913", inline=True)
    mo.hstack([an_a, mo.md("is to"), an_b, mo.md("as"), an_c, mo.md("is to ?"), an_period], justify="start", align="center")
    return an_a, an_b, an_c, an_period


@app.cell
def _(models, np, pl):
    def analogy(a, b, c, period, n=8):
        m = models[period]
        missing = [w for w in (a, b, c) if w not in m["index"]]
        if missing:
            return f"Not in the model: {', '.join(missing)}"
        v = m["vectors"]
        target = v[m["index"][b]] - v[m["index"][a]] + v[m["index"][c]]
        similarity = v @ (target / np.linalg.norm(target))
        best = [i for i in np.argsort(-similarity) if m["words"][i] not in (a, b, c)][:n]
        return pl.DataFrame({"answer": [m["words"][i] for i in best], "similarity": similarity[best].astype(float).round(2)})

    return (analogy,)


@app.cell(hide_code=True)
def _(an_a, an_b, an_c, an_period, analogy, mo):
    _res = analogy(an_a.value.strip().lower(), an_b.value.strip().lower(), an_c.value.strip().lower(), an_period.value)
    mo.md(_res).callout(kind="warn") if isinstance(_res, str) else mo.ui.table(
        _res, selection=None, show_column_summaries=False
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    Now try `man : woman :: husband : ?` in both periods (why might it fail?), `he : she :: his : ?`,
    or `shilling : shillings :: guinea : ?`.

    ### A map of words

    100 numbers per word cannot be drawn. But we can squash them down to 2 (using a technique
    called *principal component analysis*) and plot the words. Words close together had similar
    numbers. Edit the list, and switch between periods.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    map_words = mo.ui.text_area(
        value=(
            "shilling, sixpence, guinea, pound, crown, farthing, "
            "coat, waistcoat, handkerchief, shirt, stockings, hat, "
            "knife, pistol, sword, stick, "
            "constable, watchman, officer, beadle, "
            "gin, beer, brandy, rum"
        ),
        label="Words (separated by commas):",
        full_width=True,
        rows=3,
    )
    map_period = mo.ui.radio(options=["1674-1799", "1800-1913"], value="1674-1799", inline=True, label="Model:")
    mo.vstack([map_words, map_period])
    return map_period, map_words


@app.cell
def _(alt, map_period, map_words, models, np, pl):
    _m = models[map_period.value]
    _words = [w.strip().lower() for w in map_words.value.split(",") if w.strip()]
    _known = [w for w in _words if w in _m["index"]]
    _X = _m["vectors"][[_m["index"][w] for w in _known]]
    _X = _X - _X.mean(axis=0)
    _, _, _Vt = np.linalg.svd(_X, full_matrices=False)
    _xy = _X @ _Vt[:2].T
    word_map = pl.DataFrame({"word": _known, "x": _xy[:, 0], "y": _xy[:, 1]})

    _base = alt.Chart(word_map).encode(
        x=alt.X("x:Q", axis=None), y=alt.Y("y:Q", axis=None), tooltip=["word"]
    )
    _chart = (_base.mark_circle(size=60) + _base.mark_text(align="left", dx=6, fontSize=13).encode(text="word")).properties(
        width=650, height=450, title=f"Model {map_period.value}"
    )
    _missing = sorted(set(_words) - set(_known))
    _chart if not _missing else alt.vconcat(_chart, title=f"Not in the model: {', '.join(_missing)}")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ---
    ## Wrap-up

    In pairs, pick **one word** that interested you today. Write two or three sentences:

    1. What did **counting** show about it (over time, or between groups)?
    2. What did the **embeddings** show about it?
    3. What did you see when you **read it in context**, and what would you need to check before
       making a historical claim?

    **Going further**

    - [The Old Bailey Online](https://www.oldbaileyonline.org/): search and read the full *Proceedings*
    - [The Programming Historian](https://programminghistorian.org/en/lessons/): free tutorials, including word counting and word embeddings
    - [marimo](https://marimo.io): the notebook tool used here. You can install it on your own computer or use [molab](https://molab.marimo.io) in the browser.

    ---
    <small>Data: *The Proceedings of the Old Bailey, 1674–1913* (Old Bailey Online, Tim Hitchcock,
    Robert Shoemaker, Clive Emsley, Sharon Howard, Jamie McLaughlin et al.), via the
    [`biglam/old_bailey_proceedings`](https://huggingface.co/datasets/biglam/old_bailey_proceedings)
    dataset, CC BY-NC 4.0. Sample and word2vec models prepared for this lab.</small>
    """)
    return


if __name__ == "__main__":
    app.run()
