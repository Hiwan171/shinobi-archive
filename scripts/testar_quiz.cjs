const {chromium}=require('../powerbi/build/html-tools/node_modules/playwright');
const fs=require('fs'),path=require('path'),assert=require('assert');
const input=path.resolve(process.argv[2]||'powerbi/html-interface/preview.html');
const bank=JSON.parse(fs.readFileSync('data/editorial/quiz_shinobi.json','utf8'));
(async()=>{
 const browser=await chromium.launch({channel:'msedge'}),page=await browser.newPage({viewport:{width:1600,height:1000}}),errors=[],results=[];
 page.on('pageerror',e=>errors.push(e.message));const check=(name,value)=>{assert(value,name);results.push(name)};
 const action=key=>page.locator(`[data-quiz-action="${key}"]:visible`);
 const snap=async name=>page.screenshot({path:`powerbi/build/html/quiz-${name}.png`,animations:'disabled'});
 const choose=async correct=>{const i=await page.evaluate(correct=>shinobiArchive.quiz.run.deck[shinobiArchive.quiz.run.index].choices.findIndex(c=>c.correct===correct),correct);await page.locator(`[data-choice="${i}"]`).click();return i;};
 const answer=async correct=>{await choose(correct);await action('confirm').click();};
 const current=()=>page.evaluate(()=>{const r=shinobiArchive.quiz.run;return {status:r.status,score:r.score,lives:r.lives,streak:r.streak,index:r.index,answered:r.answers.length,hints:r.hints,mode:r.mode,endReason:r.endReason,remainingMs:r.remainingMs};});
 const setup=async({level='genin',category='all',era='all',size='5',mode='training',spoilers=false}={})=>{
  if(await action('setup').count())await action('setup').click();
  await page.locator('[data-quiz-action="mode"][data-mode="'+mode+'"]').click();
  await page.locator('#quiz-level').selectOption(level);await page.locator('#quiz-category').selectOption(category);await page.locator('#quiz-era').selectOption(era);await page.locator('#quiz-size').selectOption(size);await page.locator('#quiz-spoilers').setChecked(spoilers);
 };
 try{
  check('Banco oferece 64 perguntas únicas',bank.questions.length===64&&new Set(bank.questions.map(q=>q.id)).size===64&&new Set(bank.questions.map(q=>q.question)).size===64);
  for(const q of bank.questions){check('Quatro alternativas únicas, resposta válida e fonte oficial em '+q.id,q.options.length===4&&new Set(q.options).size===4&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4&&q.explanation.length>30&&/^https:\/\/naruto-official\.com\/en\/news\//.test(q.source));}
  check('Banco cobre quatro temas, três dificuldades e três fases',new Set(bank.questions.map(q=>q.category)).size===4&&new Set(bank.questions.map(q=>q.difficulty)).size===3&&new Set(bank.questions.map(q=>q.era)).size===3);
  await page.clock.install();await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('file:///'+input.replaceAll('\\','/'),{waitUntil:'domcontentloaded'});await page.locator('.nav-item[data-page="quiz"]').click();
  check('Menu mantém seis seções e abre o quiz',await page.locator('#navigation .nav-item').count()===6&&await page.locator('.quiz-lobby').count()===1);
  check('Revelações começam desativadas e deixam 39 perguntas',!await page.locator('#quiz-spoilers').isChecked()&&await page.locator('.quiz-pool-info').textContent().then(t=>t.startsWith('39 ')));
  check('Arte inicial é original incorporada',await page.locator('.quiz-naruto').getAttribute('src').then(s=>s.startsWith('data:image/png;base64,')));
  for(const era of ['all','classico','shippuden','boruto'])for(const level of ['all','genin','chunin','jonin']){
   await setup({era,level,spoilers:true});const expected=bank.questions.filter(q=>(era==='all'||q.era===era)&&(level==='all'||q.difficulty===level)).length;
   check('Contagem dos filtros '+era+'/'+level+' corresponde ao banco',await page.locator('.quiz-pool-info').textContent().then(t=>t.startsWith(expected+' ')));
  }
  await setup({category:'tecnicas',era:'boruto',level:'all'});check('Combinação sem perguntas desativa início',await action('start').isDisabled());
  await setup({level:'jonin',era:'classico',size:'15'});check('Missão curta informa limite real de perguntas',await page.locator('.quiz-pool-info').textContent().then(t=>t.includes('esta missão terá')));
  await setup();await page.locator('#quiz-name').fill('<ninja>');await snap('configuracao');await action('start').click();
  check('Nome é escapado ao exibir',await page.locator('.quiz-mission h3').textContent()==='<ninja>'&&await page.locator('.quiz-mission ninja').count()===0);
  check('Missão sorteia perguntas únicas e respeita filtros',await page.evaluate(()=>{const r=shinobiArchive.quiz.run;return r.deck.length===5&&new Set(r.deck.map(q=>q.id)).size===5&&r.deck.every(q=>q.difficulty==='genin'&&!q.spoiler)&&r.deck.every(q=>q.choices.length===4&&q.choices.filter(c=>c.correct).length===1)}));
  check('Confirmar sem escolha fica desativado',await action('confirm').isDisabled());
  await choose(true);check('Escolher ainda não pontua', (await current()).score===0&&(await current()).answered===0);
  await action('confirm').click();check('Primeiro acerto fácil vale 100 pontos', (await current()).score===100&&(await current()).streak===1);
  check('Após responder, alternativas ficam travadas e há fonte',await page.locator('.quiz-choice:disabled').count()===4&&await page.locator('.quiz-feedback a').getAttribute('href').then(s=>s.startsWith('https://naruto-official.com/')));
  await page.evaluate(()=>document.querySelector('[data-quiz-action="confirm"]')?.click());check('Confirmação repetida não duplica pontos',(await current()).score===100&&(await current()).answered===1);
  await snap('feedback');
  for(let i=1;i<5;i++){await action('next').click();await answer(true);}
  check('Combo soma 25 por acerto até o teto de 100',(await current()).score===750&&(await current()).streak===5);
  await action('next').click();check('Resultado preserva pontuação e precisão',await page.locator('.quiz-result-score strong').textContent()==='750'&&await page.locator('.quiz-result-metrics strong').nth(1).textContent()==='100%');
  check('Primeira missão, perfeição e combo são conquistados',await page.evaluate(()=>['estreia','perfeito','combo'].every(id=>shinobiArchive.quiz.badges.has(id))));await snap('resultado');
  await action('review').click();check('Revisão preserva resposta correta e fonte',await page.locator('.quiz-review-options .correct').count()===1&&await page.locator('.quiz-review-content>a').count()===1&&await action('review-prev').isDisabled());
  for(let i=0;i<4;i++)await action('review-next').click();check('Revisão respeita última pergunta',await action('review-next').isDisabled());await snap('revisao');await action('results').click();
  await setup();await action('start').click();await action('hint').click();
  check('Dica elimina exatamente duas respostas erradas',await page.evaluate(()=>{const r=shinobiArchive.quiz.run,q=r.deck[r.index];return r.eliminated.length===2&&r.eliminated.every(i=>!q.choices[i].correct)&&r.hints===1}));
  check('Dica não pode ser usada duas vezes na mesma questão',await action('hint').isDisabled());await answer(true);
  check('Acerto com dica vale metade sem bônus',(await current()).score===50&&await page.evaluate(()=>{const a=shinobiArchive.quiz.run.answers[0];return a.base===50&&a.combo===0&&a.speed===0}));
  await action('next').click();await answer(false);check('Erro em treino zera sequência e mantém missão',(await current()).lives===3&&(await current()).streak===0&&(await current()).score===50);
  await action('pause').click();check('É possível pausar após feedback',(await current()).status==='paused');await action('resume').click();check('Retomar feedback não abre uma segunda chance',(await current()).status==='feedback'&&await page.locator('.quiz-choice:disabled').count()===4);
  await action('next').click();await action('skip').click();check('Pular registra resposta incorreta sem pontos',await page.evaluate(()=>shinobiArchive.quiz.run.answers.at(-1).reason==='skip')&&(await current()).score===50);
  await action('pause').click();await action('abandon').click();check('Resultado parcial não entra no placar',await page.evaluate(()=>shinobiArchive.quiz.history.length===1)&&await page.locator('.quiz-result-hero>.eyebrow').textContent()==='RESULTADO PARCIAL');
  await action('retry').click();check('Treinar erros abre só questões erradas sem cronômetro',await page.evaluate(()=>shinobiArchive.quiz.run.mode==='training'&&shinobiArchive.quiz.run.deck.length===2&&new Set(shinobiArchive.quiz.run.deck.map(q=>q.id)).size===2));
  await action('pause').click();await action('abandon').click();await setup({mode:'exam'});await action('start').click();
  await page.clock.runFor(5000);check('Cronômetro avança no Exame',await page.locator('#quiz-clock').textContent().then(t=>Number(t.slice(0,-1))>=24&&Number(t.slice(0,-1))<=26));
  await page.locator('.nav-item[data-page="episodios"]').click();check('Navegar pausa a missão',(await current()).status==='paused');const paused=(await current()).remainingMs;
  await page.clock.runFor(50000);check('Tempo não é consumido fora da aba',(await current()).remainingMs===paused);
  await page.locator('.nav-item[data-page="quiz"]').click();check('Voltar oferece retomada explícita',await page.locator('.quiz-pause-overlay').count()===1);await snap('pausa');await action('resume').click();
  await page.clock.runFor(26000);check('Tempo esgotado perde uma vida uma única vez',(await current()).status==='feedback'&&(await current()).lives===2&&await page.evaluate(()=>shinobiArchive.quiz.run.answers.at(-1).reason==='timeout'));
  await page.clock.runFor(50000);check('Feedback não continua cobrando vidas',(await current()).lives===2&&(await current()).answered===1);
  await action('next').click();await answer(false);await action('next').click();await action('skip').click();check('Terceiro erro encerra com zero vidas',(await current()).lives===0);await action('next').click();
  check('Exame termina antes da quinta pergunta ao perder vidas',(await current()).endReason==='lives'&&await page.evaluate(()=>shinobiArchive.quiz.run.answers.length===3&&shinobiArchive.quiz.history.length===2));
  check('Precisão usa só respondidas e missão mantém o denominador de cinco',await page.locator('.quiz-result-metrics strong').first().textContent()==='0 / 5'&&await page.locator('.quiz-result-metrics strong').nth(1).textContent()==='0%');
  await setup({mode:'exam'});await action('start').click();await page.clock.runFor(3000);await answer(true);
  check('Exame acrescenta bônus proporcional ao tempo restante',await page.evaluate(()=>{const a=shinobiArchive.quiz.run.answers[0];return a.base===100&&a.speed>=40&&a.speed<=45&&a.points===100+a.speed}));
  for(let i=1;i<5;i++){await action('next').click();await answer(true);}await action('next').click();
  check('Concluir Exame libera conquista e separa recordes',await page.evaluate(()=>shinobiArchive.quiz.badges.has('exame')&&shinobiArchive.quiz.history.some(h=>h.mode==='exam'&&h.score>750)&&shinobiArchive.quiz.history.find(h=>h.mode==='training').score===750));
  await setup({level:'chunin',mode:'training'});await action('start').click();await answer(true);check('Acerto médio usa base de 150',(await current()).score===150);await action('pause').click();await action('abandon').click();
  await setup({level:'jonin',mode:'training',spoilers:true});await action('start').click();await answer(true);check('Acerto difícil usa base de 200',(await current()).score===200);await action('pause').click();await action('abandon').click();
  await setup();await action('start').click();const correct=await page.evaluate(()=>shinobiArchive.quiz.run.deck[0].choices.findIndex(c=>c.correct)+1);await page.keyboard.press(String(correct));await page.keyboard.press('Enter');
  check('Teclado escolhe com 1–4 e confirma com Enter',(await current()).status==='feedback'&&(await current()).score===100);
  await page.keyboard.press('Enter');check('Enter avança após feedback',(await current()).index===1&&(await current()).status==='playing');
  await action('pause').click();await action('abandon').click();await setup();await action('help').click();check('Regras explicam pausa, pontuação e duração da sessão',await page.locator('.quiz-help-content').textContent().then(t=>t.includes('três vidas')&&t.includes('metade')&&t.includes('nova sessão')));await page.keyboard.press('Escape');
  for(const [width,height] of [[1920,1080],[1600,1000],[1366,768],[1100,800],[900,800],[600,800]]){
   await page.setViewportSize({width,height});await setup();
   for(const phase of ['setup','playing','feedback','results','review']){
    if(phase==='playing')await action('start').click();if(phase==='feedback')await answer(true);
    if(phase==='results'){await page.locator('.nav-item[data-page="episodios"]').click();await page.locator('.nav-item[data-page="quiz"]').click();if((await current()).status==='feedback'){await action('pause').click();}await action('abandon').click();}
    if(phase==='review')await action('review').click();
    check('Canvas compacto sem rolagem em '+width+' / '+phase,await page.evaluate(()=>{const s=document.querySelector('#screen'),r=document.querySelector('#shinobi-app');return s.scrollWidth<=s.clientWidth+1&&s.scrollHeight<=s.clientHeight+1&&r.scrollWidth<=innerWidth+1}));
    check('Controles não ultrapassam o canvas em '+width+' / '+phase,await page.evaluate(()=>{const s=document.querySelector('#screen').getBoundingClientRect();return [...document.querySelectorAll('.quiz-page button,.quiz-page input,.quiz-page select')].filter(e=>e.getClientRects().length).every(e=>{const r=e.getBoundingClientRect();return r.bottom<=s.bottom+1&&r.top>=s.top-1&&r.left>=s.left-1&&r.right<=s.right+1})}));
    await snap(width+'-'+phase);
   }
   await action('results').click();
  }
  await page.setViewportSize({width:1600,height:1000});const recordBefore=await page.evaluate(()=>shinobiArchive.quiz.records.training);
  for(let i=0;i<11;i++){await setup({category:'personagens',level:'jonin',era:'classico',spoilers:false});await action('start').click();await answer(true);await action('next').click();}
  check('Histórico fica limitado a dez partidas sem perder recordes da sessão',await page.evaluate(before=>shinobiArchive.quiz.history.length===10&&shinobiArchive.quiz.records.training===before,recordBefore));
  await setup();await action('help').click();await page.keyboard.press('Tab');check('Ajuda mantém foco dentro do modal',await page.locator('.modal-close').evaluate(e=>e===document.activeElement));await page.keyboard.press('Escape');check('Escape devolve foco ao botão de regras',await action('help').evaluate(e=>e===document.activeElement));
  check('Sem erros JavaScript',errors.length===0);fs.writeFileSync('powerbi/build/html/testes_quiz.json',JSON.stringify({input,passed:results.length,results,errors,desktopValidated:false},null,2));console.log(JSON.stringify({passed:results.length,errors}));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
