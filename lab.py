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
    5. **Check the pitfalls**: what a count can and cannot show

    ⚠️ *Content note: these are real criminal trials, including violence, sexual assault and
    infanticide, recorded in the language of their time.*

    You will not need to write much code. Most of the time you change a value (a slider, a box,
    a dropdown) and watch the results update.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **Start here: press ▶ Run all.** The button is at the bottom right of the screen. The first
    run takes a minute or two, because your browser has to download Python and the data. Wait
    until the cells have finished running (they stop being greyed out) before you begin.
    """).callout(kind="warn")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## Aims

    By the end of this lab you should be able to:

    - explain how a computer turns a text into countable "words", and why each choice in that
      process (lower-casing, stopwords) changes the results;
    - measure how often a word or phrase occurs over time, and say why the counts have to be
      relative (per 10,000 words) rather than raw;
    - use keyword-in-context to check what a count is really counting;
    - find the words that keep company with a word (collocations) and the words that are
      typical of one group of trials;
    - use word embeddings to explore what a word means in the *Proceedings*, and how that changes;
    - judge whether a result shows something that happened, a change in meaning, or a change in
      the source.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ## How this notebook works

    **Cells.** The notebook is made of *cells*. Some hold text, like this one. Others hold Python
    code and show their result (a table, a chart, a sentence) *above* the code. marimo is
    **reactive**: when you change something, every cell that depends on it re-runs by itself, so
    you never have to remember what to re-run.

    **Hiding the code.** Most of the code is already hidden. To hide all of it, so that the
    notebook looks like a simple app, click the **app view** button on the right of the screen
    (or press `Ctrl/Cmd + .`). Press it again to go back. App view is the easiest way to work
    through most of the lab, but you cannot edit code in it.

    **Two kinds of task.**

    - ✏️ **Your turn**: try something with the sliders, text boxes and dropdowns. You do not
      need to touch the code.
    - 🔧 **Edit the code**: at a few points the boxes are not enough, and you change the Python
      itself. Leave app view first. If the code is hidden, hover over the cell, open its **⋯**
      menu and choose **Show code**. Make the change, then press `Ctrl/Cmd + Enter` (or the ▶
      button of that cell) to run it. If you break something, `Ctrl/Cmd + Z` undoes it. There
      are three of these: the trial-length chart (Part 1), the tokenising cell and the stopword list (both Part 2).

    **Be patient.** Some cells take a few seconds to process, especially the word counts, the
    n-grams, the collocations and loading the embedding models. A cell that is still running is
    greyed out. Wait for it to finish rather than clicking again.

    **Your changes are not saved.** If you reload the page, the notebook goes back to the start.
    Copy anything you want to keep (words, numbers, screenshots) into your own notes.

    **Discussion.** There are three short 🗣️ **plenaries** in the lab. When you reach one, stop,
    compare what you found with your neighbours, and then we discuss it together as a class.
    """).callout(kind="info")
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
    🔧 **Edit the code.** The chart above shows the *median* (middle) length of a trial. Click
    into the code of the chart cell and change `.median()` to `.max()` to see the longest trial in
    each decade, or to `.mean()` for the average. Press `Ctrl/Cmd + Enter` to run it. Why are the
    mean and the median so different?
    """).callout(kind="neutral")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ---
    ## Part 2 · Frequency: how often?

    To count words, the computer first has to decide what a "word" is. Our rule is very simple:
    **lower-case everything, and treat every run of letters a–z as a word.** This is called
    *tokenisation*.

    🔧 **Edit the code.** The next cell has no boxes to fill in: change the sentence in the code
    itself and press `Ctrl/Cmd + Enter` to run it. (In app view you will only see the result, so
    switch back first.)
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
def _(mo):
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
    mo.md(f"🔧 *The stopword list ({len(STOPWORDS)} words) is in this cell. Show its code to edit it.*")
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
    document* this is, and about the crimes that came before the court? *prisoner* and *mr* tell
    us about the genre; *q* (Question in the transcripts) and *th* (what is left of *29th*) about
    how it was printed. Stopword lists are choices too: removing *she* and *her* would hide gender.

    🔧 **Edit the code.** The stopword list is in the hidden cell just above the switch (the one
    that says *The stopword list is in this cell*). Show its code (hover over it, open its **⋯**
    menu, choose **Show code**), delete `she her hers herself` from the list and run
    the cell. Switch *Remove stopwords* on: which words appear in the top list now? Leave the
    change in place and look again at the collocations in Part 3, which use the same list.

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
def _(alt, decade_totals, decade_word_counts, pl, re, trend_words, trials, trial_word_counts):
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
        _clean = trials.select("trial_id", "decade", pl.col("text").alias("t"))
        for _p in _phrases:
            # only the texts containing the phrase's first word can match
            _with = trial_word_counts.filter(pl.col("word") == _p.split()[0]).select("trial_id")
            _parts.append(
                _clean.join(_with, on="trial_id", how="semi")
                .select("decade", pl.col("t").str.to_lowercase().str.replace_all(r"[^a-z]+", " "))
                .group_by("decade")
                .agg(pl.col("t").str.count_matches(rf"\b{_p}\b").sum().cast(pl.Int64).alias("count"))
                .join(decade_totals.select("decade"), on="decade", how="right")
                .with_columns(pl.col("count").fill_null(0))
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
    `hanged, transported`; `watch house, public house`.


    For every line, ask the lecture's three questions. Did **something happen** (more watches to steal, a new police force from 1829)? Did the
    word's **meaning change** (*the watch* as night watchmen or as a timepiece)? Or did **the corpus change** (longer trials, a different printer, a different kind of case reported)? Only the first two are
    about the past.

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

    ### What comes next? A simple language model

    Count every phrase of a few words, and you can predict the next word: after *a quartern of*
    (a quarter pint, a measure for spirits) comes *gin* more often than anything else. This is the
    lecture's n-gram model. Words that follow the same phrase tend to be similar: here, spirits.
    Type one or more words; separate variants with commas to count them together.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    next_phrase = mo.ui.text(value="a quartern of", label="Words before:", full_width=True)
    next_split = mo.ui.dropdown(
        options={"Whole period": 0, "50-year periods": 50, "25-year periods": 25},
        value="Whole period",
        label="Split into",
    )
    next_show = mo.ui.radio(
        options={"share of what follows (%)": "share", "per million words": "per_million"},
        value="share of what follows (%)",
        inline=True,
        label="Show:",
    )
    mo.vstack([next_phrase, mo.hstack([next_split, next_show], justify="start", gap=2)])
    return next_phrase, next_show, next_split


@app.cell
def _(pl, trial_word_counts, trials):
    # words per text, worked out once, to turn counts into "per million words" later
    words_per_text = (
        trial_word_counts.group_by("trial_id").agg(pl.col("count").sum().alias("words")).join(trials.select("trial_id", "year"), on="trial_id")
    )
    return (words_per_text,)


@app.cell
def _(mo, next_phrase, pl, re, trials, trial_word_counts):
    # several variants can be given, separated by commas ("electric, electrical"): they are counted together
    _variants = [re.findall(r"[a-z]+", v.lower()) for v in next_phrase.value.split(",")]
    _variants = [v for v in _variants if v]
    mo.stop(not _variants, mo.md("Type one or more words above."))
    # only the texts that contain every word of a variant can match (much less text to search)
    _ids = pl.concat(
        [
            trial_word_counts.filter(pl.col("word").is_in(list(set(v))))
            .group_by("trial_id")
            .agg(pl.len().alias("n"))
            .filter(pl.col("n") == len(set(v)))
            .select("trial_id")
            for v in _variants
        ]
    ).unique()
    _pattern = r"\b(?:" + "|".join(" ".join(v) for v in _variants) + r") ([a-z]+)"
    next_found = (
        trials.join(_ids, on="trial_id", how="semi")
        .select("trial_id", "year", pl.col("text").str.to_lowercase().str.replace_all(r"[^a-z]+", " ").alias("t"))
        .select("trial_id", "year", pl.col("t").str.extract_all(_pattern).alias("m"))
        .explode("m")
        .drop_nulls("m")
        .select("trial_id", "year", pl.col("m").str.extract(r"([a-z]+)$", 1).alias("next_word"))
    )
    return (next_found,)


@app.cell
def _(mo, next_found, next_phrase, next_show, next_split, pl, words_per_text):
    mo.stop(next_found.height == 0, mo.md(f"*{next_phrase.value}* does not occur in the sample.").callout(kind="warn"))
    _step = next_split.value
    _start = (pl.col("year") // max(_step, 1)) * _step
    _period = (pl.lit("all years") if _step == 0 else pl.format("{}–{}", _start, _start + _step - 1)).alias("period")
    _words = words_per_text.group_by(_period).agg(pl.col("words").sum())
    _counts = next_found.group_by(_period, "next_word").agg(pl.len().alias("count"))
    _per_period = _counts.group_by("period").agg(pl.col("count").sum().alias("all_next"))
    _counts = (
        _counts.join(_per_period, on="period")
        .join(_words, on="period")
        .with_columns(
            (pl.col("count") / pl.col("all_next") * 100).round(1).alias("share"),
            (pl.col("count") / pl.col("words") * 1_000_000).round(1).alias("per_million"),
        )
    )
    _top = next_found.group_by("next_word").agg(pl.len().alias("times")).sort("times", descending=True).head(15)
    next_table = (
        _counts.join(_top, on="next_word")
        .pivot(on="period", index=["next_word", "times"], values=next_show.value, sort_columns=True)
        .fill_null(0)
        .sort("times", descending=True)
    )
    _what = "share of what follows (%)" if next_show.value == "share" else "occurrences per million words"
    mo.vstack(
        [
            mo.md(
                f"*{next_phrase.value}* occurs **{next_found.height:,}** times in the sample, followed by "
                f"{next_found['next_word'].n_unique():,} different words. The 15 most common, with their "
                f"{_what} in each period (*times* = number of occurrences in all periods):"
            ),
            mo.ui.table(next_table, selection=None, page_size=15, show_column_summaries=False),
        ]
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ✏️ **Your turn.** Compare `a quartern of` with `a pint of` (beer, ale, porter: the drinks
    sold by the pint). Then try `a pair of`, `a silver`, `the prisoner was`, `i saw the`.
    Predicting the next word is also how large language models such as ChatGPT are trained,
    with much longer contexts.

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
    ### 🗣️ Plenary 1 (about 5 minutes)

    You have counted words, followed them over time, and read them in context. Before the class
    discussion, show your neighbours **one trend line** you made (a word or a phrase per 10,000
    words) and say what you think it shows. Then look at it together:

    - Did something *happen* (more thefts of watches, a new police force)?
    - Did the *meaning* of the word change?
    - Or did the *source* change (longer trials, a different way of printing them)?

    What did keyword in context add that the chart could not show?

    *Got here early?* Try `a quartern of` and `a pint of` in *What comes next?*, and see if the drinks change over time.
    """).callout(kind="success")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ---
    ## Part 3 · Association: in what company?

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

    TF-IDF compares one "document" with **all the others at once**:

    **tf-idf = tf × log(N ÷ df)**

    - *tf* (term frequency): how often the word occurs in this document, per 1,000 words
    - *N*: the number of documents; *df* (document frequency): how many of them contain the word
    - log(N ÷ df) is zero for a word found in every document, like *the*, and larger the fewer
      documents contain it. (We use the natural logarithm; the base only changes the scale.)

    **What counts as a document is your choice**, and it decides which question TF-IDF answers.
    Here a document is all the trials of one offence (what is typical of killing, of deception?) or of one decade (what is new in the 1830s?). The left chart shows the most frequent
    words in the document, the right chart the words with the highest TF-IDF scores.
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
    _default = next((str(v) for v in _values if str(v) in ("kill", "1830")), str(_values[0]))
    tfidf_doc = mo.ui.dropdown(options={str(v): v for v in _values}, value=_default, label="Show")
    tfidf_min = mo.ui.slider(
        start=1, stop=20, value=1, label="Only words found in at least this many trials of the document", show_value=True
    )
    mo.hstack([tfidf_doc, tfidf_min], justify="start", gap=2)
    return tfidf_doc, tfidf_min


