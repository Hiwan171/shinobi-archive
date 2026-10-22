# Auditoria visual — Shinobi Archive

Revisão das seis abas, realizada em 21/10/2026. O projeto mantém uma identidade visual consistente. Recomendo preservar as seis abas, a paleta escura, as artes originais e a escala compacta das fontes. Os ajustes prioritários são de distribuição de espaço: apresentações grandes estão comprimindo os dados, sobretudo em telas mais baixas.

Esta entrega registra a auditoria e as recomendações. A interface, o modelo e o pacote de entrega não foram alterados.

## Escopo e evidências

- HTML: 40 capturas atuais, incluindo as seis abas em 1600×1000, 1600×900 e 1366×768; subabas, detalhes, três séries, busca sem resultados e uma missão de cinco perguntas com feedback, resultado e revisão. Nenhum erro JavaScript registrado nesse percurso.
- Power BI Desktop: 19 capturas atuais da janela da cópia local de validação, incluindo as seis abas, subabas do Arquivo, Mundo, Comparador e Popularidade, além de jogo, feedback, pausa e resultado parcial do quiz. Captura por PrintWindow e navegação por UI Automation.
- Desktop observado em monitor de 1936×1039, com zoom do relatório em 81%. A página lógica do relatório é 1600×1000. Reduzir o relatório no Desktop diminui fisicamente as letras; redimensionar a janela HTML também altera o espaço do layout. As duas situações foram consideradas separadamente.
- O código incorporado da cópia de validação é comparado ao PBIP principal e às fontes no registro de integridade. A prévia usa seu snapshot existente; a ordem de alguns vínculos difere do retorno nativo, conforme AV10.
- A avaliação de contraste é visual, apoiada nas cores e tamanhos computados. Não constitui certificação de acessibilidade. Power BI Service, celulares e todos os 1.431 perfis individuais não fazem parte desta amostragem.

Abra a [galeria com filtros e recomendações](index.html). As medições estão em [geometria-paineis.json](geometria-paineis.json), [medicoes-html.json](medicoes-html.json) e [medicoes-powerbi.json](medicoes-powerbi.json).

## Resultado por aba

| Aba | Preservar | Ajuste recomendado | Prioridade |
|---|---|---|---|
| Arquivo Ninja | Três colunas, personagem em destaque, demonstração e dossiê com Perfil/História/Vínculos | Adaptar as alturas para manter fase, medidas e ações visíveis; estabilizar ordem dos vínculos | Média |
| Mundo Shinobi | Mapa, destaque da vila, cinco nações e indicadores | Reposicionar seletor de localidades e ajustar mapa à altura da tela | Alta em telas baixas |
| Frente a Frente | Simetria dos personagens, roda de chakra, cores A/B e veredito | Dar espaço mínimo à análise inferior e tornar a arena flexível | Alta em telas baixas |
| Popularidade | Pódio com destaque do líder, votos absolutos, ranking e comparação regional | Compactar o pódio e devolver altura ao ranking e à análise; eliminar filtro duplicado | Alta em telas baixas |
| Episódios | Três séries, artes, filtros combinados, cores e detalhe do episódio | Tornar a tabela parte da primeira vista, reduzir a página e oferecer mapa expandido | Alta nos dois ambientes |
| Exame Shinobi | Formulário, botão principal, alternativas, feedback, resultado e revisão | Melhorar legendas auxiliares e corrigir um texto de transição | Baixa |

## Achados prioritários

**AV01 — Episódios: o guia depende de rolagem da página principal.** Em 1600×900, há 1.910 px de conteúdo para 734 px de área útil. A apresentação e o mapa ficam antes da tabela. Mesmo em 1600×1000, a primeira vista contém apenas o começo dos resultados; isso também aparece no Power BI. Sugiro uma faixa menor de apresentação, busca perto do topo, menos episódios por página e mapa completo em expansão. A página deve mostrar filtros, primeiras linhas e paginação juntos. [HTML](html-episodios-1600.png) · [Power BI](powerbi-episodios.png).

**AV02 — Popularidade: a análise desaparece em 1366×768.** A lista do ranking tem aproximadamente 24 px de altura, e a área regional chega a 0 px, enquanto o pódio conserva 242 px. A composição em 1600×1000 é melhor; no Desktop ainda existem rolagens independentes para ranking e análise. Recomendo um pódio menor para telas baixas, espaço mínimo garantido para dados e páginas curtas no ranking. [1366×768](html-popularidade-1366.png) · [1600×1000](html-popularidade-1600-1000.png) · [Power BI](powerbi-popularidade.png).

