"""Atualiza só a interface incorporada do PBIP, sem depender do Desktop.

Preserva modelo, medidas, relatório e os 24 conjuntos de dados existentes.
Use Atualizar no Desktop após abrir o PBIP para processar a partição alterada.
"""
import base64, gzip, hashlib, json, pathlib, re, shutil
from construir_html_powerbi import compose_interface, ROOT, UI, BUILD, MODEL


def main():
    preview = UI / 'preview.html'
    previous = preview.read_text(encoding='utf-8')
    payload_text = re.search(r'<script id="ninja-data" type="application/json">(.*?)</script>', previous, re.S).group(1)
    payload = json.loads(payload_text)
    table = MODEL / 'definition/tables/InterfaceHTML.tmdl'
    source = table.read_text(encoding='utf-8')
    pattern = r'(?<=Binary.FromText\(")[^"]+(?=", BinaryEncoding.Base64)'
    old_chunks = json.loads(gzip.decompress(base64.b64decode(re.search(pattern, source).group(0))))
    shell = compose_interface()
    assert shell.count('__NARUTO_DATA__') == 1
    assert not re.search(r'/\* __(?:ARQUIVO_NINJA_MODULE|EPISODIOS_MODULE|QUIZ_MODULE|QUIZ_BANK|GAME_MEDIA|WORLD_MAP|DUEL_EDITORIAL|VILLAGE_SYMBOLS)__', shell)
    chunks = [{'ordem':i,'conteudo':'#'+shell[start:start+24000]+'#'} for i,start in enumerate(range(0,len(shell),24000))]
    packed = base64.b64encode(gzip.compress(json.dumps(chunks,ensure_ascii=False,separators=(',',':')).encode('utf-8'),mtime=0)).decode('ascii')
    updated, count = re.subn(pattern, lambda _:packed, source)
    assert count == 1
    # Verify the exact code Power Query will read, including chunk boundaries.
    readback = json.loads(gzip.decompress(base64.b64decode(re.search(pattern, updated).group(0))))
    assert ''.join(c['conteudo'][1:-1] for c in readback) == shell
    html = '<!DOCTYPE html><html lang="pt-BR"><meta charset="utf-8"><title>Shinobi Archive · HTML Content</title><body>'+shell.replace('__NARUTO_DATA__',payload_text)+'</body></html>'
    assert json.loads(re.search(r'<script id="ninja-data" type="application/json">(.*?)</script>',html,re.S).group(1)) == payload
    BUILD.mkdir(parents=True,exist_ok=True)
    table.write_text(updated,encoding='utf-8')
    preview.write_text(html,encoding='utf-8')
    delivery = ROOT / 'entrega/ShinobiArchive_HTML_Content/ShinobiArchiveHTML'
    if delivery.is_dir():
        shutil.copy2(table,delivery/'ShinobiArchiveHTML.SemanticModel/definition/tables/InterfaceHTML.tmdl')
        for p in UI.iterdir():
            if p.is_file():
                (delivery/'interface').mkdir(exist_ok=True)
                shutil.copy2(p,delivery/'interface'/p.name)
    result = {'interfaceCodeMatchesCompiledSources':True,'existingPayloadPreserved':True,
              'datasets':len(payload),'episodes':len(payload['episodes']['rows']),
              'arcs':len(payload['arcs']['rows']),'guardedCodeChunks':len(chunks),
              'previousGuardedCodeChunks':len(old_chunks),
              'htmlSha256':hashlib.sha256(shell.encode('utf-8')).hexdigest(),
              'target':'InterfaceHTML partition only','desktopValidated':False,
              'note':'Compiled and read back from TMDL. Refresh required in Power BI Desktop; browser verification reported separately.'}
    (BUILD/'verificacao_compilacao_episodios.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__=='__main__':
    main()
