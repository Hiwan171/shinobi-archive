"""Confere os PNGs incorporados contra os arquivos originais, sem alterar pixels."""
import base64,hashlib,json,pathlib,re
ROOT=pathlib.Path(__file__).resolve().parents[1]
html=(ROOT/'powerbi/html-interface/preview.html').read_text(encoding='utf-8')
media=json.loads(re.search(r'const gameMedia = (.*?);\s*const mediaSprites',html,re.S)[1])
manifest=json.loads((ROOT/'data/editorial/midias_jogos.json').read_text(encoding='utf-8'))
expected={a['url']:a for a in manifest['arts']}
assert len(media['arts'])==len(expected)==105
embedded_arts=[art for art in media['arts'] if art.get('inline')]
assert len(embedded_arts)==8
for art in embedded_arts:
    original=expected[art['url']]
    embedded=base64.b64decode(art['inline'].split(',',1)[1],validate=True)
    assert hashlib.sha256(embedded).hexdigest()==original['sha256']
    assert embedded==(ROOT/original['file']).read_bytes()
    assert art['person']==original['person'] and art['phase']==original['phase']
proof={'embeddedOriginalPngFiles':len(embedded_arts),'allEmbeddedHashesMatchOriginals':True,'imagePixelsModified':False,'cachedCharacterIds':sorted({a['person'] for a in embedded_arts}),'otherArtVariantsRequireNetwork':True,'htmlBytes':len(html.encode('utf-8'))}
(ROOT/'powerbi/build/html/verificacao_artes_incorporadas.json').write_text(json.dumps(proof,indent=2),encoding='utf-8')
print(json.dumps(proof))
