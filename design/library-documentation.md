# Salvos e Avisos Light · native specification · 2026-10-06

Salvos, Avisos and full Aviso are complete as native editable Light specifications. The independent [review](library-review.md) returned **ship** for 55 final native PNGs, with no material fixes pending. The user explicitly chose “Figma primeiro; implementar depois”. This acceptance establishes design and bounded synthetic navigation; application, database, administrator and broadcast implementation remain future work.

## Authority and existing world

The [brief](library-brief.md), incumbent [DESIGN.md](../DESIGN.md), [PRODUCT.md](../PRODUCT.md), approved Pesquisa/Header and Login/Registration/Recovery references govern this Operate extension. Native trees and four inspected contact parts preserve the official CPM identity, white/neutral/blue semantic roles, Barlow Condensed headings and Manrope UI. Rounded controls (12px), row/detail surfaces (16px), filters (44px) and bounded desktop content (1280px maximum) inherit the existing world; no new palette, typography scale or global token rule is established.

Salvos uses distinct competition, club, match/time and news cues, with two content columns at wide widths and a single compact sequence. Filters wrap and titles reflow at 320px. The 320px Salvos reference deliberately has a 1104px document extent so its final news row remains present. Avisos exposes total/unread filters, reading status and a read-all action; full Aviso carries the official identity, publication time, title, body, read status and optional destination. Empty, pending and failed fetches are distinct; unknown counts remain unknown, and read-all is disabled when inappropriate. Focus outlines are native visual references, not browser keyboard proof.

## Native structure and exact APIs

[Metadata](library-metadata.json) identifies Screens `54:15397`, Components `54:15398` and States `54:15399`. [Recorded native trees and APIs](library-components-native.json) preserve editable text, geometry, original icon instances and variable/style bindings. Default/Selected are native filter component names; row kinds and Compact/Focus are separate native masters, not a fabricated combined variant API.

| Component / native master | Exact text properties and defaults |
| --- | --- |
| State=Default · `54:15474` | `Label#54:29` = Todos; `Count#54:30` = 5 |
| State=Selected · `54:15480` | `Label#54:31` = Todos; `Count#54:32` = 5 |
| Saved / Row / Competition · `54:15502` | `Title#54:33` = Liga Paulista; `Meta#54:34` = Temporada 2026 |
| Saved / Row / Club · `54:15516` | `Title#54:35` = Aurora FC; `Meta#54:36` = AUR |
| Saved / Row / News · `54:15531` | `Title#54:37` = Inscrições da próxima temporada; `Meta#54:38` = Notícia · 06 out |
| Saved / Row / Match · `54:15555` | `Meta#54:39` = Liga Paulista · Rodada 8; `Home#54:40` = AUR; `Away#54:41` = ATP; `Time#54:42` = 20:30 |
| Saved / Row / Competition / Compact · `54:15586` | `Title#54:33` = Liga Paulista; `Meta#54:34` = Temporada 2026 |
| Saved / Row / Club / Compact · `54:15600` | `Title#54:35` = Aurora FC; `Meta#54:36` = AUR |
| Saved / Row / News / Compact · `54:15613` | `Title#54:37` = Inscrições da próxima temporada; `Meta#54:38` = Notícia · 06 out |
| Saved / Row / Match / Compact · `54:15627` | `Meta#54:39` = Liga Paulista · Rodada 8; `Home#54:40` = AUR; `Away#54:41` = ATP; `Time#54:42` = 20:30 |
| Notices / Row / Unread · `54:15570` | `Title#54:43` = Horários da rodada atualizados; `Date#54:44` = 06 out · 18:00; `Preview#54:45` = Confira os novos horários. |
| Notices / Row / Read · `54:15585` | `Title#54:46` = Horários da rodada atualizados; `Date#54:47` = 06 out · 18:00; `Preview#54:48` = Confira os novos horários. |
| Library / filter / Focus · `54:24950` | `Label#54:31` = Todos; `Count#54:32` = 5 |
| Library / club / Focus · `54:24955` | `Title#54:35` = Aurora FC; `Meta#54:36` = AUR |
| Library / notice / Focus · `54:24965` | `Title#54:43` = Horários da rodada atualizados; `Date#54:44` = 06 out · 18:00; `Preview#54:45` = Confira os novos horários. |

Compact saved masters retain their corresponding wide text keys. Filter Focus inherits Selected keys; club Focus inherits Compact Club keys; notice Focus inherits Unread keys. Metadata additionally records distinct open/remove node IDs for each saved master and open IDs for notice rows. Implement independent removal controls without nesting buttons inside links; fixture text properties are illustrative content, never database or account data.

## Asset and export provenance

The official logo and incumbent generic crest bitmap are reused unchanged at source; the generic crest presentation is resized to 28×32px. Generic crests illustrate this specification: implementation must use actual club assets and its existing fallback. Existing native vector icons supply bookmark, bell, filters, competition, club, game, news, back, chevron, close, check and alert. No new raster illustration, generated bitmap or exported/generated SVG was introduced.

