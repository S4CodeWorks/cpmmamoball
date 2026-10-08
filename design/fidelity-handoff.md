# Figma → site: compromisso de fidelidade

O usuário aprovou a linguagem visual e pediu reprodução fiel de espaçamento, tamanho, cor, tipografia, ícones e estados. Header/Home/Jogos já foram implementados em light/dark; este handoff mantém a referência nativa e as especificações futuras das demais telas. Evidências runtime e limites estão em `design/home-implementation/implementation.md`.

## Fonte de verdade

- `Home · Destaques`: seis layouts principais, em 1440, 1024, 2560, 768, 390 e 320 px.
- `Home · Interações`: seletor aberto, fechado, opção escolhida, estados do controle e feed com duas competições salvas.
- `Home · Estados`: agendamento/aprovação em contexto, variantes dos banners e exemplos mobile.
- `Home · Components`, `Components` e `Foundations`: componentes, variáveis e estilos compartilhados.
- `states-metadata.json`: IDs atuais, medidas, caminhos dos SVGs e limites do protótipo. `tokens.json` e `home-v2-metadata.json`: sistema visual aprovado.

## Reprodução

Usar Manrope na interface e Barlow Condensed nos títulos e placares, com os pesos, tamanhos e entrelinhas definidos nos estilos. Carregar as fontes reais antes das capturas; não validar com fontes de substituição.

Usar os SVGs exportados em `design/assets/icons`, preservando paths, viewBox, caps, joins e espessuras. Ajustar a cor pelos tokens do contexto. A seta do botão de evento tem exportação própria; os ícones do destaque escuro possuem overrides descritos no metadata. Não trocar por um ícone semelhante de outra biblioteca. A logo oficial permanece integral e sem redesenho.

Reproduzir auto-layout com as regras correspondentes de flex/grid, hug/fill e largura máxima. Respeitar áreas clicáveis, padding, gaps, raios, altura mínima e crescimento do conteúdo. Texto longo deve quebrar; não mascarar divergências com truncamento ou alturas que cortem conteúdo.

## Comportamento preservado

Sem favoritos, a seleção determina partidas e classificação. Com favoritos, as listas mesclam competições; com duas ou mais, cada jogo identifica a competição. A classificação identifica a primeira favorita. O seletor de competição não aparece nesse ramo. A regra existente escolhe um único destaque; o redesign não introduz carrossel automático nem novos critérios de destaque.

O protótipo desktop demonstra abrir, fechar e escolher opções. Os exemplos de dados são ilustrativos; a tela de 2025 encerra essa demonstração. As versões mobile abertas são referências estáticas. Ao implementar: teclado, foco, Esc, clique fora, seleção e estados de carregamento/erro devem funcionar no navegador.

## Aceite visual da implementação

Comparar site e exportação Figma com o mesmo viewport, conteúdo, estado, fontes carregadas e escala de captura. Conferir geometria, alinhamento, cores, ícones e tipografia por sobreposição e comparação visual, incluindo telas pequenas, tablet e ultrawide. Corrigir diferenças verificadas antes de declarar fidelidade. Não aceitar uma aproximação estilística como conclusão da implementação.

O registro original desta organização foi Figma-only. A implementação posterior de Header/Home está documentada separadamente; Jogos foi implementado posteriormente em ambos os temas; Classificação continua como redesign especificado, com código incumbente preservado.


## Extensão dark · 2026-10-05

Light permanece principal. A extensão dark possui sete páginas, 54 componentes em 22 famílias raiz e 35 referências de tela/estado. Usar `design/dark-metadata.json` para IDs, mapeamento Light → Dark, variáveis e reactions; usar `design/dark-previews-final/` para as exportações atuais e `design/dark-brief.md` para intenção e papéis. Os registros anteriores light continuam válidos em seu escopo.

