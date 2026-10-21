# Shinobi Archive — HTML Content

Interface completa renderizada pelo **HTML Content Regular 2.0**, de Daniel Marsh-Patrick. Há um visual em tela inteira e cinco seções de navegação dentro dele. Fundos, controles, cartões, gráficos, retratos, transições e sobreposições são HTML, CSS, SVG e JavaScript.

## Abrir e usar

1. Abra `ShinobiArchiveHTML.pbip` no Power BI Desktop atualizado, mantendo as pastas `.Report` e `.SemanticModel` juntas dele. A versão utilizada foi 2.159.883.0.
2. Em uma cópia sem cache, use **Página Inicial → Atualizar**. Os snapshots de dados e o código da interface estão incorporados nas consultas do modelo. Não há caminhos de CSV nem credenciais de API para configurar.
3. Use **Ajustar à página**, no canto inferior direito do Desktop, para enquadrar o painel completo. Em janelas menores, a ficha também permite rolagem interna.
4. Navegue pelos ícones da lateral com clique simples, inclusive no modo de edição do Desktop.
5. Os sprites e as imagens do catálogo usam URLs públicas e precisam de internet. Sete artes principais estão incorporadas como PNGs originais, com fonte e créditos preservados, incluindo os três primeiros do pódio global. Os gráficos e os dados funcionam com os snapshots incorporados.

O pacote oficial do HTML Content Regular está incluído em `ShinobiArchiveHTML.Report/CustomVisuals/`. Essa edição executa o JavaScript da interface. A edição Secure aplica sanitização e não executa esse código; mantenha o visual Regular utilizado no projeto.

## As cinco seções

| Seção | Interações |
|---|---|
| Arquivo Ninja | Dossiê com retrato e avatar, fase, chakra, equipes, vínculos com miniaturas, biografia por capítulos, controle de spoilers e arsenal individual com busca, filtro de prévias e demonstração animada ampliável |
| Mundo Shinobi | Atlas vetorial incorporado com zoom, arraste, cinco grandes vilas, 39 localidades e painel de clãs, equipes e shinobi; os membros abrem seus dossiês |
| Frente a Frente | Dois ninjas, artes originais, seleção da natureza por lance, roda elemental, matriz de respostas, recursos e condições, arsenais cruzados, linhagens, equipes, busca e confrontos sugeridos |
| A Voz dos Fãs | Pódio ilustrado, oito regiões, ranking pesquisável, participação dos votos, comparação entre personagens, posições regionais, mapa do Top 5 e panorama dos votos |
| Linhas da História | Série, arco, busca por título/número, composição por classificação e guia paginado de episódios |

“Fontes e notas”, no rodapé, abre os créditos e as regras de interpretação. A tecla Escape fecha a sobreposição.

## Popularidade — edição 09

O pódio apresenta os três primeiros do recorte com artes originais, posições, votos e participação percentual. O Global e as oito regiões podem ser selecionados pelos botões superiores ou pelo menu. Cada troca nesses controles apresenta o líder do recorte em foco.

O ranking completo permite buscar os 488 participantes, carregar mais resultados e localizar a seleção. Clicar em um nome ou em “Explorar personagem” atualiza a análise individual; o pódio permanece com os líderes do recorte. Buscar não recalcula o denominador dos percentuais nem renumera posições ou empates.

As análises individuais oferecem:

- **Por região:** votos absolutos ou participação dos votos nas oito regiões. O destaque relativo compara a participação regional com a global. Clicar em uma região preserva o personagem em foco e abre aquele recorte.
- **Comparar fãs:** escolha de um segundo participante e duas séries percentuais com uma escala comum entre as oito regiões. A troca dos lados inverte os personagens; a comparação espelho preserva a igualdade.
- **Panorama:** concentração de votos no Top 10, distância de votos entre o primeiro e o segundo, posições regionais do Top 5 e distribuição geográfica do volume de votos. As células permitem selecionar personagem e região.