@app.cell
def _(alt, mo, pl, tfidf, tfidf_by, tfidf_doc, tfidf_min):
    _doc = tfidf.filter(pl.col(tfidf_by.value) == tfidf_doc.value)
    _raw = _doc.sort("count", descending=True).head(15)
    _top = _doc.filter(pl.col("n_trials") >= tfidf_min.value).sort("tf_idf", descending=True).head(15)
    _tip = ["word", "count", "n_trials", "documents_with_word", "tf_idf"]
    mo.hstack(
        [
            alt.Chart(_raw)
            .mark_bar(color="#9a9a9a")
            .encode(x=alt.X("count:Q", title="Occurrences"), y=alt.Y("word:N", sort="-x", title=None), tooltip=_tip)
            .properties(height=alt.Step(16), width=260, title="Most frequent words"),
            alt.Chart(_top)
            .mark_bar()
            .encode(x=alt.X("tf_idf:Q", title="TF-IDF"), y=alt.Y("word:N", sort="-x", title=None), tooltip=_tip)
            .properties(height=alt.Step(16), width=260, title="Highest TF-IDF"),
        ],
        justify="start",
        gap=2,
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ✏️ **Your turn.** The lecture showed the killing trials (`kill`): on the left only function words,
    the same as for every other offence; on the right *deceased*, *manslaughter*, *coroner*,
    *mortem*, but also surnames (*sellers*, *serne*) and a poison (*aconitine*) that come from one
    long trial each, and *deceas*, a fragment of *deceased*. Hover over a bar to see in how many
    trials a word occurs. Raise the minimum number of trials to 5: what disappears? Then try
    `deception` (cheques, bonds), `royalOffences` (mostly coining), or switch to decades.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### 🗣️ Plenary 2 (about 5 minutes)

    Pick **one collocation or one distinctive word** that surprised you: a word that keeps
    company with *watch* or *knife*, or a word that is typical of trials of women, or of trials
    ending in death. Explain it to your neighbours. Then ask:

    - Is it about the crimes themselves, or about how the court recorded them (*prisoner*,
      *prosecutor*, *q*)?
    - Would the result change with a different window, period or minimum count?
    - What is lost when we compare whole groups of trials rather than reading them?

    *Got here early?* Try the TF-IDF section, if you have not done so yet: compare the raw counts with the TF-IDF scores for killing trials.
    """).callout(kind="success")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ---
    ## Part 4 · Embeddings: what does a word mean? (word2vec)

    Counting treats every word as separate: *watch* and *clock* are as unrelated as *watch* and
    *gin*. **Word embeddings** instead give each word a list of numbers (here, 100 numbers),
    learned from the contexts it appears in. Words used in similar contexts end up with similar
    numbers. (See last week's lecture for how word2vec does this, and the counting example below.)

    We trained **two separate models** in advance on the full *Proceedings* (not just our
    sample), one on **1674–1799** and one on **1800–1913**, each on about 25 million words. That
    lets us ask how a word's company changed between the two periods.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### From counts to vectors

    The idea behind embeddings, done with plain counting (the lecture's example). For each word
    on the left, count how often each **context word** appears within 5 words of it, in every
    trial of the sample. Each row is then a list of numbers, the word's *company profile*: a
    **vector**. Words with similar rows are used in similar contexts.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    cooc_rows = mo.ui.text(value="gin, beer, pot, watch, handkerchief", label="Words (rows):", full_width=True)
    cooc_cols = mo.ui.text(value="drank, pint, pocket, stole", label="Context words (columns):", full_width=True)
    mo.vstack([cooc_rows, cooc_cols])
    return cooc_cols, cooc_rows


@app.cell
def _(cooc_cols, cooc_rows, mo, np, pl, trial_word_counts, trials):
    _rows = [w.strip().lower() for w in cooc_rows.value.split(",") if w.strip()][:8]
    _cols = [w.strip().lower() for w in cooc_cols.value.split(",") if w.strip()][:8]
    mo.stop(len(_rows) < 2 or not _cols, mo.md("Type at least two words and one context word.").callout(kind="warn"))
    # all the words, in order, of the trials that contain one of the row words; keep only the words we need
    _ids = trial_word_counts.filter(pl.col("word").is_in(_rows)).select("trial_id").unique()
    # (kept small for the browser: only the words we need, with their position in the trial)
    _keep = _rows + _cols
    _tokens = (
        trials.join(_ids, on="trial_id", how="semi")
        .lazy()
        .select("trial_id", pl.col("text").str.to_lowercase().str.extract_all(r"[a-z]+").alias("w"))
        .select(
            "trial_id",
            pl.col("w").list.eval(pl.element().filter(pl.element().is_in(_keep))).alias("word"),
            pl.col("w").list.eval(pl.arg_where(pl.element().is_in(_keep))).alias("position"),
        )
        .explode("word", "position")
        .drop_nulls("word")
        .with_columns(pl.col("position").cast(pl.Int64))
        .collect()
    )
    # pairs of a row word and a context word in the same trial, at most 5 words apart
    _pairs = (
        _tokens.filter(pl.col("word").is_in(_rows))
        .rename({"word": "row", "position": "p"})
        .join(_tokens.filter(pl.col("word").is_in(_cols)).rename({"word": "context", "position": "q"}), on="trial_id")
        .filter(((pl.col("p") - pl.col("q")).abs() <= 5) & (pl.col("p") != pl.col("q")))
        .group_by("row", "context")
        .agg(pl.len().alias("n"))
    )
    _n = {(r, c): n for r, c, n in _pairs.iter_rows()}
    cooc = np.array([[_n.get((r, c), 0) for c in _cols] for r in _rows], dtype=float)

    # cosine similarity: the angle between two rows, whatever their length
    _norm = np.linalg.norm(cooc, axis=1)
    _pairs_sim = [
        {"word 1": _rows[i], "word 2": _rows[j],
         "cosine": round(float(cooc[i] @ cooc[j] / (_norm[i] * _norm[j])), 2) if _norm[i] and _norm[j] else None}
        for i in range(len(_rows)) for j in range(i + 1, len(_rows))
    ]
    mo.hstack(
        [
            mo.vstack([mo.md("**Counts within 5 words**"), mo.ui.table(
                pl.DataFrame({"word": _rows, **{c: cooc[:, k].astype(int) for k, c in enumerate(_cols)}}),
                selection=None, show_column_summaries=False)]),
            mo.vstack([mo.md("**Cosine similarity of the rows**"), mo.ui.table(
                pl.DataFrame(_pairs_sim).sort("cosine", descending=True, nulls_last=True),
                selection=None, page_size=10, show_column_summaries=False)]),
        ],
        justify="start",
        gap=2,
    )
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    Gin and beer go with *drank* and *pint*; watch and handkerchief with *pocket* and *stole*. *Pot*
    is in between: a pewter pot was drunk from, and constantly stolen from alehouses. Beer's
    numbers are bigger than gin's only because beer is mentioned more often. **Cosine similarity**
    measures the angle between two rows, not their length, so it ignores that: 1 is the same
    direction, 0 a right angle.

    ✏️ **Your turn.** Add `brandy` or `coat` to the rows, or `fetch` and `silver` to the columns.
    How do the similarities change? A full table for the *Proceedings* would have 20,000 rows and
    20,000 columns. word2vec instead *learns* a short list of 100 numbers for each word, by
    predicting which words appear near each other.
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
    unrelated. Try `gin` and `beer`, `gin` and `pot`, `pot` and `watch`, `watch` and `handkerchief`
    (compare them with the counts above), then `coach` and `cab`.
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

    **What the models learn.** Look closely at `police`: before 1800 its neighbours are *office*,
    *rotation*, *bow* and *marlborough* (the Rotation Office and the Bow Street and Marlborough Street
    police offices, not a police force); after 1800 they include surnames (*helson*, *checkley*,
    *langrish*), probably officers who often gave evidence. Try `constable` (*maroney*), `murder`
    (*murther*) and `watchhouse` (*computer*: a misreading or variant of *Compter*, two London prisons).
    The models learn the *Proceedings* and the people who produced and digitised them.

    **Comparing periods.** The two models were trained separately, so their numbers cannot be
    compared directly: compare the *neighbour lists*. A word needs enough uses in both periods;
    with only a few dozen uses the neighbours are mostly noise.

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
    ### Semantic shift: which words moved?

    The two models were trained separately, so their numbers cannot be compared directly: the
    first of the 100 numbers in one model has nothing to do with the first number in the other.
    To compare them, we first **align** the two models. We rotate the earlier model so that the
    10,000 most frequent words known to both models line up as closely as possible with their
    positions in the later model. Most words keep roughly the same company, so they end up in
    roughly the same place. A word that is still far from its old position after the rotation has
    changed its company: a sign (no more) of a change in meaning. This is the method of Hamilton,
    Leskovec and Jurafsky, *Diachronic Word Embeddings Reveal Statistical Laws of Semantic
    Change* (2016).

    For one word you see its similarity to itself across the two periods (1 = no change), its
    neighbours in each period, and which later words now sit where the word used to be.
    """)
    return


