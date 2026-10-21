# Shinobi Archive

Projeto editável e nativo do Power BI, criado em 21/10/2026.

## Abrir

1. Mantenha `ShinobiArchive.pbip`, `ShinobiArchive.Report` e `ShinobiArchive.SemanticModel` juntos nesta pasta.
2. Abra `ShinobiArchive.pbip` no Power BI Desktop atualizado. A versão usada na construção foi 2.159.883.0.
3. Se abrir uma cópia sem dados em cache, clique em **Página Inicial → Atualizar**. Os snapshots estão incorporados nas consultas Power Query; não é necessário configurar caminhos de CSV ou credenciais de API.
4. Use **Ctrl + clique** nos botões laterais enquanto estiver no modo de edição do Desktop. No modo de leitura do Service, use clique simples.

Os retratos e cards usam URLs públicas da AniList e do NARUTOP99 e precisam de internet. A base de dados não depende dessas URLs para atualizar.

## Páginas

| Página | Conteúdo |
|---|---|
| Arquivo Ninja | Busca e seleção de personagem, retrato, clã, afiliação, técnicas, votos, medidas por fase, chakra e família |
| Clãs e Vilas | Membros documentados por clã e vila, com filtro de origem |
| Jutsus | Técnicas, quantidade de usuários e distribuição das naturezas de chakra |
| Comparador | Escolha independente de dois personagens, retratos, técnicas, naturezas e quantidade de técnicas compartilhadas |
| Popularidade | Votação oficial NARUTOP99, seleção de região, ranking e votos |
| Arcos e Episódios | Seleção de série e arco, classificação dos episódios, percentual filler e guia de títulos |

Os gráficos e listas permitem rolagem para consultar os demais registros. A composição inicial utiliza Naruto na ficha, Naruto e Sasuke no comparador, votação global e série Naruto. O seletor de fase altera idade, altura, peso e patente quando a fonte contém o dado nessa fase.

## Modelo e verificação

54 tabelas: 48 tabelas da coleta, cinco dimensões auxiliares de navegação e comparação e uma tabela de indicadores. São 48 medidas DAX e 40 relacionamentos. Tabelas brutas de auditoria ficam ocultas na lista de campos do relatório.

O projeto foi aberto no Desktop e todas as tabelas foram processadas. As 48 medidas foram executadas em uma consulta DAX. Foram conferidos 1.431 personagens, 1.393 nomes de técnicas, 1.013 episódios e 4.598.612 votos globais. A seleção de Sasuke retorna 75 técnicas documentadas; Naruto e Sasuke compartilham nove técnicas nesta base. As séries retornam 220/500/293 episódios e 26/38/16 arcos, respectivamente.

As seis páginas foram renderizadas e inspecionadas no Desktop. A validação de PBIR registrou zero erros e um aviso: o esquema público 2.14 do contêiner visual, adotado pelo Desktop instalado, não estava acessível para download pelo validador.

## Fontes e interpretação

- [Dattebayo](https://github.com/viniciusschuelter/dattebayo-api): catálogo comunitário de personagens, técnicas e características.
- [AniList](https://anilist.co/): retratos e metadados das obras.
- [NARUTOP99](https://narutop99.naruto-official.com/en/): votação oficial histórica realizada em 2022/2023 e imagens de mangá. Não representa uma votação atual.
- [SkipTheFiller — dataset](https://github.com/animecannonhunter-hash/anime-filler-list-data), [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/): episódios, arcos e classificações comunitárias; nomes e campos normalizados para uso no BI.

Os direitos das imagens permanecem com os respectivos titulares. Os dados são snapshots da coleta; não há atualização agendada. Algumas descrições e títulos permanecem em inglês. Ausências não foram preenchidas com fatos inventados: “Não informado” significa falta de dado naquele contexto. Nem todos os personagens têm retrato ou características completas.

Contagens de técnicas e chakra medem a cobertura do catálogo, e não força ou nível de poder. O global do NARUTOP99 já contém a soma das regiões; a medida de votos utiliza uma única região e assume o global quando não há seleção, evitando duplicação.

O relatório permanece local. Para disponibilizar em HTML, a etapa seguinte é publicar no Power BI Service e configurar a forma de incorporação compatível com o acesso desejado.
