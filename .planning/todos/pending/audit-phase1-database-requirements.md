---
title: Audit Phase 1 for Database Requirements
date: 2026-06-10
priority: high
---

## Task

Phase 1.5 (Recording Management) needs a database to persist recordings for the list view and individual playback. Phase 1 was designed around in-memory job IDs and ephemeral transcription results.

**Questions to resolve:**
- What database? (Vercel Postgres, local Hetzner Postgres, SQLite?)
- What schema? (Recordings table with filepath, transcript ID, metadata, created_at)
- Does Phase 1 need modification to write to database during transcription?
- How does database choice affect deployment in Phase 1.7?

**Deliverable:** Database decision and any Phase 1 modifications needed before Phase 1.5 begins.

**Status:** Pending
