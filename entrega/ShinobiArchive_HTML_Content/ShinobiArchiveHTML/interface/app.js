(function () {
  'use strict';
  const root = document.getElementById('shinobi-app');
  if (!root || root.dataset.ready) return;
  root.dataset.ready = 'true';
  const payload = JSON.parse(root.querySelector('#ninja-data').textContent);
  const data = {};
  for (const [key, block] of Object.entries(payload)) {
    if (block && Array.isArray(block.rows)) data[key] = block.rows.map(row => Object.fromEntries(block.fields.map((field, i) => [field, row[i]])));
  }
  const $ = selector => root.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[c]));
  const fmt = value => Number(value || 0).toLocaleString('pt-BR');
  const percent = value => (value * 100).toLocaleString('pt-BR', {maximumFractionDigits: 1}) + '%';
  const fold = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const url = value => /^(https:\/\/|data:image\/)/i.test(value || '') ? esc(value) : '';
  const asNumber = value => Number(value) || 0;
  const byId = new Map(data.characters.map(c => [c.id, c]));
  const officialById = new Map(data.official.map(c => [c.id, c]));
  const jutsuById = new Map(data.jutsus.map(j => [j.id, j]));
  const arcById = new Map(data.arcs.map(a => [a.id, a]));
  const techniqueSets = new Map();
  const techniquePeople = new Map();
  data.techniques.forEach(r => {
    if (!techniqueSets.has(r.person)) techniqueSets.set(r.person, new Set());
    techniqueSets.get(r.person).add(r.technique);
    if (!techniquePeople.has(r.technique)) techniquePeople.set(r.technique, new Set());
    techniquePeople.get(r.technique).add(r.person);
  });
  const natureByPerson = new Map();
  data.chakra.forEach(r => {
    if (!natureByPerson.has(r.person)) natureByPerson.set(r.person, []);
    natureByPerson.get(r.person).push(r.name);
  });
  const icons = {
    archive:'<path d="M5 4h14v16H5zM9 8h6M9 12h6M9 16h3"/><path d="M3 7h2M3 12h2M3 17h2"/>',
    groups:'<path d="M12 3 3 8l9 5 9-5-9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
    jutsu:'<path d="m14 2-3 8H5l5 4-2 8 12-13h-7l1-7z"/>',
    compare:'<path d="m3 5 7 7-7 7M21 5l-7 7 7 7M12 3v3M12 18v3"/>',
    popular:'<path d="M8 3h8v6c0 4-2 5-4 5s-4-1-4-5V3zM8 5H4v2c0 3 2 4 4 4M16 5h4v2c0 3-2 4-4 4M12 14v5M8 21h8M9 19h6"/>',
    episodes:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 8 6 4-6 4V8zM7 4v16"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    leaf:'<path d="M20 3c-6 0-15 1-15 9a6 6 0 0 0 6 6c8 0 9-9 9-15zM3 21l11-11M9 15v-5M9 15h5"/>',
    clan:'<circle cx="12" cy="8" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M3 9h2M19 9h2M12 1v2"/>',
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
    dots:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18z"/>'
  };
  const icon = (name, size=20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.archive}</svg>`;
  const pages = [
    ['arquivo','Arquivo Ninja','Cada shinobi carrega uma história. Encontre a sua.','archive'],
    ['grupos','Mundo Shinobi','Territórios, legados e os laços que conectam o mundo ninja.','globe'],
    ['comparador','Frente a Frente','Cada escolha abre uma resposta. Explore os recursos de cada lado.','compare'],
    ['popularidade','A Voz dos Fãs','O mundo votou. Conheça as escolhas de cada região.','popular'],
    ['episodios','Linhas da História','De um sonho na Vila da Folha a uma nova geração.','episodes']
  ];
  const state = {page:'arquivo', selected:1344, phase:'Part II', query:'', village:'', catalogLimit:60,
    origin:'', groupMode:'clas', jutsuQuery:'', jutsuPage:0, selectedJutsu:null,
    a:1344, b:1307, region:'all', series:20, arc:'', episodeQuery:'', episodePage:0};
  if (!byId.has(state.selected)) state.selected = data.characters[0]?.id;
  if (!byId.has(state.a)) state.a = state.selected;
  if (!byId.has(state.b)) state.b = data.characters[1]?.id ?? state.a;
  const phaseNames = {'Part I':'Naruto clássico','Part II':'Shippuden','Blank Period':'Período em branco','Boruto':'Boruto','Academy':'Academia','Gaiden':'Gaiden'};
  const regionNames = {'all':'Global','japan':'Japão','asia':'Ásia','oceania':'Oceania','north-america':'América do Norte','latin-america':'América Latina','europe':'Europa','middle-east':'Oriente Médio','africa':'África'};
  const seriesNames = {20:'Naruto',1735:'Naruto Shippuden',97938:'Boruto'};
  const classification = {'Manga Canon':'Cânone','Filler':'Filler','Mixed Canon/Filler':'Misto','Anime Canon':'Cânone do anime','Canon':'Cânone','Mixed':'Misto','manga_canon':'Cânone','anime_canon':'Cânone do anime','mixed_canon_filler':'Misto','filler':'Filler'};
  const chakraNames = {'Fire Release':'Fogo','Wind Release':'Vento','Lightning Release':'Relâmpago','Earth Release':'Terra','Water Release':'Água','Wood Release':'Madeira','Yin Release':'Yin','Yang Release':'Yang','Yin–Yang Release':'Yin–Yang','Lava Release':'Lava','Magnet Release':'Magnetismo','Boil Release':'Vapor','Ice Release':'Gelo','Storm Release':'Tempestade','Dust Release':'Poeira','Scorch Release':'Calor','Explosion Release':'Explosão'};
  const chakraColors = {'Fogo':'#ff825c','Vento':'#85d6ba','Relâmpago':'#c8a4f6','Terra':'#c7a279','Água':'#79b4ff','Madeira':'#8cb76e','Yin':'#b6a2dc','Yang':'#e6cb87','Vapor':'#b8dbdf','Lava':'#f28a64'};
  const kindColors = {'Cânone':'#66d2aa','Filler':'#ff9b68','Misto':'#a69aff','Cânone do anime':'#79adff','Não classificado':'#697485'};
  const nameForChakra = name => {const cleaned=name.replace(/\s*\(.*$/,'').trim();return (chakraNames[cleaned] || cleaned.replace(/ Release$/, ''))+(/Anime only/i.test(name)?' · anime':'');};
  const cardKind = e => e.kind || classification[e.classification] || 'Não classificado';
  const kinship = value => ({godfather:'Padrinho',godmother:'Madrinha',son:'Filho',daughter:'Filha',father:'Pai',mother:'Mãe',brother:'Irmão',sister:'Irmã',wife:'Esposa',husband:'Marido','adoptive son':'Filho adotivo','adoptive daughter':'Filha adotiva',grandfather:'Avô',grandmother:'Avó',grandson:'Neto',granddaughter:'Neta',uncle:'Tio',aunt:'Tia',cousin:'Primo(a)',clone:'Clone'}[value?.trim().toLowerCase()] || value || 'Vínculo');
  const validJutsu = j => !/wiki has an article|main article:|^see also/i.test(j.name || '');
  const techniquesFor = id => new Set([...(techniqueSets.get(id) || [])].filter(t => validJutsu(jutsuById.get(t) || {})));
  const portrait = c => url(c?.portrait || c?.image || '');
  const picture = (c, cls='', lazy=true) => portrait(c) ? `<img class="${cls}" src="${portrait(c)}" alt="${esc(c?.name || 'Personagem')}" ${lazy?'loading="lazy"':''} referrerpolicy="no-referrer" onerror="this.style.display='none';this.parentElement.classList.add('image-unavailable')">` : `<div class="no-portrait" aria-label="Retrato indisponível">忍</div>`;
  const search = (placeholder,value,id) => `<label class="search">${icon('search',16)}<input id="${id}" placeholder="${esc(placeholder)}" value="${esc(value)}" autocomplete="off" aria-label="${esc(placeholder)}"></label>`;
  const options = (rows, selected, label, value) => rows.map(row => `<option value="${esc(value(row))}" ${String(value(row))===String(selected)?'selected':''}>${esc(label(row))}</option>`).join('');
  const header = stats => $('#header-stats').innerHTML = stats.map(([n,l]) => `<div class="header-stat"><strong>${esc(n)}</strong><span>${esc(l)}</span></div>`).join('');
  const panelHead = (title,right='') => `<div class="panel-head"><h3 class="panel-title">${title}</h3>${right}</div>`;
  const chakra = id => [...new Set((natureByPerson.get(id) || []).map(nameForChakra))].map(name => `<span class="chakra" style="--chakra:${chakraColors[name] || '#9ca7b8'}"><i></i>${esc(name)}</span>`).join('') || '<span class="micro">Sem informação na fonte</span>';
  const personChip = id => {const c=byId.get(id);return c?`<button class="person-chip" data-action="person" data-id="${id}">${picture(c,'small-portrait')}<span>${esc(c.name)}</span></button>`:'';};
  const bars = (rows,blue=false,action='') => {
    const max = Math.max(1,...rows.map(r => r.value));
    return rows.map((r,i) => `<div class="bar-row">${action?`<button class="bar-button" data-action="${action}" data-id="${esc(r.id)}">`:''}<div class="bar-label"><span title="${esc(r.name)}">${esc(r.name)}</span><strong>${fmt(r.value)}</strong></div><div class="bar-track"><div class="bar-fill ${blue?'blue':''}" style="width:${Math.max(r.value/max*100,r.value?0.5:0)}%;animation-delay:${Math.min(i,10)*25}ms"></div></div>${action?'</button>':''}</div>`).join('');
  };
  function render() {
    const definition = pages.find(p => p[0]===state.page);
    $('#navigation').innerHTML = pages.map(([key,title,,glyph]) => `<button class="nav-item ${state.page===key?'active':''}" data-action="nav" data-page="${key}" ${state.page===key?'aria-current="page"':''}>${icon(glyph,23)}<span>${esc(key==='popularidade'?'Popularidade':key==='episodios'?'Episódios':key==='jutsus'?'Jutsus':title)}</span></button>`).join('');
    $('#breadcrumb').textContent = 'ACERVO SHINOBI / ' + String(pages.indexOf(definition)+1).padStart(2,'0');
    $('#page-title').innerHTML = esc(definition[1].toUpperCase())+'<span>.</span>';
    $('#page-subtitle').textContent = definition[2];
    ({arquivo:renderArchive,grupos:renderWorld,comparador:renderDuel,popularidade:renderFans,episodios:renderEpisodes})[state.page]();
    $('#screen').style.animation='none'; void $('#screen').offsetWidth; $('#screen').style.animation='';
  }
  function renderArchiveLegacy() {
    header([[fmt(data.characters.length),'Personagens'],[fmt(data.clans.length),'Clãs'],[fmt(data.villages.length),'Vilas']]);
    const villages = [...new Set(data.characters.map(c=>c.village).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    $('#screen').innerHTML = `<section class="archive-layout"><aside class="catalog panel">${panelHead('O CATÁLOGO','<span class="count-badge" id="catalog-count"></span>')}<div class="catalog-tools">${search('Encontre um shinobi...',state.query,'character-search')}<select id="catalog-village" aria-label="Filtrar personagens por vila"><option value="">Todas as vilas</option>${options(villages,state.village,x=>x,x=>x)}</select></div><div id="catalog-grid" class="catalog-grid"></div><div class="catalog-foot"><span id="catalog-foot-label"></span><button class="small-button" data-action="more-characters">Ver mais ↓</button></div></aside><div id="dossier" class="dossier"></div></section>`;
    renderCatalog(); renderDossier();
  }
  function renderCatalog() {
    const chars = data.characters.filter(c => (!state.village || c.village===state.village) && (!state.query || fold([c.name,c.clan,c.village].join(' ')).includes(fold(state.query)))).sort((a,b)=>(a.rank||99999)-(b.rank||99999) || a.name.localeCompare(b.name));
    $('#catalog-count').textContent = fmt(chars.length);
    $('#catalog-grid').innerHTML = chars.slice(0,state.catalogLimit).map(c => `<button class="ninja-tile ${c.id===state.selected?'selected':''}" data-action="pick" data-id="${c.id}" aria-pressed="${c.id===state.selected}" title="${esc(c.name)}"><div class="tile-picture">${c.rank?`<span class="tile-rank">#${String(c.rank).padStart(2,'0')}</span>`:''}${c.id===state.selected?'<span class="tile-check">✓</span>':''}${picture(c)}</div><div class="tile-info"><strong>${esc(c.name)}</strong><small>${esc(c.village || 'Origem não informada')}</small></div></button>`).join('') || '<div class="empty">Nenhum shinobi encontrado.<br>Experimente outro nome.</div>';
    $('#catalog-foot-label').textContent = `${fmt(Math.min(state.catalogLimit,chars.length))} de ${fmt(chars.length)}`;
    const more = root.querySelector('[data-action="more-characters"]'); more.disabled = state.catalogLimit>=chars.length;
  }
  function phaseValue(id,attribute) {
    return [...new Set(data.physical.filter(p=>p.person===id && p.phase===state.phase && p.attribute===attribute).map(p=>p.value))].join(' · ') || '—';
  }
  function renderDossierLegacy() {
    const c=byId.get(state.selected); if (!c) return;
    const families=data.family.filter(f=>f.person===c.id);
    const phaseOptions=[...new Set(data.physical.filter(p=>p.person===c.id).map(p=>p.phase))];
    if (!phaseOptions.includes(state.phase)) phaseOptions.unshift(state.phase);
    const grade=[...new Set(data.grades.filter(p=>p.person===c.id && p.phase===state.phase).map(p=>p.grade))].join(' · ');
    const classes=(c.classification||'').split('|').map(s=>s.trim()).filter(Boolean);
    $('#dossier').innerHTML = `<article class="hero"><div class="hero-portrait"><div class="hero-orbit"></div>${picture(c,'',false)}<span class="portrait-label">SHINOBI FILE / ${String(c.id).padStart(4,'0')}</span></div><div class="hero-copy"><div class="hero-stamp">忍</div><div class="eyebrow"><span class="live-dot"></span> DOSSIÊ DO PERSONAGEM</div><h2>${esc(c.name)}</h2><div class="hero-jp">${c.id===1344?'うずまきナルト':c.id===1307?'うちはサスケ':'忍 の 記 録'}</div><div class="chips">${classes.slice(0,3).map(s=>`<span class="chip">${esc(s.replace('Sensor Type','Sensor'))}</span>`).join('')}${!classes.length?'<span class="chip blue">Universo Naruto</span>':''}</div><div class="hero-rule"></div><div class="hero-facts"><div><span class="fact-label">Clã</span><span class="fact-value">${esc(c.clan || 'Não informado')}</span></div><div><span class="fact-label">Vila / afiliação</span><span class="fact-value">${esc(c.village || 'Não informado')}</span></div><div><span class="fact-label">Aniversário</span><span class="fact-value">${esc(translateBirthday(c.birthday))}</span></div><div><span class="fact-label">Tipo sanguíneo</span><span class="fact-value">${esc(c.blood || 'Não informado')}</span></div></div></div></article><div class="metric-strip"><div class="metric highlight"><div class="metric-top">${icon('jutsu',12)} TÉCNICAS</div><strong>${fmt(techniquesFor(c.id).size)}</strong><small>documentadas no catálogo</small></div><div class="metric"><div class="metric-top">${icon('leaf',12)} CHAKRA</div><strong>${fmt(new Set(natureByPerson.get(c.id)||[]).size)}</strong><small>naturezas registradas</small></div><div class="metric"><div class="metric-top">${icon('popular',12)} NARUTOP99</div><strong>${c.votes?fmt(c.votes):'—'}</strong><small>${c.rank?'#'+c.rank+' na votação global':'Sem associação na votação'}</small></div></div><div class="details-grid"><article class="panel">${panelHead('DADOS DO SHINOBI',`<select id="phase-select" class="phase-select" aria-label="Fase do personagem">${options(phaseOptions,state.phase,p=>phaseNames[p]||p,p=>p)}</select>`)}<div class="detail-body"><div class="physical-grid"><div><strong>${esc(phaseValue(c.id,'idade'))}</strong><span>Idade</span></div><div><strong>${esc(phaseValue(c.id,'altura'))}</strong><span>Altura</span></div><div><strong>${esc(phaseValue(c.id,'peso'))}</strong><span>Peso</span></div></div><div class="detail-separator"></div><div class="chakra-list">${chakra(c.id)}</div><div class="micro" style="margin-top:12px;font-size:8px">Patente: ${esc(grade || 'não informada nesta fase')}</div></div></article><article class="panel">${panelHead('LAÇOS DE FAMÍLIA',`<span class="micro">${families.length} vínculos</span>`)}<div class="detail-body family-list">${families.map(f=>`<div class="family-row"><span class="kinship">${esc(kinship(f.kinship))}</span>${f.related && byId.has(f.related)?`<button data-action="person" data-id="${f.related}">${esc(f.name)} ↗</button>`:`<span>${esc(f.name)}</span>`}</div>`).join('') || '<div class="micro">Sem vínculos registrados na fonte.</div>'}</div></article></div>`;
  }
  function translateBirthday(value) {
    if (!value) return 'Não informado';
    const months=['January','February','March','April','May','June','July','August','September','October','November','December'];
    const names=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    const hit=value.match(new RegExp('^('+months.join('|')+') (\\d+)$'));
    return hit?hit[2]+' de '+names[months.indexOf(hit[1])]:value;
  }
  function renderGroups() {
    header([[fmt(data.clans.length),'Clãs'],[fmt(data.villages.length),'Vilas'],[fmt(data.teams.length),'Equipes']]);
    const originChoices=[...new Set(data.characters.map(c=>c.village).filter(Boolean))].sort();
    const allowed=new Set(data.characters.filter(c=>!state.origin||c.village===state.origin).map(c=>c.id));
    const counts=(groups,links) => {
      const buckets=new Map();
      groups.forEach(g=>{const key=fold(g.name).trim();if(!buckets.has(key))buckets.set(key,{id:g.id,name:g.name,ids:new Set()});buckets.get(key).ids.add(g.id);});
      return [...buckets.values()].map(g=>({...g,value:new Set(links.filter(r=>g.ids.has(r.group)&&allowed.has(r.person)).map(r=>r.person)).size})).filter(r=>r.value).sort((a,b)=>b.value-a.value||a.name.localeCompare(b.name));
    };
    const clanRows=counts(data.clans,data.clanLinks), villageRows=counts(data.villages,data.villageLinks);
    $('#screen').innerHTML=`<section class="standard-layout"><div class="toolbar"><select id="group-origin" aria-label="Filtrar origem"><option value="">Todas as origens</option>${options(originChoices,state.origin,x=>x,x=>x)}</select><span class="micro">Um shinobi pode pertencer a mais de um grupo.</span><span class="spacer"></span><span class="micro">Selecione uma barra para explorar os membros ↗</span></div><div class="two-panels"><article class="panel">${panelHead('OS CLÃS',`<span class="count-badge">${clanRows.length} grupos</span>`)}<div class="bars">${bars(clanRows,false,'clan-members')}</div><div class="panel-note">Personagens com vínculo de clã documentado.</div></article><article class="panel">${panelHead('AS VILAS',`<span class="count-badge">${villageRows.length} grupos</span>`)}<div class="bars">${bars(villageRows,true,'village-members')}</div><div class="panel-note">Afiliações registradas; não indicam residência atual.</div></article></div></section>`;
  }
  function renderJutsus() {
    const clean=data.jutsus.filter(validJutsu);
    const rows=clean.filter(j=>!state.jutsuQuery||fold(j.name).includes(fold(state.jutsuQuery))).map(j=>({...j,users:techniquePeople.get(j.id)?.size||0})).sort((a,b)=>b.users-a.users||a.name.localeCompare(b.name));
    const size=35; state.jutsuPage=Math.min(state.jutsuPage,Math.max(0,Math.ceil(rows.length/size)-1));
    const selected=jutsuById.get(state.selectedJutsu);
    const natureRows=[...new Set(data.chakra.map(c=>nameForChakra(c.name)))].map(name=>({name,value:new Set(data.chakra.filter(c=>nameForChakra(c.name)===name).map(c=>c.person)).size})).sort((a,b)=>b.value-a.value);
    const library=`<section class="standard-layout"><div class="toolbar">${search('Busque uma técnica...',state.jutsuQuery,'jutsu-search')}<span class="micro">${fmt(rows.length)} resultados</span><span class="spacer"></span><span class="micro">Contagens do catálogo · sem notas de poder</span></div><div class="jutsu-layout"><article class="panel">${panelHead('AS TÉCNICAS',`<span class="micro">Clique para ver os usuários ↗</span>`)}<div class="table-wrap"><table><thead><tr><th>Técnica</th><th class="num">Usuários</th></tr></thead><tbody>${rows.slice(state.jutsuPage*size,(state.jutsuPage+1)*size).map(j=>`<tr><td><button class="tech-button" data-action="jutsu" data-id="${esc(j.id)}">${esc(j.name)}</button></td><td class="num">${fmt(j.users)}</td></tr>`).join('')}</tbody></table>${rows.length?'':'<div class="empty">Nenhuma técnica encontrada.</div>'}</div>${pagination('jutsu',state.jutsuPage,rows.length,size)}</article><article class="panel">${selected?`<div class="tech-detail">${panelHead('TÉCNICA SELECIONADA','<button class="small-button" data-action="clear-jutsu">Voltar ×</button>')}<h3>${esc(selected.name)}</h3><p class="micro" style="padding:0 22px">${fmt(techniquePeople.get(selected.id)?.size)} usuários documentados</p><div class="people-chips">${[...(techniquePeople.get(selected.id)||[])].map(personChip).join('')}</div></div>`:`${panelHead('NATUREZAS DE CHAKRA')}<div class="bars">${bars(natureRows,true)}</div><div class="panel-note">Uma pessoa pode ter várias naturezas. Rótulos editoriais encontrados na origem foram omitidos da lista de técnicas.</div>`}</article></div></section>`;
    showModal('Catálogo de técnicas',library);
  }
  function pagination(type,page,total,size) {
    return `<div class="pagination"><span>${total?fmt(page*size+1):0}–${fmt(Math.min((page+1)*size,total))} de ${fmt(total)}</span><div><button data-action="paginate" data-type="${type}" data-dir="-1" ${page===0?'disabled':''} aria-label="Página anterior">←</button><button data-action="paginate" data-type="${type}" data-dir="1" ${(page+1)*size>=total?'disabled':''} aria-label="Próxima página">→</button></div></div>`;
  }
  function shortName(name) {return (name||'Não identificado').replace(/\s*\(Fourth Hokage\)\s*/i,'').trim();}
  function officialPicture(c,lazy=true,cls='') {
    const linked=byId.get(c?.person), image=portrait(linked) || (c?.id?'https://narutop99.naruto-official.com/blobs/char/thumbnail/'+c.id+'.png':'');
    return image?`<img class="${cls}" src="${url(image)}" alt="${esc(c?.name||'Personagem')}" ${lazy?'loading="lazy"':''} referrerpolicy="no-referrer" onerror="this.style.visibility='hidden'">`:'<div class="small-portrait"></div>';
  }
  function renderEpisodes() {
    const seriesEpisodes=data.episodes.filter(e=>e.series===state.series);
    const seriesArcs=data.arcs.filter(a=>a.series===state.series).sort((a,b)=>a.first-b.first);
    let episodes=seriesEpisodes.filter(e=>(!state.arc||e.arc===state.arc)&&(!state.episodeQuery||fold(e.title+' '+e.number).includes(fold(state.episodeQuery)))).sort((a,b)=>a.number-b.number);
    const filler=episodes.filter(e=>cardKind(e)==='Filler').length;
    const kinds=[...new Set(episodes.map(cardKind))].map(kind=>({kind,count:episodes.filter(e=>cardKind(e)===kind).length}));
    const arcCount=new Set(episodes.map(e=>e.arc)).size;
    header([[fmt(episodes.length),'Episódios'],[fmt(arcCount),'Arcos'],[percent(episodes.length?filler/episodes.length:0),'Filler no recorte']]);
    const size=35; state.episodePage=Math.min(state.episodePage,Math.max(0,Math.ceil(episodes.length/size)-1));
    $('#screen').innerHTML=`<section class="episodes-layout"><div class="toolbar" style="margin-bottom:0"><select id="series-select" aria-label="Selecionar série">${options(Object.entries(seriesNames),state.series,r=>r[1],r=>r[0])}</select><select id="arc-select" aria-label="Selecionar arco"><option value="">Todos os arcos</option>${options(seriesArcs,state.arc,a=>a.name,a=>a.id)}</select><span class="spacer"></span>${search('Título ou episódio...',state.episodeQuery,'episode-search')}</div><div class="episodes-top"><article class="series-card panel"><div><div class="eyebrow">UMA JORNADA EM ${fmt(seriesEpisodes.length)} EPISÓDIOS</div><h2>${esc(seriesNames[state.series])}</h2></div><div><p>${state.series===20?'Um garoto. Um sonho. O começo de tudo.':state.series===1735?'O caminho ninja continua. Laços colocados à prova.':'O legado segue com uma nova geração.'}</p><span class="micro">${fmt(seriesArcs.length)} arcos documentados</span></div></article><article class="panel episode-composition"><h3 class="panel-title">A COMPOSIÇÃO DA HISTÓRIA</h3><div class="composition-track">${kinds.map(k=>`<span style="--seg:${kindColors[k.kind]||'#697485'};width:${episodes.length?k.count/episodes.length*100:0}%" title="${esc(k.kind)}: ${fmt(k.count)} episódios"></span>`).join('')}</div><div class="composition-legend">${kinds.map(k=>`<span class="legend-entry" style="--seg:${kindColors[k.kind]||'#697485'}"><i></i>${esc(k.kind)}<strong>${fmt(k.count)}</strong></span>`).join('')}</div></article></div><article class="panel episode-table">${panelHead('GUIA DE EPISÓDIOS',`<span class="micro">Classificação comunitária</span>`)}<div class="table-wrap"><table><thead><tr><th>EP.</th><th>Título original</th><th>Arco</th><th>Classificação</th></tr></thead><tbody>${episodes.slice(state.episodePage*size,(state.episodePage+1)*size).map(e=>`<tr><td class="num" style="text-align:left;color:var(--muted)">${String(e.number).padStart(3,'0')}</td><td>${esc(e.title)}</td><td class="arc-label">${esc(arcById.get(e.arc)?.name||'—')}</td><td><span class="status-pill" style="--seg:${kindColors[cardKind(e)]||'#697485'}">${esc(cardKind(e))}</span></td></tr>`).join('')}</tbody></table>${episodes.length?'':'<div class="empty">Nenhum episódio encontrado neste recorte.</div>'}</div>${pagination('episode',state.episodePage,episodes.length,size)}</article></section>`;
  }
  function showModal(title,content) {
    $('#modal-root').innerHTML=`<div class="modal-backdrop" data-action="close-modal"><section class="modal" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1"><button class="modal-close" data-action="close-modal" aria-label="Fechar">×</button><div class="eyebrow">SHINOBI ARCHIVE / EXPLORAR</div><h2>${esc(title)}</h2>${content}</section></div>`;
    $('.modal').focus();
  }
  function showSources() {
    showModal('Um arquivo. Muitas fontes.',`<p>Este universo foi organizado a partir de snapshots coletados em 21 de outubro de 2026.</p><h3>As fontes</h3><ul><li>Dattebayo: personagens, técnicas, clãs, vilas e características.</li><li>AniList: retratos e metadados das obras.</li><li>NARUTO Official: referências para 23 biografias editoriais em português, organizadas em 79 capítulos.</li><li>NARUTOP99: votação oficial de 2022/2023 e imagens de mangá.</li><li>SkipTheFiller: episódios, arcos e classificações comunitárias, sob CC BY 4.0. Campos normalizados; títulos originais preservados.</li></ul><h3>Como ler os dados</h3><p>Uma contagem de técnicas ou de naturezas de chakra expressa a cobertura da base, não força ou nível de poder. Dados ausentes são apresentados como “—” ou “não informado”. Rótulos editoriais identificados na origem não entram no catálogo de técnicas exibido.</p><p>O ranking global já contém os votos das regiões; o painel exibe um único recorte por vez. O resultado é histórico, e não uma votação em andamento.</p><h3>Biografias e demonstrações</h3><p>As trajetórias têm referências oficiais e controle de desfechos. Para personagens ainda sem curadoria narrativa, o dossiê mostra o perfil factual disponível. As demonstrações usam quadros originais de jogos de Nintendo DS, com personagem e efeitos montados na interface. Cada sequência tem fonte e créditos. Sem sequência específica, a pose do personagem é sinalizada e a reprodução fica desativada. As artes transparentes vêm do site oficial de Ultimate Ninja Storm Connections.</p><h3>Sobre esta interface</h3><p>Todos os painéis, controles e gráficos desta tela são renderizados por HTML Content Regular 2.0. A navegação e as seleções internas operam nesta interface. Os dados são fornecidos pelo modelo semântico do Power BI. Os direitos da arte permanecem com seus respectivos titulares.</p>`);
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('[data-action]'); if (!target || target.disabled) return;
    event.stopPropagation();
    const action=target.dataset.action;
    if (action==='close-modal') {if (target.classList.contains('modal-backdrop') && event.target!==target) return;$('#modal-root').innerHTML='';return;}
    if (action==='nav') {state.page=target.dataset.page;render();}
    else if (action==='pick') {state.selected=asNumber(target.dataset.id);renderCatalog();renderDossier();}
    else if (action==='person') {state.selected=asNumber(target.dataset.id);state.page='arquivo';state.query=byId.get(state.selected)?.name||'';state.village='';state.catalogLimit=60;$('#modal-root').innerHTML='';render();}
    else if (action==='more-characters') {const top=$('#catalog-grid').scrollTop;state.catalogLimit+=60;renderCatalog();$('#catalog-grid').scrollTop=top;}
    else if (action==='jutsu') {state.selectedJutsu=target.dataset.id;renderJutsus();}
    else if (action==='clear-jutsu') {state.selectedJutsu=null;renderJutsus();}
    else if (action==='sources') showSources();
    else if (action==='paginate') {state[target.dataset.type==='jutsu'?'jutsuPage':'episodePage']+=asNumber(target.dataset.dir);target.dataset.type==='jutsu'?renderJutsus():renderEpisodes();}
    else if (action==='clan-members'||action==='village-members') {
      const clans=action==='clan-members', groups=clans?data.clans:data.villages, links=clans?data.clanLinks:data.villageLinks;
      const group=groups.find(g=>String(g.id)===target.dataset.id);
      const groupIds=new Set(groups.filter(g=>fold(g.name).trim()===fold(group?.name).trim()).map(g=>g.id));
      const ids=[...new Set(links.filter(r=>groupIds.has(r.group)).map(r=>r.person))].filter(id=>byId.has(id)&&(!state.origin||byId.get(id).village===state.origin));
      showModal(group?.name||'Membros',`<p>${fmt(ids.length)} personagens documentados neste recorte.</p><div class="people-chips" style="padding:18px 0 0">${ids.map(personChip).join('')}</div>`);
    }
  });
  root.addEventListener('change',event=>{
    const id=event.target.id,value=event.target.value;
    if (id==='catalog-village') {state.village=value;state.catalogLimit=60;renderCatalog();}
    else if (id==='phase-select') {state.phase=value;renderDossier();}
    else if (id==='group-origin') {state.origin=value;renderGroups();}
    else if (id==='compare-a'||id==='compare-b') {state[id==='compare-a'?'a':'b']=asNumber(value);state[id==='compare-a'?'duelA':'duelB']=null;state.duelQuery='';state.duelLimit=30;renderDuel();}
    else if (id==='poll-region') {selectFanRegion(value);}
    else if (id==='series-select') {state.series=asNumber(value);state.arc='';state.episodePage=0;renderEpisodes();}
    else if (id==='arc-select') {state.arc=value;state.episodePage=0;renderEpisodes();}
  });
  let searchTimer;
  root.addEventListener('input',event=>{
    const id=event.target.id,value=event.target.value,position=event.target.selectionStart;
    if (id==='character-search') {state.query=value;state.catalogLimit=60;renderCatalog();return;}
    if (id!=='jutsu-search'&&id!=='episode-search') return;
    clearTimeout(searchTimer);searchTimer=setTimeout(()=>{
      if (!root.isConnected) return;
      if(id==='jutsu-search'){state.jutsuQuery=value;state.jutsuPage=0;renderJutsus();}
      else{state.episodeQuery=value;state.episodePage=0;renderEpisodes();}
      const input=$('#'+id);input.focus();input.setSelectionRange(position,position);
    },180);
  });
  root.addEventListener('keydown',event=>{if(event.key==='Escape')$('#modal-root').innerHTML='';});
  /* __ARQUIVO_NINJA_MODULE__ */
  // Somente o próprio documento do visual: não acessa nem altera a página hospedeira.
  window.shinobiArchive = {state, data, render, version:'9.0.0'};
  render();
}());
