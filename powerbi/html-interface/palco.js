/* Arquivo Ninja 05: personagem no centro; informação por aproximação. */
  Object.assign(state,{dossierTab:'overview',arsenalOpen:false});
  const stageAccents={naruto:'#f3a34d',sasuke:'#a2a0ee',itachi:'#de737a',sakura:'#e89aae',kakashi:'#80b8b0',orochimaru:'#b59bd9',gaara:'#d3a272',minato:'#e9bd6d',shikamaru:'#9db887',guy:'#88c4a5',lee:'#88c4a5'};
  function renderDossier(){
    stopGameAnimation();
    const c=byId.get(state.selected);if(!c)return;
    if(state.dossierOwner!==c.id){Object.assign(state,{dossierOwner:c.id,dossierJutsu:chooseInitialTechnique(c),arsenalQuery:'',arsenalFilter:'all',revealStory:false,dossierTab:'overview',arsenalOpen:false});}
    const bio=bioIndex.get(c.id),profile=data.profiles.find(p=>p.person===c.id),families=data.family.filter(f=>f.person===c.id),chapters=storyFor(c.id);
    const phases=[...new Set(data.physical.filter(p=>p.person===c.id).map(p=>p.phase))];if(!phases.includes(state.phase))phases.unshift(state.phase);
    const accent=({928:'#b59bd9'})[c.id]||stageAccents[characterStyle(c)]||'#9cb2ce';
    const natureCount=new Set(natureByPerson.get(c.id)||[]).size;
    const available=[...techniquesFor(c.id)].filter(id=>gameClip(c.id,id));
    const quick=(available.length?available:[...techniquesFor(c.id)].filter(id=>techIndex.has(id))).slice(0,3);
    const intro=bio?.intro||`${c.name} integra o catálogo do universo Naruto. Explore as características, os vínculos e as técnicas documentadas nesta ficha.`;
    $('#dossier').style.setProperty('--stage-accent',accent);
    $('#dossier').innerHTML=`
      <article class="hero stage-hero" data-character="${c.id}">
        <div class="stage-noise"></div><span class="stage-watermark" aria-hidden="true">忍</span>
        <div class="stage-topline"><span>SHINOBI / ${String(c.id).padStart(4,'0')}</span><span><i></i> ARQUIVO DO PERSONAGEM</span></div>
        <div class="hero-copy stage-heading"><div class="hero-jp">${esc(profile?.native||'忍の記録')}</div><h2 title="${esc(c.name)}">${esc(c.name)}</h2><div class="stage-origin"><span>${esc(c.clan||'Clã não informado')}</span><i></i><span>${esc(c.village||'Origem não informada')}</span></div></div>
        <div class="hero-portrait stage-portrait"><div class="stage-halo" aria-hidden="true"><i></i><i></i><i></i></div><div class="stage-ground"></div>${heroArtwork(c)}<span class="stage-art-caption">${originalArtFor(c)?'ARTE ORIGINAL · STORM CONNECTIONS':'RETRATO DO CATÁLOGO'}</span><div class="stage-dust" aria-hidden="true">${Array.from({length:8},(_,i)=>`<i style="--n:${i}"></i>`).join('')}</div></div>
        <div class="stage-chakra"><div class="stage-section-label">NATUREZAS DE CHAKRA <span>${natureCount} registros ${icon('leaf',11)}</span></div><div class="chakra-list">${chakra(c.id)||'<span class="micro">Sem naturezas documentadas.</span>'}</div></div>
        <div class="stage-measurements"><div class="stage-phase"><span>FASE DO PERSONAGEM</span><select id="phase-select" class="phase-select" aria-label="Fase do personagem">${options(phases,state.phase,p=>phaseNames[p]||p,p=>p)}</select></div><div class="physical-grid"><div><strong>${esc(phaseValue(c.id,'idade'))}</strong><span>Idade</span></div><div><strong>${esc(phaseValue(c.id,'altura'))}</strong><span>Altura</span></div><div><strong>${esc(phaseValue(c.id,'peso'))}</strong><span>Peso</span></div></div></div>
        <div class="stage-actions"><button data-archive-action="biography">${icon('archive',15)} Ler biografia <span>↗</span></button><button data-stage-action="facts">Ficha completa ${icon('compare',13)}</button></div>
      </article>
      <aside class="stage-sidebar dossier-rich">
        <section class="stage-dossier" aria-label="Dossiê do personagem">
          ${richDossierHeader(c)}
          <div class="stage-tabs" role="tablist" aria-label="Informações do personagem">${[['overview','Perfil'],['history','História'],['family','Vínculos']].map(([id,label])=>`<button role="tab" id="stage-tab-${id}" aria-controls="stage-tab-panel" aria-selected="${state.dossierTab===id}" tabindex="${state.dossierTab===id?0:-1}" data-stage-action="tab" data-tab="${id}">${icon(id==='overview'?'clan':id==='history'?'archive':'groups',12)}<span>${label}</span>${id==='family'?` <small>${families.length}</small>`:''}</button>`).join('')}</div>
          <div id="stage-tab-panel" class="stage-tab-panel" role="tabpanel" aria-labelledby="stage-tab-${state.dossierTab}">${stageDossierContent(c,bio,intro,chapters,families)}</div>
        </section>
        <section class="file-arsenal stage-arsenal ${state.arsenalOpen?'arsenal-open':''}" aria-label="Arsenal do personagem">
          <div class="stage-section-head"><span class="stage-kicker">02 / ARSENAL NINJA</span><button class="stage-library-button" data-stage-action="arsenal" aria-expanded="${state.arsenalOpen}" aria-controls="stage-library">${icon('jutsu',13)} ${fmt(techniquesFor(c.id).size)} técnicas <span>↗</span></button></div>
          <div class="stage-quick-techs" aria-label="Técnicas em destaque">${quick.map(id=>`<button data-stage-action="quick" data-id="${esc(id)}" class="${state.dossierJutsu===id?'active':''}">${esc(nameOfTechnique(id))}</button>`).join('')}</div>
          <div id="file-demo" class="file-demo"></div>
          <div id="stage-library" class="stage-library" ${state.arsenalOpen?'':'hidden'}><div class="stage-library-head"><div><span class="stage-kicker">ARSENAL COMPLETO</span><h3>Todas as técnicas</h3></div><button data-stage-action="arsenal" aria-label="Fechar arsenal">×</button></div><div class="file-arsenal-toolbar">${search('Buscar no arsenal...',state.arsenalQuery,'arsenal-search')}<div class="file-arsenal-filters"><button data-archive-action="arsenal-filter" data-filter="all" class="${state.arsenalFilter==='all'?'active':''}">Todas</button><button data-archive-action="arsenal-filter" data-filter="animated" class="${state.arsenalFilter==='animated'?'active':''}"><i></i> Com prévia</button></div></div><div id="file-tech-list" class="file-tech-list"></div><div id="file-tech-count" class="file-tech-foot"></div></div>
        </section>
        <div class="stage-sidebar-foot"><div class="file-village-seal">${villageSymbol(c)}</div><span>${esc(c.village||'Origem não informada')}<small>UM SHINOBI. MUITAS HISTÓRIAS.</small></span>${characterMediaBadge(c)}</div>
      </aside>`;
    renderPersonalArsenal();renderDemonstration();
  }
  function showCompleteFacts(){
    const c=byId.get(state.selected),teams=actualTeams(c.id),inherited=inheritedFor(c.id);
    const grade=[...new Set(data.grades.filter(p=>p.person===c.id&&p.phase===state.phase).map(p=>p.grade))].join(' · ');
    const classes=(c.classification||'').split('|').map(s=>s.trim()).filter(Boolean);
    showModal('Ficha completa · '+c.name,`<div class="stage-facts-grid">${[['Fase',phaseNames[state.phase]||state.phase],['Idade',phaseValue(c.id,'idade')],['Altura',phaseValue(c.id,'altura')],['Peso',phaseValue(c.id,'peso')],['Aniversário',translateBirthday(c.birthday)],['Tipo sanguíneo',c.blood||'Não informado'],['Patente nesta fase',grade||'Não informada'],['Clã',c.clan||'Não informado'],['Afiliação',c.village||'Não informada']].map(([label,value])=>`<div><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`).join('')}</div><h3>Naturezas de chakra</h3><div class="chakra-list">${chakra(c.id)||'Sem registros.'}</div><h3>Equipes e afiliações</h3><div class="chips">${teams.map(t=>`<span class="chip">${esc(t)}</span>`).join('')||'Sem registros.'}</div><h3>Linhagens e habilidades especiais</h3><div class="chips">${inherited.map(t=>`<span class="chip blue">${esc(t)}</span>`).join('')||'Sem registros.'}</div>${classes.length?`<h3>Classificações registradas</h3><p>${esc(classes.join(' · '))}</p>`:''}<h3>Estreias documentadas</h3>${debutsFor(c.id).map(d=>`<p><b>${esc(d.medium)}</b> · ${esc(d.reference)}</p>`).join('')||'<p>Sem registros.</p>'}<p class="micro">As contagens representam registros do catálogo. Não são notas de força ou poder.</p>`);
    $('.modal').classList.add('stage-facts-modal');
  }
  function decorateStageDemo(){
    if(!$('.archive-v5'))return;
    $('#file-demo').insertAdjacentHTML('beforeend',`<button class="stage-tech-notes" data-stage-action="tech-notes">Sobre esta técnica <span>${fmt(techniquePeople.get(state.dossierJutsu)?.size||0)} usuários na base ↗</span></button>`);
    decorateRichTechnique();
  }
  function toggleStageArsenal(open){
    state.arsenalOpen=open;const library=$('#stage-library');if(!library)return;
    library.hidden=!open;$('.stage-arsenal').classList.toggle('arsenal-open',open);
    $('.stage-library-button').setAttribute('aria-expanded',String(open));
    if(open)$('#arsenal-search').focus();else $('.stage-library-button').focus();
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-stage-action]');
    if(target){
      const action=target.dataset.stageAction;
      if(action==='facts')showCompleteFacts();
      if(action==='tech-notes')showRichTechniqueDetails();
      if(action==='arsenal')toggleStageArsenal(!state.arsenalOpen);
      if(action==='quick'){state.dossierJutsu=target.dataset.id;renderPersonalArsenal();renderDemonstration();root.querySelectorAll('.stage-quick-techs button').forEach(b=>b.classList.toggle('active',b.dataset.id===state.dossierJutsu));}
      if(action==='tab'){
        state.dossierTab=target.dataset.tab;
        root.querySelectorAll('.stage-tabs button').forEach(b=>{const selected=b===target;b.setAttribute('aria-selected',String(selected));b.tabIndex=selected?0:-1;});
        const c=byId.get(state.selected),bio=bioIndex.get(c.id);$('#stage-tab-panel').innerHTML=stageDossierContent(c,bio,bio?.intro||`${c.name} integra o catálogo do universo Naruto. Explore os registros disponíveis.`,storyFor(c.id),data.family.filter(f=>f.person===c.id));$('#stage-tab-panel').setAttribute('aria-labelledby',target.id);
      }
    }
    if(event.target.closest('.file-tech-item')){toggleStageArsenal(false);root.querySelectorAll('.stage-quick-techs button').forEach(b=>b.classList.toggle('active',b.dataset.id===state.dossierJutsu));}
  });
  root.addEventListener('keydown',event=>{
    if(event.key==='Escape'&&state.arsenalOpen){toggleStageArsenal(false);return;}
    const tab=event.target.closest('.stage-tabs [role="tab"]');
    if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
      event.preventDefault();const tabs=[...root.querySelectorAll('.stage-tabs [role="tab"]')],i=tabs.indexOf(tab);
      const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(i+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click();
    }
  });
  // Parallax discreto, limitado à arte. O dossiê e os controles não se movem.
  let stagePointerFrame=0;
  root.addEventListener('pointermove',event=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const stage=event.target.closest('.stage-portrait');if(!stage)return;
    const r=stage.getBoundingClientRect(),x=((event.clientX-r.left)/r.width-.5)*9,y=((event.clientY-r.top)/r.height-.5)*6;
    cancelAnimationFrame(stagePointerFrame);stagePointerFrame=requestAnimationFrame(()=>{stage.style.setProperty('--px',x+'px');stage.style.setProperty('--py',y+'px');});
  });
  root.addEventListener('pointerout',event=>{const stage=event.target.closest('.stage-portrait');if(stage&&!stage.contains(event.relatedTarget)){cancelAnimationFrame(stagePointerFrame);stage.style.setProperty('--px','0px');stage.style.setProperty('--py','0px');}});
