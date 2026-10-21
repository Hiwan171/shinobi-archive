"""Atualiza o índice da entrega e empacota os materiais de pesquisa."""
import json
import pathlib
import zipfile
import importlib.metadata
from coletar_fontes import ROOT

def main():
    data=ROOT/'data'/'processed'
    summary=json.loads((data/'resumo.json').read_text(encoding='utf-8'))
    validation=json.loads((data/'validacao.json').read_text(encoding='utf-8'))
    assert validation['status']=='passed','Execute validar_base.py antes de empacotar'
    counts=summary['tabelas_linhas']
    total_images=sum(summary['arquivos_imagem_baixados'].values())
    readme=f'''# Naruto — material para o BI

Base de pesquisa e recursos visuais para construir um Power BI no nível de acabamento da Pokédex/Arena usada como referência. Esta entrega contém dados e preparação; ainda não contém um relatório `.pbix` ou `.pbip`.

## Resultado da coleta

| Material | Quantidade |
|---|---:|
| Personagens na base principal | {summary['personagens']:,} |
| Clãs | {counts['clas']} |
| Vilas | {counts['vilas']} |
| Equipes | {counts['equipes']} |
| Kekkei genkai | {counts['kekkei_genkai']} |
| Nomes de jutsus após separar contaminações | {counts['jutsus']:,} |
| Relações personagem–jutsu | {counts['personagem_jutsu']:,} |
| Naturezas de chakra distintas | {counts['naturezas']} |
| Relações familiares | {counts['familia']} |
| Episódios de Naruto / Shippuden / Boruto | {summary['episodios']:,} |
| Arcos segundo a fonte comunitária | {counts['arcos']} |
| Participantes da votação oficial NARUTOP99 | {summary['personagens_narutop99']} |
| Votos globais oficiais, levantamento 2022/2023 | {summary['votos_oficiais_globais']:,} |
| Imagens raster baixadas e verificadas | {total_images:,} |
| Símbolos de vilas em SVG | 5 |
| Tabelas exportadas | {summary['tabelas']} |

As imagens incluem 517 retratos coloridos AniList, 488 retratos de mangá oficiais, 488 cards de mangá oficiais, 27 capas, 16 banners e uma ilustração oficial. Há outras 1.412 referências de imagens da base principal; estas não foram baixadas porque amostras da origem retornaram HTTP 403.

## Por onde abrir

1. **[Naruto_BI.xlsx](data/processed/Naruto_BI.xlsx)** — todas as tabelas, uma por aba; ponto de partida para importar no Power BI.
2. **[Inventário e qualidade](docs/INVENTARIO.md)** — cobertura por campo, fontes, limites e quantidade de linhas por tabela.
3. **[Guia Power BI](powerbi/GUIA_IMPORTACAO.md)** — importação, tipos, relações e regras das medidas.
4. **[Direção visual](docs/DIRECAO_VISUAL.md)** — composição, páginas e uso dos recursos visuais.
5. **[Validação](data/processed/validacao.json)** — verificações efetivamente executadas.

## Arquivos

- `data/raw/`: snapshots originais, com origem, commit quando disponível, horário de coleta e SHA-256.
- `data/processed/csv/`: tabelas UTF-8 com BOM, separador ponto e vírgula e decimais com ponto.
- `data/processed/json/`: as mesmas tabelas em JSON.
- `data/processed/naruto.sqlite`: banco SQLite com as mesmas tabelas.
- `data/processed/schema.json`: nomes de campos e tipos de dados.
- `assets/`: retratos, cards, capas, banners, arte oficial e símbolos.
- `assets/manifest.json`: origem, caminho, dimensões e hash das imagens raster.
- `powerbi/`: função Power Query, medidas DAX iniciais, relações sugeridas e tema JSON.
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

Validação executada: contagens e cabeçalhos em CSV/JSON/SQLite/Excel; {len(validation['checks'])} grupos de verificação, incluindo chaves, continuidade dos episódios, integridade das imagens e conferência de votos globais contra regiões. As medidas DAX, o tema e a função Power Query ainda não foram executados dentro do Power BI.
'''
    (ROOT/'README.md').write_text(readme,encoding='utf-8')
    requirements='\n'.join(f'{package}=={importlib.metadata.version(package)}' for package in ['Pillow','openpyxl'])+'\n'
    (ROOT/'scripts'/'requirements.txt').write_text(requirements,encoding='utf-8')
    dist=ROOT/'entrega'
    dist.mkdir(exist_ok=True)
    archive=dist/'Naruto_BI_Materiais.zip'
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=1) as bundle:
        for folder in ['data','assets','docs','powerbi','scripts']:
            for path in sorted((ROOT/folder).rglob('*')):
                if path.is_file() and '__pycache__' not in path.parts:
                    bundle.write(path,path.relative_to(ROOT).as_posix())
        bundle.write(ROOT/'README.md','README.md')
    with zipfile.ZipFile(archive) as bundle:
        assert 'README.md' in bundle.namelist()
        assert 'data/processed/Naruto_BI.xlsx' in bundle.namelist()
        files=len(bundle.infolist())
    print(json.dumps({'archive':str(archive),'archive_mb':round(archive.stat().st_size/1024/1024,2),'files':files},ensure_ascii=False),flush=True)

if __name__=='__main__':
    main()
