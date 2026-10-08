# Classificação · Light

Modo: Operate. Extensão da identidade CPM aprovada (Manrope UI, Barlow Condensed display, branco/preto/azul), com prioridade para leitura mobile. Figma somente; aplicação não alterada.

## Direção confirmada

Liga e mata-mata, incluindo jogo único e ida/volta desde o primeiro desenho (resposta explícita do usuário). Liga: posição, escudo, clube e pontos conduzem a leitura. Desktop mostra J/V/E/D/GP/GC/SG e últimas cinco; mobile prioriza pontos, J/SG e sequência visual V/E/D, com expansão para todas as estatísticas. Não comprimir dez colunas ou esconder informação sem acesso.

Mata-mata: desktop mostra chave com quartas, semifinais e final e conexões visuais reais. Mobile/tablet mostra uma fase por vez, cards inteiros e botões de fase com rótulos completos; vínculo entre confrontos por identificadores Q1–Q4/S1–S2/F1 e origem de cada vaga. Ida/volta: agregado em destaque e partidas individuais identificadas com mandante/visitante corretos, datas e resultados. MamoBall não tem pênaltis. A correção definitiva do usuário invalida referências anteriores; não inventar outro desempate. Empate de placar/agregado não autoriza vencedor; A definir para vagas pendentes. Formato definido pela competição, não escolhido arbitrariamente pelo torcedor.

## Verdade atual e feature nova

Fonte atual: components/screens/TournamentsScreen.tsx, lib/types.ts, lib/db.ts. Competições selecionáveis, progresso rodada atual/total, favoritos, notificações, compartilhar, regulamento e artilharia existentes devem continuar acessíveis. Classificação atual ordenada por pontos e saldo; clique abre clube. Top4 playoffs e últimos2 rebaixamento (quando mais4 equipes) são convenções atuais, não regulamento oficial verificado; apresentar faixas explícitas e não depender só da cor. Últimos5 usa os valores existentes V/E/D; sem inventar variação de posição ou tendência.

Competition ainda não possui formato nem estrutura de chave, e Match tem apenas stage textual. A chave é feature nova proposta pelo usuário; futuras entidades devem registrar etapas, confrontos, vínculos entre vencedores, pernas/mandantes, agregado, vencedor explicitamente resolvido, BYE e estado da vaga. Não inferir esses dados apenas do texto stage ou de uma tabela de pontos. Datas, equipes, placares e regulamento das amostras são demonstrativos.

## Estrutura e estados

Cabeçalho aprovado com Classificação ativa. Seleção de competição e ações preservadas. A competição selecionada define o formato. Liga usa Tabela/Artilharia; copas usam Chave/Artilharia. O seletor mostra Liga Paulista (liga), Copa Paulista (jogo único) e Taça CPM (ida e volta), todas demonstrativas. O modo não converte o formato esportivo da competição. Rodada8de14 da amostra: informação de progresso sem novo critério de classificação.

Cobrir 1440/1024/2560/768/390/320 na Liga e no jogo único; ida/volta em1440/390/320, fases mobile semifinais/final, expansão de estatísticas, artilharia e menu de competição. Estados: vazio de liga/chave pendente, carregamento/erro, nomes longos, empate sem inferir vencedor, ida finalizada/volta agendada, avanço sem adversário (BYE) como caso separado sem inventar placar.

Reutilizar tokens, fontes, logo JPG oficial integral, escudo fallback e SVGs originais. Novos componentes nativos expõem textos/valores; auto-layout/hug/fill, máximo1280, gutters16/24 e alvos44. Novas dimensões derivadas da escala existente, bindings compartilhados. Contraste e hierarquia, rótulos sem depender de cor, nomes acessíveis, foco2px e teclado/movimento reduzido especificados para implementação; Figma não estabelece conformidade browser.

## Limites

Nenhuma integração de banco, lógica esportiva, configuração de competição, ARIA/browser ou dark nesta etapa. A futura implementação deverá conectar dados/ações existentes e criar a feature de chave explicitamente. Fidelidade literal às capturas, metadata, tokens, fonts e SVGs aprovados.


## Registro concluído e handoff

Artefato final aprovado: `design/classification-review.md` retorna ship em todas as34 capturas de `design/classification-previews-final/`, sem defeito material/export inválido; densidade vertical da Liga768 é advisory. Páginas21:24107/21:24108/21:24109; sets Form21:24118 (4), League row21:24439 (11), Tie21:24673 (9). São24 variantes nativas, seis SVGs originais/paths reutilizados, 23cenas+4interações+6estados+1folha. As APIs canônicas pós-combine, todos os IDs e paths estão em `design/classification-metadata.json`; dimensões/aliases em `design/classification-tokens.json` e `design/tokens.json`. Totais atuais91primitives/43Light/42Dark=176; registros anteriores preservam seu escopo histórico.

Geometria normativa e papéis estão registrados em DESIGN.md e `.impeccable/design.json` (extensions.classification); reprodução literal em `design/fidelity-handoff.md`. Mobile320/390 e tablet768 usam fase única; desktop acima768 usa bracket integral, máximo1280. Tie jogo único mínimo196px compacto/212px desktop; ida-volta256/272px. Alturas crescem com nomes; conectar centros reais, sem conservar offsets que desalinhem conteúdo expandido. SVGs finais em `design/assets/icons/classification-*.svg`; chevronUp reutiliza path existente rotacionado180°. Fallback raster `public/escudo-generico.png` e JPG oficial integral permanecem.

Cobertura conectada: Liga1440/390 abre seletor/ações, seletor leva às três competições demonstrativas, Liga↔Artilharia1440/390, fases Single/Two-leg390, expansão primeira linha Liga390/320. DISSOLVE120ms. Outros tamanhos estáticos; artilharia mata-mata/seletor mata-mata ativo sem percurso. Favoritos/notificações começam off; ações/clubes/partidas/retry demonstram intenção. Loading/erro mostram somente progresso conhecido da competição; rodada desconhecida não herda8de14 da fixture. Nenhum detector/browser/ARIA/app validado; não reabrir QA visual neste merge documental.

## Correção de produto · 2026-10-06

MamoBall não tem pênaltis. Exports, variantes e review históricos que mencionem pênaltis ficam preservados como registro, mas esse conteúdo é obsoleto e não autoriza implementação. Nenhuma regra alternativa foi confirmada; não inferir vencedor de empate. Esta nota corrige a especificação futura, sem editar os artefatos Figma ou implementar mata-mata.
