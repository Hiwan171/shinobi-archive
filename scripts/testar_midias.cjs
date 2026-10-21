const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),input=path.resolve(process.argv[2]||'powerbi/html-interface/preview.html');
const session=JSON.parse(fs.readFileSync('powerbi/build/html/screenshot_media.json','utf8').replace(/^\uFEFF/,''));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1600,height:1000}});
 const errors=[],results=[],failedMedia=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(/naruto-game-sc|spritedatabase/.test(r.url())&&r.status()>=400)failedMedia.push({url:r.url(),status:r.status()})});
 const check=(name,value)=>{assert(value,name);results.push(name)};
 async function ready(){await page.waitForLoadState('networkidle',{timeout:15000}).catch(()=>{});await page.waitForTimeout(150);}
 async function shot(name){await ready();await page.screenshot({path:path.join(session.child,name+'.png'),animations:'disabled'});}
 async function pick(id){const name=await page.evaluate(id=>shinobiArchive.data.characters.find(c=>c.id===id).name,id);await page.locator('#character-search').fill(name);await page.locator(`[data-action="pick"][data-id="${id}"]`).click();await ready();}
 async function arsenal(){if(await page.locator('.stage-library').isHidden())await page.locator('.stage-library-button').click();}
 try{
  await page.goto('file:///'+input.replace(/\\/g,'/'));await page.waitForFunction(()=>window.shinobiArchive?.version==='9.0.0');await ready();
  check('Naruto usa arte transparente do site oficial',await page.locator('.hero .original-game-art').getAttribute('data-original-src').then(s=>s.includes('chara002/ill.png')));
  check('Avatar usa folha original de jogo',await page.locator('.file-avatar .game-sheet').first().getAttribute('href').then(s=>s.includes('spritedatabase.net')));
  check('Rasengan possui sequência original associada',await page.locator('.demo-stage').getAttribute('data-animation')==='game');
  await shot('v4-arquivo');
  await page.locator('[data-archive-action="play"]').click();await page.waitForTimeout(1700);
  check('Reprodução troca os quadros originais',await page.locator('#file-demo .game-sprite').getAttribute('data-frame').then(s=>Number(s)>0));
  check('Efeito usa pixels da mesma folha do personagem',await page.locator('#file-demo [data-role="effect"] image').getAttribute('href')===await page.locator('#file-demo [data-role="actor"] image').getAttribute('href'));
  await page.screenshot({path:path.join(session.child,'v4-rasengan.png')});
  await page.locator('[data-archive-action="expand-demo"]').click();await page.locator('.modal [data-archive-action="play"]').click();await page.waitForTimeout(1700);await page.screenshot({path:path.join(session.child,'v4-ampliado.png')});await page.keyboard.press('Escape');
  await page.locator('[data-archive-action="artwork"]').click();check('Arte original abre inteira com fonte e créditos',await page.locator('.original-art-viewer img').count()===1&&await page.locator('.original-art-caption a').count()===1);await shot('v4-arte-original');await page.keyboard.press('Escape');
  await page.locator('#phase-select').selectOption('Part I');check('Arte acompanha a fase clássica',await page.locator('.original-game-art').getAttribute('data-original-src').then(s=>s.includes('chara001/ill.png')));await page.locator('#phase-select').selectOption('Part II');
  await arsenal();await page.locator('[data-archive-action="arsenal-filter"][data-filter="animated"]').click();check('Filtro inclui só sequências específicas do personagem',await page.locator('.file-tech-item').count()===3&&await page.locator('.file-tech-item:not(.has-game-clip)').count()===0);
  await arsenal();await page.locator('[data-archive-action="arsenal-filter"][data-filter="all"]').click();await arsenal();await page.locator('#arsenal-search').fill('Summoning Technique');await page.locator('.file-tech-item').first().click();
  check('Técnica sem sequência não recebe simulação',await page.locator('.demo-stage').getAttribute('data-animation')==='none'&&await page.locator('[data-archive-action="play"]').isDisabled());
  check('Pose sem sequência é identificada',await page.locator('.demo-stage-label').innerText().then(s=>s.includes('SEM SEQUÊNCIA')));
  await pick(1293);check('Itachi inicia com Amaterasu do jogo',await page.locator('.file-demo-heading h3').innerText()==='Amaterasu'&&await page.locator('.demo-stage').getAttribute('data-animation')==='game');await page.locator('[data-archive-action="play"]').click();await page.waitForTimeout(1900);await page.screenshot({path:path.join(session.child,'v4-itachi.png')});
  await pick(1307);check('Sasuke inicia com Chidori do jogo',await page.locator('.file-demo-heading h3').innerText()==='Chidori');await page.locator('[data-archive-action="play"]').click();await page.waitForTimeout(1800);await page.screenshot({path:path.join(session.child,'v4-sasuke.png')});
  // Cada sequência é exercitada no mesmo fluxo de seleção usado pelo leitor.
  const manifest=JSON.parse(fs.readFileSync('data/editorial/midias_jogos.json','utf8')),cards=[];
  for(const clip of manifest.clips){
   await pick(clip.person);await arsenal();await page.locator('#arsenal-search').fill('');await page.locator(`[data-archive-action="technique"][data-id="${clip.technique}"]`).click();await page.locator('[data-archive-action="play"]').click();await page.waitForTimeout(1500);
   check(`Sequência ${clip.person}: ${clip.name}`,await page.locator('#file-demo .game-sprite').getAttribute('data-person')===String(clip.person)&&await page.locator('#file-demo .asset-unavailable').count()===0);
   cards.push(`<article><h3>${clip.person} · ${clip.name}</h3>${await page.locator('.demo-stage').evaluate(el=>el.outerHTML)}</article>`);
  }
  const css=await page.locator('#shinobi-app>style').textContent(),gallery=await browser.newPage({viewport:{width:1440,height:1320}});
  await gallery.setContent(`<html><body><div id="shinobi-app"><style>${css}body{height:auto;overflow:visible}#shinobi-app{display:block;height:auto;min-height:1320px;padding:20px;box-sizing:border-box;overflow:visible}.sprite-gallery{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.sprite-gallery article{border:1px solid #364250;padding:8px;border-radius:10px}.sprite-gallery h3{font-size:12px!important;margin:0 0 8px!important}.sprite-gallery .demo-stage{height:218px}</style><div class="sprite-gallery">${cards.join('')}</div></div></body></html>`);await gallery.waitForLoadState('networkidle');await gallery.screenshot({path:path.join(session.child,'v4-galeria-sequencias.png'),fullPage:true,animations:'disabled'});await gallery.close();
  await pick(377);check('Personagem sem arte promocional mantém o retrato disponível',await page.locator('.hero .original-game-art').count()===0);
  await pick(1344);await page.setViewportSize({width:1100,height:720});await shot('v4-responsivo');check('Composição menor não transborda horizontalmente',await page.locator('#shinobi-app').evaluate(el=>el.scrollWidth<=el.clientWidth+1));
  check('Mídias solicitadas carregaram sem HTTP de erro',failedMedia.length===0);check('Sem erros de JavaScript',errors.length===0);
  fs.writeFileSync('powerbi/build/html/testes_midias.json',JSON.stringify({input,passed:results.length,results,errors,failedMedia},null,2));console.log(JSON.stringify({passed:results.length,errors,failedMedia}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
