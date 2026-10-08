---
name: "CPM MamoBall"
description: "Approved Figma target for the rounded, minimal CPM identity; header, responsive home and paired Jogos Light/Dark."
colors:
  color-white: "#FFFFFF"
  color-black: "#000000"
  color-neutral-50: "#F7F8FA"
  color-neutral-100: "#EEF0F3"
  color-neutral-200: "#DFE3E8"
  color-neutral-400: "#929BA8"
  color-neutral-600: "#546071"
  color-neutral-800: "#242B35"
  color-neutral-950: "#11151B"
  color-blue-50: "#EFF5FF"
  color-blue-100: "#DBE9FF"
  color-blue-400: "#75AAFF"
  color-blue-600: "#165DDE"
  color-blue-700: "#124DB8"
  color-blue-800: "#15376B"
  color-dark-page: "#0C1017"
  color-dark-header: "#111824"
  color-dark-card: "#151E2B"
  color-dark-menu: "#1E2B3D"
  color-dark-subtle: "#202D40"
  color-dark-border: "#33445B"
  color-dark-secondary: "#B8C4D6"
  color-dark-ink: "#EDF2F9"
  color-dark-action: "#7BAAFF"
  color-dark-action-ink: "#0B1628"
  color-dark-hover: "#9BBEFF"
  color-dark-selected: "#203F6A"
  color-dark-selected-ink: "#C5DCFF"
  color-dark-result: "#12223A"
  color-dark-result-line: "#355174"
  color-dark-result-emblem: "#203856"
  color-dark-upcoming: "#18355C"
  color-dark-upcoming-ink: "#D6E7FF"
  color-dark-upcoming-time: "#9DC3FF"
  color-dark-upcoming-muted: "#B7D5FF"
  color-dark-upcoming-emblem: "#284B77"
  color-dark-upcoming-line: "#385D89"
typography:
  caption:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "16px"
  label:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: "20px"
  body:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
  brand:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "28px"
  score:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "80px"
    fontWeight: 700
    lineHeight: "80px"
  score-compact:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: "48px"
  section:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "28px"
    fontWeight: 600
    lineHeight: "32px"
  body-strong:
    fontFamily: "Manrope, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: "24px"
  title:
    fontFamily: "Barlow Condensed, Arial, sans-serif"
    fontSize: "32px"
    fontWeight: 600
    lineHeight: "40px"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "999px"
spacing:
  "0": "0px"
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
  "12": "48px"
  "16": "64px"
components:
  button-primary:
    backgroundColor: "{colors.color-blue-600}"
    textColor: "{colors.color-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.color-blue-700}"
    textColor: "{colors.color-white}"
    rounded: "{rounded.md}"
    height: "44px"
  button-primary-disabled:
    backgroundColor: "{colors.color-neutral-100}"
    textColor: "{colors.color-neutral-600}"
    rounded: "{rounded.md}"
    height: "44px"
  navigation-item:
    textColor: "{colors.color-neutral-950}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
  navigation-item-active:
    backgroundColor: "{colors.color-blue-50}"
    textColor: "{colors.color-blue-700}"
    rounded: "{rounded.md}"
    height: "44px"
  search-desktop:
    backgroundColor: "{colors.color-neutral-50}"
    textColor: "{colors.color-neutral-950}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
  search-compact:
    textColor: "{colors.color-neutral-950}"
    rounded: "{rounded.md}"
    height: "44px"
    width: "44px"
  navigation-more:
    textColor: "{colors.color-neutral-950}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
  account-signed-in:
    textColor: "{colors.color-neutral-950}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
  menu-container:
    backgroundColor: "{colors.color-white}"
    rounded: "{rounded.lg}"
  home-highlight:
    backgroundColor: "{colors.color-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  home-result:
    backgroundColor: "{colors.color-neutral-950}"
    textColor: "{colors.color-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  home-upcoming:
    backgroundColor: "{colors.color-blue-50}"
    textColor: "{colors.color-neutral-950}"
    rounded: "{rounded.lg}"
    padding: "24px"
  event-action:
    backgroundColor: "{colors.color-blue-600}"
    textColor: "{colors.color-white}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
  event-status:
    backgroundColor: "{colors.color-blue-50}"
    textColor: "{colors.color-blue-600}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
  standings-card:
    backgroundColor: "{colors.color-white}"
    rounded: "{rounded.lg}"
    padding: "24px"
  header-small:
    backgroundColor: "{colors.color-white}"
    height: "72px"
  header-desktop:
    backgroundColor: "{colors.color-white}"
    height: "88px"
  button-primary-dark:
    backgroundColor: "{colors.color-dark-action}"
    textColor: "{colors.color-dark-action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
  button-primary-hover-dark:
    backgroundColor: "{colors.color-dark-hover}"
    textColor: "{colors.color-dark-action-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "44px"
  home-card-dark:
    backgroundColor: "{colors.color-dark-card}"
    textColor: "{colors.color-dark-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  home-result-dark:
    backgroundColor: "{colors.color-dark-result}"
    textColor: "{colors.color-dark-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  home-upcoming-dark:
    backgroundColor: "{colors.color-dark-upcoming}"
    textColor: "{colors.color-dark-upcoming-ink}"
    rounded: "{rounded.lg}"
    padding: "24px"
  menu-container-dark:
    backgroundColor: "{colors.color-dark-menu}"
    textColor: "{colors.color-dark-ink}"
    rounded: "{rounded.lg}"
  games-category-tab:
    textColor: "{colors.color-neutral-950}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "52px"
  games-category-tab-selected:
    backgroundColor: "{colors.color-blue-50}"
    textColor: "{colors.color-blue-700}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "52px"
  games-category-tab-mobile:
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "72px"
  games-match-wide:
    backgroundColor: "{colors.color-white}"
    textColor: "{colors.color-neutral-950}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  games-match-compact:
    backgroundColor: "{colors.color-white}"
    textColor: "{colors.color-neutral-950}"
    rounded: "{rounded.lg}"
    padding: "{spacing.4}"
  games-time-cell:
    backgroundColor: "{colors.color-blue-50}"
    textColor: "{colors.color-blue-700}"
    width: "112px"
  games-date-marker:
    width: "56px"

  games-category-tab-dark:
    textColor: "{colors.color-dark-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "52px"
  games-category-tab-selected-dark:
    backgroundColor: "{colors.color-dark-selected}"
    textColor: "{colors.color-dark-selected-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "52px"
  games-category-tab-mobile-dark:
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "72px"
  games-match-wide-dark:
    backgroundColor: "{colors.color-dark-card}"
    textColor: "{colors.color-dark-ink}"
    rounded: "{rounded.lg}"
    padding: "20px 24px"
  games-match-compact-dark:
    backgroundColor: "{colors.color-dark-card}"
    textColor: "{colors.color-dark-ink}"
    rounded: "{rounded.lg}"
    padding: "{spacing.4}"
  games-time-cell-dark:
    backgroundColor: "{colors.color-dark-selected}"
    textColor: "{colors.color-dark-action}"
    width: "112px"
  games-date-marker-dark:
    width: "56px"

---
# Design System: CPM MamoBall

## Overview

**Creative North Star: "Rounded, minimal CPM"**

This is the approved target visual system authored in the connected Figwright Figma file “Sem título”. The written white, black and blue direction was approved before Figma creation; no raster composition was approved as the source. Light is the primary presentation. Rounded controls, clear labels and restrained blue accents express the confirmed minimal identity. The home refresh adds condensed sports display type, a dark scoreboard and compact visual date/score cues, reducing prose around the event.

The approved header, responsive Home core, conditional news extension and Jogos are now implemented in both light and dark themes using the native Figma references. `app/cpm-tokens.css` resolves the approved semantic roles and `app/cpm.css` applies their scoped geometry. Classificação is also implemented in light/dark; its real league browser evidence and the separately smoke-verified knockout resolver are recorded in [Classificação implementation](design/classification-implementation/implementation.md). Other screens retain their incumbent implementation. Jogos uses `app/cpm-games.css` and a scoped shell-width override in `app/cpm.css`; [Jogos implementation evidence](design/games-implementation/implementation.md) distinguishes native grounding, browser verification and the four-fix verdict. The current surface mode is Operate. Preserve existing product logic and the unmodified official logo. See [Home implementation evidence](design/home-implementation/implementation.md) for browser coverage and limitations; historical Figma reviews below retain their original scope.

**Key Characteristics:**

- Light surfaces, dark readable text and blue interaction accents.
- Rounded, minimal controls with comfortable interaction targets.
- Reusable Figma variables, typography styles and component variants.
- Explicit separation between authored design and verified browser behavior.

