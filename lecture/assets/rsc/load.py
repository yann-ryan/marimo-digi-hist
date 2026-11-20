import csv, io, re, zipfile, html, sys
import polars as pl
RAW = "/Users/Yann/claude_code/marimo-lab/build/rsc_raw/"
OUT = sys.argv[1]
zm = zipfile.ZipFile(RAW + "Royal_Society_Corpus_open_v6.0.4_meta.tsv.zip")
meta = list(csv.DictReader(io.StringIO(zm.read(zm.namelist()[0]).decode("utf-8", "replace")), delimiter="\t", quoting=csv.QUOTE_NONE))
zt = zipfile.ZipFile(RAW + "Royal_Society_Corpus_open_v6.0.4_texts_txt.zip")
path = {re.search(r"_text_(.+)\.txt$", n).group(1): n for n in zt.namelist() if n.endswith(".txt")}
rows = []
for m in meta:
    if m["id"] not in path: continue
    raw = zt.read(path[m["id"]]).decode("utf-8", "replace")
    rows.append({"id": m["id"], "year": int(m["year"]), "type": m["type"], "jrnl": m["jrnl"], "topic": m["primaryTopic"], "title": html.unescape(m["title"]), "author": html.unescape(m["author"]), "text": html.unescape(raw)})
df = pl.DataFrame(rows)
df.write_parquet(OUT)
print(df.height, df["year"].min(), df["year"].max())
print(list(meta[0].keys()))
