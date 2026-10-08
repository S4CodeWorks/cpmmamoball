# Header design brief

## Confirmed direction
New rounded, minimal visual system; primary light theme with black text and blue interaction accents. First artifact: reusable desktop header, not a full home redesign. The audience arrives to follow games, results and standings.

## Composition
Official logo and CPM name at left. Primary destinations: Início, Jogos, Classificação, Notícias. Mais exposes secondary destinations. Search and visible Entrar action at right. Logged-in state replaces Entrar with account control; staff administration is conditional.

## More menu refinement
The open panel joins the Mais trigger directly at its lower edge (y=66 in both desktop previews), with joined corner treatment and a continuous white surface. Each navigation row uses a 44 px icon zone, pale blue background ending at a 1 px vertical divider, followed by an aligned label. Icons are reusable vector components, individually matched to each destination. Theme controls sit in a separate neutral footer, separated from navigation by 12 px and a top divider. Menu / Item exposes label and icon-swap properties plus default, hover and focus states. Menu-specific semantic tokens keep icon colors independent of active navigation colors.

## Responsive behavior
Content max-width 1280 px; desktop margins at least 32 px, compact desktop 24 px. Header height 88 px. Regular desktop at 1440 and ultrawide at 2560 share centered content. At 1024 reduce brand text and search presentation while preserving labels. Below the content-fit threshold use the compact navigation strategy specified for the later tablet/mobile work; do not shrink controls or create horizontal page scrolling.

## States and accessibility
Navigation default, hover, active and focus. Action default, hover, focus, disabled and loading. Guest, signed-in and staff account states. Secondary menu opened by click/touch and keyboard, Escape closes and restores focus. Semantic navigation links in implementation, aria-current on active destination; buttons for menus. Touch targets at least 44 px. Labels for icon-only controls. Sticky header must not cover keyboard focus or skip-link destinations. No automatic focus movement on hover. Motion durations 120/180 ms and reduced-motion zero-duration alternative.

## Scope and validation
Create primitive and semantic variables, typography styles, bound reusable components, responsive header previews, interaction examples and usage notes. Verify screenshots and auto-layout sizing at 1024, 1440 and 2560. Preserve the original logo. Application logic and implementation remain unchanged in this phase.
