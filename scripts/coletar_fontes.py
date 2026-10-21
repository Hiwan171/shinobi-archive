"""Baixa snapshots públicos sem depender de bibliotecas externas."""
import concurrent.futures
import datetime as dt
import hashlib
import json
import pathlib
import subprocess
import time

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / 'data' / 'raw'
RAW.mkdir(parents=True, exist_ok=True)
COMMIT = 'a3871a6c931cd1f503af0bc16c80007c3a9ecda9'
BASE = f'https://raw.githubusercontent.com/viniciusschuelter/dattebayo-api/{COMMIT}/src/data'
COLLECTIONS = ['characters', 'clans', 'villages', 'teams', 'kekkei-genkai', 'tailed-beasts', 'akatsuki', 'kara']

def curl(url, path, timeout=60):
    result = subprocess.run(['curl.exe', '--fail', '--silent', '--show-error', '--location',
                             '--retry', '2', '--retry-delay', '1', '--max-time', str(timeout),
                             '--user-agent', 'NarutoBI-Research/1.0', '--output', str(path), url],
                            capture_output=True, text=True, encoding='utf-8', errors='replace')
    if result.returncode:
        raise RuntimeError(result.stderr.strip())
    return path

def download(collection):
    url = f'{BASE}/{collection}.json'
    path = RAW / f'{collection}.json'
    curl(url, path)
    payload = json.loads(path.read_text(encoding='utf-8-sig'))
    info = {'collection': collection, 'url': url, 'repository': 'https://github.com/viniciusschuelter/dattebayo-api',
            'commit': COMMIT, 'retrieved_at_utc': dt.datetime.now(dt.timezone.utc).isoformat(),
            'file': path.relative_to(ROOT).as_posix(), 'bytes': path.stat().st_size,
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'records': len(payload),
            'payload_type': type(payload).__name__}
    print(json.dumps(info, ensure_ascii=False), flush=True)
    return info

def main():
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        sources = list(pool.map(download, COLLECTIONS))
    curl('https://raw.githubusercontent.com/viniciusschuelter/dattebayo-api/' + COMMIT + '/README.md', RAW / 'dattebayo_README.md')
    live = RAW / 'characters_live_sample.json'
    try:
        curl('https://dattebayo-api.onrender.com/characters?page=1&limit=1', live, 30)
        sample = json.loads(live.read_text(encoding='utf-8'))
        print('Live total:', sample.get('total'), flush=True)
    except Exception as exc:
        print('Live API unavailable:', exc, flush=True)
    (RAW / 'manifest.json').write_text(json.dumps({'sources': sources}, ensure_ascii=False, indent=2), encoding='utf-8')

if __name__ == '__main__':
    main()