As coleções semânticas Light/Dark são pareadas por limite Starter de um mode por coleção. `design/tokens.json` registrava naquela revisão 81 primitives, 29 aliases Light e 37 Dark. Reproduzir cores pela coleção do tema; preservar medidas, Manrope UI, Barlow Condensed display e geometrias aprovadas. Dark acrescenta papéis próprios para card, resultado e próximo jogo. Texto e seta de ação usam `text/on-action` dark; não manter o branco do botão light sobre ação dark.

Preservar o JPG oficial integral, inclusive o branco original, e o escudo fallback existente. O sol do rodapé **Tema claro** é `design/assets/icons/8-16187.svg`: componente `8:16187`, 20 px, stroke 1.7 px e cor vinculada a `menu/icon-color` Dark. Os demais ícones seguem as geometrias originais e suas cores contextuais.

Há 96 entradas de reactions rebaseadas para componentes e cenas dark, com referências dos fluxos de seletor e More. **Tema claro** especifica a ação pretendida; o protótipo não estabelece a troca completa entre temas. Implementar e verificar seleção, tema, persistência, teclado/ARIA, Escape, foco e busca dinâmica no navegador. As capturas Figma e cálculos de contraste não validam esses comportamentos.

A verificação técnica informada pelo autor examinou quatro raízes light (`4:1655`, `4:2606`, `2:254`, `2:568`) e não encontrou bindings Dark nelas. Isso não equivale a uma auditoria exaustiva. O review independente dark retornou **ship** no escopo de 36 capturas finais (35 telas/estados e Foundations), incluindo comparação com aprovação light desktop/mobile e seletor 320 px; não observou problemas materiais nem falhas de validade. Ver `design/dark-review.md`. O parecer não valida comportamento runtime. Comparar futura implementação com Figma no mesmo tema, viewport, dados e estado antes de declarar fidelidade.


## Jogos Light · 2026-10-05

A extensão Jogos mantém a Home Light aprovada: Manrope na UI, Barlow Condensed nos títulos, horários e placares, SVGs originais, escudo fallback e logo oficial integral. Referências atuais: `design/games-metadata.json`, `design/games-tokens.json`, `design/games-brief.md` e as 19 capturas de `design/games-previews-final/`. Capturas anteriores de pass-one são históricas. As páginas são telas `13:16350`, componentes `13:16351` e estados `13:16352`; a nota de dados/comportamento é `13:19329`.

Hoje tem seis larguras (1440, 1024, 2560, 768, 390 e 320); Próximos e Resultados têm 1440/390. As 19 provas incluem dez telas principais, oito estados/casos limite e a folha de interação `13:19172`. Reproduzir máximo de conteúdo 1280px, header 88/72px, margens tablet 24px/mobile 16px, cards de raio 16px com padding amplo 24px horizontal/20px vertical e compacto 16px, célula de horário 112px, marcadores de data/rodada 56px, abas 52/72px e foco 2px. Nomes longos quebram e expandem o card. O metadata registra propriedades exatas das dez variantes de aba e dez variantes de partida.

Os novos bindings registram medidas já existentes sem alterar as imagens revisadas. Na revisão Jogos Light, o sistema possuía 85 primitives, 34 aliases Light e 37 Dark (156 variáveis). Os registros anteriores Home/Dark continuam históricos e válidos em seu escopo. Não aplicar automaticamente estas novas referências a Jogos Dark: esta extensão é somente Light.

Preservar a lógica atual: Hoje recebe `agendado` com data iniciada por Hoje; Próximos recebe os demais `agendado`; Resultados recebe `finalizado`, agrupado por rodada decrescente. `ao_vivo` continua excluído dessas listas. A competição vem do contexto ativo e é informação não interativa. Contagem representa a categoria completa. Cada partida deve ter um único alvo para seus detalhes; a seta não cria botão aninhado. Não foram criados filtros, busca da lista, favoritos nem uma nova tela de detalhes Figma.

