// Captura o estado existente para auditoria; não modifica a interface.
const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
const out=path.resolve('powerbi/auditoria-visual');
fs.mkdirSync(out,{recursive:true});
const tabs=['arquivo','grupos','comparador','popularidade','episodios','quiz'];
(async()=>{
 const browser=await chromium.launch({channel:'msedge'});
 const page=await browser.newPage({viewport:{width:1600,height:900}});
 const errors=[],shots=[];page.on('pageerror',e=>errors.push(e.message));
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('file:///'+path.resolve('powerbi/html-interface/preview.html').replaceAll('\\','/'));
 await page.waitForFunction(()=>!!window.shinobiArchive);
 async function capture(name){
  await page.waitForTimeout(400);
  await page.evaluate(async()=>Promise.all([...document.images].filter(i=>i.src.startsWith('data:')).map(i=>i.decode().catch(()=>{}))));
  await page.screenshot({path:path.join(out,name+'.png'),animations:'disabled'});
  const metrics=await page.evaluate(()=>{
   const screen=document.querySelector('#screen'),root=document.querySelector('#shinobi-app');
   const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
   const visible=e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&s.visibility!=='hidden'&&s.display!=='none'&&!!e.getClientRects().length};
   const leaves=[...root.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()&&visible(e)&&!e.closest('svg,select,script,style'));
   const controls=[...root.querySelectorAll('button,input,select')].filter(e=>visible(e)&&!e.closest('.modal'));
   return {
    viewport:{width:innerWidth,height:innerHeight},page:shinobiArchive.state.page,
    root:{...box(root),scrollWidth:root.scrollWidth,scrollHeight:root.scrollHeight},
    screen:{...box(screen),scrollWidth:screen.scrollWidth,scrollHeight:screen.scrollHeight,clientWidth:screen.clientWidth,clientHeight:screen.clientHeight},
    scrollAreas:[...root.querySelectorAll('*')].filter(e=>visible(e)&&e.scrollHeight>e.clientHeight+3&&/auto|scroll/.test(getComputedStyle(e).overflowY)).map(e=>({selector:e.id?'#'+e.id:'.'+String(e.className).trim().split(/\s+/).join('.'),clientHeight:e.clientHeight,scrollHeight:e.scrollHeight})),
    smallText:leaves.filter(e=>parseFloat(getComputedStyle(e).fontSize)<10).map(e=>({text:e.textContent.trim().slice(0,100),size:getComputedStyle(e).fontSize,color:getComputedStyle(e).color})).slice(0,70),
    clippedText:leaves.filter(e=>e.scrollWidth>e.clientWidth+3&&e.clientWidth>0&&!/visible/.test(getComputedStyle(e).overflowX)).map(e=>({text:e.textContent.trim().slice(0,120),width:e.clientWidth,scrollWidth:e.scrollWidth,title:e.title})).slice(0,25),
    controlsBeyondCanvas:controls.filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+1||r.bottom>innerHeight+1||r.left<0||r.top<0}).map(e=>({text:(e.textContent||e.getAttribute('aria-label')||'').trim().slice(0,80),...box(e)})).slice(0,15),
    imageFallbacks:[...root.querySelectorAll('.image-unavailable,.no-portrait')].filter(visible).length
   };
  });
  shots.push({name,...metrics});
 }
 const nav=async tab=>page.locator(`.nav-item[data-page="${tab}"]`).click();
 for(const size of [{width:1600,height:900},{width:1366,height:768},{width:1600,height:1000}]){
  await page.setViewportSize(size);
  for(const tab of tabs){await nav(tab);await capture(`html-${tab}-${size.width}${size.height===1000?'-1000':''}`)}
 }
 await page.setViewportSize({width:1600,height:900});
 await nav('arquivo');
 for(const tab of ['history','family']){await page.locator(`[data-tab="${tab}"]`).click();await capture('html-arquivo-'+tab)}
 await page.locator('[data-archive-action="biography"]').first().click();await capture('html-arquivo-biografia');await page.keyboard.press('Escape');
 await nav('grupos');await page.locator('.world-nation[data-world-village="16"]').click();await capture('html-grupos-folha');
 for(const tab of ['teams','people']){await page.locator(`[data-world-tab="${tab}"]`).click();await capture('html-grupos-'+tab)}
 await nav('comparador');
 const duelTabs=await page.locator('[data-duel-tab]').evaluateAll(es=>es.map(e=>e.dataset.duelTab));
 for(const tab of duelTabs){await page.locator(`[data-duel-tab="${tab}"]`).click();await capture('html-comparador-'+tab)}
 await nav('popularidade');
 for(const tab of ['compare','overview']){await page.locator(`[data-fan-tab="${tab}"]`).click();await capture('html-popularidade-'+tab)}
 await page.locator('#poll-region').selectOption('latin-america');await capture('html-popularidade-latina');
 await nav('episodios');
 for(const id of [1735,97938]){await page.locator(`[data-story-action="series"][data-series="${id}"]`).click();await capture('html-episodios-'+id)}
 await page.locator('.story-map-cell').first().click();await capture('html-episodios-detalhe');await page.keyboard.press('Escape');
 await page.locator('.story-results .pagination').scrollIntoViewIfNeeded();await capture('html-episodios-lista');await page.locator('#screen').evaluate(e=>e.scrollTop=0);
 await page.locator('#episode-search').fill('zzzzzzz');await capture('html-episodios-vazio');
 await nav('quiz');await page.locator('#quiz-size').selectOption('5');
 await page.locator('[data-quiz-action="start"]').click();await capture('html-quiz-jogo');
 for(let i=0;i<5;i++){
  const choice=await page.evaluate(()=>{const r=shinobiArchive.quiz.run;return r.deck[r.index].choices.findIndex(c=>c.correct)});
  await page.locator(`[data-choice="${choice}"]`).click();await page.locator('[data-quiz-action="confirm"]').click();
  if(!i)await capture('html-quiz-feedback');
  await page.locator('[data-quiz-action="next"]').click();
 }
 await capture('html-quiz-resultado');await page.locator('[data-quiz-action="review"]').click();await capture('html-quiz-revisao');
 fs.writeFileSync(path.join(out,'medicoes-html.json'),JSON.stringify({capturedAt:new Date().toISOString(),errors,shots},null,2));
 console.log(JSON.stringify({screenshots:shots.length,errors,screens:shots.map(s=>({name:s.name,outerScroll:s.screen.scrollHeight>s.screen.clientHeight+2,scrollAreas:s.scrollAreas.map(x=>x.selector),fallbacks:s.imageFallbacks}))},null,2));
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
