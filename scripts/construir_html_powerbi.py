"""Compila a interface HTML e um segundo projeto Power BI com HTML Content 2.0.

A medida serializa tabelas reais do modelo em JSON. CSS e JavaScript são código
local de interface; nenhum dataset paralelo é consumido em tempo de execução.
"""
import base64,copy,datetime,json,pathlib,shutil,sys,zipfile
from construir_modelo_powerbi import stable,table

ROOT=pathlib.Path(__file__).resolve().parents[1]
SOURCE=ROOT/'powerbi/ShinobiArchive'
PROJECT=ROOT/'powerbi/ShinobiArchiveHTML'
REPORT=PROJECT/'ShinobiArchiveHTML.Report'
MODEL=PROJECT/'ShinobiArchiveHTML.SemanticModel'
BUILD=ROOT/'powerbi/build/html'
UI=ROOT/'powerbi/html-interface'
GUID='htmlContent443BE3AD55E043BF878BED274D3A6855'

# chave da interface: tabela e campos (nome JavaScript, coluna semântica)
SPEC={
 'characters':('personagens',{'id':'personagem_id','name':'nome','clan':'cla_exibicao','village':'vila_principal',
    'classification':'classificacao_resumo','sex':'sexo_pt','birthday':'aniversario_original','blood':'tipo_sanguineo',
    'portrait':'retrato_url','rank':'posicao_narutop99','votes':'votos_narutop99'}),
 'clans':('clas',{'id':'cla_id','name':'nome'}),
 'villages':('vilas',{'id':'vila_id','name':'nome'}),
 'teams':('equipes',{'id':'equipe_id','name':'nome'}),
 'clanLinks':('personagem_clas',{'person':'personagem_id','group':'cla_id'}),
 'villageLinks':('personagem_vilas',{'person':'personagem_id','group':'vila_id'}),
 'jutsus':('jutsus',{'id':'jutsu_id','name':'nome'}),
 'techniques':('personagem_jutsu',{'person':'personagem_id','technique':'jutsu_id'}),
 'chakra':('personagem_natureza',{'person':'personagem_id','name':'nome_original'}),
 'family':('familia',{'person':'personagem_id','kinship':'parentesco_original','name':'nome_relacionado_original','related':'personagem_relacionado_id'}),
 'physical':('medidas_por_fase',{'person':'personagem_id','attribute':'atributo','phase':'contexto_original','value':'valor_original'}),
 'grades':('patentes_por_fase',{'person':'personagem_id','phase':'contexto_original','grade':'patente_original'}),
 'official':('personagens_narutop99',{'id':'narutop99_id','person':'personagem_id','name':'nome'}),
 'votes':('votacao_narutop99',{'official':'narutop99_id','person':'personagem_id','region':'regiao','rank':'posicao','votes':'votos'}),
 'arcs':('arcos',{'id':'arco_id','series':'serie_anilist_id','name':'nome','first':'primeiro_episodio','last':'ultimo_episodio'}),
 'episodes':('episodios',{'id':'episodio_id','series':'serie_anilist_id','number':'numero','title':'titulo_original','kind':'classificacao_pt','arc':'arco_id'})
}
SPEC.update({
 'profiles':('personagens_anilist',{'person':'personagem_id','native':'nome_nativo','source':'url_fonte'}),
 'teamLinks':('personagem_equipes',{'person':'personagem_id','team':'equipe_id'}),
 'inherited':('kekkei_genkai',{'id':'kekkei_genkai_id','name':'nome'}),
 'inheritedLinks':('personagem_kekkei_genkai',{'person':'personagem_id','ability':'kekkei_genkai_id'}),
 'debuts':('estreias',{'person':'personagem_id','medium':'midia','reference':'referencia_original'}),
 'biographies':('BiografiasCuradas',{'person':'personagem_id','title':'titulo','intro':'resumo','style':'estilo','sources':'fontes','type':'tipo_texto'}),
 'history':('HistoriaPersonagem',{'person':'personagem_id','order':'ordem','phase':'fase','title':'titulo','text':'texto','spoiler':'revelacao','source':'url_fonte'}),
 'techniqueDetails':('TecnicasCuradas',{'id':'jutsu_id','name':'nome_pt','category':'categoria','animation':'animacao','description':'descricao','source':'url_fonte','mediaType':'tipo_midia'})
})

