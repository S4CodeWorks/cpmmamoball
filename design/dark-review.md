# CPM MamoBall · revisão independente dark

## 1. Disposition — ship

**Ship no escopo visual do Figma.** A extensão mantém a estrutura aprovada e aplica uma hierarquia tonal coerente à identidade preta, branca e azul. Não foram encontrados defeitos materiais concretos nas capturas finais inspecionadas. Não há pedido de fix, recapture ou rebuild.

Revisão independente, em contexto fresco, realizada em 2026-10-05 a partir do brief dark, PRODUCT.md, DESIGN.md, craft-floor da skill Impeccable, tokens sincronizados e metadados. A direção aprovada foi preservada; esta revisão não propõe outra composição nem reabre a aprovação.

## 2. Coverage / evidence

Foram abertas e inspecionadas **todas as 36 exportações finais** em [dark-previews-final](dark-previews-final/): 35 telas/estados e Foundations. Os PNGs são exportações Figma 1×; seus cabeçalhos confirmam as larguras dos frames, sem redução no arquivo original. A exibição reduzida do ultrawide no visualizador não altera a captura de 2560 px. Não foram observadas capturas incompletas, texto cortado, fontes ausentes ou outro problema de validade que exigisse recapture.

| Cobertura | Evidência final — IDs dos nós, também usados nos nomes dos PNGs |
| --- | --- |
| Home resultado — desktop, compacto, ultrawide, tablet e mobile | `8:7953` 1440; `8:8181` 1024; `8:8406` 2560; `8:8634` 768; `8:8846` 390; `8:9058` 320 |
| Header isolado e conta conectada | `8:7594`, `8:7624`, `8:7651`, `8:7681` |
| Mais desktop/compacto, conta e equipe | `8:7716`, `8:7790`, `8:7861`, `8:7906` |
| Seletor aberto desktop/390/320; fechado; interação; competição 2025 | `8:9270`, `8:9511`, `8:9736`, `8:10185`, `8:10413`, `8:10452` |
| Feed com duas competições salvas | `8:9961` |
| Home agendamento desktop/mobile | `8:10680`, `8:11406` |
| Home aprovação desktop/mobile | `8:10905`, `8:11615` |
| Nomes longos mobile | `8:11812` |
| Resultado, agendamento, aprovação, empate, W.O., loading, empty, error e nomes longos compactos | `8:11118`, `8:11161`, `8:11201`, `8:11233`, `8:11276`, `8:11319`, `8:11331`, `8:11346`, `8:11363` |
| Foundations dark | `10:16193` |

A referência light vigente foi identificada pelos [metadados dos estados](states-metadata.json) e pelo [review dos estados](states-review.md), incluindo a substituição dos frames de aprovação pelas provas em [approval-branch-final](approval-branch-final/). A comparação direta incluiu aprovação desktop/mobile, seletor aberto de 320 px, folha de interação do seletor e referências de home e menu Mais. A composição, o conteúdo e as quebras observadas permanecem coerentes com essas referências; o branco original da logo continua presente.

Na matriz final, placares e datas continuam dominantes; contexto, horários e ações mantêm leitura clara. O mobile mantém a ordem destaque → próximos jogos → resultados → classificação. Nomes longos quebram e o destaque cresce sem colisões. Os popovers ficam dentro dos frames; sua sobreposição ao destaque é a interação já aprovada. Mais mantém zona de ícones, divisor e ação de tema separada, com sol real e rótulo “Tema claro”. Os estados default, hover, foco e indisponível do seletor são reconhecíveis; seleção mantém check e preenchimento, e erro oferece recuperação textual.

Os [metadados dark](dark-metadata.json) registram 54 masters reutilizáveis em 22 famílias de componentes, 35 telas/estados e 96 entradas de reações. Uma leitura independente dos destinos registrados não encontrou referência a nó light: todos os destinos presentes usam IDs dark `8:*`. Isso verifica o registro, não uma execução completa do protótipo.

Os contrastes de papéis fornecidos pelo audit do sistema são: texto principal 14,91:1; secundário 9,51:1; tinta escura sobre ação 7,79:1; texto selecionado 7,60:1; azul de ação sobre seleção 4,56:1; caption no tile de resultado 4,61:1; caption de agendamento 8,21:1. As capturas não apresentam conflito visual com esses pares. Os valores sustentam a legibilidade dos pares avaliados e não constituem conformidade WCAG da futura aplicação.

## 3. Material findings — prioridade / localização

**Nenhum achado material.** Não foram observados clipping, overflow, perda de hierarquia, colisão de controles, divergência estrutural da referência aprovada, tinta ilegível ou estado visual ausente na matriz exportada. Nenhuma prioridade ou localização de correção é atribuída sem um defeito concreto.

## 4. Advisory findings

**Nenhuma alteração visual adicional recomendada.** Os escudos cinza são assets demonstrativos incumbentes; a logo branca é o JPG oficial preservado. Esses elementos não são defeitos novos do tema.

O rótulo “Tema claro” especifica a ação pretendida. A troca entre temas, autenticação, dados e comportamento real dos controles serão implementados no app. O limite é documentado e não bloqueia esta entrega Figma. A folha do seletor comprova visualmente seus estados; as demais variantes de masters estão inventariadas nos metadados, sem uma exportação individual de cada master nesta matriz.

## 5. Design / system / documentation notes

[tokens.json](tokens.json) contém 81 primitives, coleções semânticas pareadas Light/Dark e papéis dark alinhados ao [brief](dark-brief.md). O pareamento de coleções respeita a limitação Starter de um mode por coleção. Fontes e dimensões compartilhadas preservam Barlow Condensed + Manrope, controles de 44 px, foco de 2 px e geometria aprovada. O novo sol está exportado como [SVG original](assets/icons/8-16187.svg); a geometria dos demais ícones e o asset oficial da logo permanecem a referência para implementação.

O handoff deve apontar estas capturas como prova dark vigente e identificar como histórico qualquer texto anterior que diga que o dark renderizado permanece fora do escopo. PRODUCT.md e DESIGN.md foram usados como contexto; este review não os altera. Preserve também as regras de favoritos: sem favoritos, seletor; com favoritos, contexto de salvas e listas mescladas; aprovação exclusiva do ramo com favoritos e contexto não interativo.

Esta conclusão cobre o design exportado. Implementação literal, teclado, foco real, ARIA, seleção/caret/scrollbar, reduced motion, dados e comparação por viewport permanecem verificações da futura aplicação, conforme [fidelity-handoff.md](fidelity-handoff.md). Nenhum app, website ou nó Figma foi alterado durante esta revisão; o único arquivo escrito foi este relatório.
