# Pesquisa · Light · documentation handoff

The native editable Figma extension is complete. The [independent finish review](search-review.md) returned **ship** after inspecting all 32 final PNGs, with no material fixes. This is native visual acceptance; application search stays incumbent and this task changed no source or database behavior. [PRODUCT.md](../PRODUCT.md) and the canonical Overview/Layout/Components sections of [DESIGN.md](../DESIGN.md) contain the scoped extension. Existing frontmatter, tokens, identity, sidecar and prior status remain preserved.

Native file: “Sem título”; no file key or URL is available. Pages: Pesquisa · Light `42:40204`, Components `42:40205`, Estados `42:40206`; handoff note `43:45281`. [Metadata](search-metadata.json) records IDs, exact property keys, authored masters, icons, geometry variable IDs and prototype boundaries. [Brief](search-brief.md) retains the direction and future behavior contract. [Checks](search-checks.json) record 32 exports with dimensions and no empty files. [Final PNG directory](search-previews-final/) contains 27 screen/state scenes across 1440, 1024, 2560, 768, 390 and 320px, four component sheets and one handoff note. Width samples do not establish application breakpoints or responsiveness between them.

Four native component sets preserve the incumbent Light palette and typography:

| Set | Native ID | Authored coverage and API |
| --- | --- | --- |
| Search / Field | `42:40315` | Eight Wide/Compact × Empty/Focus/Filled/Disabled masters; Query/Placeholder text. |
| Search / Category | `43:40390` | Ten masters: All/Club/Player/News Default/Selected; Club Hover/Focus; Count text. |
| Search / Result | `43:40537` | Twelve masters: Club/Player/NewsCover/NewsText Default in Wide/Compact, plus Club Hover/Focus in both layouts; Title/Meta/GameID text. |
| Search / Notice | `43:40568` | Empty, Unavailable and PlayerError. |

Variant APIs advertise option values; they do not imply a complete Cartesian set. Category and Result Hover/Focus specimens exist only for Club. Read metadata for canonical post-combine text-property keys before code generation.

Field geometry is 64px Wide / 56px Compact with 16px corners. Results have 12px corners, 88px minimum height, 16px Wide padding with 48px identities (64px news covers), and 12px Compact padding with 40px identities. Names wrap and rows grow. Compact news titles clamp at three lines and end with an ellipsis; implementation must retain the full accessible title. The whole result row is one link, with a decorative 20px trailing chevron; it is not a standalone 44px action. Back/clear and other controls retain at least 44×44 targets. Desktop includes a secondary navigation rail; mobile uses a two-column category grid with complete labels.

The [seven exported native SVGs](assets/icons/search/) are close, news, shield, back, chevR, alert and filter. Their original geometry comes from `components/icons.tsx`; metadata maps exact exports and native component IDs. Existing search/user/arrow/calendar/trophy/clock components remain reused. Preserve the [official original logo](assets/cpm-official.jpg) without recoloring, cropping or distortion. Raster provenance: all 32 shipping PNGs are native Figma exports, not browser captures or generated compositions. The existing generic raster crest is reused as a fallback; the logo used for an article cover is illustrative, not a real article asset. No original asset was replaced.

Fixture semantics preserve club name/tag, player nick/game ID and news-title search. Player lookup uses the existing 300ms debounce and up to eight returned players; clubs/news show at most five each. Category controls filter those same returned results and counts describe the shown subset, not exhaustive database totals. Player rows open their club; club/news rows retain club/article destinations. Initial content includes neither fabricated search history nor “Em alta”. Fixtures are demonstrative. Player loading/partial error retains available clubs/news and avoids unknown counts; partial failure is proposed future recovery behavior because incumbent code swallows player errors.

Only the 1440/390px prototype connects initial field click to fixture results, category changes, clear to initial and back to the previous prototype frame. It uses DISSOLVE 120ms ease-out with the query “aurora”. Other widths and exceptional states are static. This does not execute typing, network queries, real search, retry or destination navigation. Future implementation must wire recovery, cancellation of stale player requests, focus/keyboard semantics, ARIA/result announcements and reduced motion. No runtime accessibility verification, browser conformance claim or deployment is part of this task.
