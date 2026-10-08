# Classificação · implementação · 2026-10-06

A aba Classificação está implementada na aplicação em claro/escuro. A evidência real de navegador mostra a competição `serie b teste`, três clubes e classificação de liga. O suporte a mata-mata tem modelo configurável e resolver implementados; não há competição mata-mata ativa no banco verificado nem captura real da chave. Este registro documenta a implementação e os resultados recebidos da execução; não repete os testes nem cria nova revisão visual.

## Referências e autoridade

O Figma nativo permanece referência visual separada: [metadata](../classification-metadata.json), [tokens de Classificação](../classification-tokens.json), [tokens compartilhados](../tokens.json) e [34 exports finais](../classification-previews-final/). As páginas de referência são telas `21:24107`, componentes `21:24108` e estados `21:24109`; os sets são Form `21:24118`, League row `21:24439` e Tie `21:24673`.

A [revisão histórica](../classification-review.md) aceita apenas o artefato Figma. Ela permanece inalterada e contém referências obsoletas a pênaltis. A correção definitiva do usuário e [PRODUCT.md](../../PRODUCT.md) prevalecem: MamoBall não tem pênaltis, campos/UI/lógica de pênaltis nem critério substituto inventado de desempate. Empates não resolvem vencedor. Nenhum dado ilustrativo Figma foi semeado no banco para produzir evidência de implementação.

[DESIGN.md](../../DESIGN.md) registra o mundo visual e os links/status atuais. Os exports Figma representam fixtures e composições nativas, enquanto as capturas em [.impeccable/review](../../.impeccable/review/) representam a aplicação real. A aceitação Figma não demonstra integração de banco ou chave ativa.

## Comportamento implementado

A competição selecionada define o formato: `league` usa Tabela/Artilharia; `knockout_single` e `knockout_two_leg` usam Chave/Artilharia. O seletor lê competições reais, sem toggle arbitrário de formato para o torcedor. O contexto mostra nome/edição/formato e a rodada da competição; não herda “Rodada 8 de 14” das fixtures Figma. Ações continuam conectadas a favoritos, preferências de notificações, compartilhar e regulamento. Isso preserva o comportamento existente; ativar uma preferência não é prova de entrega de notificações externas.

Liga ordena por pontos decrescentes, saldo de gols decrescente e índice anterior da lista como ordem estável. O terceiro termo preserva a ordem recebida, sem definir outro critério esportivo. A tabela ampla expõe J/V/E/D/GP/GC/SG e cinco resultados; a compacta prioriza posição, escudo, clube, pontos, J/SG e V/E/D, com expansão das estatísticas restantes. O nome do clube abre seu destino existente. Traços representam ausência de resultado; rótulos e nomes acessíveis não dependem apenas da cor.

As faixas são convenções atuais, não regulamento oficial verificado: primeiros quatro somente quando há ao menos quatro registros; últimos dois somente quando há mais de quatro, com precedência da faixa dos primeiros quatro na marcação das linhas. As legendas nomeiam as convenções. A liga real verificada tem três clubes e não aplica essas faixas. Não inferir playoffs/rebaixamento para essa amostra nem alegar que todas as cardinalidades foram verificadas visualmente.

Artilharia usa os dados existentes e destinos de clube, com pódio e lista conforme a quantidade disponível. Há estados de ausência de competição, tabela/artilharia vazias, chave ainda não configurada, loading e erro com retry. Tabs usam `tablist`, `tab`, `tabpanel`, seleção e foco com setas/Home/End; expansão tem nome acessível e estado expandido. Transições de troca/expansão usam 120ms e respeitam movimento reduzido no código. Existência desses estados no código não equivale a capturas reais de todos eles.

## Arquitetura e apresentação

