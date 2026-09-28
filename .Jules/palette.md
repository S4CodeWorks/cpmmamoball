
## 2024-05-18 - Fixing Toggle and Tab ARIA States
**Learning:** Custom UI components like tabs and switches must explicitly declare their roles and states to be screen-reader accessible. `role="tab"` must always be accompanied by `aria-selected` to reflect active state, and buttons acting as toggles should use `role="switch"` alongside `aria-checked` and properly clear context for screen-readers using `aria-hidden="true"` on internal decorative icons/thumbs.
**Action:** Always verify components that function as tabs or switches have their respective ARIA roles (`role="tab"` and `role="switch"`) explicitly declared and test visual changes with semantic HTML/ARIA attributes in mind.
