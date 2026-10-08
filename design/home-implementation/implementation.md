# Header/Home implementation · 2026-10-06

The approved native Figma header and Home core are implemented in both themes. This is literal implementation of the established CPM system, with no new image concept or identity redesign. Other screens retain incumbent code; the Jogos and Classificação redesigns remain Figma specifications. Small Jogos/Tournaments destination changes preserve the selected competition without implementing those redesigns. No deployment or database mutation was performed.

Initial independent review returned **fix** for two bounded variants: the draw badge and W.O. central display. Both are corrected in `HomeScreen.tsx`; the final verdict is **ship**, scoring both fixes **resolved** across light/dark desktop and compact captures. This verdict scores those two fixes, not a new whole-application review. The initial full review and any subsequent verdict retain distinct scopes in [review](review.md).

## Authority and reusable source

Native authority: [review packet](review-packet.md), [Home metadata](../home-v2-metadata.json), [states metadata](../states-metadata.json), [dark metadata](../dark-metadata.json), [fidelity handoff](../fidelity-handoff.md), and exact native trees in `grounding/`. Main exports are `figma-light/4-1655.png`, `figma-light/4-2606.png`, `figma-dark/8-7953.png`, `figma-dark/8-8846.png`. Fixture screenshots compare the same content and viewport; live screenshots intentionally substitute real public data.

`components/ui/CpmUi.tsx` supplies reusable `CpmIcon`, `CpmAction`, `CpmPopover` and `CpmMenuItem`. `DesktopHeader.tsx` composes desktop/compact navigation and utilities. `HomeScreen.tsx` composes context, highlight states, match lists and standings. `Crest.tsx` preserves crest fallback and supports the approved emblem presentation. `PhoneShell.tsx` supplies theme/router integration and `MotionConfig`. The approved compact Home header replaces the incumbent Home bottom navigation; destination screens retain incumbent UI.

Fonts are self-hosted through `public/fonts/cpm-fonts.css`, imported by `app/cpm.css`: Manrope 400/500/600/700 and Barlow Condensed 600/700. [fonts.json](fonts.json) records exact file origins. UI uses `--cpm-font-ui`; sports display uses `--cpm-font-display`, with sans-serif fallbacks. Normative typography in DESIGN.md remains intact; it includes Arial as a compatible fallback. Runtime sizes preserve native roles: UI 12/16, 14/20, 16/24; brand/compact list display 24/28; section/approval display 28/32; feature club title 32/40; score 80/80 desktop and 44/48 compact. Context may override these roles exactly as the native trees specify.

SVGs in `public/cpm-icons/` are original exports, including separate event trophy/check/clock and arrow geometry. `CpmIcon` uses 20px CSS alpha masks and `currentColor`, preserving path/viewBox/stroke silhouettes. The official JPEG remains integral, including the original white field in dark mode. No generated replacement artwork was introduced.

## CSS roles and geometry

`app/cpm-tokens.css` binds native semantic values on `.app-root[data-theme="light"|"dark"]`; `app/cpm.css` applies scoped Header/Home styles. DESIGN.md frontmatter and all incumbent token-bearing artifacts remain preserved; unused Games/Classification tokens do not imply those screens were implemented.

| Runtime semantic role | Light | Dark |
| --- | --- | --- |
| `--cpm-surface-page` | `#F7F8FA` | `#0C1017` |
| `--cpm-surface-header` | `#FFFFFF` | `#111824` |
| `--cpm-surface-menu` | `#FFFFFF` | `#1E2B3D` |
| `--cpm-surface-subtle` | `#F7F8FA` | `#202D40` |
| card background | header fallback `#FFFFFF` | `--cpm-surface-card: #151E2B` |
| `--cpm-text-primary` | `#11151B` | `#EDF2F9` |
| `--cpm-text-secondary` | `#546071` | `#B8C4D6` |
| `--cpm-text-on-action` | `#FFFFFF` | `#0B1628` |
| `--cpm-border-subtle` | `#DFE3E8` | `#33445B` |
| `--cpm-border-focus` / `--cpm-action-primary` | `#165DDE` | `#7BAAFF` |
| `--cpm-action-primary-hover` | `#124DB8` | `#9BBEFF` |
| disabled action / nav hover | `#EEF0F3` | `#202D40` |
| active nav background | `#EFF5FF` | `#203F6A` |
| active nav text | `#124DB8` | `#C5DCFF` |
| result background / ink | `#11151B` / `#FFFFFF` | `#12223A` / `#EDF2F9` |
| result muted / divider | `#DFE3E8` / `#242B35` | `#B8C4D6` / `#355174` |

Dark upcoming roles separately use background `#18355C`, ink `#D6E7FF`, time `#9DC3FF`, muted `#B7D5FF`, emblem `#284B77` and divider `#385D89`. These belong to the approved palette rather than a global reinterpretation.

Content maximum is 1280px; desktop header is 88px with 72px logo. At 1024–1279px, gutters are 24px and header brand/search compact. At 1023px and below, header is 72px with 48px logo, menu replaces desktop navigation, and Home stacks highlight, upcoming, results, then standings. Gutters are 24px above 599px and 16px at 599px and below. Controls keep 44px minimum, 12px radius and visible 2px focus. Cards use 16px radius; content grows/wraps rather than clipping names. The selector is 248px desktop, 44px high, with 52px options and 320px popover width constrained by viewport. Its localized shadow is `0 8px 24px rgba(0,0,0,0.08)`.

