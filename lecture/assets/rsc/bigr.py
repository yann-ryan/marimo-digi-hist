import polars as pl, re, collections, sys, json
df = pl.read_parquet(sys.argv[1])
W = re.compile(r"[a-z]+")
tg={"fire":"fire","fluid":"fluid","matter":"matter","current":"current","currents":"current","light":"light","telegraph":"telegraph","shock":"shock","shocks":"shock","machine":"machine","spark":"spark","sparks":"spark","organ":"organ","organs":"organ","fish":"fish","fishes":"fish","eel":"fish","lighting":"light","lamp":"light","lamps":"light","resistance":"resistance","field":"field","waves":"waves","charge":"charge","virtue":"virtue","effluvia":"effluvia"}
dec=lambda y: max(1700,(y//25)*25)
c=collections.defaultdict(collections.Counter); tot=collections.Counter()
for y,t in df.select("year","text").iter_rows():
    toks=W.findall(t.lower()); d=dec(y); tot[d]+=len(toks)
    for a,b in zip(toks,toks[1:]):
        if a in ("electric","electrical","electrick") and b in tg: c[d][tg[b]]+=1
keys=sorted(set(tg.values()))
out=[]
for d in sorted(tot):
    row={"period":f"{d}–{d+24}"}; row.update({k: round(c[d][k]/tot[d]*1e6,1) for k in keys}); out.append(row); print(row)
json.dump(out,open(sys.argv[2],"w"))
