## verdict

This verdict scores only the four material fixes in `review.md`, using the recaptured files at the same evidence paths and the additional 320px loading/error pairs. The original full review remains unchanged. No second detector or browser was run by this reviewer.

| Fix | Score | Recapture evidence |
| --- | --- | --- |
| 1. Compact tab geometry | resolved | Light/Dark Hoje, Próximos and Resultados at 390px, Hoje at 320px, and empty/long/missing scenes now show equal native count pills and centered icon/count groups. Loading/error labels are complete and centered inside their tabs at both 390px and the added 320px, with no gutter escape or crop clipping. |
| 2. Result status ink | resolved | Light/Dark results at 1440px and 390px now show Final, Empate and W.O. in primary ink while round metadata remains secondary. |
| 3. Dark wide-row corners | resolved | Dark Hoje at 1440/1024/2560/768px and upcoming/results at 1440px show individual rounded row corners at divider intersections, zero gap and intact separators. Light grouped rows and compact card geometry remain intact. |
| 4. Authored state paint | resolved | Light/Dark empty/loading/error recaptures show the approved panel surfaces, stronger native skeleton fill and primary empty/loading calendar ink; error support remains action blue. Live empty scenes also retain the correct state surface and icon ink. |

All 40 named scenes have paired PNG files; report.json records zero page errors. The reviewed recaptures are settled and valid. No regression introduced by the four-fix batch was identified in the scored regions. The updated 20-pair comparison preserves equal source/browser dimensions; its residual channel deltas support comparison, not pixel-identity claims.

## remaining

Clear for the four scored material fixes. This is a fix-list verdict, not a new whole-surface audit. Preserve the original review's scope and real-data/category/accessibility boundaries when reporting completion.

disposition: ship