Browser geometry at 1440 matches native: header88, content1280, feature856×352 at80,196, standings400×401 at960,196. RGB samples match source roles. Pixel metrics in `comparison/metrics.json` quantify Figma/Chromium differences, not quality; font rasterization prevents a pixel-identical claim.

## Product behavior and data

Existing Supabase public reads flow through `lib/supabase.ts`, `lib/db.ts` and `DataContext`; publishable-key compatibility is supported alongside the incumbent anonymous-key name. Credentials remain in ignored environment configuration and are never recorded here. Core competition/club/standing/match failures now reach the real error state instead of appearing as false emptiness; DataContext retains its timeout and refresh mechanism.

No favorites: real competition selection controls match/standings context. Favorites: merged match lists and first-favorite standings preserve existing behavior; multiple favorites label competition per row and hide the no-favorites selector. Approval highlights remain favorites-only. Search, saved destinations, theme persistence, match navigation, consent and browser back preserve existing integrations. List CTAs preserve the selected competition in destination screens. Fixtures intercept read-only requests in the verification harness, never in shipped Home code.

MamoBall has **no penalties whatsoever**. Historical classification examples/reviews mentioning them are explicitly obsolete under PRODUCT.md and corrected future handoff metadata. No alternative tiebreaker is established and tied scores/aggregates do not imply a winner. The draw highlight reads **Empate** only when both scores exist and are equal; W.O. renders **W.O.** centrally. No knockout model or UI is implemented here.

The latest approved extension removes the Home registration CTA and incumbent news block while retaining global destinations. Upcoming/results/standings now use shared icon-plus-label empty/error feedback in both themes. Conditional Home news has since been implemented from Home · Notícias (25:33706), preserving removal of the registration CTA and replacement of the incumbent news block. [Surface brief](../home-news-brief.md), [metadata](../news-metadata.json), [implementation evidence](../home-news-implementation/implementation.md) and [browser finish review](../home-news-implementation/review.md) record the latest scope. The earlier [extension review](../home-news-review.md) and [documentation comparison](../home-news-documentation.md) remain historical Figma evidence. Home cookie styling follows semantic colors while retaining consent behavior.

## Motion and verification

Menu opacity uses 120ms ease-out, with entrance y=-4px and exit y=-2px. Highlight content crossfades in 120ms. Actions use bounded touch scales (0.98; list rows 0.995), and semantic CSS colors transition in 120ms. `MotionConfig reducedMotion="user"` suppresses transforms under reduced motion; popover displacement becomes zero, CSS transition duration becomes 0.01ms, and scroll behavior becomes immediate. Opacity can still crossfade; this is not a claim that every animation disappears. Historical Figma fast/normal/reduced tokens remain preserved.

Evidence checked from saved files/source; this documentation pass did not rerun browser, build, detector or review.

| Check | Recorded result / scope |
| --- | --- |
| `scripts/verify-home.mjs` | Passed again after corrections: 12 size/theme scenes, 10 highlight-state scenes and 12 exact draw/W.O. assertions at1440/390/320 in both themes; menus/Escape, selector arrow selection, theme, favorites/saved/back and competition-preserving list navigation. |
| Responsive captures, both themes | 1440×997, 1024×1057, 2560×997, 768×1698, 390×1698, 320×1800; upcoming/approval/empty/error/loading at390×900; More, selector and live captures in `.impeccable/review/home-implementation/`. |
| [browser/report.json](browser/report.json) | No overflow in 12 measured viewport/theme rows, loaded images, native geometry; errors array empty. Harness waits for fonts, but does not assert every face identity. Source/font provenance and visual review provide complementary evidence. |
| [live-functional.json](live-functional.json) | Pass: theme persistence, consent, real match navigation, search/browser back, mobile menu keyboard, error-versus-empty and retry after simulated503; errors empty. Four failing SDK attempts were intercepted for recovery verification. Actual Supabase reads, no write. |
| [build.log](build.log) | Production `npm run build` passed compilation, TypeScript and route generation. |
| Scoped new-UI ESLint | Parent reports zero errors, three raw-image advisories. Broader lint exposed pre-existing set-state-in-effect issues in DataContext/Jogos/Tournaments; no clean repository-wide lint claim. |
| [detector.json](detector.json) | `[]`; design detector ran once on changed new-UI targets, not rerun by documenter. |
| [review.md](review.md) | Initial full review: fix for Empate/W.O.; final bounded verdict: ship, both fixes resolved. Twelve explicit correction captures match their badge/display assertions. |

Captures are settled viewport views from the top, not coverage of the full scrollable page. This does not certify full WCAG conformance, screen-reader behavior, authenticated/staff flows, arbitrary long live names, every match/club destination, unbounded network recovery conditions, or normal-motion performance. The extra real-functional report expands initial supplied coverage to mobile menu/consent/search/back and simulated503 retry recovery without replacing those broader limitations. Existing git HEAD was already corrupt (`bad object HEAD`), so no normal git diff/status/commit evidence is available; git repair was not attempted. No deploy was requested or performed. The local development server remains at `http://localhost:3000`.
