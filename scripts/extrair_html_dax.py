"""Verifica a saída real da medida e prepara a prévia de aceitação."""
import json,pathlib,re,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
results=json.loads((ROOT/'powerbi/references/last_mcp_result.json').read_text(encoding='utf-8'))
assert not any(r.get('isError') for r in results)
queries=[json.loads(b['text'])['data'] for r in results for b in r.get('content',[]) if b.get('type')=='text' and json.loads(b['text']).get('operation')=='Execute']
html=queries[-1]['rows'][0]['[html]']
raw=re.search(r'<script id="ninja-data" type="application/json">(.*?)</script>',html,re.S).group(1)
payload=json.loads(raw)
preview=(ROOT/'powerbi/html-interface/preview.html').read_text(encoding='utf-8').split('<body>',1)[1].rsplit('</body>',1)[0]
def code_only(value):return re.sub(r'(<script id="ninja-data" type="application/json">).*?(</script>)',r'\1__DATA__\2',value,flags=re.S)
assert code_only(html)==code_only(preview),'O código HTML/CSS/JS da medida não coincide com os fontes compilados.'
expected=json.loads((ROOT/'powerbi/build/html/payload_preview.json').read_text(encoding='utf-8'))
for key,block in expected.items():
    assert payload[key]['fields']==block['fields'],key
    assert len(payload[key]['rows'])==len(block['rows']),(key,len(payload[key]['rows']),len(block['rows']))
    # VertiPaq reutiliza a primeira grafia de textos que diferem só em caixa.
    actual_rows=sorted(json.dumps([x.rstrip().casefold() if isinstance(x,str) else x for x in row],ensure_ascii=False) for row in payload[key]['rows'])
    expected_rows=sorted(json.dumps([x.rstrip().casefold() if isinstance(x,str) else x for x in row],ensure_ascii=False) for row in block['rows'])
    if actual_rows!=expected_rows:
        print(json.dumps({'dataset':key,'actualOnly':list(set(actual_rows)-set(expected_rows))[:3],
            'expectedOnly':list(set(expected_rows)-set(actual_rows))[:3]},ensure_ascii=True))
        raise AssertionError(key)
(ROOT/'powerbi/build/html/saida_real_dax.html').write_text('<!DOCTYPE html><html lang="pt-BR"><meta charset="utf-8"><title>Shinobi Archive · Dados do Power BI</title><body>'+html+'</body></html>',encoding='utf-8')
(ROOT/'powerbi/build/html/verificacao_modelo.json').write_text(json.dumps({'queries':[q for q in queries if '[html]' not in q['rows'][0]],'htmlCharacters':len(html),'datasets':{k:len(v['rows']) for k,v in payload.items()},'dataComparedWithSources':True,'interfaceCodeMatchesSources':True},ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'htmlCharacters':len(html),'datasets':len(payload),'dataComparedWithSources':True}))
sys.stdout.flush()