Historical light source artifacts: [PRODUCT.md](PRODUCT.md), [header brief](design/header-brief.md), [tokens](design/tokens.json), [Figma metadata](design/figma-metadata.json), [review](design/review.md) and [exported previews](design/previews/). The Figma pages are Foundations (`0:1`), Components (`2:2`) and Header · Desktop (`2:3`). The header library established 99 variables, 45 components and eight component sets after its More-menu refinement. At that revision, the home refresh brought the shared library to 113 variables: 59 primitives, 29 light semantic aliases and 25 unchanged dark aliases across the same three collections. Home · Overview (`3:1127`) and Home · Components (`3:1128`) contain the extension; [current home metadata](design/home-v2-metadata.json), [home checks](design/home-checks.json), [home brief](design/home-brief.md), [current home review](design/home-v2-review.md) and [current home previews](design/home-v2-previews/) record its scope.

The dark extension is recorded in [dark metadata](design/dark-metadata.json), [dark brief](design/dark-brief.md) and [final dark previews](design/dark-previews-final/). Seven dark pages contain 54 components across 22 root families and 35 screen/state references. At the dark revision, shared variable counts were 81 primitives, 29 Light aliases and 37 Dark aliases (147 total); the previous 113-variable record remains historical. Light remains primary. Dark authoring and prototype reactions are distinct from application implementation and browser accessibility verification.

The Jogos Light extension preserves this world and adds useful calendar, crest, time and score cues. At the Jogos Light revision, the shared library had 85 primitives, 34 Light aliases and 37 unchanged Dark aliases (156 total). Four primitives capture existing Games geometry (20px vertical padding, 112px time cell, 52px desktop tab and 56px date/round marker); five Light aliases include mobile tab height bound to the existing 72px compact-header primitive. Exact variable IDs are in [Games tokens](design/games-tokens.json) and [Games metadata](design/games-metadata.json). Historical Home and Dark counts above describe those revisions.

The Jogos Dark extension pairs the approved Jogos Light geometry with the approved Home Dark palette. At the Jogos Dark revision, shared counts were 85 primitives, 34 Light aliases and 42 Dark aliases (161 total). Its five new Dark dimensional aliases resolve to the existing 112 / 52 / 72 / 56 / 20px primitives; no colors, fonts or geometry were introduced. [Dark Games metadata](design/games-dark-metadata.json), [brief](design/games-dark-brief.md), [independent review](design/games-dark-review.md) and [19 final previews](design/games-dark-previews-final/) record this completed extension. Earlier counts and pass-one captures remain historical.

The Classificação Light extension preserves the same world and adds Liga and both single-match and two-leg knockout references. Current shared counts are 91 primitives, 43 Light aliases and 42 unchanged Dark aliases (176 total). Six dimensional primitives and nine Light aliases are recorded in [Classification tokens](design/classification-tokens.json), [metadata](design/classification-metadata.json) and the shared [tokens](design/tokens.json). Three native pages contain 24 variants, six original/reused-path icons and 34 final exports (23 scenes, four selector/action references, six states and one interaction sheet). These are the native Figma reference artifacts; Classificação now also has a separate [application implementation record](design/classification-implementation/implementation.md). Previous Home/Dark/Jogos revisions remain historical sources within their scopes.

The Pesquisa Light extension is a completed native Figma specification within the same Operate world; application search retains its incumbent implementation. Its [independent review](design/search-review.md) returned **ship** for 32 final native exports. [Pesquisa documentation](design/search-documentation.md) records component APIs, provenance and the bounded fixture prototype; it does not establish browser behavior or accessibility conformance.

The Pesquisa Dark counterpart is also complete as a native Figma specification, with **ship** from its [independent review](design/search-dark-review.md). It reuses the approved Dark semantic collection and preserves the Light geometry, component APIs and bounded fixture behavior. [Dark documentation](design/search-dark-documentation.md) records its separate masters, 32 native exports and verification limits; application search and earlier implementation/review statuses remain unchanged.


### Pesquisa · current application status · 2026-10-06

Pesquisa is now implemented in both themes from the approved native Light/Dark references, with independent implementation review **ship** and no material fixes pending. This current status supersedes the earlier native-only search status above while preserving those historical acceptance records. [Implementation evidence](design/search-implementation/implementation.md) separates real Supabase queries, browser behavior and intercepted visual fixtures. This is an ordinary extension of the incumbent CPM world: frontmatter tokens, identity and `.impeccable/design.json` remain unchanged. No deployment has been performed.

## Colors

White, near-black and clear blue form the confirmed identity. The frontmatter preserves the canonical Figma primitive values; semantic bindings for both themes live in `design/tokens.json`.

### Primary

- **Action Blue** (`color-blue-600`): primary actions and navigation focus in light presentation.
- **Deep Action Blue** (`color-blue-700`): primary-action hover and active navigation text.
- **Pale Blue** (`color-blue-50`): active navigation fill.
- **Bright Blue / Soft Blue / Deep Blue** (`color-blue-400`, `color-blue-100`, `color-blue-800`): dark action, hover/text and active-surface roles respectively.

### Neutral

- **White** (`color-white`): light header and menu surfaces; light action text.
- **Ink** (`color-neutral-950`): light primary text and dark page/header surfaces.
- **Slate** (`color-neutral-600`): light secondary and disabled text; dark subtle borders.
- **Mist** (`color-neutral-50`): light page and subtle surfaces.
- **Soft Grey** (`color-neutral-100`): light hover and disabled fills.
- **Divider Grey** (`color-neutral-200`): light subtle borders.
- **Muted Grey** (`color-neutral-400`): dark secondary and disabled text.
- **Charcoal** (`color-neutral-800`): dark menu, subtle and hover surfaces.
- **Black** (`color-black`): retained official identity primitive.

**The Semantic Binding Rule.** Assign color by semantic role; resolve through the selected light or dark collection rather than changing individual primitive values.

Light and dark use paired Figma collections because the connected Starter plan allows one mode per collection. The previous dark aliases were expanded and rebound for the authored dark references; the light aliases and original light primitives remain preserved. Recorded light contrast ratios are primary text (18.31:1), secondary text (6.39:1), action text (5.75:1) and active navigation (6.9:1). These checks do not establish browser accessibility conformance.

### Dark extension

Dark Page, Header, Card, Menu and Subtle tokens create distinct tonal layers. Dark Ink and Secondary retain the reading hierarchy. Dark Action uses Dark Action Ink for both label and arrow; Dark Hover preserves that ink. Dark Selected and Selected Ink serve selected navigation/options and icon zones. Result and Upcoming each have their own background, divider and emblem tokens; upcoming time and muted labels use dedicated ink roles. Resolve exact values from the frontmatter and semantic aliases from `design/tokens.json`.

Reported design-token contrast calculations are body/card 14.91:1, secondary/card 9.51:1, action label 7.79:1 (hover 9.66:1), selected label 7.60:1, action blue on selected 4.56:1, result caption on date tile 4.61:1, upcoming caption 8.21:1, tag 7.08:1 and menu link 6.15:1. These are calculated color-pair readings reported by the authoring pass; they do not establish browser, keyboard or complete accessibility conformance.

Jogos Dark uses Dark Card for match surfaces, Dark Selected / Selected Ink for active tabs and the time-cell background, and Dark Action for time and focus. Reported Games color-pair contrast is primary/card 14.91:1, secondary/card 9.51:1, selected/background 7.60:1, time/time-cell 4.56:1, time/card 7.21:1 and action ink/fill 7.79:1. Author checks found no visible Light paint bindings in 22 Dark roots and no unexpected Dark paint bindings in the sampled two Light scenes/two sets. These are bounded author checks, distinct from independent visual review and browser verification.

### Classificação Light roles

Reuse White cards/header, Mist page, Ink primary content, Slate secondary content and connector lines, Divider Grey boundaries, Pale Blue selected/qualified surfaces and Deep Action Blue selected text. Hover reuses Soft Grey; focus reuses Action Blue. Form V/E/D/None and qualification/relegation retain explicit letters and legends; their meaning must remain readable without color. `classification/bracket-line` resolves Slate through the Light alias. The native Light extension added dimensions and aliases without a new palette or native Dark Classification reference. The implemented Classificação uses the approved shared Light/Dark semantic palette; its browser evidence is recorded separately.

## Typography

**Display Font:** Barlow Condensed, semibold (600) and bold (700). **UI and Body Font:** Manrope, regular (400), medium (500) and semibold (600). Header/Home/Jogos/Classificação self-host the real font files through `public/fonts/cpm-fonts.css`; their runtime stacks use the family followed by sans-serif. Arial in the normative typography entries remains a compatible fallback recommendation for other implementations. These are existing font families, not custom letterforms.

The condensed display gives club names, brand, event headings and score a sports character while Manrope keeps navigation, dates, status and reading copy clear. Shared header typography is refreshed too. Nine authored styles are `CPM / Caption`, `CPM / Label`, `CPM / Body`, `CPM / Brand`, `CPM / Title`, `CPM / Score`, `CPM / Score Compact`, `CPM / Section` and `CPM / Body Strong`.

