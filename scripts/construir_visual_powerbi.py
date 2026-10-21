"""Autor determinístico de seis páginas PBIR com visuais nativos."""
import copy,hashlib,json,pathlib,shutil,math

ROOT=pathlib.Path(__file__).resolve().parents[1]
PROJECT=ROOT/'powerbi/ShinobiArchive'
REPORT=PROJECT/'ShinobiArchive.Report'
DEF=REPORT/'definition'
PAGES=DEF/'pages'
RES=REPORT/'StaticResources/RegisteredResources'
RES.mkdir(exist_ok=True)
BG='#0D1117';RAIL='#090D13';SURFACE='#151D28';RAISED='#1C2735';BORDER='#293344'
TEXT='#F2F5F8';MUTED='#A8B4C2';ORANGE='#F47A24';BLUE='#4C93FF';GREEN='#50C28B'
VIS_SCHEMA='https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.9.0/schema.json'
PAGE_SCHEMA='https://developer.microsoft.com/json-schemas/fabric/item/report/definition/page/2.1.0/schema.json'
existing_visual=next(PAGES.glob('*/visuals/*/visual.json'),None)
existing_page=next(PAGES.glob('*/page.json'),None)
if existing_visual:VIS_SCHEMA=json.loads(existing_visual.read_text(encoding='utf-8-sig'))['$schema']
if existing_page:PAGE_SCHEMA=json.loads(existing_page.read_text(encoding='utf-8-sig'))['$schema']
PAGE_DEFS=[('arquivo','Arquivo Ninja','01','Conheça os personagens e explore o mundo shinobi.'),
           ('grupos','Clãs e Vilas','02','Os vínculos que desenham o universo de Naruto.'),
           ('jutsus','Jutsus','03','Técnicas documentadas e quem sabe utilizá-las.'),
           ('comparador','Comparador','04','Duas jornadas. Técnicas em comum. Características distintas.'),
           ('popularidade','Popularidade','05','Os votos dos fãs, em cada canto do mundo.'),
           ('episodios','Arcos e Episódios','06','Navegue pelas histórias de Naruto, Shippuden e Boruto.')]
PAGE_IDS={k:'shinobi_'+k for k,*_ in PAGE_DEFS}

def write(path,data):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')

def val(value):
    if isinstance(value,bool):s='true' if value else 'false'
    elif isinstance(value,(int,float)):s=str(value)+'D'
    else:s="'"+str(value).replace("'","''")+"'"
    return {'expr':{'Literal':{'Value':s}}}

def integer(value):return {'expr':{'Literal':{'Value':str(value)+'L'}}}
def color(value):return {'solid':{'color':val(value)}}
def col(table,field):return {'Column':{'Expression':{'SourceRef':{'Entity':table}},'Property':field}}
def mes(name):return {'Measure':{'Expression':{'SourceRef':{'Entity':'Indicadores'}},'Property':name}}
def projection(field):
    inner=field.get('Column') or field['Measure'];table=inner['Expression']['SourceRef']['Entity'];name=inner['Property']
    result={'field':field,'queryRef':table+'.'+name,'nativeQueryRef':name}
    friendly={('familia','parentesco_original'):'Vínculo',('familia','nome_relacionado_original'):'Personagem',
        ('personagem_natureza','nome_original'):'Natureza',('episodios','numero'):'Ep.',
        ('episodios','titulo_original'):'Título',('episodios','classificacao_pt'):'Tipo',
        ('personagens_narutop99','nome'):'Personagem',('jutsus','nome'):'Técnica'}
    if (table,name) in friendly:result['displayName']=friendly[(table,name)]
    return result

def props(values,selector=None):
    result={'properties':values}
    if selector:result['selector']={'id':selector}
    return result

def both(values,selector='default'):
    return [props(values),props(values,selector)]

def chrome(bg=None,pad=0):
    result={'background':[props({'show':val(bg is not None),'color':color(bg or BG),'transparency':val(0)})],
        'border':[props({'show':val(False)})],'title':[props({'show':val(False)})],
        'visualHeader':[props({'show':val(False)})],
        'padding':[props({x:val(pad) for x in ['top','bottom','left','right']})]}
    return result

