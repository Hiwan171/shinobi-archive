const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const input=path.resolve(process.argv[2]||'powerbi/html-interface/preview.html');
const out=path.resolve('powerbi/build/html');
(async()=>{
 const browser=await chromium.launch({channel:'msedge'}),page=await browser.newPage({viewport:{width:1600,height:1000}});
 const errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
 const check=(name,value)=>{assert(value,name);results.push(name)};
 const series=async id=>page.locator(`[data-story-action="series"][data-series="${id}"]`).click();
 const reset=async()=>page.locator('.story-results-heading .story-reset').click();
 const shot=async name=>{await page.waitForFunction(()=>getComputedStyle(document.querySelector('#screen')).opacity==='1');await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'})};
 const verifyRows=async()=>page.evaluate(()=>{
   const {data,state}=shinobiArchive,q=state.episodeQuery.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
   const expected=data.episodes.filter(e=>e.series===state.series&&(!state.arc||e.arc===state.arc)&&(!state.episodeKind||e.kind===state.episodeKind)&&(!q||(/^\d+$/.test(q)?e.number===Number(q):e.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().includes(q)))).sort((a,b)=>a.number-b.number);
   const actual=[...document.querySelectorAll('[data-episode-row]')].map(e=>e.dataset.episodeRow);
   const expectedPage=expected.slice(state.episodePage*20,(state.episodePage+1)*20).map(e=>e.id);
   const cells=[...document.querySelectorAll('.story-map-cell:not([data-dimmed])')].map(e=>e.dataset.episode);
   return JSON.stringify(actual)===JSON.stringify(expectedPage)&&JSON.stringify(cells)===JSON.stringify(expected.map(e=>e.id))&&document.querySelector('.story-result-count').textContent.startsWith(expected.length.toLocaleString('pt-BR')+' ');
 });
 try{
  await page.goto('file:///'+input.replace(/\\/g,'/'),{waitUntil:'domcontentloaded'});
  await page.locator('[data-page="episodios"]').click();
  check('As três séries podem ser selecionadas',await page.locator('.story-series>button').count()===3);
  check('Snapshot mantém 1.013 episódios e 80 arcos',await page.evaluate(()=>shinobiArchive.data.episodes.length===1013&&shinobiArchive.data.arcs.length===80));
  for(const [id,count] of [[20,220],[1735,500],[97938,293]]){
   await series(id);
   const artFile={20:'storm_chara001.png',1735:'storm_chara002.png',97938:'storm_chara018.png'}[id];
   const expectedArt='data:image/png;base64,'+fs.readFileSync(path.resolve('assets/game_art',artFile)).toString('base64');
   await page.locator('.story-art img').evaluate(img=>img.decode());
   check('Arte original incorporada e variante correta em '+id,await page.locator('.story-art img').getAttribute('src')===expectedArt);
   check('Cabeçalho e mapa preservam a série '+id,await page.locator('#header-stats strong').first().textContent()===String(count)&&await page.locator('.story-map-cell').count()===count);
   check('Lista e mapa correspondem aos dados da série '+id,await verifyRows());
   check('Arcos e contagens usam associações reais em '+id,await page.evaluate(()=>{
    const {data,state}=shinobiArchive;
    return [...document.querySelectorAll('.story-arc-list [data-arc]')].every(b=>Number(b.querySelector('b').textContent.replaceAll('.',''))===data.episodes.filter(e=>e.series===state.series&&(!b.dataset.arc||e.arc===b.dataset.arc)).length);
   }));
   check('Classificações e proporções usam a série inteira em '+id,await page.evaluate(()=>{
    const {data,state}=shinobiArchive,all=data.episodes.filter(e=>e.series===state.series);
    return [...document.querySelectorAll('.story-composition [data-kind]')].every(b=>{
     const n=all.filter(e=>e.kind===b.dataset.kind).length;
     return Number(b.querySelector('strong').textContent.replaceAll('.',''))===n&&b.querySelector('small').textContent===(n/all.length*100).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%';
    });
   }));
   const header=await page.locator('#header-stats').textContent();
   const kinds=await page.locator('#story-kind option').evaluateAll(es=>es.slice(1).map(e=>e.value));
   for(const kind of kinds){await page.locator('#story-kind').selectOption(kind);check('Filtro '+kind+' confere com dados em '+id,await verifyRows())}
   check('Filtro não muda denominador dos indicadores em '+id,header===await page.locator('#header-stats').textContent());
   await reset();await page.locator('#episode-search').fill('001');
   check('Busca numérica exata encontra só episódio 1 em '+id,await verifyRows()&&await page.locator('[data-episode-row]').count()===1&&await page.locator('.story-number').textContent()==='001');
   check('Busca mantém foco sem reconstruir o painel em '+id,await page.locator('#episode-search').evaluate(e=>e===document.activeElement));
   await page.waitForTimeout(230);check('Busca permanece estável após o debounce antigo em '+id,await page.locator('#episode-search').evaluate(e=>e===document.activeElement));
   await page.locator('#episode-search').fill('NARUTO');check('Busca textual ignora caixa em '+id,await verifyRows());
   await page.locator('#episode-search').fill('zzzz inexistente');check('Estado vazio e limites de paginação em '+id,await verifyRows()&&await page.locator('.story-empty').count()===1&&await page.locator('.pagination button:disabled').count()===2);
   await reset();await page.locator('.pagination [data-dir="1"]').click();check('Paginação avança vinte registros em '+id,await verifyRows()&&await page.locator('.story-number').first().textContent()==='021');
   await page.locator('.pagination [data-dir="-1"]').click();check('Paginação volta ao primeiro episódio em '+id,await verifyRows()&&await page.locator('.story-number').first().textContent()==='001');
   await page.locator('#screen').evaluate(e=>e.scrollTop=0);await shot('episodios-serie-'+id);
  }
  // Every arc is checked against episode associations, not inferred interval lengths.
  for(const id of [20,1735,97938]){
   await series(id);const arcs=await page.locator('.story-arc-list [data-arc]').evaluateAll(es=>es.map(e=>e.dataset.arc).filter(Boolean));
   for(const arc of arcs){await page.locator(`.story-arc-list [data-arc="${arc}"]`).click();check('Arco '+arc+' filtra lista e mapa corretamente',await verifyRows())}
  }
  await series(20);await page.locator('.story-composition [data-kind="Filler"]').click();
  check('Composição atua como filtro e sincroniza seletor',await page.locator('#story-kind').inputValue()==='Filler'&&await verifyRows());
  await page.locator('.story-arc-list [data-arc]').nth(1).click();check('Arco e classificação podem ser combinados',await verifyRows());
  await page.locator('.story-composition [data-kind="Filler"]').click();check('Segundo clique remove filtro de classificação',await page.locator('#story-kind').inputValue()===''&&await verifyRows());
  await reset();await page.locator('.story-map-cell').first().focus();await page.keyboard.press('Enter');
  check('Mapa abre detalhe por teclado com título e arco originais',await page.locator('.story-detail>h3').textContent()==='Enter: Naruto Uzumaki!'&&await page.locator('.story-detail-arc strong').textContent()==='Land of Waves');
  check('Primeiro episódio desativa anterior',await page.locator('.story-detail-nav button').first().isDisabled());
  await page.keyboard.press('Tab');check('Tab alcança o primeiro controle do modal',await page.locator('.modal-close').evaluate(e=>e===document.activeElement));
  await page.keyboard.press('Shift+Tab');check('Foco permanece dentro do modal',await page.locator('.story-detail-nav button').last().evaluate(e=>e===document.activeElement));
  await page.locator('.story-detail-nav button').last().click();check('Próximo episódio navega pela série',await page.locator('.story-detail>h3').textContent()===await page.evaluate(()=>shinobiArchive.data.episodes.find(e=>e.series===20&&e.number===2).title));
  await page.keyboard.press('Escape');check('Escape fecha modal e devolve foco ao mapa',await page.locator('.modal').count()===0&&await page.locator('.story-map-cell').first().evaluate(e=>e===document.activeElement));
  await page.locator('.story-map-cell').last().click();check('Último episódio desativa próximo',await page.locator('.story-detail-nav button').last().isDisabled());await shot('episodios-detalhe');
  await page.locator('[data-story-action="explore-arc"]').click();check('Detalhe abre arco correspondente e fecha modal',await page.locator('.modal').count()===0&&await verifyRows()&&await page.evaluate(()=>Boolean(shinobiArchive.state.arc)));
  await page.locator('.story-source-link').click();check('Fontes explicam classificação, denominadores e dados sem datas verificadas',await page.locator('.story-source-notes').textContent().then(t=>t.includes('classificações comunitárias')&&t.includes('série completa')&&t.includes('Datas de exibição não verificadas')));
  check('Licença e snapshot possuem links',await page.locator('.story-source-notes a').count()===2);await page.keyboard.press('Escape');
  check('Fechar fontes devolve foco ao controle',await page.locator('.story-source-link').evaluate(e=>e===document.activeElement));
  await page.locator('.story-source-link').click();await page.locator('.modal-close').click();check('Fechar pelo botão também devolve foco',await page.locator('.story-source-link').evaluate(e=>e===document.activeElement));
  await reset();await series(1735);check('Trocar série limpa recortes anteriores',await page.locator('#episode-search').inputValue()===''&&await page.locator('#story-kind').inputValue()===''&&await verifyRows());
  for(const width of [1600,1366,1100,900,600]){
   await page.setViewportSize({width,height:width===1600?1000:800});await page.locator('#screen').evaluate(e=>e.scrollTop=0);
   check('Sem transbordamento horizontal em '+width,await page.evaluate(()=>document.querySelector('#shinobi-app').scrollWidth<=innerWidth+1&&document.querySelector('#screen').scrollWidth<=document.querySelector('#screen').clientWidth+1));
   check('Controles da série e herói não se sobrepõem em '+width,await page.evaluate(()=>document.querySelector('.story-series').getBoundingClientRect().bottom<document.querySelector('.story-hero').getBoundingClientRect().top));
   await shot('episodios-'+width);
   await page.locator('.story-results-heading').scrollIntoViewIfNeeded();check('Guia alcançável por rolagem em '+width,await page.locator('.story-results-heading').evaluate(e=>{const r=e.getBoundingClientRect();return r.top>=0&&r.top<innerHeight}));await shot('episodios-'+width+'-guia');
  }
  await page.setViewportSize({width:1600,height:1000});await page.emulateMedia({reducedMotion:'reduce'});check('Movimento reduzido respeitado',await page.locator('.story-map-cell').first().evaluate(e=>getComputedStyle(e).transitionDuration==='0s'));
  for(const [key,selector] of [['arquivo','.archive-v5'],['grupos','.world-page'],['comparador','.duel-page'],['popularidade','.fan-page']]){
   await page.locator(`.nav-item[data-page="${key}"]`).click();
   // Existing sections must render and preserve the shared navigation.
   check('Aba pronta '+key+' continua navegável',await page.locator('#screen').textContent().then(t=>t.trim().length>100)&&await page.locator(`[data-page="${key}"].active`).count()===1);
  }
  await page.locator('[data-page="episodios"]').click();check('Retornar à aba preserva a série e dados',await page.locator('#header-stats strong').first().textContent()==='500'&&await verifyRows());
  check('Sem erros JavaScript',errors.length===0);
  const report={input,passed:results.length,results,errors,desktopValidated:false};fs.writeFileSync(path.join(out,'testes_episodios.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({passed:results.length,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
