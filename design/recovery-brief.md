# Recuperar senha · Light

Mode: Operate. Native editable Figma continuation of the approved Login and Registration Light. User: “agora o restante do login, tipo esqueci senha etc”. Scope is the existing three-stage ForgotScreen and its necessary states; existing Login/Registration remain intact. No real authentication or database change.

THESIS: Recover access through three short visual tasks, without accumulated disabled fields or a wall of explanation.
OWN-WORLD: Approved official CPM identity, semantic white/neutral/blue, Barlow Condensed and Manrope, bounded desktop split, compact tablet/mobile brand, divided icon compartments,44px controls,56px inputs,12/16px corners. Reuse native Login fields/Primary and Registration OTP; specialize only the recovery stage tracker.
STORY: E-mail → eight-digit code → new password. Keep the destination e-mail visible. Return to Login is available. Do not imply whether an address has an account or promise that a message arrived.
FIRST VIEWPORT: Direct “Redefinir senha” title and lock cue, three-stage visual tracker, current task, primary action, return to Login. No generic intro/subtitle. Eight OTP slots represent one logical numeric input; previous identity collapses to a compact e-mail summary.
FORM: Precisely scoped extension inside the approved auth world, no concept roll/new visual system. Separate Light screens, reusable components and state references. All prototype values synthetic; progression demonstrates layout only.
FINISH: unreviewed and undocumented is unfinished; finish review and grounded system documentation are required.

Source truth: components/screens/AuthScreens.tsx ForgotScreen. Sending uses shouldCreateUser:false and advances to code even when sending fails, deliberately avoiding account enumeration. No “account not found” state. Verify8digits with type email. Password minimum8characters only, no confirmation field or invented strength rules. Resend60sec/at mostonce via ResendHint. Provider captcha readiness/reset remains real integration, not a drawn fake widget. Successful password update closes this flow in an already active session; no invented “sign in again” or intermediate success page. This differs from Registration's incomplete-account cleanup: recovery source has no matching abort sign-out logic; no new behavior is claimed.

Coverage: three stages ×320/390/768/1024/1440/2560. Separate e-mail focus/empty-error/security-pending/sending; code focus/filled/error/resend-available/exhausted/verification; password focus/visible/validation/save-error/saving. Runtime keyboard/ARIA/OTP autofill/paste/provider rendering/timer/account behavior and motion accessibility remain future implementation checks. Demonstration prototype ends at saving, never at fictitious success.
