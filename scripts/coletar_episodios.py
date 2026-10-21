"""Obtém snapshot licenciado de episódios e filtra a franquia na preparação."""
import concurrent.futures
import datetime as dt
import hashlib
import json
from coletar_fontes import ROOT, RAW, curl

COMMIT = 'a7b28ff590b70652843125b77b9a80f334d2c3ca'
REPO = 'https://github.com/animecannonhunter-hash/anime-filler-list-data'
BASE = f'https://raw.githubusercontent.com/animecannonhunter-hash/anime-filler-list-data/{COMMIT}'
OUT = RAW / 'episode_source'
OUT.mkdir(exist_ok=True)

def get(name):
    target = OUT / name
    curl(f'{BASE}/{name}',target,45)
    return {'file':target.relative_to(ROOT).as_posix(),'url':f'{BASE}/{name}','repository':REPO,'commit':COMMIT,
            'retrieved_at_utc':dt.datetime.now(dt.timezone.utc).isoformat(),
            'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'bytes':target.stat().st_size}

if __name__ == '__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        result = list(pool.map(get,['anime.json','characters.json','voice-actors.json','LICENSE','README.md']))
    (OUT/'manifest.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print('Episode source snapshot downloaded',flush=True)
