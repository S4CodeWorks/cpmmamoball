# Jogos · Dark

> Current status · 2026-10-06: Jogos is implemented in the real site in Light and Dark. [Implementation record](games-implementation/implementation.md) covers actual data/navigation/retry behavior, production browser evidence and the four-fix ship verdict. The original Figma brief below preserves its design-stage wording, fixtures and prototype boundaries; statements about future wiring or unchanged application describe that historical stage.

Modo: Operate. Extensão do Jogos Light aprovado, com o sistema dark aprovado da Home. Mesma tipografia Manrope e Barlow Condensed, mesmas medidas e ícones SVG originais, mesmos assets de marca e escudos, sem novas funcionalidades ou mudança de conteúdo.

## Direção

Página #0C1017, header #111824, cards #151E2B, suporte sutil #202D40, seleção #203F6A e tinta #C5DCFF. Horários e foco #7BAAFF; texto principal #EDF2F9 e secundário #B8C4D6. Profundidade tonal, sem novas sombras. Usar aliases Dark pareados, preservando os primitives dimensionais e estilos compartilhados.

## Cobertura e verdade do produto

10 telas principais: Hoje em 1440/1024/2560/768/390/320; Próximos e Resultados em 1440/390. Oito telas de estados/limites e uma folha de interação, total 19 capturas finais. 20 variantes nativas em duas famílias de componentes dark. Geometria e fixtures idênticas ao Jogos Light; placares/datas/equipes são demonstrativos. Ver games-brief.md para regras de dados atuais.

Hoje mantém agendados cuja data começa com Hoje, Próximos demais agendados, Resultados finalizados agrupados por rodada decrescente. Contexto de competição não interativo. Não adicionar live, busca de lista ou filtros. Erro/retry é especificação para futura integração da tela com o erro do DataContext.

## Protótipo e limites

Troca das três abas nos frames 1440/390 na mesma página, dissolve 120 ms ease-out. Outros tamanhos são referências estáticas. Card representa uma única navegação para detalhe; detalhe não desenhado nesta etapa. CTA vazio Ver próximos jogos é intenção para o site, sem ligação cross-page no protótipo. Troca integral de light/dark, teclado/ARIA e comportamento no navegador não verificados. App não alterado.

## Fonte de verdade

Metadata games-dark-metadata.json, capturas games-dark-previews-final e review games-dark-review.md. Pass1 é histórico, não referência para implementação. Light e Home Dark preservados. Cinco aliases dimensionais novos em Dark, mesmos valores 112/52/72/56/20px; nenhuma cor nova. Exigir fidelidade a geometry, componentes, fontes, cores e SVGs, usando dados/viewport/estado idênticos na implementação.


## Handoff final

Review independente **ship** após inspeção das 19 capturas finais e comparação com Jogos Light e Home Dark; nenhum defeito material nem captura inválida. Disabled opcional se aproxima de Hover e exige aparência/semântica distintas se entrar num fluxo real; não bloqueia as cenas principais. Não houve nova rodada de QA neste fechamento documental.

Páginas: componentes `15:19337`, telas `15:19338`, estados `15:19339`. Famílias de abas `15:19340` e partidas `15:19416`, dez variantes cada; folha de interação `15:22080`, nota de fixtures `15:22215`. Contagem atual: 85 primitives, 34 aliases Light e 42 Dark, total 161. Aliases Dark: horário `VariableID:15:19687`, aba `VariableID:15:19688`, aba mobile `VariableID:15:19689`, marcador `VariableID:15:19690`, padding vertical `VariableID:15:19691`. Todos reutilizam primitives existentes.

Geometria: conteúdo máximo 1280px; gutters mobile/tablet 16/24px; header 88/72px; cards amplos 24px horizontal/20px vertical, compactos 16px e gaps 12px; raio 16px; horário 112px, marcador 56px, abas 52/72px e foco 2px. JPG oficial com branco original, escudo raster e paths SVG preservados. Loading/erro não mostram contagens desconhecidas, vazio mostra zero e horário ausente mostra A definir.

Evidência técnica informada pelo autor: 22 raízes Dark sem bindings Light visíveis; amostra de duas cenas/dois sets Light sem bindings Dark inesperados. Contrastes principal/card 14.91:1, secundário/card 9.51:1, seleção 7.60:1, horário/célula 4.56:1, horário/card 7.21:1, tinta/ação 7.79:1. Review visual não repetiu cálculos/bindings nem verificou runtime. `DESIGN.md`, `.impeccable/design.json` e `design/fidelity-handoff.md` registram a extensão preservando o histórico aprovado.