Os resultados são históricos, da votação oficial de 17 de dezembro de 2022 a 31 de janeiro de 2023. São **votos**, não pessoas únicas. O Global já contém as regiões e não é somado novamente a elas. Participação = votos do personagem divididos pelo total do recorte. As diferenças de posição “vs. Global” são comparações geográficas, não tendências no tempo. Não há série temporal nesta base.

Os participantes sem associação documentada ao catálogo continuam com seus votos e posições oficiais. Apenas o botão de acesso ao dossiê fica desativado. As fontes e as regras estão no ícone de globo ao lado do seletor de região, incluindo o [resultado oficial do NARUTOP99](https://narutop99.naruto-official.com/en/).

## Frente a Frente — edição 08

Selecione dois ninjas pelos menus ou pela busca com retratos. O botão ⇄ inverte os lados. “Confrontos sugeridos” abre quatro pares para explorar. Os personagens usam artes originais quando disponíveis e retratos como alternativa.

Os botões sob cada ninja escolhem a natureza usada **neste lance**. O ciclo é **Fogo → Vento → Relâmpago → Terra → Água → Fogo**: cada natureza supera a seguinte e cede à anterior. A roda acompanha A ou B; clicar em outro elemento abre consulta livre sem conceder esse elemento ao personagem. As setas, os textos e as cores mostram os sentidos das relações.

As quatro análises oferecem:

- **Leitura tática:** recursos e condições de oito perfis editoriais com fontes oficiais — Naruto, Sasuke, Itachi, Deidara, Sasori, Rock Lee, Shikamaru e Gaara. Outros personagens recebem os dados disponíveis e indicação de ausência de curadoria específica. A interação da argila de Deidara com o Relâmpago aparece quando ele é comparado a Sasuke.
- **Mapa de respostas:** matriz dos 25 pares elementais. Somente os pares com naturezas registradas para ambos os ninjas ficam ativos; selecionar uma célula altera o lance.
- **Arsenal cruzado:** técnicas em comum ou presentes apenas no catálogo de um dos lados, com busca, paginação, descrições e acesso às demonstrações disponíveis no Arquivo Ninja.
- **Linhagens & laços:** habilidades herdadas, equipes e naturezas adicionais, preservando os vínculos do modelo.

As relações pressupõem técnicas de nível comparável; não são imunidades do corpo do ninja, porcentagens de vitória nem uma previsão do vencedor. Kekkei genkai, Yin e Yang não recebem multiplicadores. Pares sem relação direta não recebem superioridade inventada. As condições específicas têm fonte própria.

O acervo reúne **toda a trajetória e diferentes mídias, sem recorte de fase**. A natureza escolhida não garante que todas as formas e técnicas estejam simultaneamente disponíveis. “a” preserva a anotação de anime encontrada na origem. A ausência de registro não comprova incapacidade. “Só no catálogo” não prova exclusividade de uma técnica na obra.

Fontes e método ficam no botão “Como interpretar” e nas fichas. O ciclo foi conferido no [NARUTO Official](https://naruto-official.com/en/news/01_2492); usamos apenas as relações elementais publicadas, sem importar as regras próprias do jogo de evento descrito no artigo. As referências narrativas são os capítulos 315–316. A curadoria está em `editorial/confrontos_shinobi.json`.

## Mundo Shinobi — edição 07

O atlas é o centro da composição, com territórios selecionáveis, marcadores, bússola, cores por vila, símbolos documentais e pulso discreto. O painel lateral reúne país, identidade da vila, título da liderança e vínculos reais. As abas Clãs, Equipes e Shinobi têm busca e acesso aos personagens. As 39 localidades podem ser selecionadas pela lista; apenas as cinco grandes vilas têm posição destacada no mapa.

Use + e − para ampliar, arraste para mover e ↺ para restaurar. O mapa também aceita +, −, setas e Home pelo teclado. Os marcadores aceitam Enter e Espaço. Os efeitos respeitam movimento reduzido.

A aba Jutsus saiu do menu. A consulta global permanece no botão **Catálogo de técnicas**, no índice do Arquivo Ninja, além do arsenal individual de cada personagem.

O mapa é uma adaptação de **Naruto World Map**, de **ShounenSuki**, sob [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/), disponível no [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Naruto_World_Map.svg). Cores e inscrições foram adaptadas; contornos preservados. Original, adaptação e atribuição acompanham o pacote em `assets/maps/`. Representa a região conhecida das grandes nações, sem escala de distância; não é um mapa completo do planeta. As contagens mostram cobertura da base, não população ou poder militar.

## Arquivo Ninja — edição 06

A lateral direita tem um dossiê com capa do personagem, símbolo documental da vila, identificação do clã, aniversário, sangue e habilidades registradas. As abas possuem ícones e realce na cor do personagem. A história apresenta marcos clicáveis que abrem o capítulo correspondente na biografia, preservando o controle de desfechos. Os vínculos mostram o personagem conectado às miniaturas dos familiares.

O arsenal ganhou uma apresentação própria, com categoria quando existe curadoria, informações da sequência, moldura do palco e um botão para explorar a descrição completa, o nome original, os usuários e os créditos dos sprites. O indicador NARUTOP99 abre o resultado histórico nas oito regiões, sem somar novamente os valores ao global.

A composição coloca a arte inteira no centro, com nome em destaque, iluminação sutil, círculos em movimento e partículas. A arte responde discretamente ao cursor; os efeitos respeitam a preferência por movimento reduzido. Ao lado ficam as abas Perfil, História e Vínculos. A navegação entre abas também funciona com as setas do teclado.

“Ficha completa” reúne patentes, equipes, linhagens, classificações e estreias. As medidas físicas e a seleção de fase ficam abaixo da arte. As informações foram reorganizadas entre a página e as sobreposições.

A primeira seção reúne o perfil, a história e as técnicas do personagem. Foram escritas 23 biografias editoriais em português, divididas em 79 capítulos com referências do NARUTO Official. O controle “Revelar desfechos” libera os capítulos com spoilers. As demais fichas exibem os registros factuais disponíveis e indicam que a narrativa está em curadoria.

O arsenal exibe uma demonstração ampla e atalhos para até três técnicas. O botão com a contagem de técnicas abre a biblioteca completa, com busca em português e nos nomes originais e filtro “Com prévia”. Selecionar uma técnica recolhe a biblioteca e atualiza a demonstração. Escape fecha a biblioteca e devolve o foco ao botão de abertura. “Sobre esta técnica” mostra a descrição completa, as fontes e a quantidade de usuários. Permanecem Executar/Repetir e a demonstração ampliada.

Há 15 sequências específicas para 9 personagens, montadas com quadros originais de jogos de Nintendo DS. O acervo tem 11 folhas de sprites; as poses também identificam os personagens na ficha. A reprodução monta personagem e efeitos em HTML/SVG, com duração própria de 3,6 segundos: não é uma gravação do jogo. Técnicas sem sequência específica continuam consultáveis, com pose sinalizada e reprodução desativada.

O destaque usa 105 artes transparentes de Ultimate Ninja Storm Connections para 75 personagens. Clique na arte para ampliá-la inteira e consultar a fonte oficial e os créditos. Quando existe uma variante correspondente à fase selecionada, ela é usada; caso contrário, a ficha mantém a arte base. Personagens sem arte promocional associada mantêm o retrato disponível no catálogo.

As folhas e as artes foram preservadas sem redesenho. O recorte de quadros, a remoção da cor reservada de fundo e a composição de camadas ocorrem somente durante a exibição. O manifesto registra fonte, responsável pela folha, dimensões, coordenadas e SHA-256 dos 116 arquivos originais. Eles estão em `assets/game_art/` e `assets/game_sprites/` no ZIP. Sete PNGs foram também incorporados à interface para manter os destaques de Naruto (Shippuden e clássico), Itachi, Sasuke, Orochimaru, Minato e Sakura durante indisponibilidade do site externo. Os bytes foram conferidos contra os originais. As outras artes continuam usando URLs públicas, com retrato alternativo quando disponível. A incorporação foi limitada para controlar o tamanho da interface no Power BI.

“Explorar relações” abre familiares com miniaturas e acesso às fichas, equipes e habilidades especiais. O nome de casada Hinata Uzumaki é associado visualmente ao registro Hinata Hyūga; os dados brutos permanecem preservados. As medidas físicas continuam vinculadas à fase selecionada.

## Dados e funcionamento

O modelo tem 58 tabelas e 49 medidas. A tabela `InterfaceHTML` guarda o código da interface em partes menores que o limite de armazenamento de texto por célula. Os trechos possuem marcadores `#` nas duas extremidades, removidos pela medida após a leitura, para preservar espaços e quebras de linha nas junções. A medida `Indicadores[Interface Naruto HTML]` monta a página e serializa 24 conjuntos de dados das tabelas semânticas no contexto de filtro recebido pelo visual. O navegador não consulta APIs de dados. As tabelas `BiografiasCuradas`, `HistoriaPersonagem` e `TecnicasCuradas` guardam os novos textos e metadados editoriais, com snapshots incorporados. Os JSON editáveis estão em `editorial/` no ZIP e em `data/editorial/` no workspace.

Navegação, busca, comparação e seleções internas são estado da interface HTML. Ao receber uma atualização de dados ou de filtros do Power BI, o visual reconstrói a interface e inicia uma nova sessão. A interação interna fica contida neste visual; uma futura integração de seleção com outros visuais exige a função Context e a arquitetura de linhas do HTML Content.

O código usa JavaScript embutido e recursos do próprio navegador. Não depende de CDN de JavaScript, bibliotecas externas ou acesso à página hospedeira. Os efeitos respeitam a preferência do sistema por movimento reduzido. A interface adapta o espaçamento a larguras e alturas menores.

## Editar o visual

Os arquivos editáveis ficam em `interface/` no pacote de entrega:

- `shell.html`: estrutura principal, menus e pontos de inserção.
- `app.css`: composição, cores, fundos, animações e responsividade.
- `app.js`: navegação, gráficos, controles e apresentação dos dados.
- `arquivo.css` e `arquivo.js`: composição e interações da primeira seção, avatares, biografias, relações e laboratório de técnicas.
- `palco.css` e `palco.js`: composição central, dossiê em abas, ficha completa, biblioteca do arsenal, efeitos e acessibilidade.
- `dossie.css` e `dossie.js`: capa e identidade da lateral, marcos da história, conexões familiares, apresentação das técnicas e detalhe regional da votação.
- `midias.css` e `midias.js`: artes transparentes, recortes e reprodução dos sprites originais, transparência e composição de efeitos.
- `preview.html`: prévia local com os mesmos registros do snapshot, para revisar a aparência no navegador. O relatório usa a medida DAX.

No workspace original, `scripts/construir_html_powerbi.py` gera o projeto a partir desses fontes e do modelo base. `scripts/atualizar_html_desktop.py` prepara as chamadas da extensão Microsoft Power BI Modeling MCP para atualizar a interface no Desktop. Informe a porta da instância em `scripts/atualizar_html_desktop.py --port PORTA`. Para reproduzir o acervo, execute `coletar_midias_jogos.py`, `catalogar_sequencias_jogos.py`, `ler_cores_sprites.cjs` e `verificar_midias_jogos.py`, nessa ordem, antes de compilar a interface. O leitor de cores mede a cor exibida pelo navegador respeitando o perfil do PNG; não altera as imagens.

## Validação

- Edição 09 carregada no modelo local do Desktop com processamento das partições alteradas, aplicação nativa e salvamento.
- Carga das 58 tabelas e execução da medida que entrega o HTML completo.
- Saída DAX analisada como JSON e comparada com os snapshots dos 24 conjuntos de dados. A conferência considera a normalização de caixa e espaços finais feita pelo VertiPaq.
- Código HTML/CSS/JS recuperado da medida conferido integralmente contra o arquivo compilado, incluindo os espaços nas junções dos trechos.
- 286 verificações usando o HTML produzido pela medida DAX real: 21 dos fluxos gerais, 19 da primeira seção, 31 das mídias, 22 da composição, 21 do dossiê visual, 30 do Mundo Shinobi, 79 do Frente a Frente e 63 da Popularidade. Incluem votos das oito regiões, denominadores, empates, zeros, posições oficiais, comparação em escala comum, seleção por região, busca, paginação, demonstração, teclado e responsividade entre 600 e 1600 pixels.
- Integridade dos 116 originais, transparência das 105 artes e limites de 214 referências de quadros nas folhas.
- Inspeção no navegador das artes, das 15 sequências, das sobreposições e das composições menores, usando o HTML real da medida. As demais seções mantêm os fluxos verificados.
- Capturas nativas parciais mostraram a edição 09 no Desktop, com um aviso de alterações externas cobrindo parte do cabeçalho. Após nova aplicação e salvamento, a captura final retornou `HOST_UNAVAILABLE`: a conexão de prévia perdeu a associação com a pasta do projeto. A revisão final no navegador passou; a captura nativa final permanece pendente. Uma consulta DAX somente de leitura, feita após a última aplicação nativa, confirmou novamente o código integral e os 24 conjuntos de dados.

O relatório nativo anterior permanece em `powerbi/ShinobiArchive/` no workspace original.

## Fontes e limites

- [Dattebayo](https://github.com/viniciusschuelter/dattebayo-api): personagens, técnicas, grupos e características.
- [AniList](https://anilist.co/): retratos e metadados.
- [NARUTO Official — Character Columns](https://naruto-official.com/en/news): referências dos capítulos editoriais; links específicos em cada capítulo.
- [NARUTOP99](https://narutop99.naruto-official.com/en/): votação oficial de 2022/2023 e imagens de mangá.
- [SkipTheFiller — dataset](https://github.com/animecannonhunter-hash/anime-filler-list-data), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): episódios, arcos e classificações comunitárias. Campos normalizados; títulos originais preservados.
- [Bandai Namco — Storm Connections](https://naruto-game-sc.bn-ent.net/character/): artes promocionais transparentes; créditos Bandai Namco Entertainment / CyberConnect2.
- [Sprite Database — Shinobi Rumble](https://spritedatabase.net/game/1889) e [Ninja Council 4](https://spritedatabase.net/game/62): folhas originais. Créditos individuais: Neimad, Pakis Pride e Hyperlon; páginas específicas em `editorial/midias_jogos.json`.
- [HTML Content](https://html-content.com/), [código e licença MIT](https://github.com/dm-p/powerbi-visuals-html-content): mecanismo de renderização. [Scripting](https://html-content.com/docs/scripting) e [limites do ambiente Power BI](https://html-content.com/docs/limitations).

Os dados são snapshots. A votação é histórica, e a região global já inclui as oito regiões; o painel exibe um recorte por vez. Técnicas e naturezas representam registros disponíveis, sem notas de força ou poder. Há características e imagens ausentes; “—” não equivale a zero. Um rótulo editorial identificado na origem foi omitido da lista de técnicas, que exibe 1.392 nomes; a tabela bruta mantém os 1.393 registros para auditoria. Nomes equivalentes de clãs são reunidos no Mundo Shinobi, preservando as associações originais no modelo. Indicações “anime” em chakra mantêm a distinção anotada na fonte.

Os direitos das imagens permanecem com os titulares. O relatório permanece local; publicar e incorporar em HTML no Power BI Service é uma etapa posterior.