@app.cell
def _(models, np):
    # Align the earlier model to the later one (orthogonal Procrustes), using the 10,000
    # most frequent words that both models know (the models list words by frequency).
    _early, _late = models["1674-1799"], models["1800-1913"]
    shared_words = [w for w in _early["words"] if w in _late["index"]][:10_000]
    _A = _early["vectors"][[_early["index"][w] for w in shared_words]]
    _B = _late["vectors"][[_late["index"][w] for w in shared_words]]
    _U, _, _Vt = np.linalg.svd(_A.T @ _B)
    early_aligned = _early["vectors"] @ (_U @ _Vt)
    # how similar each shared word is to itself in the other period (1 = no change)
    self_similarity = (early_aligned[[_early["index"][w] for w in shared_words]] * _B).sum(axis=1)
    return early_aligned, self_similarity, shared_words


@app.cell(hide_code=True)
def _(mo):
    shift_word = mo.ui.text(value="sovereign", label="Word:")
    shift_word
    return (shift_word,)


@app.cell(hide_code=True)
def _(early_aligned, mo, models, np, pl, self_similarity, shift_word):
    def _nearest(model, vector, word, n=10):
        _sim = model["vectors"] @ vector
        _best = [i for i in np.argsort(-_sim)[: n + 1] if model["words"][i] != word][:n]
        return pl.DataFrame({"word": [model["words"][i] for i in _best], "similarity": _sim[_best].astype(float).round(2)})

    _w = shift_word.value.strip().lower()
    _early, _late = models["1674-1799"], models["1800-1913"]
    if _w not in _early["index"] or _w not in _late["index"]:
        _out = mo.md(f"*{_w}* is not in both models. Try another word.").callout(kind="warn")
    else:
        _old = early_aligned[_early["index"][_w]]
        _self = float(_old @ _late["vectors"][_late["index"][_w]])
        _less = float((self_similarity > _self).mean() * 100)
        _table = lambda df: mo.ui.table(df, selection=None, page_size=10, show_column_summaries=False)
        _out = mo.vstack(
            [
                mo.md(
                    f"Similarity of *{_w}* in 1674–1799 to *{_w}* in 1800–1913: **{_self:.2f}**. "
                    f"{_less:.0f}% of the 10,000 most frequent shared words changed less."
                ),
                mo.hstack(
                    [
                        mo.vstack([mo.md("**Neighbours 1674–1799**"), _table(_nearest(_early, _early["vectors"][_early["index"][_w]], _w))]),
                        mo.vstack([mo.md("**Neighbours 1800–1913**"), _table(_nearest(_late, _late["vectors"][_late["index"][_w]], _w))]),
                        mo.vstack([mo.md("**1800–1913 words where it used to be**"), _table(_nearest(_late, _old, _w))]),
                    ],
                    widths="equal",
                    gap=1,
                ),
            ]
        )
    _out
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    **Which words moved most?** The table lists the words whose position changed most, among the
    most frequent words known to both models. Rare words move a lot by chance, so use the slider
    to include more or fewer words.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    shift_top = mo.ui.slider(start=1000, stop=10000, step=1000, value=5000, label="Only the most frequent", show_value=True)
    shift_top
    return (shift_top,)