Frontmatter defines each role. Brand is 24px/28px semibold, Section 28px/32px semibold, Title 32px/40px semibold, Score 80px/80px bold and Score Compact 44px/48px bold, all in Barlow Condensed. Caption is Manrope 12px/16px regular; Label 14px/20px medium; Body 16px/24px regular; Body Strong 16px/24px semibold. Active navigation retains its semibold override. Compact scores use their own style rather than the Title scale.

**The Event Hierarchy Rule.** Let score, date or approved team carry the hierarchy. The home competition toolbar replaces the generic “Visão geral” heading and explanatory subtitle; do not reintroduce that introductory copy.

## Layout

The spatial rhythm follows the authored four-pixel spacing scale. The desktop header has a fixed height (88px), centered content maximum (1280px), regular minimum gutters (32px) and compact desktop gutters (24px). Controls remain at least (44px) high; compact icon controls are (44px) square. Icons use (20px); the official logo occupies a (72px) slot without altering its aspect ratio.

Verified Figma examples: at (1024px), content measures (976px) with (24px) gutters; at (1440px), content measures (1280px) with (80px) gutters; at (2560px), the same content measures (1280px) with (640px) gutters. These are reviewed preview sizes, not implementation breakpoints. Compact desktop reduces brand text and search presentation while retaining destination labels. The responsive home-top examples add a 72px adaptive header at 768, 390 and 320px, with the unchanged official logo, compact brand, search and menu controls. Those examples have content widths of 720, 358 and 288px respectively (24px tablet and 16px mobile gutters). Switch strategy at content fit rather than shrinking targets or creating horizontal scrolling.

The home places competition context above the event highlight. Desktop pairs highlight and named-competition standings, then places upcoming and recent match lists side by side. Tablet and mobile stack highlight, upcoming games, recent results and standings in that order. The `size/highlight-min` (352px) primitive records the desktop baseline, not a global fixed height; highlights grow with wrapped names. `size/crest` is 64px for the desktop highlight and `size/compact-header` is 72px. Standings hug content (397px in the sample). These measured examples do not establish browser breakpoints or complete the lower home page.

### Jogos Light layout

Games uses the approved 1280px content maximum and 88px desktop / 72px small header. Hoje is captured at 2560, 1440, 1024, 768, 390 and 320px; Próximos and Resultados at 1440 and 390px. Tablet gutters are 24px and mobile gutters 16px. Wide match cards have 24px horizontal / 20px vertical padding; compact cards use 16px padding and 12px gaps. Cards have 16px corners. Time cells are 112px; date/round markers are 56px. Desktop tabs are 52px high; mobile tabs are 72px with separate icon/count and full-label rows. Names wrap and cards grow rather than clipping. These widths originally specified Figma reference compositions. The subsequent Jogos implementation verifies the six Hoje widths and 1440/390px Próximos/Resultados in both themes; compact Jogos cards/tabs apply at 599px and below. See [implementation evidence](design/games-implementation/implementation.md) for coverage and fidelity bounds.

### Jogos Dark layout

Dark preserves every Jogos Light measure and the same ten main reference compositions: Hoje at 1440, 1024, 2560, 768, 390 and 320px, plus Próximos and Resultados at 1440/390px. Eight state/edge scenes and one interaction sheet bring the final set to 19 captures. Reuse the 1280px content maximum, 24px tablet/16px mobile gutters, 88/72px headers, 24px horizontal/20px vertical wide padding, 16px compact padding, 16px card corners, 112px time cells, 56px markers, 52/72px tabs and 2px focus stroke. No responsive geometry changes accompany the theme.

### Classificação layout · native reference and implementation

The Liga and single-match samples cover 1440/1024/2560/768/390/320px; two-leg samples cover 1440/390/320px. Reuse maximum content (1280px), desktop/compact header (88/72px), tablet/mobile gutters (24/16px), targets at least (44px) and focus stroke (2px). At 320/390px and tablet 768px, Liga prioritizes position, crest, club, points, J/SG and five results, with expandable remaining statistics. Rows have padding (16px), gap (12px), wide minimum height (72px), compact minimum height (136px), position width (28px)/holder height (40px), crest holder (40px) and form squares (24px wide, 20px compact) separated by (4px). Expansion and wrapped names grow the row.

Knockout uses a complete bracket above 768px; at 768px and below, show one phase with full Quartas/Semifinal/Final labels and whole cards. Cards use padding (16px), gap (8px), radius (16px), score width (32px), single-match minimum height (196px compact; 212px desktop) and two-leg minimum height (256px compact; 272px desktop). These are minimums, never clipping heights. Desktop bracket uses padding (24px), connector channel (40px), card gap (24px), stage header (40px) and header gap (16px), with three sample columns. Preserve real Q1+Q2 → S1, Q3+Q4 → S2, S1+S2 → F1 branches; the implemented connector measurement reads card/target slot geometry and observes resizing when contents increase heights, though no real active knockout browser capture verifies that layout yet. Do not scale a miniature full bracket into mobile. The native captured geometries define reference compositions. Current league browser coverage is recorded in [implementation evidence](design/classification-implementation/implementation.md): wide rows at 960px and above, compact rows below 960px, 24px gutters at 769–959px and 16px gutters at 768px and below. Knockout code uses phase views through 768px and a complete bracket above 768px; that branch has resolver smoke evidence, without a real active-competition browser capture.

### Pesquisa Light layout · native reference

Initial/results scenes cover 1440, 1024, 2560, 768, 390 and 320px within the approved shell. Desktop pairs results with a secondary direct-navigation rail; compact layouts stack content. Mobile320/390px uses a two-column category grid with complete labels; tablet768px keeps horizontal categories. Field heights are 64px Wide / 56px Compact with 16px radius. Result rows have 12px radius and an 88px minimum height; Wide uses 16px padding and 48px identities (64px news covers), Compact uses 12px padding and 40px identities. Names wrap and rows grow. Compact news headlines clamp to at most three lines, ending in an ellipsis; implementation must retain the full accessible title. The whole row is one destination link; its Compact20px trailing chevron area is decorative, not a separate control. These are sampled native compositions, not browser breakpoint verification.

### Pesquisa Dark layout · native reference

Dark preserves the Pesquisa Light geometry, full category labels, desktop secondary rail, wrapped names, three-line compact news clamp and whole-row links at the same six sampled widths (1440/1024/2560/768/390/320px). Field heights remain (64/56px), corners (16px); result rows retain (12px) corners, (88px) minimum height, Wide/Compact padding (16/12px) and identities (48/40px), with news covers (64px). Back/clear retain at least (44×44px) targets. Theme changes establish no application breakpoints or browser behavior.


### Pesquisa · implemented responsive layout

`app/cpm-search.css` applies the existing centered (1280px) maximum with (32px) gutters, (24px) below 1024px and (16px) below 600px. Below 960px, result rows become Compact, the field changes from (64px) to (56px), identities/news thumbnails become (40px), and initial direct shortcuts stack; compact query results omit the shortcut rail. Below 600px, categories become a two-column grid. Wide results use (48px) identities and (64px) news thumbnails; rows retain (88px) minimum height, (12px) corners and Wide/Compact padding (16/12px). Field/notice corners remain (16px), group-heading gaps (12px), and back/clear controls (44px) square. Names wrap, rows grow and compact news titles retain their full accessible title behind a three-line visual clamp. The [implementation record](design/search-implementation/implementation.md) covers six browser widths in both themes; native-only layout statements above retain their historical scope.

## Elevation & Depth

The minimal surface uses tonal contrast, subtle boundaries and rounded containers for separation. The header carries a bottom-only subtle border (1px). The competition-options popover adds the authored localized shadow (8px vertical offset, 24px blur); reproduce its source effect from Figma. This does not introduce a new global shadow scale. The sidecar records the popover effect separately from primitives.

## Shapes

Use the frontmatter radius scale: small rounding for tighter elements, medium rounding for controls and large rounding for containers. The full-radius primitive remains available for circular forms. Avoid changing the official logo silhouette or artwork to match UI geometry.

## Components

The descriptions below retain the authored Figma patterns and historical review scope. Header/Home now implement these approved patterns; the remaining screen redesigns are specifications. Sidecar HTML/CSS samples remain illustrative documentation-panel renderings, while the implemented source is identified separately in `extensions.homeImplementation`.

### Implemented Header/Home source and states

Reusable `components/ui/CpmUi.tsx` provides `CpmIcon`, `CpmAction`, `CpmPopover` and `CpmMenuItem`; `DesktopHeader.tsx` implements desktop and compact navigation, while `HomeScreen.tsx` composes competition context, highlight, lists and standings. `Crest.tsx` retains the crest fallback. Original exported SVGs in `public/cpm-icons/` render through CSS alpha masks with semantic currentColor; contextual event exports retain their original stroke geometry. The official JPEG keeps its original white field in dark mode.

