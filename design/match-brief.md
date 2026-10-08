# Partida · Light · native Figma specification

Mode: Operate. Ordinary extension of approved CPM Jogos/Header world, not a new visual identity. User explicitly asked to draw /partida/{number} in Figma with careful visual detail and minimal explanatory prose. Start Light, preserving paired system readiness; application implementation and Dark authoring are outside this step.

## Direction contract

Score and club identity lead, followed by goal attribution. Keep Barlow Condensed display, Manrope UI, official CPM artwork, original reusable SVG icons, white/neutral surfaces and purposeful blue. Bounded 1280px content, 16/24/32px responsive gutters, 44px actions and 12/16px corners remain incumbent. Use native auto-layout, instances, semantic paint and dimensional bindings, editable text/visibility/swap properties. No generic introduction or decorative statistics.

Wide: existing Jogos-active header, back/match identity and save/share actions; open match scoreboard; two goal-attribution groups and contextual prior encounters/other round games. Compact: preserve complete scoreboard and club identity; icon+label Gols/Confrontos/Rodada navigation reveals one useful section without horizontal scrolling. Six references: 320,390,768,1024,1440,2560px. Compact and wide composition should reflow by structure, not scaled typography.

## Product truth

Grounding: components/screens/MatchScreen.tsx, lib/types.ts Match/GoalEntry, existing match data access, incumbent Jogos native metadata and screenshots, DESIGN.md/PRODUCT.md. Available: competition/stage/round, club name/tag/crest, numeric match ID, scheduled date/time or unknown, finalized/live/scheduled, stored scores, explicit W.O., per-goal nick/own_goal/optional assist, optional game ID from club roster, prior finalized matches and other games in same round. Existing save/reminder/share and club/match destinations remain intended controls.

No penalties, cards, possession, shot statistics, invented elapsed timer or player photos. Goal entries have no timestamp: organize by club and attribution, never an implied chronological timeline. Own goal belongs to opposing roster and credits the scoring side; show Contra explicitly, never credit an assist. Historical comparisons must use actual prior finalized matches, excluding this match, and sort by reliable date. Missing prior history is empty, not zeros masquerading as measured statistics. Live scores are a state without a promised real-time transport. Reminder intent does not prove delivery.

## Scope and evidence

Demonstrative fixtures use established Aurora FC/Atlético Paulista naming and incumbent generic crest, visibly identified as fixtures in handoff, not seeded database records. Separate state page covers scheduled, time unknown, live, draw, W.O., no scorer records, no prior history, loading, recoverable error, missing match, saved and copied-link feedback. Prototype fixtures are synthetic and perform no real data writes/share/reminders. Keyboard/focus/touch/reduced-motion behavior is specified, not browser-certified. Finish with native exports, independent review and documentation; preserve all prior pages and normative token files.
