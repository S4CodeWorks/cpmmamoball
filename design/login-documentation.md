# Login Light · native specification · 2026-10-06

Login for existing accounts is complete as a native editable Figma specification in “Sem título”. The independent [review](login-review.md) returned **ship**, with no material fixes pending after individually opening all 14 final PNGs. This is an ordinary extension of the incumbent CPM world. Application authentication and database behavior were not changed; registration, recovery and Dark are separate future design tasks.

## Authority and system comparison

The [direction contract](login-brief.md), incumbent [DESIGN.md](../DESIGN.md), [PRODUCT.md](../PRODUCT.md), semantic tokens and existing native Brand/Primary components govern the result. The contact sheet and recorded component trees show the approved official crest, Barlow Condensed sports display, Manrope UI, flat white/light-neutral surfaces, restrained blue actions/focus, rounded corners and divided icon compartments. These agree with the incumbent world rather than introducing a new palette, typography or global rule. `app/cpm-tokens.css` and sampled `app/cpm.css` likewise establish the existing semantic colors, 44px controls, 12px corners and 1280px content bound. The Figma specification does not yet replace the application's incumbent login geometry.

The desktop composition uses a bounded split scaffold (1280px maximum), official crest (192px), condensed CPM MamoBall wordmark (80px/80px) and a form (400px maximum). Compact widths replace the large brand panel with the official lockup and back control. Fields have visible labels (14px/20px), values (16px/24px), 56px field bodies and 44px icon compartments; interactive controls are at least 44px. Existing semantic palette, spacing, corners and text styles are reused. These auth dimensions describe this surface; they do not add normative global primitives or revise the existing type ramp.

No frontmatter token, sidecar or application token CSS was regenerated. The extension adds documentation under the existing canonical Components section and a product scope record, preserving earlier history.

## Native structure and APIs

[Metadata](login-metadata.json) identifies Screens `54:7973`, Components `54:7974` and States `54:7975`. [Native component trees and APIs](login-components-native.json) persist variable/style bindings, icon compartments and the following reusable components:

| Component | Native root | Variants and exact property keys |
| --- | --- | --- |
| Auth / E-mail · Light | `54:8131` | `Kind=mail`; `State=Empty/Focus/Filled/Invalid`; `Label#54:0` (default E-mail); `Value#54:5` (default seu@email.com) |
| Auth / Password · Light | `54:8132` | `Kind=lock`; `State=Empty/Focus/Filled/Visible`; `Label#54:10` (default Senha); `Value#54:15` (default Sua senha) |
| Auth / Create account · Light | `54:8139` | Separate reusable 44px secondary action; no exposed text property in the recorded API |

Existing Brand and Primary components remain instances. Primary labels use the incumbent `Label#2:10` property. Native text properties retain their exact generated IDs; do not substitute an unqualified Label/Value key. Selecting a filled or visible variant alone does not set its text: fixture instances require explicit Value overrides. Final filled/error/submitting fixtures show `jogador@email.com` with masked passwords; the visible fixture shows `MinhaSenha123`; the invalid fixture shows `seuemail.com`. These are presentation fixtures, not persisted account data. The final exports evidence their visible text; the recorded API defaults remain placeholders.

Nine original/reused-path SVG assets in [login-icons](assets/login-icons/) supply mail, lock, eye, eye-off, back, login, alert, shield and bell. The official identity remains intact. [Detector result](login-detector.json) is `[]` from the single SVG-scoped pass; no second detector pass was run. This result does not assess native interaction or runtime authentication.

## Final raster provenance

All 14 final PNGs are direct native Figma scene exports, named by the node ID with the colon replaced by a hyphen. [contact.png](login-previews/contact.png) is a derived overview of those exports, not a separate design authority. Source roots, widths and states below agree with the metadata; the independent reviewer inspected all originals individually.

| State | Width | Native root / final PNG |
| --- | --- | --- |
| Empty | 1440 | [54:8140](login-previews/54-8140.png) |
| Empty | 1024 | [54:8199](login-previews/54-8199.png) |
| Empty | 2560 | [54:8258](login-previews/54-8258.png) |
| Empty | 768 | [54:8317](login-previews/54-8317.png) |
| Empty | 390 | [54:8365](login-previews/54-8365.png) |
| Empty | 320 | [54:8413](login-previews/54-8413.png) |
| Focus | 390 | [54:8461](login-previews/54-8461.png) |
| Filled | 390 | [54:8509](login-previews/54-8509.png) |
| Visible | 390 | [54:8557](login-previews/54-8557.png) |
| Invalid | 390 | [54:8604](login-previews/54-8604.png) |
| Error | 390 | [54:8657](login-previews/54-8657.png) |
| Pending | 390 | [54:8710](login-previews/54-8710.png) |
| Submitting | 390 | [54:8762](login-previews/54-8762.png) |
| Error | 1440 | [54:8810](login-previews/54-8810.png) |

## Product and prototype boundary

The source [LoginScreen](../components/screens/AuthScreens.tsx) at line 654 signs in with e-mail/password, allows password visibility, requires security readiness, hides the provider widget after successful verification, disables the action during readiness/loading, resets verification after sign-in failure and displays errors. The design retains those truths. Invalid e-mail and credential-error references combine icons with factual text; Pending reserves a provider area and labels the security wait, without imitating a Cloudflare widget. Empty represents the ready reference state, not a promise that verification is always ready.

The only prototype is the mobile Filled `54:8509` ↔ Visible `54:8557` pair through the 44px password eye target, using a 120ms DISSOLVE fixture transition. The States page flow is named “Login · Mostrar/ocultar senha · demonstração”. Focus is a static reference; no focus reaction, authentication, back destination, registration, recovery or other navigation is wired. Static PNGs do not prove execution of the transition.

## Evidence and persistence limits

This documentation pass read the direction, independent review, metadata, native component APIs/trees, incumbent design/product records, authentication source and sampled token/component CSS, and opened the contact sheet. The independent review supplies the individual 14-image visual check; this pass did not repeat that review or mutate Figma. Native references demonstrate sampled layouts, not browser responsiveness, keyboard or mobile keyboard behavior, provider rendering, ARIA, reduced-motion handling, real authentication or comprehensive accessibility conformance. These require future implementation and browser verification.

Persistence check: the brief, review, metadata, native component APIs, nine SVG icons, 14 final scene PNGs, contact sheet and existing SVG detector result are present. Root DESIGN.md frontmatter, `.impeccable/design.json` and `app/cpm-tokens.css` are preserved. No code, database, build, browser or detector operation formed part of this documentation pass. Pre-existing runtime login geometry differs from the new native reference and is recorded as an implementation boundary, not canonized or repaired.
