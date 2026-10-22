  // Linhas da História. Dados exclusivamente do modelo semântico.
  Object.assign(state, {episodeKind:'', episodeSelected:null});
  const episodeSize = 20;
  const episodeSeries = {
    20:{chapter:'01',label:'O começo',title:'Todo sonho tem\num primeiro passo.',copy:'Da Academia ao caminho ninja. Explore os episódios que deram início à jornada.',person:1344,phase:'Part I',stamp:'木ノ葉'},
    1735:{chapter:'02',label:'Laços e destino',title:'O sonho cresce.\nOs laços resistem.',copy:'Reencontros, escolhas e novos caminhos. Percorra a história de Naruto Shippuden.',person:1344,phase:'default',stamp:'疾風伝'},
    97938:{chapter:'03',label:'A próxima geração',title:'Um legado.\nNovos caminhos.',copy:'Uma nova geração encontra seu lugar no mundo ninja. Conheça a jornada de Boruto.',person:1339,phase:'default',stamp:'次世代'}
  };
  const episodeKinds = ['Cânone','Misto','Filler','Cânone do anime','Não classificado'];
  const episodeRows = () => data.episodes.filter(e=>e.series===state.series).sort((a,b)=>a.number-b.number);
  const episodeArcs = () => data.arcs.filter(a=>a.series===state.series).sort((a,b)=>a.first-b.first||a.name.localeCompare(b.name));
  const episodeMatches = e => {
    const query=fold(state.episodeQuery).trim();
    return (!state.arc||e.arc===state.arc)&&(!state.episodeKind||cardKind(e)===state.episodeKind)&&(!query||(/^\d+$/.test(query)?e.number===Number(query):fold(e.title).includes(query)));
  };
  const episodeCounts = rows => episodeKinds.map(kind=>({kind,count:rows.filter(e=>cardKind(e)===kind).length})).filter(k=>k.count);
  const episodeCode = n => String(n).padStart(3,'0');
  function episodeArt(series){
    const cfg=episodeSeries[series];
    const art=gameMedia.arts.find(a=>a.person===cfg.person&&a.phase===cfg.phase)||gameMedia.arts.find(a=>a.person===cfg.person);
    return art?`<figure class="story-art"><img src="${url(art.inline||art.url)}" alt="Arte de ${esc(seriesNames[series])}" referrerpolicy="no-referrer" onerror="this.closest('figure').hidden=true"><figcaption>Arte · ${esc(art.game)}<br>${esc(art.credit)}</figcaption></figure>`:'';
  }
  function renderEpisodes(){
    const all=episodeRows(),arcs=episodeArcs(),cfg=episodeSeries[state.series],counts=episodeCounts(all);
    const filler=all.filter(e=>cardKind(e)==='Filler').length;
    header([[fmt(all.length),'Episódios na série'],[fmt(arcs.length),'Arcos na série'],[percent(all.length?filler/all.length:0),'Filler na série']]);
    $('#screen').innerHTML=`<section class="story-page" aria-label="Linhas da História">
      <div class="story-series" role="group" aria-label="Selecionar série">${Object.entries(episodeSeries).map(([id,s])=>`<button data-story-action="series" data-series="${id}" aria-pressed="${Number(id)===state.series}"><span>${s.chapter}</span><strong>${esc(seriesNames[id])}</strong><small>${esc(s.label)}</small>${icon('arrow',16)}</button>`).join('')}</div>
      <article class="story-hero"><div class="story-hero-copy"><div class="eyebrow">ARQUIVO DE EPISÓDIOS / CAPÍTULO ${cfg.chapter}</div><h2>${esc(cfg.title).replace('\n','<br>')}</h2><p>${esc(cfg.copy)}</p><div class="story-hero-tags"><span>${fmt(all.length)} episódios catalogados</span><span>${fmt(arcs.length)} arcos</span></div></div><span class="story-stamp" aria-hidden="true">${cfg.stamp}</span>${episodeArt(state.series)}<div class="story-composition"><span class="story-kicker">A COMPOSIÇÃO DA SÉRIE</span><div class="story-composition-bar">${counts.map(k=>`<span style="flex:${k.count};--kind:${kindColors[k.kind]}" title="${esc(k.kind)}: ${fmt(k.count)} episódios"></span>`).join('')}</div>${counts.map(k=>`<button data-story-action="kind" data-kind="${esc(k.kind)}" aria-pressed="${state.episodeKind===k.kind}" style="--kind:${kindColors[k.kind]}"><i></i><span>${esc(k.kind)}</span><strong>${fmt(k.count)}</strong><small>${percent(all.length?k.count/all.length:0)}</small></button>`).join('')}<p>Classificação comunitária · SkipTheFiller</p></div></article>
      <div class="story-body"><aside class="story-arcs"><div class="story-section-title"><h3>Os arcos</h3><span>${fmt(arcs.length)}</span></div><p class="story-helper">Escolha um trecho da jornada</p><div class="story-arc-list"><button class="story-arc-all" data-story-action="arc" data-arc="" aria-pressed="${!state.arc}">${icon('episodes',17)}<span>Toda a história<small>EP. ${episodeCode(all[0]?.number||0)} — ${episodeCode(all.at(-1)?.number||0)}</small></span><b>${fmt(all.length)}</b></button>${arcs.map((a,i)=>{const n=all.filter(e=>e.arc===a.id).length;return `<button data-story-action="arc" data-arc="${esc(a.id)}" aria-pressed="${state.arc===a.id}"><span class="story-arc-index">${String(i+1).padStart(2,'0')}</span><span>${esc(a.name)}<small>EP. ${episodeCode(a.first)} — ${episodeCode(a.last)}</small></span><b>${n}</b></button>`}).join('')}</div><button class="story-source-link" data-story-action="sources">Fontes e classificação ${icon('globe',14)}</button></aside>
      <div class="story-guide"><section class="story-map"><div class="story-section-title"><h3>A jornada em episódios</h3><span>01 — ${episodeCode(all.at(-1)?.number||0)}</span></div><p class="story-helper">Cada marca é um episódio. Selecione para explorar.</p><div class="story-map-cells" role="group" aria-label="Mapa de episódios da série">${all.map(e=>`<button data-story-action="episode" data-episode="${esc(e.id)}" class="story-map-cell" style="--kind:${kindColors[cardKind(e)]||'#697485'}" ${episodeMatches(e)?'':'data-dimmed="true"'} aria-label="Episódio ${e.number}, ${esc(cardKind(e))}" title="EP. ${episodeCode(e.number)} · ${esc(cardKind(e))}"></button>`).join('')}</div><div class="story-map-key">${counts.map(k=>`<span style="--kind:${kindColors[k.kind]}"><i></i>${esc(k.kind)}</span>`).join('')}<span class="story-map-hint">Destaque = filtros atuais</span></div></section>
      <section class="story-results"><div class="story-results-heading"><div><span class="story-kicker">GUIA DE EPISÓDIOS</span><h3>${esc(arcById.get(state.arc)?.name||'Toda a história')}</h3></div><button class="story-reset" data-story-action="reset">Limpar filtros ↺</button></div><div class="story-filters">${search('Título original ou número...',state.episodeQuery,'episode-search')}<select id="story-kind" aria-label="Filtrar classificação"><option value="">Todas as classificações</option>${options(counts,state.episodeKind,k=>k.kind,k=>k.kind)}</select></div><div id="story-results-list"></div></section></div></div></section>`;
    renderEpisodeResults();
  }
  function renderEpisodeResults(){
    const all=episodeRows(),rows=all.filter(episodeMatches);
    state.episodePage=Math.max(0,Math.min(state.episodePage,Math.ceil(rows.length/episodeSize)-1));
    $('#story-results-list').innerHTML=`<div class="story-result-count" role="status">${fmt(rows.length)} ${rows.length===1?'episódio encontrado':'episódios encontrados'} <span>${state.episodeKind?esc(state.episodeKind):'Todas as classificações'}</span></div><div class="story-table-wrap"><table><thead><tr><th scope="col">EP.</th><th scope="col">Título original / arco</th><th scope="col">Classificação</th><th scope="col"><span class="story-sr">Detalhes</span></th></tr></thead><tbody>${rows.slice(state.episodePage*episodeSize,(state.episodePage+1)*episodeSize).map(e=>`<tr data-episode-row="${esc(e.id)}"><td class="story-number">${episodeCode(e.number)}</td><td><button class="story-episode-title" data-story-action="episode" data-episode="${esc(e.id)}">${esc(e.title)}</button><small class="story-episode-arc">${esc(arcById.get(e.arc)?.name||'Arco não informado')}</small></td><td><span class="status-pill" style="--seg:${kindColors[cardKind(e)]||'#697485'}">${esc(cardKind(e))}</span></td><td><button class="story-open" data-story-action="episode" data-episode="${esc(e.id)}" aria-label="Detalhes do episódio ${e.number}">↗</button></td></tr>`).join('')}</tbody></table>${rows.length?'':`<div class="story-empty">${icon('search',28)}<h3>Nenhum episódio por aqui.</h3><p>Experimente outro título, número ou classificação.</p><button class="small-button" data-story-action="reset">Limpar filtros</button></div>`}</div>${pagination('episode',state.episodePage,rows.length,episodeSize)}`;
    root.querySelectorAll('.story-map-cell').forEach(b=>{const e=all.find(e=>e.id===b.dataset.episode);b.toggleAttribute('data-dimmed',!episodeMatches(e))});
    // Keep series composition in sync without recalculating its denominator.
    root.querySelectorAll('.story-composition [data-kind]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.kind===state.episodeKind)));
  }
  let storyModalFocus=null;
  function showEpisode(id){
    const all=episodeRows(),e=all.find(e=>e.id===id);if(!e)return;
    if(!$('.story-detail'))storyModalFocus=document.activeElement;
    state.episodeSelected=id;
    const i=all.indexOf(e),arc=arcById.get(e.arc),kind=cardKind(e);
    showModal(`Episódio ${episodeCode(e.number)}`,`<div class="story-detail"><span class="story-kicker">${esc(seriesNames[e.series])} / EP. ${episodeCode(e.number)}</span><h3>${esc(e.title)}</h3><span class="status-pill" style="--seg:${kindColors[kind]||'#697485'}">${esc(kind)}</span><div class="story-detail-arc"><small>ARCO DA HISTÓRIA</small><strong>${esc(arc?.name||'Não informado')}</strong>${arc?`<span>EP. ${episodeCode(arc.first)} — ${episodeCode(arc.last)}</span><button class="small-button" data-story-action="explore-arc" data-arc="${esc(e.arc)}">Explorar este arco →</button>`:''}</div><p>Título original e classificação preservados da fonte comunitária SkipTheFiller.</p><div class="story-detail-nav"><button data-story-action="episode" data-episode="${esc(all[i-1]?.id||'')}" ${i===0?'disabled':''}>← Anterior</button><span>${e.number} / ${all.length}</span><button data-story-action="episode" data-episode="${esc(all[i+1]?.id||'')}" ${i===all.length-1?'disabled':''}>Próximo →</button></div></div>`);
  }
  function storySources(){showModal('Como ler esta jornada',`<div class="story-source-notes"><p>Os ${fmt(data.episodes.length)} episódios e ${fmt(data.arcs.length)} arcos são um snapshot comunitário de Naruto, Naruto Shippuden e Boruto.</p><h3>Classificação</h3><p>Cânone, misto e filler seguem os rótulos da fonte. Essas categorias são classificações comunitárias, sem validação editorial oficial. A interface não deduz uma categoria pela numeração ou pelo arco.</p><h3>Filtros e proporções</h3><p>Os indicadores do cabeçalho e a composição usam sempre a série completa. A busca, o arco e a classificação filtram a lista e destacam o mapa; o mapa mantém todos os episódios da série. Um número busca o episódio exato. Os detalhes permitem percorrer a série inteira.</p><h3>Títulos e intervalos</h3><p>Títulos e nomes de arcos são preservados no idioma da fonte e podem revelar acontecimentos. Intervalos dos arcos são os publicados na base; as contagens usam as associações reais dos episódios. Datas de exibição não verificadas não são apresentadas.</p><h3>Fonte e licença</h3><p><a href="https://github.com/animecannonhunter-hash/anime-filler-list-data/tree/a7b28ff590b70652843125b77b9a80f334d2c3ca" target="_blank" rel="noopener noreferrer">SkipTheFiller · snapshot do dataset ↗</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener noreferrer">CC BY 4.0 ↗</a>. Seleção das três séries, normalização dos campos e sinalização de inconsistências; valores originais preservados.</p><p>Artes originais de Ultimate Ninja Storm Connections, Bandai Namco Entertainment / CyberConnect2. Fontes e créditos individuais estão registrados no acervo de mídias.</p></div>`)}
  root.addEventListener('click',event=>{
    if(event.target.closest('[data-action="close-modal"]')&&!$('.modal')&&storyModalFocus?.isConnected){storyModalFocus.focus();storyModalFocus=null;}
    const button=event.target.closest('[data-story-action]');if(!button||button.disabled)return;
    const action=button.dataset.storyAction;
    if(action==='episode'){showEpisode(button.dataset.episode);return;}
    if(action==='sources'){storyModalFocus=document.activeElement;storySources();return;}
    if(action==='series'){state.series=Number(button.dataset.series);state.arc='';state.episodeQuery='';state.episodeKind='';state.episodeSelected=null;}
    if(action==='arc'||action==='explore-arc'){state.arc=button.dataset.arc;}
    if(action==='kind'){state.episodeKind=state.episodeKind===button.dataset.kind?'':button.dataset.kind;}
    if(action==='reset'){state.arc='';state.episodeQuery='';state.episodeKind='';}
    state.episodePage=0;
    if(action==='explore-arc')$('#modal-root').innerHTML='';
    renderEpisodes();
    const next=action==='series'?`[data-story-action="series"][data-series="${state.series}"]`:action==='kind'?`[data-story-action="kind"][data-kind="${state.episodeKind||button.dataset.kind}"]`:action==='arc'?`[data-story-action="arc"][data-arc="${state.arc}"]`:'.story-reset';
    $(next)?.focus({preventScroll:true});
    if(action==='arc')$('.story-arc-list [aria-pressed="true"]')?.scrollIntoView({block:'nearest'});
  });
  root.addEventListener('change',event=>{if(event.target.id==='story-kind'){state.episodeKind=event.target.value;state.episodePage=0;renderEpisodeResults()}});
  // Search updates only the guide, retaining focus and the arc scroll position.
  root.addEventListener('input',event=>{if(event.target.id==='episode-search'&&state.page==='episodios'){clearTimeout(searchTimer);state.episodeQuery=event.target.value;state.episodePage=0;renderEpisodeResults()}});
  root.addEventListener('keydown',event=>{
    const modal=$('.modal');if(!modal)return;
    if(event.key==='Escape'&&storyModalFocus?.isConnected){storyModalFocus.focus();storyModalFocus=null;return;}
    if(event.key==='Tab'&&modal.querySelector('.story-detail,.story-source-notes')){
      const controls=[...modal.querySelectorAll('button:not(:disabled),a[href]')].filter(e=>e.getClientRects().length);
      const first=controls[0],last=controls.at(-1);
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===modal)){event.preventDefault();last?.focus()}
      else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===modal)){event.preventDefault();first?.focus()}
    }
  },true);
