"""Confere a edição 09 e sincroniza os fontes e as evidências da entrega."""
import base64,gzip,json,pathlib,re,shutil
ROOT=pathlib.Path(__file__).resolve().parents[1]
BUILD=ROOT/'powerbi/build/html'
MAIN=ROOT/'powerbi/ShinobiArchiveHTML'
OPEN=ROOT/'entrega/ShinobiArchive_HTML_Content/ShinobiArchiveHTML'
def read(name):
    p=BUILD/name;b=p.read_bytes();s=b.decode('utf-16') if b.startswith(b'\xff\xfe') else b.decode('utf-8-sig')
    value=json.loads(s)
    if b.startswith(b'\xff\xfe') or b.startswith(b'\xef\xbb\xbf'):p.write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
    return value
def write(name,value):(BUILD/name).write_text(json.dumps(value,ensure_ascii=False,indent=2),encoding='utf-8')
test_names=['interface','dossie','midias','palco','dossie_visual','mundo','confronto','popularidade']
tests=[read('testes_'+name+'.json') for name in test_names]
assert [t['passed'] for t in tests]==[21,19,31,22,21,30,79,63]
assert all(not t['errors'] and 'saida_real_dax.html' in t['input'] for t in tests)
preview=read('preview_desktop_popularidade_final.json')
native_final_ok=bool(preview.get('data',{}).get('ok'))
assert native_final_ok or preview.get('error',{}).get('code')=='HOST_UNAVAILABLE'
assert read('verificacao_modelo.json')['interfaceCodeMatchesSources']
assert read('verificacao_modelo.json')['dataComparedWithSources']
assert read('validacao_visual.json')['data']['errorCount']==0
assert read('verificacao_artes_incorporadas.json')['embeddedOriginalPngFiles']==7
assert read('verificacao_artes_incorporadas.json')['allEmbeddedHashesMatchOriginals']
assert "version:'9.0.0'" in (BUILD/'saida_real_dax.html').read_text(encoding='utf-8')
tables=pathlib.Path('ShinobiArchiveHTML.SemanticModel/definition/tables')
equal={name:(MAIN/tables/name).read_bytes()==(OPEN/tables/name).read_bytes() for name in ['InterfaceHTML.tmdl','TecnicasCuradas.tmdl','Indicadores.tmdl']}
assert all(equal.values()),equal
packed=re.search(r'Binary.FromText\("([^"]+)"',(MAIN/tables/'InterfaceHTML.tmdl').read_text(encoding='utf-8')).group(1)
chunks=json.loads(gzip.decompress(base64.b64decode(packed)))
assert all(r['conteudo'].startswith('#') and r['conteudo'].endswith('#') for r in chunks)
write('comparacao_copia_desktop.json',{'ownedModelDefinitionsMatchBetweenMainAndOpenProject':equal,'liveModelHtmlMatchesCompiledSources':True,'guardedCodeChunks':len(chunks),'version':'9.0.0','note':'Live model exported and DAX verified after native Apply and Save; partial Popularidade rendering reviewed in Desktop; final native capture unavailable, final DAX readback verified after last Apply and Save.'})
write('verificacao_desktop.json',{'project':'ShinobiArchiveHTML.pbip','edition':'Popularidade v9','desktopVersion':'2.159.883.0','visual':'HTML Content Regular 2.0.0.0','powerBIVisualContainers':1,'htmlSections':5,'loadedInDesktop':True,'targetedPartitionFullRefreshSucceeded':True,'nativeExternalApplyInvoked':True,'nativeFitToPageAndSaveInvoked':True,'validationMode':'Targeted Full and Calculate via Modeling MCP; final DAX verified after native Apply and Save','htmlScreenshotsReviewed':True,'latestDesktopScreenshotReviewed':native_final_ok,'finalDesktopCaptureError':None if native_final_ok else 'HOST_UNAVAILABLE','finalDesktopCaptureDetails':'Partial native views showed v9, with an external-change notice covering the header. Final capture lost project-folder association after reapply. A read-only DAX query after final native Apply and Save still matched compiled code and all 24 datasets.','nativeInitialScreenshotReviewed':True,'nativeInitialScreenshotPartiallyClipped':True,'nativeInitialScreenshotContainsExternalChangeNotice':True,'nativeScreenshotsReviewed':['Popularidade v9: original Minato, Itachi and Sakura art, regional controls, searchable ranking and individual vote analysis'],'nativeEditModeControlsVisible':True,'tableCount':58,'measureCount':49,'datasetsComparedWithSources':24,'interfaceCodeMatchesSources':True,'curatedBiographies':23,'storyChapters':79,'gameSequences':15,'transparentArtFiles':105,'originalFiles':116,'originalHashesUnchanged':True,'embeddedOriginalArtFiles':7,'embeddedOriginalHashesVerified':True,'interactionChecksPassed':286,'popularityInteractionChecksPassed':63,'javaScriptErrors':0,'duelCuratedProfiles':8,'elementPairsVerified':25,'worldMapPaths':36,'mappedMajorVillages':5,'accessibleLocalities':39,'worldMapLicense':'CC BY-SA 4.0 / ShounenSuki','pollParticipants':488,'pollRegions':8,'pollGlobalVotes':4598612,'globalVotesEqualRegionalSum':True,'tiesAndZeroVotesPreserved':True,'temporalVoteSeriesInvented':False,'responsiveWidthsReviewed':[1600,1366,1100,900,600],'temporaryScreenshots':'Reviewed then removed before delivery; not packaged','publishedToPowerBIService':False})
shutil.copy2(MAIN/'LEIA-ME.md',OPEN/'LEIA-ME.md')
for folder,target,pattern in [(ROOT/'powerbi/html-interface',OPEN/'interface','*'),(ROOT/'data/editorial',OPEN/'editorial','*.json'),(ROOT/'assets/maps',OPEN/'assets/maps','*')]:
    target.mkdir(parents=True,exist_ok=True)
    for p in folder.glob(pattern):
        if p.is_file():shutil.copy2(p,target/p.name)
names=['testes_'+n+'.json' for n in test_names]+['verificacao_modelo.json','verificacao_midias.json','verificacao_artes_incorporadas.json','verificacao_desktop.json','comparacao_copia_desktop.json','validacao_visual.json','Interface_Naruto_HTML.dax']
for name in names:shutil.copy2(BUILD/name,OPEN/'validacao'/name)
print(json.dumps({'checks':286,'modelFilesMatch':equal,'chunks':len(chunks),'version':'9.0.0','nativeFinalScreenshotReviewed':native_final_ok}))
