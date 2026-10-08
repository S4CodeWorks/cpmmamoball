# Login, Criar conta, Recuperar senha, Salvos e Avisos · Dark native specification · 2026-10-06

All five requested families are complete as editable native Dark counterparts in Figma “Sem título”: Login, Criar conta, Recuperar senha, Salvos and Avisos (including full Aviso details). The independent [finish review](auth-library-dark-finish-review.md) returned **ship**, with no material fixes pending. This extends the approved CPM world. The user's “Figma primeiro; implementar depois” boundary remains in force; application authentication, SavedScreen, notification settings, database, Admin and push operations remain incumbent.

## Authority and existing world

The [direction contract](auth-library-dark-brief.md), incumbent [DESIGN.md](../DESIGN.md) / [PRODUCT.md](../PRODUCT.md), approved [Login](login-documentation.md), [Registration](register-documentation.md), [Recovery](recovery-documentation.md) and [Salvos/Avisos](library-documentation.md) Light specifications govern composition and product truth. Existing Dark Header/Home/Jogos roles govern theme. Historical Light reviews and future-Dark statements retain their original scope; this acceptance supersedes those future-Dark statements for native design only.

The result preserves original official logo and crest bitmaps, including the logo's white square, original vector icon geometry, Barlow Condensed display and Manrope UI, inherited text styles, four-pixel spacing rhythm, controls (44px), fields (56px), corners (12px/16px), bounded desktop scaffold (1280px) and auth form (400px). Desktop retains the large crest/stacked brand panel and separate task column; compact auth retains lockup/back/current task. Wide Salvos retains two grouped columns; compact filters wrap and the complete sequence reflows, including the extended 320px document. Avisos and full Aviso retain ordered official messages, publication metadata, read indicators and optional destination. These local surface patterns do not revise global typography or geometry primitives.

## Existing Dark roles and local alias

Reused roles are page `#0C1017`, header/fields `#111824`, card `#151E2B`, support `#202D40`, primary/secondary text `#EDF2F9` / `#B8C4D6`, action/focus `#7BAAFF`, on-action ink `#0B1628`, selection `#203F6A` and selected ink `#C5DCFF`. The global palette remains normative in DESIGN.md; these values identify observed native reuse.

The sole new semantic alias is native-only Dark `auth/input-border` (`VariableID:54:25406`), referencing existing `color/neutral/400` (`#929BA8`) for default auth outlines (1px). It does not replace global `border/subtle`, add a primitive color or implement CSS. Focus retains the existing blue treatment (2px). The supplied scoped calculation gives outline/field-fill contrast (6.34:1); it is not WCAG certification.

[Native binding audit](auth-library-dark-native-audit.json) records 173 roots / 10,279 nodes, zero Light semantic paint bindings and no listed issues. The 233 inherited layout/content-max/control/min-height bindings use geometry aliases whose Dark counterparts resolve to identical existing primitives; these are dimension reuse, not remaining Light semantic colors. Unchanged image paints preserve source assets. Existing decorative primitive icon paints remain as approved originals.

## Native pages, masters and coverage

[Metadata](auth-library-dark-metadata.json) owns all source-to-Dark root maps, component/node remapping, page IDs and rebased prototype targets. Ten new pages separate shared Auth components, each auth screen/state pair and Library components/screens/states:

| Page role | Native page |
| --- | --- |
| authComponents | `54:25396` |
| loginScreens | `54:25397` |
| loginStates | `54:25398` |
| registerScreens | `54:25399` |
| registerStates | `54:25400` |
| recoveryScreens | `54:25401` |
| recoveryStates | `54:25402` |
| libraryComponents | `54:25403` |
| libraryScreens | `54:25404` |
| libraryStates | `54:25405` |

The 132 scene/state/fixture roots comprise Login 14, Registration 28, Recovery 35 and combined Salvos/Avisos/detail Library 55. Library is one export inventory containing the two requested personal families and their full-message destinations; it is not an omitted fifth family. Every family has main references at 320, 390, 768, 1024, 1440 and 2560px.

