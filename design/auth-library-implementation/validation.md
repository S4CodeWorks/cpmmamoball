# Implementation validation

The approved native Figma scenes are the visual authority. Browser and Figma renders use the original logo, exported icon geometry, self-hosted Manrope/Barlow Condensed and paired semantic colors. Actual text and security-provider rendering can change intrinsic sizes; these checks do not establish numerical pixel identity.

## Completed checks

- TypeScript compilation passed. Scoped ESLint checks passed without errors for the auth/library components, providers, router and data layer.
- Browser matrix: Login, three Registration stages, three Recovery stages, Salvos, Avisos and notice detail at 320, 390, 768, 1024, 1440 and 2560 in Light and Dark. No horizontal overflow. Images and manifest live under `.impeccable/review/auth-library-implementation/`.
- Controlled request adapters exercised successful registration/recovery, rejected credentials/code, password visibility, numeric OTP paste, remove/undo, guest saved persistence, filter restoration through browser history, signed favorite rollback on server failure, account read-one persistence, mark-all, empty/error/retry and missing-resource states. They sent no real emails, created no production accounts and published no real announcements.
- Real Supabase public reads showed the current empty notice inbox and anonymous saved state in both themes. See `live-report.json` and four `live-*` PNGs.
- Actual database authorization checks succeeded: anonymous readers see only published notices; account read history is private and writable only by its owner; drafts cannot receive member read records; members cannot publish or change their role; staff can publish/edit drafts; nick editing remains available. `supabase/verify-announcements.sql` wraps all fixtures in a rolled-back transaction.
- Original bookmark `(user_id,key)` unique constraint was verified before using idempotent upsert. Saved resources are resolved by ID across competitions, with missing resources distinguished from fetch errors.
- Impeccable detector ran once on changed UI targets and returned `[]`; see `detector.json`.

## Runtime boundary

Authentication uses the existing Supabase Auth and configured Turnstile integration. Actual inbox delivery, provider acceptance and live credential sign-in were not exercised. No deployment was performed. The local development server remains the user's preview.

The hosted announcement tables and RLS migration were applied to project `edqstqzsauqxvlolarzp` (dashboard name CFM MamoBall). No sample announcements were persisted. Security advisors reported existing function-execution/search-path and leaked-password configuration warnings outside the new tables; no new announcement-table/RLS finding was returned. Existing recommendations are recorded rather than silently changing unrelated services.

Final refreshed isolated production build passed (exit 0). Independent finish review returned `ship` after the three material fidelity fixes were resolved; see [review](review.md) and [documentation](documentation.md).
