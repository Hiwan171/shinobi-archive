"""Confere integridade dos originais e referências dos quadros usados na interface."""
import hashlib,json,pathlib,sys
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
m=json.loads((ROOT/'data/editorial/midias_jogos.json').read_text(encoding='utf-8'))
for row in m['arts']+m['sprites']:
    p=ROOT/row['file'];assert hashlib.sha256(p.read_bytes()).hexdigest()==row['sha256'],p
    with Image.open(p) as im:im.verify()
    if row in m['arts']:
        with Image.open(p) as im:assert im.convert('RGBA').getchannel('A').getextrema()==(0,255)
sprites={s['person']:s for s in m['sprites']};frames=0
payload=json.loads((ROOT/'powerbi/build/html/payload_preview.json').read_text(encoding='utf-8'))
links={tuple(r) for r in payload['techniques']['rows']}
for clip in m['clips']:
    assert (clip['person'],clip['technique']) in links
    assert clip['source']==sprites[clip['person']]['source']
for sprite in m['sprites']:
    boxes=sprite['idle']+[box for c in m['clips'] if c['person']==sprite['person'] for box in c['actor']+c['effects']]
    for x,y,w,h in boxes:
        assert x>=0 and y>=0 and w>0 and h>0 and x+w<=sprite['width'] and y+h<=sprite['height']
    frames+=len(boxes)
result={'originalFiles':len(m['arts'])+len(m['sprites']),'originalHashesUnchanged':True,'transparentArtFiles':len(m['arts']),
    'charactersWithOriginalArt':len({a['person'] for a in m['arts']}),'gameSpriteSheets':len(m['sprites']),
    'gameSequences':len(m['clips']),'charactersWithGameSequences':len({c['person'] for c in m['clips']}),
    'framesWithinOriginalSheetBounds':frames,'techniqueAssociationsVerified':True,'generatedOrRedrawnCharacters':0}
(ROOT/'powerbi/build/html/verificacao_midias.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
if __name__=='__main__':sys.stdout.reconfigure(encoding='utf-8');print(json.dumps(result))
