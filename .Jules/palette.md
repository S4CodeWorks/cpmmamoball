## 2024-08-17 - Add role and aria-label to toggle buttons
**Learning:** Found custom toggle switches lacking proper switch roles and labels. The app uses `div`s with a `span` acting as a toggle in a `button`. These need `role="switch"` and `aria-checked` attributes for screen readers to correctly read their state, rather than just treating them as an empty button next to text.
**Action:** Always ensure custom switches implement `role="switch"`, `aria-checked`, and an `aria-label` for maximum screen reader compatibility, even if they are placed next to textual labels.
