#!/usr/bin/env python3
"""Build the V1 Japanese verb seed dataset from local source files.

Expected local files:
- pared_BCCWJ.csv
- edict2.txt
- kyoikukihongoi_2009B.csv
- rokusyutaisyo.csv
"""

from __future__ import annotations

import csv
import json
import re
from pathlib import Path
from typing import Dict, List, Tuple

import pandas as pd

BASE = Path(__file__).resolve().parents[1]
WORK = BASE.parent  # adjust if you store raw source files elsewhere


def kata_to_hira(s: str) -> str:
    out = []
    for ch in s:
        code = ord(ch)
        if 0x30A1 <= code <= 0x30F6:
            out.append(chr(code - 0x60))
        else:
            out.append(ch)
    return ''.join(out)


ANN_PAT = re.compile(r'\([^)]*\)')
KANJI_RE = re.compile(r'[\u4E00-\u9FFF々〆ヶ]')
HIRA_RE = re.compile(r'[\u3041-\u3096]')


def strip_ann(s: str) -> str:
    return ANN_PAT.sub('', s).strip()


def parse_head(head: str):
    if '[' in head and ']' in head:
        expr = head[:head.index('[')].strip()
        read = head[head.index('[')+1:head.rindex(']')].strip()
    else:
        expr = head
        read = ''

    exprs = [strip_ann(e) for e in expr.split(';') if strip_ann(e)]
    reads_raw = [r.strip() for r in read.split(';') if r.strip()]
    read_maps = []
    for r in reads_raw:
        m = re.match(r'^(.*?)(?:\(([^)]*)\))?$', r)
        if not m:
            continue
        rr = strip_ann(m.group(1))
        restr = [x.strip() for x in m.group(2).split(',')] if m.group(2) else []
        if rr:
            read_maps.append((rr, restr))

    pairs = []
    if exprs and read_maps:
        for rr, restr in read_maps:
            if restr:
                for e in exprs:
                    if e in restr:
                        pairs.append((e, rr))
            else:
                for e in exprs:
                    pairs.append((e, rr))
    elif exprs:
        for e in exprs:
            pairs.append((e, e))

    deduped = []
    seen = set()
    for pair in pairs:
        if pair not in seen:
            seen.add(pair)
            deduped.append(pair)

    return deduped, exprs


def parse_sense_prefix_tags(s: str):
    tags = []
    txt = s.strip()
    while True:
        m = re.match(r'^\(([^)]*)\)\s*', txt)
        if not m:
            break
        content = m.group(1)
        txt = txt[m.end():]
        parts = [p.strip() for p in content.split(',')]
        tags.extend([p for p in parts if p])
    return tags, txt


def parse_line(line: str):
    parts = line.strip().split('/')
    if len(parts) < 2:
        return None
    head = parts[0].strip()
    senses = [p for p in parts[1:] if p and not p.startswith('EntL')]
    pairs, exprs = parse_head(head)

    tags: List[str] = []
    glosses: List[str] = []
    for s in senses:
        t, rem = parse_sense_prefix_tags(s)
        tags.extend(t)
        if rem:
            glosses.append(rem.strip())

    return {
        'head': head,
        'pairs': pairs,
        'exprs': exprs,
        'tags': tags,
        'glosses': glosses,
        'common': '(P)' in head or any('(P)' in s for s in senses),
    }


def read_csv_loose(path: Path, encoding: str = 'cp932'):
    with open(path, 'r', encoding=encoding, errors='replace', newline='') as f:
        reader = csv.reader(f)
        header = next(reader)
        rows = []
        for row in reader:
            if len(row) < len(header):
                row = row + [''] * (len(header) - len(row))
            elif len(row) > len(header):
                row = row[:len(header)-1] + [','.join(row[len(header)-1:])]
            rows.append(row)
    return pd.DataFrame(rows, columns=header)


def clean_variant(v: str) -> str:
    v = v.strip().replace('△', '').replace('×', '').replace('＝', '')
    v = re.sub(r'（[^）]*）', '', v)
    v = re.sub(r'\([^)]*\)', '', v)
    return v.strip()