def write(path,value):
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
def dq(text):return '"'+text.replace('"','""')+'"'
def literal(value):
    return {'expr':{'Literal':{'Value':('true' if value else 'false') if isinstance(value,bool) else (str(value)+'D' if isinstance(value,(int,float)) else "'"+value.replace("'","''")+"'")}}}
def json_string(expr):
    result='COALESCE('+expr+', "")'
    for old,new in [('\\','\\\\'),('"','\\"'),('\r','\\r'),('\n','\\n'),('\t','\\t')]:
        source={'\r':'UNICHAR(13)','\n':'UNICHAR(10)','\t':'UNICHAR(9)'}.get(old,dq(old))
        result='SUBSTITUTE('+result+', '+source+', '+dq(new)+')'
    return dq('"')+' & '+result+' & '+dq('"')
def expression_for(model):
    tables={t['name']:t for t in model['model']['tables']}
    declarations=[];pairs=[]
    for key,(name,fields) in SPEC.items():
        columns={c['name']:c for c in tables[name]['columns']}
        parts=[]
        for alias,column in fields.items():
            expr="'"+name+"'["+column+']'
            typ=columns[column]['dataType']
            if typ in ['int64','double']:
                fmt='0' if typ=='int64' else '0.0############'
                parts.append('IF(ISBLANK('+expr+'), "null", FORMAT('+expr+', '+dq(fmt)+', "en-US"))')
            elif typ=='boolean':parts.append('IF('+expr+', "true", "false")')
            else:parts.append(json_string(expr))
        value=dq('[')+' & '+(' & '+dq(',')+' & ').join(parts)+' & '+dq(']')
        variable='__Json'+key
        first_column=next(iter(fields.values()))
        # A linha em branco virtual das relações não é um registro do catálogo.
        source="FILTER(ALLSELECTED('"+name+"'), NOT ISBLANK('"+name+"'["+first_column+']))'
        declarations.append('VAR '+variable+' = "[" & CONCATENATEX('+source+', '+value+', ",") & "]"')
        prefix=json.dumps(key)+':'+json.dumps({'fields':list(fields)},ensure_ascii=False,separators=(',',':'))[:-1]+',"rows":'
        pairs.append(dq(prefix)+' & '+variable+' & "}"')
    dataset=dq('{')+' & '+(' & '+dq(',')+' & ').join(pairs)+' & '+dq('}')
    return '\n'.join(declarations)+'''\nVAR __Dataset = '''+dataset+'''
VAR __Html = CONCATENATEX(ALL('InterfaceHTML'), MID('InterfaceHTML'[conteudo], 2, LEN('InterfaceHTML'[conteudo])-2), "", 'InterfaceHTML'[ordem], ASC)
RETURN SUBSTITUTE(__Html, "__NARUTO_DATA__", SUBSTITUTE(__Dataset, "<", "\\u003c"))'''

