import polars as pl, re, collections, sys, json
df = pl.read_parquet(sys.argv[1])
W = re.compile(r"[a-z]+")
G = {
 "rubbing & attraction": "rubbed rubbing friction attract attraction attracts attracted repel repels repelled effluvia virtue amber wax".split(),
 "fluid & fire": "fluid fire aether ether".split(),
 "living bodies": "animal animals torpedo gymnotus eel fish fishes nerve nerves nervous muscle muscles muscular frog frogs paralytic patient patients cure cured disease shock shocks".split(),
 "other forces": "magnetism magnetic heat gravity".split(),
 "current & measurement": "current currents resistance conductivity volt volts ohm ohms potential units".split(),
 "machines & technology": "machine machines battery batteries dynamo dynamos telegraph telegraphs lamp lamps lighting cable cables engine engines motor motors tramways".split(),
}
inv={w:g for g,ws in G.items() for w in ws}
dec=lambda y: max(1700,(y//25)*25)
cnt=collections.defaultdict(collections.Counter); n=collections.Counter(); tot=collections.Counter()
for y,t in df.select("year","text").iter_rows():
    toks=W.findall(t.lower()); d=dec(y); tot[d]+=len(toks)
    for i,x in enumerate(toks):
        if x in ("electricity","electric","electrical"):
            n[d]+=1
            for c in toks[max(0,i-5):i]+toks[i+1:i+6]:
                if c in inv: cnt[d][inv[c]]+=1
out=[]
for d in sorted(n):
    row={"period":f"{d}–{d+24}","n":n[d],"per10k":round(n[d]/tot[d]*1e4,2)}; row.update({g: round(cnt[d][g]/n[d]*100,1) for g in G}); out.append(row); print(row)
json.dump(out,open(sys.argv[2],"w"))