Theme roles resolve on `.app-root[data-theme]`: page, header/menu/subtle surfaces; primary/secondary/on-action text; subtle/focus border; primary/hover/disabled action; active/hover navigation; menu icon and result/upcoming feature roles. Use the approved mappings in `app/cpm-tokens.css`, not legacy page variables. The light result remains #11151B/#FFFFFF; dark result uses #12223A/#EDF2F9. Cards use header-white in light and #151E2B in dark. Exact roles and source paths are recorded in [implementation evidence](design/home-implementation/implementation.md).

Controls retain 44px minimum height, 12px radius and 2px visible focus. Implemented menus use 120ms ease-out opacity and a small vertical displacement; highlights crossfade in 120ms, and touch scales stay bounded. `MotionConfig reducedMotion="user"` suppresses transforms for reduced motion; CSS transitions become 0.01ms and scrolling becomes immediate. Opacity can still crossfade in 120ms, so do not claim all animation is eliminated. These runtime details do not replace historical 180ms Figma tokens.

The Home draw badge reads **Empate** only for non-null equal scores; W.O. uses central **W.O.** lettering. No penalty logic exists. The Home registration CTA and incumbent news block are removed; their global destinations remain available. Conditional Home news is now implemented, with its composition and visibility contract in [surface brief](design/home-news-brief.md), exact nodes in [news metadata](design/news-metadata.json), and browser evidence/verdict in [implementation record](design/home-news-implementation/implementation.md) and [finish review](design/home-news-implementation/review.md). The earlier [extension review](design/home-news-review.md) remains a historical Figma review. The Home cookie notice uses semantic colors while retaining consent behavior. Browser validation is bounded to the evidence matrix; it is not full WCAG certification.

### Home empty feedback and conditional news extension

Upcoming games, recent results and standings share implemented icon-plus-label empty/error feedback through `ListFeedback` in `HomeScreen.tsx`. Existing calendar/check/trophy exports identify empty states; support identifies errors. The semantic action tint and selected background frame the original icon in a rounded 44px symbol field; Manrope labels wrap beside it. This uses the incumbent palette, type, radius and spacing rather than adding system tokens.

The news composition is implemented by `components/ui/HomeNews.tsx`, appended after lists and standings in `components/screens/HomeScreen.tsx`, with scoped geometry in `app/cpm.css`. Its eight Figma scenes on Home · Notícias (25:33706) remain the desktop/mobile and light/dark one/three-article references. Cards reuse existing typography, original calendar/clock/arrow SVGs and semantic roles; news uses the header surface role in both themes. A single covered card places a (224×144px) cover left and (362.67px) content column right at desktop; compact layouts stack them. The raster layer stays (72×72px). Multiple desktop articles use three columns with (24px) gaps; compact layouts stack. Existing published-news reads are newest first; Home displays at most three and returns no section, heading or reserved gap for zero. Optional or unavailable covers leave a complete text card; no logo fallback is imposed. Each article is one native `/noticia/:id` link with title-based accessible naming, visible focus and native modified clicks; Ver todas opens the existing index. Reading time derives from actual body words at 200/min, falling back to stored read time when no body exists. The source Figma motion inventory is empty; declared runtime tap/arrow feedback respects reduced motion. This local composition changes no shared tokens or global rules. See [native components](design/news-components-native.json), [preview exports](design/news-previews), [historical design comparison](design/home-news-documentation.md), and [implementation evidence](design/home-news-implementation/implementation.md).

### Buttons

The primary action has medium rounding, a minimum control height, Action Blue fill and White text. Hover deepens the blue; disabled uses Soft Grey and Slate; loading is an authored variant. Focus uses an inside stroke (2px) in Ink. Keep a visible label and verify loading/disabled semantics during implementation. State motion uses fast (120ms) or normal (180ms) durations with a reduced-motion alternative (0ms).

### Search

`Search / Desktop` and `Search / Compact` each include default, hover and focus states. Desktop presents a visible search affordance on a subtle surface; compact uses the icon control with an accessible name required in implementation. These are search triggers; an input field has not been established by this header artifact.

### Pesquisa Light components and handoff

Native pages are Pesquisa · Light (`42:40204`), Components (`42:40205`) and Estados (`42:40206`) in “Sem título”; no file key or URL is available. Four component sets are `Search / Field` (`42:40315`), `Search / Category` (`43:40390`), `Search / Result` (`43:40537`) and `Search / Notice` (`43:40568`). Field has eight Wide/Compact × Empty/Focus/Filled/Disabled masters with Query/Placeholder text. Category has ten authored Kind/State variants and Count text; Hover/Focus exist only for Club. Result has twelve authored Kind/Layout/State variants with Title/Meta/GameID text; Default covers Club/Player/NewsCover/NewsText in both layouts, while Hover/Focus exist only for Club. Notice has Empty/Unavailable/PlayerError. [Metadata](design/search-metadata.json) owns exact property keys and IDs; variant option lists do not establish every combination.

Search preserves club name/tag, player nick/game ID (300ms debounce, up to eight players) and news-title matching, with at most five clubs and five news items. Categories filter that returned subset; counts are not database totals. Clubs open their club, players open their club and news opens its article. Initial state invents neither query history nor “Em alta”. Loading/partial player error preserves available clubs/news and omits unknown counts. Recovery, stale-query cancellation and accessible result announcements remain implementation work.

Only 1440/390px have fixture field/category/clear/back prototype paths, using DISSOLVE 120ms ease-out; other state references are static. Real typing, search, retry, destinations, keyboard, ARIA and reduced motion have not been verified. The [32 final PNGs](design/search-previews-final/) comprise 27 scenes, four component sheets and one handoff note. [Checks](design/search-checks.json) record export dimensions/nonempty files; [review](design/search-review.md) records independent native visual acceptance. Seven [native SVG exports](design/assets/icons/search/) reuse original `components/icons.tsx` geometry; shared icons retain their incumbent sources. Shipping raster provenance is native Figma PNG evidence, with the [official logo](design/assets/cpm-official.jpg) unchanged, the existing generic crest fallback reused and the article-cover logo illustrative. See [documentation](design/search-documentation.md) for the full boundary. No source or database changes are part of this extension.

### Pesquisa Dark components and handoff

Native pages in “Sem título” are Pesquisa · Dark (`44:45651`), Components (`44:45652`) and Estados (`44:45653`). Separate Dark sets are Field (`44:45654`), Category (`44:45727`), Result (`44:45792`) and Notice (`44:45931`). They retain Light’s exact text-property keys and authored coverage: eight field, ten category, twelve result and three notice masters. Category/Result Hover and Focus exist only for Club; variant options do not imply a full Cartesian set. [Dark metadata](design/search-dark-metadata.json) owns exact APIs, semantic bindings and IDs.

Reuse the existing Dark roles: page for the canvas, header for the field/header, card for result/recovery surfaces, subtle for hover, primary/secondary for text, selected background for active compartments, and action blue for the authored selected labels, player IDs and field icons. The pale active-navigation text role remains distinct. Focus uses the existing focus border; primary recovery uses action fill and on-action text. No new palette or variables were added. [Binding checks](design/search-dark-binding-checks.json) sampled the four sets and the 390px mixed-results root, with no residual Light color bindings; [opaque color-pair calculations](design/search-dark-checks.json) are design evidence, not runtime WCAG conformance.

The [32 final native PNGs](design/search-dark-previews-final/) comprise 27 scenes, four usage sheets and one handoff note. The official logo retains its white plate, the article-cover logo remains a fixture, the crest fallback stays original, and native SVG exports are shared with Light. Search semantics, subset counts and future partial-error recovery follow the Light contract above. Only 1440/390px fixture field/category/clear/back paths use DISSOLVE 120ms ease-out; other states remain static. Real typing, queries, retry, destinations, keyboard/ARIA and reduced motion require future implementation and browser verification. See [Dark documentation](design/search-dark-documentation.md) and [independent ship review](design/search-dark-review.md). No source or database changes accompany this specification.


### Pesquisa · implemented components and behavior

`SearchScreen`, `useSearch` and `lib/search` now implement the Field, Category, Result and Notice patterns with the shared header, original search SVGs, official logo, existing semantic Light/Dark roles and self-hosted Manrope/Barlow Condensed. Search-specific headings use the observed Title (32px/40px) and grouped heading (24px/28px), without changing the normative system type ramp. Native article-logo covers remain illustrative fixtures; runtime rows use real uploaded article imagery or the original news-icon fallback.

