# Home top design brief

## Approved surface and mode
Operate. Design in Figma directly below the approved CPM header, using the established rounded, minimal light black/white/blue system. The user explicitly approved the preceding home-highlight plan. This is a Figma-first extension of that system; no new visual-world workshop or raster comp approval is needed.

## First viewport
Competition toolbar without a generic “Visão geral” heading or explanatory subtitle, above a strong event highlight; compact named-competition standings beside it on desktop. Results prioritize the score, upcoming games prioritize date/time, and approvals prioritize the team. Upcoming and recent match lists follow. No automatic carousel, marketing hero or unrelated metrics. The header is a reusable instance of the approved component.

## Existing product behavior retained
One chosen featured event. Recent result and approval compete by recency within 48h; result wins exact ties. Otherwise next scheduled match, then last historical result, then no highlight. Approval data is available only for favorited competitions. Multiple favorites merge match lists; standings belong to the first favorite and must name that competition. Live status does not currently enter highlight selection. News and subscription flows remain later portions of the home, not substitute highlight types.

## Deliverable
Desktop home-top scenes for result, scheduled game and approved team; subcases draw, W.O., loading, empty and long names. Primary 1440, compact desktop 1024, ultrawide 2560, tablet 768 and mobile 390/320 layouts. Adaptive mobile/tablet header follows the same brand/navigation system. Components, type styles and variables remain bound and reusable.

## Data and assets
All clubs, standings, scores and dates in this design are explicitly illustrative and documented as such on the Figma canvas; they are not fetched league records. Demonstration competition: Copa Paulista 2026. Teams: Aurora FC, Atlético Paulista, União MamoBall and Vila Esportiva. Official CPM logo remains unchanged. Generic team crest comes from the existing public/escudo-generico.png fallback. Approval uses an 80px initials tile and one confirmation line because the inscription record does not provide a crest.

## Responsive intent
At 1440 and 2560 keep content within 1280px. At 1024 use 24px margins, compact header and narrower two-column composition. Tablet/mobile stack highlight and supporting content; mobile puts upcoming/recent matches ahead of the standings. Do not compress the desktop ticket sidebar into narrow screens. Controls remain at least 44px. The feature height can grow with content; names wrap rather than clip.

## Interaction and accessibility
Each event has one labeled primary link: Ver partida, Ver confronto or Ver competição. Without favorites, the competition selector drives matches and standings. With favorites, the selector is absent; lists merge competitions and standings identify the first favorite. Menu and search are labeled. Status is expressed in words and icon/shape, not color alone. Show a clear named loading state and a neutral no-data state; do not infer that the season has not started from an empty request. Error/retry is specified separately from empty. Prototype navigation represents selected views, not production data or backend changes. Browser keyboard, ARIA and live-data verification remain implementation work.

## Authored artifact and review
Eight exported scenes cover the three 1440px highlight types and result compositions at 1024, 2560, 768, 390 and 320px. Desktop/tablet/mobile content widths are recorded in [home checks](home-checks.json). Small-screen header height is 72px; desktop remains 88px. Tablet, as well as mobile, places upcoming/recent lists ahead of standings. Feature cards grow with wrapped names rather than relying on a fixed height.

The highlight set (`4:1534`) retains eleven variants: eight desktop kinds including error, and three compact event kinds. Long names (`4:1421`) remain a separate compact example. Standings and match-list components remain independent. The new reusable `Home / Event action` (`4:3065`) exposes editable `Label#4:15` and includes an arrow. Shared header and home typography use Manrope for UI/body (400/500/600), Barlow Condensed for display (600/700). Display roles: Brand 24/28, Section 28/32, Title 32/40, Score 80/80 and Score Compact 44/48. These are existing fonts, not custom typography artwork.

The library now contains 113 variables: 59 primitives, 29 light aliases and 25 unchanged dark aliases. The new display-family and compact-score primitives accompany four light result aliases: background Neutral 950, ink White, muted Neutral 200 and line Neutral 800. Dark rendering remains unverified.

Results use a dark scoreboard, crest holders, a day/month calendar block, compact round/time and one primary arrow action. Upcoming uses Pale Blue, centered **08 OUT · 20h30**, with only **Rodada 6** in its footer rather than duplicate date/time. Approval uses initials, one **Inscrição aprovada** line and **Aprovado há 2h**. Lists pair crest/name rows with score/time capsules; authored rows are 88px. All data remains illustrative.

Current metadata and exports: [home-v2 metadata](home-v2-metadata.json), [eight scenes and eight edge-case captures](home-v2-previews/), [refresh review](home-v2-review.md). Independent visual review found no material visual defects; its initial **fix** disposition concerned persistence. The final persistence verdict was **ship**. The artifact is a static light Figma home top; no banner motion or application changes were authored. Lower home, dark rendering, browser accessibility/runtime and live-data verification remain implementation work.

## Organized interaction and state extension
The principal six responsive result layouts stay in `Home · Destaques` (`3:1127`). Selector-open/closed/selected, control states and the merged favorites feed live in `Home · Interações` (`6:4085`). Full upcoming/approval examples, nine state specimens and three mobile examples live in `Home · Estados` (`6:4086`). The system remains 113 variables / 59 primitives / 29 light aliases / 25 dark aliases, with unchanged colors and typography.

Selector set `6:6134` contains Default/Hover/Focus/Disabled (`6:4087`, `6:6119`, `6:6123`, `6:6127`) and editable `Competition#6:17`; reusable Options is `6:4094`, with row frames `6:4095` and `6:4102` and no exposed editable option properties. Option labels are illustrative fixtures; implementation uses actual competition data. Selector height is 44px; focus stroke 2px; options 52px; menu padding 8px, item gap 4px, trigger gap 8px, maximum width 320px. Its localized shadow uses vertical offset 8px and blur 24px. The approved header spacing and inherited fonts/layout remain intact.

Desktop prototype demonstrates opening/closing and choosing 2026 or 2025; 2025 is a terminal demonstration, without data fetching. Mobile open examples are static. Favorites examples label each match's competition and identify the first favorite in standings. Full approval desktop `4:1983` and mobile `6:5626` use noninteractive **Competições salvas**, count **1**, because approvals are eligible only with favorites.

[States metadata](states-metadata.json) is authoritative for current scene/component IDs, [final 19 previews](state-previews-final/) record the reviewed matrix, and [final approval proofs](approval-branch-final/) supersede the earlier approval captures. [States review](states-review.md) records **ship** for the full static visual review and for the scoped approval correction with no observed regressions. Use [literal fidelity handoff](fidelity-handoff.md) and [original SVG assets](assets/icons/README.md) for eventual site implementation; no substitute icon library or extra visual redesign.
