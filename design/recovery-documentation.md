# Recovery Light · native specification · 2026-10-06

Recuperar senha Light is complete as a native editable Figma continuation of approved Login and Registration Light in “Sem título”. The independent [review](recovery-review.md) returned **ship** after opening the contact sheet and all 35 final native PNGs, with no material fixes pending. Application authentication and database behavior remain incumbent.

## Authority and system comparison

The [direction contract](recovery-brief.md), incumbent [DESIGN.md](../DESIGN.md), [PRODUCT.md](../PRODUCT.md), [Login documentation](login-documentation.md) and [Registration documentation](register-documentation.md) govern this ordinary Operate extension. The recorded native trees and existing contact sheet preserve the intact official crest, semantic white/neutral/blue, Barlow Condensed display, Manrope UI and flat rounded auth world. Only the recovery tracker is newly specialized; Brand, Primary, e-mail/password fields, OTP and icon paths are inherited native instances. No new generated bitmap or SVG asset was introduced.

Desktop references preserve the bounded split scaffold (1280px maximum) and task form (400px maximum); compact references retain the official lockup and back control, with the tablet form centered. Visible labels (14px/20px), values (16px/24px), controls (44px minimum), field bodies (56px), divided icon compartments (44px) and corners (12px/16px) reuse the auth geometry. E-mail → Código → Senha keeps only the current task as a field; the destination collapses to a compact e-mail identity summary on later stages. These surface patterns do not revise normative palette, typography or global tokens.

## Native structure and APIs

[Metadata](recovery-metadata.json) identifies Screens `54:11862`, Components `54:11863` and States `54:11864`. [Native component trees/APIs](recovery-components-native.json) preserve editable geometry and existing variable/style bindings.

| Component | Native root | Exact API |
| --- | --- | --- |
| Auth / Recovery steps · Light | `54:11865` | `Stage=E-mail/Código/Senha`, default E-mail; masters `54:11866` / `54:11876` / `54:11886` |
| Auth / E-mail · Light (reused) | `54:8131` | `Kind=mail`; `State=Empty/Focus/Filled/Invalid`; `Label#54:0`, default E-mail; `Value#54:5`, default seu@email.com |
| Auth / Password · Light (reused) | `54:8132` | `Kind=lock`; `State=Empty/Focus/Filled/Visible`; `Label#54:10`, default Senha; `Value#54:15`, default Sua senha |
| Auth / OTP · Light (reused) | `54:8908` | Eight editable Digit text properties, default `0`; inherited input body `54:8891` |
| Primary (reused) | Incumbent Login master | `Label#2:10`; stage/loading fixture labels override the inherited text property |

OTP keys are exactly `Digit 1#54:21`, `Digit 2#54:22`, `Digit 3#54:23`, `Digit 4#54:24`, `Digit 5#54:25`, `Digit 6#54:26`, `Digit 7#54:27` and `Digit 8#54:28`. Eight presentation slots represent **one logical numeric OTP input**. Filled/visible variants require explicit Value overrides; selecting a variant alone does not populate its fixture value. Demonstration e-mail, digits and password are synthetic, never account data.

The tracker clones Registration's native stage pattern and specializes its visible labels to E-mail/Código/Senha, retaining inherited mail/OTP/lock/check paths and semantic bindings. Reuse the original [Login icons](assets/login-icons/) and [Registration check](assets/register-icons/54-8911.svg) without redrawing the official brand. No recovery-specific generated SVG/bitmap or detector result exists or is required for these native-node writes.

## Final raster provenance

The 35 PNGs are direct editable native Figma scene exports: 18 default stage/width references, 16 separate state references and one Login-return fixture. Each stage covers 320, 390, 768, 1024, 1440 and 2560px. Filenames replace node-ID colons with hyphens. The [contact sheet](recovery-previews/contact.png) is a derived overview, not a separate design authority. The independent review supplies individual-image inspection; this documentation pass opened the existing contact sheet and checked the metadata inventory without repeating captures or visual review.