The initial state shows up to three real clubs. Queries load Club/Player/News independently with (300ms) debounce, stale-request cancellation, per-source retry and first-page sizes (5/8/5). Categories and counts describe displayed rows; **Ver mais** adds database pages, and pagination failure retains earlier rows with a retry. Club/player rows link to their club and news rows to their article, preserving modified clicks. Back retains query/category in application memory; clear resets both and focuses the field. Accessible names, live status, visible focus, (44px) controls and reduced-motion handling are implemented and have bounded browser checks. Restrained opacity/tap and color transitions use (120ms); native inventories contain no authored animated nodes. These facts describe this search surface and do not add global tokens or imply comprehensive accessibility conformance. See [current review](design/search-implementation/review.md) and [implementation evidence](design/search-implementation/implementation.md).

### Navigation

`Navigation / Item` includes default, hover, active and focus. Hover uses Soft Grey; active uses Pale Blue, Deep Action Blue and semibold label weight. Focus uses an inside Action Blue stroke (2px). `Navigation / More` includes default, hover and focus. The desktop labels are Início, Jogos, Classificação and Notícias; Mais reveals secondary destinations. See the surface brief for composition rather than treating this destination list as a global rule.

### Account and menus

The open More panel touches its trigger directly, with connected corner treatment. Navigation options use `Menu / Item · Icon and label`: a 44px icon zone with `menu/icon-bg`, a 1px vertical `border/subtle` divider, and a label zone with 12px horizontal inset. `menu/icon-color` controls icon strokes. Icon and label are editable component properties; default, hover and focus are variants. The theme action sits in its own neutral footer, 12px below the navigation group, with a top divider. Maintain the same geometry at 1024px and regular desktop sizes.

Menu icon tokens: light background `#EFF5FF`, icon `#165DDE`; the earlier dark aliases were background `#15376B`, icon `#75AAFF`. Current dark menu icon roles resolve to `color-dark-selected` and `color-dark-action`; historical light roles remain unchanged.

`Account / Signed in` has default, hover and focus variants. Guest users receive Entrar; signed-in users receive the account trigger. More, account and conditional staff-account menus are authored. Open menus by click, touch or keyboard; Escape closes and restores focus. Implementation must use destination links, menu buttons, `aria-current`, accessible names and appropriate expanded state. Hover must not move focus automatically. Verify that a sticky header does not obscure focus or skip-link destinations.

### Desktop header

The master `Header / CPM` set (`2:409`) has Layout (`Desktop`, `Compact`) and Account (`Guest`, `Signed in`) properties. Guest and signed-in previews, More menus and conditional staff-account menus demonstrate use. The official unmodified supplied JPG is stored at [design/assets/cpm-official.jpg](design/assets/cpm-official.jpg).

An independent review of 16 exported images, the official JPG and live Figma concluded **ship**, with no blocking findings. This accepts the light desktop design artifact. Keyboard accessibility, ARIA, working links, reduced motion and browser sizing need implementation verification. That light review did not cover dark rendering. The dark extension is documented separately below; the lower home page remains later scope; the light home-top extension now includes tablet/mobile design examples.

### Home highlight and supporting content

`Home / Highlight` (`4:1534`) has eleven variants: desktop result, upcoming, approved, draw, W.O., loading, empty and error, plus compact result, upcoming and approved. The long-name compact example (`4:1421`) is separate from the set. Rounded containers use dark scoreboard, pale-blue schedule and light approval compositions without introducing shadows.

Results use `feature/result-bg` (Neutral 950), white score and primary ink, Neutral 200 muted ink and Neutral 800 internal lines. Crest holders flank an 80px score. A calendar block separates day and month; round and time remain compact metadata. One blue **Ver partida** action includes an arrow.

Upcoming uses Pale Blue and a centered day/month/time composition (illustrative **08 OUT · 20h30**). The footer carries **Rodada 6** and **Ver confronto**, without repeating the date/time. Approval uses an 80px initials tile, one **Inscrição aprovada** confirmation line, relative **Aprovado há 2h** recency and **Ver competição**. Approval uses initials because registration data supplies no crest. The result crest holders and lists use the existing generic crest fallback. All sample club names, dates, scores and standings are illustrative.

Competition selection and favorites are distinct controls above the cards, with no generic page heading or subtitle. The standings card names its competition and exposes **Tabela completa**; match lists expose **Ver jogos** and **Ver histórico**. List rows pair crest and club name with score/time capsules and measure 88px in the authored examples. Status labels combine words with icons or score context. Each event keeps one labeled primary action, through the reusable `Home / Event action` component (`4:3065`, editable `Label#4:15`). Names wrap and cards grow.

Loading explicitly says **Carregando destaque** with skeleton shapes. Empty says **Ainda não há destaques** and offers **Ver competições**; it does not assert that a season has not started. Error says **Não foi possível carregar** with **Tentar novamente**. These are authored visual states and control intentions; live loading, retry, navigation and backend behavior require implementation. The refresh review inspected eight scenes and eight edge-case captures and found no material visual defects. Its initial **fix** disposition concerned stale persistence only; the final persistence verdict was **ship**. No authored banner motion, browser accessibility or dark-theme conformance is claimed.

### Competition selector and original icons

`Home · Destaques` (`3:1127`) holds the six principal responsive result layouts. `Home · Interações` (`6:4085`) holds selector and favorites demonstrations; `Home · Estados` (`6:4086`) holds full upcoming/approval scenes, highlight specimens and mobile states. Current IDs and references are in [states metadata](design/states-metadata.json).

The shared selector set (`6:6134`) has Default (`6:4087`), Hover (`6:6119`), Focus (`6:6123`) and Disabled (`6:6127`) variants, with editable `Competition#6:17`. The reusable Options component is `6:4094`, with option row frames `6:4095` and `6:4102`; those rows have no exposed editable properties. Labels are illustrative fixtures; implemented options must use actual competition data. The selector is 44px high, 248px wide on desktop, with 12px radius and 2px focus stroke. Options are 52px high; the menu has 8px padding, 4px item gap, 8px trigger gap and 320px maximum width. Preserve the approved header `SPACE_BETWEEN` alignment in cloned scenes.

Without favorites, the selector controls local matches and standings. With favorites, it is absent: lists merge saved competitions, each match names its competition when there are multiple favorites, and standings identify the first favorite. Approval belongs to the favorites-only branch; desktop `4:1983` and mobile `6:5626` show noninteractive **Competições salvas**, count **1**. Desktop demonstrates closed → open → choose 2026/2025 → closed/selected; the 2025 selection is terminal. Open mobile scenes are static references.

Use all 17 original [SVG exports](design/assets/icons/README.md), preserving paths, viewBox, caps, joins and stroke geometry. Most originals have 1.5px strokes; dark-highlight trophy/check/clock use the documented 1.7px white/muted contextual override. The actual event-arrow instance (`4:3067`) has its own white 1.7px export. Do not substitute similar icons from another library.

**The Literal Fidelity Rule.** Future site implementation must reproduce approved spacing, sizes, colors, typography, icons and states exactly, with no additional artistic redesign. Follow [fidelity handoff](design/fidelity-handoff.md), load the real fonts, and compare identical viewport/data/state screenshots before declaring fidelity. The independent 19-scene review accepted this static Figma extension; the separate approval-context correction review found the correction resolved with no regressions and **ship** within that scope. [Review record](design/states-review.md) distinguishes those scopes.

### Dark components and prototype scope

Dark component references include Header / CPM (`8:6823`), Menu / More (`8:6758`), Home / Highlight (`8:7209`), Event action (`8:7548`), Competition options (`8:7552`) and Competition selector (`8:7565`). Dark pages are Foundations (`10:16192`), Components (`8:6691`), Home Components (`8:6692`), Header (`8:6693`), Home (`8:6694`), Interactions (`8:6695`) and States (`8:6696`). The metadata maps every source light root/component to its dark counterpart and records variable IDs and rebased reactions.

The six main dark layouts are result 1440 (`8:7953`), 1024 (`8:8181`), 2560 (`8:8406`), 768 (`8:8634`), 390 (`8:8846`) and 320 (`8:9058`). Full upcoming and favorites-only approval references are `8:10680` and `8:10905`; mobile approval is `8:11615`. Layout, text styles, spacing, original logo, generic crest fallback and product rules remain those of the approved light reference.

The theme footer displays **Tema claro** with the authored sun component (`8:16187`), exported as [8-16187.svg](design/assets/icons/8-16187.svg), preserving 20px geometry, 1.7px stroke and Dark `menu/icon-color` binding. The original JPG retains its white background; no inverse logo is introduced. Existing SVG geometry remains intact, with contextual dark ink bindings including the event arrow.