| Inventory | Main scenes | States | Additional fixtures | Total |
| --- | ---: | ---: | ---: | ---: |
| Login | 6 | 8 | 0 | 14 |
| Criar conta | 18 | 8 | 2 | 28 |
| Recuperar senha | 18 | 16 | 1 | 35 |
| Salvos / Avisos / Aviso | 18 | 27 | 10 | 55 |

[Recorded native masters](auth-library-dark-components-native.json) contain 41 separate reusable roots: 19 icons, seven shared Auth fields/secondary/tracker masters and 15 Library filter/row/notice/focus masters. Shared Dark Auth masters serve Login, Registration and Recovery; existing global Dark Brand/Header/Primary variants and Games fixture components are reused. Master names and actual child variant combinations below are native records, not invented Cartesian APIs. The supplied Dark snapshot records direct children and source IDs rather than regenerated text-property IDs; consult current native property definitions before later code generation and use the approved Light API records as source context.

| Reusable master | Native root | Recorded variant children |
| --- | --- | --- |
| Auth / E-mail · Dark | `54:25454` | Kind=mail, State=Empty; Kind=mail, State=Focus; Kind=mail, State=Filled; Kind=mail, State=Invalid |
| Auth / Password · Dark | `54:25506` | Kind=lock, State=Empty; Kind=lock, State=Focus; Kind=lock, State=Filled; Kind=lock, State=Visible |
| Auth / Secondary account · Dark | `54:25569` | Separate master |
| Auth / Nick · Dark | `54:25577` | Separate master |
| Auth / OTP · Dark | `54:25588` | Separate master |
| Auth / Registration steps · Dark | `54:25607` | Stage=Dados; Stage=Código; Stage=Senha |
| Auth / Recovery steps · Dark | `54:25668` | Stage=E-mail; Stage=Código; Stage=Senha |
| Library / Filter / default · Dark | `54:25729` | Separate master |
| Library / Filter / selected · Dark | `54:25735` | Separate master |
| Saved / Row / Competition · Dark | `54:25741` | Separate master |
| Saved / Row / Club · Dark | `54:25759` | Separate master |
| Saved / Row / News · Dark | `54:25774` | Separate master |
| Saved / Row / Match · Dark | `54:25792` | Separate master |
| Saved / Row / Competition / Compact · Dark | `54:25820` | Separate master |
| Saved / Row / Club / Compact · Dark | `54:25834` | Separate master |
| Saved / Row / News / Compact · Dark | `54:25845` | Separate master |
| Saved / Row / Match / Compact · Dark | `54:25859` | Separate master |
| Notices / Row / unread · Dark | `54:25887` | Separate master |
| Notices / Row / read · Dark | `54:25903` | Separate master |
| Library / filter / Focus · Dark | `54:25920` | Separate master |
| Library / club / Focus · Dark | `54:25926` | Separate master |
| Library / notice / Focus · Dark | `54:25937` | Separate master |

The 19 icon roots and their source mappings are recorded in the same snapshot and metadata. Filled, visible and code fixtures remain demonstration content; cloning presentation does not establish functional text entry. Independent open/remove targets remain distinct in saved rows; later implementation must avoid nesting removal buttons inside destination links.

## Raster provenance

[Scene manifest](auth-library-dark-preview-manifest.json) records all 132 native PNG exports, source IDs, destination IDs, widths, states and provenance. Paths use `auth-library-dark-previews/{login,register,recovery,library}/{node-id-with-hyphen}.png`. Components have 41 corresponding PNGs in `auth-library-dark-previews/components/`. The ten derived contact inventories are Login part 1, Registration parts 1–2, Recovery parts 1–3 and Library parts 1–4. Total supplied PNG artifacts: **183 = 132 roots + 41 masters + 10 contacts**. Contacts summarize the actual native exports; they are not extra native scenes or application imagery.

