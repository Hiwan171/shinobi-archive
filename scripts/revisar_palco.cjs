const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path');
const input=path.resolve(process.argv[2]||'powerbi/html-interface/preview.html');
const session=JSON.parse(fs.readFileSync('powerbi/build/html/screenshot_palco.json','utf8').replace(/^\uFEFF/,''));
(async()=>{
 const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}),page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('file:///'+input.replace(/\\/g,'/'));await page.waitForFunction(()=>window.shinobiArchive?.version==='9.0.0');
 async function shot(name){await page.waitForTimeout(700);await page.evaluate(()=>Promise.race([Promise.all([...document.images].filter(i=>{const r=i.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0}).map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,7000))]));await page.screenshot({path:path.join(session.child,name+'.png'),animations:'disabled'});}
 await shot('palco-naruto');
 await page.locator('[data-stage-action="tab"][data-tab="history"]').click();await shot('palco-historia');
 await page.locator('[data-stage-action="tab"][data-tab="family"]').click();await shot('palco-vinculos');
 await page.locator('.stage-library-button').click();await shot('palco-arsenal');
 await page.locator('[data-stage-action="arsenal"][aria-label]').click();
 await page.locator('.stage-actions [data-stage-action="facts"]').click();await shot('palco-ficha');await page.keyboard.press('Escape');
 await page.locator('#character-search').fill('Itachi Uchiha');await page.locator('[data-action="pick"][data-id="1293"]').click();await page.locator('[data-archive-action="play"]').click();await page.waitForTimeout(1700);await shot('palco-itachi');
 await page.locator('#character-search').fill('Orochimaru');await page.locator('[data-action="pick"][data-id="1171"]').count().then(async n=>{if(n)await page.locator('[data-action="pick"][data-id="1171"]').click();else await page.locator('.ninja-tile').first().click();});await shot('palco-orochimaru');
 await page.setViewportSize({width:1100,height:720});await shot('palco-1100');await page.locator('#dossier').evaluate(el=>el.scrollTop=el.scrollHeight);await shot('palco-1100-rodape');
 console.log(JSON.stringify({errors,child:session.child}));await browser.close();if(errors.length)process.exit(1);
})().catch(e=>{console.error(e);process.exit(1)});
