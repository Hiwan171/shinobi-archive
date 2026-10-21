/* Dossiê visual: os símbolos e números apresentam registros, nunca notas de poder. */
  function richDossierHeader(c){
    return `<div class="rich-dossier-heading"><div class="rich-dossier-seal">${villageSymbol(c)}</div><div><span class="stage-kicker">01 / DOSSIÊ SHINOBI</span><h3>Além do nome<span>.</span></h3></div><button class="stage-poll" data-detail-action="poll" title="Explorar os resultados históricos do NARUTOP99"><span>${icon('popular',13)} NARUTOP99</span><b>${c.rank?'#'+c.rank:'—'}</b><small>${c.votes?fmt(c.votes)+' votos':'Sem associação'}</small></button></div>`;
  }
  function stageDossierContent(c,bio,intro,chapters,families){
    const cover=originalArtFor(c),image=cover?`<img src="${cover.inline||esc(cover.url)}" data-original-src="${esc(cover.url)}" data-detail-person="${c.id}" alt="" referrerpolicy="no-referrer">`:picture(c,'',false);
    if(state.dossierTab==='history'){
      const visible=chapters.filter(h=>state.revealStory||!h.spoiler).slice(0,3),hidden=chapters.filter(h=>h.spoiler).length;
      return `<div class="stage-history rich-history"><div class="rich-story-title"><span class="stage-overline">${bio?'TRAJETÓRIA · REFERÊNCIAS OFICIAIS':'PERFIL DOCUMENTADO'}</span><h3>${esc(bio?.title||'Os registros de '+c.name)}</h3></div>${visible.length?`<div class="rich-story-rail">${visible.map((h,i)=>`<button data-detail-action="chapter" data-order="${h.order}" title="${esc(h.title)}"><span class="rich-story-node">${String(i+1).padStart(2,'0')}</span><span><small>${esc(h.phase)}</small><strong>${esc(h.title)}</strong></span><b>↗</b></button>`).join('')}</div>`:`<p>${esc(intro)}</p>`}<div class="rich-story-foot"><span>${hidden&&!state.revealStory?icon('archive',11)+' Desfechos protegidos':chapters.length+' capítulos no arquivo'}</span><button data-archive-action="biography">${chapters.length?'Biografia completa':'Abrir perfil e fontes'} ↗</button></div></div>`;
    }
    if(state.dossierTab==='family')return `<div class="stage-family rich-family"><div class="rich-family-origin"><button data-archive-action="biography" title="Abrir biografia de ${esc(c.name)}">${picture(c,'',false)}</button><span>OS ELOS DE<strong>${esc(c.name)}</strong></span><i></i><span class="rich-link-count">${families.length}<small>vínculos</small></span></div><div class="rich-family-branches">${familyItems(families.slice(0,2))||'<p>Sem vínculos familiares registrados.</p>'}</div><button class="stage-detail-link" data-archive-action="connections">Explorar família, equipes e linhagens <span>↗</span></button></div>`;
    const inherited=inheritedFor(c.id),clan=c.clan&&c.clan!=='Não informado'?c.clan:null;
    return `<div class="rich-profile"><div class="rich-profile-art" aria-hidden="true">${image}</div><div class="rich-profile-copy"><span class="rich-clan-tag">${icon('clan',12)} ${clan?'Clã '+esc(clan):esc(c.village||'Perfil do catálogo')}</span><h3>${esc(bio?.title||'Identidade shinobi')}</h3><p class="stage-intro">${esc(intro)}</p></div><div class="stage-profile-facts"><span><i>${richCalendarIcon()}</i><span><small>ANIVERSÁRIO</small>${esc(translateBirthday(c.birthday))}</span></span><span><i class="rich-blood-icon">${richBloodIcon()}</i><span><small>SANGUE</small><b>${esc(c.blood||'—')}</b></span></span><button data-stage-action="facts" title="Abrir medidas, patente, equipes e linhagens">Ficha completa ↗</button></div>${inherited.length?`<div class="rich-inherited" aria-label="Habilidades especiais registradas">${inherited.slice(0,2).map(name=>`<span title="${esc(name)}">${icon('jutsu',10)}${esc(name)}</span>`).join('')}${inherited.length>2?`<button data-stage-action="facts">+${inherited.length-2}</button>`:''}</div>`:''}</div>`;
  }
  function richBloodIcon(){return '<svg width="15" height="17" viewBox="0 0 20 24" fill="none" aria-hidden="true"><path d="M10 2C8 6 3 11 3 15a7 7 0 0 0 14 0c0-4-5-9-7-13Z" stroke="currentColor" stroke-width="1.5"/><path d="M6 15a4 4 0 0 0 4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';}
  function richCalendarIcon(){return '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2"/></svg>';}
  function decorateRichTechnique(){
    const host=$('#file-demo');if(!host||!$('.dossier-rich'))return;
    const id=state.dossierJutsu,t=techIndex.get(id),clip=gameClip(state.selected,id),asset=mediaSprites.get(state.selected),users=techniquePeople.get(id)?.size||0;
    const heading=host.querySelector('.file-demo-heading');if(!heading)return;
    host.classList.toggle('rich-long-tech',nameOfTechnique(id).length>26);
    const glyph=t?.category==='Genjutsu'?'archive':t?.category==='Taijutsu'?'compare':'jutsu';
    heading.insertAdjacentHTML('afterbegin',`<div class="rich-tech-mark" aria-hidden="true">${icon(glyph,25)}<i></i></div>`);
    heading.insertAdjacentHTML('beforeend',`<div class="rich-tech-tags"><span>${icon(glyph,11)} ${esc(t?.category||'Catálogo')}</span><span>${clip?'3,6 s · sequência do jogo':'Sem sequência específica'}</span></div>`);
    const stage=host.querySelector('.demo-stage');
    stage.insertAdjacentHTML('beforeend',`<div class="rich-stage-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></div><span class="rich-stage-mode">${clip?'<i></i> SPRITES ORIGINAIS':asset?'POSE DO PERSONAGEM':'ARTE DO PERSONAGEM'}</span><div class="rich-stage-aura" aria-hidden="true"></div>`);
    const notes=host.querySelector('.stage-tech-notes');
    host.querySelector('.demo-progress').insertAdjacentHTML('afterend',`<div class="rich-inline-credit">${clip?'Sequência montada com quadros originais do jogo':asset?'Pose do jogo · sem sequência desta técnica':'Arte original · sem sequência desta técnica'}</div>`);
    if(notes)notes.innerHTML=`<span class="rich-tech-note-icon">${icon('archive',16)}</span><span><strong>Explorar a técnica</strong><small>Descrição completa e referências</small></span><b>${fmt(users)}<small>usuários</small></b><i>↗</i>`;
    host.querySelectorAll('.game-source-caption a').forEach(a=>a.setAttribute('title','Consultar a folha original e seus créditos'));
  }
  function showRichTechniqueDetails(){
    const host=$('#file-demo'),clip=gameClip(state.selected,state.dossierJutsu),t=techIndex.get(state.dossierJutsu);
    showModal(nameOfTechnique(state.dossierJutsu),`<div class="stage-tech-detail"><span class="rich-modal-label">${esc(t?.category||'REGISTRO DO CATÁLOGO')}</span><p class="rich-native-technique">${esc(jutsuById.get(state.dossierJutsu)?.name||'')}</p>${host.querySelector('.demo-description').outerHTML}${host.querySelector('.game-source-caption').outerHTML}${clip?`<div class="rich-media-credit"><span>FOLHA DE SPRITES</span><strong>${esc(clip.credit)}</strong><p>Sequência montada com quadros originais. O tempo e a composição pertencem à interface.</p></div>`:''}</div>`);
  }
  function showShinobiPoll(){
    const c=byId.get(state.selected),rows=data.votes.filter(v=>v.person===c.id&&v.region!=='all').sort((a,b)=>b.votes-a.votes),max=Math.max(...rows.map(r=>r.votes),1);
    showModal('A voz dos fãs · '+c.name,`<div class="rich-poll-summary"><span>${icon('popular',30)}</span><div><small>NARUTOP99 · RESULTADO GLOBAL DE 2023</small><strong>${c.rank?'#'+c.rank:'—'}</strong><p>${c.votes?fmt(c.votes)+' votos globais':'Sem associação documentada ao resultado'}</p></div></div><div class="rich-poll-regions">${rows.map(r=>`<div><span>${esc(regionNames[r.region]||r.region)}<small>#${r.rank} na região</small></span><div><i style="width:${r.votes/max*100}%"></i></div><strong>${fmt(r.votes)}</strong></div>`).join('')}</div><p class="micro">Votação histórica. O total global já inclui as regiões; os valores não são somados novamente.</p><a class="file-source" href="https://narutop99.naruto-official.com/en/" target="_blank" rel="noopener noreferrer">Consultar o resultado oficial ↗</a>`);
    $('.modal').classList.add('rich-poll-modal');
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-detail-action]');if(!target)return;
    if(target.dataset.detailAction==='poll')showShinobiPoll();
    if(target.dataset.detailAction==='chapter'){
      const order=Number(target.dataset.order);showBiography();
      requestAnimationFrame(()=>$('.file-timeline [data-story-order="'+order+'"]')?.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
    }
  });
  root.addEventListener('error',event=>{
    const img=event.target;if(!img.matches?.('.rich-profile-art img'))return;
    if(!img.dataset.fallback&&img.dataset.detailPerson){img.dataset.fallback='1';const c=byId.get(Number(img.dataset.detailPerson));if(portrait(c)){img.src=portrait(c);return;}}
    img.style.display='none';
  },true);
