# Partida Dark · native handoff · 2026-10-07

The editable Dark counterpart of approved Partida Light is complete. The independent [finish review](match-dark-review.md) returned **ship**, with no material fixes pending after reviewing all 32 direct root PNGs. This ordinary Operate theme extension preserves the Light composition and sports contract. Application MatchScreen and database behavior remain incumbent.

## Artifact and provenance

Three new pages: Partida Dark `65:51833`, Components `65:51834`, Estados `65:51835`. [Metadata](match-dark-metadata.json) maps six main scenes, 20 states and six prototype roots to their Light sources. The [32 native scene trees](match-dark-scenes-native.json) are the stored editable source snapshots; [18 component/API records](match-dark-components-native.json) describe cloned Dark roots, comprising four component sets and 14 standalone masters. The original Light pages and components are preserved.

[Preview directory](match-dark-previews/) contains 32 direct native root PNGs and four derived contact overviews. Every direct PNG exists and its header width matches its stored root. The independent reviewer reopened Scheduled and NoHistory original detail to resolve presentation/caching discrepancies; no native omission was found. Contacts are navigation aids, not independent native captures.

## Native system and component reuse

The incumbent semantic Dark page/header/card/subtle layers, soft white foreground, secondary blue-gray, pale blue action with dark ink, navy selection and bright focus replace Light paints. Root page resolves #0C1017; header resolves #111824. Scoreboard, goals, history and round containers use the existing card role. No new global token, palette primitive, font or component geometry is introduced.

Barlow Condensed scores/section headings and Manrope identity/UI remain; bounded 1280px content, six widths (320/390/768/1024/1440/2560), 44px actions and 12px/16px corners remain inherited. Native compact club names stay centered editable TEXT across the six scoreboard statuses; the 1024px contextual rail retains HUG height. Original JPG brand artwork stays integral on its rounded native white tile (8px/12px treatments), retaining logo proportions. Crests and shared icon/header assets remain native reuse.

Scene actions, scoreboards and goal/history/round roots use their own cloned Dark masters. Nested shared components retain semantic Dark overrides, original properties and geometry. Dimensional semantic bindings preserve measured layout. Exact property names and defaults, including inherited numeric property suffixes, remain authoritative in the API JSON:

| Root | Native master | Exposed API |
| --- | --- | --- |
| `65:52308` | Partida / Action · Dark | Kind=Back/Save/Share/Reminder; Layout=Wide/Compact; State=Default/Hover/Focus/Selected |
| `65:52447` | Partida / Section tab · Dark | Kind=Goals/History/Round; State=Default/Selected |
| `65:52480` | Partida / Scoreboard / Wide · Dark | competition=TEXT; round=TEXT; home=TEXT; away=TEXT; scoreH=TEXT; scoreA=TEXT; date=TEXT; stage=TEXT; Home crest=INSTANCE_SWAP; Away crest=INSTANCE_SWAP; Home tag=TEXT; Away tag=TEXT; Layout=Wide; Status=Final/Scheduled/UnknownTime/Live/Draw/WO |
| `65:52702` | Partida / Scoreboard / Compact · Dark | competition=TEXT; round=TEXT; home=TEXT; away=TEXT; scoreH=TEXT; scoreA=TEXT; date=TEXT; stage=TEXT; Home crest=INSTANCE_SWAP; Away crest=INSTANCE_SWAP; Home tag=TEXT; Away tag=TEXT; Layout=Compact; Status=Final/Scheduled/UnknownTime/Live/Draw/WO |
| `65:52924` | Kind=Goal · Dark | Nick=TEXT; Game ID=TEXT; Attribution=TEXT; Goals=TEXT; Show ID=BOOLEAN; Show assist=BOOLEAN |
| `65:52945` | Kind=OwnGoal · Dark | Nick=TEXT; Game ID=TEXT; Attribution=TEXT; Goals=TEXT; Show ID=BOOLEAN; Show assist=BOOLEAN |
| `65:52965` | Partida / Gols / Wide · Dark | Container/icon; nested editable content |
| `65:53063` | Partida / Gols / Compact · Dark | Container/icon; nested editable content |
| `65:53161` | Partida / Confrontos · Dark | Container/icon; nested editable content |
| `65:53228` | Partida / Rodada / Wide · Dark | Container/icon; nested editable content |
| `65:53291` | Partida / Rodada / Compact · Dark | Container/icon; nested editable content |
| `65:53350` | Kind=Goals · Dark | Title=TEXT |
| `65:53357` | Kind=History · Dark | Title=TEXT |
| `65:53363` | Kind=Scheduled · Dark | Title=TEXT |
| `65:53370` | Kind=WO · Dark | Title=TEXT |
| `65:53376` | Kind=Error · Dark | Title=TEXT |
| `65:53383` | Kind=Missing · Dark | Title=TEXT |
| `65:53391` | Icon / assist · Dark | Container/icon; nested editable content |