All 55 PNGs come directly from editable native scene roots: 18 main scenes, 27 states and 10 fixture copies. Main Salvos, Avisos and Aviso each cover 320, 390, 768, 1024, 1440 and 2560px. Filename colons become hyphens. The derived [contact part 1](library-previews/contact-1.png), [part 2](library-previews/contact-2.png), [part 3](library-previews/contact-3.png) and [part 4](library-previews/contact-4.png) summarize this inventory; they are not four additional native scenes or an independent design authority. This documentation pass opened all four parts and checked PNG signatures/declared widths and reaction destinations. Individual decoding and representative full-scene inspection are supplied by the independent review.

| Inventory | Surface · state | Width | Native root / PNG |
| --- | --- | --- | --- |
| Main | Salvos · Default | 390 | [54:15818](library-previews/54-15818.png) |
| Main | Avisos · Default | 390 | [54:16069](library-previews/54-16069.png) |
| Main | Aviso · Default | 390 | [54:16254](library-previews/54-16254.png) |
| Main | Salvos · Default | 1440 | [54:16394](library-previews/54-16394.png) |
| Main | Salvos · Default | 1024 | [54:16676](library-previews/54-16676.png) |
| Main | Salvos · Default | 2560 | [54:16955](library-previews/54-16955.png) |
| Main | Salvos · Default | 768 | [54:17237](library-previews/54-17237.png) |
| Main | Salvos · Default | 320 | [54:17500](library-previews/54-17500.png) |
| Main | Avisos · Default | 1440 | [54:17751](library-previews/54-17751.png) |
| Main | Avisos · Default | 1024 | [54:17954](library-previews/54-17954.png) |
| Main | Avisos · Default | 2560 | [54:18154](library-previews/54-18154.png) |
| Main | Avisos · Default | 768 | [54:18357](library-previews/54-18357.png) |
| Main | Avisos · Default | 320 | [54:18542](library-previews/54-18542.png) |
| Main | Aviso · Default | 1440 | [54:18727](library-previews/54-18727.png) |
| Main | Aviso · Default | 1024 | [54:18885](library-previews/54-18885.png) |
| Main | Aviso · Default | 2560 | [54:19040](library-previews/54-19040.png) |
| Main | Aviso · Default | 768 | [54:19198](library-previews/54-19198.png) |
| Main | Aviso · Default | 320 | [54:19338](library-previews/54-19338.png) |
| State | Salvos · Empty | 390 | [54:19478](library-previews/54-19478.png) |
| State | Salvos · Error | 390 | [54:19646](library-previews/54-19646.png) |
| State | Salvos · Loading | 390 | [54:19815](library-previews/54-19815.png) |
| State | Salvos · ClubFilter | 390 | [54:19981](library-previews/54-19981.png) |
| State | Salvos · Removed | 390 | [54:20168](library-previews/54-20168.png) |
| State | Salvos · Unavailable | 390 | [54:20402](library-previews/54-20402.png) |
| State | Avisos · Empty | 390 | [54:20570](library-previews/54-20570.png) |
| State | Avisos · Error | 390 | [54:20714](library-previews/54-20714.png) |
| State | Avisos · Loading | 390 | [54:20865](library-previews/54-20865.png) |
| State | Avisos · Unread | 390 | [54:21013](library-previews/54-21013.png) |
| State | Avisos · ReadAll | 390 | [54:21184](library-previews/54-21184.png) |
| State | Avisos · UnreadEmpty | 390 | [54:21369](library-previews/54-21369.png) |
| State | Avisos · OneRead | 390 | [54:21517](library-previews/54-21517.png) |
| State | Aviso · RegistrationNotice | 390 | [54:21702](library-previews/54-21702.png) |
| State | Aviso · RulesNotice | 390 | [54:21842](library-previews/54-21842.png) |
| State | Salvos · Empty | 1440 | [54:21982](library-previews/54-21982.png) |
| State | Avisos · Empty | 1440 | [54:22168](library-previews/54-22168.png) |
| State | Avisos · ReadAll | 1440 | [54:22330](library-previews/54-22330.png) |
| State | Avisos · OneRead | 1440 | [54:22533](library-previews/54-22533.png) |
| State | Aviso · RegistrationNotice | 1440 | [54:22736](library-previews/54-22736.png) |
| State | Aviso · RulesNotice | 1440 | [54:22894](library-previews/54-22894.png) |
| State | Salvos · ClubFilter | 1440 | [54:23052](library-previews/54-23052.png) |
| State | Salvos · Removed | 1440 | [54:23264](library-previews/54-23264.png) |
| State | Avisos · Unread | 1440 | [54:23526](library-previews/54-23526.png) |
| State | Avisos · UnreadEmpty | 1440 | [54:24724](library-previews/54-24724.png) |
| State | Salvos · KeyboardFocus | 390 | [54:24979](library-previews/54-24979.png) |
| State | Avisos · KeyboardFocus | 390 | [54:25135](library-previews/54-25135.png) |
| Fixture | Login · Entry | 1440 | [54:23715](library-previews/54-23715.png) |
| Fixture | Jogos · Destination | 1440 | [54:23774](library-previews/54-23774.png) |
| Fixture | Jogos · Destination | 390 | [54:23963](library-previews/54-23963.png) |
| Fixture | Salvos · Prototype | 1440 | [54:24125](library-previews/54-24125.png) |
| Fixture | Avisos · Prototype | 1440 | [54:24301](library-previews/54-24301.png) |
| Fixture | Aviso · Prototype | 1440 | [54:24401](library-previews/54-24401.png) |
| Fixture | Salvos · Prototype | 390 | [54:24455](library-previews/54-24455.png) |
| Fixture | Avisos · Prototype | 390 | [54:24602](library-previews/54-24602.png) |
| Fixture | Aviso · Prototype | 390 | [54:24686](library-previews/54-24686.png) |
| Fixture | Login · Return | 390 | [54:25232](library-previews/54-25232.png) |

