# Importação no Power BI

O arquivo `data/processed/Naruto_BI.xlsx` reúne as tabelas em abas. No Power BI Desktop, use **Obter dados → Pasta de trabalho do Excel** e selecione as tabelas necessárias. Preserve `registro_ninja` como texto para manter zeros à esquerda.

Para uma atualização reproduzível, use os CSVs UTF-8 com BOM de `data/processed/csv/`. O separador é ponto e vírgula; decimais usam ponto. `schema.json` descreve os tipos. A função `fnCarregarTabela.pq` lê um CSV aplicando esses tipos com cultura `en-US`, independentemente da configuração regional do Windows.

Após criar a função, cada tabela pode ser uma consulta em branco, por exemplo:

```powerquery
let
    Fonte = fnCarregarTabela("personagens")
in
    Fonte
```

Se o projeto mudar de pasta, forneça o segundo argumento com a nova raiz. A função é uma preparação de código; não foi executada dentro do Power BI nesta etapa.

## Tabelas para começar

Importe `personagens`, `clas`, `vilas`, `equipes`, `kekkei_genkai`, `personagem_clas`, `personagem_vilas`, `personagem_equipes`, `personagem_kekkei_genkai`, `jutsus`, `personagem_jutsu`, `naturezas`, `personagem_natureza`, `medidas_por_fase`, `patentes_por_fase`, `personagens_narutop99`, `votacao_narutop99`, `ranking_demografico`, `series_filmes`, `arcos`, `episodios` e `arquivos_imagem`.

As demais tabelas acrescentam família, aliases, dublagem, ferramentas e auditoria. `atributos_originais` e `problemas_qualidade` podem ficar com carga desativada no relatório final.

## Relações

`relacionamentos.csv` contém uma proposta de relações 1:N, com a coluna de cada lado. Use direção de filtro única. As dimensões de clã/vila/equipe filtram as tabelas de vínculo; para contar personagens nesses recortes, use as medidas de vínculo em `medidas.dax`. Uma seleção de clã não atravessa automaticamente a ponte para filtrar a tabela de personagens em um modelo com direção única: a interface deve usar uma medida de seleção ou TREATAS, a implementar na construção do relatório.

Não relacione todas as colunas que terminam em `_id` automaticamente. Há IDs diferentes por fonte e múltiplos caminhos possíveis. As tabelas de fontes opcionais precisam ser acrescentadas com cuidado para não criar caminhos de filtro ambíguos. Na família, a relação pelo personagem de origem pode ser ativa; uma relação pelo parente deve ficar inativa ou usar uma dimensão de personagens duplicada para esse papel.

## Imagens

`imagem_local`/`arquivo_local` são caminhos relativos para os arquivos existentes, úteis para preparar os recursos visuais e para um aplicativo local. Caminhos `C:\...` não se tornam URLs públicas no Power BI Service. Para imagens dinâmicas no relatório publicado, será necessário hospedar os arquivos em endereço acessível pelo visual ou escolher outra estratégia compatível com o visual utilizado. `imagem_url` preserva o endereço da fonte; a validação feita nesta entrega foi no downloader local, não em cada visual/cliente Power BI.

## Regras para os indicadores

- `all` no NARUTOP99 é o total global, já somado nas oito regiões. Nunca somar as nove linhas de região de um personagem. Use as medidas global/regional separadas.
- Votos NARUTOP99 são históricos, de 2022/2023. Favoritos AniList são de outro levantamento e outra data; não somar ou comparar como uma única escala.
- Campos ausentes são nulos. Não substituir por zero, vivo, humano ou sem clã.
- Medidas e patentes variam com a fase; a coluna `contexto_original` é obrigatória na comparação.
- `data_exibicao_original` de episódios não foi validada. Não usar em série temporal até resolver as inconsistências; para navegar, usar série, número e arco.
- Itens com HTML e catálogos de jogos em campos de técnicas/ferramentas foram colocados em `itens_quarentena`.

O tema `tema_shinobi.json` define uma paleta inicial. Layout, navegação e composição de cards ainda precisam ser implementados no relatório.