## Scenes and states

Wide preserves score-first club identity, grouped goal attribution, contextual prior encounters and Rodada below. Compact preserves the complete scoreboard before Gols/Confrontos/Rodada navigation. Scheduled, unknown time, live, draw, W.O., missing goals/history, loading, recoverable error, missing match, saved and copied references preserve approved Light content.

| Root | Native scene | Width | Direct export |
| --- | --- | --- | --- |
| `65:51836` | Partida · Dark · Final · 1440 | 1440 | [PNG](match-dark-previews/65-51836.png) |
| `65:53670` | Partida · Dark · Final · 390 | 390 | [PNG](match-dark-previews/65-53670.png) |
| `65:54009` | Partida · Dark · Final · 320 | 320 | [PNG](match-dark-previews/65-54009.png) |
| `65:54348` | Partida · Dark · Final · 768 | 768 | [PNG](match-dark-previews/65-54348.png) |
| `65:54687` | Partida · Dark · Final · 1024 | 1024 | [PNG](match-dark-previews/65-54687.png) |
| `65:55279` | Partida · Dark · Final · 2560 | 2560 | [PNG](match-dark-previews/65-55279.png) |
| `65:55871` | Partida · Dark · Confrontos · 390 | 390 | [PNG](match-dark-previews/65-55871.png) |
| `65:56148` | Partida · Dark · Rodada · 390 | 390 | [PNG](match-dark-previews/65-56148.png) |
| `65:56409` | Partida · Dark · Scheduled · 1440 | 1440 | [PNG](match-dark-previews/65-56409.png) |
| `65:56830` | Partida · Dark · Scheduled · 390 | 390 | [PNG](match-dark-previews/65-56830.png) |
| `65:56998` | Partida · Dark · UnknownTime · 390 | 390 | [PNG](match-dark-previews/65-56998.png) |
| `65:57166` | Partida · Dark · Live · 1440 | 1440 | [PNG](match-dark-previews/65-57166.png) |
| `65:57760` | Partida · Dark · Live · 390 | 390 | [PNG](match-dark-previews/65-57760.png) |
| `65:58101` | Partida · Dark · Draw · 390 | 390 | [PNG](match-dark-previews/65-58101.png) |
| `65:58256` | Partida · Dark · WO · 1440 | 1440 | [PNG](match-dark-previews/65-58256.png) |
| `65:58664` | Partida · Dark · WO · 390 | 390 | [PNG](match-dark-previews/65-58664.png) |
| `65:58819` | Partida · Dark · NoGoals · 390 | 390 | [PNG](match-dark-previews/65-58819.png) |
| `65:58976` | Partida · Dark · NoHistory · 390 | 390 | [PNG](match-dark-previews/65-58976.png) |
| `65:59131` | Partida · Dark · Loading · 1440 | 1440 | [PNG](match-dark-previews/65-59131.png) |
| `65:59203` | Partida · Dark · Loading · 390 | 390 | [PNG](match-dark-previews/65-59203.png) |
| `65:59253` | Partida · Dark · Error · 390 | 390 | [PNG](match-dark-previews/65-59253.png) |
| `65:59307` | Partida · Dark · Missing · 390 | 390 | [PNG](match-dark-previews/65-59307.png) |
| `65:59363` | Partida · Dark · Saved · 390 | 390 | [PNG](match-dark-previews/65-59363.png) |
| `65:59706` | Partida · Dark · Copied · 390 | 390 | [PNG](match-dark-previews/65-59706.png) |
| `65:60049` | Partida · Dark · Saved · 1440 | 1440 | [PNG](match-dark-previews/65-60049.png) |
| `65:60645` | Partida · Dark · Copied · 1440 | 1440 | [PNG](match-dark-previews/65-60645.png) |
| `65:61241` | Partida · Demo · Final · 1440 · Dark | 1440 | [PNG](match-dark-previews/65-61241.png) |
| `65:61833` | Jogos · Resultados → Partida · Demo · 1440 · Dark | 1440 | [PNG](match-dark-previews/65-61833.png) |
| `65:62029` | Partida · Demo · Final · 390 · Dark | 390 | [PNG](match-dark-previews/65-62029.png) |
| `65:62368` | Jogos · Resultados → Partida · Demo · 390 · Dark | 390 | [PNG](match-dark-previews/65-62368.png) |
| `65:62541` | Partida · Demo · Confronto anterior · 390 · Dark | 390 | [PNG](match-dark-previews/65-62541.png) |
| `65:62698` | Partida · Demo · Outro jogo · 390 · Dark | 390 | [PNG](match-dark-previews/65-62698.png) |

