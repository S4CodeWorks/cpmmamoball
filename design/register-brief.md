# Criar conta · Light

Mode: Operate. Native editable Figma extension of approved Login Light; no application/database change. Existing RegisterScreen has three stages: nick/e-mail → eight-digit e-mail OTP → password. Minimum password8 characters,60-second resend wait, at most one resend, provider verification before sending, preserved identity details and sign-out on abandoning an OTP-authenticated incomplete registration. Do not invent OAuth, extra password rules, confirmation-password fields, terms checkbox or a success promise before persistence.

## Direction contract
THESIS: Three short visual stages, with the current task dominant instead of an accumulating wall of fields. Previous nick/e-mail collapse into a compact identity summary, retained in memory and visible for context.
OWN-WORLD: Approved CPM logo, white/neutral/blue, Barlow Condensed and Manrope,44px controls,56px input bodies,12/16px corners, divided icon compartments. Reuse native Login Brand, Primary, e-mail/password fields and semantic tokens; create only missing nick/OTP/step components.
STORY: Enter nick/e-mail; request code; enter8 digits; verify; choose a password and create the account. Returning to Login is secondary. Resend states preserve60 seconds/one-resend truth.
FIRST VIEWPORT: Same bounded desktop split as Login, compact brand/back on tablet/mobile. Formmax400 with icon title, labelled visual3-stage tracker, stage-specific fields, dominant action, and secondary Entrar. Code stage shows actual destination fixture; password stage shows compact verified identity, password visibility and only necessary8-character helper.
FORM: Ordinary extension of user-approved Login; no concept roll or replacement world. Components/States separated from primary scenes. All prototype data synthetic; prototype never sends messages or creates a real account.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Evidence scope
Light only. Default three stages at320/390/768/1024/1440/2560; separate focus/pending/code error/filled/resend available/resend exhausted/password error/submitting references. Provider reservation is not a fabricated security widget. Single8-character logical OTP input with eight visual slots, numeric keyboard/autofill/paste planned at implementation; slots are not eight tiny separate click targets. Runtime keyboard, ARIA, real provider sizing, account persistence and abort cleanup remain future implementation checks. Registration and recovery authentication logic is preserved as source truth, not altered here.
