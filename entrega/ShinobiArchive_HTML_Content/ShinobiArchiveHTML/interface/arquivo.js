/* Módulo Arquivo Ninja. Executa no escopo da interface, dentro do visual. */
  const villageSymbols = /* __VILLAGE_SYMBOLS__ */{};
  const bioIndex = new Map((data.biographies || []).map(b => [b.person,b]));
  const techIndex = new Map((data.techniqueDetails || []).map(t => [t.id,t]));
  const inheritedIndex = new Map((data.inherited || []).map(t => [t.id,t.name]));
  const teamIndex = new Map(data.teams.map(t => [t.id,t.name]));
  Object.assign(state,{arsenalQuery:'',arsenalFilter:'all',dossierJutsu:null,dossierOwner:null,revealStory:false});
  let demoTimer;
  const demoPalette = {rasengan:'#64cbff',clones:'#c6dbeb',lightning:'#a8c9ff',fire:'#ff8b40',amaterasu:'#bb79f2',eye:'#f26071',susanoo:'#ba88f4',vortex:'#a0baff',teleport:'#ffe18a',summon:'#f7aa8d',healing:'#6ce8b3',gates:'#ff8e65',taijutsu:'#7de1ac',byakugan:'#d5caff',shadow:'#b5a5e5'};
  const characterStyle = c => bioIndex.get(c.id)?.style || (c.clan?.includes('Uchiha')?'sasuke':'ninja');
  const villageSymbol = c => {
    const key=({'Konohagakure':'konoha','Sunagakure':'suna','Kirigakure':'kiri','Kumogakure':'kumo','Iwagakure':'iwa'})[c.village];
    return key&&villageSymbols[key]?`<img src="data:image/svg+xml;base64,${villageSymbols[key]}" alt="Símbolo de ${esc(c.village)}">`:icon('leaf',32);
  };
  const actualTeams = id => [...new Set((data.teamLinks||[]).filter(r=>r.person===id).map(r=>teamIndex.get(r.team)).filter(Boolean))];
  const inheritedFor = id => [...new Set((data.inheritedLinks||[]).filter(r=>r.person===id).map(r=>inheritedIndex.get(r.ability)).filter(Boolean))];
  const debutsFor = id => (data.debuts||[]).filter(r=>r.person===id && /manga|anime/i.test(r.medium)).slice(0,2);
  const storyFor = id => (data.history||[]).filter(r=>r.person===id).sort((a,b)=>a.order-b.order);
  const nameOfTechnique = id => techIndex.get(id)?.name || mediaTechniqueNames.get(id) || jutsuById.get(id)?.name || 'Técnica';
  const sourceLink = (link,label='Consultar referência ↗') => /^https:\/\/(naruto-official\.com|anilist\.co|naruto-game-sc\.bn-ent\.net|spritedatabase\.net)\//.test(link||'')?`<a class="file-source" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`:'';
  function renderArchive() {
    header([[fmt(data.characters.length),'Personagens'],[fmt(data.clans.length),'Clãs'],[fmt(data.villages.length),'Vilas']]);
    const villages=[...new Set(data.characters.map(c=>c.village).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    $('#screen').innerHTML=`<section class="archive-layout archive-v3 archive-v5"><aside class="catalog panel">${panelHead('ÍNDICE SHINOBI','<span class="count-badge" id="catalog-count"></span>')}<div class="catalog-tools">${search('Nome, clã ou vila...',state.query,'character-search')}<select id="catalog-village" aria-label="Filtrar personagens por vila"><option value="">Todas as vilas</option>${options(villages,state.village,x=>x,x=>x)}</select><button class="small-button global-tech-library" data-world-action="library">Catálogo de técnicas ↗</button></div><div id="catalog-grid" class="catalog-grid"></div><div class="catalog-foot"><span id="catalog-foot-label"></span><button class="small-button" data-action="more-characters">Ver mais ↓</button></div></aside><div id="dossier" class="dossier dossier-v5"></div></section>`;
    renderCatalog();renderDossier();
  }
  function chooseInitialTechnique(c) {
    const ids=[...techniquesFor(c.id)];
    const preferred={naruto:'Rasengan',minato:'Rasengan',sasuke:'Chidori',itachi:'Amaterasu',kakashi:'Lightning Cutter',sakura:'Mystical Palm Technique',jiraiya:'Rasengan',shikamaru:'Shadow Imitation Technique',tobirama:'Flying Thunder God Technique',shisui:'Kotoamatsukami',madara:'Susanoo',obito:'Kamui',guy:'Eight Gates',lee:'Strong Fist',neji:'Gentle Fist'}[characterStyle(c)];
    return ids.find(id=>jutsuById.get(id)?.name===preferred&&gameClip(c.id,id)) || ids.find(id=>gameClip(c.id,id)) || ids.find(id=>jutsuById.get(id)?.name===preferred) || ids.find(id=>techIndex.has(id)) || ids[0] || null;
  }
  function familyItems(rows) {
    // Nome de casada na relação; o catálogo usa Hinata Hyūga. Preserva o registro original.
    const aliases={'Hinata Uzumaki':437};
    return rows.map(f=>{const related=f.related||aliases[f.name],other=byId.get(related);return `<div class="file-family-item"><div class="file-family-avatar">${other?picture(other,'small-portrait'):icon('clan',16)}</div><div><span>${esc(kinship(f.kinship))}</span>${other?`<button data-action="person" data-id="${related}">${esc(f.name)} <b>↗</b></button>`:`<strong>${esc(f.name)}</strong>`}</div></div>`;}).join('');
  }
  function showBiography() {
    const c=byId.get(state.selected),bio=bioIndex.get(c.id),chapters=storyFor(c.id),visible=chapters.filter(h=>state.revealStory||!h.spoiler),hidden=chapters.length-visible.length;
    const body=chapters.length?`<div class="file-story-heading"><span>${chapters.length} capítulos · síntese editorial em português</span><label class="file-spoiler-control"><input id="story-spoilers" type="checkbox" ${state.revealStory?'checked':''}> Revelar desfechos</label></div><div class="file-timeline">${visible.map((h,i)=>`<article data-story-order="${h.order}"><span class="timeline-node">${String(h.order+1).padStart(2,'0')}</span><div class="eyebrow">${esc(h.phase)}</div><h3>${esc(h.title)}</h3><p>${esc(h.text)}</p>${sourceLink(h.source)}</article>`).join('')}</div>${hidden?`<div class="file-spoiler-lock">${icon('archive',18)}<div><strong>${hidden} capítulos com revelações</strong><p>Ative “Revelar desfechos” para continuar a trajetória.</p></div><button data-archive-action="reveal-story">Revelar</button></div>`:''}`:`<div class="file-profile-fallback"><p>${esc(c.name)} possui ${fmt(techniquesFor(c.id).size)} técnicas documentadas e ${fmt(new Set(natureByPerson.get(c.id)||[]).size)} registros de natureza de chakra.</p><p>Clã: ${esc(c.clan||'não informado')}. Afiliação: ${esc(c.village||'não informada')}. ${esc(actualTeams(c.id).length?'Equipes registradas: '+actualTeams(c.id).join(', ')+'.':'')}</p>${debutsFor(c.id).map(d=>`<p><b>${esc(d.medium)}</b> · ${esc(d.reference)}</p>`).join('')}<div class="file-coverage-note">A trajetória narrativa deste personagem ainda está em curadoria. Os dados acima são registros da base, sem preenchimento de informações ausentes.</div></div>`;
    showModal(c.name,`<div class="file-bio-lead"><div class="file-bio-avatar">${picture(c,'',false)}</div><div><h3>${esc(bio?.title||'Perfil documentado')}</h3><p>${esc(bio?.intro||'Características e vínculos disponíveis no catálogo.')}</p></div></div>${body}<div class="file-biography-sources"><span>REFERÊNCIAS</span>${bio?bio.sources.split(' | ').map((link,i)=>sourceLink(link,'NARUTO Official · referência '+(i+1)+' ↗')).join(''):sourceLink((data.profiles||[]).find(p=>p.person===c.id)?.source,'Perfil AniList ↗')}</div>`);
    $('.modal').classList.add('file-biography-modal');
  }
  function showConnections() {
    const c=byId.get(state.selected),families=data.family.filter(f=>f.person===c.id),teams=actualTeams(c.id),inherited=inheritedFor(c.id);
    showModal('As conexões de '+c.name,`<div class="file-connections-center"><div>${picture(c,'',false)}</div><strong>${esc(c.name)}</strong><span>${esc(c.clan||'Clã não informado')} · ${esc(c.village||'Origem não informada')}</span></div><div class="file-connections-grid">${familyItems(families)||'<p>Sem vínculos familiares registrados.</p>'}</div><div class="file-connection-groups"><h3>Equipes e afiliações</h3><div class="chips">${teams.map(t=>`<span class="chip">${esc(t)}</span>`).join('')||'<span class="micro">Sem equipes registradas.</span>'}</div>${inherited.length?`<h3>Linhagens e habilidades especiais</h3><div class="chips">${inherited.map(t=>`<span class="chip blue">${esc(t)}</span>`).join('')}</div>`:''}</div>`);
    $('.modal').classList.add('file-connections-modal');
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-archive-action]');if(!target||target.disabled)return;
    event.stopPropagation();const action=target.dataset.archiveAction;
    if(action==='biography')showBiography();
    else if(action==='connections')showConnections();
    else if(action==='technique'){state.dossierJutsu=target.dataset.id;renderPersonalArsenal();renderDemonstration();}
    else if(action==='arsenal-filter'){state.arsenalFilter=target.dataset.filter;renderDossier();}
    else if(action==='play')playDemonstration();
    else if(action==='reveal-story'){state.revealStory=true;showBiography();}
    else if(action==='expand-demo'){
      const content=$('#file-demo').innerHTML;showModal(nameOfTechnique(state.dossierJutsu),`<div class="file-demo-expanded">${content}</div>`);$('.modal').classList.add('file-demo-modal');
    }
  });
  root.addEventListener('input',event=>{if(event.target.id==='arsenal-search'){state.arsenalQuery=event.target.value;renderPersonalArsenal();}});
  root.addEventListener('change',event=>{if(event.target.id==='story-spoilers'){state.revealStory=event.target.checked;showBiography();}});
