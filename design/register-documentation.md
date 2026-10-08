# Registration Light · native specification · 2026-10-06

Criar conta Light is complete as a native editable Figma specification in “Sem título”. The independent [review](register-review.md) returned **ship**, with no material fixes pending after opening all 28 final PNGs and the contact sheet. This is an ordinary extension of approved Login Light in the incumbent CPM world. No application, authentication or database behavior changed.

## Authority and system comparison

The [direction contract](register-brief.md), [DESIGN.md](../DESIGN.md), [PRODUCT.md](../PRODUCT.md) and [Login documentation](login-documentation.md) govern the extension. Recorded native component trees and the contact sheet retain the intact official crest, Barlow Condensed display, Manrope UI, flat white/light-neutral surfaces and restrained semantic blue actions/focus. Existing native Brand, Primary and e-mail/password fields are reused. The sole inherited identity bitmap is the official brand artwork; screens and components remain editable native trees rather than flattened screenshot compositions.

Desktop widths retain Login's bounded split scaffold (1280px maximum), large official brand panel and form (400px maximum). Compact references retain the official lockup and back control. Fields use visible labels (14px/20px), values (16px/24px), field bodies (56px), divided icon compartments (44px) and controls (44px minimum), with incumbent corners (12px/16px). Three short stages keep the current task dominant: Dados collects nick/e-mail, Código displays eight code slots, and Senha collects one password. Prior nick/e-mail collapse into a compact identity summary on later stages. These auth patterns do not revise the global type ramp, palette, primitives or sidecar.

## Native structure and APIs

[Metadata](register-metadata.json) identifies Screens `54:8876`, Components `54:8877` and States `54:8878`. [Native component trees/APIs](register-components-native.json) persist editable layout and existing variable/style bindings.

| Component | Native root | Exact API |
| --- | --- | --- |
| Auth / Nick · Light | `54:8888` | Text `Value#54:20`, default `Seu nick`; field body `54:8881` |
| Auth / OTP · Light | `54:8908` | Eight text properties listed below, default `0`; shared input body `54:8891` |
| Auth / Registration steps · Light | `54:8960` | Variant `Stage=Dados/Código/Senha`; masters `54:8928` / `54:8944` / `54:8959` |

OTP text keys are exactly `Digit 1#54:21`, `Digit 2#54:22`, `Digit 3#54:23`, `Digit 4#54:24`, `Digit 5#54:25`, `Digit 6#54:26`, `Digit 7#54:27` and `Digit 8#54:28`, including the spaces. They expose editable presentation slots, not eight independent runtime inputs. Fixture digits require explicit text overrides. Reused Login e-mail/password APIs retain their exact Label/Value IDs in [Login documentation](login-documentation.md); Primary retains `Label#2:10`.

The completion check is native vector `54:8911`, exported unchanged as [54-8911.svg](assets/register-icons/54-8911.svg): a 20px line check with 1.5px rounded stroke. Other icons reuse the original Login assets/paths. The official brand remains unmodified. The [single scoped SVG detector result](register-detector.json) is `[]`; this is not application QA or authentication verification.

## Final raster provenance

All 28 PNGs are direct exports of editable native Figma scene roots. Filenames replace the node-ID colon with a hyphen. The [contact sheet](register-previews/contact.png) is a derived overview of these exports, not a separate composition authority. Eighteen default references cover every stage at 320, 390, 768, 1024, 1440 and 2560px; eight separate states and two prototype fixtures complete the inventory. The independent reviewer inspected all full originals; this documentation pass opened the existing contact sheet without repeating review or creating captures.