The authoring pass records 96 rebased prototype reaction entries and dark selector/More flow references. **Tema claro** expresses intended theme switching; a complete intertheme flow has not been established by this prototype. Dynamic data fetching, keyboard, Escape/focus restoration, ARIA and browser theme persistence remain implementation work. Technical spot checks reported zero Dark bindings in light roots `4:1655`, `4:2606`, `2:254` and `2:568`; this is a bounded check, not an exhaustive light regression claim. The independent dark visual review returned **ship** after inspecting 36 final captures (35 screen/state references plus Foundations) and comparing the light approval desktop/mobile and 320px selector references; it reported no material defects or capture-validity failures within that scope. See [dark review](design/dark-review.md). This does not validate runtime behavior.

### Jogos Light components and handoff

`Games / Category tab` (`13:16428`) contains 10 native variants: Default, Selected, Hover, Focus and Disabled in wide and compact layouts. Label, Count and Show count are exposed properties. `Games / Match` (`13:16699`) contains 10 native variants: wide/compact scheduled, result, draw and W.O., plus wide scheduled Hover and Focus. Exact property keys and applicable text fields are recorded in [Games metadata](design/games-metadata.json); compact results expose separate home/away scores. Focus specimens use a 2px stroke. Each whole match represents one detail link; the arrow is a cue within that target.

Competition is noninteractive active-competition context. Hoje contains `agendado` records whose date begins “Hoje”; Próximos contains the other `agendado` records; Resultados contains `finalizado`, grouped by round descending. Existing `ao_vivo` records remain excluded from these Games lists. Counts represent the full category. Date grouping adds visual organization without a date filter. No new search, favorites, live filtering or competition selector is specified.

Figma pages are screens (`13:16350`), components (`13:16351`) and states (`13:16352`); fixture/behavior notes are `13:19329`. [Final Games previews](design/games-previews-final/) contain 19 authoritative exports: 10 main scenes, eight state/edge scenes and one interaction sheet (`13:19172`). Earlier pass-one captures are historical. The [independent Games review](design/games-review.md) returned **ship**, with no material defects in those exports. Its advisory is that the optional Disabled tab resembles Default; distinguish its visual and semantic state if implemented. No principal flow uses that variant.

At 1440 and 390px, all three main categories switch on the same Figma page with DISSOLVE, 120ms, ease-out. Other widths are static Hoje references. Match cards specify existing application detail-navigation intent; no detail Figma page was built. Empty Hoje's “Ver próximos jogos” specifies an upcoming-tab action but is not prototyped across pages. At the Figma revision, error/retry was a future wiring specification. The subsequent Jogos implementation consumes DataContext error and wires retry; the native prototype boundary remains historical. Loading/error omit unknown counts; empty categories show zero; a missing timestamp reads “A definir”. Clubs, dates and scores are illustrative, using 5 October 2026 for Hoje, upcoming 8/10 October and result rounds 6 then 5.

The original Light review accepted a Figma artifact without changing application code. Subsequent Light/Dark Jogos implementation and its browser checks are recorded in [implementation evidence](design/games-implementation/implementation.md), including keyboard selection, focus, accessible match names, one whole-card target, ARIA and reduced-motion behavior. [Games brief](design/games-brief.md) and [fidelity handoff](design/fidelity-handoff.md) carry the implementation boundary. Adding bindings for existing geometry after review did not change the inspected pixels.

### Jogos Dark components and handoff

Dark components (`15:19337`), screens (`15:19338`) and states (`15:19339`) contain the native tab set `15:19340` and match set `15:19416`: ten variants per family, preserving the Light property keys and content rules. Exact variants and properties live in [Dark Games metadata](design/games-dark-metadata.json). The fixture/behavior note is `15:22215`; the interaction sheet is `15:22080`. The original JPG logo retains its white background, raster crest appearance and original SVG paths; Manrope and Barlow Condensed remain shared.

Hoje still shows `agendado` with dates beginning “Hoje”; Próximos shows other `agendado`; Resultados shows `finalizado`, grouped by descending round. Competition context remains noninteractive; `ao_vivo` is excluded and no list search or filter was added. Dates, clubs and scores are illustrative. Loading/error omit unknown counts, empty shows zero and missing time reads “A definir”.

At 1440/390px, the three main categories switch on the same page with DISSOLVE 120ms ease-out; other widths are static. Whole-card detail is existing intent with no detail frame. Empty Hoje's CTA has no cross-page prototype reaction; at the original Dark Figma revision, error/retry wiring, theme switching and keyboard/ARIA runtime remained unverified. Those application behaviors now have separate Jogos implementation evidence.

The [independent Dark Games review](design/games-dark-review.md) returned **ship** after inspecting all 19 final PNGs and comparing representative Jogos Light/Home Dark references. It found no material defect or invalid capture. Its optional Disabled-tab advisory notes similarity to Hover; principal scenes do not use it. No further visual QA was needed for this documentation merge. That Figma review did not change the application. The later Jogos implementation uses final native references with identical theme, viewport, fixture state and real fonts; its production verification and bounded review verdict are documented separately.

### Classificação components · historical native reference

Native pages are screens (`21:24107`), components (`21:24108`) and states (`21:24109`). `Classification / Form` (`21:24118`) has four variants with `Result=V/E/D/None`; None represents absent history with a dash. `Classification / League row` (`21:24439`) has eleven authored variants across `Layout=Desktop/Compact`, `Zone=Qualified/Middle/Relegation`, `Expanded=false/true` and `State=Default/Hover/Focus`. `Classification / Tie` (`21:24673`) has nine authored variants across `Format=Single/Two-leg` and `State=Finished/Penalties/Scheduled/Pending/Bye`. These are the actual authored combinations, not every Cartesian combination. [Metadata](design/classification-metadata.json) owns canonical post-combine property keys: row Position/Name/P/J/V/E/D/GP/GC/SG/SGdetail and tie Code/Status/Home/HomeScore/Away/AwayScore/Path/Decider/Leg1/Leg2. These are historical Figma instance APIs, not the current product model: Penalties and Decider are obsolete after the user correction that MamoBall has no penalties. Preserve the remaining native geometry/icon references without copying those obsolete fields into the application.

Preserve the official JPG [logo](design/assets/cpm-official.jpg), raster crest fallback, real fonts and original SVG geometry. Six exports are [ball](design/assets/icons/classification-ball.svg), [bell](design/assets/icons/classification-bell.svg), [share](design/assets/icons/classification-share.svg), [rules](design/assets/icons/classification-rules.svg), [menuDotsH](design/assets/icons/classification-menuDotsH.svg) and [chevronUp](design/assets/icons/classification-chevronUp.svg). The first five reuse `components/icons.tsx` paths; chevronUp reuses the existing Figma chevron path rotated 180 degrees. Expansion shows the upward collapse cue. Retain contextual semantic paint bindings; do not replace originals with lookalike library icons.

Competition defines the sporting format: Liga exposes Tabela/Artilharia, cups expose Chave/Artilharia. The selector's Liga Paulista/Copa Paulista/Taça CPM options are demonstrative competitions, not a three-format toggle. Preserve existing selection, favorite, notifications, share, regulations, scorer access and club navigation from `components/screens/TournamentsScreen.tsx`; `lib/db.ts` orders standings by points then goal difference. Top four and last two when more than four clubs are current conventions, without verified official rules. Five-result history uses V/E/D without invented rank trends. At the native Figma revision, Competition lacked a format/bracket structure and Match.stage was only text. The application now has explicit competition formats and configurable ties/stages/slots/leg links, with aggregate and winner resolution in `lib/bracket.ts`; see the separate current implementation record. MamoBall has no penalties; earlier penalty examples and fields are obsolete following the user correction. Stage text and point tables cannot supply a real bracket.

Two-leg cards distinguish aggregate from leg scores, date and home/away ordering. A completed first leg plus scheduled return remains partial; a tied score or aggregate alone does not supply a winner. Do not invent a replacement tiebreaker. Pending slots use descriptive origin and unknown-score dashes; BYE says advancement without an opponent and does not fabricate a score. Fixtures are demonstrative. Loading/error must use a known selected competition and its known round progress only when available; unknown progress must not inherit the sample “Rodada 8 de 14”. At the Figma revision, error/retry and live data were future wiring; the current implementation wires them, with browser evidence limited to the checked real league.

The bounded Figma prototype uses DISSOLVE (120ms): Liga 1440/390 opens selector/actions, selector chooses the three illustrative competitions, Liga ↔ Artilharia at 1440/390, single/two-leg phases at 390, and first-row Liga expansion/collapse at 390/320. Other widths are static; knockout Artilharia and a selector with knockout active have no connected path. Favorite/notification start off; action controls communicate intended existing behavior, without executing application effects. Club/match/external/retry actions likewise remain intentions. Keyboard, ARIA, focus management, reduced motion, browser behavior and database aggregation are implementation checks.

The [independent Classification review](design/classification-review.md) returned **ship** after inspecting all [34 final PNGs](design/classification-previews-final/), without material defects or invalid captures. Advisory: tablet Liga density is generous; revisit only if real comparison tasks justify it. That review remains unchanged and Figma-only, including obsolete penalty references; it does not validate current sporting behavior or application runtime. Native brief, metadata, tokens and handoff remain visual references within that historical boundary. Current application status and browser evidence follow below.