def explode_variants(field: str):
    if not field:
        return []
    parts = re.split(r'[・;,/]', field)
    out = []
    for p in parts:
        c = clean_variant(p)
        if c:
            out.append(c)
    deduped = []
    seen = set()
    for x in out:
        if x not in seen:
            seen.add(x)
            deduped.append(x)
    return deduped


def is_edu_verb_pos(pos: str) -> bool:
    markers = ['上一', '下一', '上二', '下二', '五', '四', 'カ変', 'サ変', 'ナ変', 'ラ変', 'トス']
    return any(m in pos for m in markers)


def build_edu_lookup(df: pd.DataFrame):
    by_form = {}
    by_reading = {}
    for _, row in df.iterrows():
        pos = str(row['品詞'])
        if not is_edu_verb_pos(pos):
            continue
        forms = explode_variants(str(row.get('表記', '')))
        reading = clean_variant(str(row.get('見出し', '')))
        rec = {'pos': pos, 'reading': reading, 'forms': forms}
        for form in forms:
            by_form.setdefault(form, []).append(rec)
        if reading:
            by_reading.setdefault(reading, []).append(rec)
    return by_form, by_reading


def has_kanji(s: str) -> bool:
    return bool(KANJI_RE.search(s))


def has_hira(s: str) -> bool:
    return bool(HIRA_RE.search(s))


def strip_to(gloss: str) -> str:
    return re.sub(r'^to\s+', '', gloss.strip())


def main() -> None:
    bcc = pd.read_csv(WORK / 'pared_BCCWJ.csv')
    bcc['reading_hira'] = bcc['kana'].map(kata_to_hira)
    bcc['rank_bccwj'] = bcc.index + 1

    pair_index: Dict[Tuple[str, str], List[dict]] = {}
    with open(WORK / 'edict2.txt', encoding='utf-8') as f:
        for line in f:
            rec = parse_line(line)
            if not rec:
                continue
            pos_tags = [t for t in rec['tags'] if t.startswith(('v1', 'v5', 'vk'))]
            if not pos_tags:
                continue
            if any(t.startswith(('vs', 'vz')) for t in rec['tags']):
                continue
            for surf, read in rec['pairs']:
                pair_index.setdefault((surf, kata_to_hira(read)), []).append(rec)

    kyo = read_csv_loose(WORK / 'kyoikukihongoi_2009B.csv')
    roku = read_csv_loose(WORK / 'rokusyutaisyo.csv')
    kyo_form, kyo_read = build_edu_lookup(kyo)
    roku_form, roku_read = build_edu_lookup(roku)

    rows = []
    for row in bcc.itertuples(index=False):
        key = (row.word, row.reading_hira)
        if key not in pair_index:
            continue
        if row.origin not in ['和', '漢', '混']:
            continue
        if not (has_kanji(row.word) and has_hira(row.word)):
            continue

        recs = pair_index[key]
        common = any(rec['common'] for rec in recs)
        in_kyo = bool(kyo_form.get(row.word) or kyo_read.get(row.reading_hira))
        in_roku = bool(roku_form.get(row.word) or roku_read.get(row.reading_hira))
        if not (common or in_kyo):
            continue

        rows.append({
            'orthography': row.word,
            'reading': row.reading_hira,
            'bccwjRank': int(row.rank_bccwj),
            'origin': row.origin,
            'edictCommon': common,
            'inKyoikuBasicVocab': in_kyo,
            'inRokusyuTaisyo': in_roku,
        })

    df = pd.DataFrame(rows).sort_values('bccwjRank').drop_duplicates(subset=['orthography'])
    df = df.head(1000)
    out = BASE / 'data' / 'top_1000_japanese_verbs_v1_rebuilt.csv'
    out.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(out, index=False, encoding='utf-8')
    print(f'Wrote {len(df)} rows to {out}')


if __name__ == '__main__':
    main()
