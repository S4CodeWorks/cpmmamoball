# Conditional Home news: implemented

The user approved implementation of the previously reviewed Home · Notícias extension. `components/ui/HomeNews.tsx` now appears after match lists and standings in `components/screens/HomeScreen.tsx`; `app/cpm.css` holds its scoped layout. The registration CTA remains removed. This ordinary extension preserves the incumbent system, original SVGs, self-hosted fonts, shared tokens and sidecar. No database writes or deployment were performed.

## Runtime and fidelity

DataContext reuses `fetchNews` from `lib/db.ts`, filtering `published=true` and sorting `created_at` descending. Home takes the first three and returns null for an empty list, including section heading and reserved spacing. Real title, excerpt, date, category/tag, optional image and body fields supply the cards. Reading time derives from body words at 200/min (rounded up, minimum one minute), with stored read time as the no-body fallback. Optional missing metadata is omitted; failed imagery becomes the complete no-cover card. The original logo is only comparison-fixture imagery.

Cards preserve Barlow Condensed 600 28/32 titles, Manrope 500 14/20 excerpts/actions and 400 12/16 metadata, 24px padding, 16px radius/internal gaps and 24px grid gaps. The surface is the existing header role: white light and #111824 dark. The single covered desktop card retains its 224×144 cover and 362.67px body with 24px separation; the raster layer remains 72×72. Compact layouts stack, three articles use three desktop columns, and long text wraps at 320px. Original calendar, clock and arrow silhouettes come from `CpmIcon` in `components/ui/CpmUi.tsx`.

Each article is a native `/noticia/:id` link, one keyboard target named from its title, with a visible 2px focus outline. Normal activation uses existing app navigation; modified clicks retain browser behavior. The read cue is not another control; Ver todas opens the existing news index. Eight Figma source sections have no motion tracks. Runtime tap scaling and 160ms arrow movement are declared implementation choices; reduced motion removes tap scaling and suppresses transitions.

## Recorded verification

This documentation pass inspected source and saved evidence; it did not repeat browser, build, detector or visual review.

| Evidence | Recorded scope/result |
| --- | --- |
| `scripts/verify-home-news-implementation.mjs` | Canonical harness; 12 fixture scenes: light/dark × one/three × 1440/390/320. Zero, long content, optional metadata, broken image, derived reading time and keyboard/article/index checks passed. Fixtures intercept browser reads without database writes. |
| [Saved browser report](../../.impeccable/review/home-news-implementation/report.json) | Twelve matrix records; errors array empty. Twelve full-page screenshots and twelve section crops are saved beside it, plus both 320px edge crops and two live desktop theme captures. Corrected mobile full views start at document top with header/selector/scoreboard. |
| [Comparison](comparison.json) | All eight matched 1440/390 one/three theme pairs have identical section width and height. Mean channel difference 1.014–3.013/255; antialiasing and minor metadata spacing preclude a pixel-identical browser claim. |
| Build / scoped ESLint | Implementation handoff reports successful production build and scoped ESLint. No repository-wide lint or new Jogos verification claim. |
| [Detector](../../.impeccable/review/home-news-implementation/detector.json) | Single changed-target run: `[]`. |
| [Fresh full review](review.md) | **ship**, no material fixes, after eight corrected mobile full-page captures; prior evidence-only recapture verdict is superseded. |
| Live data | Read-only check confirmed one published article; light/dark captures render its complete no-cover card. |

Initial edge verification assumed a lazy image error after 250ms; it now waits for actual fallback. An article-navigation fixture also lacked required author data and was corrected. These harness corrections required no UI change; the passed matrix was retained.

Coverage is bounded to the saved fixtures and live reads. This is not full WCAG certification, screen-reader validation, every article state, arbitrary network recovery or motion-performance certification. Other screens' redesigns are outside this record. Historical Home news Figma reviews remain valid at their original artifact scope.
