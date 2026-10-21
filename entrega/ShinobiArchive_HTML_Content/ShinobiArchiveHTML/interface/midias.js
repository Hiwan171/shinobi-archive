/* Artes promocionais e quadros originais dos jogos. Nenhum pixel é redesenhado. */
  const gameMedia = /* __GAME_MEDIA__ */{};
  const mediaSprites = new Map(gameMedia.sprites.map(s=>[s.person,s]));
  const mediaClips = new Map(gameMedia.clips.map(s=>[`${s.person}:${s.technique}`,s]));
  const mediaTechniqueNames = new Map(gameMedia.clips.map(s=>[s.technique,s.name]));
  let mediaSerial=0,gameAnimationFrame=0;
  function gameClip(person,technique){return mediaClips.get(`${person}:${technique}`);}
  function originalArtFor(c){
    const rows=gameMedia.arts.filter(a=>a.person===c.id);
    return rows.find(a=>a.phase===state.phase)||rows.find(a=>a.phase==='default')||rows[0];
  }
  function heroArtwork(c){
    const art=originalArtFor(c);
    return art?`<button class="file-artwork-button" data-archive-action="artwork" title="Ampliar arte original"><img class="original-game-art" src="${art.inline||esc(art.url)}" data-original-src="${esc(art.url)}" alt="Arte original de ${esc(c.name)} — ${esc(art.game)}" referrerpolicy="no-referrer" data-person="${c.id}"><span>ARTE ORIGINAL ${icon('compare',11)}</span></button>`:picture(c,'',false);
  }
  function characterMediaBadge(c){
    const sprite=mediaSprites.get(c.id),art=originalArtFor(c);
    return `<div class="file-avatar ${sprite?'has-game-sprite':'has-original-art'}" title="${esc(sprite?.game||art?.game||'Retrato do catálogo')}">${sprite?gameSpriteMarkup(sprite,sprite.idle[0],'badge'):picture(c,'small-portrait',false)}</div><small>${sprite?'SPRITE DO JOGO':art?'ARTE ORIGINAL':'RETRATO'}</small>`;
  }
  function colorKeyFilter(id,color,annotations=false){
    // A máscara compara os canais com a cor reservada da folha. A composição
    // remove só esse fundo na exibição; o PNG original permanece inalterado.
    const funcs=color.map((channel,i)=>channel===0?`<feFunc${'RGB'[i]} type="identity"/>`:`<feFunc${'RGB'[i]} type="table" tableValues="${Array.from({length:256},(_,n)=>(Math.abs(n-channel)/255).toFixed(8)).join(' ')}"/>`).join('');
    const noteValues=Array.from({length:256},(_,n)=>(Math.abs(n-250)/255).toFixed(8)).join(' ');
    const notes=annotations?`<feComponentTransfer in="SourceGraphic" result="noteDistance">${['R','G','B'].map(k=>`<feFunc${k} type="table" tableValues="${noteValues}"/>`).join('')}</feComponentTransfer><feColorMatrix in="noteDistance" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 255 255 255 0 -3" result="noteMask"/><feComposite in="keyed" in2="noteMask" operator="in"/>`:'';
    return `<defs><filter id="${id}" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feComponentTransfer in="SourceGraphic" result="distance">${funcs}</feComponentTransfer><feColorMatrix in="distance" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 255 255 255 0 -3" result="mask"/><feComposite in="SourceGraphic" in2="mask" operator="in" result="keyed"/>${notes}</filter></defs>`;
  }
  function gameFrameMarkup(asset,frame,role='actor',filterId=''){
    const [x,y,w,h]=frame;
    return `<svg class="game-frame game-${role}" data-role="${role}" style="width:${w}px;height:${h}px" x="${(role==='actor'?89:159)-w/2}" y="${129-h}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}" overflow="hidden"><image class="game-sheet" style="filter:${filterId?'url(#'+filterId+')':'none'}" href="${esc(asset.url)}" width="${asset.width}" height="${asset.height}" preserveAspectRatio="none"/></svg>`;
  }
  function gameSpriteMarkup(asset,frame,mode='demo'){
    const id='sprite-key-'+(++mediaSerial),badge=mode==='badge';
    const box=badge?'45 35 90 100':'35 35 180 104';
    return `<svg class="game-sprite ${badge?'game-sprite-badge':''}" viewBox="${box}" role="img" aria-label="Sprite original de ${esc(asset.name)} — ${esc(asset.game)}" data-person="${asset.person}" data-key="${id}">${colorKeyFilter(id,asset.displayBackground||asset.background,asset.game.includes('Shinobi Rumble'))}<g class="game-pixels"><svg class="game-frame game-effect" data-role="effect" style="display:none"></svg>${gameFrameMarkup(asset,frame,'actor',id)}<svg class="game-frame game-clone" data-role="clone" style="display:none"></svg></g><text class="game-asset-failure" x="120" y="80" text-anchor="middle">Sprite indisponível</text></svg>`;
  }
  function setGameFrame(svg,asset,frame,role,centerX=89,bottom=129){
    const el=svg.querySelector(`[data-role="${role}"]`);if(!el)return;
    if(!frame){el.style.display='none';return;}
    const [x,y,w,h]=frame;el.style.display='';el.style.width=w+'px';el.style.height=h+'px';
    for(const [k,v] of Object.entries({x:centerX-w/2,y:bottom-h,width:w,height:h,viewBox:`${x} ${y} ${w} ${h}`}))el.setAttribute(k,v);
    if(!el.querySelector('image'))el.innerHTML=`<image class="game-sheet" href="${esc(asset.url)}" width="${asset.width}" height="${asset.height}" preserveAspectRatio="none"/>`;
    el.querySelector('image').style.filter=`url(#${svg.dataset.key})`;
  }
  function stopGameAnimation(){cancelAnimationFrame(gameAnimationFrame);clearTimeout(demoTimer);}
  function renderPersonalArsenal(){
    const all=[...techniquesFor(state.selected)];
    const rows=all.filter(id=>(state.arsenalFilter!=='animated'||gameClip(state.selected,id))&&(!state.arsenalQuery||fold(nameOfTechnique(id)+' '+jutsuById.get(id)?.name).includes(fold(state.arsenalQuery))))
      .sort((a,b)=>Number(!!gameClip(state.selected,b))-Number(!!gameClip(state.selected,a))||Number(techIndex.has(b))-Number(techIndex.has(a))||nameOfTechnique(a).localeCompare(nameOfTechnique(b),'pt-BR'));
    $('#file-tech-list').innerHTML=rows.map(id=>{const t=techIndex.get(id),clip=gameClip(state.selected,id);return `<button class="file-tech-item ${state.dossierJutsu===id?'selected':''} ${clip?'has-game-clip':''}" data-archive-action="technique" data-id="${esc(id)}" aria-pressed="${state.dossierJutsu===id}"><span class="file-tech-symbol ${clip?'curated':''}">${icon(t?.category==='Genjutsu'?'archive':'jutsu',14)}</span><span class="file-tech-name"><strong>${esc(nameOfTechnique(id))}</strong><small>${clip?'Sprite do jogo':esc(t?.category||'Registro do catálogo')}</small></span><span class="file-tech-play" aria-label="${clip?'Sequência do jogo disponível':'Sem sequência específica'}">${clip?'▷':'·'}</span></button>`;}).join('')||'<div class="empty">Nenhuma técnica neste filtro.</div>';
    const previews=all.filter(id=>gameClip(state.selected,id)).length;
    $('#file-tech-count').textContent=`${fmt(rows.length)} de ${fmt(all.length)} técnicas · ${previews} com sequência do jogo`;
  }
  function renderDemonstration(){
    stopGameAnimation();
    const id=state.dossierJutsu,c=byId.get(state.selected),t=techIndex.get(id),clip=gameClip(c.id,id),asset=mediaSprites.get(c.id),art=originalArtFor(c);
    if(!id){$('#file-demo').innerHTML='<div class="empty">Este personagem ainda não possui técnicas documentadas na base.</div>';return;}
    const stage=asset?gameSpriteMarkup(asset,clip?.actor[0]||asset.idle[0]):art?`<img class="game-stage-art" src="${art.inline||esc(art.url)}" alt="${esc(c.name)}" referrerpolicy="no-referrer">`:picture(c,'game-stage-portrait',false);
    $('#file-demo').innerHTML=`<div class="file-demo-heading"><span class="eyebrow">${clip?'PRÉVIA DO JOGO':'REGISTRO DO ARSENAL'}</span><h3>${esc(nameOfTechnique(id))}</h3><span class="file-original-name">${esc(jutsuById.get(id)?.name||'')}</span></div><div class="demo-stage game-demo ${clip?'game-available':'game-unavailable'}" data-animation="${clip?'game':'none'}" data-technique-type="${t?.animation||''}"><div class="demo-scene-grid"></div><span class="demo-scene-id">${asset?'NINTENDO DS · ':''}${esc(c.name)}</span>${stage}<div class="demo-stage-label">${clip?'QUADROS ORIGINAIS DO JOGO':asset?'POSE DO JOGO · SEM SEQUÊNCIA DESTA TÉCNICA':'SEM SEQUÊNCIA DESTA TÉCNICA'}</div></div><div class="demo-controls"><button class="demo-play-button" data-archive-action="play" ${clip?'':'disabled'} aria-label="Executar sequência do jogo">${icon('episodes',14)} ${clip?'Executar técnica':'Sem sequência'}</button><button class="demo-expand" data-archive-action="expand-demo" title="Ampliar demonstração" ${clip?'':'disabled'}>⛶</button><span class="demo-status" aria-live="polite">${clip?'3,6 s · sem áudio':'Registro descritivo'}</span></div><div class="demo-progress"><span></span></div><div class="game-source-caption">${clip?`${esc(clip.game)}<span>${esc(clip.presentation)} · ${sourceLink(clip.source,'Fonte dos sprites ↗')}</span>`:asset?`${esc(asset.game)}<span>A pose identifica o personagem; não simula a técnica selecionada.</span>`:'A animação desta técnica ainda não está disponível.'}</div><div class="demo-description"><p>${esc(t?.description||(clip?'Prévia composta a partir da sequência '+clip.section+' da folha do jogo.':'Técnica vinculada ao personagem no catálogo. A demonstração específica ainda não está disponível.'))}</p><div class="demo-description-foot"><span>${fmt(techniquePeople.get(id)?.size||0)} usuários na base</span>${t?sourceLink(t.source,'Fonte oficial ↗'):''}</div></div>`;
    decorateStageDemo();
  }
  function playDemonstration(){
    stopGameAnimation();
    const scope=$('.file-demo-expanded')||$('#file-demo'),clip=gameClip(state.selected,state.dossierJutsu),asset=mediaSprites.get(state.selected);
    if(!scope||!clip||!asset)return;
    const svg=scope.querySelector('.game-sprite'),stage=scope.querySelector('.demo-stage'),progress=scope.querySelector('.demo-progress>span'),status=scope.querySelector('.demo-status');
    if(!svg||svg.classList.contains('asset-unavailable'))return;
    stage.classList.add('is-playing');scope.classList.add('game-running');
    scope.querySelector('.demo-play-button').innerHTML=icon('episodes',14)+' Repetir técnica';
    status.textContent='Preparação → execução → conclusão';
    const start=performance.now(),duration=3600;
    function tick(now){
      if(!scope.isConnected)return;
      const ratio=Math.min(1,(now-start)/duration),phase=Math.max(0,Math.min(1,(ratio-.12)/.72));
      const index=Math.min(clip.actor.length-1,Math.floor(phase*clip.actor.length));
      setGameFrame(svg,asset,clip.actor[index],'actor');svg.dataset.frame=String(index);
      const active=ratio>.22&&ratio<.92,loopEffects=clip.effects.length<=4&&/Rasengan|Chidori|Relâmpago|Palma|Rasenshuriken/.test(clip.name);
      const effectIndex=loopEffects?Math.floor((now-start)/110)%clip.effects.length:Math.min(clip.effects.length-1,Math.floor(Math.max(0,(ratio-.22)/.7)*clip.effects.length));
      const effect=active&&clip.effects.length?clip.effects[effectIndex]:null;
      const pos=clip.effectPosition,center=pos==='body'?89:pos==='ground'?145:pos==='front'?173:133,bottom=pos==='ground'?132:pos==='body'?126:105;
      setGameFrame(svg,asset,effect,'effect',center,bottom);
      setGameFrame(svg,asset,clip.clones&&ratio>.38&&ratio<.9?asset.idle[Math.floor((now-start)/130)%asset.idle.length]:null,'clone',167,129);
      if(progress)progress.style.width=ratio*100+'%';
      if(ratio<1)gameAnimationFrame=requestAnimationFrame(tick);
      else{scope.classList.remove('game-running');status.textContent='Concluída · reproduzir novamente';}
    }
    gameAnimationFrame=requestAnimationFrame(tick);
  }
  function showOriginalArtwork(){
    const c=byId.get(state.selected),art=originalArtFor(c);if(!art)return;
    showModal('Arte original · '+c.name,`<div class="original-art-viewer"><img src="${art.inline||esc(art.url)}" alt="Arte original de ${esc(c.name)}" referrerpolicy="no-referrer"></div><div class="original-art-caption"><strong>${esc(art.game)}</strong><span>${esc(art.credit)}</span>${sourceLink(art.source,'Ver no site oficial ↗')}</div>`);
    $('.modal').classList.add('file-art-modal');
  }
  root.addEventListener('click',event=>{if(event.target.closest('[data-archive-action="artwork"]'))showOriginalArtwork();});
  root.addEventListener('error',event=>{
    const el=event.target;
    if(el.classList?.contains('original-game-art')&&!el.dataset.fallback){el.dataset.fallback='1';el.src=portrait(byId.get(Number(el.dataset.person)));el.classList.add('fallback-portrait');}
    if(el.classList?.contains('game-sheet')){const svg=el.closest('.game-sprite');if(svg)svg.classList.add('asset-unavailable');const scope=el.closest('.file-demo,.file-demo-expanded');if(scope){scope.querySelector('.demo-play-button').disabled=true;scope.querySelector('.demo-status').textContent='Sprite indisponível';}}
  },true);