def read_model():
    model=json.loads((ROOT/'powerbi/build/ShinobiArchive.bim').read_text(encoding='utf-8'))
    model['name']='ShinobiArchiveHTML'
    for rel in model['model']['relationships']:
        if rel['name']==stable('series_episodes'):rel['fromTable']='arcos'
    for t in model['model']['tables']:
        if t['name']=='Indicadores':
            for m in t.get('measures',[]):
                if m['name']=='Votos do recorte':m['expression']='VAR Regiao = SELECTEDVALUE(\'Regioes\'[regiao], "all") RETURN CALCULATE(SUM(\'votacao_narutop99\'[votos]), REMOVEFILTERS(\'Regioes\'), TREATAS({Regiao}, \'votacao_narutop99\'[regiao]))'
    for name,file,schema in [
        ('BiografiasCuradas','biografias_curadas',{'personagem_id':'integer','titulo':'text','resumo':'text','estilo':'text','fontes':'text','tipo_texto':'text'}),
        ('HistoriaPersonagem','historia_personagem',{'personagem_id':'integer','ordem':'integer','fase':'text','titulo':'text','texto':'text','revelacao':'boolean','url_fonte':'text'}),
        ('TecnicasCuradas','tecnicas_curadas',{'jutsu_id':'text','nome_pt':'text','categoria':'text','animacao':'text','descricao':'text','url_fonte':'text','tipo_midia':'text'})]:
        rows=json.loads((ROOT/'data/editorial'/(file+'.json')).read_text(encoding='utf-8'))
        model['model']['tables'].append(table(name,rows,schema,hidden=True))
    return model

def local_payload(model):
    # Prévia de desenvolvimento usa exatamente os mesmos registros das partições M.
    import base64,gzip,re
    tables={t['name']:t for t in model['model']['tables']}
    result={}
    for key,(name,fields) in SPEC.items():
        expression='\n'.join(tables[name]['partitions'][0]['source']['expression'])
        packed=re.search(r'Binary.FromText\("([^"]+)"',expression).group(1)
        rows=json.loads(gzip.decompress(base64.b64decode(packed)))
        rows=[r for r in rows if r.get(next(iter(fields.values()))) is not None]
        result[key]={'fields':list(fields),'rows':[[r.get(column) if r.get(column) is not None else (None if next(c['dataType'] for c in tables[name]['columns'] if c['name']==column) in ['int64','double'] else '') for column in fields.values()] for r in rows]}
    return result