## Prototype contract and limits

[Native reaction proof](library-prototype-native.json) agrees with all 46 destinations in metadata. Reactions use DISSOLVE (120ms), EASE_OUT. Interactive copies and participating states share the States page; main responsive scene matrices remain static and their back reactions are cleared. Original Login, Registration and Recovery pages remain preserved.

Desktop Login entry `54:23715` opens Salvos `54:24125` or Avisos `54:24301`; their backs return to that entry. Mobile copies `54:24455` / `54:24602` return to cloned Login `54:25232`. Club filter opens `54:23052` / `54:19981`. Example news removal opens Removed `54:23264` / `54:20168`; Desfazer restores the corresponding Salvos copy. Mark-all opens ReadAll `54:22330` / `54:21184`, followed by the unread-empty filter `54:24724` / `54:21369`. First-message opening targets full detail `54:24401` / `54:24686`; its back targets OneRead `54:22533` / `54:21517`. All three initial messages have matching details: games, registration and rules.

Only the games CTA has native destination fixtures (`54:23774` / `54:23963`). Registration and rules CTAs declare internal destination intent but remain static. First-read filtering is an unsimulated/static branch; state does not persist consistently across all prototype branches. Other controls and recovery states are specification references unless listed as reactions. Stored reactions do not establish execution in a live Figma player. This prototype performs no input, OTP/authentication, account changes, read persistence, database write, administrator publishing, actual push delivery or browser permission request.

## Functional handoff for later implementation

Existing [SavedScreen](../components/screens/MiscScreens.tsx:126) already lists favorite clubs, bookmarked matches and bookmarked news. [AppContext hydration/persistence](../contexts/AppContext.tsx:134) separates club/competition/notification keys from other bookmarks and hydrates signed-in choices through [bookmark helpers](../lib/db.ts:287). Guests persist preferences in browser storage only after accepted consent; otherwise choices remain in memory. Competition favorites already exist, but SavedScreen omits them. Their inclusion here proposes consolidation of an existing saved type, not a new database capability. Removal/undo, unavailable references, four filters and error recovery still need wiring and verification against real records.

Existing [Web Push code](../lib/push.ts) provides optional subscription and broadcast plumbing, while [notify endpoint](../app/api/notify/route.ts) and existing admin approval/scheduling hooks provide notification code. Notification preferences are not an inbox or a read history. Runtime VAPID configuration, delivery and live database state were not verified. The proposed Avisos history/read feature adds a public official announcement model: title, body, publication timestamp and optional typed internal destination. Staff authoring/publishing through Admin belongs to later implementation; “later” does not specify scheduled publishing.

Own-account read state should synchronize; public guest reading should work with consented browser read-state storage, otherwise session memory. Inbox access is independent of browser-push permission. A conceptual future store of announcements plus per-user read records is sufficient for handoff; no DDL, migration or live schema is created or confirmed. Staff-only announcement writes and user-owned read-record permissions must be verified during implementation. No private audiences, arbitrary outbound URLs, e-mail/SMS, new scheduler or automatic game-event generation is specified. Existing scheduling notification hooks are source truth, not evidence of a newly implemented announcement pipeline.

Preserve return origin and the authentication draft when navigating from auth shortcuts. Runtime work must cover fetch/retry/empty/unavailable behavior, accurate counts, read-one/read-all, persistent undo/removal outcomes, typed destination validation, authorization, account/consent/session transitions, keyboard order/ARIA, reduced motion and responsive browser checks. Native focus/contrast does not establish comprehensive accessibility conformance.

## Persistence and not-canonized drift

This pass follows the shipped Impeccable Documenter role and full document reference, grounding the extension in its completed native artifact, brief and independent acceptance. It writes this handoff and targeted Components/current-status notes in root DESIGN.md and PRODUCT.md. Existing normative frontmatter, `.impeccable/design.json`, application token CSS, historical reviews and auth documentation remain preserved.

Pre-existing SavedScreen geometry/copy and its missing competition group differ from the reviewed target; existing notification settings/push plumbing do not provide Avisos history/read states. This runtime drift is recorded for later implementation, without promoting it to design-system rules or repairing it. No extra UI hunt, capture, detector, test/build, browser/server operation, source edit, database change, notification or deployment occurred. Native Figma nodes are not changed HTML/CSS requiring a detector pass. Dark remains separate future design work.