class Page:
    def __init__(self,key,title,number,subtitle):
        self.key=key;self.pid=PAGE_IDS[key];self.folder=PAGES/self.pid;self.index=0
        self.page={'$schema':PAGE_SCHEMA,'name':self.pid,'displayName':title,'displayOption':'FitToPage',
            'height':900,'width':1600,'objects':{'background':[props({'color':color(BG),'transparency':val(0)})],
            'outspace':[props({'color':color(BG),'transparency':val(0)})]}}
        self.frame(title,number,subtitle)
    def add(self,kind,x,y,w,h,objects=None,query=None,vco=None,name=None,z=None):
        self.index+=1
        vid=hashlib.sha256((self.key+':'+(name or str(self.index))).encode()).hexdigest()[:20]
        visual={'visualType':kind,'visualContainerObjects':vco or chrome(),'drillFilterOtherVisuals':True}
        if objects:visual['objects']=objects
        if query:visual['query']=query
        data={'$schema':VIS_SCHEMA,'name':vid,'position':{'x':x,'y':y,'width':w,'height':h,
              'z':z if z is not None else self.index*1000,'tabOrder':self.index*1000},'visual':visual}
        write(self.folder/'visuals'/vid/'visual.json',data)
        return data
    def shape(self,x,y,w,h,fill=SURFACE,radius=12,line=None):
        return self.add('shape',x,y,w,h,{
            'shape':both({'tileShape':val('rectangleRoundedByPixel' if radius else 'rectangle'),
                          'rectangleRoundedCurve':integer(radius)}),
            'fill':both({'show':val(True),'fillColor':color(fill),'transparency':val(0)}),
            'outline':both({'show':val(line is not None),'lineColor':color(line or fill),'weight':val(1)})})
    def text(self,text,x,y,w,h=28,size=14,fg=TEXT,bold=False,align='left'):
        h=max(h,math.ceil(size*25/16))
        return self.add('textbox',x,y,w,h,{'general':[props({'paragraphs':[{'textRuns':[{'value':text,
            'textStyle':{'fontFamily':'Segoe UI Semibold' if bold else 'Segoe UI','fontSize':str(size)+'px','color':fg}}],
            'horizontalTextAlignment':align}]})]})
    def button(self,label,target,x,y,w=164,h=44,active=False):
        background='#2B2019' if active else RAIL
        objects={'shape':both({'tileShape':val('rectangleRounded'),'roundEdge':integer(8)}),
            'text':both({'show':val(True),'text':val(label),'fontSize':val(11),'fontFamily':val('Segoe UI Semibold'),
                         'fontColor':color(ORANGE if active else MUTED),'horizontalAlignment':val('left'),
                         'verticalAlignment':val('middle'),'leftMargin':integer(14)}),
            'fill':both({'show':val(True),'fillColor':color(background),'transparency':val(0)}),
            'outline':both({'show':val(False)})}
        objects['fill'].append(props({'fillColor':color(RAISED),'show':val(True)},'hover'))
        vco=chrome();vco['visualLink']=[props({'show':val(True),'type':val('PageNavigation'),
            'navigationSection':val(PAGE_IDS[target]),'tooltip':val('Abrir '+label)})]
        return self.add('actionButton',x,y,w,h,objects,vco=vco)
    def frame(self,title,number,subtitle):
        self.shape(0,0,196,900,RAIL,0)
        self.shape(195,0,1,900,BORDER,0)
        self.shape(24,35,44,44,ORANGE,10)
        self.text('忍',33,36,36,42,26,BG,True)
        self.text('SHINOBI',24,90,164,38,24,TEXT,True)
        self.text('A R C H I V E',25,136,164,26,12,MUTED)
        self.text('EXPLORAR',30,192,150,24,10,MUTED,True)
        for i,(key,label,*_) in enumerate(PAGE_DEFS):
            nav='Arcos / Episódios' if key=='episodios' else label
            self.button(nav,key,16,232+60*i,164,44,key==self.key)
            if key==self.key:self.shape(16,244+60*i,3,20,ORANGE,0)
        self.shape(24,766,148,1,BORDER,0)
        self.text('NARUTO UNIVERSE',24,790,150,24,10,MUTED,True)
        self.text('Dados reais.\nHistórias conectadas.',24,816,154,52,12,MUTED)
        self.text('DOSSIÊ  /  '+number,224,28,400,24,11,ORANGE,True)
        self.text(title.upper(),224,59,770,48,32,TEXT,True)
        self.text(subtitle,226,111,840,26,14,MUTED)
        self.shape(224,148,1344,1,BORDER,0)
        self.text('SHINOBI ARCHIVE  /  '+number,224,872,400,18,10,MUTED)
        self.text('Fontes: Dattebayo · AniList · NARUTOP99 · SkipTheFiller',900,872,666,18,10,MUTED,align='right')
    def card(self,measures,x,y,w,h=100,labels=True,size=None,fg=TEXT,bg=None):
        # Tamanho proporcional ao espaço vertical e ao papel do cartão.
        size=size or min(32,max(16,round(h*0.28)))
        o={'value':both({'show':val(True),'fontSize':val(size),'fontFamily':val('Segoe UI Semibold'),
                        'fontColor':color(fg),'horizontalAlignment':val('left'),'textWrap':val(True),
                        'labelDisplayUnits':val('1')}),
           'label':both({'show':val(labels),'fontSize':val(10),'fontColor':color(MUTED),
                         'position':val('belowValue'),'textWrap':val(True),'horizontalAlignment':val('left')}),
           'fillCustom':both({'show':val(bg is not None),'fillColor':color(bg or SURFACE),'transparency':val(0)}),
           'outline':both({'show':val(False)}),'shadowCustom':both({'show':val(False)}),
           'layout':both({'orientation':val(2),'rowCount':integer(1),'columnCount':integer(len(measures)),
                          'paddingUniform':integer(0),'cellPadding':integer(12)}),
           'padding':both({'paddingUniform':integer(6)}),
           'spacing':both({'verticalSpacing':val(4)}),
           'cardCalloutArea':[props({'backgroundTransparency':val(100),'paddingUniform':integer(4)})]}
        return self.add('cardVisual',x,y,w,h,o,{'queryState':{'Data':{'projections':[projection(mes(m)) for m in measures]}}})
    def image(self,measure,x,y,w,h,fit='Fit'):
        return self.add('image',x,y,w,h,{'image':[props({'sourceType':val('imageData'),
            'sourceField':{'expr':mes(measure)},'fit':val(fit),'cornerRadius':integer(10),
            'altText':val('Imagem do personagem selecionado')})]})
    def selection(self,table,field,value):
        literal=val(value)['expr']
        expr={'Column':{'Expression':{'SourceRef':{'Source':'s'}},'Property':field}}
        return {'filter':{'Version':2,'From':[{'Name':'s','Entity':table,'Type':0}],
            'Where':[{'Condition':{'In':{'Expressions':[expr],'Values':[[literal]]}}}]}}
    def slicer(self,table,field,x,y,w,h=80,title=None,selected=None,mode='Dropdown'):
        objects={'data':[props({'mode':val(mode)})],
            'header':[props({'show':val(True),'text':val(title or field),'fontColor':color(MUTED),'textSize':val(10)})],
            'items':[props({'fontColor':color(TEXT),'background':color(RAISED),'textSize':val(12),'padding':val(4)})],
            'selection':[props({'singleSelect':val(True),'selectAllCheckboxEnabled':val(False)})]}
        if selected is not None:objects['general']=[props({'filter':self.selection(table,field,selected)})]
        return self.add('slicer',x,y,w,h,objects,{'queryState':{'Values':{'projections':[projection(col(table,field))]}}},chrome(SURFACE,8))
    def gallery(self):
        objects={'layout':[props({'orientation':val(0),'columnCount':integer(3),'rowCount':integer(4),
            'autoGrid':val(False),'showFixedSize':val(True),'fixedWidth':integer(88),'fixedHeight':integer(124),
            'cellPadding':integer(8),'maxTiles':integer(2000),'style':val('Cards')})],
            'selection':[props({'singleSelect':val(True),'strictSingleSelect':val(False)})],
            'value':both({'show':val(True),'fontSize':val(8),'fontColor':color(TEXT),'textWrap':val(True),
                           'horizontalAlignment':val('center')}),
            'fillCustom':both({'show':val(True),'fillColor':color(RAISED),'transparency':val(0)}),
            'outline':both({'show':val(False),'lineColor':color(BORDER),'weight':val(1)}),
            'shapeCustomRectangle':[props({'tileShape':val('rectangleRounded'),'rectangleRoundedCurve':integer(8)})],
            'image':[props({'show':val(True),'sourceType':val('imageData'),
                'position':val('Top'),'imageFit':val('Fill'),'imageAreaSize':integer(76),'ignorePadding':val(True)})],
            'general':[props({'filter':self.selection('personagens','nome','Naruto Uzumaki')})]}
        objects['fillCustom'].append(props({'show':val(True),'fillColor':color('#3D2A1C')},'selected'))
        objects['outline'].append(props({'show':val(True),'lineColor':color(ORANGE),'weight':val(2)},'selected'))
        objects['image'].append({'selector':{'id':'default','data':[{'dataViewWildcard':{'matchingOption':1}}]},
            'properties':{'image':{'expr':mes('Retrato no catálogo')}}})
        query={'queryState':{'Values':{'projections':[projection(col('personagens','nome'))]},
            'Tooltips':{'projections':[projection(mes('Votos da ficha')),projection(mes('Retrato no catálogo'))]}},
            'sortDefinition':{'sort':[{'field':mes('Votos da ficha'),'direction':'Descending'}],'isDefaultSort':False}}
        return self.add('advancedSlicerVisual',236,302,288,526,objects,query)
    def table(self,fields,x,y,w,h,measures=None,sort=None,fg=TEXT,bg=SURFACE):
        kind='pivotTable' if measures else 'tableEx'
        q={'queryState':{}}
        if measures:
            q['queryState']['Rows']={'projections':[projection(col(t,c)) for t,c in fields]}
            q['queryState']['Values']={'projections':[projection(mes(m)) for m in measures]}
        else:q['queryState']['Values']={'projections':[projection(col(t,c)) for t,c in fields]}
        if sort:q['sortDefinition']={'sort':[{'field':mes(sort),'direction':'Descending'}],'isDefaultSort':True}
        o={'grid':[props({'gridHorizontal':val(True),'gridHorizontalColor':color(BORDER),
              'gridVertical':val(False),'rowPadding':val(7),'textSize':val(11)})],
            'values':[props({'fontColor':color(fg),'backColorPrimary':color(bg),'backColorSecondary':color(bg),
                            'fontSize':val(11),'fontFamily':val('Segoe UI')})],
            'columnHeaders':[props({'fontColor':color(MUTED),'backColor':color(bg),'fontSize':val(10),
                'bold':val(True),'columnAdjustment':val('growToFit'),'autoSizeColumnWidth':val(True),'wordWrap':val(True)})]}
        if measures:o['rowHeaders']=[props({'fontColor':color(fg),'backColor':color(bg),'fontSize':val(11)})]
        else:o['total']=[props({'totals':val(False)})]
        vco=chrome(bg,8);vco['stylePreset']=[props({'name':val('None')})]
        return self.add(kind,x,y,w,h,o,q,vco)
    def bar(self,table,field,measure,x,y,w,h,accent=ORANGE,kind='barChart',series=None):
        state={'Category':{'projections':[projection(col(table,field))]},'Y':{'projections':[projection(mes(measure))]}}
        if series:state['Series']={'projections':[projection(col(*series))]}
        objects={'categoryAxis':[props({'show':val(True),'showAxisTitle':val(False),'labelColor':color(TEXT),
                'fontSize':val(11),'preferredCategoryWidth':val(36),'innerPadding':integer(24)})],
            'valueAxis':[props({'show':val(True),'showAxisTitle':val(False),'labelColor':color(MUTED),'fontSize':val(10),
                 'gridlineShow':val(True),'gridlineColor':color(BORDER),'gridlineStyle':val('dotted')})],
            'labels':[props({'show':val(True),'color':color(TEXT),'fontSize':val(10)})]}
        if not series:objects['dataPoint']=[props({'defaultColor':color(accent)})]
        query={'queryState':state,'sortDefinition':{'sort':[{'field':mes(measure),'direction':'Descending'}],'isDefaultSort':True}}
        return self.add(kind,x,y,w,h,objects,query,chrome(SURFACE,12))
    def heading(self,title,x,y,w):self.text(title,x,y,w,30,14,TEXT,True)
    def finish(self):write(self.folder/'page.json',self.page)

