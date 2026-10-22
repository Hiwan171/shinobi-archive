const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const input=path.resolve(process.argv[2]||'powerbi/html-interface/preview.html'),session=JSON.parse(fs.readFileSync('powerbi/build/html/screenshot_mundo.json','utf8'));
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));const check=(name,value)=>{assert(value,name);results.push(name)};
 const shot=async name=>{await page.waitForTimeout(250);await page.screenshot({path:path.join(session.child,name+'.png'),animations:'disabled'})};
 try{
 await page.goto('file:///'+input.replace(/\\/g,'/'));await page.waitForFunction(()=>shinobiArchive?.version==='9.0.0');
 check('Menu tem seis abas, inclui o quiz e remove Jutsus',await page.locator('#navigation button').count()===6&&await page.locator('#navigation [data-page="quiz"]').count()===1&&await page.locator('#navigation [data-page="jutsus"]').count()===0);
 await page.locator('[data-page="grupos"]').click();
 check('Mundo Shinobi ocupa a segunda aba',await page.locator('#page-title').innerText().then(t=>t.includes('MUNDO SHINOBI')));
 check('Mapa incorpora 36 geometrias sem dependência remota',await page.locator('#world-map .atlas-land').count()===36);
 check('Cinco vilas possuem marcadores acessíveis',await page.locator('.atlas-pin[role="button"][tabindex="0"]').count()===5);
 check('Lista permite explorar as 39 localidades',await page.locator('#world-village option').count()===39);
 check('Total de vínculos usa pessoas distintas',await page.evaluate(()=>document.querySelector('#header-stats strong:last-of-type')!==null&&[...document.querySelectorAll('#header-stats strong')][2].textContent===new Set(shinobiArchive.data.villageLinks.map(r=>r.person)).size.toLocaleString('pt-BR')));
 for(const id of [16,28,11,17,14]){
  await page.locator(`.world-nation[data-world-village="${id}"]`).click();
  check('Contagem real de shinobi na vila '+id,await page.evaluate(id=>Number(document.querySelector('.world-metrics strong').textContent.replaceAll('.',''))===new Set(shinobiArchive.data.villageLinks.filter(r=>r.group===id).map(r=>r.person)).size,id));
 }
 await shot('mundo-nevoa');await page.locator('.world-nation[data-world-village="16"]').click();await shot('mundo-folha');
 await page.locator('[data-world-action="members"]').first().click();check('Clã abre membros do recorte da vila',await page.locator('.modal .person-chip').count()>0&&await page.evaluate(()=>[...document.querySelectorAll('.modal .person-chip')].every(el=>shinobiArchive.data.villageLinks.some(r=>r.group===16&&r.person===Number(el.dataset.id)))));await page.keyboard.press('Escape');
 await page.locator('[data-world-tab="teams"]').click();check('Equipes são calculadas por interseção real',await page.evaluate(()=>{const el=document.querySelector('[data-world-action="members"]'),id=Number(el.dataset.id),ids=new Set(shinobiArchive.data.villageLinks.filter(r=>r.group===16).map(r=>r.person));return el.textContent.includes(new Set(shinobiArchive.data.teamLinks.filter(r=>r.team===id&&ids.has(r.person)).map(r=>r.person)).size+' shinobi')}));await shot('mundo-equipes');
 await page.locator('#world-search').fill('zzzz inexistente');check('Busca sem resultados preserva estado vazio',await page.locator('#world-results .empty').count()===1);await page.locator('#world-search').fill('');
 await page.locator('[data-world-tab="people"]').click();check('Lista de shinobi permite paginação',await page.locator('.world-result-list .person-chip').count()===24);await page.locator('[data-world-action="more"]').click();check('Carregar mais amplia a lista',await page.locator('.world-result-list .person-chip').count()===48);
 await page.locator('.world-result-list .person-chip').first().click();check('Shinobi abre o Arquivo Ninja',await page.locator('.archive-v5').count()===1);
 await page.locator('[data-world-action="library"]').click();check('Catálogo global de técnicas continua disponível',await page.locator('#jutsu-search').count()===1);await page.locator('#jutsu-search').fill('Shadow Clone Technique');await page.waitForTimeout(250);await page.getByRole('button',{name:'Shadow Clone Technique',exact:true}).click();check('Técnicas preservam usuários reais',await page.locator('.tech-detail .person-chip').count()>=40);await page.keyboard.press('Escape');
 await page.locator('[data-page="grupos"]').click();await page.locator('[data-world-action="zoom-in"]').click();check('Zoom altera viewBox e indicador',await page.locator('#atlas-zoom').innerText()==='135%');
 await page.locator('#world-map').focus();await page.keyboard.press('ArrowRight');check('Mapa permite navegação por teclado',await page.locator('#world-map').getAttribute('viewBox').then(v=>Number(v.split(' ')[0])>200));await shot('mundo-zoom');await page.keyboard.press('Home');check('Restaurar recupera enquadramento completo',await page.locator('#world-map').getAttribute('viewBox')==='0 0 1500 882.2204');
 await page.locator('.atlas-pin[data-world-village="28"]').focus();await page.keyboard.press('Enter');check('Marcador pode ser acionado por teclado',await page.locator('.world-place-cover h2').innerText()==='SUNAGAKURE');
 await page.locator('#world-village').selectOption('0');check('Localidade fora dos marcadores continua consultável',await page.locator('.world-place-cover h2').innerText()==='AMEGAKURE'&&await page.locator('.world-country').innerText().then(t=>t.includes('não indicada')));await shot('mundo-amegakure');
 await page.locator('[data-world-action="sources"]').click();check('Fontes atribuem autor, licença e adaptação',await page.locator('.modal').innerText().then(t=>t.includes('ShounenSuki')&&t.includes('CC BY-SA 4.0')&&t.includes('contornos territoriais foram preservados')));await page.keyboard.press('Escape');
 await page.locator('.world-nation[data-world-village="16"]').click();await page.emulateMedia({reducedMotion:'reduce'});check('Pulso respeita redução de movimento',await page.locator('.atlas-pin.selected .atlas-pulse').evaluate(e=>getComputedStyle(e).animationName==='none'));
 for(const width of [1366,1100,900]){await page.setViewportSize({width,height:800});check('Sem transbordamento na largura '+width,await page.locator('#shinobi-app').evaluate(e=>e.scrollWidth<=e.clientWidth+1));await shot('mundo-'+width)}
 check('Sem erros JavaScript',errors.length===0);
 fs.writeFileSync('powerbi/build/html/testes_mundo.json',JSON.stringify({input,passed:results.length,results,errors},null,2));console.log(JSON.stringify({passed:results.length,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