O protótipo alterna as três categorias nas telas principais de 1440/390, na mesma página, com DISSOLVE 120ms ease-out. As demais larguras são referências estáticas de Hoje. Ver próximos jogos no vazio de Hoje especifica a ação da aba futura, sem reaction entre páginas no Figma. Erro/retry é especificação para integração futura: JogosScreen ainda não consome o erro de DataContext. Loading/erro omitem contagens desconhecidas, vazio mostra zero e horário ausente mostra A definir. Datas, clubes e placares são ilustrativos: referência de Hoje em 5 de outubro de 2026, próximos em 8/10 de outubro, resultados nas rodadas 6 e 5.

O review independente `design/games-review.md` retornou **ship** nas 19 capturas, sem defeitos materiais. A aba Disabled opcional se aproxima visualmente de Default; diferenciar aparência e semântica se ela for usada na implementação. Verificar no navegador teclado, seleção de abas, foco, nomes acessíveis de partidas, alvo único, ARIA e movimento reduzido. Comparar a implementação com a captura final no mesmo viewport, dados, estado, fontes e escala antes de declarar fidelidade. Esta etapa não modificou a aplicação e não valida comportamento runtime ou acessibilidade do navegador.


## Jogos Dark · 2026-10-05

Extensão concluída da geometria Jogos Light e do sistema aprovado Home Dark. Fonte literal: `design/games-dark-metadata.json`, `design/games-dark-brief.md`, `design/tokens.json` e as 19 capturas de `design/games-dark-previews-final/`; pass-one é histórico. Páginas: componentes `15:19337`, telas `15:19338`, estados `15:19339`. Sets: abas `15:19340` e partidas `15:19416`, dez variantes nativas cada. Nota de fixtures/comportamento `15:22215`; folha de interação `15:22080`.

As dez telas principais preservam Hoje em 1440/1024/2560/768/390/320 e Próximos/Resultados em 1440/390. Oito estados/casos limite e a folha de interação completam as provas. Reproduzir máximo 1280px, gutters tablet 24px/mobile 16px, header 88/72px, padding amplo 24px horizontal/20px vertical e compacto 16px, gaps compactos 12px, raio 16px, horário 112px, marcador 56px, abas 52/72px e foco 2px. Preservar Manrope/Barlow Condensed, JPG oficial com branco original, escudo raster e paths SVG originais. Não acrescentar cores, fontes, sombras ou geometria.

O sistema compartilhado atual possui 85 primitives, 34 aliases Light e 42 Dark (161 variáveis). Os cinco novos aliases Dark reutilizam primitives: horário `VariableID:15:19687` (112px), aba `VariableID:15:19688` (52px), aba mobile `VariableID:15:19689` (72px), marcador `VariableID:15:19690` (56px), padding vertical `VariableID:15:19691` (20px). Usar roles Dark de página, header, card, seleção, texto, horário/foco e ação; texto de ação usa Dark Action Ink.

A verdade do produto segue Jogos Light: Hoje recebe agendados com data iniciada por Hoje, Próximos os demais agendados e Resultados finalizados por rodada decrescente. Contexto de competição não interativo; não incluir ao_vivo, busca de lista ou filtros. Datas, clubes e placares são ilustrativos. Preservar zero no vazio, contagens omitidas durante loading/erro e A definir para horário ausente. Card é um único alvo de detalhe, sem botão aninhado ou novo frame de detalhe.

As três categorias em 1440/390 alternam na mesma página com DISSOLVE 120ms ease-out; demais larguras são estáticas. CTA do vazio não possui reaction cross-page. Erro/retry exige integração futura com DataContext. Troca integral light/dark não foi prototipada. Teclado, ARIA, foco, nomes acessíveis, alvo único e movimento reduzido serão verificados no navegador durante implementação.

Review independente **ship** em `design/games-dark-review.md`: todas as 19 capturas finais inspecionadas, com comparação de referências Jogos Light/Home Dark, sem defeito material ou captura inválida. Advisory opcional: Disabled se aproxima de Hover, sem dependência no fluxo principal. Evidência técnica do autor: zero bindings Light visíveis em 22 raízes Dark; zero bindings Dark inesperados na amostra de duas cenas/dois sets Light. Contrastes informados: principal/card 14.91:1, secundário/card 9.51:1, selecionado 7.60:1, horário/célula 4.56:1, horário/card 7.21:1, texto/ação 7.79:1. São verificações limitadas de design, não conformidade de acessibilidade ou runtime. Nenhuma aplicação foi alterada. Comparar futura implementação com as capturas finais em tema, viewport, dados, estado, fontes e escala idênticos.


