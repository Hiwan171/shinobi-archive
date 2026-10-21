"""Empacota o relatório HTML completo e os fontes editáveis."""
import hashlib,json,pathlib,zipfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
PROJECT=ROOT/'powerbi/ShinobiArchiveHTML'
OUT=ROOT/'entrega/ShinobiArchive_HTML_Content.zip'
tests=json.loads((ROOT/'powerbi/build/html/testes_interface.json').read_text(encoding='utf-8'))
assert tests['passed']>=21 and not tests['errors']
assert 'saida_real_dax.html' in tests['input'],'Executar os testes usando a saída real do modelo.'
dossier=json.loads((ROOT/'powerbi/build/html/testes_dossie.json').read_text(encoding='utf-8'))
assert dossier['passed']>=19 and not dossier['errors']
assert 'saida_real_dax.html' in dossier['input']
media_tests=json.loads((ROOT/'powerbi/build/html/testes_midias.json').read_text(encoding='utf-8'))
assert media_tests['passed']>=31 and not media_tests['errors'] and not media_tests['failedMedia']
assert 'saida_real_dax.html' in media_tests['input']
stage_tests=json.loads((ROOT/'powerbi/build/html/testes_palco.json').read_text(encoding='utf-8'))
assert stage_tests['passed']>=22 and not stage_tests['errors']
assert 'saida_real_dax.html' in stage_tests['input']
rich_tests=json.loads((ROOT/'powerbi/build/html/testes_dossie_visual.json').read_text(encoding='utf-8'))
assert rich_tests['passed']>=21 and not rich_tests['errors']
assert 'saida_real_dax.html' in rich_tests['input']
world_tests=json.loads((ROOT/'powerbi/build/html/testes_mundo.json').read_text(encoding='utf-8'))
assert world_tests['passed']>=30 and not world_tests['errors']
assert 'saida_real_dax.html' in world_tests['input']
duel_tests=json.loads((ROOT/'powerbi/build/html/testes_confronto.json').read_text(encoding='utf-8'))
assert duel_tests['passed']>=79 and not duel_tests['errors']
assert 'saida_real_dax.html' in duel_tests['input']
fan_tests=json.loads((ROOT/'powerbi/build/html/testes_popularidade.json').read_text(encoding='utf-8'))
assert fan_tests['passed']>=63 and not fan_tests['errors']
assert 'saida_real_dax.html' in fan_tests['input']
duel_editorial=json.loads((ROOT/'data/editorial/confrontos_shinobi.json').read_text(encoding='utf-8'))
assert len(duel_editorial['profiles'])==8
assert duel_editorial['elementCycle']==['fire','wind','lightning','earth','water']
embedded_proof=json.loads((ROOT/'powerbi/build/html/verificacao_artes_incorporadas.json').read_text(encoding='utf-8'))
assert embedded_proof['allEmbeddedHashesMatchOriginals'] and embedded_proof['embeddedOriginalPngFiles']==7
evidence=json.loads((ROOT/'powerbi/build/html/verificacao_modelo.json').read_text(encoding='utf-8'))
assert evidence['dataComparedWithSources']
assert evidence['interfaceCodeMatchesSources']
assert evidence['datasets']['characters']==1431
assert evidence['datasets']['episodes']==1013
assert evidence['datasets']['biographies']==23
assert evidence['datasets']['history']==79
assert evidence['datasets']['techniqueDetails']==19
validation=json.loads((ROOT/'powerbi/build/html/validacao_visual.json').read_text(encoding='utf-8'))
assert validation['data']['errorCount']==0
media=json.loads((ROOT/'data/editorial/midias_jogos.json').read_text(encoding='utf-8'))
media_proof=json.loads((ROOT/'powerbi/build/html/verificacao_midias.json').read_text(encoding='utf-8'))
assert media_proof['originalHashesUnchanged'] and media_proof['originalFiles']==116
desktop=json.loads((ROOT/'powerbi/build/html/verificacao_desktop.json').read_text(encoding='utf-8'))
assert desktop['edition']=='Popularidade v9' and desktop['htmlScreenshotsReviewed']
assert desktop['latestDesktopScreenshotReviewed'] or desktop.get('finalDesktopCaptureError')=='HOST_UNAVAILABLE'
with zipfile.ZipFile(OUT,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in sorted(PROJECT.rglob('*')):
        if p.is_file() and '.pbi' not in p.relative_to(PROJECT).parts:
            z.write(p,'ShinobiArchiveHTML/'+p.relative_to(PROJECT).as_posix())
    for p in sorted((ROOT/'powerbi/html-interface').glob('*')):
        if p.is_file():z.write(p,'ShinobiArchiveHTML/interface/'+p.name)
    for p in sorted((ROOT/'data/editorial').glob('*.json')):
        z.write(p,'ShinobiArchiveHTML/editorial/'+p.name)
    for asset in media['arts']+media['sprites']:
        p=ROOT/asset['file']
        assert hashlib.sha256(p.read_bytes()).hexdigest()==asset['sha256']
        z.write(p,'ShinobiArchiveHTML/'+asset['file'])
    for p in sorted((ROOT/'assets/maps').glob('*')):
        if p.is_file():z.write(p,'ShinobiArchiveHTML/assets/maps/'+p.name)
    for name in ['testes_interface.json','testes_dossie.json','testes_midias.json','testes_palco.json','testes_dossie_visual.json','testes_mundo.json','testes_confronto.json','testes_popularidade.json','verificacao_modelo.json','verificacao_midias.json','verificacao_artes_incorporadas.json','verificacao_desktop.json','comparacao_copia_desktop.json','validacao_visual.json','Interface_Naruto_HTML.dax']:
        z.write(ROOT/'powerbi/build/html'/name,'ShinobiArchiveHTML/validacao/'+name)
    license_file=ROOT/'powerbi/vendor/html-content/LICENSE'
    assert license_file.exists(),'Incluir licença do HTML Content.'
    z.write(license_file,'ShinobiArchiveHTML/HTML_Content_LICENSE')
with zipfile.ZipFile(OUT) as z:
    assert z.testzip() is None
    assert not any('/.pbi/' in n for n in z.namelist())
print(json.dumps({'archive':str(OUT),'bytes':OUT.stat().st_size,'sha256':hashlib.sha256(OUT.read_bytes()).hexdigest()}))
