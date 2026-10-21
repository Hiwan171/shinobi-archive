const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const input=path.resolve(process.argv[2]||'powerbi/html-interface/preview.html');
const session=JSON.parse(fs.readFileSync('powerbi/build/html/screenshot_palco.json','utf8').replace(/^\uFEFF/,''));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));const check=(name,value)=>{assert(value,name);results.push(name)};
 async function tab(id){await page.locator(`[data-stage-action="tab"][data-tab="${id}"]`).click();}
 async function capture(name){await page.waitForTimeout(500);await page.screenshot({path:path.join(session.child,name+'.png'),animations:'disabled'});}
 try{
  await page.goto('file:///'+input.replace(/\\/g,'/'));await page.waitForFunction(()=>shinobiArchive?.version==='9.0.0');
  await page.locator('.original-game-art').evaluate(el=>el.decode());
  const b=await page.locator('.original-game-art').boundingBox(),h=await page.locator('.stage-hero').boundingBox();
  check('Arte central ocupa o palco e permanece dentro dele',b.height>300&&b.x>=h.x&&b.x+b.width<=h.x+h.width+1);
  check('Prévia e informações ao lado do personagem',await page.locator('.stage-sidebar').evaluate(el=>el.getBoundingClientRect().left>document.querySelector('.stage-hero').getBoundingClientRect().right));
  check('Lista completa recolhida para dar espaço à demonstração',await page.locator('#stage-library').isHidden()&&await page.locator('.demo-stage').isVisible());
  await page.locator('.stage-tabs [aria-selected="true"]').focus();await page.keyboard.press('ArrowRight');
  check('Abas acessíveis por teclado',await page.locator('[data-tab="history"]').getAttribute('aria-selected')==='true'&&await page.locator('.stage-history').isVisible());
  await tab('family');check('Vínculos mantêm familiares e acesso às equipes',await page.locator('.stage-family .file-family-item').count()===2&&await page.locator('[data-archive-action="connections"]').isVisible());
  await page.locator('[data-archive-action="connections"]').click();check('Todas as relações continuam disponíveis',await page.locator('.file-connections-grid .file-family-item').count()===7);await page.keyboard.press('Escape');
  await page.locator('.stage-actions [data-stage-action="facts"]').click();
  check('Ficha completa preserva patente, sangue, equipes e linhagens',await page.locator('.stage-facts-modal').innerText().then(t=>['Patente nesta fase','Tipo sanguíneo','Equipes e afiliações','Linhagens e habilidades especiais'].every(v=>t.includes(v))));await page.keyboard.press('Escape');
  await page.locator('#phase-select').selectOption('Part I');check('Fase altera medidas e arte oficial',await page.locator('.physical-grid').innerText().then(t=>t.includes('145.3cm'))&&await page.locator('.original-game-art').getAttribute('data-original-src').then(t=>t.includes('chara001/ill.png')));await page.locator('#phase-select').selectOption('Part II');
  await page.locator('.stage-library-button').click();await page.locator('#arsenal-search').fill('clones');
  check('Busca do arsenal preservada na biblioteca',await page.locator('.file-tech-item').count()>=1&&await page.locator('.file-tech-item').count()<=3);
  await page.locator('.file-tech-item').first().click();check('Selecionar técnica fecha biblioteca e atualiza prévia',await page.locator('#stage-library').isHidden()&&await page.locator('.file-demo-heading h3').innerText().then(t=>t.includes('Clones')));
  await page.locator('.stage-tech-notes').click();check('Descrição completa e fonte da técnica acessíveis',await page.locator('.stage-tech-detail .demo-description').isVisible()&&await page.locator('.stage-tech-detail .game-source-caption').innerText().then(t=>t.includes('Shinobi Rumble')));await page.keyboard.press('Escape');
  await page.locator('.stage-library-button').click();await page.keyboard.press('Escape');check('Escape fecha biblioteca e devolve foco',await page.locator('#stage-library').isHidden()&&await page.locator('.stage-library-button').evaluate(el=>el===document.activeElement));
  await page.locator('[data-stage-action="quick"]').first().click();await page.locator('[data-archive-action="play"]').click();await tab('history');
  check('Consultar história preserva execução da demonstração',await page.locator('.demo-stage').evaluate(el=>el.classList.contains('is-playing')));
  await tab('overview');await capture('palco-final-naruto');
  await page.mouse.move(h.x+h.width*.7,h.y+400);await page.waitForTimeout(400);check('Arte responde ao cursor',await page.locator('.stage-portrait').evaluate(el=>el.style.getPropertyValue('--px')!==''));
  await page.emulateMedia({reducedMotion:'reduce'});await page.mouse.move(0,0);await page.mouse.move(h.x+h.width*.4,h.y+400);check('Movimento reduzido respeita preferência do sistema',await page.locator('.file-artwork-button').evaluate(el=>getComputedStyle(el).transform==='none'));await page.emulateMedia({reducedMotion:'no-preference'});
  for(const [width,height] of [[1366,768],[1100,720],[900,720]]){
   await page.setViewportSize({width,height});await page.locator('#dossier').evaluate(el=>el.scrollTop=0);
   check(`Sem transbordamento horizontal em ${width}x${height}`,await page.locator('#shinobi-app').evaluate(el=>el.scrollWidth<=el.clientWidth+1)&&await page.locator('#dossier').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
   await page.locator('#dossier').evaluate(el=>el.scrollTop=el.scrollHeight);check(`Conteúdo inferior alcançável em ${width}x${height}`,await page.locator('.stage-sidebar-foot').evaluate(el=>{const r=el.getBoundingClientRect();return r.bottom<=innerHeight&&r.top>0}));await capture(`palco-final-${width}`);
  }
  check('Sem erros de JavaScript',errors.length===0);
  fs.writeFileSync('powerbi/build/html/testes_palco.json',JSON.stringify({input,passed:results.length,results,errors},null,2));console.log(JSON.stringify({passed:results.length,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
