## verdict

1. Resolved — navigation-dependent cookie scroll clearance. `PhoneShell` now passes its current surface without remounting the banner, and the measurement effect depends on that surface and consent. Same-path 390/768px Light/Dark recaptures visibly retain the approved banner geometry and usable bottom navigation. The updated passing verification script covers Home → Classificação → Home → Classificação at fixed widths, checks padding against actual banner height + computed bottom +24px after each transition, and checks that the last scorer scrolls entirely above the notice. All 46 required recaptures remain valid; no regression from the bounded fix was observed. Production build completion remains the parent's separate validation responsibility.

## remaining

Clear. This ship verdict covers the scored fix.

disposition: ship
