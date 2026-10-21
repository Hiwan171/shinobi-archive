"""Gera o modelo Power BI portátil a partir das tabelas coletadas.

Os dados ficam em partições M compactadas no próprio projeto: a abertura não
depende do caminho original de CSV nem de uma credencial de API.
"""
import base64,csv,gzip,json,pathlib,uuid,re

ROOT=pathlib.Path(__file__).resolve().parents[1]
PROJECT=ROOT/'powerbi/ShinobiArchive'
MODEL=PROJECT/'ShinobiArchive.SemanticModel'
BUILD=ROOT/'powerbi/build'
MODEL.mkdir(exist_ok=True);BUILD.mkdir(exist_ok=True)
DATA=ROOT/'data/processed'

def load(name):
    return json.loads((DATA/'json'/(name+'.json')).read_text(encoding='utf-8'))

def stable(value):
    return str(uuid.uuid5(uuid.NAMESPACE_URL,'shinobi-archive:'+value))

def table(name,rows,schema,hidden=False):
    packed=base64.b64encode(gzip.compress(json.dumps(rows,ensure_ascii=False,separators=(',',':')).encode('utf-8'),mtime=0)).decode()
    types={'integer':'Int64.Type','number':'type number','boolean':'type logical','text':'type text'}
    mapping=', '.join('{'+json.dumps(c)+', '+types[t]+'}' for c,t in schema.items())
    expression=f'let\n    Dados = Json.Document(Binary.Decompress(Binary.FromText("{packed}", BinaryEncoding.Base64), Compression.GZip)),\n    Fonte = Table.FromRecords(Dados),\n    Tipos = Table.TransformColumnTypes(Fonte, {{{mapping}}}, "en-US")\nin\n    Tipos'
    columns=[]
    for field,typ in schema.items():
        col={'name':field,'dataType':{'integer':'int64','number':'double','boolean':'boolean','text':'string'}[typ],
             'sourceColumn':field,'summarizeBy':'none','lineageTag':stable(name+'.'+field)}
        if typ=='integer':col['formatString']='#,0'
        if field in ['imagem_url','retrato_url','card_url']:col['dataCategory']='ImageUrl'
        if field in ['personagem_id','anilist_id','narutop99_id','serie_anilist_id','url_fonte','fonte','metodo_correspondencia']:
            col['isHidden']=True
        columns.append(col)
    return {'name':name,'lineageTag':stable(name),'isHidden':hidden,'columns':columns,
            'partitions':[{'name':name,'mode':'import','source':{'type':'m','expression':expression.splitlines()}}]}