- [ClassificacaoScreen.tsx](../../components/screens/ClassificacaoScreen.tsx) implementa seleção, tabs, liga, artilharia, chave e ações. [TournamentsScreen.tsx](../../components/screens/TournamentsScreen.tsx) re-exporta a tela para manter o ponto de integração existente.
- [lib/db.ts](../../lib/db.ts) lê competições/classificação/artilharia/jogos/chave e fornece CRUD dos confrontos; [lib/types.ts](../../lib/types.ts) define `CompetitionFormat` e `BracketTie`. O formato ausente é tratado como liga. A competição ativa reutiliza os dados do DataContext; outras competições são consultadas pelo ID. Leitura de jogos/chave é condicionada a mata-mata. Respostas canceladas não substituem uma seleção posterior; retry renova a carga local.
- [lib/bracket.ts](../../lib/bracket.ts) é o resolver determinístico, separado da apresentação e do banco. Ele usa vínculos explícitos e resultados armazenados; não tenta deduzir a chave a partir de Match.stage.
- [AdminScreen.tsx](../../components/screens/AdminScreen.tsx) permite escolher o formato; [AdminBracketManager.tsx](../../components/screens/AdminBracketManager.tsx) permite à equipe cadastrar/editar/excluir fases e confrontos, equipes ou vencedores anteriores, BYE e vínculos a jogos reais. A presença desse editor no código não é comprovação de um fluxo staff completo exercitado contra uma copa ativa.
- [app/cpm.css](../../app/cpm.css) contém a geometria escopada; [app/cpm-tokens.css](../../app/cpm-tokens.css) fornece os papéis Light/Dark e dimensões compartilhadas. Manrope/Barlow Condensed, JPG oficial integral, raster de escudos e SVGs originais são preservados. As fontes reais são self-hosted em [public/fonts/cpm-fonts.css](../../public/fonts/cpm-fonts.css); os exports de Classificação são servidos em `public/cpm-icons/classification-*.svg`.

A liga usa tabela ampla a partir de 960px e composição compacta abaixo de 960px. O container tem máximo1280px; gutters24px entre769–959px e16px em768px e abaixo. Em320px, o CSS reduz padding interno e usa escudo36px para preservar conteúdo e controles. Essas adaptações existentes no código distinguem a implementação das medidas gerais do Figma; não substituir as evidências browser por uma alegação de equivalência de pixels de fixtures diferentes.

O ramo de chave mostra uma fase por vez até768px; acima disso, renderiza fases em colunas. Cards usam mínimos196/256px compactos e212/272px no bracket, com crescimento de conteúdo. Conectores medem o centro do card de origem e o slot de destino e acompanham ResizeObserver/redimensionamento. Essa arquitetura foi inspecionada no código; sem copa ativa, não há evidência visual browser desses conectores, fases ou geometria de chave real.

## Chave e verdade esportiva

A chave configurável registra competição, ordem/nome de fase, ordem de confronto, slots por clube ou confronto anterior, BYE e IDs de partidas de ida/volta. O resultado só usa jogo `finalizado` com ambos os placares disponíveis e equipes compatíveis com os slots. Em ida/volta, somar por identidade do clube preserva o mandante/visitante mesmo quando o retorno inverte a ordem. Ida concluída sem volta finalizada produz agregado parcial, sem avanço.

Empate em jogo único ou no agregado completo fica pendente, com vencedor nulo; não há pênaltis, gol fora ou regra substituta. BYE avança somente a equipe explicitamente inserida e não fabrica placar. Slots dependentes aguardam um vencedor válido do confronto anterior. Jogos incompatíveis e referências cíclicas recebem tratamento inválido/pendente; isso é comportamento de código inspecionado, não uma lista de casos todos exercitados no navegador.

O smoke determinístico reportado verificou:

1. Ida/volta com mandantes invertidos soma os gols dos clubes corretos.
2. Empate mantém vaga pendente e não avança vencedor.
3. BYE leva somente a equipe inserida.
4. Jogo não finalizado não avança equipe.

São testes do resolver com entradas controladas; não são dados esportivos reais nem evidência visual de copa. Não há log/suite persistido citado para esse smoke neste registro; o resultado foi recebido da execução da implementação.

## Banco e permissões

