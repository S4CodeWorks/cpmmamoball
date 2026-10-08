# Jogos · implemented Light and Dark

Jogos now reproduces the approved native Figma Light/Dark design in the real site. This is an Operate extension of the existing CPM world. The approved [implementation brief](../games-implementation-brief.md) supplies the quality bar; historical [Light](../games-review.md) and [Dark](../games-dark-review.md) reviews accept their Figma artifacts only.

## Runtime behavior

`components/screens/JogosScreen.tsx` uses DataContext's active competition and existing records. An explicit competition reached from Home uses `fetchMatches` when it differs from the active competition; the resource is keyed by competition/retry, ignores cancelled requests and times out after 12 seconds. Competition context is informational. Hoje includes scheduled records whose legacy date begins Hoje; Próximos includes other scheduled records; Resultados includes finalized records grouped by descending round. `ao_vivo` remains excluded. Counts cover each complete category, disappear during loading/error and show zero for empty categories.

Each whole card is one native link to existing match details, preserving modified browser clicks and navigation history. Tabs use roving focus, ArrowLeft/ArrowRight/Home/End, selected state and a labeled focusable panel. Empty Hoje's **Ver próximos jogos** selects and focuses Próximos. **Tentar novamente** refreshes the context or selected competition resource. Theme switching retains the category. Loading, each empty category, error/retry, long names and unknown times are implemented.

`lib/matchDate.ts` is the unchanged Home date helper extracted for reuse; Home retains its import/re-export. Actual scheduled/finalized timestamps use America/Sao_Paulo formatting; legacy display strings remain readable. Missing time is **A definir**. Draw requires equal non-null scores. W.O. is explicit and retains stored scores or missing-score marks. MamoBall has no penalties: no penalty fields, replacement tiebreaker or inferred winner was introduced.

## Visual implementation and native grounding

`app/cpm-games.css` applies the existing semantic tokens; the scoped Jogos override in `app/cpm.css` releases the legacy shell's desktop width limit. `components/PhoneShell.tsx` lets Jogos own loading/error and uses the approved responsive header instead of the legacy bottom bar. Shared Header/Home visual geometry remains unchanged.

Content has a 1280px maximum, 32px large gutters, 24px compact-desktop/tablet gutters and 16px mobile gutters, with 32px vertical padding and section gaps. Cards/tabs become compact at 599px and below. Wide tabs are 176×52px; compact tabs are 72px high, with centered 20px icon/24px count and complete labels. Wide cards use 20px vertical/24px horizontal padding, 112px time cells and 56px date/round markers; compact cards use 16px padding, two club rows and 12px gaps. Names wrap and cards grow. Dark wide rows retain individual rounded corners, zero gap and dividers.

Real self-hosted Manrope and Barlow Condensed fonts, original CpmIcon SVG paths (calendar, clock, check, trophy, arrow and support), Crest/fallback artwork and the official unchanged logo are reused. Light/Dark paint resolves through existing shared tokens; no global token, sidecar or normative frontmatter change was needed. State panels use header surface, skeletons border-subtle, empty/loading calendar primary ink and error support action ink. Final/Empate/W.O. labels use primary ink; round metadata uses secondary ink.

[Primary grounding](grounding-primary.json), [additional grounding](grounding-additional.json) and [coverage](grounding-coverage.json) record fresh native design-context reads and content exports from the approved Light/Dark pages and masters. The [20 native content crops](figma-content/) are the comparison source. Motion inventories cover all 20 principal content scenes and report no keyframed tracks; the authored tab dissolve is a 120ms opacity transition. Reduced motion suppresses transitions, press feedback and skeleton animation.

## Verification and review bounds

The final production build and scoped ESLint passed. [Validation](validation.md) records the completed browser run: 20 principal scenes (Hoje at 1440/1024/2560/768/390/320 and Próximos/Resultados at 1440/390, both themes), 18 state/edge scenes and two real Supabase read scenes. It also verifies keyboard tabs, detail/history navigation, theme persistence, explicit competition selection and retry. The report records zero page errors and the browser checks passed without horizontal overflow. Synthetic fixtures are confined to `scripts/verify-games.mjs`; no database writes occur.

The evidence directory is [`.impeccable/review/games-implementation/`](../../.impeccable/review/games-implementation/): 40 paired full scenes/content crops, `report.json`, the single scoped `detector.json` (empty findings) and `comparison.json`. `scripts/compare-games.cjs` compares the 20 native crops; all dimensions match. Mean RGB channel difference ranges approximately 0.746–2.257/255. Font rasterization and fallback crest rendering leave residual differences; this is supporting fidelity evidence, not pixel identity or comprehensive WCAG conformance.

The independent full [review](review.md) identified four material fidelity issues. [Fixes](fixes.md) records the applied batch; the subsequent [verdict](verdict.md) resolves all four and returns **ship** only within that fix-list scope. The original full review remains unchanged. No second detector or new whole-surface audit is implied by the verdict or this documentation merge.

Match details, Classificação and other screens retain existing implementations. No new competition selector, live category, search, pagination or sporting logic was added. No deployment or Supabase write was performed. Final capture used production at localhost:3001; the development server was restarted at localhost:3000 afterward.
