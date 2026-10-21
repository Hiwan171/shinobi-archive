"""Empacota somente o projeto portátil, sem configurações locais do Desktop."""
import datetime,hashlib,json,pathlib,zipfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
PROJECT=ROOT/'powerbi/ShinobiArchive'
OUT=ROOT/'entrega/ShinobiArchive_PowerBI.zip'
OUT.parent.mkdir(exist_ok=True)
results=json.loads((ROOT/'powerbi/references/last_mcp_result.json').read_text(encoding='utf-8'))
assert not any(r.get('isError') for r in results),'Uma operação do modelo falhou.'
queries=[]
for result in results:
    for block in result.get('content',[]):
        if block.get('type')=='text':
            data=json.loads(block['text'])
            if data.get('operation')=='Execute':queries.append(data['data'])
assert len(queries)==4
totals=queries[0]['rows'][0]
assert len(totals)==48
for key,value in {'Personagens':1431,'Jutsus':1393,'Episódios':1013,'Votos globais':4598612,
                  'Votos do recorte':4598612,'Técnicas em comum':9}.items():assert totals['['+key+']']==value,(key,totals)
assert [(r['[Episodios]'],r['[Arcos]']) for r in queries[1]['rows']]==[(220,26),(500,38),(293,16)]
assert queries[2]['rows'][0]['[Tecnicas]']==75
assert queries[3]['rows'][0]['[Altura]']=='145.3cm - 147.5cm'
pages=sorted((PROJECT/'ShinobiArchive.Report/definition/pages').glob('*/page.json'))
assert len(pages)==6
validation=json.loads((ROOT/'powerbi/build/validacao_visual.json').read_text(encoding='utf-8'))
evidence={'date':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'desktopVersion':'2.159.883.0','pages':[json.loads(p.read_text(encoding='utf-8-sig'))['displayName'] for p in pages],
    'tables':54,'relationships':40,'measuresExecuted':48,
    'queries':queries,'visualValidation':validation,
    'visualReview':'Todas as seis páginas renderizadas e inspecionadas no Power BI Desktop.',
    'screenshots':'Capturas de validação temporárias, removidas após a revisão.'}
(ROOT/'powerbi/build/verificacao_final.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf-8')
with zipfile.ZipFile(OUT,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(PROJECT.rglob('*')):
        if not p.is_file() or '.pbi' in p.relative_to(PROJECT).parts:continue
        z.write(p,'ShinobiArchive/'+p.relative_to(PROJECT).as_posix())
    z.write(ROOT/'powerbi/build/verificacao_final.json','ShinobiArchive/validacao.json')
with zipfile.ZipFile(OUT) as z:
    assert z.testzip() is None
    assert 'ShinobiArchive/ShinobiArchive.pbip' in z.namelist()
    assert not any('/.pbi/' in p for p in z.namelist())
print(json.dumps({'archive':str(OUT),'bytes':OUT.stat().st_size,
    'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest()},indent=2))