### Classificação · current application status

Classificação is implemented by `components/screens/ClassificacaoScreen.tsx`, with the existing TournamentsScreen import re-exporting it, scoped geometry in `app/cpm.css` and shared Light/Dark semantic roles in `app/cpm-tokens.css`. Manrope names/UI, Barlow Condensed titles/numeric emphasis, official integral logo, raster crests, original SVG paths and reduced-motion-aware transitions preserve the incumbent world. The real browser evidence shows `serie b teste`, three clubs and Liga; it does not show an active knockout competition. League priority remains position/club/points with J/SG/form and separate expansion in compact layouts; rows and names grow with content. Current conventions do not mark the checked three-club sample as playoffs/relegation.

The browser matrix covers 1440×1000, 1920×1080, 820×1024, 768×1024, 390×844 and 320×740 in light/dark, with reported no overflow/errors and keyboard-tab, actions and theme checks. Final reviewer result received: **ship**, no material corrections pending. [Implementation record](design/classification-implementation/implementation.md) links the actual [.impeccable/review captures](.impeccable/review/) separately from [native Figma exports](design/classification-previews-final/), and records TypeScript/build/lint results and their limits. These bounded checks are not exhaustive accessibility certification or visual verification of real knockout data. No penalties or replacement tiebreaker are implemented; tied/unfinished results do not advance a winner. The configurable staff bracket and additive database migration are documented in the implementation record; their resolver smoke checks must not be presented as live bracket screenshots.

### Cookie notice · historical Figma components and handoff

The Cookies extension preserves incumbent CPM palette, fonts, styles and scalar/semantic variables. The following records the historical Figma specification; the approved notice is now implemented as documented below. Native pages are Cookies · Components (`34:36070`), Cookies · Aviso (`34:36071`) and Cookies · Estados (`34:36072`), with usage note `34:40201`. The original editable [cookie SVG](design/assets/icons/cookie.svg) supplies icon component `34:36076`; `Cookie / Refusal` (`34:36089`), `Cookie / Terms` (`34:36100`) and `Cookie / Notice` (`34:36181`) provide reusable variants. Four notice masters pair Light/Dark with Wide/Compact. Acceptance reuses incumbent Primary action instances. Exact source IDs and all 28 exports are in [cookie metadata](design/cookie-metadata.json); native master evidence is in [snapshot](design/cookie-components-native.json).

Use a flat nonmodal bottom card with a 1px border, 16px radius, 44px icon zone and 44px controls. Wide uses up to 480px with 24px padding; Compact uses 16px gutters/padding, Terms above equally sized refusal/acceptance choices. Title uses incumbent Barlow Condensed 24/28; body/controls use Manrope 14/20. Copy describes visitor preferences in browser storage, preserving the `CookieBanner.tsx` / `AppContext.tsx` boundary; logged-in account storage is separate. Keep Termos, Recusar and Aceitar without an X or invented policy/analytics claims. Terms retains existing placeholder-modal intent.

The bounded prototype connects acceptance/refusal at 1440/390 in both themes to Home without notice using DISSOLVE (120ms). This demonstrates visual dismissal; browser storage, account consent, automatic theme selection, keyboard interaction and modal execution remain implementation checks. The [independent review](design/cookie-review.md) returned **ship** at Figma visual scope after opening four masters, twelve context previews, eight hover/focus specimens and four dismissed states. No browser conformance is claimed.

Final native Wide masters are 480×166 and Compact masters are 358×222, with auto-layout HUG height and a 1px border included in layout. Bounds remained stable after screenshots. Fresh provider exports are 480×166 Wide and 358×220 Compact, with complete visible corners. The Compact native/export difference is 2px; its cause is unknown. Context placements retain the original 164/220 height arithmetic, intended to leave 24px Wide and 16px Compact at the bottom; native bounds provisionally imply 22px/14px. Visual exports do not establish identical native/export pixel bounds. Future codegen must read fresh native context, preserve intrinsic HUG sizing, reconcile the export discrepancy and apply intended offsets with safe area and scroll clearance; do not hardcode stale 164/220 heights. See [brief](design/cookie-brief.md) and [documentation](design/cookie-documentation.md) for the bounded handoff.

### Artilharia and cookie notice · current implementation · 2026-10-06

The approved scorer list and paired Light/Dark cookie notice are implemented in the incumbent world; [implementation evidence](design/scorers-cookie-implementation/implementation.md) supersedes the earlier cookie native-only status for current runtime behavior. Artilharia uses full-width ordered rows with minimum height (96px), existing 12px corners, wrapped names, original crests and Score Compact numerals. All returned scorers and their club destinations remain available. Native scorer authority is Light only; Dark resolves the incumbent semantic equivalents.

The cookie card preserves native intrinsic height, original icon, established type and paired theme roles. It uses Wide (480px maximum / 24px padding) and Compact below 600px (16px padding/gutters); the native Compact 222px versus provider 220px discrepancy stays explicit. Safe-area placement adds 80px above existing bottom navigation below 1024px, and measured scroll clearance rebinds on surface navigation, resize and observed size changes. Accept/refuse persistence is retained; Terms keeps explicitly placeholder legal copy with opt-in keyboard dialog behavior. Historical native prototypes and reviews above keep their original scope. Final validation records 34 scenes plus 12 component captures, passed TypeScript/lint/isolated production build, and a **ship** verdict resolving the sole navigation-clearance fix. Frontmatter tokens and `.impeccable/design.json` remain unchanged; no new identity or token rule is introduced.

### Login Light · native components and handoff · 2026-10-06

Login for existing accounts is complete as a native editable Light specification, with **ship** from the [independent review](design/login-review.md) and no material fixes pending. It preserves the official identity, incumbent semantic palette, Barlow Condensed/Manrope styles and rounded flat world. Reusable native e-mail/password field sets expose exact Label/Value text properties; filled/visible fixtures require explicit Value overrides. Fields are 56px with 44px icon compartments, labels use the incumbent label role and values use body; the form is bounded to 400px inside a 1280px desktop split scaffold. Compact references retain the official lockup and back control. These are auth surface patterns, not a change to the normative palette or type ramp.

[Login documentation](design/login-documentation.md) records three pages, component APIs, nine SVG assets and all 14 final PNGs across six widths and eight state families. The sole fixture prototype toggles mobile password visibility; Pending reserves provider space without fabricating a security widget. Application authentication remains incumbent. Registration, recovery, Dark and runtime/browser verification remain separate future tasks; the existing frontmatter and sidecar are preserved.

### Registration Light · native components and handoff · 2026-10-06

Criar conta Light is complete as a native editable specification with **ship** from the [independent review](design/register-review.md) of all 28 final PNGs, with no material fixes pending. This ordinary Login-world extension reuses native Brand/Primary and e-mail/password fields, semantic white/neutral/blue, Barlow Condensed/Manrope and the established auth geometry. Dados → Código → Senha keeps one task dominant and collapses prior nick/e-mail into a compact identity summary. New native Nick, OTP and stage components remain editable; OTP is one logical numeric input represented by eight visual slots. The original check SVG supplements reused Login icons; the official brand remains intact.

[Registration documentation](design/register-documentation.md) records exact APIs, three pages, each stage at six widths, eight separate states and the two synthetic prototype fixtures. The same-page 120ms dissolve sequence and secondary Login-return fixture perform no real input, OTP/email, timer, persistence or success. Runtime authentication remains incumbent; numeric paste/autofill, ARIA, provider sizing, real resend timing, abort cleanup and browser verification remain implementation work. This extends the historical Login handoff above; Recovery and auth Dark remain separate future design tasks. Normative frontmatter, sidecar and application token CSS are unchanged.

### Recovery Light · native components and handoff · 2026-10-06

Recuperar senha Light is complete as a native editable continuation of approved Login/Registration Light, with **ship** from the [independent review](design/recovery-review.md) of all 35 final PNGs and no material fixes pending. It preserves the official logo, semantic white/neutral/blue, Barlow Condensed/Manrope, bounded desktop/compact auth scaffold, 44px controls, 56px fields and 12px/16px corners. The sole new specialized component is the native recovery tracker `54:11865`, with `Stage=E-mail/Código/Senha`; e-mail/password/Primary and the Registration OTP are reused. Prior identity becomes a compact e-mail summary; eight visual slots remain one logical numeric input.

