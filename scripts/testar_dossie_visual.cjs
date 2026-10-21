const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const input=path.resolve(process.argv[2]||'powerbi/html-interface/preview.html');
const session=JSON.parse(fs.readFileSync('powerbi/build/html/screenshot_dossie_visual.json','utf8').replace(/^\uFEFF/,''));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));const check=(name,value)=>{assert(value,name);results.push(name)};
 async function shot(name){await page.waitForTimeout(200);await page.screenshot({path:path.join(session.child,name+'.png'),animations:'disabled'});}
 async function pick(id){const name=await page.evaluate(id=>shinobiArchive.data.characters.find(c=>c.id===id).name,id);await page.locator('#character-search').fill(name);await page.locator(`[data-action="pick"][data-id="${id}"]`).click();}
 async function notesFit(){return page.locator('.stage-tech-notes').evaluate(el=>{const a=el.getBoundingClientRect(),b=document.querySelector('#file-demo').getBoundingClientRect();return a.top>=b.top&&a.bottom<=b.bottom+1})}
 try{
  await page.goto('file:///'+input.replace(/\\/g,'/'));await page.waitForFunction(()=>shinobiArchive?.version==='9.0.0');await page.waitForTimeout(300);
  check('Capa associa a arte oficial ao personagem com retrato alternativo',await page.locator('.rich-profile-art img').getAttribute('data-original-src').then(s=>s.includes('chara002/ill.png'))&&await page.locator('.rich-profile-art img').getAttribute('data-detail-person')==='1344');
  check('Símbolo da vila preserva a imagem documental',await page.locator('.rich-dossier-seal img').getAttribute('src').then(s=>s.startsWith('data:image/svg+xml;base64,')));
  check('Dados do perfil preservam aniversário e sangue',await page.locator('.stage-profile-facts').innerText().then(s=>s.includes('10 de outubro')&&s.includes('B')));
  check('Habilidades no perfil vêm dos vínculos do personagem',await page.evaluate(()=>[...document.querySelectorAll('.rich-inherited>span')].every(el=>shinobiArchive.data.inheritedLinks.filter(v=>v.person===1344).some(v=>shinobiArchive.data.inherited.find(a=>a.id===v.ability)?.name===el.title))));
  check('Botão de detalhes da técnica cabe inteiro sem rolagem interna',await notesFit());
  await shot('dossie-v6-perfil');
  await page.locator('[data-tab="history"]').click();
  check('Linha do tempo mostra somente capítulos liberados',await page.evaluate(()=>[...document.querySelectorAll('[data-detail-action="chapter"]')].every(el=>shinobiArchive.data.history.some(h=>h.person===1344&&!h.spoiler&&h.order===Number(el.dataset.order)))));
  check('Marcos narrativos são acessíveis e clicáveis',await page.locator('.rich-story-rail button').count()===2);
  await shot('dossie-v6-historia');await page.locator('.rich-story-rail button').nth(1).click();
  check('Marco abre o capítulo correspondente na biografia',await page.locator('.file-timeline [data-story-order="1"]').count()===1);
  check('Abrir marco mantém os desfechos protegidos',await page.locator('.file-spoiler-lock').count()===1&&await page.locator('.file-timeline article').count()===2);await page.keyboard.press('Escape');
  await page.locator('[data-tab="family"]').click();
  check('Rede apresenta o personagem e os familiares documentados',await page.locator('.rich-family-origin img').count()===1&&await page.locator('.rich-family-branches .file-family-item').count()===2);
  await shot('dossie-v6-vinculos');await page.locator('.rich-family-branches [data-action="person"]').first().click();check('Familiar abre seu próprio dossiê',await page.locator('.hero h2').textContent()==='Minato Namikaze');
  await pick(1344);await page.locator('[data-detail-action="poll"]').click();
  check('Votação abre todas as oito regiões com dados reais',await page.locator('.rich-poll-regions>div').count()===8);
  check('Global da votação é exibido uma vez, sem somar novamente regiões',await page.locator('.rich-poll-summary').innerText().then(t=>t.includes('#6')&&t.includes('182.911')));
  check('Regiões exibem votos e posições do modelo',await page.evaluate(()=>shinobiArchive.data.votes.filter(v=>v.person===1344&&v.region!=='all').every(v=>[...document.querySelectorAll('.rich-poll-regions>div')].some(el=>el.textContent.includes(v.votes.toLocaleString('pt-BR'))&&el.textContent.includes('#'+v.rank)))));
  await shot('dossie-v6-votacao');await page.keyboard.press('Escape');
  await page.locator('.stage-tech-notes').click();check('Detalhes mostram nome original, descrição e créditos dos sprites',await page.locator('.rich-native-technique').innerText()==='Rasengan'&&await page.locator('.stage-tech-detail .demo-description').isVisible()&&await page.locator('.rich-media-credit strong').innerText().then(t=>t.length>0));await shot('dossie-v6-tecnica-detalhes');await page.keyboard.press('Escape');
  await pick(1293);await page.locator('[data-stage-action="quick"]').filter({hasText:'Grande Bola de Fogo'}).click();
  check('Nome longo da técnica mantém detalhes acessíveis no painel',await notesFit());
  check('Categoria exibida corresponde à curadoria',await page.locator('.rich-tech-tags').innerText().then(t=>t.includes('Ninjutsu')));
  await page.locator('[data-archive-action="play"]').click();await page.waitForTimeout(1700);await shot('dossie-v6-itachi-fogo');
  await pick(928);check('Ausência de sequência continua explícita, sem reprodução fictícia',await page.locator('[data-archive-action="play"]').isDisabled()&&await page.locator('.rich-inline-credit').innerText().then(t=>t.includes('sem sequência')));
  await page.emulateMedia({reducedMotion:'reduce'});check('Efeitos novos respeitam movimento reduzido',await page.locator('.rich-tech-mark>i').evaluate(el=>getComputedStyle(el).animationName==='none'));
  const missing=await page.evaluate(()=>shinobiArchive.data.characters.find(c=>!c.rank).id);await pick(missing);await page.locator('[data-detail-action="poll"]').click();check('Personagem sem votação não recebe números inventados',await page.locator('.rich-poll-regions>div').count()===0&&await page.locator('.rich-poll-summary').innerText().then(t=>t.includes('Sem associação')));await page.keyboard.press('Escape');
  check('Sem erros de JavaScript',errors.length===0);
  fs.writeFileSync('powerbi/build/html/testes_dossie_visual.json',JSON.stringify({input,passed:results.length,results,errors},null,2));console.log(JSON.stringify({passed:results.length,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
