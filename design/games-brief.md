# Jogos · Light

> Current status · 2026-10-06: Jogos is implemented in the real site in Light and Dark. [Implementation record](games-implementation/implementation.md) covers actual data/navigation/retry behavior, production browser evidence and the four-fix ship verdict. The original Figma brief below preserves its design-stage wording, fixtures and prototype boundaries; statements about future wiring or unchanged application describe that historical stage.

## Direction and mode
Operate. Figma-only extension of the approved CPM light system. Preserve official logo, black/white/blue, Manrope UI and Barlow Condensed display. No new visual-world workshop: user requested the same style, more useful visuals and less string-only presentation. Primary task is finding a fixture/result and opening its existing detail screen.

## Product truth
Sources: components/screens/JogosScreen.tsx, components/ui/MatchTile.tsx, components/ui/Primitives.tsx, contexts/DataContext.tsx and lib/types.ts. Three tabs Hoje / Próximos / Resultados. Hoje includes agendado with date beginning Hoje; Próximos includes other agendado; Resultados includes finalizado grouped by rodada descending. Each match opens existing match details. DataContext fetches the active competition. Competition context is noninteractive, not a new competition filter. No search, month picker, live filter, pagination or favorites logic added. ao_vivo exists in the model but is excluded from these lists by incumbent logic; do not silently change this.

## Visual organization
Header Jogos active. Concise Jogos heading and named competition context, no generic subtitle. Three tabs with real icons, computed count, selected fill and keyboard focus variants. Results preserve round grouping; today/upcoming date grouping is a presentation of existing records and does not create date filtering. Desktop uses white grouped panels, aligned crest/team pairings and distinct blue time blocks or bold score capsules. Mobile uses full-width match cards with two team rows, readable names and contextual time/result. Whole match is one link target; visual arrow indicates detail, never a nested second button.

## Responsive and states
1440 / 1024 / 2560 / 768 / 390 / 320. Content max1280, gutter24 on tablet/compactdesktop and16mobile. Header88desktop/72small. Reuse approved spacings/radii/styles/real icons. Mobile tabs use two rows to fit icon/count and full label without truncating Resultados. Loading, today's empty with Ver próximos jogos, empty upcoming, empty results, named error/retry, focus/hover, draw, W.O., missing scheduled timestamp and long names specified separately. Blank data must not be labeled a fetch error. Recovery from DataContext error exists but JogosScreen does not currently consume it: error specimen is a UI spec for future wiring, not claimed current behavior.

## Demonstration data
All fixtures synthetic, consistent with Copa Paulista2026 and existing four demo clubs. Reference date2026-10-05 for Hoje. Today4/upcoming4/results4; count represents each full category, not one round. Dates for upcoming8/10October; results4/3October rounds6/5. Timestamp missing means A definir, not invented 00h00. Original generic crest used without recoloring. Do not present figures as live league data.

## Fidelity
Native Figma components/variables/auto-layout and original SVG geometry. App implementation remains later. Keep light/dark home and previous approved headers untouched. Main 1440 and 390px prototype tab switch; cards refer to existing app detail intent, no invented match-detail Figma page. Browser keyboard/ARIA/live data/reduced motion remain implementation checks. Reusable masters and metadata must carry exact values and exposed text properties.


## Final artifact and token record

Pages: Jogos screens `13:16350`, components `13:16351`, states `13:16352`. Fixture/behavior card: `13:19329`. Category tab set `13:16428` has 10 native variants (five states × two layouts); match set `13:16699` has 10 native variants (eight kind/layout variants plus wide scheduled hover/focus). Exposed text and boolean property keys are canonical in [games-metadata.json](games-metadata.json).

[games-previews-final/](games-previews-final/) is the authoritative export set: 19 PNGs, comprising 10 main scenes, eight state/edge scenes and one interaction sheet `13:19172`. Earlier pass-one exports are historical. Hoje covers 1440, 1024, 2560, 768, 390 and 320; Próximos and Resultados cover 1440/390. State coverage includes empty categories, loading, error, long names and missing time.

Four new primitives record existing 20px vertical padding, 112px time cell, 52px tab and 56px date/round marker. Five Light aliases include mobile tabs bound to existing 72px compact-header. IDs and alias references are in [games-tokens.json](games-tokens.json), also merged into [tokens.json](tokens.json). Current totals: 85 primitives / 34 Light aliases / 37 Dark aliases = 156 variables. The four geometry bindings preserve reviewed pixels; Home and Dark artifacts remain preserved.

## Prototype boundary

At 1440 and 390px, Hoje / Próximos / Resultados switch between main scenes on the same screens page using DISSOLVE 120ms ease-out. Other widths are static Hoje references. Whole-card detail navigation remains existing application intent; no detail Figma page was created. Empty Hoje's Ver próximos jogos expresses the upcoming-tab action but is not wired in Figma because the states and main scenes occupy separate pages. Error/retry remains future JogosScreen integration. No active search, competition filter, favorites or live behavior is added by this artifact.

## Finish review and implementation handoff

[games-review.md](games-review.md) returned **ship** after independently inspecting all 19 final exports, with no material defect or capture-validity failure. The optional Disabled tab closely resembles Default; distinguish that state if used in a real flow. Browser keyboard tab selection, focus visibility, one whole-card detail target, accessible match names and reduced motion require implementation verification.

The approved fonts, original SVG icons, crest and official logo remain the fidelity reference. [DESIGN.md](../DESIGN.md), [.impeccable/design.json](../.impeccable/design.json) and the Games section of [fidelity-handoff.md](fidelity-handoff.md) document the merge. This finishes the Light Figma design scope; no application code or dark Jogos design was changed.