O CPM Supabase recebeu somente a migração/schema aditivo da chave. [classification_bracket.sql](../../supabase/classification_bracket.sql) adiciona `competitions.classification_format` com default `league` e a tabela `competition_bracket_ties`, vínculos/constraints/índices e políticas. [classification_bracket_permissions.sql](../../supabase/classification_bracket_permissions.sql) restringe privilégios automáticos e registra índices complementares.

RLS está habilitada e forçada na tabela de chave. `anon` tem apenas SELECT. `authenticated` recebe privilégios SELECT/INSERT/UPDATE/DELETE, mas a política de escrita exige `profiles.role = 'staff'` para o usuário autenticado, tanto no acesso quanto no novo registro. Leitura pública permanece permitida; authenticated sem staff não recebe autorização de escrita pela política. O SQL foi inspecionado nesta documentação; a aplicação da migração/permissões no CPM foi reportada pela execução, sem nova consulta remota neste passe.

Não houve semeadura, criação de copa demonstrativa nem alteração de equipes, partidas ou resultados existentes. O formato default de liga é parte da adição de schema às competições existentes. A base verificada continua sem competição mata-mata ativa, o que limita a validação de interface e de escrita staff sobre uma chave real.

## Evidência de navegador

Capturas reais verificadas por existência e dimensões de PNG neste passe documental:

| Viewport | Claro | Escuro |
| --- | --- | --- |
| 1440×1000 | [desktop.png](../../.impeccable/review/desktop.png) | [desktop-dark.png](../../.impeccable/review/desktop-dark.png) |
| 1920×1080 | [ultrawide.png](../../.impeccable/review/ultrawide.png) | [ultrawide-dark.png](../../.impeccable/review/ultrawide-dark.png) |
| 820×1024 | [tablet-compact.png](../../.impeccable/review/tablet-compact.png) | [tablet-compact-dark.png](../../.impeccable/review/tablet-compact-dark.png) |
| 768×1024 | [tablet.png](../../.impeccable/review/tablet.png) | [tablet-dark.png](../../.impeccable/review/tablet-dark.png) |
| 390×844 | [mobile.png](../../.impeccable/review/mobile.png) | [mobile-dark.png](../../.impeccable/review/mobile-dark.png) |
| 320×740 | [narrow-mobile.png](../../.impeccable/review/narrow-mobile.png) | [narrow-mobile-dark.png](../../.impeccable/review/narrow-mobile-dark.png) |

A [expansão mobile](../../.impeccable/review/mobile-expanded.png) fornece uma referência adicional em390×844. Os resultados browser recebidos reportam ausência de overflow e erros nos seis tamanhos em ambos os temas, e verificação de tabs por teclado, ações e mudança de tema. A competição real exibida é `serie b teste`, com três clubes e liga. Essas capturas não comprovam chave mata-mata ativa, todos os estados de erro/empty, todas as cardinalidades da liga ou acessibilidade exaustiva. Este passe apenas verificou arquivos/dimensões e leu o código; não reabriu QA visual ou navegador.

## Validação final e limites

Resultados recebidos da execução desta implementação:

- `tsc --noEmit`: passou.
- `next build --webpack`: passou em cópia temporária isolada; não representa uma publicação/deploy.
- ESLint focado nos três arquivos da implementação: sem erros, uma warning preexistente de `<img>` da logo oficial do header. Não atribuir esse resultado a lint completo do repositório.
- Browser: seis viewports acima em claro/escuro, sem overflow/erros, tabs teclado, ações e tema.
- Resolver: smoke determinístico dos quatro casos descritos, sem uso de copa real do banco.
- Reviewer Impeccable final: resultado recebido **ship; nenhuma correção material pendente**. Não há relatório final persistido citado; [classification-review.md](../classification-review.md) é outro parecer, histórico e Figma-only.

Este registro não afirma fidelidade exata por sobreposição entre fixtures Figma e dados reais diferentes, certificação WCAG completa, validação visual de uma chave real, entrega de notificações externas, teste end-to-end de todo CRUD staff ou novo deploy. A futura competição mata-mata ativa exigirá verificação própria de dados, vínculos e interface, incluindo fases, conectores, nomes longos e resultados pendentes nos dois temas.
