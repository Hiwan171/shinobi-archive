# Shinobi Archive — implementação autorizada

Base: `docs/DIRECAO_VISUAL.md`, apresentada na etapa anterior e aceita pelo usuário ao solicitar agora a construção do visual no Power BI. Escopo local: seis páginas, dados reais coletados, filtros, fichas com imagens e comparação sem estatísticas de combate inventadas.

```yaml
Design Brief:
  design_identity:
    name: Shinobi Archive
    reference: Pokédex e Arena indicadas pelo usuário
    tone: arquivo ninja escuro com destaque laranja e arte de mangá
  canvas: {width: 1600, height: 900}
  color_map:
    page: '#0D1117'
    rail: '#090D13'
    surface: '#151D28'
    border: '#293344'
    text: '#F2F5F8'
    muted: '#A8B4C2'
    primary: '#F47A24'
    secondary: '#4C93FF'
  typography: Segoe UI
  pages:
    - {name: Arquivo Ninja, archetype: catálogo e ficha, signature: retratos e card de mangá}
    - {name: Clãs e Vilas, archetype: exploração por grupos, signature: contagem de membros}
    - {name: Jutsus, archetype: biblioteca analítica, signature: técnicas e usuários}
    - {name: Comparador, archetype: comparação, signature: duas fichas e técnicas compartilhadas}
    - {name: Popularidade, archetype: ranking, signature: votos oficiais por região}
    - {name: Arcos e Episódios, archetype: catálogo de episódios, signature: série, arco e classificação}
  implementation:
    artifact: PBIP/PBIR com modelo TMDL local
    visuals: nativos e editáveis no Power BI
    publish: fora do escopo
```
