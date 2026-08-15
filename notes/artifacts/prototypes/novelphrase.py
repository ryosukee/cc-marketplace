#!/usr/bin/env python3
"""Novel noun-phrase detection: noun phrases in OUTPUT absent from UPSTREAM.

Restricts candidates to phrases made only of nouns / suffixes / the particle の,
which is the agent-recommended filter to drop verb-paraphrase false positives.
"""
import re, sys, glob
from sudachipy import Dictionary, SplitMode

d = Dictionary().create()

def clean(t):
    t = re.sub(r"```.*?```", "", t, flags=re.S)
    t = re.sub(r"`[^`]*`", "", t)
    t = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", t)
    return re.sub(r"[A-Za-z0-9_./~${}@:+-]{2,}", " ", t)

NOUNISH = ("名詞", "接尾辞")

def phrases(text):
    """Maximal runs of nouns/suffixes optionally linked by の."""
    out = set()
    for sent in re.split(r"[。\n]", clean(text)):
        if not sent.strip():
            continue
        toks = d.tokenize(sent, SplitMode.C)
        run = []
        for m in toks:
            pos = m.part_of_speech()
            if pos[0] in NOUNISH:
                run.append(m.surface())
            elif m.surface() == "の" and pos[0] == "助詞" and run:
                run.append("の")
            else:
                _flush(run, out); run = []
        _flush(run, out)
    return out

def _flush(run, out):
    if not run:
        return
    while run and run[-1] == "の":
        run.pop()
    s = "".join(run)
    # need >=2 content morphemes and only kanji/kana
    if len(run) >= 2 and re.fullmatch(r"[一-鿿ぁ-んァ-ヶー]{3,}", s):
        out.add(s)

up_files = sys.argv[1:sys.argv.index("--")]
out_files = sys.argv[sys.argv.index("--") + 1:]
up = set()
for f in up_files:
    up |= phrases(open(f, encoding="utf8").read())
og = set()
for f in out_files:
    og |= phrases(open(f, encoding="utf8").read())
novel = sorted(og - up)
print(f"upstream phrases={len(up)}  output phrases={len(og)}  novel={len(novel)} ({100*len(novel)/max(len(og),1):.1f}%)")
for s in novel[:40]:
    print("  ", s)
