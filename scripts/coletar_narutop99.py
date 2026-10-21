"""Extrai os arrays JSON publicados pelo site oficial, sem executar JavaScript."""
import concurrent.futures
import datetime as dt
import hashlib
import json
import xml.etree.ElementTree as ET
from coletar_fontes import ROOT, RAW, curl

BASE='https://narutop99.naruto-official.com'
OUT=RAW/'narutop99'
OUT.mkdir(exist_ok=True)
REGIONS=['all','japan','asia','oceania','north-america','latin-america','europe','middle-east','africa']

def parse_array(path):
    source=path.read_text(encoding='utf-8-sig')
    # Os arquivos contêm somente um array JSON mais a declaração/exportação JS.
    payload,_=json.JSONDecoder().raw_decode(source[source.index('['):])
    return payload

def get(region):
    target=OUT/f'ranking_{region}.js'
    url=f'{BASE}/_ranking.{region}.gen.js'
    curl(url,target,25)
    payload=parse_array(target)
    (OUT/f'ranking_{region}.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
    return {'region':region,'url':url,'records':len(payload),'file':target.relative_to(ROOT).as_posix(),
            'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'retrieved_at_utc':dt.datetime.now(dt.timezone.utc).isoformat()}

def main():
    chars=OUT/'chars_gen.js'
    curl(BASE+'/_chars.gen.js',chars,25)
    characters=parse_array(chars)
    (OUT/'characters.json').write_text(json.dumps(characters,ensure_ascii=False,indent=2),encoding='utf-8')
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        manifest=list(pool.map(get,REGIONS))
    manifest.append({'url':BASE+'/_chars.gen.js','records':len(characters),'file':chars.relative_to(ROOT).as_posix(),
                     'sha256':hashlib.sha256(chars.read_bytes()).hexdigest(),'retrieved_at_utc':dt.datetime.now(dt.timezone.utc).isoformat()})
    html=OUT/'index.html'
    curl(BASE+'/en/',html,25)
    manifest.append({'url':BASE+'/en/','file':html.relative_to(ROOT).as_posix(),
                     'sha256':hashlib.sha256(html.read_bytes()).hexdigest(),'retrieved_at_utc':dt.datetime.now(dt.timezone.utc).isoformat()})
    symbol_dir=ROOT/'assets'/'symbols'
    symbol_dir.mkdir(parents=True,exist_ok=True)
    symbols=[]
    for slug in ['konoha','suna','kiri','kumo','iwa']:
        path=symbol_dir/(slug+'.svg')
        url=BASE+'/img/village-icon/'+slug+'-wh.svg'
        curl(url,path,20)
        ET.parse(path)
        symbols.append({'slug':slug,'url':url,'file':path.relative_to(ROOT).as_posix(),
            'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'source':'NARUTOP99',
            'retrieved_at_utc':dt.datetime.now(dt.timezone.utc).isoformat()})
    (symbol_dir/'manifest.json').write_text(json.dumps(symbols,ensure_ascii=False,indent=2),encoding='utf-8')
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'characters':len(characters),'regions':[(x.get('region'),x['records']) for x in manifest if x.get('region')],
                      'demographic_html_downloaded':html.exists(),'village_symbols':len(symbols)},indent=2),flush=True)

if __name__=='__main__':
    main()