def arquivo(p):
    p.card(['Catálogo completo','Clãs','Vilas'],1080,34,488,88,size=26)
    p.shape(224,168,312,682)
    p.text('CATÁLOGO DE PERSONAGENS',244,188,272,26,12,MUTED,True)
    p.slicer('personagens','nome',236,216,288,80,'Buscar personagem',None)
    p.gallery()
    p.shape(560,168,488,682)
    p.text('ARQUIVO DO SHINOBI',580,188,448,24,11,ORANGE,True)
    p.card(['Nome da ficha'],576,222,456,66,False,27)
    p.image('Retrato da ficha',580,306,184,252,'Fill')
    p.text('CLÃ',788,310,240,22,10,MUTED,True)
    p.card(['Clã da ficha'],782,332,246,46,False,17)
    p.text('VILA / AFILIAÇÃO',788,394,240,22,10,MUTED,True)
    p.card(['Vila da ficha'],782,418,246,46,False,16)
    p.text('CLASSIFICAÇÃO',788,480,240,22,10,MUTED,True)
    p.card(['Classificação da ficha'],782,502,246,54,False,13)
    p.shape(580,582,448,1,BORDER,0)
    p.card(['Técnicas da ficha','Naturezas da ficha','Votos da ficha'],576,594,456,82,True,22)
    p.text('UM FRAGMENTO DA HISTÓRIA',580,692,448,22,10,MUTED,True)
    p.image('Card da ficha',580,722,448,108,'Fit')
    p.shape(1072,168,496,682)
    p.text('DADOS DO SHINOBI',1092,188,456,26,12,MUTED,True)
    p.slicer('Fases','fase',1084,216,472,80,'Contexto / fase','Shippuden')
    p.card(['Idade da ficha','Altura da ficha'],1088,310,464,84,True,20)
    p.card(['Peso da ficha','Patente da ficha'],1088,410,464,84,True,20)
    p.text('NATUREZAS DE CHAKRA',1092,520,456,26,12,ORANGE,True)
    p.table([('personagem_natureza','nome_original')],1088,554,464,142)
    p.text('LAÇOS DE FAMÍLIA',1092,716,456,26,12,MUTED,True)
    p.table([('familia','parentesco_original'),('familia','nome_relacionado_original')],1088,750,464,84)