def main():
    schemas=json.loads((DATA/'schema.json').read_text(encoding='utf-8'))
    allrows={name:load(name) for name in schemas}
    chars=allrows['personagens']
    official={r['narutop99_id']:r for r in allrows['personagens_narutop99']}
    villages={r['vila_id']:r['nome'] for r in allrows['vilas']}
    charvillages={}
    for row in allrows['personagem_vilas']:
        charvillages.setdefault(row['personagem_id'],[]).append(villages[row['vila_id']])
    for c in chars:
        cid=c['personagem_id'];oid=c.get('narutop99_id_principal')
        choices=charvillages.get(cid,[])
        preferred=['Konohagakure','Sunagakure','Kirigakure','Kumogakure','Iwagakure','Amegakure','Otogakure']
        c['vila_principal']=next((v for v in preferred if v in choices),next(iter(choices),'Não informado'))
        c['cla_exibicao']=c.get('cla_resumo') or 'Não informado'
        c['retrato_url']=c['imagem_url'] if c.get('imagem_local') else None
        c['card_url']=f'https://narutop99.naruto-official.com/blobs/char/cover/en/{oid}.png' if oid else None
        c['ordem_catalogo']=c.get('posicao_narutop99') or 1000+cid
    schemas['personagens']['columns'].update({'vila_principal':'text','cla_exibicao':'text','retrato_url':'text','card_url':'text','ordem_catalogo':'integer'})
    # Simplifica as legendas sem alterar os nomes originais preservados na base.
    chakra={'Fire Release':'Fogo','Wind Release':'Vento','Lightning Release':'Relâmpago','Earth Release':'Terra',
            'Water Release':'Água','Wood Release':'Madeira','Yin Release':'Yin','Yang Release':'Yang',
            'Yin–Yang Release':'Yin–Yang','Lava Release':'Lava','Magnet Release':'Magnetismo','Boil Release':'Vapor',
            'Ice Release':'Gelo','Storm Release':'Tempestade','Dust Release':'Poeira','Explosion Release':'Explosão'}
    for nature in allrows['naturezas']:
        nature['nome_pt']=chakra.get(nature['nome'],nature['nome'])
    schemas['naturezas']['columns']['nome_pt']='text'
    serie_names={20:'Naruto',1735:'Naruto Shippuden',97938:'Boruto'}
    for ep in allrows['episodios']:
        ep['classificacao_pt']={'Canon':'Cânone','Filler':'Filler','Mixed':'Misto'}.get(ep['classificacao_comunitaria'],ep['classificacao_comunitaria'])
    schemas['episodios']['columns']['classificacao_pt']='text'
    tables=[]
    hidden={'atributos_originais','problemas_qualidade','itens_quarentena','imagens_referenciadas',
            'arquivos_imagem','aliases','dublagem_original','distribuicao_status','links_por_serie','papeis_comunitarios',
            'relacoes_entre_obras','tags_por_serie','generos_por_serie','aparicoes_por_midia','caracteristicas'}
    for name,meta in schemas.items():
        tables.append(table(name,allrows[name],meta['columns'],name in hidden))
    aux={}
    for name in ['ComparadorA','ComparadorB']:
        rows=[{'personagem_id':r['personagem_id'],'nome':r['nome'],'retrato_url':r['retrato_url']} for r in chars]
        aux[name]=rows;tables.append(table(name,rows,{'personagem_id':'integer','nome':'text','retrato_url':'text'}))
    phases=sorted({r['contexto_original'] for r in allrows['medidas_por_fase']}|{r['contexto_original'] for r in allrows['patentes_por_fase']})
    phase_names={'Part I':'Naruto clássico','Part II':'Shippuden','Blank Period':'Período em branco','Gaiden':'Gaiden','Boruto Movie':'Boruto: o filme','Boruto Manga':'Boruto: mangá','New Era':'Nova era'}
    aux['Fases']=[{'contexto_original':p,'fase':phase_names.get(p,p)} for p in phases]
    tables.append(table('Fases',aux['Fases'],{'contexto_original':'text','fase':'text'}))
    regions={'all':'Global','japan':'Japão','asia':'Ásia','oceania':'Oceania','north-america':'América do Norte',
             'latin-america':'América Latina','europe':'Europa','middle-east':'Oriente Médio','africa':'África'}
    aux['Regioes']=[{'regiao':key,'nome':value} for key,value in regions.items()]
    tables.append(table('Regioes',aux['Regioes'],{'regiao':'text','nome':'text'}))
    tables.append(table('Series',[{'serie_anilist_id':k,'nome':v} for k,v in serie_names.items()],{'serie_anilist_id':'integer','nome':'text'}))
    metric=table('Indicadores',[{'versao':'1.0'}],{'versao':'text'})
    metric['columns'][0]['isHidden']=True
    measures=[]
    def measure(name,expression,fmt=None,image=False,folder='Visão geral'):
        expression=re.sub(r'\bId\b','__NinjaId',expression)
        row={'name':name,'expression':expression,'lineageTag':stable('Indicadores.'+name),'displayFolder':folder}
        if fmt:row['formatString']=fmt
        if image:row['dataCategory']='ImageUrl'
        measures.append(row)
    measure('Personagens',"DISTINCTCOUNT('personagens'[personagem_id])",'#,0')
    measure('Catálogo completo',"CALCULATE([Personagens], REMOVEFILTERS('personagens'))",'#,0')
    measure('Clãs',"COUNTROWS('clas')",'#,0')
    measure('Vilas',"COUNTROWS('vilas')",'#,0')
    measure('Equipes',"COUNTROWS('equipes')",'#,0')
    measure('Jutsus',"DISTINCTCOUNT('jutsus'[jutsu_id])",'#,0')
    measure('Usuários da técnica',"DISTINCTCOUNT('personagem_jutsu'[personagem_id])",'#,0')
    measure('Membros do clã',"DISTINCTCOUNT('personagem_clas'[personagem_id])",'#,0')
    measure('Membros da vila',"DISTINCTCOUNT('personagem_vilas'[personagem_id])",'#,0')
    measure('Usuários da natureza',"DISTINCTCOUNT('personagem_natureza'[personagem_id])",'#,0')
    measure('Episódios',"COUNTROWS('episodios')",'#,0')
    measure('Arcos',"DISTINCTCOUNT('episodios'[arco_id])",'#,0')
    measure('Episódios filler',"CALCULATE([Episódios], 'episodios'[classificacao_pt] = \"Filler\")",'#,0')
    measure('Percentual filler',"DIVIDE([Episódios filler], [Episódios])",'0.0%')
    measure('Votos do recorte',"VAR Regiao = SELECTEDVALUE('Regioes'[regiao], \"all\") RETURN CALCULATE(SUM('votacao_narutop99'[votos]), REMOVEFILTERS('Regioes'), TREATAS({Regiao}, 'votacao_narutop99'[regiao]))",'#,0')
    measure('Votos globais',"CALCULATE(SUM('votacao_narutop99'[votos]), REMOVEFILTERS('Regioes'), 'votacao_narutop99'[regiao] = \"all\")",'#,0')
    measure('Participantes',"DISTINCTCOUNT('votacao_narutop99'[narutop99_id])",'#,0')
    measure('Ninja ID',"SELECTEDVALUE('personagens'[personagem_id], 1344)",folder='Ficha')
    for title,field,default in [('Nome da ficha','nome','Não informado'),('Clã da ficha','cla_exibicao','Não informado'),
        ('Vila da ficha','vila_principal','Não informado'),('Classificação da ficha','classificacao_resumo','Não informado'),
        ('Sangue da ficha','tipo_sanguineo','Não informado'),('Aniversário da ficha','aniversario_original','Não informado')]:
        measure(title,f'VAR Id = [Ninja ID] RETURN COALESCE(LOOKUPVALUE(\'personagens\'[{field}], \'personagens\'[personagem_id], Id), "{default}")',folder='Ficha')
    for title,field in [('Retrato da ficha','retrato_url'),('Card da ficha','card_url')]:
        measure(title,f'VAR Id = [Ninja ID] RETURN LOOKUPVALUE(\'personagens\'[{field}], \'personagens\'[personagem_id], Id)',image=True,folder='Ficha')
    measure('Retrato no catálogo',"SELECTEDVALUE('personagens'[retrato_url])",image=True,folder='Ficha')
    for title,field in [('Técnicas da ficha','quantidade_jutsus_utilizaveis'),('Naturezas da ficha','quantidade_naturezas_listadas'),
                        ('Votos da ficha','votos_narutop99'),('Posição da ficha','posicao_narutop99')]:
        measure(title,f'VAR Id = [Ninja ID] RETURN LOOKUPVALUE(\'personagens\'[{field}], \'personagens\'[personagem_id], Id)',fmt='#,0',folder='Ficha')
    for title,attribute in [('Idade da ficha','idade'),('Altura da ficha','altura'),('Peso da ficha','peso')]:
        measure(title,f'VAR Id = [Ninja ID] VAR Fase = SELECTEDVALUE(\'Fases\'[contexto_original], "Part II") RETURN COALESCE(CALCULATE(SELECTEDVALUE(\'medidas_por_fase\'[valor_original]), TREATAS({{Id}}, \'medidas_por_fase\'[personagem_id]), TREATAS({{Fase}}, \'medidas_por_fase\'[contexto_original]), \'medidas_por_fase\'[atributo] = "{attribute}"), "Não informado")',folder='Ficha')
    measure('Patente da ficha','VAR Id = [Ninja ID] VAR Fase = SELECTEDVALUE(\'Fases\'[contexto_original], "Part II") RETURN COALESCE(CALCULATE(SELECTEDVALUE(\'patentes_por_fase\'[patente_original]), TREATAS({Id}, \'patentes_por_fase\'[personagem_id]), TREATAS({Fase}, \'patentes_por_fase\'[contexto_original])), "Não informado")',folder='Ficha')
    measure('Chakra da ficha','VAR Id = [Ninja ID] RETURN CONCATENATEX(FILTER(ALL(\'personagem_natureza\'), \'personagem_natureza\'[personagem_id] = Id), \'personagem_natureza\'[nome_original], "  ·  ")',folder='Ficha')
    for slot,default in [('A',1344),('B',1307)]:
        measure('Ninja '+slot,f'SELECTEDVALUE(\'Comparador{slot}\'[personagem_id], {default})',folder='Comparador')
        measure('Nome '+slot,f'VAR Id = [Ninja {slot}] RETURN LOOKUPVALUE(\'personagens\'[nome], \'personagens\'[personagem_id], Id)',folder='Comparador')
        measure('Retrato '+slot,f'VAR Id = [Ninja {slot}] RETURN LOOKUPVALUE(\'personagens\'[retrato_url], \'personagens\'[personagem_id], Id)',image=True,folder='Comparador')
        measure('Técnicas '+slot,f'VAR Id = [Ninja {slot}] RETURN CALCULATE(DISTINCTCOUNT(\'personagem_jutsu\'[jutsu_id]), REMOVEFILTERS(\'personagens\'), TREATAS({{Id}}, \'personagem_jutsu\'[personagem_id]))',fmt='#,0',folder='Comparador')
        measure('Naturezas '+slot,f'VAR Id = [Ninja {slot}] RETURN LOOKUPVALUE(\'personagens\'[quantidade_naturezas_listadas], \'personagens\'[personagem_id], Id)',fmt='#,0',folder='Comparador')
    common='VAR IdA = [Ninja A] VAR IdB = [Ninja B] VAR A = DISTINCT(SELECTCOLUMNS(FILTER(ALL(\'personagem_jutsu\'), \'personagem_jutsu\'[personagem_id] = IdA), "Tecnica", \'personagem_jutsu\'[jutsu_id])) VAR B = DISTINCT(SELECTCOLUMNS(FILTER(ALL(\'personagem_jutsu\'), \'personagem_jutsu\'[personagem_id] = IdB), "Tecnica", \'personagem_jutsu\'[jutsu_id])) VAR Comuns = INTERSECT(A, B) '
    measure('Técnicas em comum',common+'RETURN COUNTROWS(Comuns)',fmt='#,0',folder='Comparador')
    measure('Técnicas compartilhadas',common+'RETURN CONCATENATEX(TOPN(12, Comuns, [Tecnica], ASC), LOOKUPVALUE(\'jutsus\'[nome], \'jutsus\'[jutsu_id], [Tecnica]), UNICHAR(10))',folder='Comparador')
    metric['measures']=measures;tables.append(metric)
    relationships=[]
    with (ROOT/'powerbi/relacionamentos.csv').open(encoding='utf-8-sig',newline='') as stream:
        for row in csv.DictReader(stream,delimiter=';'):
            relationships.append({'name':stable('relation:'+row['tabela_muitos']+'.'+row['coluna_muitos']+':'+row['tabela_um']),
                'fromTable':row['tabela_muitos'],'fromColumn':row['coluna_muitos'],'fromCardinality':'many',
                'toTable':row['tabela_um'],'toColumn':row['coluna_um'],'toCardinality':'one','crossFilteringBehavior':'oneDirection'})
    relationships.append({'name':stable('regions'),'fromTable':'votacao_narutop99','fromColumn':'regiao','toTable':'Regioes','toColumn':'regiao'})
    # Series é a dimensão de navegação das três séries; series_filmes guarda o catálogo amplo.
    relationships.append({'name':stable('series'),'fromTable':'series_filmes','fromColumn':'serie_anilist_id','toTable':'Series','toColumn':'serie_anilist_id'})
    # Series contém somente as três séries. As obras extras exigem lado um completo:
    # não usar esta relação parcial; filtrar as páginas de episódios via arcos/series_filmes.
    relationships.pop()
    relationships.append({'name':stable('series_episodes'),'fromTable':'arcos','fromColumn':'serie_anilist_id','toTable':'Series','toColumn':'serie_anilist_id'})
    model={'name':'ShinobiArchive','compatibilityLevel':1600,'model':{'culture':'pt-BR','sourceQueryCulture':'en-US',
        'defaultPowerBIDataSourceVersion':'powerBI_V3','discourageImplicitMeasures':False,
        'annotations':[{'name':'PBI_ProTooling','value':'["DevMode"]'},{'name':'ShinobiArchiveDataSnapshot','value':'2026-10-21'}],
        'tables':tables,'relationships':relationships}}
    path=BUILD/'ShinobiArchive.bim';path.write_text(json.dumps(model,ensure_ascii=False,indent=2),encoding='utf-8')
    (MODEL/'definition.pbism').write_text(json.dumps({'version':'4.0','settings':{}},indent=2),encoding='utf-8')
    (MODEL/'.platform').write_text(json.dumps({'$schema':'https://developer.microsoft.com/json-schemas/fabric/gitIntegration/platformProperties/2.0.0/schema.json',
        'metadata':{'type':'SemanticModel','displayName':'ShinobiArchive'},'config':{'version':'2.0','logicalId':stable('semantic-model')}},indent=2),encoding='utf-8')
    calls=[{'name':'connection_operations','arguments':{'request':{'operation':'ConnectBimFile','bimFilePath':str(path)}}},
        {'name':'database_operations','arguments':{'request':{'operation':'ExportToTmdlFolder','tmdlFolderPath':str(MODEL/'definition')}}}]
    (BUILD/'export_model_calls.json').write_text(json.dumps(calls,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'tables':len(tables),'measures':len(measures),'relationships':len(relationships),'bim':str(path)},ensure_ascii=False))

if __name__=='__main__':main()
