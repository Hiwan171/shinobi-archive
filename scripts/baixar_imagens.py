"""Baixa arquivos originais da AniList; não altera nem gera ilustrações."""
import concurrent.futures
import datetime as dt
import hashlib
import json
import pathlib
import subprocess
import urllib.parse
from PIL import Image
from coletar_fontes import ROOT, RAW

ASSETS = ROOT / 'assets'
MANIFEST = ASSETS / 'manifest.json'

def tasks():
    found = {}
    def add(kind, identifier, url, name):
        if not url or '/default.' in url:
            return
        key = (kind, identifier)
        found[key] = {'kind':kind,'source_id':identifier,'name':name,'url':url,'source':'AniList'}
    for path in sorted((RAW/'anilist').glob('*.json')):
        if path.name in ['manifest.json','_request.json']:
            continue
        data = json.loads(path.read_text(encoding='utf-8')).get('data',{})
        media = data.get('Media',{}) or {}
        for edge in media.get('characters',{}).get('edges',[]):
            node = edge['node']
            add('characters',node['id'],node.get('image',{}).get('large'),node['name']['full'])
        medias = data.get('Page',{}).get('media',[])
        if media.get('coverImage'):
            medias += [media]
        for node in medias:
            cover = node.get('coverImage') or {}
            add('covers',node['id'],cover.get('extraLarge') or cover.get('large'),node.get('title',{}).get('romaji',''))
            add('banners',node['id'],node.get('bannerImage'),node.get('title',{}).get('romaji',''))
    official=RAW/'narutop99'/'characters.json'
    if official.exists():
        base='https://narutop99.naruto-official.com'
        for char in json.loads(official.read_text(encoding='utf-8')):
            for kind,url in [('official_portraits',char.get('thumb')),
                             ('official_cards',char.get('l10n',{}).get('en',{}).get('image') or char.get('image'))]:
                if url:
                    found[(kind,int(char['id']))]={'kind':kind,'source_id':int(char['id']),
                        'name':char.get('name_en') or char['name'],'url':base+url,'source':'NARUTOP99'}
        found[('official_art',1)]={'kind':'official_art','source_id':1,'name':'Top 20 + Guy e Kurama — Masashi Kishimoto',
            'url':base+'/result/img/illustration-top20-en.jpg','source':'NARUTOP99'}
    return list(found.values())

def download(row):
    folder = ASSETS / row['kind']
    folder.mkdir(parents=True,exist_ok=True)
    ext = pathlib.PurePosixPath(urllib.parse.urlsplit(row['url']).path).suffix.lower()
    if ext not in ['.jpg','.jpeg','.png','.webp','.gif']:
        ext = '.img'
    prefix='narutop99' if row['source']=='NARUTOP99' else 'anilist'
    path = folder / f'{prefix}_{row["source_id"]}{ext}'
    result = None
    try:
        if not path.exists():
            result = subprocess.run(['curl.exe','--fail','-sS','-L','--connect-timeout','5','--max-time','20',
                                     '--retry','1','-o',str(path),row['url']],capture_output=True,text=True)
            if result.returncode:
                raise RuntimeError(result.stderr.strip())
        with Image.open(path) as img:
            width,height = img.size
            fmt = img.format
            alpha = 'A' in img.getbands() or 'transparency' in img.info
            img.verify()
        row.update({'status':'downloaded','file':path.relative_to(ROOT).as_posix(),'width':width,'height':height,
                    'format':fmt,'has_alpha_channel':alpha,'bytes':path.stat().st_size,
                    'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    except Exception as exc:
        if path.exists():
            path.unlink()
        row.update({'status':'failed','error':str(exc)})
    row['checked_at_utc'] = dt.datetime.now(dt.timezone.utc).isoformat()
    return row

def main():
    ASSETS.mkdir(exist_ok=True)
    items = tasks()
    rows = []
    print(f'Downloading {len(items)} original images',flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
        for i,row in enumerate(pool.map(download,items),1):
            rows.append(row)
            if i % 50 == 0:
                print(f'{i}/{len(items)}; successes={sum(x["status"]=="downloaded" for x in rows)}',flush=True)
                MANIFEST.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    MANIFEST.write_text(json.dumps(rows,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Done: {sum(x["status"]=="downloaded" for x in rows)} downloaded, {sum(x["status"]=="failed" for x in rows)} failed',flush=True)

if __name__ == '__main__':
    main()
