# Inventário da coleta Naruto

Coleta preparada em 2026-10-21T11:38:22.875830+00:00. Valores de popularidade são um retrato da coleta.

**1,431 personagens; 48 tabelas; 1537 imagens locais verificadas.**

## Cobertura real dos personagens

| Campo | Personagens | Cobertura |
|---|---:|---:|
| Imagem referenciada | 1345 | 93.99% |
| Retrato local associado | 658 | 45.98% |
| Jutsus listados | 634 | 44.3% |
| Naturezas de chakra | 401 | 28.02% |
| Clã | 237 | 16.56% |
| Altura por fase | 366 | 25.58% |
| Família | 426 | 29.77% |
| Patente | 497 | 34.73% |
| Estreia | 1279 | 89.38% |

## Tabelas exportadas

| Tabela | Linhas |
|---|---:|
| aliases | 201 |
| aparicoes_por_midia | 2773 |
| arcos | 80 |
| arquivos_imagem | 1537 |
| atributos_originais | 24481 |
| caracteristicas | 6444 |
| clas | 58 |
| colecoes_fonte | 86 |
| creditos_dublagem | 3058 |
| distribuicao_notas | 30 |
| distribuicao_status | 15 |
| dubladores | 1490 |
| dublagem_original | 2409 |
| elenco_por_serie | 684 |
| episodios | 1013 |
| equipes | 191 |
| estreias | 2924 |
| familia | 875 |
| ferramentas | 194 |
| generos_por_serie | 82 |
| imagens_referenciadas | 1412 |
| itens_quarentena | 66 |
| jutsus | 1393 |
| kekkei_genkai | 39 |
| links_por_serie | 27 |
| medidas_por_fase | 1233 |
| naturezas | 24 |
| papeis_comunitarios | 64 |
| patentes_por_fase | 534 |
| personagem_clas | 261 |
| personagem_equipes | 633 |
| personagem_ferramenta | 782 |
| personagem_jutsu | 2661 |
| personagem_kekkei_genkai | 163 |
| personagem_natureza | 847 |
| personagem_vilas | 976 |
| personagens | 1431 |
| personagens_anilist | 517 |
| personagens_narutop99 | 488 |
| problemas_qualidade | 140 |
| ranking_demografico | 120 |
| relacoes_entre_obras | 48 |
| series_filmes | 27 |
| simbolos_vilas | 5 |
| tags_por_serie | 88 |
| tracos_especiais | 35 |
| vilas | 39 |
| votacao_narutop99 | 4392 |

## Limites que afetam o BI

- Fontes comunitárias, com cobertura desigual e erros de extração. Ausência de status não significa que o personagem esteja vivo; ausência de espécie não prova que seja humano.
- Os nomes dos jutsus estão disponíveis, mas não há descrições completas, custo de chakra ou escala de força validada. Contagem de técnicas não é medida de poder.
- As coleções Akatsuki/Kara/bijūs da fonte incluem associados e variantes. Não tratar todas as entradas como membros oficiais ou como as nove bestas tradicionais.
- Há nomes repetidos (ex.: Soul Tao); use personagem_id, nunca o nome como chave.
- Dados de idade, altura, peso e patentes pertencem a contextos distintos. Não combinar fases para apresentar uma ficha atual.
- Foram encontrados 11 campos personal e 2 campos rank com estrutura inválida. Estão preservados no bruto e sinalizados, sem inventar valores.
- A coluna data_exibicao_original é uma transcrição não validada. A fonte tem erros cronológicos, inclusive o episódio 220 de Naruto com ano 2005. data_exibicao_validada fica vazia até confirmação por outra fonte.
- Canon/Filler/Mixed e agrupamento em arcos são classificações editoriais da comunidade, não uma declaração oficial do estúdio.
- As imagens originais do Fandom são referências: amostras retornaram HTTP 403. Não houve tentativa de contornar o bloqueio. As imagens efetivamente locais vieram da AniList e do NARUTOP99 oficial.
- Correspondências entre fontes são documentadas por método. Casos ambíguos ficam sem personagem_id e podem ser vistos em personagens_anilist; nenhuma correspondência aproximada por similaridade foi aplicada.
- Não foi verificada a classificação cânone/filler de cada personagem nem o estado atual dos personagens no mangá mais recente.
- O NARUTOP99 é uma votação histórica de 2022/2023, não uma medida atual de popularidade nem de força. A região all contém os mesmos votos das oito regiões somadas: filtre all OU as regiões; nunca some ambos.
- O ranking por idade/gênero contém somente os cinco primeiros de cada recorte. As porcentagens e os votos por recorte não foram inferidos.

## Fontes

- [Dattebayo API — repositório e snapshot](https://github.com/viniciusschuelter/dattebayo-api/tree/a3871a6c931cd1f503af0bc16c80007c3a9ecda9): personagens e relações. Commit, hash e horário em data/raw/manifest.json.
- [AniList API](https://docs.anilist.co/): elenco, retratos, créditos, séries e metadados. Snapshots e hashes em data/raw/anilist/manifest.json.
- [NARUTOP99 oficial](https://narutop99.naruto-official.com/en/): catálogo de 488 participantes, votos globais e em oito regiões, top 5 por idade/gênero e imagens originais do site. Arrays estáticos públicos foram interpretados como JSON sem execução de JavaScript. Arquivos e hashes em data/raw/narutop99/manifest.json.
- [SkipTheFiller](https://skipthefiller.com), via [dataset aberto](https://github.com/animecannonhunter-hash/anime-filler-list-data/tree/a7b28ff590b70652843125b77b9a80f334d2c3ca): episódios, arcos e papéis comunitários. [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Foram filtradas as três séries e normalizados nomes de campos; os valores originais permanecem nos snapshots.

As imagens mantêm os direitos dos respectivos autores/titulares; a licença do código de uma API não concede automaticamente direitos sobre a arte da franquia.

## Material adicional pesquisado

- NarutoDB: domínio respondeu HTML e não foi usado como API funcional.
- Jikan: conexões expiraram; não é uma fonte desta entrega.
- data/raw/naruto_secondary.json: lista adicional de referências de imagens de muhammadpauzi/naruto-api, commit 18b04502ee1e9606e79f6b190b2ced15e8f6849f; não incorporada às tabelas para evitar identidades ambíguas.
- Não foram incorporados PDFs não verificados de databooks nem notas de força criadas por fãs.
