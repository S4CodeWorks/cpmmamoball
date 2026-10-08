# Partida Light · native specification · 2026-10-07

The editable Light match-detail specification for `/partida/{number}` is complete. The independent [review](match-review.md) returned **ship** after confirming all three material corrections. This is an ordinary extension of the approved Jogos/Header world. The application retains its incumbent MatchScreen; no implementation, database change or Dark authoring occurred in this task.

## Authority and system comparison

The [direction contract](match-brief.md), [PRODUCT.md](../PRODUCT.md), [DESIGN.md](../DESIGN.md), [final metadata](match-metadata.json), [17 native component/API records](match-components-native.json) and [32 final scene trees](match-scenes-native.json) ground this handoff. Score and club identity lead; goal attribution follows. Official artwork, original reusable SVG icons, flat white/neutral surfaces, purposeful blue, Manrope UI and Barlow Condensed display remain incumbent. The sampled native trees retain semantic paint and dimensional bindings and text-style references; display scores use the existing 80px Wide / 44px Compact treatment. No new global palette, type ramp or rule is introduced.

Wide references use the existing Jogos-active header and bounded 1280px content, with goal groups beside prior encounters and Rodada below. At 320/390/768px the complete scoreboard precedes icon-plus-label Gols/Confrontos/Rodada navigation and one section at a time. Established 16/24/32px responsive gutters, 44px actions and 12px controls/16px surfaces remain. Names wrap and components grow. These six authored compositions are reference widths, not measured browser breakpoints. The final 1024px contextual rail `64:44213` has vertical HUG sizing (368px in the fixture), replacing its earlier fixed 1300px height.

Native pages are Light `63:42506`, Components `63:42507` and Estados `63:42508`. Existing pages and shared symbols remain preserved. Header/official Brand, incumbent generic crest and reused back/bookmark/share/bell/ball/check/trophy/calendar/clock/arrow/user/alert symbols remain native instances. Exact reused IDs and the specialized assist icon `64:42513` are listed in metadata. The generic crest is an illustrative fallback, not a claimed club upload or player photo.

## Native reusable APIs

Use the exact generated property names; the Wide and Compact families have different IDs. Selecting a status does not authorize replacing club identities or fabricating data. Override club name, tag and crest together.

| Family | Native root | Authored API |
| --- | --- | --- |
| Partida / Action | `64:49661` | `Kind=Back/Save/Share/Reminder`; `Layout=Wide/Compact`; `State=Default/Hover/Focus/Selected`. Metadata lists 28 authored masters; this is not every Cartesian combination. |
| Partida / Section tab | `64:49662` | `Kind=Goals/History/Round`; `State=Default/Selected`, six masters. |
| Partida / Scoreboard / Wide | `64:49663` | `Layout=Wide`; `Status=Final/Scheduled/UnknownTime/Live/Draw/WO`, six masters. |
| Partida / Scoreboard / Compact | `64:49664` | `Layout=Compact`; same six status variants. All club-name fields are editable centered native TEXT. |
| Normal goal attribution | `64:42657` | `Nick#64:65`, `Game ID#64:66`, `Attribution#64:67`, `Goals#64:68`, `Show ID#64:69`, `Show assist#64:70`. |
| Own-goal attribution | `64:42678` | `Nick#64:71`, `Game ID#64:72`, `Attribution#64:73`, `Goals#64:74`, `Show ID#64:75`, `Show assist#64:76`. Attribution is “Gol contra”; the inherited Show assist property controls that attribution line, never a credited assist. |
| Goal sections | `64:42862` / `64:42961` | Reusable Wide/Compact goal-group structures; no exposed root properties in the stored API. |
| Confrontos | `64:43029` | Reusable history section; no exposed root properties. |
| Rodada | `64:43098` / `64:43163` | Reusable Wide/Compact round structures; no exposed root properties. |

Scoreboard text/swap properties are recorded below. Lowercase names are intentional.

| Field | Wide exact key | Compact exact key |
| --- | --- | --- |
| Competition | `competition#64:87` | `competition#64:107` |
| Round | `round#64:88` | `round#64:108` |
| Home name | `home#64:89` | `home#64:109` |
| Away name | `away#64:90` | `away#64:110` |
| Home score | `scoreH#64:91` | `scoreH#64:111` |
| Away score | `scoreA#64:92` | `scoreA#64:112` |
| Date | `date#64:93` | `date#64:113` |
| Stage | `stage#64:94` | `stage#64:114` |
| Home crest swap | `Home crest#64:95` | `Home crest#64:115` |
| Away crest swap | `Away crest#64:96` | `Away crest#64:116` |
| Home tag | `Home tag#64:127` | `Home tag#64:141` |
| Away tag | `Away tag#64:134` | `Away tag#64:148` |

Six feedback masters expose Title: Goals `64:42724` / `Title#64:77`; History `64:42731` / `Title#64:78`; Scheduled `64:42739` / `Title#64:79`; WO `64:42746` / `Title#64:80`; Error `64:42754` / `Title#64:81`; Missing `64:42763` / `Title#64:82`. Empty scorer/history records communicate absence rather than inventing statistics.

## Sporting and fixture truth

[Fixtures](match-fixtures.json) are demonstrative presentation data only, never live records or database seeds. Main match #124 uses Aurora FC/AUR versus Atlético Paulista/ATP, 3–1. Normal entries aggregate by credited side and player: Kauan has two goals, with Léo and Biel as the corresponding assist identities. Optional game IDs come from the roster. Rafa belongs to ATP and his own goal credits AUR; keep it separate, explicitly label Gol contra and never credit an assist. Dudu scores for ATP with Vini as assist. Goal records have no minute/timestamp: this grouped attribution is not a chronological event timeline.