## Classificação Light · 2026-10-05

Extensão do mundo CPM aprovado com Liga, mata-mata jogo único e ida/volta desde o primeiro desenho; prioridade mobile e reprodução literal futura. Fonte atual: `design/classification-metadata.json`, `design/classification-tokens.json`, `design/tokens.json`, `design/classification-brief.md` e as 34 capturas de `design/classification-previews-final/`. Páginas: telas `21:24107`, componentes `21:24108`, estados `21:24109`; nota `21:33681`, folha `21:33469`. Os sets nativos são Form `21:24118` (4 variantes), League row `21:24439` (11), Tie `21:24673` (9). O metadata registra as APIs canônicas após combine, incluindo chaves TEXT exatas e opções VARIANT; não presumir todas as combinações possíveis. Total compartilhado atual: 91 primitives, 43 aliases Light, 42 Dark (176 variáveis). Home/Dark/Jogos permanecem referências históricas em seus escopos.

As 34 provas são 23 cenas, quatro referências de seletor/ações, seis estados e uma folha. Liga e jogo único: 1440/1024/2560/768/390/320; ida/volta: 1440/390/320. Incluem semifinal/final de ambos formatos em390, expansão Liga390/320, artilharia1440/390, vazio, chave pendente, loading/erro, nomes longos320 e BYE/sem histórico na folha. São exports de frames Figma completos, inclusive conteúdo além da primeira viewport; não são capturas do navegador. Somente Light nesta extensão.

Reproduzir máximo1280px, gutters24px tablet/16px mobile, header88/72px, alvos44px e foco2px. Liga: padding16px, gap12px, mínimo72px amplo/136px compacto, posição28px com holder40px, escudo40px, forma24px ampla/20px compacta com gap4px. Em320/390/768, pontos/J/SG e sequência V/E/D precedem expansão das demais estatísticas. Nomes longos e expansão aumentam altura. Acima768px, chave inteira de três fases; em768px e abaixo, uma fase com Quartas/Semifinal/Final completos. Tie: padding16px, gap8px, raio16px, placar32px; mínimo jogo único196px compacto/212px desktop, ida/volta256px compacto/272px desktop. Bracket desktop: padding24px, canal conector40px, gap cards24px, cabeçalho fase40px e gap16px. Calcular conectores pelos centros reais quando conteúdo crescer: Q1+Q2→S1, Q3+Q4→S2, S1+S2→F1. Os mínimos não cortam texto.

Manrope na UI/nomes e Barlow Condensed nos títulos/ênfase numérica mantêm os estilos aprovados. Preservar o JPG oficial integral (`design/assets/cpm-official.jpg`, origem `/mnt/c/Users/essiq/Downloads/cpmlogo.jpg`) e fallback raster `public/escudo-generico.png`. Usar `design/assets/icons/classification-{ball,bell,share,rules,menuDotsH,chevronUp}.svg`: cinco paths originais de `components/icons.tsx`; chevronUp é a geometria Figma existente rotacionada180°. Não substituir por semelhantes. Resolver cores pelo Light: página/header, textos, borda/foco, seleção/hover; conector `classification/bracket-line`→`color/neutral/600`. Manter letras V/E/D e legendas de faixas, incluindo ausência com traços; cor não é o único significado.

