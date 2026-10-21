const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),input=path.resolve(process.argv[2]||path.join(root,'powerbi/html-interface/preview.html'));
const session=JSON.parse(fs.readFileSync(path.join(root,'powerbi/build/html/screenshot_dossie.json'),'utf8').replace(/^\uFEFF/,''));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
 const page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));
 const check=(name,value)=>{assert(value,name);results.push(name)};
 async function shot(name,animate=false){await page.waitForFunction(()=>[...document.querySelectorAll('img')].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).every(i=>i.complete),{},{timeout:10000}).catch(()=>{});await page.screenshot({path:path.join(session.child,name+'.png'),animations:animate?'allow':'disabled'});}
 async function arsenal(){if(await page.locator('.stage-library').isHidden())await page.locator('.stage-library-button').click();}
 try{
  await page.goto('file:///'+input.replace(/\\/g,'/'));await page.waitForFunction(()=>window.shinobiArchive?.version==='9.0.0');
  check('23 biografias e 79 capítulos integrados',await page.evaluate(()=>shinobiArchive.data.biographies.length===23&&shinobiArchive.data.history.length===79));
  check('Arsenal mostra só técnicas do personagem',await page.evaluate(()=>[...document.querySelectorAll('.file-tech-item')].every(el=>shinobiArchive.data.techniques.some(t=>t.person===1344&&t.technique===el.dataset.id))));
  check('Naruto inicia com Rasengan',await page.locator('.file-demo-heading h3').innerText()==='Rasengan');
  await shot('v3-arquivo');
  await page.locator('[data-archive-action="play"]').click();await page.waitForTimeout(1700);
  check('Executar técnica inicia cena animada',await page.locator('.demo-stage').evaluate(el=>el.classList.contains('is-playing')));
  await shot('v3-rasengan',true);
  await page.locator('[data-archive-action="expand-demo"]').click();await page.locator('.modal [data-archive-action="play"]').click();await page.waitForTimeout(1500);await shot('v3-demo-ampliada',true);await page.keyboard.press('Escape');
  await arsenal();await page.locator('[data-archive-action="arsenal-filter"][data-filter="animated"]').click();
  check('Filtro de prévias exclui técnicas sem animação',await page.locator('.file-tech-item:not(:has(.curated))').count()===0);
  await arsenal();await page.locator('#arsenal-search').fill('clones');
  check('Busca em português filtra o arsenal',await page.locator('.file-tech-item').count()>=1&&await page.locator('.file-tech-item').count()<=3);
  await page.locator('.file-tech-item').first().click();check('Trocar técnica altera a demonstração',await page.locator('.demo-stage').getAttribute('data-technique-type')==='clones');
  await page.locator('[data-archive-action="biography"]').first().click();
  check('Desfechos ocultos por padrão',await page.locator('.file-spoiler-lock').count()===1&&await page.locator('.file-timeline article').count()===2);
  await shot('v3-biografia');await page.locator('#story-spoilers').check();
  check('Revelar desfechos libera todos os capítulos',await page.locator('.file-timeline article').count()===5&&await page.locator('.file-spoiler-lock').count()===0);
  check('Capítulos têm links das fontes oficiais',await page.locator('.file-timeline .file-source').count()===5);await shot('v3-biografia-completa');await page.keyboard.press('Escape');
  await page.locator('[data-stage-action="tab"][data-tab="family"]').click();await page.locator('[data-archive-action="connections"]').first().click();
  check('Relações mostram familiares e equipes',await page.locator('.file-connections-grid .file-family-item').count()===7&&await page.locator('.file-connection-groups').innerText().then(s=>s.includes('Equipes')));await shot('v3-conexoes');await page.keyboard.press('Escape');
  await page.locator('#character-search').fill('itachi');await page.locator('[data-action="pick"][data-id="1293"]').click();
  check('Itachi tem biografia e avatar próprios',await page.locator('.hero h2').textContent()==='Itachi Uchiha'&&await page.locator('.file-avatar .game-sprite').count()===1);
  check('Itachi inicia com Amaterasu',await page.locator('.file-demo-heading h3').innerText()==='Amaterasu');
  await page.locator('[data-archive-action="play"]').click();await page.waitForTimeout(1800);await shot('v3-itachi',true);
  await arsenal();await page.locator('[data-archive-action="arsenal-filter"][data-filter="all"]').click();await arsenal();await page.locator('#arsenal-search').fill('Clone Great');
  if(await page.locator('.file-tech-item').count()){await page.locator('.file-tech-item').first().click();check('Técnica sem curadoria não recebe demonstração fictícia',await page.locator('.demo-stage').getAttribute('data-animation')==='none');}
  await page.locator('#character-search').fill('Fugaku');await page.locator('[data-action="pick"][data-id="1289"]').click();await page.locator('[data-archive-action="biography"]').first().click();
  check('Personagem sem biografia recebe perfil factual sinalizado',await page.locator('.file-coverage-note').innerText().then(s=>s.includes('curadoria')));await page.keyboard.press('Escape');
  await page.locator('#character-search').fill('Naruto Uzumaki');await page.locator('[data-action="pick"][data-id="1344"]').click();await page.locator('#phase-select').selectOption('Part I');
  check('Medidas continuam respeitando a fase',(await page.locator('.physical-grid').innerText()).includes('145.3cm - 147.5cm'));await page.locator('#phase-select').selectOption('Part II');
  await page.setViewportSize({width:1100,height:720});await shot('v3-responsivo');
  check('Não há transbordamento horizontal',await page.locator('#shinobi-app').evaluate(e=>e.scrollWidth<=e.clientWidth+1));
  check('Informações podem ser percorridas na altura menor',await page.locator('#dossier').evaluate(e=>e.scrollHeight>e.clientHeight));
  check('Sem erros de JavaScript',errors.length===0);
  fs.writeFileSync(path.join(root,'powerbi/build/html/testes_dossie.json'),JSON.stringify({input,passed:results.length,results,errors},null,2));console.log(JSON.stringify({passed:results.length,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
