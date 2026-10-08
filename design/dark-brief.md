# CPM MamoBall · extensão dark

## Intenção e escopo

Modo da superfície: **Operate**. A extensão dark mantém a identidade CPM arredondada, mínima e esportiva, com leitura rápida de jogos, resultados e classificação. Light permanece a apresentação principal. Dark é uma alternativa de apresentação para todas as telas e estados já aprovados no Figma, preservando conteúdo, hierarquia, geometria, fluxo e regras de favoritos.

Esta etapa é exclusivamente de design no Figma. O brief registra a direção e os artefatos dark agora autorados. IDs e bindings finais estão em `design/dark-metadata.json`; capturas estão em `design/dark-previews-final/`. O review independente retornou ship no escopo das capturas finais e a aplicação não foi implementada nesta etapa.

## Hierarquia e superfícies

Construir profundidade por camadas tonais: página escura, header ligeiramente elevado, cards distinguíveis e menus com superfície própria. Placares, datas e equipe aprovada continuam conduzindo o destaque. A cor azul identifica ação, seleção e agenda; não substitui rótulos, ícones nem diferenças de peso tipográfico.

| Papel | Cor dark |
| --- | --- |
| Página | `#0C1017` |
| Header | `#111824` |
| Card | `#151E2B` |
| Menu/popover | `#1E2B3D` |
| Superfície sutil | `#202D40` |
| Borda sutil | `#33445B` |
| Texto principal | `#EDF2F9` |
| Texto secundário | `#B8C4D6` |
| Ação principal / texto sobre ação | `#7BAAFF` / `#0B1628` |
| Hover da ação | `#9BBEFF` |
| Seleção / texto selecionado | `#203F6A` / `#C5DCFF` |
| Resultado / linha interna / suporte de escudo | `#12223A` / `#355174` / `#203856` |
| Próximo jogo / texto principal | `#18355C` / `#D6E7FF` |
| Próximo jogo: horário / texto secundário | `#9DC3FF` / `#B7D5FF` |
| Próximo jogo: suporte de escudo / linha interna | `#284B77` / `#385D89` |

Texto e ícones de ações preenchidas acompanham o papel `action-ink`; texto e ícones de destaque usam a tinta de seu contexto. Preservar caminhos, viewBox, caps, joins e espessuras dos SVGs originais. Aplicar a cor sem trocar a geometria por outra biblioteca. O suporte tonal dos escudos é parte da composição, não alteração de marca de um clube.

## Marca e tipografia

Manrope permanece a fonte de interface, leitura, datas, navegação e estados; Barlow Condensed permanece a fonte de marca, títulos esportivos e placares. Preservar os estilos, pesos e entrelinhas existentes: Manrope Caption 12/16 regular, Label 14/20 medium, Body 16/24 regular e Body Strong 16/24 semibold; Barlow Condensed Brand 24/28 semibold, Section 28/32 semibold, Title 32/40 semibold, Score 80/80 bold e Score Compact 44/48 bold.

A logo JPG oficial permanece integral, com proporções e branco original. Usar o arquivo existente em `design/assets/cpm-official.jpg`; não inventar uma versão inversa, transparente, recolorida ou redesenhada. A região branca original faz parte do asset e deve continuar visível no tema dark.

## Geometria preservada

Manter a escala de espaçamento de 4 px, os gaps e paddings aprovados e os raios 8/12/16 px. Controles continuam com mínimo de 44 px, ícones de interface com 20 px e foco com 2 px. Header desktop mantém 88 px; compacto/tablet/mobile mantém 72 px. Conteúdo máximo mantém 1280 px; gutters móveis de 16 px e tablet de 24 px seguem a referência aprovada.

Preservar auto-layout, alinhamento `SPACE_BETWEEN` do header, hug/fill, quebras de nomes, crescimento dos cards e ordem responsiva. O tema não acrescenta sombras globais nem altera o efeito localizado do popover: preservar a referência original de 8 px de deslocamento vertical e 24 px de blur. Não introduzir um novo heading/subtítulo genérico na home.

## Estados e contraste

Aplicar papéis semânticos aos estados default, hover, active/selected, focus, disabled, loading, empty e error existentes. Seleção mantém preenchimento, peso e sinalização; foco mantém contorno reconhecível. Estado disabled deve continuar distinguível por comportamento e aparência. Erro, confirmação e seleção mantêm palavras e ícones para não depender apenas de cor.

O objetivo continua WCAG 2.2 AA: avaliar pares de texto/fundo e ícone/fundo no contexto real, incluindo texto de ação, horários, seleção, focus e menus. Bordas sutis de separação não substituem a indicação de controles ou foco. Os cálculos de contraste informados pelo autor estão registrados em `DESIGN.md`; não constituem declaração de conformidade. A interação de teclado deverá ser verificada na futura implementação.

## Figma e fidelidade

Usar coleções Light/Dark pareadas porque o plano Starter admite um único mode por coleção. Aplicar papéis equivalentes com bindings dark, preservando as variáveis dimensionais e os estilos de texto compartilhados. Os aliases dark anteriores são contexto histórico e devem ser reconciliados com os valores efetivamente entregues, sem alterar os primitives light para simular troca de tema.

As fontes de verdade seguem sendo as telas aprovadas, componentes originais e `design/fidelity-handoff.md`. A extensão deve cobrir os layouts 1440, 1024, 2560, 768, 390 e 320 px existentes, interações e variantes. Sem favoritos, o seletor determina partidas/classificação; com favoritos, o seletor fica ausente, listas mesclam competições e classificação identifica a primeira favorita. Aprovação continua exclusiva do ramo com favoritos e usa contexto não interativo de competições salvas.

Para implementar depois, reproduzir literalmente dimensões, espaçamento, cores por papel, fontes reais, SVGs e estados. Comparar capturas de mesmo viewport, dados e estado com as exportações Figma. Não declarar fidelidade, funcionamento do tema no navegador ou acessibilidade antes das respectivas verificações.


## Registro do artefato entregue para review

Metadata: `design/dark-metadata.json`. São sete páginas dark, 54 componentes em 22 famílias raiz e 35 telas/estados. O sistema registra 81 primitives, 29 aliases Light e 37 Dark; os valores dark anteriores são histórico, não a paleta atual. O componente de sol `8:16187` possui exportação `design/assets/icons/8-16187.svg` com 20 px, stroke 1.7 px e binding `menu/icon-color` Dark.

As 96 entradas de reactions rebaseadas preservam referências dark de seletor/More. **Tema claro** é uma ação pretendida, com troca completa entre temas ainda fora do protótipo demonstrado. Review visual independente: ship para as 36 capturas finais (35 telas/estados e Foundations), sem problemas materiais ou falhas de validade observadas; registro em `design/dark-review.md`. Implementação web, teclado/ARIA e busca dinâmica não executados por esta entrega Figma.