The independent finish review inspected all ten contacts and representative full-size desktop/compact/state/detail originals, and checked PNG CRC/decompression/scanline length for every artifact. This documentation pass sampled the existing desktop Login export and verified manifest/count/path/declared-width consistency; it does not repeat or enlarge the independent visual review or claim browser captures. All source assets, screenshots, metadata and historical reviews remain unchanged.

## Account and personal-flow truth

Login retains e-mail/password, show/hide, security readiness, loading/error and provider reset intent. Registration retains nick/e-mail → one logical eight-digit code → password, identity summary, provider verification before sending, 60-second wait/at most one resend, minimum-eight-character password only, and incomplete OTP-authenticated registration abort sign-out. Recovery retains e-mail → one logical eight-digit code → new password, `shouldCreateUser:false`, advancement to code even on initial-send failure to avoid account enumeration, at most one successful resend and the same minimum length. Successful recovery closes in an active session; it adds no separate success/sign-in-again screen or Registration-style abort cleanup. Pending is reserved provider space, not a functioning security widget. Error copy/icons and `0:59` are finite references.

Salvos retains competition/club/match/news groups and filtering, removal/undo, unavailable, empty, loading and error/retry references; competition inclusion proposes consolidation of an existing favorite type omitted from incumbent SavedScreen. Avisos proposes public official announcement history and own-account read synchronization, with consented guest browser storage or session memory; reading is independent of browser push permission. Three initial notices have matching full details. Unknown counts stay unknown during loading/failure. Read-all/read-one/unread-empty/focus references describe the target, not a shipped inbox backend. Staff publication, typed internal destinations and storage/permissions belong to later implementation; no private targeting, arbitrary external links, new scheduler, e-mail/SMS or event pipeline is introduced.

## Prototype and runtime boundary

[Stored native reaction proof](auth-library-dark-prototype-native.json) contains 100 click/hover records matching expected source-to-Dark rebasing. Participating fixtures preserve same-page bounded DISSOLVE/EASE_OUT transitions (120ms), password visibility, account-stage demonstrations, Login entry/return, Library filtering, example removal/undo, read-all/unread-empty and matching notice details. Responsive main matrices and unlisted states remain static; there is no cross-theme full theme-switch behavior. Stored reactions demonstrate configured destinations, not execution in a live player.

Auth sequences perform no real input, OTP/email delivery, timer, provider security, authentication, account persistence or successful completion. Library first-read branch remains static without full branch persistence. Only the games CTA has a native fixture destination; registration/rules actions remain static internal-destination intentions. No read persistence, browser permission request, database write, administrator publication, broadcast or delivery is verified.

Later implementation must preserve origin navigation/auth draft and verify real fetch/retry/removal/undo/read state, storage ownership, consent/session/account transitions, typed destinations, provider sizing, OTP numeric keyboard/paste/autofill, keyboard order/ARIA, mobile keyboard reflow, reduced motion and responsive browser behavior. Native focus, token contrast and six authored widths do not establish runtime accessibility or comprehensive conformance.

## Persistence and not-canonized drift

This pass follows the shipped Impeccable Documenter and full document reference using the actual accepted native artifact. It creates this handoff, adds narrowly scoped current-status entries in DESIGN.md/PRODUCT.md and adds only `extensions.authLibraryDark` to the sidecar. Existing frontmatter, global tokens, every prior sidecar entry/narrative, historical prose, application CSS/code and Light native evidence are preserved. No implementation, native edits, discovery/detector/doctor, browser tests, build, browsing, database/admin/push action or deployment occurs.

Incumbent application auth geometry and SavedScreen's missing competition group differ from the accepted native target; existing notification settings/push plumbing do not provide the proposed Avisos history/read model. That pre-existing runtime drift remains an implementation boundary, without being canonized as a design rule or repaired here.
