## 2024-08-16 - Added ARIA labels to icon buttons
**Learning:** Found several icon-only buttons (like settings, back, and search close) in MiscScreens.tsx that were missing ARIA labels. This is a common pattern for icon buttons that needs attention to ensure screen reader users understand their function.
**Action:** Added `aria-label` attributes to these buttons with Portuguese translations to make them accessible.
