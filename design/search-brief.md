# Pesquisa · Figma Light

Scope: native editable Figma design for the current global search. Operate mode. Inherit the approved CPM visual system; no application or database change in this task. Light is the first presentation, following the confirmed product preference.

The current search matches club name/tag, player nick/game ID (300ms debounce, up to eight returned players), and news title. Player results open the club; news opens the article. Club/news lists currently show at most five each. Illustrative fixtures are not real records or popularity claims. New category filters operate on these same returned results; counts describe the rendered subset, not an exhaustive database total. No games or competitions are added to the search index.

## Direction contract

THESIS: identify the right club, player or article through recognizable crests, compact ID chips and grouped result rows. Replace the incumbent text-heavy trending block with honest entry points and existing club content.

OWN-WORLD: reuse CPM Light semantic variables, Manrope UI, Barlow Condensed headings, official integral logo and original SVG geometry. Search icon sits in a blue-tinted compartment; filters pair icon and label with a clear selected state.

STORY: enter name/tag/nick/ID, scan the grouped matches, narrow by category, open the existing destination. Back and clear remain explicit. Loading or failed player lookup must not hide already available clubs/news or imply no results.

FIRST VIEWPORT: approved shell, a 44px back action and Buscar heading, a prominent compartmented field, category controls, then compact result groups. Desktop has a secondary direct-navigation rail; mobile stacks content and uses a two-column category grid so every label remains visible at 320px.

FORM: direct shaping of the precisely scoped incumbent search function within the approved world; no new identity or concept tournament. Six native widths cover mobile/tablet/desktop/ultrawide. Components and exceptional states are on separate pages. No fabricated recent searches or Em alta analytics.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Interaction and implementation handoff

Category selection keeps the query, clear returns to initial state, Escape/back returns to the previous surface. Results preserve club/article destinations; a player row opens the player's club. Native Figma prototype is a bounded visual demonstration, not an executable search engine. Specify real focus, keyboard semantics, result announcements, cancellation of stale player queries, reduced motion and per-source recovery for future implementation. Keep controls at least 44×44. Each result uses one whole-row destination link with an 88px minimum height; its 20px chevron is decorative. Names wrap and rows grow; compact news headlines clamp to at most three lines ending in an ellipsis, with the full title accessible in implementation. Reuse 120ms CPM dissolve for prototype state changes; no entrance choreography.

Authored native states: initial, mixed results, category-filtered results, no matches, player lookup loading/partial failure, whole-surface unavailable, and long-content/narrow-width behavior. Existing code swallows player errors; the design explicitly proposes a recoverable partial-error presentation rather than disguising an error as an empty result. This is future wiring, not behavior changed by this task.

Completion: the [independent native review](search-review.md) returned **ship** for all 32 final PNGs; [documentation](search-documentation.md) records provenance and handoff. Fixture prototype paths exist only at 1440/390px; exceptional states are static. Real search, retry and runtime accessibility remain future implementation work.
