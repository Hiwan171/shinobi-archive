"""Coleta metadados e elenco das três séries, respeitando o limite da API."""
import datetime as dt
import hashlib
import json
import pathlib
import subprocess
import time
from coletar_fontes import ROOT, RAW, curl

OUT = RAW / 'anilist'
OUT.mkdir(exist_ok=True)
MEDIA = [(20, 'Naruto'), (1735, 'Naruto Shippuden'), (97938, 'Boruto')]
CHAR_QUERY = '''query($id:Int!,$page:Int!){Media(id:$id,type:ANIME){id characters(page:$page,perPage:50,sort:ID){pageInfo{currentPage hasNextPage total} edges{role node{id name{full native alternative alternativeSpoiler} image{large medium} gender age dateOfBirth{year month day} bloodType favourites siteUrl} voiceActors{id name{full native} languageV2 image{large}}}}}}'''
MEDIA_QUERY = '''query($id:Int!){Media(id:$id,type:ANIME){id idMal siteUrl title{romaji english native} synonyms format status episodes duration season seasonYear averageScore meanScore popularity favourites source genres tags{id name category rank isMediaSpoiler isGeneralSpoiler} coverImage{extraLarge large medium color} bannerImage startDate{year month day} endDate{year month day} studios{edges{isMain node{id name siteUrl}}} relations{edges{relationType node{id idMal type format title{romaji english native} coverImage{large} siteUrl}}} rankings{id rank type allTime context year season} stats{scoreDistribution{score amount} statusDistribution{status amount}} externalLinks{site url type language} trailer{id site thumbnail}}}'''
SEARCH_QUERY = '''query($search:String!,$page:Int!){Page(page:$page,perPage:50){pageInfo{hasNextPage total} media(search:$search,type:ANIME,sort:ID){id idMal siteUrl title{romaji english native} format status episodes duration averageScore popularity favourites seasonYear startDate{year month day} endDate{year month day} coverImage{extraLarge large color} bannerImage genres studios{nodes{id name}}}}}'''

def query(query_text, variables, target):
    if target.exists():
        return json.loads(target.read_text(encoding='utf-8'))
    request = OUT / '_request.json'
    request.write_text(json.dumps({'query': query_text, 'variables': variables}), encoding='utf-8')
    for attempt in range(4):
        result = subprocess.run(['curl.exe','--fail','-sS','-L','--connect-timeout','8','--max-time','45',
                                 '-H','Content-Type: application/json','--data-binary','@'+str(request),
                                 'https://graphql.anilist.co','-o',str(target)],capture_output=True,text=True)
        if result.returncode == 0:
            payload = json.loads(target.read_text(encoding='utf-8'))
            if not payload.get('errors'):
                time.sleep(2.2)
                return payload
        if target.exists():
            target.unlink()
        time.sleep(15 if attempt < 2 else 30)
    raise RuntimeError(f'AniList failed: {variables} {result.stderr}')

def main():
    manifest = []
    for mid, name in MEDIA:
        meta_file = OUT / f'media_{mid}.json'
        query(MEDIA_QUERY, {'id':mid}, meta_file)
        page = 1
        while True:
            target = OUT / f'characters_{mid}_{page:02}.json'
            response = query(CHAR_QUERY, {'id':mid,'page':page}, target)
            connection = response['data']['Media']['characters']
            print(f'{name}: page {page}, {len(connection["edges"])} characters',flush=True)
            if not connection['pageInfo']['hasNextPage']:
                break
            page += 1
    for search in ['Naruto','Boruto']:
        page = 1
        while True:
            payload = query(SEARCH_QUERY, {'search':search,'page':page}, OUT / f'search_{search.lower()}_{page:02}.json')
            if not payload['data']['Page']['pageInfo']['hasNextPage']:
                break
            page += 1
    for path in sorted(OUT.glob('*.json')):
        if path.name.startswith('_'):
            continue
        manifest.append({'file':path.relative_to(ROOT).as_posix(),'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
                         'bytes':path.stat().st_size,'source':'https://graphql.anilist.co',
                         'retrieved_at_utc':dt.datetime.fromtimestamp(path.stat().st_mtime,dt.timezone.utc).isoformat()})
    (OUT / 'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')

if __name__ == '__main__':
    main()