@app.cell(hide_code=True)
def _(mo, models, np, pl, self_similarity, shared_words, shift_top):
    def _top5(model, word):
        _sim = model["vectors"] @ model["vectors"][model["index"][word]]
        return ", ".join(model["words"][i] for i in np.argsort(-_sim)[1:6])

    _order = np.argsort(self_similarity[: shift_top.value])[:25]
    most_moved = pl.DataFrame(
        {
            "word": [shared_words[i] for i in _order],
            "similarity": self_similarity[_order].astype(float).round(2),
            "neighbours 1674–1799": [_top5(models["1674-1799"], shared_words[i]) for i in _order],
            "neighbours 1800–1913": [_top5(models["1800-1913"], shared_words[i]) for i in _order],
        }
    )
    mo.ui.table(most_moved, selection=None, page_size=25, show_column_summaries=False)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ✏️ **Your turn.** Try `station` (before 1800 it hardly meant a police station), `cheque` (a checked
    cloth before it was a bank cheque), `jemmy` (a nickname, then a burglar's crowbar), `branch`,
    `geneva` (gin), `hanger` (a short sword), `police`, `awful`. Then look at the list of words that
    moved most: which of them changed meaning, and which only show that the *Proceedings*
    talk about different people, places and things?

    Watch out for names (*chater* or *lumley* are different people with the same surname in the two
    periods), single letters, and old spellings: they move because the source changed, not the language.
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ### 🗣️ Plenary 3 (about 5 minutes)

    Share **one word whose nearest neighbours differ** between the 1674–1799 and the 1800–1913
    models (or one analogy that worked, or failed badly). With your neighbours, discuss:

    - What has the model learned: the meaning of the word, or the situations in which the
      *Proceedings* use it?
    - Which neighbours would you not have found by counting alone?
    - What would you need to read to check what the model tells you?
    - In the list of words that moved most, which shifts are real changes of meaning, and
      which come from names, spelling or OCR?

    *Got here early?* Put ten words of your own on the map of words, and see which groups form.
    """).callout(kind="success")
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md(r"""
    ---
    ## Part 5 · Pitfalls: check before you claim

    Three checks from the lecture, using the tools above.

    1. **Read what a phrase means.** The lecture used *liberty from* and *liberty to* as a measure
       of two concepts of liberty (freedom from interference, freedom to act). Type `liberty to`
       into the keyword-in-context box in Part 2. How many examples are about freedom, and how
       many about permission (*liberty to go into the yard*)? What would a count of *liberty to*
       have measured?
    2. **The source changes.** Go back to the trial-length chart in Part 1, then plot `q` (for
       *Question* in the transcripts) in *Words over time*. Counting per 10,000 words corrects for
       the amount of text, not for the kind of text that was printed.
    3. **A peak needs reading.** Pick the highest point on one of your trend lines and read three
       of the trials behind it. (In the lecture, *asteroid* in American newspapers turned out to
       be a racehorse.)

    When you have a result, ask: did something happen, did the meaning change, or did the corpus
    change?
    """)
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
