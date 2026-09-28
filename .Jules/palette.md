## 2024-05-14 - Added ARIA labels to Icon Buttons and Toggles
**Learning:** Found several icon-only buttons (`I.cog`, `I.search`, `I.close`, `I.trash`, `I.back`, `I.star`, etc.) that were missing `aria-label` context. Also discovered that custom toggle switches (built with a `div` or `<button className="toggle">`) were missing `aria-pressed` to communicate state to screen readers.
**Action:** When creating or reviewing icon-only buttons, always ensure an `aria-label` is present in Portuguese. For toggle switches, always add `aria-pressed={boolean}`.