## Fixture navigation and sporting truth

[Stored native prototype evidence](match-dark-prototype-native.json) records 42 actual ON_CLICK reactions; every stored destination matches its intended metadata target. Native navigation is rebased within Dark and uses inherited 180ms dissolve/ease-out transitions. Fixtures demonstrate section selection, save/copied feedback, Jogos return and matching prior/other-game details. This document checked the records; it does not claim runtime playback verification.

[Fixture data](match-fixtures.json) is illustrative, not live sporting data or database seeds. Goal rows group by credited club and player without chronology. Optional assists apply to normal goals; opposing-roster Rafa remains explicitly Gol contra, credited to Aurora without an assist. Prior history excludes this match and uses finalized dated encounters; absent history remains an explicit empty state. W.O. preserves stored scores. There are no penalties, goal minutes, cards, elapsed timer, possession, invented tiebreakers or player photos.

## Validation and limits

The [native audit](match-dark-native-audit.json) covers all 32 source trees and records zero content/text differences, remaining visible Light paints or geometry/visibility/clipping/alignment differences. This is stored native comparison evidence, not browser certification. [Opaque contrast evidence](match-dark-contrast.json) records primary/card 14.91, secondary/card 9.51, secondary/subtle 7.88, selected 7.60, action 7.79 and blue/card 7.21; blue on selected is 4.56. All seven measured pairs exceed 4.5:1.

No application implementation, database write or deployment occurred. Real queries, save persistence, clipboard/share, reminders, live transport and browser keyboard/ARIA/touch/reduced-motion/responsive behavior require implementation and verification. The native visual review certifies only its recorded design scope.

## Documentation boundary

This bounded pass read the shipped documenter definition and document reference, incumbent product/design and Light/Dark briefs, fixtures, final review, metadata and scene/component/prototype/audit/contrast snapshots. It checked the 32 direct PNG widths and all 42 recorded reaction targets. It did not repeat the visual review or mutate Figma/source. Only this handoff plus targeted Partida Dark status additions in PRODUCT.md and DESIGN.md were written; normative frontmatter, `.impeccable/design.json`, token CSS and Light history remain preserved. Historical future-Dark statements remain scoped records, superseded by current Dark status. Pre-existing app/native divergence and general documentation drift are outside this extension and were neither repaired nor canonized.