[Recovery documentation](design/recovery-documentation.md) records exact APIs, three pages, all three stages at six widths, 16 separate states, one Login-return fixture and direct native PNG provenance. The 120ms dissolve/ease-out fixture sequence ends at Saving, with masked/visible password fixtures and secondary Login return. It establishes no real input, OTP/email, timer, authentication, persistence or success. Pending reserves provider space only. This current Light design status extends the historical Login/Registration handoffs above, preserving their original scopes; auth Dark and runtime keyboard/ARIA/autofill/paste/provider/mobile-keyboard/motion checks remain future work. Normative frontmatter, sidecar, token CSS and application authentication are unchanged.

### Salvos e Avisos Light · native components and handoff · 2026-10-06

Salvos, Avisos and full Aviso are complete as editable native Light specifications, with **ship** from the [independent review](design/library-review.md) of 55 final root PNGs and no material fixes pending. This ordinary Pesquisa/Header/Auth-world extension preserves the official logo, existing semantic white/neutral/blue, Barlow Condensed/Manrope, 12px controls/16px surfaces, 44px filters and bounded 1280px content. Wide Salvos groups competition, club, match/time and news rows in two columns; compact references use wrapped filters and a complete single sequence. Native Filter Default/Selected plus Focus, four saved row kinds in wide/compact, and Notice Unread/Read plus Focus expose exact editable text APIs.

[Salvos/Avisos documentation](design/library-documentation.md) records three pages, six widths, 18 main scenes, 27 states, 10 fixtures, original asset provenance and all 46 matching native reaction targets. Same-page 120ms dissolve/ease-out fixtures demonstrate auth entry/back, Clubes filtering, example news removal/undo, read-all/unread-empty and three matching message details. Only games has a native destination; registration/rules remain static intentions and first-read filtering has no persistent simulation. User instruction is Figma first, implementation later. Runtime SavedScreen remains incumbent and Avisos history/read state is proposed; no app/database/admin/push functionality or browser accessibility is established. Normative frontmatter, sidecar, token CSS and historical auth records are preserved.

### Auth, Salvos e Avisos Dark · current native handoff · 2026-10-06

Dark counterparts of Login, Criar conta, Recuperar senha, Salvos and Avisos/full Aviso are complete, with **ship** from the [independent finish review](design/auth-library-dark-finish-review.md) and no material fixes pending. [Documentation](design/auth-library-dark-documentation.md) records ten new pages, 132 roots (14/28/35/55), 41 reusable masters, six widths and 183 PNG artifacts including ten derived contacts. This supersedes historical future-Dark statements for these native designs while preserving every earlier review/implementation scope.

The ordinary extension reuses the incumbent Dark palette, typography, spacing, assets, 44px controls, 56px inputs and 12px/16px corners. The sole local native Dark alias `auth/input-border` (`VariableID:54:25406`) references existing `color/neutral/400` for 1px default auth outlines; existing 2px blue focus remains. It changes no normative palette primitive, global border role or application CSS. The stored audit has zero Light semantic paints across 173 roots/10,279 nodes; 233 inherited dimensional aliases resolve identically. All 100 stored synthetic reactions match rebased targets. These records do not establish browser accessibility or runtime execution.

User instruction remains Figma first, implementation later. Auth input/OTP/provider/timers/success/persistence remain synthetic; Library first-read branching is static, three notice details match and only games has a native CTA fixture destination. Runtime auth/SavedScreen/Avisos/database/admin/broadcast work is unchanged. The sidecar adds only `extensions.authLibraryDark` handoff metadata; frontmatter, existing globals, narrative and historical prose remain preserved.

### Auth, Salvos e Avisos · current application implementation · 2026-10-07

Login, Criar conta, Recuperar senha, Salvos, Avisos and full Aviso now implement their approved Light/Dark native designs in the application. [Implementation documentation](design/auth-library-implementation/documentation.md) records reusable source, native grounding, 128 fixture browser captures across six widths/both themes, four live public empty-state reads and bounded behavior/database checks. The final [independent review](design/auth-library-implementation/review.md) returned **ship** after all three material fidelity fixes were resolved in two confirmation rounds. Historical native-only entries above retain their original scopes; their pending implementation statements are superseded for these runtime surfaces.

The finished extension reuses official artwork/icons/fonts, the incumbent type ramp and paired semantic palette, 400px auth forms, 44px controls, 56px fields and 12px/16px corners. Wide/compact auth share fields/tracker/summary/actions and one logical eight-digit OTP input; Salvos retains two wide columns/complete compact category order. Avisos tools stay vertically stacked at all widths; the 768px notice content uses native 32px top padding. The scoped Dark auth outline (#929BA8) implements the existing native `auth/input-border` → `color/neutral/400` alias rather than introducing a palette primitive or changing global border roles. Normative frontmatter and `.impeccable/design.json` remain preserved.

Authentication, saved history/removal/undo, public notices/read-one/all/retry and typed detail destinations are wired; minimal staff authoring extends incumbent Admin without a new Figma Admin design. Request adapters exercised account/staff behavior; real hosted SQL tests verified publication/ownership/role boundaries in rolled-back fixtures. No real credential or email/provider-delivery validation, numerical pixel-equality claim or deployment is made. Pre-existing service advisor warnings remain reported in the handoff, outside this visual-system extension.

### Partida Light · native components and handoff · 2026-10-07

Partida Light is complete as an editable native extension of approved Jogos/Header, with **ship** from the [independent review](design/match-review.md). [Documentation](design/match-documentation.md) records three pages, six widths (320/390/768/1024/1440/2560), 32 direct root PNGs, 17 component/API records and 42 valid fixture reaction source/destination references. Score/club identity leads; Wide pairs grouped goals with prior encounters and Rodada below, while Compact uses complete Gols/Confrontos/Rodada sections. Existing official Brand/header/crest/icons, semantic white/neutral/blue, Barlow Condensed/Manrope, bounded 1280px content, 44px actions and 12px/16px corners remain.

Native Action/Section tab/Wide and Compact Scoreboard sets expose reusable variants; scoreboards expose exact club names, tags, scores, dates, stage and crest swaps. Final Compact names are centered editable native TEXT across all six statuses; the 1024px context rail uses HUG height. Goal rows group attribution without inventing chronology; optional assists accompany normal goals, while own goals retain the opposing roster and explicit Gol contra attribution. Fixtures are illustrative, with no penalties/minutes/cards/possession or invented tiebreakers. No new normative token or global rule is introduced.

Synthetic navigation demonstrates section switching, save/copied feedback, Jogos return and matching prior/other-game details. It performs no data writes, actual sharing or reminder delivery. Application MatchScreen remains incumbent; Dark match authoring, site implementation and browser keyboard/ARIA/touch/motion/responsive verification remain future work. The three reviewed corrections are resolved; frontmatter, sidecar and unrelated history are preserved.

### Partida Dark · native components and handoff · 2026-10-07

Partida Dark is complete with **ship** from the [independent finish review](design/match-dark-review.md) and no material fixes pending. [Documentation](design/match-dark-documentation.md) records three new pages, 32 direct native PNGs plus four derived contacts, six inherited widths, 18 cloned Dark component/API roots and 42 stored matching native reactions. Root actions, scoreboards and goal/history/round instances use Dark masters; nested shared components retain semantic overrides and original property APIs/geometry. Centered editable compact identity, HUG contextual rail, Barlow Condensed/Manrope, bounded 1280px content, 44px actions, 12px/16px corners and original JPG artwork on rounded white logo tiles remain.

This ordinary theme extension reuses incumbent Dark page/header/card/subtle, foreground, secondary, action, selection and focus roles. Stored audit records zero content, visible Light paint or geometry/visibility/clipping/alignment differences across 32 roots. Six opaque contrast pairs are 7.21–14.91:1, with blue on selected at 4.56:1; these are native color evidence, not browser accessibility acceptance. No normative token, frontmatter, sidecar, application or database change is introduced. Synthetic fixtures preserve the approved sporting contract and prove no real persistence/share/reminder/live delivery. Historical future-Dark statements are superseded for native match design only; application implementation and browser verification remain future work.

## Do's and Don'ts

### Do:

- **Do** use the official logo with its original artwork and proportions.
- **Do** bind new Figma components to the existing primitive and semantic variables.
- **Do** use display typography and useful calendar, crest, arrow and score/time details to reduce redundant prose.
- **Do** preserve visible destination labels and distinguish active state through fill and weight.
- **Do** verify keyboard, focus, accessible names, links and reduced motion in the implemented browser surface.

### Don't:

- **Don't** reintroduce a generic home heading/subtitle or duplicate upcoming date/time in the footer.
- **Don't** describe historical Figma-only reviews as browser coverage or resolver smoke checks as visual validation of an active knockout competition. Header/Home/Jogos/Classificação have separately bounded implementation evidence.
- **Don't** recolor, redraw, crop or distort the official logo.
- **Don't** reduce interaction targets to force the desktop header into a narrow viewport.
- **Don't** treat any Figma visual review as validation of browser accessibility, dynamic behavior or the full home page; apply each review only to its recorded artifact scope.
