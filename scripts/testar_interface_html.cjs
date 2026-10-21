// Exercita os fluxos do usuário; pode usar a saída real de DAX ou a prévia local.
const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..');
const input=path.resolve(process.argv[2]||path.join(root,'powerbi/html-interface/preview.html'));
const screenshots=process.argv[3];
(async()=>{
  const browser=await chromium.launch({headless:true,executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'});
  const page=await browser.newPage({viewport:{width:1600,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const results=[];
  const check=(name,condition)=>{assert(condition,name);results.push(name);};
  async function state(){return await page.evaluate(()=>({page:window.shinobiArchive.state.page,selected:window.shinobiArchive.state.selected}));}
  async function nav(key){await page.locator(`[data-action="nav"][data-page="${key}"]`).last().click();}
  async function capture(name){if(screenshots){
    await page.waitForFunction(()=>[...document.querySelectorAll('#shinobi-app img')].filter(img=>{const r=img.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0&&r.left<innerWidth&&r.right>0;}).every(img=>img.complete),{},{timeout:12000}).catch(()=>{});
    await page.screenshot({path:path.join(screenshots,name+'.png'),animations:'disabled'});
  }}
  try{
    await page.goto('file:///'+input.replace(/\\/g,'/'));
    await page.waitForFunction(()=>!!window.shinobiArchive);
    check('Catálogo completo vindo do modelo',await page.locator('#catalog-count').innerText()==='1.431');
    check('Ficha inicial de Naruto',await page.locator('.hero h2').textContent()==='Naruto Uzumaki');
    check('Retratos mantêm altura e rolagem do catálogo',await page.locator('.ninja-tile').first().evaluate(el=>el.getBoundingClientRect().height>=120));
    await capture('html-arquivo');
    await page.locator('#character-search').fill('sasuke');
    await page.locator('[data-action="pick"][data-id="1307"]').click();
    check('Busca e seleção alteram a ficha',await page.locator('.hero h2').textContent()==='Sasuke Uchiha');
    await page.locator('#character-search').fill('naruto');
    await page.locator('[data-action="pick"][data-id="1344"]').click();
    await page.locator('#phase-select').selectOption('Part I');
    check('A fase altera as medidas físicas',(await page.locator('.physical-grid').innerText()).includes('145.3cm - 147.5cm'));
    await page.locator('#phase-select').selectOption('Part II');
    await nav('grupos');await capture('html-grupos');
    await page.locator('[data-world-action="members"]').first().click();
    check('Barra abre os membros reais do grupo',await page.locator('.modal .person-chip').count()>0);
    await page.locator('.modal .person-chip').first().click();
    check('Membro abre seu próprio dossiê',(await state()).page==='arquivo');
    await page.locator('[data-world-action="library"]').click();await capture('html-jutsus');
    await page.locator('#jutsu-search').fill('Shadow Clone Technique');
    await page.waitForTimeout(250);
    await page.getByRole('button',{name:'Shadow Clone Technique',exact:true}).click();
    check('Técnica mostra usuários vinculados',await page.locator('.tech-detail .person-chip').count()>=40);
    await page.keyboard.press('Escape');
    await nav('comparador');await capture('html-comparador');
    check('Comparador cruza Naruto e Sasuke',await page.locator('.common-number').innerText()==='9');
    await page.locator('#compare-a').selectOption('1307');
    check('Trocar personagem recalcula interseção',await page.locator('.common-number').innerText()==='75');
    await page.locator('#compare-a').selectOption('1344');
    await nav('popularidade');await capture('html-popularidade');
    check('Votação global sem duplicação',(await page.locator('#header-stats').innerText()).includes('4.598.612'));
    await page.locator('#poll-region').selectOption('latin-america');
    const expected=await page.evaluate(()=>window.shinobiArchive.data.votes.filter(v=>v.region==='latin-america').reduce((a,v)=>a+v.votes,0).toLocaleString('pt-BR'));
    check('Região recalcula ranking e votos',(await page.locator('#header-stats').innerText()).includes(expected));
    await nav('episodios');await capture('html-episodios');
    check('Naruto tem 220 episódios',(await page.locator('#header-stats strong').first().innerText())==='220');
    check('Todas as classificações são visíveis',await page.locator('.legend-entry').count()>=3);
    await page.locator('#series-select').selectOption('1735');
    check('Shippuden filtra episódios e arcos',(await page.locator('#header-stats strong').first().innerText())==='500' && await page.locator('#arc-select option').count()===39);
    await page.locator('#series-select').selectOption('97938');
    check('Boruto filtra episódios e arcos',(await page.locator('#header-stats strong').first().innerText())==='293' && await page.locator('#arc-select option').count()===17);
    await page.locator('#arc-select').selectOption({index:1});
    check('O arco reduz a lista de episódios',Number((await page.locator('#header-stats strong').first().innerText()).replaceAll('.',''))<293);
    await page.locator('[data-action="sources"]').click();
    check('Créditos e limites acessíveis',await page.locator('.modal').innerText().then(t=>t.includes('CC BY 4.0')));
    await page.keyboard.press('Escape');
    check('Escape fecha a sobreposição',await page.locator('.modal').count()===0);
    await nav('arquivo');
    await page.setViewportSize({width:1100,height:720});
    const bounds=await page.locator('#shinobi-app').evaluate(el=>({w:el.scrollWidth,cw:el.clientWidth,h:el.scrollHeight,ch:el.clientHeight}));
    check('Sem transbordamento horizontal na largura menor',bounds.w<=bounds.cw+1);
    await capture('html-responsivo');
    check('JavaScript sem erros',errors.length===0);
    fs.writeFileSync(path.join(root,'powerbi/build/html/testes_interface.json'),JSON.stringify({input,passed:results.length,results,errors},null,2));
    console.log(JSON.stringify({passed:results.length,errors}));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