def main():
    BUILD.mkdir(parents=True,exist_ok=True);PROJECT.mkdir(parents=True,exist_ok=True)
    model=read_model()
    css=(UI/'app.css').read_text(encoding='utf-8')+'\n'+(UI/'arquivo.css').read_text(encoding='utf-8')+'\n'+(UI/'midias.css').read_text(encoding='utf-8')+'\n'+(UI/'palco.css').read_text(encoding='utf-8')+'\n'+(UI/'dossie.css').read_text(encoding='utf-8')+'\n'+(UI/'mundo.css').read_text(encoding='utf-8')+'\n'+(UI/'confronto.css').read_text(encoding='utf-8')+'\n'+(UI/'popularidade.css').read_text(encoding='utf-8')
    js=(UI/'app.js').read_text(encoding='utf-8')
    js=js.replace('/* __ARQUIVO_NINJA_MODULE__ */',(UI/'arquivo.js').read_text(encoding='utf-8')+'\n'+(UI/'midias.js').read_text(encoding='utf-8')+'\n'+(UI/'palco.js').read_text(encoding='utf-8')+'\n'+(UI/'dossie.js').read_text(encoding='utf-8')+'\n'+(UI/'mundo.js').read_text(encoding='utf-8')+'\n'+(UI/'confronto.js').read_text(encoding='utf-8')+'\n'+(UI/'popularidade.js').read_text(encoding='utf-8'))
    js=js.replace('/* __DUEL_EDITORIAL__ */{}',json.dumps(json.loads((ROOT/'data/editorial/confrontos_shinobi.json').read_text(encoding='utf-8')),ensure_ascii=False,separators=(',',':')))
    js=js.replace("/* __WORLD_MAP__ */''",json.dumps((ROOT/'assets/maps/naruto-world-atlas.svg').read_text(encoding='utf-8'),ensure_ascii=False))
    media=json.loads((ROOT/'data/editorial/midias_jogos.json').read_text(encoding='utf-8'))
    keep_art=['person','phase','url','source','game','credit']
    keep_sprite=['person','name','url','source','game','credit','width','height','background','idle']
    # Reserva local para os destaques da revisão, com tamanho controlado no visual.
    cached_art_keys={(1344,'default'),(1344,'Part I'),(1307,'default'),(1293,'default'),(928,'default'),(865,'default'),(374,'default')}
    media={'arts':[{**{k:a[k] for k in keep_art},**({'inline':'data:image/png;base64,'+base64.b64encode((ROOT/a['file']).read_bytes()).decode('ascii')} if (a['person'],a['phase']) in cached_art_keys else {})} for a in media['arts']],
           'sprites':[{**{k:a[k] for k in keep_sprite},'displayBackground':a.get('displayBackground',a['background'])} for a in media['sprites']],'clips':media['clips']}
    js=js.replace('/* __GAME_MEDIA__ */{}',json.dumps(media,ensure_ascii=False,separators=(',',':')))
    symbols={p.stem:base64.b64encode(p.read_bytes()).decode() for p in (ROOT/'assets/symbols').glob('*.svg')}
    js=js.replace('/* __VILLAGE_SYMBOLS__ */{}',json.dumps(symbols,separators=(',',':')))
    shell=(UI/'shell.html').read_text(encoding='utf-8').replace('__NARUTO_CSS__',css).replace('__NARUTO_JS__',js)
    # Marcadores protegem espaços e quebras nas bordas dos trechos contra a
    # normalização de strings do VertiPaq. A medida remove os dois marcadores.
    chunks=[{'ordem':i,'conteudo':'#'+shell[start:start+24000]+'#'} for i,start in enumerate(range(0,len(shell),24000))]
    ui_table=table('InterfaceHTML',chunks,{'ordem':'integer','conteudo':'text'},hidden=True)
    model['model']['tables'].append(ui_table)
    expression=expression_for(model)
    metric=next(t for t in model['model']['tables'] if t['name']=='Indicadores')
    metric['measures'].append({'name':'Interface Naruto HTML','expression':expression,'displayFolder':'Interface HTML',
        'description':'Interface completa em HTML/CSS/JS; JSON serializado das tabelas do modelo no contexto recebido pelo visual.',
        'lineageTag':stable('html-interface-measure')})
    write(BUILD/'ShinobiArchiveHTML.bim',model)
    (BUILD/'Interface_Naruto_HTML.dax').write_text('Interface Naruto HTML =\n'+expression,encoding='utf-8')
    payload=local_payload(model)
    json_payload=json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('<','\\u003c')
    (UI/'preview.html').write_text('<!DOCTYPE html><html lang="pt-BR"><meta charset="utf-8"><title>Shinobi Archive · HTML Content</title><body>'+shell.replace('__NARUTO_DATA__',json_payload)+'</body></html>',encoding='utf-8')
    write(BUILD/'payload_preview.json',payload)
    # Cópia independente: preserva o relatório nativo existente e seu cache.
    REPORT.mkdir(exist_ok=True);MODEL.mkdir(exist_ok=True)
    for item in ['StaticResources']:
        shutil.copytree(SOURCE/'ShinobiArchive.Report'/item,REPORT/item,dirs_exist_ok=True)
    report=json.loads((SOURCE/'ShinobiArchive.Report/definition/report.json').read_text(encoding='utf-8'))
    report.setdefault('objects',{})['outspacePane']=[{'properties':{'expanded':literal(False),'visible':literal(False)}}]
    report.setdefault('settings',{})['filterPaneHiddenInEditMode']=True
    report['resourcePackages']=[p for p in report.get('resourcePackages',[]) if p['type']!='CustomVisual']
    report['resourcePackages'].append({'name':GUID,'type':'CustomVisual','items':[{'name':GUID+'.pbiviz.json','path':GUID+'.pbiviz.json','type':'CustomVisualMetadata'}]})
    write(REPORT/'definition/report.json',report)
    write(REPORT/'definition/version.json',json.loads((SOURCE/'ShinobiArchive.Report/definition/version.json').read_text(encoding='utf-8')))
    with zipfile.ZipFile(ROOT/'powerbi/vendor/html-content/HTML-Content.2.0.0.pbiviz') as z:
        z.extractall(REPORT/'CustomVisuals'/GUID)
    page_id='shinobi_html'
    source_page=json.loads((SOURCE/'ShinobiArchive.Report/definition/pages/shinobi_arquivo/page.json').read_text(encoding='utf-8'))
    source_page.update({'name':page_id,'displayName':'Universo Shinobi · HTML','width':1600,'height':1000,'displayOption':'FitToPage'})
    write(REPORT/'definition/pages'/page_id/'page.json',source_page)
    write(REPORT/'definition/pages/pages.json',{'$schema':'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/pagesMetadata/1.0.0/schema.json','pageOrder':[page_id],'activePageName':page_id})
    field={'Measure':{'Expression':{'SourceRef':{'Entity':'Indicadores'}},'Property':'Interface Naruto HTML'}}
    vco={k:[{'properties':{'show':literal(False)}}] for k in ['background','border','title','visualHeader']}
    vco['padding']=[{'properties':{p:literal(0) for p in ['top','bottom','left','right']}}]
    visual={'$schema':'https://developer.microsoft.com/json-schemas/fabric/item/report/definition/visualContainer/2.9.0/schema.json',
        'name':'shinobi_html_content','position':{'x':0,'y':0,'width':1600,'height':1000,'z':0,'tabOrder':0},
        'visual':{'visualType':GUID,'query':{'queryState':{'content':{'projections':[{'field':field,'queryRef':'Indicadores.Interface Naruto HTML','nativeQueryRef':'Interface Naruto HTML'}]}}},
            'objects':{'compatibility':[{'properties':{'legacyRendering':literal(False)}}],
                'contentFormatting':[{'properties':{'format':literal('html'),'renderMode':literal('rebuild'),'userSelect':literal(True),'hyperlinks':literal(True),'enableDiagnostics':literal(False)}}],
                'templates':[{'properties':{'bodyTemplate':literal('{{content}}'),'rowTemplate':literal('{{row}}')}}]},
            'visualContainerObjects':vco,'drillFilterOtherVisuals':True}}
    write(REPORT/'definition/pages'/page_id/'visuals/shinobi_html_content/visual.json',visual)
    write(REPORT/'definition.pbir',{'$schema':'https://developer.microsoft.com/json-schemas/fabric/item/report/definitionProperties/2.0.0/schema.json','version':'4.0','datasetReference':{'byPath':{'path':'../ShinobiArchiveHTML.SemanticModel'}}})
    write(MODEL/'definition.pbism',{'version':'4.0','settings':{}})
    for name,typ in [(REPORT,'Report'),(MODEL,'SemanticModel')]:
        write(name/'.platform',{'$schema':'https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json','metadata':{'type':typ,'displayName':'ShinobiArchiveHTML'},'config':{'version':'2.0','logicalId':stable('html-project-'+typ)}})
    write(PROJECT/'ShinobiArchiveHTML.pbip',{'$schema':'https://developer.microsoft.com/json-schemas/fabric/pbip/pbipProperties/1.0.0/schema.json','version':'1.0','artifacts':[{'report':{'path':'ShinobiArchiveHTML.Report'}}],'settings':{'enableAutoRecovery':True}})
    write(BUILD/'exportar.json',[{'name':'connection_operations','arguments':{'request':{'operation':'ConnectBimFile','bimFilePath':str(BUILD/'ShinobiArchiveHTML.bim')}}},
        {'name':'database_operations','arguments':{'request':{'operation':'ExportToTmdlFolder','tmdlFolderPath':str(MODEL/'definition')}}}])
    print(json.dumps({'project':str(PROJECT/'ShinobiArchiveHTML.pbip'),'htmlBytes':len(shell.encode()),'payloadBytes':len(json_payload.encode()),'tables':len(model['model']['tables']),'measures':len(metric['measures'])},indent=2))

if __name__=='__main__':
    sys.stdout.reconfigure(encoding='utf-8');main()