| Stage / reference | Width | Native root / final PNG |
| --- | --- | --- |
| E-mail · Default | 390 | [54:11913](recovery-previews/54-11913.png) |
| E-mail · Default | 1440 | [54:11990](recovery-previews/54-11990.png) |
| E-mail · Default | 1024 | [54:12061](recovery-previews/54-12061.png) |
| E-mail · Default | 2560 | [54:12132](recovery-previews/54-12132.png) |
| E-mail · Default | 768 | [54:12203](recovery-previews/54-12203.png) |
| E-mail · Default | 320 | [54:12263](recovery-previews/54-12263.png) |
| Código · Default | 1440 | [54:12323](recovery-previews/54-12323.png) |
| Código · Default | 1024 | [54:12406](recovery-previews/54-12406.png) |
| Código · Default | 2560 | [54:12489](recovery-previews/54-12489.png) |
| Código · Default | 768 | [54:12572](recovery-previews/54-12572.png) |
| Código · Default | 390 | [54:12644](recovery-previews/54-12644.png) |
| Código · Default | 320 | [54:12891](recovery-previews/54-12891.png) |
| Senha · Default | 1440 | [54:12980](recovery-previews/54-12980.png) |
| Senha · Default | 1024 | [54:13070](recovery-previews/54-13070.png) |
| Senha · Default | 2560 | [54:13160](recovery-previews/54-13160.png) |
| Senha · Default | 768 | [54:13250](recovery-previews/54-13250.png) |
| Senha · Default | 390 | [54:13329](recovery-previews/54-13329.png) |
| Senha · Default | 320 | [54:13408](recovery-previews/54-13408.png) |
| E-mail · EmailFocus | 390 | [54:13487](recovery-previews/54-13487.png) |
| E-mail · EmailError | 390 | [54:13565](recovery-previews/54-13565.png) |
| E-mail · Pending | 390 | [54:13661](recovery-previews/54-13661.png) |
| E-mail · Sending | 390 | [54:13743](recovery-previews/54-13743.png) |
| Código · CodeFocus | 390 | [54:13822](recovery-previews/54-13822.png) |
| Código · CodeFilled | 390 | [54:13912](recovery-previews/54-13912.png) |
| Código · CodeError | 390 | [54:14001](recovery-previews/54-14001.png) |
| Código · ResendAvailable | 390 | [54:14095](recovery-previews/54-14095.png) |
| Código · ResendExhausted | 390 | [54:14184](recovery-previews/54-14184.png) |
| Código · ResendError | 390 | [54:14273](recovery-previews/54-14273.png) |
| Código · Verifying | 390 | [54:14367](recovery-previews/54-14367.png) |
| Senha · PasswordFocus | 390 | [54:14457](recovery-previews/54-14457.png) |
| Senha · PasswordVisible | 390 | [54:14547](recovery-previews/54-14547.png) |
| Senha · PasswordError | 390 | [54:14636](recovery-previews/54-14636.png) |
| Senha · SaveError | 390 | [54:14720](recovery-previews/54-14720.png) |
| Senha · Saving | 390 | [54:14815](recovery-previews/54-14815.png) |
| Login · PrototypeReturn | 390 | [54:14894](recovery-previews/54-14894.png) |

## Product and prototype boundary

The incumbent [ForgotScreen source](../components/screens/AuthScreens.tsx:475) establishes e-mail → eight-digit code → new password; [ResendHint](../components/screens/AuthScreens.tsx:180) supplies the 60-second wait and at-most-one successful resend allowance. Sending uses `shouldCreateUser:false`, consumes/resets provider verification on successful send and always advances to code even if initial sending fails, deliberately suppressing account enumeration. The native destination summary makes no account-existence or message-delivery claim. There is no account-not-found reference. Pending reserves provider space only; it does not simulate a working security widget.

Code verification preserves numeric filtering, the eight-character bound and e-mail OTP type. The single password requires only a minimum of eight characters; no confirmation or extra strength rule is introduced. A successful update closes this flow with the session already active after OTP. No subsequent sign-in requirement or separate success page is invented. Unlike Registration, the existing recovery source has no matching abort sign-out cleanup; this specification does not import that behavior.

EmailFocus, EmailError, Pending and Sending cover the first task. CodeFocus, CodeFilled, CodeError, ResendAvailable, ResendExhausted, ResendError and Verifying cover the second. PasswordFocus, PasswordVisible, PasswordError, SaveError and Saving cover the third. Error references retain icons plus factual text; resend counts and `0:59` are static snapshots.

Metadata and [native prototype reaction proof](recovery-prototype-native.json) record the synthetic same-page sequence EmailFocus `54:13487` → CodeFilled `54:13912` → PasswordFocus `54:14457` → Saving `54:14815`, using DISSOLVE (120ms), EASE_OUT. Password-eye fixtures toggle PasswordFocus/masked and PasswordVisible `54:14547`; the visible-password primary also targets Saving. Secondary returns target Login fixture `54:14894`, whose forgot-password link returns to EmailFocus. Saving's primary has no reaction or success destination. Recorded reaction reads substantiate the bounded prototype; PNGs alone do not prove interaction execution.

There is no real input, OTP/email sending, timer, authentication, account lookup, persistence or successful update in this prototype. Runtime keyboard/focus order, ARIA, numeric keyboard, OTP autofill/paste, provider rendering/readiness, actual resend timing, mobile keyboard reflow and motion accessibility remain future implementation and browser checks.

## Evidence and persistence limits

This pass read the shipped documenter instructions and document reference, incumbent design/product/auth documentation, direction, independent review, metadata, recorded native component/prototype evidence and the relevant incumbent authentication source, and opened the existing contact sheet. It writes only this handoff and targeted root DESIGN.md/PRODUCT.md extension notes. Normative DESIGN.md frontmatter, `.impeccable/design.json`, `app/cpm-tokens.css`, historical acceptance records and existing source remain preserved.

No UI hunt, new capture, detector pass, browser/app QA, source edit, test, build, real authentication or database operation formed part of this pass. The native-node extension is not HTML/CSS output requiring a detector run. Pre-existing runtime recovery geometry and delivery-implying explanatory copy differ from this native target; that drift is recorded as an implementation boundary, not canonized or repaired. Auth Dark remains future design work.