def grupos(p):
    p.card(['Clãs','Vilas','Equipes'],1036,34,532,88,size=26)
    p.slicer('personagens','vila_principal',224,172,330,80,'Filtrar origem')
    p.shape(224,280,644,570);p.heading('CLÃS · MEMBROS DOCUMENTADOS',248,304,590)
    p.bar('clas','nome','Membros do clã',240,350,612,478)
    p.shape(892,280,676,570);p.heading('VILAS · PERSONAGENS ASSOCIADOS',916,304,620)
    p.bar('vilas','nome','Membros da vila',908,350,644,478,BLUE)
    p.text('Explore os grupos e filtre a origem. Uma pessoa pode ter mais de uma afiliação.',592,190,970,54,14,MUTED)

def jutsus(p):
    p.card(['Jutsus','Personagens'],1180,34,388,88,size=26)
    p.slicer('jutsus','nome',224,172,650,80,'Buscar uma técnica')
    p.shape(224,280,760,570);p.heading('TÉCNICAS E SEUS USUÁRIOS',248,304,700)
    p.table([('jutsus','nome')],240,348,728,480,['Usuários da técnica'],'Usuários da técnica')
    p.shape(1008,280,560,570);p.heading('NATUREZAS DE CHAKRA',1032,304,500)
    p.bar('naturezas','nome_pt','Usuários da natureza',1024,350,528,414,BLUE)
    p.text('Contagens representam registros da base, sem atribuir força ou nível de poder às técnicas.',1032,786,504,44,12,MUTED)

