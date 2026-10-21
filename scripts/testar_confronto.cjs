const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const input=path.resolve(process.argv[2]||'powerbi/html-interface/preview.html'),session=JSON.parse(fs.readFileSync('powerbi/build/html/screenshot_confronto.json','utf8'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));const check=(name,value)=>{assert(value,name);results.push(name)};
 async function shot(name){await page.waitForFunction(()=>getComputedStyle(document.querySelector('#screen')).opacity==='1');await page.waitForTimeout(250);await page.screenshot({path:path.join(session.child,name+'.png'),animations:'disabled'})}
 async function pair(a,b){await page.locator('#compare-a').selectOption(String(a));await page.locator('#compare-b').selectOption(String(b))}
 async function tab(name){await page.locator(`[data-duel-tab="${name}"]`).click()}
 const state=()=>page.evaluate(()=>({a:shinobiArchive.state.a,b:shinobiArchive.state.b,ea:shinobiArchive.state.duelA,eb:shinobiArchive.state.duelB,focus:shinobiArchive.state.duelFocus}));
 try{
 await page.goto('file:///'+input.replace(/\\/g,'/'));await page.waitForFunction(()=>shinobiArchive?.version==='9.0.0');await page.locator('[data-page="comparador"]').click();
 await page.locator('.duel-side-a .duel-original-art').evaluate(e=>e.decode());await page.locator('.duel-side-b .duel-original-art').evaluate(e=>e.decode());
 check('Dois personagens usam artes originais incorporadas',await page.locator('.duel-art>.original-game-art').count()===2&&await page.locator('.duel-side-a .duel-original-art').getAttribute('src').then(s=>s.startsWith('data:image/png;')));
 check('Seletores preservam os 1.431 ninjas em ambos os lados',await page.locator('#compare-a option').count()===1431&&await page.locator('#compare-b option').count()===1431);
 check('Naruto e Sasuke começam com Vento e Relâmpago',await state().then(s=>s.ea==='wind'&&s.eb==='lightning'));
 check('Leitura inicial indica vantagem de natureza de A',await page.locator('#duel-verdict').getAttribute('class').then(s=>s.includes('advantage'))&&await page.locator('#duel-verdict').innerText().then(t=>t.includes('nível comparável')));
 check('Roda tem cinco elementos acessíveis',await page.locator('.duel-element-node[role="button"][tabindex="0"]').count()===5);
 check('Vento supera Relâmpago e cede a Fogo',await page.locator('#duel-element-legend').innerText().then(t=>t.includes('Supera Relâmpago')&&t.includes('Cede a Fogo')));
 check('Setas têm sentidos e cores distintos',await page.locator('.duel-flow.good').getAttribute('marker-end')==='url(#duel-arrow-good)'&&await page.locator('.duel-flow.risk').getAttribute('marker-end')==='url(#duel-arrow-risk)');
 check('Técnicas em comum usam interseção real',await page.locator('.common-number').innerText()==='9');
 check('Afiliação e arsenais preservam os valores da base',await page.locator('.duel-side-a .duel-fighter-facts').innerText().then(t=>t.includes('94')&&t.includes('Konohagakure'))&&await page.locator('.duel-side-b .duel-fighter-facts').innerText().then(t=>t.includes('75')));
 check('A roda sinaliza a origem anime da natureza sem ocultar o registro',await page.locator('.duel-side-b [data-duel-nature="lightning"] sup').count()===1);
 check('Curadoria mostra recursos, condição e fontes',await page.locator('.duel-tactic-card').count()===2&&await page.locator('.duel-watch').count()===2&&await page.locator('.duel-tactic-source a').count()>=2);
 check('Escopo de toda a trajetória está visível',await page.locator('.duel-scope').innerText().then(t=>t.includes('toda a trajetória')));
 await shot('confronto-naruto-sasuke');
 const previous=await state();await page.locator('[data-duel-focus="water"]').click();check('Consulta livre não concede ou troca a natureza dos ninjas',await state().then(s=>s.ea===previous.ea&&s.eb===previous.eb&&s.focus==='water')&&await page.locator('.duel-focus-caption').textContent()==='CONSULTA LIVRE');
 await page.locator('[data-duel-action="focus"][data-side="a"]').click();check('Roda pode voltar à natureza escolhida de A',await page.locator('.duel-focus-name').textContent()==='Vento');
 await page.locator('[data-duel-focus="fire"]').focus();await page.keyboard.press('Enter');check('Elemento pode ser consultado pelo teclado',await page.locator('.duel-focus-name').textContent()==='Fogo');
 await tab('matrix');check('Matriz expõe os 25 pares',await page.locator('.duel-matrix-cell').count()===25);
 const keys=['fire','wind','lightning','earth','water'],expected=[['same','advantage','unmapped','unmapped','disadvantage'],['disadvantage','same','advantage','unmapped','unmapped'],['unmapped','disadvantage','same','advantage','unmapped'],['unmapped','unmapped','disadvantage','same','advantage'],['advantage','unmapped','unmapped','disadvantage','same']];
 for(let i=0;i<5;i++)for(let j=0;j<5;j++){
   await page.locator(`[data-duel-pair-a="${keys[i]}"][data-duel-pair-b="${keys[j]}"]`).click();
   check('Relação correta: '+keys[i]+' contra '+keys[j],await page.locator('#duel-verdict').getAttribute('class').then(s=>s.split(' ').includes(expected[i][j]))&&await state().then(s=>s.ea===keys[i]&&s.eb===keys[j]));
 }
 await page.locator('[data-duel-pair-a="wind"][data-duel-pair-b="lightning"]').click();await shot('confronto-matriz');
 await page.locator('[data-duel-action="swap"]').click();check('Inverter lados preserva as escolhas e inverte a relação',await state().then(s=>s.a===1307&&s.b===1344&&s.ea==='lightning'&&s.eb==='wind')&&await page.locator('#duel-verdict').getAttribute('class').then(s=>s.includes('disadvantage')));
 await pair(1307,1307);check('Mesmo personagem mantém interseção correta',await page.locator('.common-number').innerText()==='75');await tab('tactics');check('Confronto espelho é identificado',await page.locator('.duel-context-note').innerText().then(t=>t.includes('ESPELHO')));
 await pair(739,259);check('Lee sem natureza básica não recebe tipo inventado',await page.locator('.duel-side-a .duel-natures button').count()===0&&await state().then(s=>s.ea===null)&&await page.locator('#duel-verdict').getAttribute('class').then(s=>s.includes('missing')));
 check('Consulta livre não atribui elemento ao ninja sem registro',await page.locator('.duel-focus-caption').textContent()==='CONSULTA LIVRE');
 check('Lee mantém recursos de taijutsu e limitações documentadas',await page.locator('.duel-tactic-card.duel-side-a').innerText().then(t=>t.includes('Taijutsu')||t.includes('taijutsu')));await shot('confronto-lee-gaara');
 await tab('matrix');check('Matriz impede pares sem natureza registrada de A',await page.locator('.duel-matrix-cell:disabled').count()===25);
 await pair(377,1307);await tab('tactics');check('Personagem sem curadoria recebe sinalização e dados factuais',await page.locator('.duel-tactic-card.duel-side-a').innerText().then(t=>t.includes('COBERTURA DO CATÁLOGO')&&t.includes('Não há uma vulnerabilidade específica curada')));
 await page.locator('[data-duel-action="presets"]').click();check('Sugestões abrem quatro confrontos distintos',await page.locator('.duel-presets>button').count()===4);await page.locator('[data-duel-action="preset"][data-a="1307"][data-b="193"]').click();
 check('Sasuke e Deidara exibem interação específica com fonte oficial',await page.locator('.duel-context-note.special').innerText().then(t=>t.includes('desativar a argila'))&&await page.locator('.duel-context-note.special a').getAttribute('href').then(s=>s.endsWith('/01_1781')));await shot('confronto-sasuke-deidara');
 await page.locator('[data-duel-action="picker"][data-side="a"]').click();await page.locator('#duel-pick-search').fill('itachi');check('Busca de troca filtra todo o catálogo',await page.locator('[data-duel-action="choose"]').count()>=1&&await page.locator('[data-duel-action="choose"][data-id="1293"]').count()===1);await page.locator('[data-duel-action="choose"][data-id="1293"]').click();check('Escolher ninja altera apenas o lado solicitado',await state().then(s=>s.a===1293&&s.b===193));
 await pair(1344,1307);await tab('arsenal');check('Arsenal comum lista as nove técnicas sem misturar outros usuários',await page.locator('.duel-tech-grid>button').count()===9&&await page.evaluate(()=>[...document.querySelectorAll('.duel-tech-grid>button')].every(e=>[1344,1307].every(person=>shinobiArchive.data.techniques.some(t=>t.person===person&&t.technique===e.dataset.id)))));
 await page.locator('[data-duel-action="arsenal-filter"][data-filter="a"]').click();check('Recorte de A exclui as técnicas comuns',await page.locator('.duel-tech-caption').innerText().then(t=>t.startsWith('85 '))&&await page.evaluate(()=>[...document.querySelectorAll('.duel-tech-grid>button')].every(e=>!shinobiArchive.data.techniques.some(t=>t.person===1307&&t.technique===e.dataset.id))));
 await page.locator('[data-duel-action="more-techniques"]').click();check('Paginação amplia o arsenal sem duplicar técnicas',await page.locator('.duel-tech-grid>button').count()===60);
 await page.locator('#duel-tech-search').fill('Rasengan');check('Busca do arsenal cruza nomes e descrições disponíveis',await page.locator('.duel-tech-grid>button').count()>0&&await page.locator('.duel-tech-grid').innerText().then(t=>t.includes('Rasengan')));await shot('confronto-arsenal');
 const rasengan=await page.evaluate(()=>shinobiArchive.data.jutsus.find(j=>j.name==='Rasengan').id);await page.locator(`[data-duel-action="technique"][data-id="${rasengan}"]`).click();check('Técnica abre descrição e personagens do recorte',await page.locator('.duel-tech-owners .person-chip').count()===1&&await page.locator('[data-duel-action="preview"]').count()===1);await page.locator('[data-duel-action="preview"]').click();check('Demonstração abre a técnica correta no Arquivo Ninja',await page.locator('.archive-v5').count()===1&&await page.locator('#file-demo .demo-stage').getAttribute('data-technique-type')==='rasengan');
 await page.locator('[data-page="comparador"]').click();await tab('links');check('Linhagens e equipes preservam os vínculos do modelo',await page.locator('.duel-links-card.duel-side-a').innerText().then(t=>t.includes('Uzumaki')||t.includes('Team'))&&await page.locator('.duel-links-card.duel-side-b').innerText().then(t=>t.includes('Sharingan')));await shot('confronto-linhagens');
 await page.locator('[data-duel-action="rules"]').first().click();check('Fontes distinguem regras do evento e relações da obra',await page.locator('.modal').innerText().then(t=>t.includes('regras próprias de um jogo')&&t.includes('315–316')&&t.includes('não define o vencedor')));check('Relações não atribuem multiplicadores a linhagens',await page.locator('.modal').innerText().then(t=>t.includes('não recebem multiplicadores')));await page.keyboard.press('Escape');
 await tab('tactics');await page.locator('[data-duel-tab="tactics"]').focus();await page.keyboard.press('ArrowRight');check('Abas navegam por teclado e atualizam aria-selected',await page.locator('[data-duel-tab="matrix"]').getAttribute('aria-selected')==='true');await page.keyboard.press('End');check('Tecla End alcança a última análise',await page.locator('[data-duel-tab="links"]').getAttribute('aria-selected')==='true');
 await pair(1344,1307);await tab('tactics');await page.emulateMedia({reducedMotion:'reduce'});check('Efeitos respeitam movimento reduzido',await page.locator('.duel-flow.good').evaluate(e=>getComputedStyle(e).animationName==='none'));
 for(const width of [1600,1366,1100,900,600]){
   await page.setViewportSize({width,height:width===1600?1000:800});
   check('Layout sem transbordamento horizontal em '+width,await page.locator('#shinobi-app').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   check('Arena não sobrepõe a nota de leitura em '+width,await page.evaluate(()=>document.querySelector('.duel-arena').getBoundingClientRect().bottom<=document.querySelector('.duel-scope').getBoundingClientRect().top+1));
   await shot('confronto-'+width);
   if(width<=1100){await page.locator('#screen').evaluate(e=>e.scrollTop=e.scrollHeight);check('Informações inferiores alcançáveis em '+width,await page.locator('.duel-tactic-card.duel-side-b .duel-watch').evaluate(e=>e.getBoundingClientRect().bottom<=innerHeight));await shot('confronto-'+width+'-detalhes');await page.locator('#screen').evaluate(e=>e.scrollTop=0)}
 }
 check('Nenhum erro JavaScript',errors.length===0);fs.writeFileSync('powerbi/build/html/testes_confronto.json',JSON.stringify({input,passed:results.length,results,errors},null,2));console.log(JSON.stringify({passed:results.length,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
