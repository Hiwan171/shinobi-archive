# Shinobi Archive — direção visual para o BI

Referência de acabamento: a Pokédex/Arena enviada pelo usuário. O objetivo é uma interface de consulta com identidade Naruto, navegação consistente, cards de personagens e comparação interativa.

## Composição da primeira página

Tela de referência: 1600 × 900. Cabeçalho de 72 px; coluna de seleção de 304 px; espaços entre blocos de 24 px. Fundo carvão #0D1117, superfícies #151D28, borda discreta #293344, destaque laranja #F47A24. Texto principal #F2F5F8; secundário #A8B4C2. Reservar vermelho para recortes ligados à Akatsuki; elementos de chakra ganham cores consistentes.

À esquerda: pesquisa, filtros de vila/clã e grade de retratos. No centro: personagem selecionado, retrato colorido, nome e badges de vila, clã e classificação informada. À direita: natureza de chakra, técnicas, medidas e patente no contexto escolhido. Abaixo: card de mangá oficial, parentesco e estreia por mídia.

Escolher a fase antes de exibir idade, altura, peso e patente. As imagens da AniList não foram classificadas por fase; não usá-las como prova de transformação. Nomes e dados narrativos permanecem no idioma da fonte; os rótulos da interface serão em português.

## Páginas propostas

| Página | Conteúdo disponível | Interação principal |
|---|---|---|
| Arquivo Ninja | Ficha, retrato, card de mangá, natureza, técnicas, família | Selecionar personagem e contexto |
| Clãs e Vilas | 58 clãs, 39 vilas, membros, símbolos das cinco grandes vilas | Filtrar e explorar grupos |
| Biblioteca de Jutsus | Nomes e usuários documentados; observações de mídia | Buscar técnica e ver usuários |
| Comparador | Técnicas compartilhadas, naturezas, medidas na mesma fase | Comparar dois personagens |
| Popularidade | Votos NARUTOP99, oito regiões e top 5 por idade/gênero; favoritos AniList em separado | Comparar recortes do mesmo levantamento |
| Arcos e Episódios | Episódios, arcos, cânone/filler/misto segundo a fonte comunitária | Selecionar série e arco |

## Material visual existente

- `assets/characters/`: retratos coloridos da AniList. São retratos de catálogo, geralmente pequenos; usar nos cards sem prometer resolução de pôster.
- `assets/official_portraits/`: retratos quadrados de mangá do NARUTOP99.
- `assets/official_cards/`: cards de mangá oficiais, com arte e balões de fala em inglês. Não são renders de corpo inteiro com fundo transparente.
- `assets/official_art/`: ilustração oficial com os 20 primeiros, Guy e Kurama; útil como referência/abertura com o crédito correspondente.
- `assets/covers/` e `assets/banners/`: capas e banners das obras encontradas.
- `assets/symbols/`: cinco símbolos oficiais de vilas, em SVG branco.
- `assets/manifest.json`: origem, dimensões, formato, arquivo e hash de cada imagem raster.

Não usar o logotipo NARUTOP99 como se fosse o nome deste BI. Identificar o levantamento como fonte na página de popularidade. Preservar créditos das imagens e do mangá.

## Comparações que a base sustenta

Podemos comparar quantidade e interseção de técnicas documentadas, naturezas de chakra, medidas na mesma fase e popularidade de um mesmo levantamento. Estas contagens não são atributos oficiais de força.

Não há uma tabela validada com ninjutsu/taijutsu/genjutsu/força/velocidade de databooks para todo o elenco. Um radar com esses atributos exigiria uma coleta adicional com edição, página e fase de cada número. Até lá, usar barras, listas e comparação de conjuntos; não inventar estatísticas para imitar o radar da Pokédex.

## Estado desta entrega

Implementação realizada em `powerbi/ShinobiArchive/ShinobiArchive.pbip`: seis páginas nativas, 1600 × 900, navegação lateral, tema escuro com laranja, imagens de personagens, fichas por fase e comparação por técnicas documentadas. Modelo com 54 tabelas, 48 medidas e 40 relacionamentos. O projeto foi carregado, consultado e revisado visualmente no Power BI Desktop. As imagens exibidas usam URLs públicas das fontes; os arquivos locais permanecem disponíveis em `assets/`. Publicação no Power BI Service ainda não foi realizada.
