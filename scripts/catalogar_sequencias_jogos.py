"""Catalogação editorial dos quadros originais, sem gerar imagens derivadas."""
import json,pathlib,sys
from preparar_quadros_jogos import row_frames
ROOT=pathlib.Path(__file__).resolve().parents[1]
P=ROOT/'data/editorial/midias_jogos.json'
m=json.loads(P.read_text(encoding='utf-8'));assets={a['person']:a for a in m['sprites']}
payload=json.loads((ROOT/'powerbi/build/html/payload_preview.json').read_text(encoding='utf-8'))
jutsus={row[1]:row[0] for row in payload['jutsus']['rows']}
links={(row[0],row[1]) for row in payload['techniques']['rows']}
def frames(person,box,gap=4,columns=None):
    file=assets[person]['file']
    if columns:
        result=[]
        for a,b in zip(columns,columns[1:]):result+=row_frames(file,[a,box[1],b,box[3]],gap=gap,min_width=4)
        return result
    return row_frames(file,box,gap=gap,min_width=8)

# Faixas inspecionadas na folha; textos, retratos, molduras e créditos ficam fora dos quadros.
idle_specs={1344:[0,1030,280,1096],1293:[0,1078,290,1161],1307:[0,1182,345,1253],
 376:[0,3010,160,3090],374:[0,3275,145,3360],515:[0,4480,170,4580],878:[0,3310,130,3385],
 259:[0,70,320,140],344:[15,258,160,336],444:[0,340,335,410],739:[0,150,260,215]}
for person,box in idle_specs.items():
    assets[person]['idle']=frames(person,box)
    assert assets[person]['idle'],('Pose ausente',person)

clips=[]
def clip(person,technique,title,actor,fx=None,*,section='',fps=12,fx_position='hand',clones=False):
    if technique not in jutsus or (person,jutsus[technique]) not in links:
        print('Sem vínculo documentado, omitido:',person,technique);return
    assert actor,('Sem quadros',person,technique)
    a=assets[person]
    clips.append({'person':person,'technique':jutsus[technique],'name':title,'actor':actor,'effects':fx or [],
        'section':section,'fps':fps,'effectPosition':fx_position,'clones':clones,
        'source':a['source'],'game':a['game'],'credit':a['credit'],
        'presentation':'Sequência montada com quadros originais do jogo'})

naruto_prep=frames(1344,[0,2864,325,2934],columns=[0,82,162,242,325])
naruto_strike=frames(1344,[0,2943,400,3008],columns=[0,72,136,222,310,400])
naruto_orb=frames(1344,[438,2950,545,2990])
clip(1344,'Rasengan','Rasengan',naruto_prep*2+naruto_strike, naruto_orb,section='Special Move 1 (Weak): Rasengan')
clip(1344,'Shadow Clone Technique','Clones das Sombras',frames(1344,[0,3785,260,3860]),frames(1344,[40,3910,325,4018],columns=[40,135,230,325]),section='Special Move 3: Kage Bunshin no Jutsu',fx_position='body',clones=True)
clip(1344,'Wind Release: Rasenshuriken','Estilo Vento: Rasenshuriken',frames(1344,[0,4150,410,4224],columns=[0,105,205,305,410])+frames(1344,[195,4240,600,4300],columns=[195,265,360,455,540,600]),frames(1344,[0,4300,105,4360]),section='Special Move 4: Fuuton - Rasen Shuriken')
clip(1293,'Amaterasu','Amaterasu',frames(1293,[0,3937,115,4005]),frames(1293,[195,3955,610,4005],columns=[195,260,322,385,450,509,558,610]),section='Special Move 5: Mangekyou Sharingan - Amaterasu',fx_position='front')
clip(1293,'Tsukuyomi','Tsukuyomi',frames(1293,[0,3820,120,3893]),frames(1293,[144,3840,200,3895]),section='Special Move 4: Mangekyou Sharingan - Tsukuyomi',fx_position='front')
clip(1293,'Fire Release: Great Fireball Technique','Estilo Fogo: Grande Bola de Fogo',frames(1293,[0,3390,350,3478]),frames(1293,[40,3488,475,3535],columns=[40,105,175,250,325,400,475]),section='Special Move 1: Katon - Goukakyuu no Jutsu',fx_position='front')
clip(1307,'Chidori','Chidori',frames(1307,[0,3082,320,3159]),frames(1307,[366,3135,414,3160]),section='Special Move 2: Chidori')
clip(1307,'Fire Release: Great Fireball Technique','Estilo Fogo: Grande Bola de Fogo',frames(1307,[0,2910,350,2986]),frames(1307,[40,3000,475,3048],columns=[40,105,175,250,325,400,475]),section='Special Move 1: Katon - Goukakyuu no Jutsu',fx_position='front')
clip(376,'Lightning Cutter','Corte Relâmpago',frames(376,[0,3140,380,3237],columns=[0,60,123,190,258,380]),frames(376,[406,3158,575,3238],columns=[406,491,575]),section='Special Move 1: Raikiri (Right)')
clip(515,'Rasengan','Rasengan',frames(515,[0,4480,570,4580],columns=[0,90,170,235,345,455,570]),frames(515,[0,4600,310,4660],columns=[0,45,87,126,163,214,260,310]),section='Special Move 4: Rasengan')
clip(374,'Mystical Palm Technique','Técnica da Palma Mística',frames(374,[0,3275,600,3360]),frames(374,[100,3400,285,3436]),section='Special Move 3: Shousen no Jutsu',fx_position='body')
clip(374,'Cherry Blossom Impact','Impacto da Flor de Cerejeira',frames(374,[0,3510,440,3585],columns=[0,49,100,150,200,250,300,350,400,440]),frames(374,[5,3587,510,3637],columns=[5,120,230,350,510]),section='Special Move 4: Cherry Blossom Impact',fx_position='ground')
clip(878,'Shadow Sewing Technique','Costura das Sombras',frames(878,[0,3310,130,3385]),frames(878,[165,3300,500,3380],columns=[165,255,370,500]),section='Special Move 1: Ninpou - Kage Nui',fx_position='ground')
clip(344,'Morning Peacock','Pavão da Manhã',frames(344,[15,258,455,336])+frames(344,[20,389,475,478],columns=[20,120,220,320,420,475]),frames(344,[540,420,880,455]),section='Special Attack: Asakujaku',fx_position='front')
clip(444,'Gentle Fist','Punho Suave',frames(444,[0,930,1010,995],columns=[0,55,105,155,205,255,305,355,410,465,525,585,640,700,760,820,880,940,1010]),section='Y Combo: Gentle Fist')
clip(739,'Strong Fist','Punho Forte',frames(739,[0,245,320,306]),section='Y Combo: Strong Fist')
m['clips']=clips
m['curationNote']='Associações verificadas contra os vínculos personagem–técnica. Sem sequência específica, a interface mostra a pose do jogo e desativa a reprodução.'
P.write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8');print(json.dumps({'clips':len(clips),'characters':len({c['person'] for c in clips}),'frameCounts':[(c['person'],c['name'],len(c['actor']),len(c['effects'])) for c in clips]},ensure_ascii=False))
