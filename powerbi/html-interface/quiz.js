  /* Jogo contido no documento do HTML Content. Sem APIs, armazenamento ou login. */
  const quizBank=/* __QUIZ_BANK__ */{};
  const quizCategories={all:'Todos os temas',personagens:'Personagens',tecnicas:'Jutsus e habilidades',mundo:'Vilas e equipes',historia:'História'};
  const quizLevels={all:'Todos os níveis',genin:'Genin · fácil',chunin:'Chūnin · médio',jonin:'Jōnin · difícil'};
  const quizEras={all:'Todas as fases',classico:'Naruto clássico',shippuden:'Shippuden',boruto:'Boruto'};
  const quizBase={genin:100,chunin:150,jonin:200};
  const quizDurations={genin:30,chunin:25,jonin:20};
  const quizAchievements=[
    ['estreia','Primeira missão','Finalize uma partida.'],['perfeito','Sem falhas','Acerte todas as questões da partida, sem dicas.'],
    ['combo','Em sintonia','Acerte cinco questões consecutivas.'],['exame','Exame concluído','Chegue ao fim de um Exame com vidas.'],
    ['resistencia','Até o fim','Conclua um Exame com uma vida restante.'],['versatil','Conhecimento amplo','Acerte ao menos uma questão de cada tema na mesma partida.']
  ];
  const quizSession={config:{name:'Shinobi',mode:'training',category:'all',level:'all',era:'all',size:10,spoilers:false},run:null,history:[],records:{training:0,exam:0},badges:new Set(),screen:'setup',reviewIndex:0};
  let quizTicker=null,quizSerial=0;
  const quizShuffle=rows=>{const result=[...rows];for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}return result;};
  const quizPool=()=>quizBank.questions.filter(q=>(quizSession.config.category==='all'||q.category===quizSession.config.category)&&(quizSession.config.level==='all'||q.difficulty===quizSession.config.level)&&(quizSession.config.era==='all'||q.era===quizSession.config.era)&&(quizSession.config.spoilers||!q.spoiler));
  const quizCurrent=()=>quizSession.run?.deck[quizSession.run.index];
  const quizLeft=()=>Math.max(0,quizSession.run?.deadline?quizSession.run.deadline-performance.now():quizSession.run?.remainingMs||0);
  const quizModeName=mode=>mode==='exam'?'Exame':'Treino';
  const quizBest=mode=>quizSession.records[mode]||0;
  function quizArt(){const art=gameMedia.arts.find(a=>a.person===1344&&a.phase==='default');return art?`<img class="quiz-naruto" src="${url(art.inline||art.url)}" alt="Naruto Uzumaki — arte original de Storm Connections" referrerpolicy="no-referrer">`:'';}
  function quizStopClock(){if(quizTicker!==null)clearInterval(quizTicker);quizTicker=null;}
  function quizStartClock(){
    quizStopClock();const r=quizSession.run;
    if(!r||r.status!=='playing'||r.mode!=='exam')return;
    r.deadline=performance.now()+r.remainingMs;
    const serial=r.serial;
    quizTicker=setInterval(()=>{
      if(!root.isConnected){quizStopClock();return;}
      if(!quizSession.run||quizSession.run.serial!==serial){quizStopClock();return;}
      if(state.page!=='quiz'||document.hidden){quizPause();return;}
      const left=quizLeft(),clock=$('#quiz-clock'),track=$('#quiz-clock-fill');
      if(clock){clock.textContent=Math.ceil(left/1000)+'s';clock.closest('.quiz-clock')?.setAttribute('aria-label','Tempo restante: '+Math.ceil(left/1000)+' segundos');}
      if(track)track.style.width=(left/(quizDurations[quizCurrent().difficulty]*1000)*100)+'%';
      if(left<=0)quizAnswer('timeout');
    },150);
  }
  function quizPause(){const r=quizSession.run;if(!r||!['playing','feedback'].includes(r.status))return;r.pausedFrom=r.status;r.remainingMs=quizLeft();r.deadline=null;r.status='paused';quizStopClock();if(state.page==='quiz')renderQuiz();}
  function quizStart(customDeck=null){
    quizStopClock();const c=quizSession.config,pool=customDeck||quizPool();if(!pool.length)return;
    const chosen=quizShuffle(pool).slice(0,customDeck?pool.length:Math.min(c.size,pool.length));
    quizSession.run={serial:++quizSerial,name:c.name.trim().slice(0,18)||'Shinobi',mode:customDeck?'training':c.mode,
      deck:chosen.map(q=>({...q,choices:quizShuffle(q.options.map((label,i)=>({label,correct:i===q.answer})))})),index:0,status:'playing',selected:null,eliminated:[],hintUsed:false,
      remainingMs:quizDurations[chosen[0].difficulty]*1000,deadline:null,score:0,streak:0,bestStreak:0,lives:3,hints:2,answers:[],correctCats:new Set(),newBadges:[],endReason:null};
    quizSession.screen='game';renderQuiz();quizStartClock();$('#quiz-question')?.focus({preventScroll:true});
  }
  function quizAnswer(reason='answer'){
    const r=quizSession.run;if(!r||r.status!=='playing')return;
    if(reason==='answer'&&r.mode==='exam'&&quizLeft()<=0)reason='timeout';
    if(reason==='answer'&&r.selected===null)return;
    const q=quizCurrent(),remaining=quizLeft(),correct=reason==='answer'&&q.choices[r.selected]?.correct===true;
    quizStopClock();r.deadline=null;r.remainingMs=remaining;
    const base=correct?Math.floor(quizBase[q.difficulty]*(r.hintUsed?.5:1)):0;
    r.streak=correct?r.streak+1:0;r.bestStreak=Math.max(r.bestStreak,r.streak);
    const combo=correct&&!r.hintUsed?Math.min(Math.max(r.streak-1,0),4)*25:0;
    const speed=correct&&!r.hintUsed&&r.mode==='exam'?Math.floor(remaining/(quizDurations[q.difficulty]*1000)*50):0;
    const points=base+combo+speed;r.score+=points;
    if(!correct&&r.mode==='exam')r.lives=Math.max(0,r.lives-1);
    if(correct)r.correctCats.add(q.category);
    r.answers.push({question:q,selected:reason==='answer'?r.selected:null,correct,reason,points,base,combo,speed,hintUsed:r.hintUsed});
    r.status='feedback';renderQuiz();$('#quiz-feedback')?.focus({preventScroll:true});
  }
  function quizNext(){
    const r=quizSession.run;if(!r||r.status!=='feedback')return;
    if(r.lives===0&&r.mode==='exam'){quizFinish('lives');return;}
    if(r.index+1>=r.deck.length){quizFinish('complete');return;}
    r.index++;r.status='playing';r.selected=null;r.eliminated=[];r.hintUsed=false;r.remainingMs=quizDurations[quizCurrent().difficulty]*1000;r.deadline=null;
    renderQuiz();quizStartClock();$('#quiz-question')?.focus({preventScroll:true});
  }
  function quizFinish(reason){
    const r=quizSession.run;if(!r||r.status==='finished')return;
    quizStopClock();r.deadline=null;r.status='finished';r.endReason=reason;
    if(reason!=='abandoned'){
      const right=r.answers.filter(a=>a.correct).length,full=reason==='complete'&&r.answers.length===r.deck.length;
      const earned=['estreia'];if(full&&right===r.deck.length&&r.answers.every(a=>!a.hintUsed))earned.push('perfeito');
      if(r.bestStreak>=5)earned.push('combo');if(full&&r.mode==='exam'&&r.lives>0)earned.push('exame');if(full&&r.mode==='exam'&&r.lives===1)earned.push('resistencia');if(r.correctCats.size===4)earned.push('versatil');
      r.newBadges=earned.filter(id=>!quizSession.badges.has(id));earned.forEach(id=>quizSession.badges.add(id));
      quizSession.records[r.mode]=Math.max(quizSession.records[r.mode],r.score);
      quizSession.history.unshift({id:r.serial,name:r.name,mode:r.mode,score:r.score,right,total:r.deck.length,answered:r.answers.length,reason,bestStreak:r.bestStreak});quizSession.history=quizSession.history.slice(0,10);
    }
    quizSession.screen='results';quizSession.reviewIndex=0;renderQuiz();
  }
  function quizHint(){
    const r=quizSession.run;if(!r||r.status!=='playing'||!r.hints||r.hintUsed)return;
    if(r.mode==='exam'&&quizLeft()<=0){quizAnswer('timeout');return;}
    const q=quizCurrent();r.eliminated=quizShuffle(q.choices.map((v,i)=>({v,i})).filter(({v})=>!v.correct)).slice(0,2).map(({i})=>i);
    if(r.eliminated.includes(r.selected))r.selected=null;r.hintUsed=true;r.hints--;renderQuiz();$('#quiz-question')?.focus({preventScroll:true});
  }
  function quizHeader(){const r=quizSession.run;
    if(quizSession.screen==='game'&&r)header([[fmt(r.score),'Pontos'],[`${r.answers.filter(a=>a.correct).length}/${r.deck.length}`,'Acertos'],[fmt(r.bestStreak),'Melhor sequência']]);
    else header([[fmt(quizBank.questions.length),'Perguntas'],[fmt(quizBest(quizSession.config.mode)),'Recorde · '+quizModeName(quizSession.config.mode)],[`${quizSession.badges.size}/6`,'Conquistas da sessão']]);
  }
  function quizHistory(){return quizSession.history.length?quizSession.history.slice(0,4).map((h,i)=>`<div class="quiz-history-row"><span>${String(i+1).padStart(2,'0')}</span><div><strong>${esc(h.name)}</strong><small>${quizModeName(h.mode)} · ${h.right}/${h.total} acertos${h.reason==='lives'?' · fim das vidas':''}</small></div><b>${fmt(h.score)}</b></div>`).join(''):'<div class="quiz-no-history">Sua primeira missão começa aqui.<br>Os resultados aparecem nesta sessão.</div>';}
  function renderQuiz(){
    quizHeader();const r=quizSession.run;
    if(quizSession.screen==='game'&&r){renderQuizGame();$('.quiz-clock')?.setAttribute('aria-label',r.mode==='exam'?'Tempo restante: '+Math.ceil(quizLeft()/1000)+' segundos':'Sem limite de tempo');$('.quiz-question-top')?.insertAdjacentHTML('beforeend','<button class="quiz-mobile-pause quiz-quiet" data-quiz-action="pause">Pausar</button>');return;}
    if(quizSession.screen==='results'&&r){renderQuizResults();return;}
    if(quizSession.screen==='review'&&r){renderQuizReview();return;}
    const c=quizSession.config,pool=quizPool(),n=Math.min(c.size,pool.length);
    $('#screen').innerHTML=`<section class="quiz-page quiz-lobby"><article class="quiz-welcome"><div class="eyebrow">ACADEMIA / DESAFIO DE CONHECIMENTO</div><h2>Qual é o seu<br><em>caminho ninja?</em></h2><p>Memória, estratégia e um pouco de coragem.<br>Entre no Exame Shinobi e descubra o quanto você conhece deste universo.</p><div class="quiz-welcome-stats"><div><strong>64</strong><span>perguntas</span></div><div><strong>04</strong><span>temas</span></div><div><strong>03</strong><span>níveis</span></div></div><div class="quiz-welcome-art">${quizArt()}<span aria-hidden="true">忍</span></div><small class="quiz-art-credit">Storm Connections · Bandai Namco Entertainment / CyberConnect2</small><div class="quiz-rules-mini"><span>Treino para aprender.</span><span>Exame para se desafiar.</span></div></article>
      <div class="quiz-lobby-center"><article class="quiz-config panel"><div class="quiz-section-head"><div><span class="eyebrow">PREPARE SUA MISSÃO</span><h3>Um desafio do seu jeito.</h3></div><button class="quiz-help" data-quiz-action="help" aria-label="Regras do quiz">?</button></div><div class="quiz-mode-switch" role="group" aria-label="Modo de jogo">${[['training','Treino','Sem tempo · aprenda a cada resposta'],['exam','Exame','Tempo por pergunta · três vidas']].map(([key,title,text])=>`<button data-quiz-action="mode" data-mode="${key}" aria-pressed="${c.mode===key}"><strong>${title}</strong><small>${text}</small></button>`).join('')}</div><div class="quiz-config-grid"><label class="quiz-field quiz-player">NOME DE SHINOBI<input id="quiz-name" maxlength="18" value="${esc(c.name)}" autocomplete="off" aria-label="Seu nome de shinobi"></label><label class="quiz-field">QUESTÕES<select id="quiz-size">${[5,10,15].map(v=>`<option value="${v}" ${c.size===v?'selected':''}>${v} questões</option>`).join('')}</select></label><label class="quiz-field">TEMA<select id="quiz-category">${options(Object.entries(quizCategories),c.category,r=>r[1],r=>r[0])}</select></label><label class="quiz-field">DIFICULDADE<select id="quiz-level">${options(Object.entries(quizLevels),c.level,r=>r[1],r=>r[0])}</select></label><label class="quiz-field quiz-era">FASE<select id="quiz-era">${options(Object.entries(quizEras),c.era,r=>r[1],r=>r[0])}</select></label></div><label class="quiz-spoiler"><input type="checkbox" id="quiz-spoilers" ${c.spoilers?'checked':''}><span>Incluir perguntas com revelações da história<small>Desativado: apenas fatos de apresentação das fases escolhidas.</small></span></label><div class="quiz-pool-info" role="status">${fmt(pool.length)} perguntas disponíveis${pool.length&&n<c.size?` · esta missão terá ${n} questões`:''}${!pool.length?' · ajuste os filtros':''}</div><button class="quiz-primary quiz-start" data-quiz-action="start" ${pool.length?'':'disabled'}>Iniciar ${quizModeName(c.mode).toLowerCase()} <span>${n?`${n} questões →`:'Sem perguntas'}</span></button></article><div class="quiz-scoring-note"><span>ACERTO: 100 / 150 / 200 PTS</span><span>COMBO ATÉ +100 · EXAME ATÉ +50 POR TEMPO</span></div></div>
      <aside class="quiz-session panel"><div class="quiz-section-head"><div><span class="eyebrow">SEU PERCURSO</span><h3>Nesta sessão</h3></div>${icon('popular',22)}</div><div class="quiz-session-records"><div><span>Recorde no Treino</span><strong>${fmt(quizBest('training'))}</strong></div><div><span>Recorde no Exame</span><strong>${fmt(quizBest('exam'))}</strong></div></div><div class="quiz-badge-heading">CONQUISTAS <span>${quizSession.badges.size} / 6</span></div><div class="quiz-badges">${quizAchievements.map(([id,title,desc],i)=>`<div class="quiz-badge ${quizSession.badges.has(id)?'unlocked':''}" title="${esc(desc)}" aria-label="${esc(title+': '+desc+(quizSession.badges.has(id)?' Desbloqueada.':' Ainda não conquistada.'))}"><b>${['初','全','連','試','忍','知'][i]}</b><span>${title}</span></div>`).join('')}</div><div class="quiz-badge-heading">ÚLTIMAS MISSÕES</div><div class="quiz-history">${quizHistory()}</div><p class="quiz-session-note">Recordes e conquistas duram enquanto esta interface estiver aberta. Atualizar o relatório inicia uma nova sessão.</p></aside></section>`;
  }
  function renderQuizGame(){
    const r=quizSession.run,q=quizCurrent(),feedback=r.status==='feedback',answer=r.answers.at(-1),paused=r.status==='paused';
    const correctChoice=q.choices.findIndex(v=>v.correct),isLast=r.index===r.deck.length-1||r.mode==='exam'&&!r.lives;
    $('#screen').innerHTML=`<section class="quiz-page quiz-game"><aside class="quiz-mission panel"><span class="eyebrow">${quizModeName(r.mode).toUpperCase()} EM ANDAMENTO</span><h3>${esc(r.name)}</h3><div class="quiz-mission-progress"><strong>${String(r.index+1).padStart(2,'0')}<small> / ${String(r.deck.length).padStart(2,'0')}</small></strong><span>QUESTÃO DA MISSÃO</span></div><div class="quiz-progress-track"><i style="width:${r.answers.length/r.deck.length*100}%"></i></div><div class="quiz-mission-fact"><span>Acertos</span><b>${r.answers.filter(a=>a.correct).length}</b></div><div class="quiz-mission-fact"><span>Sequência atual</span><b>${r.streak} ${r.streak>=3?'🔥':''}</b></div><div class="quiz-mission-fact"><span>${r.mode==='exam'?'Vidas restantes':'Erros não encerram o treino'}</span><b>${r.mode==='exam'?`${'♥'.repeat(r.lives)}${'♡'.repeat(3-r.lives)}`:'∞'}</b></div><div class="quiz-mission-steps" aria-label="Resultado das questões">${r.deck.map((_,i)=>`<span class="${r.answers[i]?(r.answers[i].correct?'right':'wrong'):i===r.index?'current':''}" title="Questão ${i+1}: ${r.answers[i]?(r.answers[i].correct?'correta':'incorreta'):i===r.index?'atual':'pendente'}">${i+1}</span>`).join('')}</div><p class="quiz-mission-note">${r.mode==='exam'?'O tempo pausa ao sair desta aba ou ocultar a janela.':'Leia com calma. Cada resposta tem uma explicação e sua referência.'}</p><button class="quiz-quiet" data-quiz-action="pause">${paused?'Missão pausada':'Pausar / encerrar'}</button></aside>
      <article class="quiz-question-card panel"><div class="quiz-question-top"><div><span>${esc(quizCategories[q.category])}</span><span>${esc(quizLevels[q.difficulty])}</span><span>${esc(quizEras[q.era])}${q.spoiler?' · revelação':''}</span></div><div class="quiz-clock ${r.mode==='exam'?'':'untimed'}" role="timer" aria-live="off">${icon('episodes',16)}<strong id="quiz-clock">${r.mode==='exam'?Math.ceil(quizLeft()/1000)+'s':'Sem tempo'}</strong></div></div><div class="quiz-clock-track" ${r.mode==='exam'?'':'hidden'}><i id="quiz-clock-fill" style="width:${quizLeft()/(quizDurations[q.difficulty]*1000)*100}%"></i></div><div class="quiz-question-copy"><span class="eyebrow">QUESTÃO ${r.index+1} / ${r.deck.length}</span><h2 id="quiz-question" tabindex="-1">${esc(q.question)}</h2></div><div class="quiz-choices" role="group" aria-label="Alternativas">${q.choices.map((v,i)=>`<button data-quiz-action="choice" data-choice="${i}" aria-pressed="${r.selected===i}" ${feedback||paused||r.eliminated.includes(i)?'disabled':''} class="quiz-choice ${r.selected===i?'selected':''} ${feedback&&v.correct?'correct':''} ${feedback&&r.selected===i&&!v.correct?'incorrect':''} ${r.eliminated.includes(i)?'eliminated':''}"><span>${String.fromCharCode(65+i)}</span><strong>${esc(v.label)}</strong><b>${feedback&&v.correct?'✓':feedback&&r.selected===i?'×':''}</b></button>`).join('')}</div>
      ${feedback?`<div class="quiz-feedback ${answer.correct?'right':'wrong'}" id="quiz-feedback" tabindex="-1" role="status"><div><strong>${answer.correct?'Resposta certa!':answer.reason==='timeout'?'O tempo acabou.':answer.reason==='skip'?'Questão pulada.':'Ainda dá para aprender.'}</strong><b>+${fmt(answer.points)} pts</b></div><p>${esc(q.explanation)}</p><footer><a href="${url(q.source)}" target="_blank" rel="noopener noreferrer">Consultar referência oficial ↗</a><span>${answer.correct?`${answer.base} base${answer.combo?' + '+answer.combo+' sequência':''}${answer.speed?' + '+answer.speed+' tempo':''}${answer.hintUsed?' · dica: base reduzida à metade':''}`:`Correta: ${esc(q.choices[correctChoice].label)}${r.mode==='exam'?' · −1 vida':''}`}</span></footer></div>`:`<div class="quiz-answer-tip">${r.hintUsed?'Dica aplicada: duas alternativas eliminadas. Acerto vale metade da base, sem bônus.':'Selecione uma alternativa e confirme. Atalhos: 1–4 para escolher, Enter para confirmar.'}</div>`}
      <div class="quiz-game-actions">${feedback?`<span class="quiz-action-caption">${r.mode==='exam'&&!r.lives?'As três vidas terminaram.':isLast?'Última questão respondida.':'Vamos para a próxima missão?'}</span><button class="quiz-primary" data-quiz-action="next">${isLast?'Ver resultado':'Próxima questão'} →</button>`:`<div><button class="quiz-secondary" data-quiz-action="hint" ${!r.hints||r.hintUsed||paused?'disabled':''}>Dica 50/50 <small>${r.hints} restantes</small></button><button class="quiz-quiet" data-quiz-action="skip" ${paused?'disabled':''}>Pular${r.mode==='exam'?' (−1 vida)':''}</button></div><button class="quiz-primary" data-quiz-action="confirm" ${r.selected===null||paused?'disabled':''}>Confirmar resposta →</button>`}</div>
      ${paused?`<div class="quiz-pause-overlay"><div><span class="eyebrow">UMA PAUSA NO CAMINHO</span><h3>Sua missão está guardada.</h3><p>O tempo está parado. Continue de onde você saiu.</p><button class="quiz-primary" data-quiz-action="resume">Continuar missão →</button><button class="quiz-quiet" data-quiz-action="abandon">Encerrar e ver resultado parcial</button></div></div>`:''}</article></section>`;
  }
  function renderQuizResults(){
    const r=quizSession.run,right=r.answers.filter(a=>a.correct).length,accuracy=r.answers.length?right/r.answers.length:0;
    const title=r.endReason==='abandoned'?'Missão encerrada.':r.endReason==='lives'?'Uma pausa para evoluir.':accuracy>=.9?'Conhecimento de mestre.':accuracy>=.7?'Uma mente estratégica.':'Todo treino conta.';
    $('#screen').innerHTML=`<section class="quiz-page quiz-results"><article class="quiz-result-hero panel"><div class="quiz-result-seal" aria-hidden="true">忍</div><span class="eyebrow">${r.endReason==='abandoned'?'RESULTADO PARCIAL':quizModeName(r.mode).toUpperCase()+' / RESULTADO'}</span><h2>${title}</h2><p>${esc(r.name)}, ${r.endReason==='lives'?'as três vidas acabaram. Revise suas respostas e tente de novo.':r.endReason==='abandoned'?'esta partida não entra no placar nem libera conquistas.':'cada resposta faz parte do seu caminho ninja.'}</p><div class="quiz-result-score"><strong>${fmt(r.score)}</strong><span>PONTOS NA MISSÃO</span></div><div class="quiz-result-metrics"><div><strong>${right} / ${r.deck.length}</strong><span>acertos na missão</span></div><div><strong>${percent(accuracy)}</strong><span>precisão nas ${r.answers.length} respondidas</span></div><div><strong>${r.bestStreak}</strong><span>melhor sequência</span></div></div><p class="quiz-result-progress">${r.answers.length} de ${r.deck.length} questões respondidas${r.mode==='exam'?` · ${r.lives} vida${r.lives===1?'':'s'} restante${r.lives===1?'':'s'}`:''}.</p><div class="quiz-earned">${r.newBadges.length?r.newBadges.map(id=>`<span>✦ ${esc(quizAchievements.find(b=>b[0]===id)[1])}</span>`).join(''):'<span>Continue treinando para conquistar novos selos.</span>'}</div><div class="quiz-result-actions"><button class="quiz-primary" data-quiz-action="review" ${r.answers.length?'':'disabled'}>Revisar respostas →</button><button class="quiz-secondary" data-quiz-action="setup">Nova missão</button>${r.answers.some(a=>!a.correct)?'<button class="quiz-quiet" data-quiz-action="retry">Treinar somente os erros</button>':''}</div></article><aside class="quiz-result-side panel"><span class="eyebrow">SEU PERCURSO NESTA SESSÃO</span><h3>Últimas missões</h3><div class="quiz-history">${quizHistory()}</div><div class="quiz-result-themes"><span class="eyebrow">ACERTOS POR TEMA</span>${Object.entries(quizCategories).filter(([k])=>k!=='all').map(([key,label])=>{const rows=r.answers.filter(a=>a.question.category===key),correct=rows.filter(a=>a.correct).length;return `<div><span>${label}</span><b>${rows.length?`${correct}/${rows.length}`:'—'}</b></div>`}).join('')}</div><p class="quiz-session-note">Compare recordes do mesmo modo e configuração. Quantidade, dificuldade e uso de dicas alteram o total possível.</p><button class="quiz-quiet" data-quiz-action="help">Como os pontos são calculados ↗</button></aside></section>`;
  }
  function renderQuizReview(){
    const r=quizSession.run,a=r.answers[quizSession.reviewIndex];if(!a){quizSession.screen='results';renderQuiz();return;}
    const q=a.question;
    $('#screen').innerHTML=`<section class="quiz-page quiz-review panel"><div class="quiz-review-heading"><div><span class="eyebrow">REVISÃO / ${quizSession.reviewIndex+1} DE ${r.answers.length}</span><h3>${a.correct?'Você acertou.':a.reason==='timeout'?'Tempo esgotado.':a.reason==='skip'?'Questão pulada.':'Mais uma chance de aprender.'}</h3></div><button class="quiz-secondary" data-quiz-action="results">Voltar ao resultado</button></div><div class="quiz-review-content"><span class="quiz-review-meta">${esc(quizCategories[q.category])} · ${esc(quizLevels[q.difficulty])} · +${a.points} pts</span><h2>${esc(q.question)}</h2><div class="quiz-review-options">${q.choices.map((v,i)=>`<div class="${v.correct?'correct':a.selected===i?'incorrect':''}"><span>${String.fromCharCode(65+i)}</span><strong>${esc(v.label)}</strong><small>${v.correct?'Resposta correta':a.selected===i?'Sua resposta':''}</small></div>`).join('')}</div><p>${esc(q.explanation)}</p><a href="${url(q.source)}" target="_blank" rel="noopener noreferrer">Consultar referência oficial ↗</a></div><div class="quiz-review-nav"><button class="quiz-secondary" data-quiz-action="review-prev" ${quizSession.reviewIndex===0?'disabled':''}>← Anterior</button><span>${a.hintUsed?'Dica utilizada · ':''}${a.correct?`${a.base} base + ${a.combo} sequência + ${a.speed} tempo`:'Sem pontos nesta questão'}</span><button class="quiz-primary" data-quiz-action="review-next" ${quizSession.reviewIndex===r.answers.length-1?'disabled':''}>Próxima →</button></div></section>`;
  }
  let quizModalReturn=null;
  function quizHelp(){
    quizModalReturn=document.activeElement;
    if(quizSession.run?.status==='playing')quizPause();
    showModal('Seu guia do Exame Shinobi',`<div class="quiz-help-content"><h3>Dois modos</h3><p>Treino: sem cronômetro e sem eliminação. Exame: três vidas e 30, 25 ou 20 segundos por questão fácil, média ou difícil. Erro, pulo e tempo esgotado custam uma vida. Nenhum deles desconta pontos já conquistados.</p><h3>Pontuação</h3><p>Um acerto vale 100, 150 ou 200 pontos conforme o nível. A sequência soma 25 pontos a partir do segundo acerto, até +100. No Exame, o tempo restante rende até +50 pontos. O bônus temporal é arredondado para baixo.</p><h3>Duas dicas por partida</h3><p>A dica elimina duas alternativas erradas. O acerto com dica vale metade da base, sem bônus de sequência ou tempo nessa questão. A sequência de acertos continua. Escolher uma opção não envia a resposta: confirme quando estiver pronto.</p><h3>Seu progresso</h3><p>Partidas finalizadas entram no histórico, mesmo quando as vidas acabam. Uma partida encerrada manualmente mostra um resultado parcial, sem recorde ou conquista. Os recordes de Treino e Exame ficam separados; quantidade de perguntas e dificuldade também influenciam os totais. Os títulos e níveis são parte do jogo.</p><h3>Pausa e sessão</h3><p>O cronômetro pausa ao trocar de aba, ocultar a janela ou selecionar Pausar. Voltar exige continuar a missão. Não há armazenamento permanente ou placar entre usuários: atualizar dados ou recarregar o visual Power BI inicia uma nova sessão.</p><h3>Conteúdo e referências</h3><p>64 perguntas editoriais originais em português, baseadas nas referências oficiais das biografias do acervo. Cada explicação oferece sua fonte. Perguntas marcadas como revelação só entram quando você permite; escolher Boruto ou Shippuden inclui os fatos de apresentação dessa fase.</p><h3>Conquistas</h3><ul>${quizAchievements.map(([,title,desc])=>`<li><strong>${title}:</strong> ${desc}</li>`).join('')}</ul><p>Artes originais de Storm Connections · Bandai Namco Entertainment / CyberConnect2.</p></div>`);
  }
  root.addEventListener('click',event=>{
    if(event.target.closest('[data-action="close-modal"]')&&!$('.modal')&&quizModalReturn?.isConnected){quizModalReturn.focus();quizModalReturn=null;}
    const b=event.target.closest('[data-quiz-action]');if(!b||b.disabled)return;
    const action=b.dataset.quizAction,r=quizSession.run;
    if(action==='mode'){quizSession.config.mode=b.dataset.mode;renderQuiz();}
    else if(action==='start')quizStart();
    else if(action==='help')quizHelp();
    else if(action==='choice'&&r?.status==='playing'){r.selected=Number(b.dataset.choice);renderQuiz();$(`[data-choice="${r.selected}"]`)?.focus({preventScroll:true});}
    else if(action==='confirm')quizAnswer();
    else if(action==='hint')quizHint();
    else if(action==='skip')quizAnswer('skip');
    else if(action==='next')quizNext();
    else if(action==='pause')quizPause();
    else if(action==='resume'&&r?.status==='paused'){r.status=r.pausedFrom||'playing';renderQuiz();quizStartClock();}
    else if(action==='abandon'&&r?.status==='paused')quizFinish('abandoned');
    else if(action==='setup'){quizStopClock();quizSession.screen='setup';renderQuiz();}
    else if(action==='review'){quizSession.screen='review';quizSession.reviewIndex=0;renderQuiz();}
    else if(action==='results'){quizSession.screen='results';renderQuiz();}
    else if(action==='review-prev'){quizSession.reviewIndex=Math.max(0,quizSession.reviewIndex-1);renderQuiz();}
    else if(action==='review-next'){quizSession.reviewIndex=Math.min(r.answers.length-1,quizSession.reviewIndex+1);renderQuiz();}
    else if(action==='retry')quizStart(r.answers.filter(a=>!a.correct).map(a=>a.question));
  });
  root.addEventListener('click',event=>{const nav=event.target.closest('[data-action="nav"]');if(nav&&nav.dataset.page!=='quiz'&&quizSession.run?.status==='playing')quizPause();},true);
  root.addEventListener('input',event=>{if(event.target.id==='quiz-name')quizSession.config.name=event.target.value.slice(0,18);});
  root.addEventListener('change',event=>{
    const map={'quiz-category':'category','quiz-level':'level','quiz-era':'era','quiz-size':'size','quiz-spoilers':'spoilers'},key=map[event.target.id];if(!key)return;
    quizSession.config[key]=key==='size'?Number(event.target.value):key==='spoilers'?event.target.checked:event.target.value;renderQuiz();
  });
  root.addEventListener('keydown',event=>{
    if(state.page!=='quiz'||quizSession.screen!=='game'||$('.modal')||event.repeat||event.target.matches('input,select,textarea,a'))return;
    const r=quizSession.run;if(r?.status==='paused')return;
    if(/^[1-4]$/.test(event.key)&&r.status==='playing'){
      const i=Number(event.key)-1;if(r.eliminated.includes(i))return;event.preventDefault();r.selected=i;renderQuiz();$(`[data-choice="${i}"]`)?.focus({preventScroll:true});
    }else if(event.key==='Enter'&&(!event.target.closest('button')||event.target.closest('[data-quiz-action="choice"]'))){event.preventDefault();r.status==='feedback'?quizNext():quizAnswer();}
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden)quizPause();});
  root.addEventListener('keydown',event=>{
    const modal=$('.modal:has(.quiz-help-content)');if(!modal)return;
    if(event.key==='Escape'&&quizModalReturn?.isConnected){quizModalReturn.focus();quizModalReturn=null;return;}
    if(event.key!=='Tab')return;
    const controls=[...modal.querySelectorAll('button:not(:disabled),a[href]')].filter(e=>e.getClientRects().length),first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal)){event.preventDefault();last?.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===modal)){event.preventDefault();first?.focus();}
  },true);
