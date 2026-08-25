## 2024-05-19 - PasswordInput accessibility
**Learning:** Found that the `PasswordInput` toggle button lacked an ARIA label, making it inaccessible to screen readers as it only contained an icon.
**Action:** Always verify that icon-only buttons have an `aria-label` associated, especially when they toggle state (like show/hide password).
