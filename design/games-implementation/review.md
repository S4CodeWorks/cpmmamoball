disposition: fix

## persistence

Pass for this existing-world Operate extension. PRODUCT.md and DESIGN.md exist; the approved Light/Dark Jogos briefs, metadata, final exports, implementation brief and native grounding records identify the authority. This task translates approved native Figma layouts into the incumbent application; a new-world concept seed or raster-comp build state is inapplicable. Existing Figma-only documentation must receive the subsequent documenter update after implementation review closes.

Evidence check passes after the requested settled recaptures. All 36 full scenes and their 36 content crops were inspected individually, together with all 20 native content source exports and representative full approved references. The five exiting-menu ghosts have disappeared. The stable loading/error crop boundaries correctly reveal a real compact-tab layout defect, recorded below; they are no longer classified as malformed captures. The provided detector list is empty. No second detector or browser was run by this reviewer.

## fidelity

| Element | Classification | Evidence |
| --- | --- | --- |
| Reading order and responsive composition | match | Jogos heading and competition context, three category tabs, date/round groups, then whole match targets. The six Hoje widths preserve the approved wide-to-compact reflow. |
| TYPE | match | Barlow Condensed retains the condensed display character for heading, dates, times and scores; Manrope retains the UI character. Native 32/40 page, 28/32 group/time and 44/48 wide-score hierarchy is reproduced. Raster text antialiasing remains a bounded rendering difference. |
| MATERIAL | match | Original official raster logo with its white ground, raster crest fallback and original consistent SVG icons are present. Flat semantic surfaces follow the approved screen grammar. |
| GROUND | match | Full approved scenes and browser captures retain Light #F7F8FA and Dark #0C1017 page grounds. Transparent areas of native content-only exports are not mistaken for black page paint. |
| Main content geometry | match | All 20 Figma/browser content pairs have equal crop dimensions. Wide 1280px maximum, compact gutters, group spacing, 204px scheduled and 192px result mobile fixtures match. Mean channel deltas support this finding but do not establish pixel identity. |
| Compact category tabs | contradicted | In 390/320px content pairs, count pills stretch with label width instead of retaining native 24px geometry. In settled loading/error content crops, Resultados extends beyond the right edge of its tab; the full scene shows the label escaping into the gutter. |
| Result status ink | contradicted | Native result references use primary ink for Final, Empate and W.O.; browser results use secondary ink through the result time-cell inheritance, in both themes and layouts. |
| Dark wide row corners | contradicted | Approved dark full references 15:19692 and 15:21066 show 16px corners on each wide match row at internal divider intersections. Browser dark rows merge into a square-sided interior within one rounded list. Preserve the 1px dividers and zero row gap while restoring this native edge geometry. |
| Empty/loading/error state paint | contradicted | Approved dark loading/error panels use header surface #111824, while browser state panels use card #151E2B. Approved skeleton blocks are #DFE3E8 in Light and #33445B in Dark; browser uses much quieter subtle surface. Empty/loading calendar icons use primary ink in the approved references, while browser universally applies action blue. |
| State copy and recovery | match | State headings, explanatory copy, retry and upcoming action retain the approved product language. Unknown counts remain omitted; empty counts remain zero. |
| Real competition/state context | adaptation | Loading says Carregando competição and failed initial load says Sem competição rather than retaining the illustrative Copa Paulista fixture. This follows the implementation brief's real-data requirement. An all-empty fixture shows all three zero counts, consistent with category truth. |
| Categories, dates and result truth | match | Source filters preserve Hoje scheduled prefix, other scheduled Próximos and finalized Resultados; rounds descend; ao_vivo stays excluded. Draw requires non-null equal scores. W.O. preserves stored scores or unknown marks. No penalties or fabricated scores were introduced. |
| Interaction and accessibility | match | Source implements one native match link with modified clicks preserved, roving tab focus and Arrow/Home/End selection, associated focusable panel, retry/resource cancellation and timeout. Provided production verification checks keyboard selection, focus, history, theme selection, explicit competition, retry and real Supabase reads. Reduced motion suppresses feedback and transitions. |
| Regression boundary | match | Jogos alone owns its shell loading/error and omits legacy bottom navigation; the shared approved header remains intact. Home only imports the extracted date helper. Existing details and other screens remain outside this implementation. |

## ceiling

Reached in composition, density, native type, original assets, category truth and responsive card reflow. The remaining native devices are compact-tab alignment, status ink hierarchy, individual Dark row corners and authored state paint; they are local fidelity repairs, not grounds for a rebuild. No new ornamental or motion treatment is owed for this approved Operate extension.

## material_fixes

1. Restore the compact tab geometry in `app/cpm-games.css`: keep count pills at the native 24px size with centered icon/count grouping, and center complete label rows within each tab even when counts are omitted. Verify complete unescaped labels at 390px and 320px in known-count and loading/error states, both themes. Native tab references: Light 390 Hoje/Resultados `13:17463`/`13:17481`, Light no-count loading `13:18764`–`13:18782`, Dark 390 Hoje/Resultados `15:20426`/`15:20428`, Dark no-count loading `15:21681`–`15:21683`; match the Count and Label roles in these instances.
2. Restore primary result-status ink for Final, Empate and W.O. in both themes and layouts while retaining secondary round metadata; compare the 1440px and 390px result pairs. Native match references: Light wide result/draw/W.O. `13:18191`, `13:18220`, `13:18259`; Dark wide equivalents `15:21088`, `15:21090`, `15:21100`; compare the status text role separately from Round.
3. Restore the approved individual 16px Dark wide-row corner geometry at internal dividers, retaining zero gap and 1px separators; compare Dark Hoje and Resultados desktop references without altering Light grouping or compact cards. Native row references: Dark scheduled `15:19714`, `15:19716`, `15:19718`, `15:19720` inside group `15:19705`, and result rows `15:21088`/`15:21090` inside group `15:21079`; the outer match frame owns the corner geometry.
4. Restore authored state paint: Dark state panels use header surface, skeleton blocks use border-subtle in both themes, and empty/loading calendar icons use primary ink while error retains action blue. Compare settled Light/Dark loading, error and empty captures against the final native state exports. Native panel references: Light empty/loading/error `13:18618`/`13:18791`/`13:18850`, Dark `15:21523`/`15:21684`/`15:21739`; compare the panel fill, direct calendar/support icon and three skeleton children. Error support icon remains action ink in `13:18850`/`15:21739`; the calendar in empty/loading is primary ink.

## keep

Preserve approved Home/header, exact principal layout and type, original assets, real DataContext/Supabase reads, all existing category/navigation rules, truthful missing scores/time and W.O., complete state recovery and reduced-motion behavior; introduce no penalties, live tab, extra filter or fixture data in the application.