def comparador(p):
    p.slicer('ComparadorA','nome',224,172,600,80,'Escolher personagem A','Naruto Uzumaki')
    p.slicer('ComparadorB','nome',848,172,720,80,'Escolher personagem B','Sasuke Uchiha')
    for slot,x,accent in [('A',224,ORANGE),('B',848,BLUE)]:
        p.shape(x,280,720 if slot=='B' else 600,570)
        width=720 if slot=='B' else 600
        p.shape(x+24,305,36,3,accent,0)
        p.card(['Nome '+slot],x+18,326,width-36,74,False,28,accent)
        p.image('Retrato '+slot,x+24,430,208,312,'Fill')
        p.text('TÉCNICAS\nDOCUMENTADAS',x+264,448,width-288,48,12,MUTED,True)
        p.card(['Técnicas '+slot],x+258,504,width-282,82,False,40,accent)
        p.text('NATUREZAS DE CHAKRA',x+264,624,width-288,32,12,MUTED,True)
        p.card(['Naturezas '+slot],x+258,664,width-282,82,False,38,accent)
    p.shape(620,744,480,92,RAISED,12,BORDER)
    p.card(['Técnicas em comum'],632,750,456,80,True,28,TEXT)

def popularidade(p):
    p.card(['Votos do recorte','Participantes'],1036,34,532,88,size=26)
    p.slicer('Regioes','nome',224,172,360,80,'Região da votação','Global')
    p.text('NARUTOP99 · VOTAÇÃO OFICIAL',616,182,900,30,15,ORANGE,True)
    p.text('17 dez 2022 — 31 jan 2023 · resultado publicado em 2023',616,218,900,28,13,MUTED)
    p.shape(224,280,880,570);p.heading('OS PERSONAGENS MAIS VOTADOS',248,304,820)
    p.bar('personagens_narutop99','nome','Votos do recorte',240,350,848,480)
    p.shape(1128,280,440,570);p.heading('DETALHES DO RANKING',1152,304,390)
    p.table([('personagens_narutop99','nome')],1144,350,408,400,['Votos do recorte'],'Votos do recorte')
    p.text('Popularidade histórica dos fãs.\nOs votos globais já incluem as oito regiões.',1152,776,384,50,12,MUTED)

