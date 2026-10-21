"""Baixa artes e folhas originais. Não transforma nem redesenha os arquivos."""
import concurrent.futures,datetime,hashlib,html,json,pathlib,re,subprocess,sys
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/'data/raw/media'
ART_BASE='https://naruto-game-sc.bn-ent.net/'
ART_SOURCE=ART_BASE+'character/'
ART_GAME='Naruto x Boruto: Ultimate Ninja Storm Connections'

def download(url,path):
    path.parent.mkdir(parents=True,exist_ok=True)
    if not path.exists():
        r=subprocess.run(['curl.exe','--fail','-sS','-L','--connect-timeout','6','--max-time','25','--retry','1',url,'-o',str(path)],capture_output=True,text=True)
        if r.returncode:raise RuntimeError(url+' '+r.stderr[:120])
    return path

def inspect(path):
    with Image.open(path) as im:
        rgba=im.convert('RGBA');alpha=rgba.getchannel('A').getextrema()
        result={'width':im.width,'height':im.height,'alphaRange':alpha,'background':rgba.getpixel((0,0))[:3]}
        im.verify() if im.fp else None
    return {**result,'file':path.relative_to(ROOT).as_posix(),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

def main():
    payload=json.loads((ROOT/'powerbi/build/html/payload_preview.json').read_text(encoding='utf-8'))
    profiles=payload['profiles'];profiles=[dict(zip(profiles['fields'],row)) for row in profiles['rows']]
    characters={row[0]:row[1] for row in payload['characters']['rows']}
    def norm(s):return re.sub(r'[\s・･]','',s or '')
    names={norm(p['native']):p['person'] for p in profiles if p['native'] and p['person']}
    overrides={'chara051':1063,'chara107':1066,'chara061':259,'chara062':259,'chara142':259,'chara143':259,'chara090':1303,'chara057':1303}
    roster=json.loads((RAW/'storm_roster.json').read_text(encoding='utf-8'));art=[]
    for entry in roster:
        code,label=entry['code'],entry['name'];base=re.split(r'[（(「]',label)[0]
        person=overrides.get(code) or names.get(norm(base))
        if not person:continue
        phase='Part I' if '少年' in label else 'Boruto' if 'BORUTO' in label else 'Blank Period' if 'THE LAST' in label else 'default' if '(' not in label and '「' not in label else None
        if phase is None:continue
        art.append({'person':person,'name':characters[person],'phase':phase,'code':code,'label':label,
            'url':ART_BASE+'images/character/detail/'+code+'/ill.png','source':ART_SOURCE+'detail.php?c='+code,
            'game':ART_GAME,'credit':'Bandai Namco Entertainment / CyberConnect2'})
    # Só uma variante por personagem/fase; versões especiais não substituem a arte base.
    unique={}
    for row in art:unique.setdefault((row['person'],row['phase']),row)
    art=list(unique.values())
    def art_task(row):
        path=download(row['url'],ROOT/'assets/game_art'/('storm_'+row['code']+'.png'))
        result={**row,**inspect(path)}
        assert result['alphaRange'][0]==0 and result['alphaRange'][1]==255,'Arte sem transparência: '+row['code']
        return result
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:art=list(pool.map(art_task,art))
    sources=[('sr','https://spritedatabase.net/game/1889','Naruto Shippūden: Shinobi Rumble',{'Naruto':1344,'Sasuke':1307,'Itachi':1293,'Kakashi':376,'Sakura':374,'Jiraiya':515,'Shikamaru':878}),
             ('nc4','https://spritedatabase.net/game/62','Naruto Shippūden: Ninja Council 4',{'Gaara':259,'Neji':444,'Might Guy':344,'Rock Lee':739})]
    sprite=[]
    for slug,source,game,members in sources:
        page=download(source,RAW/(slug+'_roster.html')).read_text(encoding='utf-8')
        entries=re.findall(r"<a href='file/(\d+)'[^>]*>(.*?)</a>",page,re.S)
        for identifier,title in entries:
            title=html.unescape(re.sub('<[^>]+>','',title)).removeprefix('▪').strip()
            if title not in members:continue
            detail_url='https://spritedatabase.net/file/'+identifier
            detail=download(detail_url,RAW/('sprite_'+identifier+'.html')).read_text(encoding='utf-8')
            matches=re.findall(r"(?:href|src)=['\"]([^'\"]*files/[^'\"]+\.png)['\"]",detail,re.I)
            assert matches,'Download PNG ausente: '+detail_url
            url=matches[0]
            if not url.startswith('https://'):url='https://spritedatabase.net/'+url.lstrip('/')
            path=download(url,ROOT/'assets/game_sprites'/(slug+'_'+identifier+'.png'))
            # Créditos do responsável pela folha são preservados ao lado da fonte.
            contributor=re.search(r'Contributed by:.*?contributor/\d+[^>]*>(.*?)</a>',detail,re.S)
            sprite.append({'person':members[title],'name':characters[members[title]],'game':game,'platform':'Nintendo DS','url':url,'source':detail_url,
                'credit':html.unescape(re.sub('<[^>]+>','',contributor.group(1))) if contributor else 'Sprite Database',**inspect(path)})
    manifest={'version':'4.0.0','collectedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'arts':art,'sprites':sprite,
        'note':'Arquivos originais preservados. Recorte de quadros e remoção da cor de fundo acontecem apenas na exibição HTML/SVG. Créditos e direitos permanecem com os titulares.'}
    (ROOT/'data/editorial/midias_jogos.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'artFiles':len(art),'charactersWithArt':len({r['person'] for r in art}),'spriteSheets':len(sprite),'spriteCharacters':[r['name'] for r in sprite]},ensure_ascii=False))

if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8');main()