Prior encounters include only earlier finalized matches, exclude the current match and use reliable descending dates. The illustrative subset has two AUR wins, one draw and zero ATP wins. It is not a measured live historical total. No history means an empty state, not invented zero statistics. Other-round fixtures keep their own names/tags, including União MamoBall/UMM and Vila Esportiva/VIL.

W.O. displays an explicit stored result; 3–0 is this fixture’s score, not a universal W.O. rule. Unknown scheduled time reads A definir. Live is a status illustration without elapsed time or verified real-time transport. Draw supplies no advancement or replacement tiebreaker. No penalties, goal minutes, cards, possession, shot statistics or player photos were invented.

## Final exports and states

[Preview directory](match-previews/) contains 32 direct root PNG exports, named from node IDs with colon replaced by hyphen. The six additional images are derived contact sheets/cells, not independent native roots or design authority. All 32 direct exports were refreshed after the reviewed corrections; the final scene trees and metadata record those same roots.

| Group / state | Width | Native root / PNG |
| --- | --- | --- |
| Final | 1440 | [64:43164](match-previews/64-43164.png) |
| Final | 390 | [64:43481](match-previews/64-43481.png) |
| Final | 320 | [64:43663](match-previews/64-43663.png) |
| Final | 768 | [64:43845](match-previews/64-43845.png) |
| Final | 1024 | [64:44027](match-previews/64-44027.png) |
| Final | 2560 | [64:44344](match-previews/64-44344.png) |
| Confrontos | 390 | [64:45235](match-previews/64-45235.png) |
| Rodada | 390 | [64:45492](match-previews/64-45492.png) |
| Scheduled | 1440 | [64:45741](match-previews/64-45741.png) |
| Scheduled | 390 | [64:46106](match-previews/64-46106.png) |
| UnknownTime | 390 | [64:46335](match-previews/64-46335.png) |
| Live | 1440 | [64:46564](match-previews/64-46564.png) |
| Live | 390 | [64:46918](match-previews/64-46918.png) |
| Draw | 390 | [64:47137](match-previews/64-47137.png) |
| WO | 1440 | [64:47360](match-previews/64-47360.png) |
| WO | 390 | [64:47718](match-previews/64-47718.png) |
| NoGoals | 390 | [64:47941](match-previews/64-47941.png) |
| NoHistory | 390 | [64:48129](match-previews/64-48129.png) |
| Loading | 1440 | [64:48391](match-previews/64-48391.png) |
| Loading | 390 | [64:48717](match-previews/64-48717.png) |
| Error | 390 | [64:48908](match-previews/64-48908.png) |
| Missing | 390 | [64:49097](match-previews/64-49097.png) |
| Saved | 390 | [64:49287](match-previews/64-49287.png) |
| Copied | 390 | [64:49475](match-previews/64-49475.png) |
| Saved | 1440 | [64:49710](match-previews/64-49710.png) |
| Copied | 1440 | [64:50034](match-previews/64-50034.png) |
| Fixture · Main | 1440 | [64:49665](match-previews/64-49665.png) |
| Fixture · Games | 1440 | [64:51376](match-previews/64-51376.png) |
| Fixture · Main | 390 | [64:50355](match-previews/64-50355.png) |
| Fixture · Games | 390 | [64:51586](match-previews/64-51586.png) |
| Fixture · Past | 390 | [64:50410](match-previews/64-50410.png) |
| Fixture · Other | 390 | [64:51236](match-previews/64-51236.png) |

## Prototype and implementation boundary

The metadata records 42 stored fixture reactions. This documentation pass verified every source node appears in the final native scene trees and every destination resolves to one of the 32 roots. Wide and Compact main fixtures demonstrate Back to illustrative Jogos, save/unsave and copied-link feedback; Compact fixtures also switch Gols/Confrontos/Rodada and open matching prior/other-game details. These are finite synthetic navigation paths. Reminder specimens communicate intent without proving notification permission or delivery; club/player destinations, retry and real share remain implementation responsibilities. Static focus/hover specimens are not keyboard execution evidence.

The prototype performs no real persistence, match query, clipboard/share, reminder or sporting-data update. Native references and PNGs do not establish browser responsiveness, accessible names, keyboard focus/order, ARIA, touch behavior, reduced-motion handling or WCAG conformance. Implement and verify these with real data and controls in a later application task. No Dark match counterpart or site implementation was authored this turn.

## Review, evidence and preservation

The [final independent review](match-review.md) resolves other-match tag attribution, Compact club-name focal grouping and the 1024px blank contextual gulf. [Fix verification](match-fix-verification.json) identifies twelve centered editable Compact name replacements, exposed Home/Away tags on both scoreboard families and the rail correction. The final metadata rekeys the real properties and references the replacement native TEXT nodes. No material fixes remain. The review is acceptance of the native Light artifact and its three corrections, not runtime verification.

This documentation pass read the shipped documenter instructions and full document reference, direction/product/design records, fixtures, final review/fix record, metadata and final native component/scene snapshots; it sampled the final contact overview and checked direct-export presence and all 42 source/destination references. It did not repeat the independent visual review or mutate Figma. The prior system’s frontmatter, `.impeccable/design.json`, token CSS and unrelated records are preserved. Existing application/Figma differences and pre-existing system drift are outside this ordinary extension; they are neither repaired nor canonized as new rules.