def episodios(p):
    p.card(['Episódios','Arcos','Percentual filler'],1036,34,532,88,size=26)
    p.slicer('Series','nome',224,172,330,80,'Selecionar série','Naruto')
    p.slicer('arcos','nome',578,172,650,80,'Explorar um arco')
    p.shape(224,280,1344,248);p.heading('A COMPOSIÇÃO DOS EPISÓDIOS',248,304,1288)
    p.bar('episodios','classificacao_pt','Episódios',240,350,1312,160,GREEN)
    p.shape(224,552,1344,298);p.heading('GUIA DE EPISÓDIOS',248,576,1288)
    p.table([('episodios','numero'),('episodios','titulo_original'),('episodios','classificacao_pt')],240,620,1312,208)

def main():
    # O scaffold vazio é substituído somente nos arquivos que este gerador possui.
    old=json.loads((PAGES/'pages.json').read_text(encoding='utf-8'))
    for oldid in old.get('pageOrder',[]):
        if oldid not in PAGE_IDS.values():
            path=PAGES/oldid
            if path.exists() and path.resolve().is_relative_to(PAGES.resolve()):shutil.rmtree(path)
    for key,*_ in PAGE_DEFS:
        visuals=PAGES/PAGE_IDS[key]/'visuals'
        if visuals.exists():
            if not visuals.resolve().is_relative_to(PAGES.resolve()):raise RuntimeError('Unsafe generated path')
            shutil.rmtree(visuals)
    builders={'arquivo':arquivo,'grupos':grupos,'jutsus':jutsus,'comparador':comparador,'popularidade':popularidade,'episodios':episodios}
    for definition in PAGE_DEFS:
        p=Page(*definition);builders[p.key](p);p.finish();print(p.key,p.index,flush=True)
    write(PAGES/'pages.json',{'$schema':old['$schema'],'pageOrder':list(PAGE_IDS.values()),'activePageName':PAGE_IDS['arquivo']})
    report=json.loads((DEF/'report.json').read_text(encoding='utf-8'))
    theme_name='shinobi_20261021.json'
    theme=json.loads((ROOT/'powerbi/tema_shinobi.json').read_text(encoding='utf-8'))
    theme['name']=theme_name
    theme['visualStyles']={'*':{'*':{'visualHeader':[{'show':False}],'title':[{'show':False}],
        'background':[{'show':False}],'border':[{'show':False}],
        'padding':[{'top':0,'bottom':0,'left':0,'right':0}]}}}
    write(RES/theme_name,theme)
    report.setdefault('themeCollection',{})['customTheme']={'name':theme_name,
        'reportVersionAtImport':copy.deepcopy(report['themeCollection']['baseTheme']['reportVersionAtImport']),
        'type':'RegisteredResources'}
    report.setdefault('resourcePackages',[]).append({'name':'RegisteredResources','type':'RegisteredResources',
        'items':[{'name':theme_name,'path':theme_name,'type':'CustomTheme'}]})
    # Evita registro repetido nas gerações subsequentes.
    packages={}
    for package in report['resourcePackages']:packages[package['name']]=package
    report['resourcePackages']=list(packages.values())
    write(DEF/'report.json',report)
    print('Project:',PROJECT/'ShinobiArchive.pbip',flush=True)

if __name__=='__main__':main()
