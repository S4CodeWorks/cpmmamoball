## 2025-02-14 - [Security Enhancement] Revoke Write Grants from Anon
**Vulnerability:** The `anon` role possessed `INSERT`, `UPDATE`, and `DELETE` grants on several tables (`bookmarks`, `inscricoes`, `news`, `player_competitions`) where it was not strictly necessary.
**Learning:** Although these tables were protected by Row Level Security (RLS) with FORCE, granting broadly permissive commands bypasses the principle of least privilege. In PostgreSQL/Supabase, broad database-level grants provide an unnecessary surface area for misconfiguration.
**Prevention:** Always follow the principle of least privilege for SQL `GRANT` statements. Do not rely solely on RLS to block writes if the role shouldn't be attempting writes at all.