`TournamentsScreen.tsx`, `lib/types.ts` e `lib/db.ts` definem seleção, ações existentes e classificação por pontos/saldo; clique abre clube. Top4 e últimos2 quando mais4 equipes são convenções atuais, não regulamento oficial verificado. Formato vem da competição: Liga Tabela/Artilharia, copa Chave/Artilharia. As opções Liga Paulista/Copa Paulista/Taça CPM são demonstrativas; não criar um toggle arbitrário de formato. Favoritos/notificações começam desligados. Preservar compartilhar, regulamento e artilharia. Últimos5 usam V/E/D existentes, sem variação fictícia de posição.

Mata-mata é feature nova: Competition não possui formato/estrutura de chave e Match.stage é texto. Implementação futura exige entidades explícitas de formato, etapas, confrontos estáveis, origem/destino das vagas, pernas e mandantes/visitantes, datas/estados/resultados, agregado, winner explicitamente resolvido, BYE e pendência. MamoBall não tem pênaltis; referências históricas a esse mecanismo são obsoletas. Não inferir chave de stage ou pontos. Ida/volta distingue agregado de resultados individuais e inverte mandante corretamente. Só ida concluída continua parcial; empate sem desempate não resolve winner. Não inventar outro desempate nem inferir vencedor de placar/agregado empatado; BYE avança sem placar inventado; vaga desconhecida usa origem descritiva e traços. Equipes/datas/resultados são fixtures demonstrativos. Loading/erro mostram progresso conhecido da competição selecionada quando disponível; não copiar “Rodada8de14” se a rodada for desconhecida.

Protótipo DISSOLVE120ms: Liga1440/390→seletor/ações; seletor→três competições; Liga↔Artilharia1440/390; fases jogo único/ida-volta390; primeira linha Liga expandir/recolher390/320. Demais tamanhos são estáticos; artilharia de mata-mata e seletor com mata-mata ativo não têm percurso conectado. Ações, clubes, partidas e retry especificam intenção, sem aplicação runtime. Teclado, ARIA, foco/Escape, movimento reduzido, banco e erros exigem implementação e verificação futuras.

Review independente `design/classification-review.md`: **ship** após todas34 capturas finais, sem defeito material ou export inválido. Advisory de densidade vertical Liga768 não bloqueia; reavaliar com uso real se necessário. Não houve detector, browser ou verificação de aplicação. Este merge documental não reabre QA visual. Comparar futura implementação com Figma em viewport, dados, estado, fontes reais e escala idênticos antes de declarar fidelidade; nenhuma aplicação foi modificada nesta etapa.

## Correção definitiva e implementação Home · 2026-10-06

MamoBall não tem pênaltis. Conteúdo divergente em exports/reviews históricos fica preservado somente como registro obsoleto; não implementar campos, resultados ou controles de pênaltis nem regra alternativa não confirmada. Header/Home usam dados públicos reais do Supabase e SVGs/fonts originais. A integração preserva o comportamento existente; captura de fixtures serve à comparação visual, sem dados simulados no app publicado. Não houve deploy.

## Implementação Jogos Light/Dark · 2026-10-06

Jogos está implementado com dados reais, categorias existentes, links únicos de partida, abas com teclado, CTA vazio e retry integrado. Os capítulos Jogos de 2026-10-05 preservam o histórico Figma: suas afirmações sobre integração futura ou aplicação não alterada referem-se àquela etapa. Fontes reais, SVGs originais, logo integral e tokens compartilhados existentes foram reutilizados, sem alteração do sistema global. Ver [registro de implementação](games-implementation/implementation.md), [validação](games-implementation/validation.md), [review](games-implementation/review.md) e [verdict](games-implementation/verdict.md).

Build e ESLint escopado passaram. A captura final do build de produção cobre 20 cenas principais, 18 estados/limites e duas leituras reais, sem erro de página ou overflow. As 20 comparações de conteúdo nativo têm dimensões iguais e diferença média por canal de aproximadamente 0,75–2,26/255; não é identidade de pixels. O review completo solicitou quatro correções, todas resolvidas; o verdict **ship** avalia somente essa lista, sem nova auditoria integral. Não houve nova QA neste merge documental, deploy ou escrita no Supabase. Detalhes de partida e Classificação permanecem na implementação existente.