**AV03 — Frente a Frente: a arena comprime a análise.** Em 1366×768, a arena ocupa 408 px e o conteúdo da análise recebe cerca de 46 px. As abas aparecem, mas o conteúdo mal pode ser visto. A arena precisa ceder altura; matriz e textos longos podem oferecer uma visualização ampliada. A roda e os dois personagens devem permanecer. [HTML](html-comparador-1366.png) · [matriz no Power BI](powerbi-comparador-matrix.png).

**AV04 — Mundo Shinobi: o seletor alcança o rodapé em telas baixas.** Em 1366×768, o controle das localidades vai de y=726 a y=769, enquanto o conteúdo principal termina em y=727. Parte do seletor fica fora da área destinada à aba. O mapa mantém mínimo de 360 px. Sugiro mover o seletor para cima e adaptar o mapa à altura disponível. Na composição atual do Desktop o seletor cabe. [HTML](html-grupos-1366.png) · [Power BI](powerbi-grupos.png).

## Ajustes de acabamento

**AV05 — Arquivo Ninja: conteúdo útil sai da primeira vista.** Em 1366×768, o perfil central tem aproximadamente 730 px para 613 px disponíveis. Fase e medidas físicas ficam abaixo; a técnica também exige rolagem. Em 1600×900, Explorar a técnica fica abaixo do recorte inicial. Em 1600×1000 e no Desktop observado, o aproveitamento melhora. Recomendo adaptar as alturas da arte e da demonstração, mantendo as ações e os dados dentro do cartão. [1366×768](html-arquivo-1366.png) · [1600×900](html-arquivo-1600.png) · [Power BI](powerbi-arquivo.png).

**AV06 — Legendas: melhorar presença antes de mexer no tamanho.** Há textos auxiliares entre 6 e 9 px, como a legenda do ranking, títulos de análise, legenda do atlas e aviso de memória da sessão do quiz. Recomendo ajustar contraste, peso e concisão, mantendo as fontes pequenas aprovadas. Os rótulos decorativos podem ser agrupados; créditos e explicações necessárias devem continuar acessíveis. [Mundo](html-grupos-1600.png) · [Popularidade](html-popularidade-1600.png) · [Quiz no Power BI](powerbi-quiz.png).

**AV07 — Popularidade: simplificar os filtros de região.** Os nove botões e o seletor repetem a mesma escolha. Manter os botões na composição ampla e usar o seletor nas menores recupera espaço e reduz repetição. [Evidência](html-popularidade-1600.png).

**AV08 — Arquivo: consolidar um acesso à biografia.** Na aba História, Biografia completa repete Ler biografia do perfil central. É uma simplificação opcional. Ficha completa abre outra consulta e deve ser mantida. [Evidência](html-arquivo-history.png).

**AV09 — Quiz: corrigir o texto de transição.** Após uma resposta, Vamos para a próxima missão? deveria dizer Vamos para a próxima questão?, acompanhando a ação real do botão. A composição do quiz se manteve equilibrada nos tamanhos observados; não recomendo reformular a aba. [HTML](html-quiz-feedback.png) · [Power BI](powerbi-quiz-feedback.png).

**AV10 — Arquivo: estabilizar os vínculos em destaque.** A prévia exibe Minato e Kushina nas primeiras relações de Naruto; o Power BI exibe Minato e Boruto. São duas relações dentro de sete, escolhidas conforme a ordem de retorno. Definir uma ordenação explícita por parentesco e nome manterá a mesma primeira leitura. [HTML](html-arquivo-family.png) · [Power BI](powerbi-arquivo-vinculos.png).

## O que remover e o que manter

Não recomendo remover abas, personagens, indicadores principais ou funcionalidades. A simplificação deve atingir controles repetidos, introduções que ocupam muita altura e microtextos decorativos. Mapas e textos extensos podem continuar disponíveis em detalhes ampliados. Para listas longas, como catálogo e ranking, a paginação pode substituir barras internas sem perder a consulta completa.

Preservar a navegação lateral com seleção clara, as artes originais, a paleta, o destaque das métricas, os rótulos Cânone/Misto/Filler junto das cores, as referências e os modais de consulta. O quiz oferece um bom exemplo de controle da altura e hierarquia das ações.

## Ordem sugerida para a próxima etapa

1. Resolver Episódios e os cortes de Popularidade, Frente a Frente e Mundo em telas baixas.
2. Ajustar a altura do Arquivo e as legendas necessárias.
3. Remover duplicações opcionais, padronizar vínculos e corrigir o texto do quiz.
4. Repetir as capturas HTML e Power BI com o mesmo estado, preservando fontes, artes e dados.

As recomendações ficam concluídas quando conteúdo principal, filtros e paginação couberem na área visível, sem sobreposição ao rodapé, sem painéis com altura nula e sem aumento geral da tipografia. Esconder a barra enquanto o conteúdo continua cortado não atende ao objetivo.