| Stage / reference | Width | Native root / final PNG |
| --- | --- | --- |
| Dados · Default | 1440 | [54:8961](register-previews/54-8961.png) |
| Dados · Default | 1024 | [54:9069](register-previews/54-9069.png) |
| Dados · Default | 2560 | [54:9177](register-previews/54-9177.png) |
| Dados · Default | 768 | [54:9285](register-previews/54-9285.png) |
| Dados · Default | 390 | [54:9382](register-previews/54-9382.png) |
| Dados · Default | 320 | [54:9479](register-previews/54-9479.png) |
| Código · Default | 1440 | [54:9576](register-previews/54-9576.png) |
| Código · Default | 1024 | [54:9696](register-previews/54-9696.png) |
| Código · Default | 2560 | [54:9816](register-previews/54-9816.png) |
| Código · Default | 768 | [54:9936](register-previews/54-9936.png) |
| Código · Default | 390 | [54:10045](register-previews/54-10045.png) |
| Código · Default | 320 | [54:10154](register-previews/54-10154.png) |
| Senha · Default | 1440 | [54:10263](register-previews/54-10263.png) |
| Senha · Default | 1024 | [54:10374](register-previews/54-10374.png) |
| Senha · Default | 2560 | [54:10485](register-previews/54-10485.png) |
| Senha · Default | 768 | [54:10596](register-previews/54-10596.png) |
| Senha · Default | 390 | [54:10696](register-previews/54-10696.png) |
| Senha · Default | 320 | [54:10796](register-previews/54-10796.png) |
| Dados · Focus | 390 | [54:10896](register-previews/54-10896.png) |
| Dados · Pending | 390 | [54:10993](register-previews/54-10993.png) |
| Código · CodeError | 390 | [54:11094](register-previews/54-11094.png) |
| Código · CodeFilled | 390 | [54:11208](register-previews/54-11208.png) |
| Código · ResendAvailable | 390 | [54:11317](register-previews/54-11317.png) |
| Código · ResendExhausted | 390 | [54:11426](register-previews/54-11426.png) |
| Senha · PasswordError | 390 | [54:11535](register-previews/54-11535.png) |
| Senha · Submitting | 390 | [54:11640](register-previews/54-11640.png) |
| Senha · PrototypePassword | 390 | [54:11746](register-previews/54-11746.png) |
| Login · PrototypeReturn | 390 | [54:11809](register-previews/54-11809.png) |

## Product and prototype boundary

The source [RegisterScreen](../components/screens/AuthScreens.tsx) at lines 247–475 establishes nick/e-mail → eight-digit e-mail code → password, retaining nick/e-mail in component state. Sending requires provider readiness; OTP requests consume/reset the captcha token. Resend waits 60 seconds and permits at most one resend. Password creation requires only a minimum of eight characters. Abandoning the OTP-authenticated password stage before completion signs out the incomplete session. The design preserves these truths; it introduces no extra password rules, confirmation field, OAuth, terms checkbox or premature success promise.

Código is one logical numeric input with eight visual slots, preserving the source's numeric filtering and eight-character bound. The `0:59` wait is a static snapshot, not a running timer. CodeError combines factual error text and an icon; CodeFilled uses synthetic digits. ResendAvailable and ResendExhausted are separate references. Pending reserves neutral provider space without fabricating a security widget. PasswordError communicates the minimum-length rule; Submitting shows Criando conta… without demonstrating persistence or success.

The same-page synthetic fixture sequence is Focus `54:10896` → CodeFilled `54:11208` → PrototypePassword `54:11746` → Submitting `54:11640`, using 120ms DISSOLVE transitions. Secondary Entrar targets the Login-return fixture `54:11809`. The final fixture reproduces approved compact Login; it does not establish a runtime route. Static exports do not prove execution. There is no real input, OTP/email sending, timer, account persistence or completed-account/success interaction in this prototype.

## Evidence and persistence limits

This documentation pass read the direction, independent review, metadata, recorded native APIs/trees, incumbent design/product/Login records, sampled semantic token CSS and authentication source, and opened the existing contact sheet. Native layout and fixture evidence do not establish browser responsiveness, numeric keyboard behavior, OTP paste/autofill, ARIA, focus order, mobile keyboard reflow, reduced motion, real provider sizing/readiness, actual resend timing, abort cleanup or account persistence. These remain future implementation and browser checks.

Persistence includes the brief, review, metadata, native component trees/APIs, original check SVG, 28 final PNGs, contact sheet and scoped detector result. Targeted root DESIGN.md/PRODUCT.md notes record the extension while preserving existing frontmatter, `.impeccable/design.json`, `app/cpm-tokens.css` and historical records. No application source, browser, render, capture, detector, test, build or database operation formed part of this pass. Pre-existing runtime registration geometry remains different from the approved native reference; that implementation drift is recorded as a boundary, not canonized or repaired.
