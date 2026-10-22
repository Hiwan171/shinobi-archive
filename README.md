# Shinobi Archive — Naruto no Power BI

**Interface atual em HTML Content Regular 2.0**, baseada na edição 09, com HTML, CSS, SVG e JavaScript. Seis seções de navegação, incluindo o Exame Shinobi, com efeitos, busca, gráficos, fichas, comparador e dados de Naruto, Shippuden e Boruto em um único visual de tela inteira. Dados fornecidos pelo modelo semântico por DAX. O relatório nativo anterior permanece disponível como referência.

**Abra [ShinobiArchiveHTML.pbip](powerbi/ShinobiArchiveHTML/ShinobiArchiveHTML.pbip) no Power BI Desktop.** [Guia da interface HTML](powerbi/ShinobiArchiveHTML/LEIA-ME.md) · [Pacote histórico da edição 09](https://github.com/Hiwan171/shinobi-archive/releases/download/v9.0.0/ShinobiArchive_HTML_Content.zip) · [Prévia no navegador](powerbi/html-interface/preview.html).

O repositório inclui os fontes, dados, imagens, projetos editáveis e resultados de validação. Os pacotes ZIP completos e backups anteriores estão nos arquivos da [Release v9.0.0](https://github.com/Hiwan171/shinobi-archive/releases/tag/v9.0.0). Caches do Desktop, dependências instaladas, sessões MCP e logs temporários permanecem locais. O projeto HTML usa snapshots incorporados: após clonar, abra o PBIP e atualize o modelo conforme o guia, sem configurar caminhos de CSV ou credenciais de API.

**Arquivo Ninja — edição 06:** personagem inteiro no palco central e lateral com capa, símbolo da vila, perfil ilustrado, marcos clicáveis da história e conexões familiares. O arsenal apresenta categorias, sequências e descrições com créditos; o ranking abre os votos por região. O acervo mantém 105 artes transparentes oficiais para 75 personagens, sprites de jogos para 11 personagens e 15 sequências específicas para 9 deles. A edição atual incorpora oito PNGs principais para reduzir a dependência do site das artes. Permanecem as 23 biografias em português com 79 capítulos e o controle de spoilers.

O [projeto nativo anterior](powerbi/ShinobiArchive/ShinobiArchive.pbip) e seu [guia](powerbi/ShinobiArchive/LEIA-ME.md) continuam disponíveis.

**Mundo Shinobi — edição 07:** atlas vetorial interativo com as cinco grandes vilas, zoom e arraste, seleção das 39 localidades e painel de clãs, equipes e shinobi. A aba Jutsus foi retirada; o catálogo global de técnicas fica dentro do Arquivo Ninja. Mapa de ShounenSuki / Wikimedia Commons, adaptado sob CC BY-SA 4.0, com atribuição e fontes na interface e no pacote.

**Frente a Frente — edição 08:** dois ninjas com artes originais, roda das cinco naturezas e matriz interativa dos 25 pares. Seleção do elemento por lance, busca de ninjas, inversão dos lados, confrontos sugeridos, oito perfis táticos com fontes oficiais, comparação dos arsenais, linhagens e equipes. A leitura sinaliza vantagens entre naturezas em técnicas de nível comparável; não atribui imunidades ou porcentagens de vitória. O acervo cobre toda a trajetória, sem recorte de fase.

**Popularidade — edição 09:** pódio ilustrado, ranking pesquisável dos 488 participantes, oito regiões, análise da participação de votos, comparação entre personagens com escala percentual comum, posições regionais do Top 5 e panorama do volume de votos. Empates e zeros são preservados. O Global contém as regiões, e as diferenças de posição são geográficas, sem inferência de evolução no tempo. Artes de Minato e Sakura adicionadas à reserva local, com bytes originais conferidos.

**Exame Shinobi:** quiz com 64 perguntas editoriais, quatro temas, três dificuldades e três fases. Treino sem tempo e Exame com cronômetro e três vidas; missões de 5, 10 ou 15 questões, dicas 50/50, bônus por sequência e tempo, seis conquistas e revisão das respostas com explicações e referências. Recordes e histórico pertencem à sessão atual. A composição compacta e a tipografia original foram mantidas. Fontes do jogo em `powerbi/html-interface/quiz.*` e `data/editorial/quiz_shinobi.json`; [guia do quiz](powerbi/ShinobiArchiveHTML/LEIA-ME.md).

**Auditoria visual das seis abas:** [relatório completo](powerbi/auditoria-visual/AUDITORIA_VISUAL.md), [galeria local com filtros](powerbi/auditoria-visual/index.html) e 59 capturas, sendo 40 no HTML e 19 no Power BI Desktop. Foram registrados dez achados com prioridades e recomendações; os ajustes ainda não foram aplicados. Para obter o quiz e a aba de episódios atuais, use os arquivos deste repositório; o ZIP da Release v9.0.0 preserva a edição anterior.

## Resultado da coleta

**Linhas da História — aba de episódios repaginada:** abertura ilustrada por série, índice dos 80 arcos, mapa interativo dos 1.013 episódios, composição por classificação, busca por título ou número exato, filtros combinados, paginação e detalhes com navegação entre episódios. Os indicadores e percentuais usam a série inteira; os filtros atualizam a lista e os destaques do mapa. Os títulos originais e as classificações comunitárias foram preservados. A atualização está incorporada ao PBIP e à cópia de entrega. Passaram 168 verificações no navegador, entre 600 e 1600 pixels. A composição também foi conferida no Power BI Desktop durante a auditoria visual, que documenta a necessidade de reduzir a rolagem da aba. Veja o [guia da aba](powerbi/ShinobiArchiveHTML/LEIA-ME.md).

| Material | Quantidade |
|---|---:|
| Personagens na base principal | 1,431 |
| Clãs | 58 |
| Vilas | 39 |
| Equipes | 191 |
| Kekkei genkai | 39 |
| Nomes de jutsus após separar contaminações | 1,393 |
| Relações personagem–jutsu | 2,661 |
| Naturezas de chakra distintas | 24 |
| Relações familiares | 875 |
| Episódios de Naruto / Shippuden / Boruto | 1,013 |
| Arcos segundo a fonte comunitária | 80 |
| Participantes da votação oficial NARUTOP99 | 488 |
| Votos globais oficiais, levantamento 2022/2023 | 4,598,612 |
| Imagens raster baixadas e verificadas | 1,537 |
| Símbolos de vilas em SVG | 5 |
| Tabelas exportadas | 48 |

As imagens incluem 517 retratos coloridos AniList, 488 retratos de mangá oficiais, 488 cards de mangá oficiais, 27 capas, 16 banners e uma ilustração oficial. Há outras 1.412 referências de imagens da base principal; estas não foram baixadas porque amostras da origem retornaram HTTP 403.

## Por onde abrir

1. **[Projeto HTML Content](powerbi/ShinobiArchiveHTML/ShinobiArchiveHTML.pbip)** — interface completa, modelo semântico, 58 tabelas e 49 medidas.
2. **[Naruto_BI.xlsx](data/processed/Naruto_BI.xlsx)** — todas as tabelas de origem, uma por aba.
2. **[Inventário e qualidade](docs/INVENTARIO.md)** — cobertura por campo, fontes, limites e quantidade de linhas por tabela.
3. **[Guia Power BI](powerbi/GUIA_IMPORTACAO.md)** — importação, tipos, relações e regras das medidas.
4. **[Direção visual](docs/DIRECAO_VISUAL.md)** — composição, páginas e uso dos recursos visuais.
5. **[Validação](data/processed/validacao.json)** — verificações efetivamente executadas.

## Arquivos

- `data/raw/`: snapshots originais, com origem, commit quando disponível, horário de coleta e SHA-256.
- `data/editorial/`: biografias, capítulos e metadados das técnicas com referências.
- `data/processed/csv/`: tabelas UTF-8 com BOM, separador ponto e vírgula e decimais com ponto.
- `data/processed/json/`: as mesmas tabelas em JSON.
- `data/processed/naruto.sqlite`: banco SQLite com as mesmas tabelas.
- `data/processed/schema.json`: nomes de campos e tipos de dados.
- `assets/`: retratos, cards, capas, banners, arte oficial e símbolos.
- `assets/manifest.json`: origem, caminho, dimensões e hash das imagens raster.
- `powerbi/ShinobiArchiveHTML/`: projeto PBIP com HTML Content, relatório PBIR e modelo TMDL.
- `assets/game_art/` e `assets/game_sprites/`: artes e folhas originais dos jogos, com manifesto em `data/editorial/midias_jogos.json`.
- `powerbi/html-interface/`: fontes HTML/CSS/JavaScript e prévia local.
- `powerbi/ShinobiArchive/`: projeto anterior com visuais nativos.
- `powerbi/build/`: resultados de validação e arquivos intermediários de construção.
- `scripts/`: coleta, preparação, validação e empacotamento reproduzíveis.

## Fontes

- [Dattebayo](https://github.com/viniciusschuelter/dattebayo-api/tree/a3871a6c931cd1f503af0bc16c80007c3a9ecda9): catálogo comunitário de personagens e relações. Snapshot fixado nesse commit para reprodução.
- [AniList](https://docs.anilist.co/): elenco, retratos, créditos de dublagem e dados das obras. Coleta das três séries e buscas Naruto/Boruto; não é um espelho do catálogo inteiro da AniList.
- [NARUTOP99 oficial](https://narutop99.naruto-official.com/en/): votação histórica, oito regiões além do global, top 5 por idade/gênero e imagens publicadas no site.
- [SkipTheFiller](https://skipthefiller.com), via [dataset aberto](https://github.com/animecannonhunter-hash/anime-filler-list-data/tree/a7b28ff590b70652843125b77b9a80f334d2c3ca): episódios, arcos e papéis comunitários, sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Alterações: seleção das três séries, normalização dos campos e sinalização de inconsistências. Preservados os valores originais.

Os créditos e direitos da arte permanecem com os respectivos autores/titulares. A disponibilidade numa API não transfere os direitos das imagens.

## Cuidados incorporados à base

Campos ausentes ficam nulos. Medidas e patentes mantêm o contexto/fase. Trechos de HTML e catálogos de jogos encontrados em listas de técnicas/ferramentas ficam em quarentena, disponíveis para auditoria. Não foram criadas notas de força, velocidade ou ninjutsu. Data de episódios transcrita da fonte não é tratada como validada. Rankings oficiais de 2023 e favoritos AniList da coleta são levantamentos distintos.

O NARUTOP99 global (`regiao = all`) contém os mesmos votos das oito regiões somadas. Não somar o global às regiões. Nem todos os participantes foram associados automaticamente à base principal; IDs nulos e o método de associação permanecem explícitos.

## Reproduzir a preparação

Requisitos: Python 3, `curl.exe`, Pillow e openpyxl. As versões usadas estão em `scripts/requirements.txt`.

```powershell
python scripts/coletar_fontes.py
python scripts/coletar_anilist.py
python scripts/coletar_episodios.py
python scripts/coletar_narutop99.py
python scripts/baixar_imagens.py
python scripts/preparar_base.py
python scripts/validar_base.py
python scripts/gerar_entrega.py
```

O coletor AniList e o downloader aproveitam arquivos existentes para retomar a coleta. São snapshots; não há atualização automática agendada. A votação NARUTOP99 está concluída e seus números são históricos. O índice de símbolos de vilas já está incluído em `assets/symbols/manifest.json`.

Validação dos dados: contagens e cabeçalhos em CSV/JSON/SQLite/Excel; 8 grupos de verificação, incluindo chaves, continuidade dos episódios, integridade das imagens e conferência de votos globais contra regiões. Validação do relatório: abertura e carga no Desktop, execução das 48 medidas DAX, consultas de seleção de personagem e fase, conferência de episódios e arcos por série e inspeção das seis páginas renderizadas. O validador PBIR não encontrou erros; registrou um aviso de indisponibilidade do esquema público 2.14 usado pelo Desktop instalado.

Validação da versão HTML: saída DAX dos 24 conjuntos de dados comparada com os snapshots e código integral da medida conferido contra os fontes. Passaram 286 verificações: 21 dos fluxos gerais, 19 do Arquivo Ninja, 31 das mídias, 22 da composição, 21 do dossiê visual, 30 do Mundo Shinobi, 79 do Frente a Frente e 63 da Popularidade. Prints finais revisados no navegador; capturas nativas parciais mostraram a edição nova, mas a captura nativa final ficou pendente por `HOST_UNAVAILABLE`. O código real foi conferido novamente por DAX após a última aplicação nativa. A definição PBIR passou sem erros ou avisos. Detalhes em `powerbi/build/html/`.
